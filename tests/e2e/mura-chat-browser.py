"""All 18 authored replies through the real map; no live account writes."""
import asyncio,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4507/')
OUT=Path(os.getenv('QA_OUTPUT','/tmp/mura-chat-qa'));OUT.mkdir(parents=True,exist_ok=True)
async def main():
 async with async_playwright() as pw:
  b=await pw.webkit.launch() if os.getenv('BROWSER_ENGINE')=='webkit' else await pw.chromium.launch(executable_path=shutil.which('chromium'))
  c=await b.new_context(viewport={'width':390,'height':844},locale='ru-RU',service_workers='block',color_scheme=os.getenv('COLOR_SCHEME','light'))
  await c.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done');")
  writes=[]
  async def restrict(r):
   if r.request.method not in ('GET','HEAD'):
    writes.append(r.request.url);await r.abort()
   elif r.request.url.startswith(BASE):await r.continue_()
   else:await r.abort()
  await c.route('**/*',restrict)
  p=await c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  await p.goto(BASE)
  await expect(p.locator('.entry-mura img')).to_have_attribute('src','./folkoop-guide-confident.webp')
  await p.locator('[data-entry="guest"]').click()
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
  await p.locator('#folkoopGuideActor').click();await p.locator('#folkoopHelperTour').click()
  await p.locator('[data-mura-profile="interests"]').click()
  await p.locator('[data-onboarding="next"]').click()
  await expect(p.locator('#onboardingTitle')).to_have_text('Навыки')
  await p.locator('[data-onboarding="back"]').click()
  await expect(p.locator('#onboardingTitle')).to_have_text('Интересы')
  await p.locator('[data-onboarding="skip"]').click()
  groups=[['interests','skills','connections','ideas'],['need','offer','resource','purchase','project'],['communities','people','events'],['city-services','city-transport','center-events'],['direct','group','project']]
  for chapter,stories in enumerate(groups):
   for story in stories:
    if not await p.locator('#onboarding').is_visible():
     await p.locator('#folkoopGuideActor').click()
     panel=p.locator('#folkoopHelperPanel')
    else:panel=p.locator('#onboarding')
    await panel.locator('.mura-tour-map > summary').click()
    await panel.locator(f'[data-tour-map-chapter="{chapter}"][data-tour-map-story="{story}"]').click()
    await expect(p.locator('#onboarding')).to_be_visible()
    await expect(p.locator('#muraChatStory > :is(section,aside)')).to_have_count(1)
    await expect(p.locator('#onboardingBody')).not_to_have_attribute('aria-busy','true')
    assert len(await p.locator('#onboardingBody').inner_text())>15
    assert await p.locator('.onboarding-card').evaluate('e=>e.clientHeight<innerHeight*.48')
    for attr in ['data-mura-answer','data-mura-center-answer']:
     for value in ['terms','done']:
      button=p.locator('#muraChatStory ['+attr+'="'+value+'"]')
      if await button.count():
       await button.click()
       await expect(p.locator('#onboardingBody')).not_to_have_attribute('aria-busy','true')
       assert await p.locator('#muraChatChoice').inner_text()==await button.inner_text()
       await expect(p.locator('#onboarding')).to_be_visible()
    if chapter in [0,4]:
     await p.locator('#muraChatStory details summary').click()
     await p.locator('#muraChatStory textarea').fill('Моя пробная мысль')
     await p.locator('#muraChatStory textarea').press('Tab')
     await expect(p.locator('#onboardingBody')).not_to_have_attribute('aria-busy','true')
    if chapter==3:
     await p.locator('#muraChatStory input[type=checkbox]').first.check()
     await expect(p.locator('#onboardingBody')).to_contain_text('не создаёт')
    assert await p.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')==='guest'")
    await p.screenshot(path=str(OUT/f'story-{chapter}-{story}.png'))
    print('PASS persistent reply and practice',chapter,story,flush=True)
  await p.locator('[data-onboarding="back"]').click()
  await expect(p.locator('#onboardingTitle')).to_contain_text('Групп')
  # An active tour resumes automatically after reload. Wait for that documented
  # outcome before testing manual resume; clicking the helper during the delayed
  # startup raced startFullIntroduction on CI WebKit and hid the helper panel.
  await p.reload()
  await expect(p.locator('#muraChatStory')).to_be_visible()
  await expect(p.locator('#onboardingTitle')).to_contain_text('Групп')
  await p.locator('[data-onboarding=skip]').click()
  await p.locator('#folkoopGuideActor').click()
  await expect(p.locator('#folkoopHelperPanel')).to_be_visible()
  await expect(p.locator('#folkoopHelperPanel .mura-tour-map summary')).to_contain_text('18/18')
  await p.locator('#folkoopHelperTour').click()
  await expect(p.locator('#muraChatStory')).to_be_visible()
  await expect(p.locator('#onboardingTitle')).to_contain_text('Групп')
  for w,h in [(320,568),(844,390),(1366,900),(390,844)]:
   await p.set_viewport_size({'width':w,'height':h})
   geometry=await p.locator('.onboarding-card').evaluate('e=>{const r=e.getBoundingClientRect();return r.x>=0&&r.right<=innerWidth+1&&r.y>=0&&r.bottom<=innerHeight+1&&r.height<innerHeight*(innerHeight<550?.66:.48)}')
   assert geometry,(w,h)
   await p.screenshot(path=str(OUT/f'continuous-{w}.png'))
  await p.emulate_media(reduced_motion='reduce')
  await p.locator('[data-onboarding="next"]').click()
  await expect(p.locator('#muraTourFinale')).to_be_visible()
  await p.locator('[data-mura-stay]').click()
  await p.locator('#folkoopGuideActor').click()
  await p.locator('#folkoopHelperPanel .mura-tour-map summary').click()
  await p.locator('#folkoopHelperPanel [data-tour-map-chapter="4"]:not([data-tour-map-story])').click()
  # Chapter selector is retained; completing the last chapter opens the real finale.
  await p.locator('#onboardingProgress').click();await p.locator('#onboardingChapter').select_option('4')
  await p.locator('[data-onboarding="next"]').click()
  await expect(p.locator('#muraTourFinale')).to_be_visible()
  assert await p.locator('#muraTourFinale').evaluate('e=>e.clientHeight<innerHeight*.48')
  await p.locator('[data-mura-stay]').click();await expect(p.locator('#muraTourFinale')).to_be_hidden()
  assert not errors,errors
  assert not writes,writes
  print('PASS progress reload, chapter jump, finale and stay')
  await b.close()
asyncio.run(main())
