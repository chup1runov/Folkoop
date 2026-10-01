"""FOLKOOP v0.29 language-first onboarding with authored directional/sit-edge FOLKOOP guide poses."""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium').lower()
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(parents=True,exist_ok=True)

async def launch_browser(pw):
 if ENGINE=='chromium':
  return await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
 if ENGINE=='webkit':
  return await pw.webkit.launch()
 raise AssertionError(f'Unsupported BROWSER_ENGINE={ENGINE}')

async def local_only_factory(context):
 async def local_only(route):
  if route.request.url.startswith(BASE): await route.continue_()
  else: await route.abort()
 await context.route('**/*',local_only)

async def settled_actor(page):
 # The shell schedules placement on animation frames; a visible actor can still
 # be at its previous/home position. Wait for placement and both teleport phases
 # instead of racing a 150ms timer or sampling an unfinished 380ms entrance.
 await page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
 await page.wait_for_function("""() => {
  const actor=document.getElementById('folkoopGuideActor');
  return actor && !actor.hidden && actor.classList.contains('is-tour') &&
   !actor.classList.contains('teleport-out') && !actor.classList.contains('teleport-in');
 }""")


async def assert_directional_pose(page):
 pose=await page.locator('#folkoopGuideActor').get_attribute('data-pose')
 actor=await page.locator('#folkoopGuideActor').bounding_box()
 target=await page.locator('.tutorial-target').bounding_box()
 assert actor and target
 dx=(target['x']+target['width']/2)-(actor['x']+actor['width']/2)
 dy=(target['y']+target['height']/2)-(actor['y']+actor['height']*.42)
 expected=('point-left' if dx<0 else 'point-right') if abs(dx)>=abs(dy) else ('point-up' if dy<0 else 'point-down')
 assert pose==expected,(pose,expected,dx,dy)

async def mobile_flow(browser,passed):
 context=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':390,'height':844})
 await local_only_factory(context)
 await context.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>undefined});localStorage.clear();sessionStorage.clear()")
 page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 await page.goto(BASE)

 await expect(page.locator('#folkoopGuideLanguageGate')).to_be_visible()
 await expect(page.locator('#onboarding')).to_be_hidden()
 await expect(page.locator('#folkoopGuideLanguageTitle')).to_have_text('Hej! · Hi! · Привет!')
 await expect(page.locator('.folkoop-guide-language-character img')).to_be_visible()
 assert await page.locator('[data-folkoop-guide-lang]').count()==11
 passed.append('First contact is FOLKOOP guide plus language selection before the site tour')

 await page.click('[data-folkoop-guide-lang="ru"]')
 await expect(page.locator('#folkoopGuideLanguageGate')).to_be_hidden()
 await expect(page.locator('#folkoopEntryGate')).to_be_visible()
 await page.click('[data-entry="guest"]')
 await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
 await expect(page.locator('#onboarding')).to_be_visible()
 await expect(page.locator('#onboardingTitle')).to_have_text('Привет, я Мура')
 await expect(page.locator('#onboardingBody')).to_contain_text('помощница FOLKOOP')
 await expect(page.locator('#onboardingProgress')).to_contain_text('1 / 8')
 await expect(page.locator('#folkoopGuideActor')).to_be_visible()
 assert await page.evaluate("localStorage.getItem('folkoop-language-choice-v1')")=='done'
 passed.append('Chosen language leads to explicit Guest choice before Mura opens her Mura’s space')

 titles=[
  'Привет, я Мура',
  'Это моё место',
  'Что мне понадобилось',
  'Чем я могу помочь',
  'Проект, который я начала',
  'Как я нахожу людей',
  'Где мы договариваемся',
  'Теперь сделай своё место своим'
 ]
 await settled_actor(page)
 assert await page.locator('#folkoopGuideActor').evaluate("el=>el.classList.contains('is-tour')")
 first_box=await page.locator('#folkoopGuideActor').bounding_box()
 for idx,title in enumerate(titles):
  await expect(page.locator('#onboardingTitle')).to_have_text(title)
  semantic={2:('together','Одолжить плиткорез на выходные'),3:('together','Могу помочь с фотографией'),4:('projects','Обмен растениями и семенами по соседству')}
  if idx in semantic:
   route_name,visible_text=semantic[idx]
   assert page.url.endswith('#/'+route_name),(idx,page.url)
   await expect(page.locator('#networkPanel')).to_contain_text(visible_text)
  await expect(page.locator('#onboardingSpotlight')).to_be_visible()
  box=await page.locator('#folkoopGuideActor').bounding_box()
  assert box and box['x']>=0 and box['y']>=0 and box['x']+box['width']<=390 and box['y']+box['height']<=844,box
  await expect(page.locator('#folkoopGuideActor img')).to_have_attribute('src','./folkoop-guide-confident.webp')
  if idx==3:
   assert await page.locator('#folkoopGuideActor').get_attribute('data-pose')=='idea'
  card=page.locator('.onboarding-card');actions=page.locator('.onboarding-actions');copy=page.locator('#onboardingCopy');cue=page.locator('#onboardingScrollCue')
  cb=await card.bounding_box();ab=await actions.bounding_box();assert cb and ab and ab['y']+ab['height']<=cb['y']+cb['height']+1,(idx,cb,ab)
  overflow=await copy.evaluate('(el)=>el.scrollHeight>el.clientHeight+3')
  if overflow: assert not await cue.is_hidden(),f'step {idx+1} overflow has no scroll cue'
  if idx in (2,3,4):
   expected_task=idx-1
   await expect(page.locator('[data-onboarding="next"]')).to_have_text('Помочь Муре')
   await page.click('[data-onboarding="next"]')
   await expect(page.locator('#muraPracticeStars')).to_contain_text('★')
   await expect(page.locator('#muraPracticeXp')).to_have_text(str(expected_task*5)+' XP')
   await expect(page.locator('#onboardingBody')).to_contain_text('+5 учебных XP')
  await page.screenshot(path=str(OUT/f'folkoop-onboarding-step-{idx+1}.png'),full_page=True)
  if idx<len(titles)-1:
   await page.click('[data-onboarding=next]')
   await settled_actor(page)

 moved_box=await page.locator('#folkoopGuideActor').bounding_box()
 assert first_box and moved_box and (abs(first_box['x']-moved_box['x'])>8 or abs(first_box['y']-moved_box['y'])>8),(first_box,moved_box)
 await expect(page.locator('[data-onboarding=next]')).to_have_text('Начать пользоваться FOLKOOP')
 await page.click('[data-onboarding=next]')
 await expect(page.locator('#onboarding')).to_be_hidden()
 assert await page.evaluate("localStorage.getItem('folkoop-onboarding-v3')")=='done'
 passed.append('Mura keeps one canonical identity through the 8-step activation-first tour while spotlight and accessible motion indicate context')

 await expect(page.locator('#folkoopGuideActor')).to_be_visible()
 await page.click('#folkoopGuideActor')
 await expect(page.locator('#folkoopHelperPanel')).to_be_visible()
 await expect(page.locator('#folkoopHelperTitle')).to_have_text('Mura')
 await expect(page.locator('#folkoopHelperPanel')).to_contain_text('Показать всю инструкцию ещё раз')
 passed.append('After onboarding the physical FOLKOOP guide remains as the lightweight contextual helper')

 await page.click('[data-helper=close]')
 labels=await page.locator('#mobilePrimaryNav a span:not(.net-count)').all_text_contents()
 assert labels[:6]==['Главная','Вместе','Проекты','Город','Сообщения','Профиль'],labels
 await page.click('#mobilePrimaryNav [data-mobile-nav="me"]')
 await page.click('#mobileContextDock [data-mobile-subnav="settings"]')
 await page.click('[data-action=tutorial]')
 await expect(page.locator('#folkoopGuideLanguageGate')).to_be_visible()
 passed.append('Replay from Settings restarts from language, preserving the language-first contract')
 await page.keyboard.press('Escape')
 await page.screenshot(path=str(OUT/'folkoop-v029-directional-folkoop-guide-mobile.png'),full_page=True)
 assert errors==[],errors
 await context.close()

async def desktop_flow(browser,passed):
 context=await browser.new_context(service_workers='block',locale='en-US',viewport={'width':1366,'height':900})
 await local_only_factory(context)
 page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 await page.goto(BASE+'?intro=1')
 await expect(page.locator('#folkoopGuideLanguageGate')).to_be_visible()
 card=await page.locator('.folkoop-guide-language-card').bounding_box()
 assert card and card['width']>700 and card['height']<900,card
 await page.click('[data-folkoop-guide-lang="en"]')
 await expect(page.locator('#onboarding')).to_be_visible()
 await page.click('[data-onboarding=next]')
 await settled_actor(page)
 actor=await page.locator('#folkoopGuideActor').bounding_box()
 assert actor and actor['x']>=0 and actor['x']+actor['width']<=1366 and actor['y']>=0 and actor['y']+actor['height']<=900,actor
 await expect(page.locator('#onboardingSpotlight')).to_be_visible()
 assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 passed.append('Desktop language gate, spotlight and animated FOLKOOP guide stay inside the viewport')
 await page.click('[data-onboarding=skip]')
 assert errors==[],errors
 await context.close()

async def main():
 passed=[]
 async with async_playwright() as pw:
  browser=await launch_browser(pw)
  await mobile_flow(browser,passed)
  await desktop_flow(browser,passed)
  await browser.close()
 OUT.joinpath('onboarding-results.json').write_text(json.dumps({'passed':passed,'limits':[('WebKit engine on Linux; not real iOS Safari' if ENGINE=='webkit' else 'Chromium emulation; not real iOS Safari'),'Value tour copy is localized across all supported shell languages; native-language review remains desirable','Mura motion is local CSS/JS around one canonical artwork; no AI service is called at runtime']},ensure_ascii=False,indent=2))
 print(f'ENGINE {ENGINE}')
 print('\n'.join('PASS '+x for x in passed))

asyncio.run(main())
