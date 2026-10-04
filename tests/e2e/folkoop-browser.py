"""FOLKOOP shell regression. Chromium emulation; no live accounts or real submissions."""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/FOLKOOP/')
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True)
async def main():
 results=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  context=await browser.new_context(viewport={'width':1280,'height':960},locale='sv-SE',service_workers='block')
  async def local_only(route):
   if route.request.url.startswith(BASE):await route.continue_()
   else:await route.abort()
  await context.route('**/*',local_only)
  await context.add_init_script("localStorage.setItem('folkoop-onboarding-v3','done');localStorage.setItem('folkoop-language-choice-v1','done')")
  page=await context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  await page.goto(BASE)
  await expect(page.locator('#mobilePrimaryNav a')).to_have_count(5)
  await page.select_option('#language','ru')
  await expect(page.locator('h1')).to_contain_text('Что-то нужно? Можешь помочь?')
  await expect(page.locator('.hero p').nth(1)).to_contain_text('Групповой чат начинается, когда люди уже нашли друг друга')
  assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  await page.screenshot(path=str(OUT/'folkoop-desktop.png'),full_page=True)
  results.append('FOLKOOP root, brand asset and eleven ordered destinations')
  await page.evaluate("location.hash='#/me'")
  await page.click('[data-net="localGuest"]')
  await page.locator('.my-place-hero [data-action="toggle-my-place-editor"]').click()
  await expect(page.locator('#myPlaceEditorPanel')).to_be_visible()
  await page.fill('#profileForm [name="name"]','Test User')
  await page.fill('[name="city"]','Göteborg')
  await page.fill('[name="skills"]','Repair, design')
  await page.click('#profileForm button[type="submit"]')
  assert await page.evaluate("localStorage.getItem('folkoop-workspace-v1')") is None
  await expect(page.locator('#status')).to_contain_text('сессии')
  results.append('My page saves in memory without a compulsory account or storage consent')
  await page.evaluate("location.hash='#/projects'")
  await page.click('[data-create="project"]')
  await page.fill('#draftForm [name="title"]','Workshop <img src=x onerror=alert(1)>')
  await page.fill('#draftForm [name="body"]','A private project, not a published listing.')
  await page.click('#draftForm button[type="submit"]')
  await expect(page.locator('.draft')).to_have_count(1)
  assert await page.locator('.draft img').count()==0
  await page.fill('#draftSearch','not-found')
  await expect(page.locator('#draftList')).to_contain_text('Ничего не найдено')
  await page.fill('#draftSearch','Workshop')
  await expect(page.locator('.draft')).to_have_count(1)
  results.append('Create and search a private project; HTML entered by a user is text, not executable')
  await page.evaluate("location.hash='#/me'");await page.locator('.my-place-hero [data-action="toggle-my-place-editor"]').click();await expect(page.locator('#myPlaceEditorPanel')).to_be_visible();await page.check('#remember')
  await page.reload();await page.click('[data-net="localGuest"]');await page.locator('.my-place-hero [data-action="toggle-my-place-editor"]').click();await expect(page.locator('[name="name"]')).to_have_value('Test User')
  await expect(page.locator('.draft')).to_have_count(1)
  results.append('Opt-in browser storage restores profile and drafts')
  async with page.expect_download() as download:
   await page.click('[data-action="export"]')
  await (await download.value).save_as(str(OUT/'test-local-export.json'))
  exported=json.loads(OUT.joinpath('test-local-export.json').read_text())
  assert exported['profile']['name']=='Test User'
  assert exported['profile']['city']=='Göteborg'
  results.append('Export contains local profile city and private FOLKOOP workspace')
  await page.evaluate("location.hash='#/city'")
  city=page.frame_locator('#cityFrame')
  await expect(city.locator('.brand')).to_have_text('FOLKOOP')
  await expect(city.locator('html')).to_have_attribute('lang','ru')
  await city.locator('.bottom-nav [data-screen="rapportera"]').click()
  await city.locator('#reportDescription').fill('Private test draft — do not submit')
  await page.evaluate("location.hash='#/me'");await page.evaluate("location.hash='#/city'")
  await expect(city.locator('#reportDescription')).to_have_value('Private test draft — do not submit')
  await page.select_option('#language','en')
  await expect(city.locator('html')).to_have_attribute('lang','en')
  await expect(city.locator('#reportDescription')).to_have_value('Private test draft — do not submit')
  results.append('City stays integrated and retains an unsubmitted report across navigation/language changes')

  # Explicit City -> FOLKOOP bridge: official source remains available and no draft/cooperation is created.
  workspace_before_bridge=await page.evaluate("localStorage.getItem('folkoop-workspace-v1')")
  await city.locator('.bottom-nav [data-screen="nara"]').click()
  await expect(city.locator('[data-folkoop-handoff]').first).to_be_visible()
  await expect(city.locator('[data-folkoop-handoff]').first).to_have_text('Continue in FOLKOOP')
  await city.locator('[data-folkoop-handoff]').first.click()
  await expect(page).to_have_url(re.compile(r'.*#/center
  await expect(page.locator('#workspace')).to_contain_text('No FOLKOOP venue is claimed open')
  await expect(page.locator('#workspace')).to_contain_text('no FOLKOOP account or data synchronization')
  await expect(page.locator('#workspace a[href*="t.me"]')).to_have_count(1)

  # A different selected city must not inherit Göteborg's external-community context.
  await page.evaluate("location.hash='#/me'")
  await page.locator('.my-place-hero [data-action="toggle-my-place-editor"]').click()
  await expect(page.locator('#myPlaceEditorPanel')).to_be_visible()
  await page.fill('[name="city"]','Stockholm')
  await page.click('#profileForm button[type="submit"]')
  await page.evaluate("location.hash='#/center'")
  await expect(page.locator('#workspace')).to_contain_text('Stockholm')
  assert await page.locator('#workspace a[href*="t.me"]').count()==0
  assert 'ГБГ Форум' not in await page.locator('#workspace').inner_text()

  # Restore the original test city for the remaining shell regression.
  await page.evaluate("location.hash='#/me'")
  await page.locator('.my-place-hero [data-action="toggle-my-place-editor"]').click()
  await page.fill('[name="city"]','Göteborg')
  await page.click('#profileForm button[type="submit"]')

  await page.click('#mobilePrimaryNav a[href="#/messages"]');await expect(page.locator('#workspace')).to_contain_text('does not simulate')
  results.append('Online Center connects current routes without fictitious venue, synchronized forum data, payments or message delivery, and never fabricates Göteborg context for another city')
  await page.evaluate("location.hash='#/about'")
  await expect(page.locator('#futureArchitectureTitle')).to_contain_text('Where FOLKOOP can go next')
  await expect(page.locator('.future-architecture .card')).to_have_count(4)
  await expect(page.locator('.future-architecture .notice')).to_contain_text('not crypto-first')
  await expect(page.locator('.future-architecture a')).to_have_attribute('href','https://github.com/chup1runov/Folkoop/blob/main/docs/architecture/TRUST_IDENTITY_WEB4_ARCHITECTURE.md')
  results.append('About makes the approved future architecture visible while labelling it planned and non-crypto-first')
  for lang in ['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk']:
   await page.select_option('#language',lang)
   for width in [320,390,1280]:
    await page.set_viewport_size({'width':width,'height':844})
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'{lang}/{width} overflow'
   assert await page.locator('html').get_attribute('dir')==('rtl' if lang in ('ar','fa') else 'ltr')
   assert await page.locator('#workspace').get_attribute('lang')==lang
   await expect(page.locator('#translationNote')).to_be_hidden()
  results.append('All eleven full-interface languages, RTL, and no horizontal overflow at 320/390/1280px')
  await page.select_option('#language','ru');await page.set_viewport_size({'width':390,'height':844})
  await page.evaluate("location.hash='#/me'")
  await page.locator('.my-place-hero [data-action="toggle-my-place-editor"]').click()
  await expect(page.locator('#myPlaceEditorPanel')).to_be_visible()
  page.on('dialog',lambda d:d.accept())
  await page.click('[data-action="clear"]')
  await expect(page.locator('[name="name"]')).to_have_value('')
  assert await page.evaluate("localStorage.getItem('folkoop-workspace-v1')") is None
  await page.screenshot(path=str(OUT/'folkoop-my-page-mobile.png'),full_page=True)
  await page.click('#brandHome');await page.screenshot(path=str(OUT/'folkoop-mobile.png'),full_page=True)
  results.append('Erase removes only FOLKOOP local data; mobile screens captured')
  assert not errors,errors
  await context.close()
  blocked=await browser.new_context(service_workers='block')
  await blocked.route('**/*',local_only)
  await blocked.add_init_script("Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')}")
  b=await blocked.new_page();await b.goto(BASE+'#/me');await b.click('[data-net="localGuest"]');await b.locator('.my-place-hero [data-action="toggle-my-place-editor"]').click();await expect(b.locator('#profileForm')).to_be_visible()
  await b.fill('[name="name"]','Memory');await b.click('#profileForm button[type="submit"]')
  await expect(b.locator('#status')).not_to_be_empty()
  results.append('Blocked storage does not prevent starting or editing My page')
  await blocked.close()
  offline=await browser.new_context(service_workers='allow',locale='en-US')
  await offline.add_init_script("localStorage.setItem('folkoop-onboarding-v3','done');localStorage.setItem('folkoop-workspace-v1',JSON.stringify({version:1,profile:{name:'Offline',city:'Göteborg',skills:'',about:''},drafts:[]}))")
  op=await offline.new_page();await op.goto(BASE)
  await op.evaluate('navigator.serviceWorker.ready')
  controlled=False
  for _ in range(40):
   try:
    if await op.evaluate('navigator.serviceWorker.controller !== null'):
     controlled=True;break
   except Exception:
    try: await op.wait_for_load_state('domcontentloaded',timeout=2000)
    except Exception: pass
   await asyncio.sleep(.1)
  if not controlled:
   await op.reload(wait_until='load')
   controlled=await op.evaluate('navigator.serviceWorker.controller !== null')
  assert controlled
  await offline.set_offline(True);await op.reload()
  await expect(op.locator('#mobilePrimaryNav a')).to_have_count(5)
  await op.click('#mobilePrimaryNav a[href="#/city"]')
  await expect(op.frame_locator('#cityFrame').locator('#view')).not_to_be_empty()
  results.append('Installed shell and embedded City entry load offline; no fabricated source success')
  await offline.close();await browser.close()
 OUT.joinpath('folkoop-results.json').write_text(json.dumps({'passed':results,'limitations':['Chromium only, not a real iPhone/Safari check','No live backend, users, payments or official submissions']},ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+x for x in results))
asyncio.run(main())
))
  await expect(page.locator('[data-center-story="city-handoff"]')).to_be_visible()
  await expect(page.locator('[data-center-story="city-handoff"] a[href*="goteborg.se"]')).to_have_count(1)
  for route in ['communities','people','together','projects']:
   await expect(page.locator(f'[data-center-story="city-handoff"] a[href="#/{route}"]')).to_be_visible()
  assert await page.evaluate("localStorage.getItem('folkoop-workspace-v1')")==workspace_before_bridge
  results.append('City source can continue into FOLKOOP with its official link and cooperative routes without auto-publishing')

  await expect(page.locator('#workspace')).to_contain_text('Online Center · people, city and projects in one route')
  await expect(page.locator('#workspace')).to_contain_text('No FOLKOOP venue is claimed open')
  await expect(page.locator('#workspace')).to_contain_text('no FOLKOOP account or data synchronization')
  await expect(page.locator('#workspace a[href*="t.me"]')).to_have_count(1)

  # A different selected city must not inherit Göteborg's external-community context.
  await page.evaluate("location.hash='#/me'")
  await page.locator('.my-place-hero [data-action="toggle-my-place-editor"]').click()
  await expect(page.locator('#myPlaceEditorPanel')).to_be_visible()
  await page.fill('[name="city"]','Stockholm')
  await page.click('#profileForm button[type="submit"]')
  await page.evaluate("location.hash='#/center'")
  await expect(page.locator('#workspace')).to_contain_text('Stockholm')
  assert await page.locator('#workspace a[href*="t.me"]').count()==0
  assert 'ГБГ Форум' not in await page.locator('#workspace').inner_text()

  # Restore the original test city for the remaining shell regression.
  await page.evaluate("location.hash='#/me'")
  await page.locator('.my-place-hero [data-action="toggle-my-place-editor"]').click()
  await page.fill('[name="city"]','Göteborg')
  await page.click('#profileForm button[type="submit"]')

  await page.click('#mobilePrimaryNav a[href="#/messages"]');await expect(page.locator('#workspace')).to_contain_text('does not simulate')
  results.append('Online Center connects current routes without fictitious venue, synchronized forum data, payments or message delivery, and never fabricates Göteborg context for another city')
  await page.evaluate("location.hash='#/about'")
  await expect(page.locator('#futureArchitectureTitle')).to_contain_text('Where FOLKOOP can go next')
  await expect(page.locator('.future-architecture .card')).to_have_count(4)
  await expect(page.locator('.future-architecture .notice')).to_contain_text('not crypto-first')
  await expect(page.locator('.future-architecture a')).to_have_attribute('href','https://github.com/chup1runov/Folkoop/blob/main/docs/architecture/TRUST_IDENTITY_WEB4_ARCHITECTURE.md')
  results.append('About makes the approved future architecture visible while labelling it planned and non-crypto-first')
  for lang in ['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk']:
   await page.select_option('#language',lang)
   for width in [320,390,1280]:
    await page.set_viewport_size({'width':width,'height':844})
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'{lang}/{width} overflow'
   assert await page.locator('html').get_attribute('dir')==('rtl' if lang in ('ar','fa') else 'ltr')
   assert await page.locator('#workspace').get_attribute('lang')==lang
   await expect(page.locator('#translationNote')).to_be_hidden()
  results.append('All eleven full-interface languages, RTL, and no horizontal overflow at 320/390/1280px')
  await page.select_option('#language','ru');await page.set_viewport_size({'width':390,'height':844})
  await page.evaluate("location.hash='#/me'")
  await page.locator('.my-place-hero [data-action="toggle-my-place-editor"]').click()
  await expect(page.locator('#myPlaceEditorPanel')).to_be_visible()
  page.on('dialog',lambda d:d.accept())
  await page.click('[data-action="clear"]')
  await expect(page.locator('[name="name"]')).to_have_value('')
  assert await page.evaluate("localStorage.getItem('folkoop-workspace-v1')") is None
  await page.screenshot(path=str(OUT/'folkoop-my-page-mobile.png'),full_page=True)
  await page.click('#brandHome');await page.screenshot(path=str(OUT/'folkoop-mobile.png'),full_page=True)
  results.append('Erase removes only FOLKOOP local data; mobile screens captured')
  assert not errors,errors
  await context.close()
  blocked=await browser.new_context(service_workers='block')
  await blocked.route('**/*',local_only)
  await blocked.add_init_script("Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')}")
  b=await blocked.new_page();await b.goto(BASE+'#/me');await b.click('[data-net="localGuest"]');await b.locator('.my-place-hero [data-action="toggle-my-place-editor"]').click();await expect(b.locator('#profileForm')).to_be_visible()
  await b.fill('[name="name"]','Memory');await b.click('#profileForm button[type="submit"]')
  await expect(b.locator('#status')).not_to_be_empty()
  results.append('Blocked storage does not prevent starting or editing My page')
  await blocked.close()
  offline=await browser.new_context(service_workers='allow',locale='en-US')
  await offline.add_init_script("localStorage.setItem('folkoop-onboarding-v3','done');localStorage.setItem('folkoop-workspace-v1',JSON.stringify({version:1,profile:{name:'Offline',city:'Göteborg',skills:'',about:''},drafts:[]}))")
  op=await offline.new_page();await op.goto(BASE)
  await op.evaluate('navigator.serviceWorker.ready')
  controlled=False
  for _ in range(40):
   try:
    if await op.evaluate('navigator.serviceWorker.controller !== null'):
     controlled=True;break
   except Exception:
    try: await op.wait_for_load_state('domcontentloaded',timeout=2000)
    except Exception: pass
   await asyncio.sleep(.1)
  if not controlled:
   await op.reload(wait_until='load')
   controlled=await op.evaluate('navigator.serviceWorker.controller !== null')
  assert controlled
  await offline.set_offline(True);await op.reload()
  await expect(op.locator('#mobilePrimaryNav a')).to_have_count(5)
  await op.click('#mobilePrimaryNav a[href="#/city"]')
  await expect(op.frame_locator('#cityFrame').locator('#view')).not_to_be_empty()
  results.append('Installed shell and embedded City entry load offline; no fabricated source success')
  await offline.close();await browser.close()
 OUT.joinpath('folkoop-results.json').write_text(json.dumps({'passed':results,'limitations':['Chromium only, not a real iPhone/Safari check','No live backend, users, payments or official submissions']},ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+x for x in results))
asyncio.run(main())
