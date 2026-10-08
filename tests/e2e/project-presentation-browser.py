"""Project -> linked chat -> same project in the actual build. No account writes."""
import asyncio, hashlib, json, os, re, shutil, zipfile
from pathlib import Path
from playwright.async_api import async_playwright, expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium')
OUT=Path(os.getenv('QA_OUTPUT','qa-output'))/'project-presentation';OUT.mkdir(parents=True,exist_ok=True)
LANGS=['sv','en','ru','es','uk','fi','bs','ar','fa','so','ku']
async def one(browser,language,width):
 context=await browser.new_context(viewport={'width':width,'height':900 if width>800 else 844},locale=language,service_workers='block',reduced_motion='reduce')
 errors=[];requests=[];external=[]
 async def guard(route):
  request=route.request
  if request.method not in ('GET','HEAD'):
   requests.append(request.method+' '+request.url);await route.abort()
  elif request.url.startswith(BASE):await route.continue_()
  else:external.append(request.url);await route.abort()
 await context.route('**/*',guard)
 page=await context.new_page();page.on('pageerror',lambda error:errors.append(str(error)))
 result={'language':language,'width':width,'engine':ENGINE,'result':'FAIL'}
 try:
  await page.goto(BASE+'?first-contact=three-paths')
  # Established automation entry event; this is not a human comprehension interview.
  await page.evaluate("window.dispatchEvent(new CustomEvent('folkoop:open-entry'))")
  await page.locator('[data-entry-language="'+language+'"]').click()
  await page.locator('[data-entry="guest"]').click()
  await expect(page.locator('#onboarding')).to_be_visible()
  await page.locator('[data-onboarding="skip"]').click()
  await page.locator('#mobilePrimaryNav [data-mobile-nav="home"]').click()
  await page.locator('[data-mura-select="project"]').click()
  note=page.locator('[data-mura-chapter="project"]')
  title=(await note.locator('.mura-life-object').inner_text()).strip()
  project_id=await note.locator('[data-home="openCoop"]').get_attribute('data-id')
  await note.locator('[data-home="openCoop"]').click()
  await expect(page).to_have_url(re.compile(r'#/projects$'))
  workspace=page.locator('.project-workspace[data-project-presentation-ready]')
  await expect(workspace).to_be_visible()
  await expect(workspace.locator('.coop-summary h2')).to_have_text(title)
  assert await workspace.locator('.coop-summary').count()==1
  assert await workspace.locator('[data-coop-section="tasks"]').count()==1
  assert await workspace.locator('[data-coop-section="members"]').count()==1
  assert await workspace.locator('[data-coop-section="tasks"]').get_attribute('open') is None
  # Preserve exactly the original nodes and form states on an idempotent pass.
  invariant=await workspace.evaluate("""el=>{
   const nodes=[...el.querySelectorAll('*')];
   const forms=[...el.querySelectorAll('form')].map(f=>[f,f.hidden]);
   const count=el.querySelectorAll('[id]').length;
   const r=FolkoopProjectPresentation.enhanceProject(document.getElementById('networkPanel'),{route:'projects',guestDemo:true});
   return !r&&nodes.every(n=>el.contains(n))&&forms.every(([f,h])=>f.hidden===h)&&count===el.querySelectorAll('[id]').length;
  }""")
  assert invariant
  await workspace.locator('[data-project-jump="tasks"]').focus()
  await workspace.locator('[data-project-jump="tasks"]').press('Enter')
  await expect(workspace.locator('[data-coop-section="tasks"] > summary')).to_be_focused()
  await expect(workspace.locator('.coop-task-row')).to_have_count(2)
  await workspace.locator('[data-project-jump="members"]').click()
  await expect(workspace.locator('[data-coop-section="members"] > summary')).to_be_focused()
  assert await workspace.locator('[data-coop-section="members"] .coop-compact-row').count()==4
  # Only project members also visible in the directory can be visited.
  visit=workspace.locator('[data-home="openPerson"]').first
  person_id=await visit.get_attribute('data-id')
  person_name=(await visit.locator('xpath=..').locator('strong').first.inner_text()).strip()
  await expect(visit).to_be_visible()
  await visit.click()
  await expect(page).to_have_url(re.compile(r'#/people
  assert await workspace.locator('[data-coop="join"]:visible').count()==0
  assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  await workspace.locator('[data-project-jump="overview"]').click()
  await expect(workspace.locator('.coop-summary')).to_be_focused()
  chat_button=workspace.locator('[data-coop="openLinkedChat"]')
  chat_id=await chat_button.get_attribute('data-id')
  assert (await chat_button.bounding_box())['height']>=44
  if language in ('ru','en','ar','fa'):
   await page.evaluate('scrollTo(0,0)')
   await page.screenshot(path=str(OUT/f'{language}-{width}-{ENGINE}-project.png'),full_page=True)
   await page.screenshot(path=str(OUT/f'{language}-{width}-{ENGINE}-project-viewport.png'))
  await chat_button.click()
  await expect(page).to_have_url(re.compile(r'#/messages$'))
  context_card=page.locator('.conversation-project-context')
  await expect(context_card).to_be_visible()
  await expect(context_card.locator('strong')).to_have_text(title)
  await expect(context_card.locator('[data-coop="openNotify"]')).to_have_attribute('data-id',project_id)
  assert await page.locator('.chat-messages .chat-message').count()==4
  assert await page.locator('.chat-message.is-mine').count()==1
  assert await page.locator('#netMessage').count()==0
  assert await page.locator('#netChatInvite').count()==0
  assert not await page.locator('[data-net="deleteMessage"]:visible').count()
  assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  if language in ('ru','en','ar','fa'):
   await page.evaluate('scrollTo(0,0)')
   await page.screenshot(path=str(OUT/f'{language}-{width}-{ENGINE}-chat.png'),full_page=True)
  await context_card.locator('[data-coop="openNotify"]').click()
  await expect(page).to_have_url(re.compile(r'#/projects$'))
  await expect(page.locator('.project-workspace .coop-summary h2')).to_have_text(title)
  await expect(page.locator('.project-workspace [data-coop="openLinkedChat"]')).to_have_attribute('data-id',chat_id)
  await page.locator('#mobilePrimaryNav [data-mobile-nav="home"]').click()
  await expect(page.locator('[data-mura-select="project"]')).to_have_attribute('aria-selected','true')
  assert not await page.locator('.project-workspace').count()
  assert not errors,errors
  assert not requests,requests
  assert not [url for url in external if 'supabase.co' in url],external
  result.update(result='PASS',project_id=project_id,chat_id=chat_id,live_writes=0)
 except Exception as error:
  result['failure']=str(error)
  await page.screenshot(path=str(OUT/f'{language}-{width}-{ENGINE}-failure.png'),full_page=True)
  raise
 finally:
  result['errors']=errors
  (OUT/f'{language}-{width}-{ENGINE}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
  await context.close()
 return result
async def main():
 async with async_playwright() as p:
  browser=await p.webkit.launch() if ENGINE=='webkit' else await p.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  cases=[('ru',390),('ru',1280),('ar',390)] if ENGINE=='webkit' else [(lang,w) for lang in LANGS for w in (390,1280)]+[('ru',320)]
  results=[]
  try:
   for language,width in cases:results.append(await one(browser,language,width))
  finally:await browser.close()
 report={'scope':'actual-build read-only Mura project/chat; not physical device or native language approval','engine':ENGINE,'cases':results,'human_review':False}
 (OUT/f'report-{ENGINE}.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 if ENGINE=='chromium':
  with zipfile.ZipFile(OUT/'public-site.zip','w',zipfile.ZIP_DEFLATED) as archive:
   for file in sorted(Path('_site').rglob('*')):
    if file.is_file():archive.write(file,file.relative_to('_site'))
  (OUT/'public-site.sha256').write_text(hashlib.sha256((OUT/'public-site.zip').read_bytes()).hexdigest()+'\n')
 print('PROJECT PRESENTATION:',ENGINE,len(results),'actual-build cases passed')
asyncio.run(main())
))
  person=page.locator('[data-person-focused="true"]')
  await expect(person).to_have_count(1)
  await expect(person).to_have_attribute('data-person-id',person_id)
  await expect(person).to_contain_text(person_name)
  await expect(person).to_be_focused()
  if language=='ru' and width in (390,1280):
   await page.evaluate('scrollTo(0,0)')
   await page.screenshot(path=str(OUT/f'{language}-{width}-{ENGINE}-person.png'))
  await person.locator('[data-coop="openNotify"]').click()
  await expect(page).to_have_url(re.compile(r'#/projects
  assert await workspace.locator('[data-coop="join"]:visible').count()==0
  assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  await workspace.locator('[data-project-jump="overview"]').click()
  await expect(workspace.locator('.coop-summary')).to_be_focused()
  chat_button=workspace.locator('[data-coop="openLinkedChat"]')
  chat_id=await chat_button.get_attribute('data-id')
  assert (await chat_button.bounding_box())['height']>=44
  if language in ('ru','en','ar','fa'):
   await page.evaluate('scrollTo(0,0)')
   await page.screenshot(path=str(OUT/f'{language}-{width}-{ENGINE}-project.png'),full_page=True)
   await page.screenshot(path=str(OUT/f'{language}-{width}-{ENGINE}-project-viewport.png'))
  await chat_button.click()
  await expect(page).to_have_url(re.compile(r'#/messages$'))
  context_card=page.locator('.conversation-project-context')
  await expect(context_card).to_be_visible()
  await expect(context_card.locator('strong')).to_have_text(title)
  await expect(context_card.locator('[data-coop="openNotify"]')).to_have_attribute('data-id',project_id)
  assert await page.locator('.chat-messages .chat-message').count()==4
  assert await page.locator('.chat-message.is-mine').count()==1
  assert await page.locator('#netMessage').count()==0
  assert await page.locator('#netChatInvite').count()==0
  assert not await page.locator('[data-net="deleteMessage"]:visible').count()
  assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  if language in ('ru','en','ar','fa'):
   await page.evaluate('scrollTo(0,0)')
   await page.screenshot(path=str(OUT/f'{language}-{width}-{ENGINE}-chat.png'),full_page=True)
  await context_card.locator('[data-coop="openNotify"]').click()
  await expect(page).to_have_url(re.compile(r'#/projects$'))
  await expect(page.locator('.project-workspace .coop-summary h2')).to_have_text(title)
  await expect(page.locator('.project-workspace [data-coop="openLinkedChat"]')).to_have_attribute('data-id',chat_id)
  await page.locator('#mobilePrimaryNav [data-mobile-nav="home"]').click()
  await expect(page.locator('[data-mura-select="project"]')).to_have_attribute('aria-selected','true')
  assert not await page.locator('.project-workspace').count()
  assert not errors,errors
  assert not requests,requests
  assert not [url for url in external if 'supabase.co' in url],external
  result.update(result='PASS',project_id=project_id,chat_id=chat_id,live_writes=0)
 except Exception as error:
  result['failure']=str(error)
  await page.screenshot(path=str(OUT/f'{language}-{width}-{ENGINE}-failure.png'),full_page=True)
  raise
 finally:
  result['errors']=errors
  (OUT/f'{language}-{width}-{ENGINE}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
  await context.close()
 return result
async def main():
 async with async_playwright() as p:
  browser=await p.webkit.launch() if ENGINE=='webkit' else await p.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  cases=[('ru',390),('ru',1280),('ar',390)] if ENGINE=='webkit' else [(lang,w) for lang in LANGS for w in (390,1280)]+[('ru',320)]
  results=[]
  try:
   for language,width in cases:results.append(await one(browser,language,width))
  finally:await browser.close()
 report={'scope':'actual-build read-only Mura project/chat; not physical device or native language approval','engine':ENGINE,'cases':results,'human_review':False}
 (OUT/f'report-{ENGINE}.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 if ENGINE=='chromium':
  with zipfile.ZipFile(OUT/'public-site.zip','w',zipfile.ZIP_DEFLATED) as archive:
   for file in sorted(Path('_site').rglob('*')):
    if file.is_file():archive.write(file,file.relative_to('_site'))
  (OUT/'public-site.sha256').write_text(hashlib.sha256((OUT/'public-site.zip').read_bytes()).hexdigest()+'\n')
 print('PROJECT PRESENTATION:',ENGINE,len(results),'actual-build cases passed')
asyncio.run(main())
))
  await expect(workspace.locator('.coop-summary h2')).to_have_text(title)
  assert await workspace.locator('form:visible').count()==0
  assert await workspace.locator('[data-coop="join"]:visible').count()==0
  assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  await workspace.locator('[data-project-jump="overview"]').click()
  await expect(workspace.locator('.coop-summary')).to_be_focused()
  chat_button=workspace.locator('[data-coop="openLinkedChat"]')
  chat_id=await chat_button.get_attribute('data-id')
  assert (await chat_button.bounding_box())['height']>=44
  if language in ('ru','en','ar','fa'):
   await page.evaluate('scrollTo(0,0)')
   await page.screenshot(path=str(OUT/f'{language}-{width}-{ENGINE}-project.png'),full_page=True)
   await page.screenshot(path=str(OUT/f'{language}-{width}-{ENGINE}-project-viewport.png'))
  await chat_button.click()
  await expect(page).to_have_url(re.compile(r'#/messages$'))
  context_card=page.locator('.conversation-project-context')
  await expect(context_card).to_be_visible()
  await expect(context_card.locator('strong')).to_have_text(title)
  await expect(context_card.locator('[data-coop="openNotify"]')).to_have_attribute('data-id',project_id)
  assert await page.locator('.chat-messages .chat-message').count()==4
  assert await page.locator('.chat-message.is-mine').count()==1
  assert await page.locator('#netMessage').count()==0
  assert await page.locator('#netChatInvite').count()==0
  assert not await page.locator('[data-net="deleteMessage"]:visible').count()
  assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  if language in ('ru','en','ar','fa'):
   await page.evaluate('scrollTo(0,0)')
   await page.screenshot(path=str(OUT/f'{language}-{width}-{ENGINE}-chat.png'),full_page=True)
  await context_card.locator('[data-coop="openNotify"]').click()
  await expect(page).to_have_url(re.compile(r'#/projects$'))
  await expect(page.locator('.project-workspace .coop-summary h2')).to_have_text(title)
  await expect(page.locator('.project-workspace [data-coop="openLinkedChat"]')).to_have_attribute('data-id',chat_id)
  await page.locator('#mobilePrimaryNav [data-mobile-nav="home"]').click()
  await expect(page.locator('[data-mura-select="project"]')).to_have_attribute('aria-selected','true')
  assert not await page.locator('.project-workspace').count()
  assert not errors,errors
  assert not requests,requests
  assert not [url for url in external if 'supabase.co' in url],external
  result.update(result='PASS',project_id=project_id,chat_id=chat_id,live_writes=0)
 except Exception as error:
  result['failure']=str(error)
  await page.screenshot(path=str(OUT/f'{language}-{width}-{ENGINE}-failure.png'),full_page=True)
  raise
 finally:
  result['errors']=errors
  (OUT/f'{language}-{width}-{ENGINE}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
  await context.close()
 return result
async def main():
 async with async_playwright() as p:
  browser=await p.webkit.launch() if ENGINE=='webkit' else await p.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  cases=[('ru',390),('ru',1280),('ar',390)] if ENGINE=='webkit' else [(lang,w) for lang in LANGS for w in (390,1280)]+[('ru',320)]
  results=[]
  try:
   for language,width in cases:results.append(await one(browser,language,width))
  finally:await browser.close()
 report={'scope':'actual-build read-only Mura project/chat; not physical device or native language approval','engine':ENGINE,'cases':results,'human_review':False}
 (OUT/f'report-{ENGINE}.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 if ENGINE=='chromium':
  with zipfile.ZipFile(OUT/'public-site.zip','w',zipfile.ZIP_DEFLATED) as archive:
   for file in sorted(Path('_site').rglob('*')):
    if file.is_file():archive.write(file,file.relative_to('_site'))
  (OUT/'public-site.sha256').write_text(hashlib.sha256((OUT/'public-site.zip').read_bytes()).hexdigest()+'\n')
 print('PROJECT PRESENTATION:',ENGINE,len(results),'actual-build cases passed')
asyncio.run(main())
