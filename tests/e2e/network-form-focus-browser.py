"""Deterministic pending-load/focus regression. Synthetic API, never live Auth.

CI uses BASE_URL; OFFLINE_SITE replays the same built files without networking.
The load is released after focus/selection is established, not after a sleep.
"""
import asyncio
import json
import os
import re
import shutil
from pathlib import Path
from urllib.parse import urlsplit
from playwright.async_api import async_playwright, expect

BASE = os.getenv('BASE_URL', 'http://127.0.0.1:4173/Folkoop/')
API = 'https://abcdefghijklmnopqrst.supabase.co'
UID = '11111111-1111-4111-8111-111111111111'
COOP = '77777777-7777-4777-8777-777777777777'
OUT = Path(os.getenv('QA_OUTPUT', 'qa-output'))
OFFLINE = os.getenv('OFFLINE_SITE')

async def scenario(browser, kind, partial):
    context = await browser.new_context(service_workers='block', locale='en-GB',
                                        viewport={'width': 390, 'height': 844})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    release, read_started = asyncio.Event(), asyncio.Event()
    state = {'hold': False, 'writes': [], 'coops': [], 'members': []}
    profile = {'id': UID, 'name': 'Synthetic test user', 'skills': '', 'about': '', 'listed': False}
    config = {'enabled': True, 'url': API, 'publishableKey': 'sb_publishable_example_for_tests_only'}

    async def api_response(url, payload):
        path = urlsplit(url).path
        if path.endswith('/verify'):
            return {'access_token': 'synthetic-only', 'expires_in': 3600}
        if path.endswith('/user'):
            return {'id': UID}
        if path.endswith('/fk_claim_pilot_invite'):
            return True
        if path.endswith('/fk_profiles'):
            return [profile]
        if path.endswith('/fk_create_cooperation'):
            state['writes'].append(payload)
            state['coops'] = [{'id': COOP, 'owner_id': UID, 'kind': payload['p_kind'],
                'title': payload['p_title'], 'description': payload['p_description'],
                'location_text': payload['p_location'], 'status': 'open',
                'target_quantity': payload['p_target_quantity'], 'unit': payload['p_unit'],
                'created_at': '2026-09-28T12:00:00Z', 'updated_at': '2026-09-28T12:00:00Z'}]
            state['members'] = [{'cooperation_id': COOP, 'user_id': UID, 'role': 'owner'}]
            return COOP
        if path.endswith('/fk_cooperations'):
            if state['hold']:
                read_started.set()
                await asyncio.wait_for(release.wait(), 10)
            return state['coops']
        if path.endswith('/fk_cooperation_members'):
            return state['members']
        return []

    async def routing(route):
        url = route.request.url
        if url.endswith('/network-config.js'):
            await route.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps(config)+';',
                                content_type='application/javascript')
        elif url.startswith(API + '/'):
            payload = route.request.post_data_json if route.request.post_data else {}
            # Empty arrays also need JSON content type for the strict client.
            await route.fulfill(json=await api_response(url, payload), content_type='application/json')
        elif not OFFLINE and url.startswith(BASE):
            await route.continue_()
        else:
            await route.abort()

    await context.route('**/*', routing)
    result = {'kind': kind, 'case': 'selection' if partial else 'empty-field', 'passed': False}
    try:
        if OFFLINE:
            root = Path(OFFLINE)
            # Only the loader changes: HTML, CSS, app scripts stay from the build.
            html = (root/'index.html').read_text()
            scripts = re.findall(r'<script[^>]*src="\./([^\"]+)"[^>]*></script>', html)
            styles = re.findall(r'<link[^>]*rel="stylesheet"[^>]*href="\./([^\"]+)"[^>]*>', html)
            html = re.sub(r'<script\b[^>]*>[\s\S]*?</script>|<link\b[^>]*>|<img\b[^>]*>', '', html)
            await page.evaluate("location.hash='#/me'")
            await page.set_content(html)
            for name in styles:
                await page.add_style_tag(content=(root/name).read_text())
            await page.expose_function('testTransport', api_response)
            await page.evaluate("""() => { globalThis.fetch=async(url,init={})=>
                new Response(JSON.stringify(await testTransport(url,init.body?JSON.parse(init.body):{})),
                {headers:{'content-type':'application/json'}}); }""")
            for name in scripts:
                if name == 'network-config.js':
                    await page.evaluate('c=>globalThis.FolkoopNetworkConfig=c', config)
                elif not (os.getenv('OMIT_FOCUS_HELPER') and name == 'network-form-focus.js'):
                    await page.add_script_tag(content=(root/name).read_text())
        else:
            await page.goto(BASE+'#/me')

        await page.fill('#netLogin [name=email]', 'synthetic@example.test')
        await page.click('#netLogin [value=code]')
        await page.fill('#netLogin [name=code]', '123456')
        await page.fill('#netLogin [name=inviteCode]', 'FOLK-TEST-INVITE-01')
        await page.check('#netLogin [name=policyAccepted]')
        await page.click('#netLogin [value=verify]')
        await expect(page.locator('#netProfile button')).to_be_enabled()
        await page.evaluate("""() => {
            window.formEvents=[];
            for(const type of ['click','submit','invalid'])document.addEventListener(type,e=>{
                if(e.target.closest?.('#netCoopCreate'))formEvents.push({type,trusted:e.isTrusted});
            },true);
        }""")
        await page.evaluate("location.hash='#/projects'" if kind == 'project' else "location.hash='#/together'")
        if kind != 'project':
            action = page.locator(f'[data-home="createCoop"][data-kind="{kind}"]').first
            await expect(action).to_be_visible()
            await action.click()
        await expect(page.locator('#netCoopCreate')).to_be_visible()
        if kind != 'project':
            await expect(page.locator('#netCoopCreate [name=kind]')).to_have_value(kind)

        # Preserve the original regression purpose: keep the form in the DOM,
        # start a background server read, then edit while that read is pending.
        state['hold'] = True
        await page.click('#networkPanel [data-net="refresh"]')
        await asyncio.wait_for(read_started.wait(), 5)
        title = page.locator('#netCoopCreate [name=title]')
        await title.click()
        if partial:
            await page.keyboard.type('abcXYZ')
            await page.keyboard.press('Home')
            for _ in range(3):
                await page.keyboard.press('ArrowRight')
            await page.keyboard.press('Shift+End')
        await expect(title).to_be_focused()
        result['before'] = await title.evaluate('(e)=>({value:e.value,start:e.selectionStart,end:e.selectionEnd})')
        release.set()
        await expect(page.locator('#netCoopCreate button')).to_be_enabled()
        result['after'] = await title.evaluate('(e)=>({focused:document.activeElement===e,value:e.value,start:e.selectionStart,end:e.selectionEnd})')
        assert result['after']['focused'], result
        assert {k: result['after'][k] for k in ('value','start','end')} == result['before'], result
        await page.keyboard.type('def' if partial else 'A useful test')
        expected_title = 'abcdef' if partial else 'A useful test'
        await expect(title).to_have_value(expected_title)
        await page.fill('#netCoopCreate [name=description]', 'Synthetic focus regression')
        if kind == 'purchase':
            await page.fill('#netCoopCreate [name=targetQuantity]', '10')
            await page.fill('#netCoopCreate [name=unit]', 'items')
        # Native validation must still prevent a write with an empty title.
        await title.fill('')
        await page.click('#netCoopCreate button')
        assert not state['writes']
        assert await page.evaluate("formEvents.some(e=>e.type==='invalid')")
        await title.fill(expected_title)
        await page.click('#netCoopCreate button')
        # Creation triggers a server read-back and a final render. Wait for
        # that confirmed state before opening the v0.38 progressive-disclosure
        # owner controls; otherwise an intermediate render can be replaced by
        # the final closed <details>.
        await expect(page.locator('#netStatus')).to_contain_text('Saved on server.')
        manage = page.locator('[data-coop-section="manage"]')
        await expect(manage).to_be_visible()
        await manage.locator('summary').click()
        await expect(page.locator('#netCoopEdit')).to_be_visible()
        assert len(state['writes']) == 1, state['writes']
        assert state['writes'][0]['p_title'] == expected_title
        assert state['writes'][0]['p_kind'] == kind
        events = await page.evaluate('formEvents')
        assert any(e['type']=='submit' and e['trusted'] for e in events), events
        assert not errors, errors
        result.update(passed=True, writes=1, native_click=True, native_validation=True)
    except Exception as error:
        result.update(error=str(error), page_errors=errors, writes=state['writes'])
        if not page.is_closed():
            status = page.locator('#netStatus')
            form = page.locator('#netCoopCreate')
            result['status'] = await status.text_content() if await status.count() else None
            result['fields'] = await form.evaluate_all(
                '(forms)=>forms.flatMap(f=>[...f.elements].filter(e=>e.name).map(e=>({name:e.name,value:e.value,valid:e.validity.valid})))') if await form.count() else []
    finally:
        release.set()
        await context.close()
    return result

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),
                                           args=['--no-sandbox'])
        results = []
        for kind in ('need', 'offer', 'resource', 'purchase', 'project'):
            for partial in (False, True):
                result = await scenario(browser, kind, partial)
                results.append(result)
                print(('PASS ' if result['passed'] else 'FAIL ') + kind + ' ' + result['case'], flush=True)
        await browser.close()
    OUT.joinpath('network-form-focus-results.json').write_text(json.dumps({
        'cases': results, 'passed': sum(r['passed'] for r in results), 'total': len(results),
        'mode': 'offline build replay' if OFFLINE else 'served build',
        'limits': ['Synthetic API; not live Auth or RLS', 'Chromium']}, ensure_ascii=False, indent=2))
    assert all(r['passed'] for r in results), results

if __name__ == '__main__':
    asyncio.run(main())
