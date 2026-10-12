"""P0 entry load-order regression in Chromium and WebKit.
One declared negative control restores the old shell-before-provider order.
No Auth, participant records, external requests or server writes are used.
"""
import asyncio
import os
import shutil
from pathlib import Path
from urllib.parse import urlparse
from playwright.async_api import async_playwright, expect

BASE = os.getenv('BASE_URL', 'http://127.0.0.1:4173/Folkoop/')
ENGINE = os.getenv('BROWSER_ENGINE', 'chromium').lower()
OUT = Path(os.getenv('QA_OUTPUT', 'qa-output'))
OUT.mkdir(parents=True, exist_ok=True)
SHELL = '<script defer src="./folkoop.js"></script>'
PREVIEW = '<script defer src="./first-contact-preview.js"></script>'

async def attempt(browser, old_order=False):
    context = await browser.new_context(
        viewport={'width': 390, 'height': 844},
        service_workers='block', reduced_motion='reduce')
    await context.add_init_script(
        "Object.defineProperty(navigator,'webdriver',{get:()=>false})")
    errors, external, writes = [], [], []
    async def route_request(route):
        request = route.request
        if request.method not in ('GET', 'HEAD'):
            writes.append(request.method)
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
            # Reproduce pre-fix dependency order only inside this test response.
            html = html.replace(SHELL, '').replace(PREVIEW, PREVIEW + SHELL)
            await route.fulfill(response=response, body=html)
            return
        if urlparse(request.url).path.endswith('/network-ui.js'):
            await asyncio.sleep(1.2)  # More than the unchanged 120ms first-entry timer.
        await route.continue_()
    await context.route('**/*', route_request)
    page = await context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    try:
        await page.goto(BASE + '?first-contact=three-paths', wait_until='load')
        gate = page.locator('#folkoopEntryGate')
        if old_order:
            await expect(gate).to_have_count(1)
            await expect(gate).to_be_hidden()
            assert errors and any(
                'FIRST_CONTACT_PREVIEW_NOT_LOADED' in e for e in errors), errors
        else:
            await expect(gate).to_be_visible()
            await expect(page.locator('#entryThreePaths')).to_be_visible()
            await expect(page.locator('.entry-three-card')).to_have_count(3)
            assert not errors, errors
            await page.locator('[data-entry-language="sv"]').click()
            await expect(page.locator('#entryThreePaths')).to_be_visible()
            await page.screenshot(path=str(
                OUT / ('entry-order-' + ENGINE + '.png')))
        assert not writes, writes
        assert not [u for u in external if 'supabase.co' in u], external
    finally:
        await context.close()

async def main():
    async with async_playwright() as pw:
        if ENGINE == 'webkit':
            browser = await pw.webkit.launch()
        elif ENGINE == 'chromium':
            browser = await pw.chromium.launch(
                executable_path=shutil.which('chromium') or
                shutil.which('google-chrome'), args=['--no-sandbox'])
        else:
            raise ValueError('Unsupported browser engine: '+ENGINE)
        try:
            await attempt(browser, old_order=True)
            await attempt(browser, old_order=False)
        finally:
            await browser.close()
    print('PASS: old-order failure reproduced; fixed entry survives delayed network-ui ('+ENGINE+')')

if __name__ == '__main__':
    asyncio.run(main())
