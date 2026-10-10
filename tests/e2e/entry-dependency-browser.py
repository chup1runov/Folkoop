"""Entry readiness regression on the real build, with one declared old-order control.
Only static script delivery is delayed. No production accounts, writes or gate overrides.
"""
import asyncio
import json
import os
import shutil
from pathlib import Path
from urllib.parse import urlparse
from playwright.async_api import async_playwright, expect

BASE = os.getenv('BASE_URL', 'http://127.0.0.1:4173/Folkoop/')
ENGINE = os.getenv('BROWSER_ENGINE', 'chromium').lower()
OUT = Path(os.getenv('QA_OUTPUT', 'qa-output')) / 'entry-dependency'
OUT.mkdir(parents=True, exist_ok=True)
SHELL = '<script defer src="./folkoop.js"></script>'
PREVIEW = '<script defer src="./first-contact-preview.js"></script>'
CASES = [
    ('old-order-control', 'three-paths', 'network-ui.js', True),
    ('late-network', 'three-paths', 'network-ui.js', False),
    ('late-story', 'three-paths', 'network-mura-life.js', False),
    ('late-preview', 'three-paths', 'first-contact-preview.js', False),
    ('ordinary-welcome', 'default', 'network-ui.js', False),
    ('intro-suppressed', 'suppressed', 'network-ui.js', False),
    ('fresh-repeat-1', 'three-paths', None, False),
    ('fresh-repeat-2', 'three-paths', None, False),
]

async def run_case(browser, name, mode, delayed, old_order):
    context = await browser.new_context(
        viewport={'width': 390, 'height': 844}, service_workers='block',
        reduced_motion='reduce')
    # Exercise normal first-visit behavior, not the app's automation suppression.
    # This does not supply session flags, force the gate visible or invoke app actions.
    await context.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});")
    errors, external, writes = [], [], []
    async def guard(route):
        request = route.request
        if request.method not in ('GET', 'HEAD'):
            writes.append(request.method + ' ' + request.url)
            await route.abort()
            return
        if not request.url.startswith(BASE):
            external.append(request.url)
            await route.abort()
            return
        if old_order and request.resource_type == 'document':
            response = await route.fetch()
            html = await response.text()
            assert html.count(SHELL) == 1 and html.count(PREVIEW) == 1
            # Negative control only: restore the exact old placement before network-ui.
            html = html.replace(SHELL, '').replace(PREVIEW, PREVIEW + SHELL)
            await route.fulfill(response=response, body=html)
            return
        if delayed and urlparse(request.url).path.endswith('/' + delayed):
            await asyncio.sleep(1.2)  # Longer than the existing 120 ms entry timer.
        await route.continue_()
    await context.route('**/*', guard)
    page = await context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    query = '?intro=0' if mode == 'suppressed' else '?first-contact=three-paths' if mode == 'three-paths' else ''
    result = {'case': name, 'engine': ENGINE, 'mode': mode, 'delayed_script': delayed,
              'old_order_control': old_order, 'result': 'FAIL'}
    try:
        await page.goto(BASE + query, wait_until='load')
        if old_order:
            await expect(page.locator('#folkoopEntryGate')).to_have_count(1)
            await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
            assert errors and all('FIRST_CONTACT_PREVIEW_NOT_LOADED' in error for error in errors), errors
            result['result'] = 'EXPECTED_OLD_ORDER_FAILURE'
        elif mode == 'suppressed':
            await page.wait_for_timeout(250)
            await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
            await expect(page.locator('#onboarding')).to_be_hidden()
            assert not errors, errors
            result['result'] = 'PASS'
        else:
            await expect(page.locator('#folkoopEntryGate')).to_be_visible()
            await page.locator('[data-entry-language="ru"]').click()
            if mode == 'three-paths':
                await expect(page.locator('#entryThreePaths')).to_be_visible()
                await expect(page.locator('.entry-three-card')).to_have_count(3)
            else:
                await expect(page.locator('#entryThreePaths')).to_be_hidden()
            await page.screenshot(path=str(OUT / (name + '-' + ENGINE + '.png')))
            await page.locator('[data-entry="guest"]').click()
            await expect(page.locator('#onboarding')).to_be_visible()
            await page.locator('[data-onboarding="skip"]').click()
            await page.locator('#mobilePrimaryNav [data-mobile-nav="home"]').click()
            await expect(page.locator('.mura-life[data-presentation-ready]')).to_be_visible()
            await expect(page.locator('#netLogin')).to_be_hidden()
            await page.reload(wait_until='load')
            await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
            await expect(page.locator('#onboarding')).to_be_hidden()
            await expect(page.locator('.mura-home')).to_be_visible()
            assert not errors, errors
            assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
            result['result'] = 'PASS'
        assert not writes, writes
        assert not [url for url in external if 'supabase.co' in url], external
    except Exception as error:
        result['assertion'] = str(error)
        raise
    finally:
        result['errors'] = errors
        result['write_count'] = len(writes)
        try:
            result['state'] = await page.evaluate("""() => ({
                ready: document.readyState,
                gateHidden: document.querySelector('#folkoopEntryGate')?.hidden ?? null,
                homeModesLoaded: !!globalThis.FolkoopHomeModesCopy,
                previewLoaded: !!globalThis.FolkoopFirstContactPreview
            })""")
        except Exception as error:
            result['state_capture_error'] = str(error)
        (OUT / (name + '-' + ENGINE + '.json')).write_text(
            json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
        await context.close()
    return result

async def main():
    async with async_playwright() as pw:
        if ENGINE == 'webkit':
            browser = await pw.webkit.launch()
        elif ENGINE == 'chromium':
            browser = await pw.chromium.launch(
                executable_path=shutil.which('chromium') or shutil.which('google-chrome'),
                args=['--no-sandbox'])
        else:
            raise ValueError('Unsupported engine: ' + ENGINE)
        results = []
        try:
            for case in CASES:
                results.append(await run_case(browser, *case))
        finally:
            await browser.close()
        report = {'scope': 'actual built candidate plus declared old-order negative control',
                  'physical_iphone_test': False, 'cases': results}
        (OUT / ('report-' + ENGINE + '.json')).write_text(
            json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        print('ENTRY DEPENDENCY:', ENGINE, '7 actual-build cases passed; old-order failure reproduced')

if __name__ == '__main__':
    asyncio.run(main())
