"""Chromium behavioral checks. Synthetic fixture data; not a real iPhone/Safari test.
Set BASE_URL to an exact static build served at /Sverinav/.
"""
import asyncio,json,os,re,shutil
from pathlib import Path
from datetime import datetime,timezone,timedelta
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Sverinav/')
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True)
passed=[]
async def main():
 now=datetime.now(timezone.utc)
 iso=lambda d:d.isoformat().replace('+00:00','Z')
 forecast={'referenceTime':iso(now),'timeSeries':[{'time':iso(now+timedelta(hours=i)),'data':{'air_temperature':13+i/10,'wind_speed':2.7,'probability_of_precipitation':30}} for i in range(1,6)]}
 feed={'schemaVersion':1,'fetchedAt':iso(now),'sourceId':'riksdagen_open_data','sourceName':'Sveriges riksdag','items':[{'title':'Testdata — utskottsdokument','sourceUrl':'https://data.riksdagen.se/dokument/test.html','documentType':'Betänkande'}]}
 plan={'schemaVersion':1,'fetchedAt':iso(now),'sourceId':'goteborg_open_plans','sourceName':'Göteborgs Stad','sourceUrl':'https://goteborg.se/planochbyggprojekt','items':[{'title':'Testdata — samråd','deadline':(now+timedelta(days=3)).date().isoformat(),'sourceUrl':'https://goteborg.se/test-plan'}]}
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  context=await browser.new_context(viewport={'width':390,'height':844},locale='sv-SE',is_mobile=True,has_touch=True,service_workers='block')
  async def routes(route):
   url=route.request.url
   if 'opendata-download-metfcst' in url:await route.fulfill(json=forecast,content_type='application/json',headers={'access-control-allow-origin':'*'})
   elif 'opendata-download-warnings' in url:await route.fulfill(body='[]',content_type='application/json',headers={'access-control-allow-origin':'*'})
   elif url.endswith('data/riksdagen-decisions.json'):await route.fulfill(json=feed)
   elif url.endswith('data/goteborg-open-plans.json'):await route.fulfill(json=plan)
   elif url.startswith(BASE):await route.continue_()
   else:await route.abort()
  await context.route('**/*',routes)
  page=await context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  await page.goto(BASE)
  await expect(page.locator('#dailyWeather .weather-main')).to_be_visible()
  await expect(page.locator('#homeDecisions .decision-live-link')).to_have_count(1)
  await expect(page.locator('#homeOpenPlans .plan-card')).to_have_count(1)
  await page.screenshot(path=str(OUT/'idag-mobile.png'),full_page=True)
  await expect(page.locator('#dailyWarnings')).to_contain_text('Inga aktuella')
  assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth"), 'Mobile overflow'
  passed.append('Idag renders forecast, warning result and both civic feeds at /Sverinav/')
  await page.select_option('#weatherArea','hisingen')
  await expect(page.locator('#dailyWeather .weather-main')).to_be_visible()
  assert await page.evaluate("localStorage.getItem('sverinav-weather-area')")=='hisingen'
  passed.append('Coarse weather preference persists without GPS')
  await page.locator('[data-screen="rapportera"]').first.click()
  await page.fill('#reportDescription','Test only — do not submit')
  await page.click('#languageButton');await page.click('[data-language="ru"]')
  await expect(page.locator('#reportDescription')).to_have_value('Test only — do not submit')
  passed.append('Language switch preserves the in-memory report draft')
  await page.evaluate("document.querySelector('.skip-link').click()")
  assert page.url.endswith('#rapportera'), 'Skip link changed route'
  passed.append('Skip link does not reset the route')
  await page.click('#aboutButton')
  await page.evaluate("navigator.clipboard.writeText=async()=>{throw new Error('denied')};document.execCommand=()=>false")
  await page.fill('#pilotFeedbackTask','Copy test')
  await page.click('#copyPilotFeedback')
  await expect(page.locator('#pilotFeedbackStatus')).to_contain_text('Не удалось')
  assert await page.locator('body > textarea').count()==0
  passed.append('Clipboard denial is not reported as success and leaves no hidden textarea')
  for lang in ['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk']:
   await page.click('#languageButton');await page.click(f'[data-language="{lang}"]')
   assert await page.locator('html').get_attribute('lang')==lang
   assert await page.locator('html').get_attribute('dir')==('rtl' if lang in ('ar','fa') else 'ltr')
   await page.locator('.bottom-nav [data-screen="home"]').click()
   await expect(page.locator('#dailyWeather .weather-main')).to_be_visible()
   assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Overflow {lang}'
   if lang=='ar':await page.screenshot(path=str(OUT/'idag-rtl.png'),full_page=True)
  passed.append('All eleven languages render without horizontal overflow, including RTL')
  for width in [320,1280]:
   await page.set_viewport_size({'width':width,'height':900})
   assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Overflow {width}'
  passed.append('320px and desktop widths do not overflow')
  await page.set_viewport_size({'width':1280,'height':900});await page.screenshot(path=str(OUT/'idag-desktop.png'),full_page=True)
  await page.click('#languageButton')
  await page.locator('.language-option').last.focus();await page.keyboard.press('Tab')
  await expect(page.locator('#closeLanguageButton')).to_be_focused()
  await page.keyboard.press('Escape');await expect(page.locator('#languageButton')).to_be_focused()
  passed.append('Language dialog traps keyboard focus and restores it on Escape')
  await page.goto(BASE+'#ansvar');await page.fill('#issue','Hål i vägen');await page.click('#findOwner')
  await expect(page.locator('[data-road-resolve]')).to_be_visible()
  await page.evaluate("Object.defineProperty(navigator.geolocation,'getCurrentPosition',{value:(ok,fail)=>fail({code:1})})")
  await page.click('[data-road-resolve]');await expect(page.locator('[data-road-live]')).not_to_be_empty()
  passed.append('Geolocation denial is a visible error, not a fabricated road holder')
  await page.evaluate("globalThis.testUncertain=roadMatchUncertain({ambiguous:true,accuracyMeters:5,distanceMeters:2});globalThis.testRoute=officialReportUrl({holderType:'statlig',ambiguous:true,accuracyMeters:5,distanceMeters:2})")
  assert await page.evaluate('testUncertain && testRoute===null')
  passed.append('Ambiguous match cannot auto-route to one official recipient')
  await page.goto(BASE);await page.evaluate("SverinavDaily.loadWarnings=async()=>{throw new Error('offline')}")
  await page.click('#dailyRefresh');await expect(page.locator('#dailyWarnings .source-unavailable')).to_be_visible()
  passed.append('Warning-source failure is not an all-clear')
  assert errors==[], '\n'.join(errors)
  await context.close()
  blocked=await browser.new_context(service_workers='block',locale='sv-SE')
  await blocked.route('**/*',routes)
  await blocked.add_init_script("Storage.prototype.getItem=()=>{throw new Error('denied')};Storage.prototype.setItem=()=>{throw new Error('denied')}")
  bpage=await blocked.new_page();await bpage.goto(BASE);await expect(bpage.locator('#todayScreen')).to_be_visible()
  passed.append('Startup tolerates disabled storage')
  await blocked.close();await browser.close()
 OUT.joinpath('browser-results.json').write_text(json.dumps({'passed':passed,'limitations':['Chromium, not real iPhone/WebKit','Synthetic provider fixtures; live API contracts checked separately','No real ticket purchase or official report submitted']},ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+x for x in passed))
asyncio.run(main())
