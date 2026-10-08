"""Presentation path in the actual built app. No production users or remote writes."""
import asyncio, csv, hashlib, json, os, zipfile
from pathlib import Path
from playwright.async_api import async_playwright, expect
BASE=os.environ.get('BASE_URL','http://127.0.0.1:4173/Folkoop/')
OUT=Path('qa-output/mura-presentation');OUT.mkdir(parents=True,exist_ok=True)
LANGS=['sv','en','ru','es','uk','fi','bs','ar','fa','so','ku']

async def one(browser,language,width):
 context=await browser.new_context(viewport={'width':width,'height':900 if width>800 else 844},locale=language,service_workers='block',reduced_motion='reduce')
 external=[];errors=[]
 async def guard(route):
  if route.request.url.startswith(BASE):await route.continue_()
  else:external.append({'method':route.request.method,'url':route.request.url});await route.abort()
 await context.route('**/*',guard)
 page=await context.new_page();page.on('pageerror',lambda error:errors.append(str(error)))
 await page.goto(BASE+'?first-contact=three-paths')
 await page.locator('[data-entry-language="'+language+'"]').click()
 await expect(page.locator('#entryThreePaths')).to_be_visible()
 if language in ('ru','en') and width==1280:await page.screenshot(path=str(OUT/f'{language}-{width}-entry.png'))
 await page.locator('[data-entry="guest"]').click()
 await expect(page.locator('#onboarding')).to_be_visible()
 await page.locator('[data-onboarding="skip"]').click()
 await page.locator('#mobilePrimaryNav [data-mobile-nav="home"]').click()
 root=page.locator('.mura-life[data-presentation-ready]')
 await expect(root).to_be_visible()
 tabs=root.locator('[role="tab"]');panels=root.locator('[role="tabpanel"]')
 assert await tabs.count()==9
 assert await panels.count()==9
 assert await root.locator('[role="tabpanel"]:visible').count()==1
 assert await root.evaluate('(el)=>getComputedStyle(el).direction')==('rtl' if language in ('ar','fa') else 'ltr')
 await tabs.first.press('End')
 await expect(tabs.last).to_have_attribute('aria-selected','true')
 await tabs.last.press('Home')
 await expect(tabs.first).to_have_attribute('aria-selected','true')
 await tabs.first.press('ArrowRight')
 await expect(tabs.nth(8 if language in ('ar','fa') else 1)).to_have_attribute('aria-selected','true')
 for key in ['need','offer','project','chat','people','purchase','outcome','city','draft']:
  await root.locator('[data-mura-select="'+key+'"]').click()
  await expect(root.locator('[data-mura-chapter="'+key+'"]')).to_be_visible()
  assert await root.locator('[role="tabpanel"]:visible').count()==1
  assert (await root.locator('[data-mura-select="'+key+'"]').bounding_box())['height']>=44
 await root.locator('[data-mura-select="project"]').click()
 title=(await root.locator('[data-mura-chapter="project"] .mura-life-object').inner_text()).strip()
 if language in ('ru','en','ar','fa'):
  await page.evaluate('window.scrollTo(0,0)')
  await page.screenshot(path=str(OUT/f'{language}-{width}-home.png'),full_page=True)
  await root.screenshot(path=str(OUT/f'{language}-{width}-story.png'))
 await root.locator('[data-mura-chapter="project"] [data-home="openCoop"]').click()
 await expect(page).to_have_url(__import__('re').compile(r'#/projects$'))
 await expect(page.locator('#networkPanel')).to_contain_text(title)
 if language=='ru' and width==1280:await page.screenshot(path=str(OUT/'ru-1280-project.png'),full_page=True)
 await page.locator('#mobilePrimaryNav [data-mobile-nav="home"]').click()
 await expect(page.locator('[data-mura-select="project"]')).to_have_attribute('aria-selected','true')
 await page.locator('[data-mura-select="chat"]').click()
 await page.locator('[data-mura-chapter="chat"] [data-net="openChat"]').click()
 await expect(page).to_have_url(__import__('re').compile(r'#/messages$'))
 if language=='ru' and width==1280:await page.screenshot(path=str(OUT/'ru-1280-chat.png'),full_page=True)
 await page.locator('#mobilePrimaryNav [data-mobile-nav="home"]').click()
 await expect(page.locator('[data-mura-select="chat"]')).to_have_attribute('aria-selected','true')
 assert await page.locator('.mura-chapter-nav').count()==1
 assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
 assert not [x for x in external if 'supabase.co' in x['url']],external
 assert not [x for x in external if x['method']!='GET'],external
 assert not errors,errors
 if width==390:
  copy=await page.evaluate('(lang)=>FolkoopMuraLife.copyFor(lang)',language)
  with (OUT/f'mura-review-{language}.csv').open('w',encoding='utf-8',newline='') as f:
   writer=csv.writer(f);writer.writerow(['language','key','text','human_review'])
   for i,value in enumerate(copy):
    if isinstance(value,list):
     writer.writerow([language,f'chapter.{i-3}.title',value[0],'PENDING']);writer.writerow([language,f'chapter.{i-3}.body',value[1],'PENDING'])
    else:writer.writerow([language,f'heading.{i}',value,'PENDING'])
 await context.close()
 return {'language':language,'width':width,'chapters':9,'result':'PASS','live_network_writes':0}

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch()
  results=[]
  for language in LANGS:
   for width in (390,1280):results.append(await one(browser,language,width))
  results.append(await one(browser,'ru',320))
  await browser.close()
 report={'scope':'actual build / synthetic read-only Mura; not human interviews or physical-device certification','cases':results,'human_language_approval':False}
 (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 with zipfile.ZipFile(OUT/'public-site.zip','w',zipfile.ZIP_DEFLATED) as archive:
  for file in sorted(Path('_site').rglob('*')):
   if file.is_file():archive.write(file,file.relative_to('_site'))
 (OUT/'public-site.sha256').write_text(hashlib.sha256((OUT/'public-site.zip').read_bytes()).hexdigest()+'\n')
 print('MURA PRESENTATION:',len(results),'built-browser cases passed')

asyncio.run(main())
