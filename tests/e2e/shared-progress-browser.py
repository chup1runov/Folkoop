"""Shared progress reads existing contracts; no live writes or fixture mutation through UI."""
import asyncio,json,os,shutil
from datetime import datetime,timedelta,timezone
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4507/');API='https://abcdefghijklmnopqrst.supabase.co'
A='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';B='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';P='cccccccc-cccc-4ccc-8ccc-cccccccccccc';Q='dddddddd-dddd-4ddd-8ddd-dddddddddddd';T='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';O='ffffffff-ffff-4fff-8fff-ffffffffffff'
OUT=Path(os.getenv('QA_OUTPUT','/tmp/shared-progress-qa'));OUT.mkdir(parents=True,exist_ok=True)
async def main():
 async with async_playwright() as pw:
  browser=await pw.webkit.launch() if os.getenv('BROWSER_ENGINE')=='webkit' else await pw.chromium.launch(executable_path=shutil.which('chromium'))
  for width,theme in [(320,'dark'),(1366,'light')]:
   now=datetime.now(timezone.utc);stamp=lambda minutes:(now+timedelta(minutes=minutes)).isoformat()
   terms={'version':2,'starts_at':stamp(60),'ends_at':stamp(120),'minimum_attendees':2,'capacity':2,'facilitator_id':A,'opener_id':B,'place':'Synthetic room','conditions':'Discussion'}
   responses=[{'user_id':uid,'role':role,'version':2,'confirmed':True} for uid,role in [(A,'attendee'),(B,'attendee'),(A,'facilitator'),(B,'opener')]]
   state={'room':True,'ended':False,'reports':[],'resultState':'unreported','fail':False,'collected':False,'stage':'confirming'}
   ctx=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':width,'height':844},color_scheme=theme)
   await ctx.add_init_script("localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done');localStorage.setItem('folkoop-theme',"+json.dumps(theme)+")")
   async def routing(route):
    url=route.request.url;result=[]
    if url.endswith('/network-config.js'):
     await route.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps({'enabled':True,'url':API,'publishableKey':'sb_publishable_synthetic_test_only'})+';',content_type='application/javascript');return
    if not url.startswith(API):await route.continue_();return
    if url.endswith('/verify'):result={'access_token':'synthetic-only','expires_in':3600}
    elif url.endswith('/user'):result={'id':A}
    elif url.endswith('/fk_claim_pilot_invite'):result=True
    elif '/fk_profiles?' in url:result=[{'id':A,'name':'Alice','listed':True},{'id':B,'name':'Bob','listed':True}]
    elif '/fk_cooperations?' in url:result=[{'id':P,'owner_id':A,'kind':'project','title':'Shared Swedish meeting','description':'Test project','status':'active'},{'id':Q,'owner_id':B,'kind':'purchase','title':'Shared apples','description':'Test purchase','status':'active','target_quantity':3,'unit':'kg'}]
    elif '/fk_cooperation_members?' in url:result=[{'cooperation_id':cid,'user_id':uid,'role':'member'} for cid in [P,Q] for uid in [A,B]]
    elif url.endswith('/fk_meeting_ready_snapshot'):
     if state['fail']:await route.fulfill(status=503,body='{}',content_type='application/json');return
     result={'terms':terms,'current':not state['ended'],'people_confirmed':True,'attendee_count':2,'responses':responses,'room':{'confirmed':state['room']},'budget':{'configured':True,'version':2,'ready':True,'requirements':[],'rows':[]},'checked_at':stamp(0)}
    elif url.endswith('/fk_meeting_outcome_snapshot'):result={'version':2,'ended':state['ended'],'can_report':False,'state':state['resultState'],'reports':state['reports']}
    elif url.endswith('/fk_project_decisions'):result={'decisions':[],'responses':[]}
    elif url.endswith('/fk_project_budget_snapshot'):result={'needs':[],'contributions':[],'expenses':[]}
    elif '/fk_project_tasks?' in url:result=[{'id':T,'cooperation_id':P,'assignee_id':A,'creator_id':A,'title':'Prepare discussion cards','details':'','status':'done','work_stage':'verified','reviewed_by':B,'reviewed_at':stamp(-10)}]
    elif '/fk_purchase_offers?' in url:result=[{'id':O,'cooperation_id':Q,'provider_id':B,'unit_price':20,'currency':'SEK','min_quantity':3,'available_quantity':10,'valid_until':stamp(120)}]
    elif '/fk_purchase_offer_choice?' in url:result=[{'cooperation_id':Q,'offer_id':O,'selected_by':B}]
    elif '/fk_purchase_commitments?' in url:result=[{'cooperation_id':Q,'user_id':uid,'quantity':q} for uid,q in [(A,1),(B,2)]]
    elif '/fk_purchase_process?' in url:result=[{'cooperation_id':Q,'stage':state['stage'],'result_note':'Organiser report' if state['stage']=='done' else ''}]
    elif '/fk_purchase_confirmations?' in url:result=[{'cooperation_id':Q,'user_id':uid,'quantity':q,'decision':'confirmed','collected_at':stamp(-1) if state['collected'] else None} for uid,q in [(A,1),(B,2)]]
    headers={'access-control-expose-headers':'content-range'}
    if isinstance(result,list):headers['content-range']=f'0-{max(0,len(result)-1)}/{len(result)}'
    await route.fulfill(body=json.dumps(result),content_type='application/json',headers=headers)
   await ctx.route('**/*',routing);page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'#/me');await page.fill('#netLogin [name=email]','synthetic@example.test');await page.click('#netLogin [value=code]');await page.fill('#netLogin [name=code]','123456');await page.check('#netLogin [name=policyAccepted]');await page.click('#netLogin [value=verify]')
   await page.locator(f'.for-you-card [data-home=openCoop][data-id="{P}"]').click()
   panel=page.locator('[data-shared-progress]');await expect(panel).to_be_visible()
   await expect(panel.locator('[data-shared-key=people]')).to_have_attribute('data-shared-state','done')
   await panel.locator('[data-shared-key=tasks] summary').click();await expect(panel).to_contain_text('Твой вклад');await expect(panel).to_contain_text('Bob')
   await panel.locator('[data-shared-step=tasks]').click();await expect(page.locator('[data-coop-section=tasks]')).to_have_attribute('open','')
   state['room']=False;await page.locator('[data-coop=meetingRefresh]').first.click();await expect(panel.locator('[data-shared-key=room]')).to_have_attribute('data-shared-state','pending')
   await panel.locator('.shared-progress-next [data-shared-step=meeting]').click();assert await page.locator('#meetingConfirmTitle').evaluate('(n)=>n===document.activeElement')
   terms['starts_at']=stamp(-120);terms['ends_at']=stamp(-60);state['ended']=True;state['resultState']='participant_confirmed';state['reports']=[{'user_id':uid,'version':2,'result':'held'} for uid in [A,B]]
   await page.locator('[data-coop=meetingRefresh]').first.click();await expect(panel.locator('[data-shared-key=outcome]')).to_have_attribute('data-shared-state','done');assert await panel.locator('.shared-progress-next').count()==0
   state['resultState']='unclear';state['reports'][1]['result']='not_held';await page.locator('[data-coop=meetingRefresh]').first.click();await expect(panel.locator('[data-shared-key=outcome]')).to_have_attribute('data-shared-state','disputed')
   state['fail']=True;await page.locator('[data-coop=meetingRefresh]').first.click();await expect(panel).to_contain_text('Нужно обновить данные')
   await page.locator('[data-coop=back]').click();await page.locator('#mobilePrimaryNav a[href="#/together"]').click();await page.locator(f'[data-coop=open][data-id="{Q}"]').click()
   await expect(panel.locator('[data-shared-key=quantity]')).to_have_attribute('data-shared-state','done');await expect(panel.locator('[data-shared-key=collection]')).to_have_attribute('data-shared-state','pending')
   await panel.locator('[data-shared-key=consent] summary').click();await panel.locator('[data-shared-key=consent] [data-shared-step]').click();await expect(page.locator('[data-coop-section=purchase-progress]')).to_have_attribute('open','')
   state['stage']='done';state['collected']=True;await page.locator('[data-net=refresh]').first.click()
   await expect(panel.locator('[data-shared-key=collection]')).to_have_attribute('data-shared-state','done');await expect(panel.locator('[data-shared-key=purchase-result]')).to_have_attribute('data-shared-state','reported')
   # Viewport screenshot after normal scrolling, no sticky overlays across a full element capture.
   await panel.scroll_into_view_if_needed();await page.screenshot(path=str(OUT/f'shared-progress-{width}-{theme}.png'))
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');assert errors==[],errors
   print(f'PASS {width}/{theme}: confirmed team, named review, navigation, revoked room, outcome agreement/disagreement, unavailable data, purchase receipts vs organiser report')
   await ctx.close()
  await browser.close()
asyncio.run(main())
