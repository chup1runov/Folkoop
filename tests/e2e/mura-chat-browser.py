"""All 18 authored replies through the real map; no live account writes."""
import asyncio,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4507/')
OUT=Path(os.getenv('QA_OUTPUT','/tmp/mura-chat-qa'));OUT.mkdir(parents=True,exist_ok=True)
async def main():
 async with async_playwright() as pw:
  b=await pw.webkit.launch() if os.getenv('BROWSER_ENGINE')=='webkit' else await pw.chromium.launch(executable_path=shutil.which('chromium'))
  c=await b.new_context(viewport={'width':390,'height':844},locale='ru-RU',service_workers='block')
  await c.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done');")
  await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(BASE) else r.abort())
  p=await c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  await p.goto(BASE);await p.locator('[data-entry="guest"]').click()
  await expect(p.locator('#onboardingBody')).to_contain_text('С чего познакомимся?')
  assert await p.locator('.onboarding-card').evaluate('e=>e.clientHeight<innerHeight*.48')
  await expect(p.locator('.onboarding-card')).to_have_attribute('aria-modal','false')
  assert await p.locator('#mobilePrimaryNav').evaluate('e=>!e.closest("[inert]")')
  await p.screenshot(path=str(OUT/'small-chat.png'))
  await p.locator('#mobilePrimaryNav [href="#/together"]').click()
  await expect(p.locator('#onboarding')).to_be_hidden()
  await p.locator('#folkoopGuideActor').click()
  await p.locator('#folkoopHelperTour').click()
  await expect(p.locator('#onboardingBody')).to_contain_text('С чего познакомимся?')
  await p.locator('[data-onboarding="skip"]').click()
  print('PASS independent navigation pauses chat; resume restores chapter')
  groups=[['interests','skills','connections','ideas'],['need','offer','resource','purchase','project'],['communities','people','events'],['city-services','city-transport','center-events'],['direct','group','project']]
  for chapter,stories in enumerate(groups):
   for story in stories:
    await p.locator('#folkoopGuideActor').click()
    panel=p.locator('#folkoopHelperPanel');await expect(panel).to_be_visible()
    await panel.locator('.mura-tour-map > summary').click()
    await panel.locator(f'[data-tour-map-chapter="{chapter}"][data-tour-map-story="{story}"]').click()
    await expect(p.locator('#onboarding')).to_be_hidden()
    assert await p.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')==='guest'")
    print('PASS reply',chapter,story,await p.locator('h1,h2').all_text_contents())
  await p.reload();await p.locator('#folkoopGuideActor').click()
  await expect(p.locator('#folkoopHelperPanel .mura-tour-map summary')).to_contain_text('18/18')
  await p.locator('#folkoopHelperPanel .mura-tour-map summary').click()
  await p.locator('#folkoopHelperPanel [data-tour-map-chapter="4"]:not([data-tour-map-story])').click()
  # Chapter selector is retained; completing the last chapter opens the real finale.
  await p.locator('#onboardingProgress').click();await p.locator('#onboardingChapter').select_option('4')
  await p.locator('[data-onboarding="next"]').click()
  await expect(p.locator('#muraTourFinale')).to_be_visible()
  assert await p.locator('#muraTourFinale').evaluate('e=>e.clientHeight<innerHeight*.48')
  await p.locator('[data-mura-stay]').click();await expect(p.locator('#muraTourFinale')).to_be_hidden()
  assert not errors,errors
  print('PASS progress reload, chapter jump, finale and stay')
  await b.close()
asyncio.run(main())
