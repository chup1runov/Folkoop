'use strict';

const { execFile } = require('node:child_process');

function cleanNumber(value) {
  const number = Number(String(value).trim());
  return Number.isFinite(number) ? number : null;
}

function sanitizeWindow(item, index = 0) {
  if (!item || typeof item !== 'object') return null;
  const x = cleanNumber(item.x);
  const y = cleanNumber(item.y);
  const width = cleanNumber(item.width);
  const height = cleanNumber(item.height);
  if ([x, y, width, height].some(value => value === null) || width < 80 || height < 45) return null;
  return {
    id: String(item.id || `${item.owner || 'window'}#${index}`),
    owner: String(item.owner || ''),
    x, y, width, height
  };
}

function parseMacOSWindows(output) {
  return String(output || '')
    .split(/\r?\n/)
    .map((line, index) => {
      if (!line.trim()) return null;
      const [id, owner, x, y, width, height] = line.split('\t');
      return sanitizeWindow({ id, owner, x, y, width, height }, index);
    })
    .filter(Boolean);
}

function parseWindowsWindows(output) {
  const text = String(output || '').trim();
  if (!text) return [];
  let parsed;
  try { parsed = JSON.parse(text); } catch { return []; }
  const list = Array.isArray(parsed) ? parsed : [parsed];
  return list.map((item, index) => sanitizeWindow(item, index)).filter(Boolean);
}

function parseLinuxWmctrl(output) {
  return String(output || '')
    .split(/\r?\n/)
    .map((line, index) => {
      const match = line.match(/^([^\s]+)\s+\S+\s+(\d+)\s+(-?\d+)\s+(-?\d+)\s+(\d+)\s+(\d+)\s+\S+\s*(.*)$/);
      if (!match) return null;
      const [, id, pid, x, y, width, height] = match;
      return sanitizeWindow({ id, owner: pid, x, y, width, height }, index);
    })
    .filter(Boolean);
}

function execFilePromise(command, args, options = {}, executor = execFile) {
  return new Promise((resolve, reject) => {
    executor(command, args, { timeout: 1800, windowsHide: true, ...options }, (error, stdout, stderr) => {
      if (error) {
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

const MAC_SCRIPT = `
tell application "System Events"
  set output to ""
  repeat with p in (application processes whose visible is true)
    set appName to name of p
    set i to 0
    repeat with w in windows of p
      set i to i + 1
      try
        set pos to position of w
        set sz to size of w
        set output to output & appName & "#" & i & tab & appName & tab & (item 1 of pos) & tab & (item 2 of pos) & tab & (item 1 of sz) & tab & (item 2 of sz) & linefeed
      end try
    end repeat
  end repeat
  return output
end tell`;

const WINDOWS_SCRIPT = `$ErrorActionPreference='Stop';
Add-Type @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class MuraWin {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc cb, IntPtr lp);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern int GetWindowTextLength(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT r);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
}
'@;
$items = New-Object System.Collections.Generic.List[object];
[MuraWin]::EnumWindows({ param($h,$l)
  if (-not [MuraWin]::IsWindowVisible($h)) { return $true }
  $len=[MuraWin]::GetWindowTextLength($h); if ($len -le 0) { return $true }
  $r=New-Object MuraWin+RECT; if (-not [MuraWin]::GetWindowRect($h,[ref]$r)) { return $true }
  $w=$r.Right-$r.Left; $hh=$r.Bottom-$r.Top; if ($w -lt 80 -or $hh -lt 45) { return $true }
  $pid=0; [MuraWin]::GetWindowThreadProcessId($h,[ref]$pid) | Out-Null;
  $items.Add([pscustomobject]@{id=$h.ToInt64().ToString(); owner=$pid.ToString(); x=$r.Left; y=$r.Top; width=$w; height=$hh}); return $true
}, [IntPtr]::Zero) | Out-Null;
$items | ConvertTo-Json -Compress`;

class WindowSurfaceService {
  constructor(options = {}) {
    this.platform = options.platform || process.platform;
    this.executor = options.executor || execFile;
    this.ownNames = new Set((options.ownNames || ['Mura Companion', 'Ksyusha']).map(value => String(value).toLowerCase()));
    this.ownPids = new Set((options.ownPids || [process.pid]).map(value => String(value)));
    this.lastStatus = { enabled: false, supported: ['darwin', 'win32', 'linux'].includes(this.platform), permissionRequired: false, error: null };
  }

  async sample(enabled = true) {
    if (!enabled) {
      this.lastStatus = { ...this.lastStatus, enabled: false, permissionRequired: false, error: null };
      return { ...this.lastStatus, surfaces: [] };
    }

    try {
      let output = '';
      let surfaces = [];
      if (this.platform === 'darwin') {
        output = await execFilePromise('osascript', ['-e', MAC_SCRIPT], {}, this.executor);
        surfaces = parseMacOSWindows(output);
      } else if (this.platform === 'win32') {
        output = await execFilePromise('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', WINDOWS_SCRIPT], {}, this.executor);
        surfaces = parseWindowsWindows(output);
      } else if (this.platform === 'linux') {
        output = await execFilePromise('wmctrl', ['-lpG'], {}, this.executor);
        surfaces = parseLinuxWmctrl(output);
      } else {
        this.lastStatus = { enabled: true, supported: false, permissionRequired: false, error: 'unsupported-platform' };
        return { ...this.lastStatus, surfaces: [] };
      }

      const filtered = surfaces.filter(item => {
        const owner = String(item.owner || '');
        return !this.ownNames.has(owner.toLowerCase()) && !this.ownPids.has(owner);
      });
      this.lastStatus = { enabled: true, supported: true, permissionRequired: false, error: null };
      return { ...this.lastStatus, surfaces: filtered };
    } catch (error) {
      const message = `${error?.message || ''} ${error?.stderr || ''}`.toLowerCase();
      const permissionRequired = this.platform === 'darwin' && /not authorized|assistive|accessibility|(-1743)/.test(message);
      const commandMissing = /enoent|not recognized|command not found/.test(message);
      this.lastStatus = {
        enabled: true,
        supported: !commandMissing,
        permissionRequired,
        error: permissionRequired ? 'permission-required' : commandMissing ? 'adapter-unavailable' : 'surface-query-failed'
      };
      return { ...this.lastStatus, surfaces: [] };
    }
  }
}

module.exports = {
  sanitizeWindow,
  parseMacOSWindows,
  parseWindowsWindows,
  parseLinuxWmctrl,
  execFilePromise,
  MAC_SCRIPT,
  WINDOWS_SCRIPT,
  WindowSurfaceService
};
