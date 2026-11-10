"""Stories: real browser/adapter, isolated API fixtures. No live publications."""
import asyncio,json,os,shutil
from datetime import datetime,timedelta,timezone
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4507/')
API='https://abcdefghijklmnopqrst.supabase.co'
UID='11111111-1111-4111-8111-111111111111';OTHER='22222222-2222-4222-8222-222222222222'
PROJECT='33333333-3333-4333-8333-333333333333';CHAT='44444444-4444-4444-8444-444444444444'
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(parents=True,exist_ok=True)
def moment(hours=0):return (datetime.now(timezone.utc)+timedelta(hours=hours)).isoformat()
async def main():
 async with async_playwright() as pw:
  browser=await pw.webkit.launch() if os.getenv('BROWSER_ENGINE')=='webkit' else await pw.chromium.launch(executable_path=shutil.which('chromium'))
  for width,theme,lang in [(320,'dark','ru'),(1366,'light','ru'),(390,'dark','ar')]:
   ctx=await browser.new_context(service_workers='block',viewport={'width':width,'height':844},color_scheme=theme)
   await ctx.add_init_script("localStorage.setItem('folkoop-language',"+json.dumps(lang)+");localStorage.setItem('folkoop-language-choice-v1','done');localStorage.setItem('folkoop-theme',"+json.dumps(theme)+")")
   stories=[{'id':f'55555555-5555-4555-8555-{i:012d}','author_id':OTHER,'author_name':'Story friend','body':'Invitation '+str(i)+' <img src=x onerror=alert(1)>','tone':'teal' if i==1 else 'plum','audience':'network','cooperation_id':PROJECT if i==1 else None,'created_at':moment(-i),'expires_at':moment(24-i)} for i in [1,2]]
   state={'sent':[],'fail':True,'report':0,'reply':0,'feedError':False}
   refresh_started=asyncio.Event();refresh_release=asyncio.Event()
   projects=[{'id':PROJECT,'owner_id':UID,'kind':'project','title':'Synthetic story project','description':'Test only','status':'active','created_at':moment(-2)}]
   members=[{'cooperation_id':PROJECT,'user_id':UID},{'cooperation_id':PROJECT,'user_id':OTHER}]
   async def routing(route):
    url=route.request.url;result=[];path=urlparse(url).path
    if url.endswith('/network-config.js'):
     await route.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps({'enabled':True,'url':API,'publishableKey':'sb_publishable_example_for_tests_only'})+';',content_type='application/javascript');return
    if not url.startswith(API):await route.continue_();return
    if path.endswith('/verify'):result={'access_token':'synthetic-stories','expires_in':3600}
    elif path.endswith('/user'):result={'id':UID}
    elif path.endswith('/fk_claim_first_pilot'):result=True
    elif '/fk_profiles?' in url:
     if state.get('holdRefresh'):refresh_started.set();await refresh_release.wait()
     result=[{'id':UID,'name':'Story author','listed':True},{'id':OTHER,'name':'Story friend','listed':True}]
    elif '/fk_cooperations?' in url:result=projects
    elif '/fk_cooperation_members?' in url:result=members
    elif '/fk_conversations?' in url:result=[{'id':CHAT,'kind':'direct','owner_id':UID}]
    elif '/fk_conversation_members?' in url:result=[{'conversation_id':CHAT,'user_id':UID},{'conversation_id':CHAT,'user_id':OTHER}]
    elif path.endswith('/fk_story_feed'):
     if state['feedError']:await route.fulfill(status=503,body='{}',content_type='application/json');return
     result=[s for s in stories if not s.get('withdrawn_at')]
    elif '/fk_stories?' in url:
     query=parse_qs(urlparse(url).query)
     result=[s for s in stories if s['id']==query['id'][0][3:]] if 'id' in query else [s for s in stories if s['author_id']==UID]
    elif path.endswith('/fk_publish_story'):
     body=route.request.post_data_json;state['sent'].append(body)
     if not any(s['id']==body['p_id'] for s in stories):stories.append({'id':body['p_id'],'author_id':UID,'author_name':'Story author','body':body['p_body'],'tone':body['p_tone'],'audience':body['p_audience'],'cooperation_id':body['p_cooperation'],'created_at':moment(),'expires_at':moment(24)})
     if state['fail']:state['fail']=False;await asyncio.sleep(1.5);await route.abort();return
     result=body['p_id']
    elif path.endswith('/fk_withdraw_story'):
     for s in stories:
      if s['id']==route.request.post_data_json['p_story']:s['withdrawn_at']=moment()
     result=None
    elif path.endswith('/fk_report_story'):state['report']+=1;result=None
    elif path.endswith('/fk_start_direct'):state['reply']+=1;result=CHAT
    headers={'access-control-expose-headers':'content-range'}
    if isinstance(result,list):headers['content-range']=f'0-{max(0,len(result)-1)}/{len(result)}'
    await route.fulfill(body=json.dumps(result),content_type='application/json',headers=headers)
   await ctx.route('**/*',routing)
   page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'#/me')
   await page.fill('#netLogin [name=email]','synthetic@example.test');await page.click('#netLogin [value=code]')
   await page.fill('#netLogin [name=code]','123456');await page.check('#netLogin [name=policyAccepted]');await page.click('#netLogin [value=verify]')
   await expect(page.locator('.story-circle[data-story-author]')).to_have_count(1)
   await expect(page.locator('.story-own-circle')).to_have_count(1)
   await expect(page.locator('.story-add-badge')).to_have_count(1)
   await expect(page.locator('.story-strip > summary')).to_have_count(0)
   compact=await page.locator('.story-strip').bounding_box()
   assert compact['height']<=110,(width,compact)
   await page.locator('.story-strip').screenshot(path=str(OUT/f'story-strip-{width}-{theme}-{lang}.png'))
   await page.goto(BASE+'#/together')
   await expect(page.locator('#accountStories')).to_have_count(0)
   await page.goto(BASE+'#/me')
   await expect(page.locator('.story-circle[data-story-author]')).to_have_count(1)
   state['holdRefresh']=True
   await page.evaluate("window.dispatchEvent(new Event('focus'))")
   await asyncio.wait_for(refresh_started.wait(),5)
   await page.locator(f'.story-circle[data-story-author="{OTHER}"]').click();await expect(page.locator('.story-paper')).to_contain_text('Invitation 1')
   async with page.expect_response(lambda r:r.url.endswith('/fk_story_feed')):
    state['holdRefresh']=False;refresh_release.set()
   await expect(page.locator('.story-paper')).to_contain_text('Invitation 1')
   # A late event for the already mounted route must not close a new viewer.
   await page.evaluate("window.dispatchEvent(new Event('hashchange'))")
   await expect(page.locator('.story-paper')).to_be_visible()
   assert await page.locator('.story-paper img').count()==0
   await page.click('[data-story-next]');await expect(page.locator('.story-paper')).to_contain_text('Invitation 2')
   await page.click('[data-story-prev]');await expect(page.locator('.story-paper')).to_contain_text('Invitation 1')
   await page.locator('.story-dialog').screenshot(path=str(OUT/f'story-viewer-{width}-{theme}-{lang}.png'))
   box=await page.locator('.story-dialog').bounding_box();assert box['width']<=420 and box['x']>=0 and box['x']+box['width']<=width+1
   await page.click('.story-more summary');page.once('dialog',lambda d:d.accept())
   # Clicking returns before the asynchronous report request has necessarily completed.
   async with page.expect_response(lambda r:r.url.endswith('/fk_report_story')):
    await page.click('[data-story-report]')
   assert state['report']==1
   await page.click('[data-story-link]');await expect(page).to_have_url(__import__('re').compile(r'#/projects$'));await expect(page.locator('.coop-summary')).to_contain_text('Synthetic story project')
   await page.goto(BASE+'#/me');await expect(page.locator('.story-circle[data-story-author]')).to_have_count(1)
   await page.locator(f'.story-circle[data-story-author="{OTHER}"]').click();await expect(page.locator('.story-paper')).to_be_visible();await page.click('[data-story-reply]')
   await expect(page).to_have_url(__import__('re').compile(r'#/messages$'));await expect(page.locator('#netMessage')).to_be_visible();assert state['reply']==1
   await page.goto(BASE+'#/me');await page.click('[data-story-new]')
   await page.fill('.story-compose textarea','My useful story');await page.select_option('.story-compose [name=cooperation]',PROJECT);await page.select_option('.story-compose [name=audience]','project')
   await page.click('.story-compose [type=submit]')
   await page.click('[data-story-close]');await page.click('[data-story-new]')
   await expect(page.locator('.story-compose textarea')).to_be_disabled()
   await expect(page.locator('.story-compose [type=submit]')).to_be_enabled()
   await expect(page.locator('.story-compose textarea')).to_have_value('My useful story');await expect(page.locator('.story-compose textarea')).to_be_disabled()
   await page.click('.story-compose [type=submit]');await expect(page.locator('.story-dialog')).to_have_count(0)
   assert len(state['sent'])==2 and state['sent'][0]==state['sent'][1]
   assert len([s for s in stories if s['author_id']==UID])==1
   await expect(page.locator('.story-circle[data-story-author]')).to_have_count(2)
   await page.locator('.story-own-circle[data-story-author]').click()
   await expect(page.locator('.story-paper')).to_contain_text('My useful story')
   await page.click('[data-story-close]')
   await page.click('[data-story-archive]');await page.click('[data-story-index="0"]');await expect(page.locator('.story-paper')).to_contain_text('My useful story')
   await page.click('.story-more summary');await page.click('[data-story-withdraw]');await expect(page.locator('.story-dialog')).to_have_count(0)
   await expect(page.locator('.story-circle[data-story-author]')).to_have_count(1)
   await page.click('[data-story-archive]');await expect(page.locator('[data-story-index]')).to_have_count(1);await page.click('[data-story-close]')
   state['feedError']=True;await page.click('[data-story-refresh]');await expect(page.locator('.story-circle[data-story-author]')).to_have_count(0)
   await expect(page.locator('.story-status')).not_to_be_empty()
   state['feedError']=False;await page.click('[data-story-refresh]');await expect(page.locator('.story-circle[data-story-author]')).to_have_count(1)
   await page.locator(f'.story-circle[data-story-author="{OTHER}"]').click();await expect(page.locator('.story-paper')).to_be_visible();await page.keyboard.press('Escape');await expect(page.locator('.story-dialog')).to_have_count(0)
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   assert errors==[],errors
   print(f'PASS {width}/{theme}/{lang}: viewer, reply, project, idempotent lost-response retry, archive, withdrawal, report, unavailable feed, bounds')
   await ctx.close()
  ctx=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':390,'height':844},color_scheme='dark')
  await ctx.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done');localStorage.setItem('folkoop-theme','dark')")
  writes=[]
  async def readonly(route):
   if route.request.method not in ['GET','HEAD']:writes.append(route.request.url);await route.abort()
   elif route.request.url.startswith(BASE):await route.continue_()
   else:await route.abort()
  await ctx.route('**/*',readonly)
  page=await ctx.new_page();await page.goto(BASE);await page.click('[data-entry=guest]');await page.click('[data-onboarding=skip]')
  await expect(page.locator('.story-own-circle')).to_have_count(1)
  await expect(page.locator('.story-circle[data-story-author]')).to_have_count(2)
  # Reproduce late persisted-locale hydration after examples were first built.
  await page.evaluate("document.documentElement.lang='sv'");await page.click('[data-story-refresh]')
  await page.evaluate("document.documentElement.lang='ru'")
  await page.locator('.story-circle[data-story-author]:not(.story-own-circle)').first.click();await expect(page.locator('.story-paper')).to_be_visible()
  await expect(page.locator('.story-paper')).to_contain_text('Собираем закупку дров')
  await page.locator('.story-dialog').screenshot(path=str(OUT/'mura-story-390.png'))
  await page.click('[data-story-reply]');await expect(page).to_have_url(__import__('re').compile(r'#/messages$'))
  await expect(page.locator('#networkPanel')).to_contain_text('Omar')
  await page.goto(BASE+'#/home');await expect(page.locator('[data-story-new]')).to_be_visible()
  await page.click('[data-story-new]');await page.fill('.story-compose textarea','Локальная история Муры');await page.click('.story-compose [type=submit]')
  await page.click('[data-story-archive]');await expect(page.locator('.story-archive')).to_contain_text('Локальная история Муры')
  await page.click('[data-story-close]');await page.reload();await expect(page.locator('.story-circle[data-story-author]')).to_have_count(2)
  await page.click('[data-story-archive]');await expect(page.locator('.story-archive')).not_to_contain_text('Локальная история Муры')
  assert writes==[],writes
  print('PASS Mura stories, local composer, archive, reload and zero external writes')
  await ctx.close()
  await browser.close()
asyncio.run(main())
