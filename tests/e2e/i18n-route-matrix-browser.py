"""Route-by-route i18n matrix: 11 languages x 11 user-facing sections.

This is intentionally a browser test rather than a dictionary test. It verifies that
the selected language survives real navigation, guest/local mode changes, embedded
City, and RTL rendering. It also rejects known EN/SV/RU guest-copy fallbacks for the
eight additional full-interface languages.
"""
import asyncio, json, os, shutil
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(parents=True,exist_ok=True)
LANGS=['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk']
EXTRA={'ar','so','fa','fi','bs','ku','es','uk'}
RTL={'ar','fa'}
ROUTES=['home','together','projects','messages','people','communities','city','center','me','settings','about']
NETWORK={'home','together','projects','messages','people','communities','me'}

FALLBACK_SENTINELS=[
 "A living FOLKOOP account:",
 "Not a contact list: people I already share",
 "Places I return to: neighbours",
 "Private draft",
 "What lives here",
 "things and projects",
 "Leave Mura's account",
 "You're inside my FOLKOOP.",
 "Ett levande FOLKOOP-konto:",
 "Inte en kontaktlista, utan människor",
 "Platser jag återkommer till: grannar",
 "Живая жизнь внутри FOLKOOP:",
 "Не список контактов, а люди",
 "Места, куда я возвращаюсь: соседи",
]

EXPECTED_JS="""({lang,route}) => {
 const registry=globalThis.FolkoopExtraCopy;
 const p=registry?.languages?.[lang],g=registry?.muraGuest?.[lang],h=registry?.muraHome?.[lang];
 if(!p||!g||!h)return null;
 const map={
  home:h.lead,
  together:g.coop?.togetherTitle,
  projects:g.coop?.projectsTitle,
  messages:g.chat?.messagesTitle,
  people:g.base?.directory,
  communities:g.base?.groups,
  city:p.shell?.city,
  center:p.shell?.centerOnlineTitle,
  me:g.base?.profile,
  settings:p.shell?.settingsTitle,
  about:p.shell?.aboutTitle
 };
 return map[route]||null;
}"""

async def local_only(route):
 if route.request.url.startswith(BASE):
  await route.continue_()
 else:
  await route.abort()

async def navigate(page,route):
 await page.evaluate("(r)=>{location.hash='#/'+r}",route)
 await page.wait_for_timeout(120)
 await expect(page.locator('html')).to_have_attribute('lang',page._matrix_lang)
 expected_dir='rtl' if page._matrix_lang in RTL else 'ltr'
 await expect(page.locator('html')).to_have_attribute('dir',expected_dir)

 async def nonempty(locator):
  await expect(locator).to_be_visible()
  text=(await locator.inner_text()).strip()
  assert text, f'{page._matrix_lang}/{route}: empty visible content'
  return text

 if route in NETWORK:
  panel=page.locator('#networkPanel')
  text=await nonempty(panel)
  assert await panel.get_attribute('lang')==page._matrix_lang,(page._matrix_lang,route,'network lang')
  assert await panel.get_attribute('dir')==expected_dir,(page._matrix_lang,route,'network dir')
  return text

 if route=='city':
  workspace=page.locator('#workspace')
  parent_text=(await workspace.inner_text()).strip()
  frame=page.frame_locator('#cityFrame')
  await expect(frame.locator('html')).to_have_attribute('lang',page._matrix_lang)
  await expect(frame.locator('html')).to_have_attribute('dir',expected_dir)
  city_text=(await frame.locator('#view').inner_text()).strip()
  assert city_text,f'{page._matrix_lang}/city: empty City iframe'
  return parent_text+'\n'+city_text

 workspace=page.locator('#workspace')
 assert await workspace.get_attribute('lang')==page._matrix_lang,(page._matrix_lang,route,'workspace lang')
 assert await workspace.get_attribute('dir')==expected_dir,(page._matrix_lang,route,'workspace dir')
 return await nonempty(workspace)

async def main():
 matrix={lang:{route:{'status':'NOT_RUN'} for route in ROUTES} for lang in LANGS}
 failures=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  context=await browser.new_context(viewport={'width':390,'height':844},locale='en-US',service_workers='block')
  await context.route('**/*',local_only)

  for lang in LANGS:
   page=await context.new_page()
   page._matrix_lang=lang
   await page.add_init_script(f"""
    localStorage.setItem('folkoop-language',{json.dumps(lang)});
    localStorage.setItem('folkoop-language-choice-v1','done');
    localStorage.setItem('folkoop-onboarding-v3','done');
    sessionStorage.setItem('folkoop-entry-mode-v1','guest');
   """)
   errors=[]
   page.on('pageerror',lambda error,errors=errors:errors.append(str(error)))
   try:
    await page.goto(BASE+'#/home',wait_until='load')
    await expect(page.locator('#language')).to_have_value(lang)
    await expect(page.locator('#translationNote')).to_be_hidden()

    for route in ROUTES:
     try:
      if route in ('settings','about'):
       await page.evaluate("""() => {
        sessionStorage.setItem('folkoop-entry-mode-v1','local');
        window.dispatchEvent(new CustomEvent('folkoop:guest-demo',{detail:{enabled:false,target:'local',temporary:true}}));
       }""")
      else:
       await page.evaluate("""() => {
        sessionStorage.setItem('folkoop-entry-mode-v1','guest');
        window.dispatchEvent(new CustomEvent('folkoop:guest-demo',{detail:{enabled:true,target:'matrix',temporary:true}}));
       }""")
       await page.wait_for_timeout(80)

      text=await navigate(page,route)
      marker=None
      if lang in EXTRA:
       marker=await page.evaluate(EXPECTED_JS,{'lang':lang,'route':route})
       assert marker and marker.strip(),f'{lang}/{route}: missing expected localized marker in language pack'
       assert marker.casefold() in text.casefold(),f'{lang}/{route}: expected localized marker not visible: {marker!r}'
       lowered=text.casefold()
       leaked=[s for s in FALLBACK_SENTINELS if s.casefold() in lowered]
       assert not leaked,f'{lang}/{route}: core-language fallback leaked: {leaked}'
      if lang in EXTRA and route=='home':
       await expect(page.locator('#networkPanel .mura-home')).to_be_visible()
      if lang in EXTRA and route=='city':
       for development_label in ['early product prototype','demo —','pilot','prototyp']:
        assert development_label not in text.casefold(),f'{lang}/city: development chrome leaked: {development_label}'
      assert not errors,f'{lang}/{route}: page errors: {errors}'
      matrix[lang][route]={'status':'PASS','marker':marker}
     except Exception as exc:
      matrix[lang][route]={'status':'FAIL','error':str(exc)}
      failures.append(f'{lang}/{route}: {exc}')
   finally:
    await page.close()

  await context.close()
  await browser.close()

 headers='| Language | '+' | '.join(r.title() for r in ROUTES)+' |'
 sep='|---|'+'|'.join(['---']*len(ROUTES))+'|'
 rows=[headers,sep]
 for lang in LANGS:
  cells=['✅' if matrix[lang][r]['status']=='PASS' else '❌' for r in ROUTES]
  rows.append('| '+lang.upper()+' | '+' | '.join(cells)+' |')
 summary={'languages':LANGS,'routes':ROUTES,'total_cells':len(LANGS)*len(ROUTES),'passed':sum(matrix[l][r]['status']=='PASS' for l in LANGS for r in ROUTES),'failed':len(failures),'matrix':matrix,'failures':failures}
 OUT.joinpath('i18n-route-matrix.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
 OUT.joinpath('i18n-route-matrix.md').write_text('\n'.join(rows)+'\n\n'+('\n'.join('- '+f for f in failures) if failures else 'All 121 route/language cells passed.')+'\n',encoding='utf-8')
 print('\n'.join(rows))
 print(f"PASS={summary['passed']} FAIL={summary['failed']} TOTAL={summary['total_cells']}")
 if failures:
  raise AssertionError('\n'.join(failures))

asyncio.run(main())
