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
        actions = page.locator('.first-actions .first-action')
        await expect(actions).to_have_count(3)
        await expect(page.locator('.first-actions')).to_contain_text('FOLKOOP')
        assert await page.locator('.first-action[data-intent=need] svg').count()==1
        assert await page.locator('.first-action[data-intent=offer] svg').count()==1
        assert await page.locator('.first-action[data-intent=project] svg').count()==1
        backgrounds = await actions.evaluate_all("els => els.map(el => getComputedStyle(el).backgroundColor)")
        assert len(set(backgrounds))==3, backgrounds
        await expect(page.locator('#workspace')).to_be_visible()
        passed.append('Public Home leads with three visually distinct, text-and-icon coded cooperation intents')

        # Project intent creates only the existing local draft until the participant explicitly enters the network.
        await page.locator('.first-action[data-intent=project]').click()
        await expect(page.locator('#draftForm')).to_be_visible()
        await page.fill('#draftForm [name=title]', 'Private Home draft <safe>')
        await page.fill('#draftForm [name=body]', 'No automatic publication.')
        await page.locator('#draftForm button[type=submit]').click()
        assert await page.evaluate("localStorage.getItem('folkoop-workspace-v1')") is None
        await page.evaluate("location.hash='#/me'")
        await expect(page.locator('.draft')).to_contain_text('Private Home draft <safe>')
        passed.append('Home project intent preserves local-only consent and existing Profile behavior')
        await page.evaluate("location.hash='#/home'")

        for language in ('sv','en','ar','so','fa','fi','bs','ku','es','ru','uk'):
            await page.select_option('#language', language)
            await expect(page.locator('.first-actions .first-action')).to_have_count(3)
            for width in (320,390,1280):
                await page.set_viewport_size({'width':width,'height':960})
                assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'), (language,width)
        passed.append('Language changes are idempotent; public Home fits 320, 390 and 1280 pixels')
        await page.select_option('#language','ru')
        await page.screenshot(path=str(OUT/'folkoop-home-guest-desktop.png'), full_page=True)
        await page.set_viewport_size({'width':390,'height':844})
        await page.locator('#mobilePrimaryNav [data-mobile-nav="together"]').click()
        dock=page.locator('#mobileContextDock')
        await expect(dock).to_be_visible()
        await expect(dock).to_have_attribute('data-parent-section','together')
        primary_box=await page.locator('#mobilePrimaryNav').bounding_box()
        dock_box=await dock.bounding_box()
        assert primary_box and dock_box and abs(dock_box['y']+dock_box['height']-primary_box['y'])<2,(dock_box,primary_box)
        passed.append('Mobile contextual actions are visibly attached to their selected primary section')
        await page.locator('#mobilePrimaryNav [data-mobile-nav="home"]').click()
        await page.screenshot(path=str(OUT/'folkoop-home-guest-mobile.png'), full_page=True)

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
