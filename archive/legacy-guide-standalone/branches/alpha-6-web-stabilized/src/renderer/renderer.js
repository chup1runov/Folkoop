'use strict';

const character = document.getElementById('character');
const bubble = document.getElementById('bubble');
const dropHint = document.getElementById('dropHint');
let pack = null;
let bubbleTimer = null;
let lastRig = null;

function assetUrl(asset) {
  return new URL(`../../assets/character/${asset}`, window.location.href).href;
}

function showBubble(text, ms = 2600) {
  clearTimeout(bubbleTimer);
  if (!text) { bubble.hidden = true; return; }
  bubble.textContent = text;
  bubble.hidden = false;
  bubbleTimer = setTimeout(() => { bubble.hidden = true; }, ms);
}

function applyRig(rig = {}) {
  lastRig = rig;
  const x = Number(rig.bodyX || 0) + Number(rig.headX || 0) * 0.2;
  const y = Number(rig.bodyY || 0) + Number(rig.headY || 0) * 0.15;
  const rot = Number(rig.bodyRotate || 0) + Number(rig.headRotate || 0) * 0.25;
  const blinkScale = rig.blink ? 0.985 : 1;
  character.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scaleY(${blinkScale})`;
}

function performAction(payload = {}) {
  character.classList.add('active');
  const action = payload.action || 'idle';
  const spec = pack?.actions?.[action];
  if (spec?.asset) character.src = assetUrl(spec.asset);
  if (payload.message) showBubble(payload.message);
  const duration = Math.max(500, Number(spec?.durationMs || 1600));
  setTimeout(() => {
    character.classList.remove('active');
    character.src = assetUrl(pack.actions.idle.asset);
    if (lastRig) applyRig(lastRig);
  }, duration);
}

async function boot() {
  pack = await window.mura.getPack();
  character.src = assetUrl(pack.actions.idle.asset);
  character.alt = pack.displayName || 'Companion';
  window.mura.onAttention(({ rig }) => applyRig(rig));
  window.mura.onAction(performAction);
}

window.addEventListener('dragover', event => {
  event.preventDefault();
  dropHint.hidden = false;
});
window.addEventListener('dragleave', event => {
  if (event.relatedTarget == null) dropHint.hidden = true;
});
window.addEventListener('drop', async event => {
  event.preventDefault();
  dropHint.hidden = true;
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  const result = await window.mura.rememberFileFromDrop(file);
  showBubble(result.ok ? `Запомнила: ${result.item.name}` : result.error || 'Не получилось.');
});

character.addEventListener('dblclick', async () => {
  await window.mura.toggleInteraction();
});

boot().catch(error => showBubble(error.message || String(error), 5000));
