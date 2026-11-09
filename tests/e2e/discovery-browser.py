"""Explicit discovery preferences and verified task goal, isolated API fixtures."""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4507/')
API='https://abcdefghijklmnopqrst.supabase.co'
UID='11111111-1111-4111-8111-111111111111'
OTHER='22222222-2222-4222-8222-222222222222'
READ_RPCS={'fk_story_feed','fk_chat_inbox','fk_activity_inbox','fk_my_public_page','fk_meeting_budget_notice_inbox','fk_contribution_notice_inbox','fk_room_notification_inbox','fk_meeting_action_inbox','fk_meeting_room_alerts','fk_task_basis_notifications','fk_document_revision_notifications','fk_meeting_reminder_inbox','fk_task_action_inbox'}
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(parents=True,exist_ok=True)
async def main():
 async with async_playwright() as pw:
  browser=await pw.webkit.launch() if os.getenv('BROWSER_ENGINE')=='webkit' else await pw.chromium.launch(executable_path=shutil.which('chromium'))
  for width,theme in [(320,'dark'),(390,'light'),(1366,'dark')]:
   ctx=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':width,'height':844},color_scheme=theme)
   await ctx.add_init_script("localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done');localStorage.setItem('folkoop-theme',"+json.dumps(theme)+")")
   state={'uid':UID,'results':[],'unavailable':False,'writes':[],'queries':[]}
   projects=[{'id':f'33333333-3333-4333-8333-{i:012d}','owner_id':OTHER,'kind':'project' if i%2==0 else 'need','title':f'Практика шведского {i}','description':'Общая встреча','status':'active','created_at':f'2026-11-0{9-i}T09:00:00Z'} for i in range(7)]
   async def routing(route):
    url=route.request.url;result=[]
    if url.endswith('/network-config.js'):
     await route.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps({'enabled':True,'url':API,'publishableKey':'sb_publishable_example_for_tests_only'})+';',content_type='application/javascript');return
    if not url.startswith(API):await route.continue_();return
    if '/rest/v1/' in url and route.request.method not in ['GET','HEAD'] and url.rsplit('/',1)[-1] not in READ_RPCS|{'fk_claim_first_pilot','fk_claim_pilot_invite'}:state['writes'].append(url)
    if url.endswith('/verify'):result={'access_token':'synthetic-discovery','expires_in':3600}
    elif url.endswith('/user'):result={'id':state['uid']}
    elif url.endswith('/fk_claim_first_pilot'):result=True
    elif '/fk_profiles?' in url:result=[{'id':state['uid'],'name':'Synthetic discovery','listed':True}]
    elif '/fk_cooperations?' in url:result=projects
    elif '/fk_project_tasks?' in url and 'work_stage=eq.verified' in url:
     state['queries'].append(url)
     if state['unavailable']:await route.fulfill(status=503,body='{}',content_type='application/json');return
     result=state['results']
    headers={'access-control-expose-headers':'content-range'}
    if isinstance(result,list):headers['content-range']=f'0-{max(0,len(result)-1)}/{len(result)}'
    await route.fulfill(body=json.dumps(result),content_type='application/json',headers=headers)
   await ctx.route('**/*',routing)
   page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   async def login():
    await page.fill('#netLogin [name=email]','synthetic@example.test');await page.click('#netLogin [value=code]')
    await page.fill('#netLogin [name=code]','123456');await page.check('#netLogin [name=policyAccepted]');await page.click('#netLogin [value=verify]')
    await expect(page.locator('.for-you')).to_be_visible()
   await page.goto(BASE+'#/me');await login()
   await page.click('[data-for-you-wish=swedish]');await expect(page.locator('.for-you-card')).to_have_count(3)
   first=await page.locator('[data-discovery=save]').first.get_attribute('data-id')
   await page.locator('[data-discovery=save]').first.click()
   await expect(page.locator(f'[data-discovery=save][data-id="{first}"]')).to_have_attribute('aria-pressed','true')
   await page.click('[data-discovery=next]');await expect(page.locator('.discovery-pages')).to_contain_text('2 / 3')
   await page.click('[data-discovery=next]');await expect(page.locator('.for-you-card')).to_have_count(1)
   await expect(page.locator('[data-discovery=next]')).to_have_count(0)
   await page.click('[data-discovery=prev]');await page.click('[data-discovery=options]')
   await page.locator(f'[data-discovery=hide][data-id="{first}"]').click()
   await expect(page.locator(f'.for-you-card [data-id="{first}"]')).to_have_count(0)
   await page.click('[data-discovery=restore]');await expect(page.locator(f'[data-discovery=save][data-id="{first}"]')).to_be_visible()
   await page.click('[data-discovery=saved]');await expect(page.locator('.for-you-card')).to_have_count(1)
   await page.reload();await login();await page.click('[data-discovery=saved]');await expect(page.locator('.for-you-card')).to_have_count(1)
   await page.click('.discovery-goal summary');await page.click('[data-discovery=start]')
   await expect(page.locator('.discovery-goal progress')).to_have_attribute('value','0')
   start=await page.evaluate("JSON.parse(localStorage.getItem('folkoop-discovery-v1:'+"+json.dumps(UID)+")).goal.start")
   state['results']=[{'id':'44444444-4444-4444-8444-444444444444','cooperation_id':projects[0]['id'],'assignee_id':UID,'title':'Подготовить вопросы к встрече','work_stage':'verified','reviewed_by':OTHER,'reviewed_at':__import__('datetime').datetime.fromtimestamp(start/1000,__import__('datetime').timezone.utc).isoformat()}]
   await page.click('.for-you [data-net=refresh]');await expect(page.locator('.discovery-goal')).to_contain_text('Цель достигнута')
   await expect(page.locator('.discovery-goal progress')).to_have_attribute('value','1')
   await page.locator('.for-you').screenshot(path=str(OUT/f'discovery-{width}-{theme}.png'))
   state['unavailable']=True;await page.click('.for-you [data-net=refresh]')
   await expect(page.locator('.discovery-goal')).to_contain_text('Обнови данные');await expect(page.locator('.discovery-goal progress')).to_have_count(0)
   state['unavailable']=False
   await page.reload();await login();await expect(page.locator('.discovery-goal progress')).to_have_attribute('value','1')
   await page.click('[data-discovery=saved]');await page.click('[data-discovery=clear-saved]');await expect(page.locator('.for-you-card')).to_have_count(0)
   state['uid']=OTHER;await page.reload();await login();await page.click('[data-discovery=saved]')
   await expect(page.locator('.for-you-card')).to_have_count(0);await expect(page.locator('.discovery-goal summary')).to_be_visible()
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   assert state['writes']==[],state['writes']
   assert any('assignee_id=eq.'+UID in q and 'reviewed_by' in q for q in state['queries'])
   assert errors==[],errors
   print(f'PASS {width}/{theme}: finite pages, save/reload, hide/restore, scope, verified goal, partial data, zero writes')
   await ctx.close()
  await browser.close()
asyncio.run(main())
