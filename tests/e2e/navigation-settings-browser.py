"""Settings/navigation, synthetic geocoder responses, no account writes."""
import asyncio,os,json,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4507/')
OUT=Path(os.getenv('QA_OUTPUT','/tmp/folkoop-nav-settings'));OUT.mkdir(parents=True,exist_ok=True)
async def main():
 async with async_playwright() as pw:
  browser=await pw.webkit.launch() if os.getenv('BROWSER_ENGINE')=='webkit' else await pw.chromium.launch(executable_path=shutil.which('chromium'))
  for width in [390,1366]:
   ctx=await browser.new_context(viewport={'width':width,'height':844},service_workers='block',locale='ru-RU')
   await ctx.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done');")
   requests=[]
   async def route(r):
    if 'geocoding-api.open-meteo.com' in r.request.url:
     requests.append(r.request.url)
     if 'Offline' in r.request.url:
      await r.abort();return
     if 'Missing' in r.request.url or '%2C' in r.request.url:
      await r.fulfill(json={'results':[]});return
     await r.fulfill(json={'results':[{'name':'Paris','feature_code':'PPLC','country_code':'FR','admin1':'Île-de-France'},{'name':'Paris','feature_code':'PPLC','country_code':'US','admin1':'Texas'},{'name':'Paris Airport','country_code':'FR','feature_code':'AIRP'}]})
    elif r.request.url.startswith(BASE):await r.continue_()
    else:await r.abort()
   await ctx.route('**/*',route)
   p=await ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   await p.goto(BASE);await expect(p.locator('#entryLanguageChoices')).to_be_hidden()
   await p.locator('[data-entry="guest"]').click();await p.get_by_role('button',name='Осмотреться самому',exact=True).click()
   await expect(p.locator('#language')).to_be_hidden()
   await p.goto(BASE+'#/settings');await p.locator('#appearanceTheme').select_option('dark')
   await expect(p.locator('[data-mobile-action="language"]:visible')).to_have_count(1)
   for mode in ['icons','text','both']:
    await p.locator('#navigationStyle').select_option(mode)
    await expect(p.locator('html')).to_have_attribute('data-nav-style',mode)
    if mode=='icons':await expect(p.locator('#mobilePrimaryNav a').first.locator('span').first).to_be_hidden()
    if mode=='text':await expect(p.locator('#mobilePrimaryNav a').first.locator('svg')).to_be_hidden()
    assert all(await p.locator('#mobilePrimaryNav a').evaluate_all('(xs)=>xs.map(x=>!!x.getAttribute("aria-label"))'))
   await p.locator('[data-mobile-action="language"]').click();await expect(p.locator('[data-folkoop-guide-lang]')).to_have_count(11)
   await p.locator('[data-folkoop-guide-lang="en"]').click();await expect(p.locator('html')).to_have_attribute('lang','en')
   await p.locator('[data-mobile-action="language"]').click();await p.locator('[data-folkoop-guide-lang="ru"]').click()
   await p.locator('#placeCountry').select_option('FR');await p.locator('#placeRegion').fill('Île-de-France');await p.locator('#placeCity').fill('Paris')
   await expect(p.locator('#locationLabel')).not_to_have_text('Paris')
   await p.locator('#findPlace').click();await expect(p.locator('#placeResults button')).to_have_count(1)
   await p.locator('#placeResults button').click();await p.locator('#savePlace').click()
   await expect(p.locator('#locationLabel')).to_have_text('Paris');await expect(p.locator('#locationLabel')).to_be_visible()
   await p.reload();await expect(p.locator('#placeCity')).to_have_value('Paris')
   await p.locator('#mobilePrimaryNav [href="#/city"]').click();await expect(p.locator('#cityWorkspace')).to_be_hidden()
   await p.goto(BASE+'#/settings');await p.locator('#placeCountry').select_option('SE')
   await expect(p.locator('#placeRegion')).to_have_value('');await expect(p.locator('#placeCity')).to_have_value('')
   await p.locator('#placeCity').fill('Missing');await p.locator('#findPlace').click();await expect(p.locator('#placeStatus')).to_contain_text('Ничего не найдено')
   await p.locator('#placeCity').fill('Offline');await p.locator('#findPlace').click();await expect(p.locator('#placeStatus')).to_contain_text('Поиск недоступен')
   await p.locator('#placeRegion').fill('Västra Götaland');await p.locator('#placeCity').fill('Göteborg');await p.locator('#savePlace').click()
   await p.locator('#mobilePrimaryNav [href="#/city"]').click();f=p.frame_locator('#cityFrame')
   await expect(f.locator('.bottom-nav')).to_be_hidden();await expect(p.locator('[data-subsection="city-overview"]')).to_have_text('Город')
   await p.locator('[data-subsection="city-nearby"]').click();await expect(f.locator('#view')).to_be_visible()
   await p.locator('[data-subsection="city-overview"]').click();await expect(f.locator('#todayScreen')).to_be_visible()
   assert await p.evaluate('document.documentElement.scrollWidth<=innerWidth')
   await p.screenshot(path=str(OUT/f'city-{width}.png'))
   await p.locator('#mobilePrimaryNav [href="#/together"]').click();await expect(p.locator('#mobileContextDock>a')).to_have_count(4)
   boxes=await p.locator('#mobilePrimaryNav>a').evaluate_all('(xs)=>xs.map(e=>({h:e.getBoundingClientRect().height,y:e.getBoundingClientRect().y,b:e.querySelector(".net-count")?getComputedStyle(e.querySelector(".net-count")).position:null}))')
   assert len(set(x['h'] for x in boxes))==1,boxes
   assert all(x['b'] in [None,'absolute'] for x in boxes)
   await p.locator('#mobilePrimaryNav [href="#/messages"]').click();await expect(p.locator('.mura-chat-card').first).to_be_visible()
   await p.screenshot(path=str(OUT/f'messages-{width}.png'))
   await p.locator('.messenger-open').first.click();await expect(p.locator('.chat-messages')).to_be_visible()
   assert not errors,errors
   assert 'countryCode=FR' in requests[0],requests
   await ctx.close();print(json.dumps({'width':width,'result':'passed'}))
  await browser.close()
asyncio.run(main())
