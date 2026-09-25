"""Public Home regression. No live account, message or external service is used."""
import asyncio
import json
import os
import shutil
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE = os.getenv('BASE_URL', 'http://127.0.0.1:4173/Folkoop/')
OUT = Path(os.getenv('QA_OUTPUT', 'qa-output'))
OUT.mkdir(parents=True, exist_ok=True)

async def main():
    passed = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            executable_path=shutil.which('chromium') or shutil.which('google-chrome'),
            args=['--no-sandbox'],
        )
        context = await browser.new_context(
            service_workers='block', locale='ru-RU',
            viewport={'width':1280, 'height':960},
        )
        async def public_only(route):
            if route.request.url.endswith('/network-config.js'):
                await route.fulfill(
                    body="globalThis.FolkoopNetworkConfig={enabled:false,url:'',publishableKey:''};",
                    content_type='application/javascript',
                )
            elif route.request.url.startswith(BASE):
                await route.continue_()
            else:
                await route.abort()
        await context.route('**/*', public_only)
        page = await context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.goto(BASE+'?intro=0#/home')
        panel = page.locator('[data-home-welcome]')
        await expect(panel).to_be_visible()
        await expect(panel).to_have_count(1)
        await expect(panel.locator('.card')).to_have_count(4)
        await expect(panel).to_contain_text('С чего начать')
        await expect(panel).to_contain_text('После входа')
        await expect(panel.locator('.net-count')).to_have_count(0)
        await expect(page.locator('#workspace')).to_be_visible()
        passed.append('Public Home explains four real entry points without invented personal data')

        # The original shell handles this button. It creates no network object.
        await panel.locator('[data-create=project]').click()
        await expect(page.locator('#draftForm')).to_be_visible()
        await page.fill('#draftForm [name=title]', 'Private Home draft <safe>')
        await page.fill('#draftForm [name=body]', 'No automatic publication.')
        await page.locator('#draftForm button[type=submit]').click()
        assert await page.evaluate("localStorage.getItem('folkoop-workspace-v1')") is None
        await panel.locator('a[href="#/me"]').click()
        await expect(page.locator('.draft')).to_contain_text('Private Home draft <safe>')
        await expect(page.locator('[data-home-welcome]')).to_have_count(0)
        passed.append('Home draft action preserves local-only consent and existing Profile behavior')
        await page.locator('#brandHome').click()

        for language in ('en','sv','ru','uk'):
            await page.select_option('#language', language)
            await expect(panel).to_have_count(1)
            await expect(panel.locator('.card')).to_have_count(4)
            for width in (320,390,1280):
                await page.set_viewport_size({'width':width,'height':960})
                assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'), (language,width)
        passed.append('Language changes are idempotent; public Home fits 320, 390 and 1280 pixels')
        await page.select_option('#language','ru')
        await page.screenshot(path=str(OUT/'folkoop-home-guest-desktop.png'), full_page=True)
        await page.set_viewport_size({'width':390,'height':844})
        await page.screenshot(path=str(OUT/'folkoop-home-guest-mobile.png'), full_page=True)

        # This enhancement must not unhide a workspace that its owner has hidden.
        await page.evaluate("""() => {
            const root=document.getElementById('workspace');
            root.hidden=true;
            root.querySelector('[data-home-welcome]').remove();
        }""")
        await expect(panel).to_have_count(1)
        await expect(page.locator('#workspace')).to_be_hidden()
        passed.append('Home enhancement does not override network renderer visibility')
        assert not errors, errors
        await context.close()
        await browser.close()
    OUT.joinpath('home-welcome-results.json').write_text(json.dumps({
        'passed':passed,
        'limits':['Public guest mode only; no hosted Auth or multiple real accounts',
                  'Chromium emulation, not real mobile Safari']
    }, ensure_ascii=False, indent=2))
    print('\n'.join('PASS '+item for item in passed))

asyncio.run(main())
