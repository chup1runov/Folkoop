"""Newcomer browser HTTP contract; hosted rollback SQL independently checks real authorization.
No real mail, accounts or project data are created by this test.
"""
import asyncio,json,os,shutil
from datetime import datetime,timezone
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4186/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium')
API='https://abcdefghijklmnopqrst.supabase.co'
A='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
B='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
P='cccccccc-cccc-4ccc-8ccc-cccccccccccc'
N='dddddddd-dddd-4ddd-8ddd-dddddddddddd'
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(parents=True,exist_ok=True)
async def main():
 async with async_playwright() as pw:
  browser=await pw.webkit.launch() if ENGINE=='webkit' else await pw.chromium.launch(executable_path=os.getenv('CHROMIUM_EXECUTABLE') or shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  read_event=asyncio.Event()
  state={'terms':None,'responses':[],'writes':[],'fail':False,'reports':[],'ended':False,'next':None,'nextResponses':[],'joined':False,'inbox':[]}
  async def session(uid,width):
   context=await browser.new_context(service_workers='block',viewport={'width':width,'height':844},locale='ru-RU')
   await context.add_init_script("localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done');sessionStorage.setItem('folkoop-entry-mode-v1','account');localStorage.setItem('folkoop-intro-seen','1');")
   async def route(req):
    url=req.request.url
    if url.endswith('/network-config.js'):
     await req.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps({'enabled':True,'url':API,'publishableKey':'sb_publishable_synthetic_test_only'})+';',content_type='application/javascript');return
    if not url.startswith(API):await req.continue_();return
    v=req.request.post_data_json if req.request.post_data else {};result=[]
    if url.endswith('/verify'):result={'access_token':'synthetic-only','expires_in':3600}
    elif url.endswith('/user'):result={'id':uid}
    elif url.endswith('/fk_claim_pilot_invite'):result=True
    elif '/fk_profiles?' in url:result=[{'id':x,'name':'Alice' if x==A else 'Bob','skills':'','about':'','listed':True} for x in [A,B]]
    elif '/fk_cooperations?' in url:result=[{'id':x,'owner_id':A,'kind':'project','title':'Synthetic Swedish meeting','description':'Synthetic only','status':'open','location_text':'Göteborg'} for x in ([P,N] if state['next'] else [P])]
    elif '/fk_cooperation_members?' in url:result=[{'cooperation_id':P,'user_id':x,'role':'owner' if x==A else 'member'} for x in ([A,B] if state['joined'] else [A])]+([{'cooperation_id':N,'user_id':A,'role':'owner'}] if state['next'] else [])
    elif url.endswith('/fk_search_account'):result=[{'key':'cooperation:'+P,'kind':'project','id':P,'parent_id':P,'title':'Synthetic Swedish meeting','body':'Synthetic only','route':'projects'}]
    elif url.endswith('/fk_join_cooperation'):
     assert uid==B and v['p_cooperation']==P
     state['joined']=True;result=None
    elif url.endswith('/fk_activity_inbox'):result=state['inbox'] if uid==B else []
    elif url.endswith('/fk_mark_cooperation_read'):
     if uid==B:
      for item in state['inbox']:item['unread_count']=0
      read_event.set()
     result=None
    elif url.endswith('/fk_meeting_ready_snapshot'):
     result={'terms':state['terms'],'responses':state['responses'],'current':True,'people_confirmed':False,'attendee_count':sum(x['confirmed'] and x['role']=='attendee' for x in state['responses']),'checked_at':datetime.now(timezone.utc).isoformat()}
     if v['p_cooperation']==N:result.update(terms=state['next'],responses=state['nextResponses'],attendee_count=len(state['nextResponses']))
    elif url.endswith('/fk_meeting_outcome_snapshot'):
     reports=state['reports'];kinds=set(x['result'] for x in reports)
     status='unreported' if not reports else 'unclear' if len(kinds)>1 or 'unsure' in kinds else 'participant_confirmed' if len(reports)>1 and kinds=={'held'} else 'self_reported'
     result={'version':state['terms']['version'] if state['terms'] else None,'ended':state['ended'],'can_report':state['ended'],'state':status,'reports':reports,'next_id':N if state['next'] else None}
     if v['p_cooperation']==N:result.update(version=1,ended=False,can_report=False,state='unreported',reports=[],next_id=None,previous_id=P)
    elif url.endswith('/fk_report_meeting_outcome'):
     state['writes'].append(v);state['reports']=[r for r in state['reports'] if r['user_id']!=uid]
     if v['p_result']!='withdrawn':state['reports'].append({'user_id':uid,'result':v['p_result'],'note':v['p_note']})
     result=None
    elif url.endswith('/fk_repeat_meeting'):
     state['writes'].append(v);state['next']={**state['terms'],'version':1,'starts_at':v['p_starts_at'],'ends_at':v['p_ends_at'],'facilitator_id':None,'opener_id':None};result=N
    elif url.endswith('/fk_save_meeting_terms'):
     state['writes'].append(v)
     state['terms']={'version':v['p_expected_version']+1,'starts_at':v['p_starts_at'],'ends_at':v['p_ends_at'],'place':v['p_place'],'conditions':v['p_conditions'],'minimum_attendees':v['p_minimum'],'capacity':v['p_capacity'],'facilitator_id':v['p_facilitator'],'opener_id':v['p_opener']};state['responses']=[];result=state['terms']['version']
    elif url.endswith('/fk_respond_meeting'):
     state['writes'].append(v)
     if state['fail']:
      await req.fulfill(status=409,body=json.dumps({'message':'MEETING_VERSION_CONFLICT'}),content_type='application/json');return
     key='nextResponses' if v['p_cooperation']==N else 'responses'
     state[key]=[x for x in state[key] if not(x['user_id']==uid and x['role']==v['p_role'])]+[{'user_id':uid,'role':v['p_role'],'confirmed':v['p_confirm']}];result=None
    await req.fulfill(body=json.dumps(result),content_type='application/json')
   await context.route('**/*',route)
   page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'?intro=0#/me')
   await page.fill('#netLogin [name=email]','synthetic@example.test')
   await page.click('#netLogin [value=code]')
   await page.fill('#netLogin [name=code]','123456')
   await page.check('#netLogin [name=policyAccepted]')
   await page.click('#netLogin [value=verify]')
   await expect(page.locator('#netProfile')).to_be_visible()
   if uid==A:
    await page.evaluate("location.hash='#/projects'")
    await page.locator('[data-coop="open"][data-id="'+P+'"]').click()
   else:
    await page.locator('#globalSearchButton').click()
    await page.locator('#accountSearchInput').fill('Synthetic Swedish')
    await page.locator('[data-search-result]').filter(has_text='Synthetic Swedish meeting').first.click()
    await expect(page.locator('[data-coop=join]')).to_be_visible()
    assert await page.locator('.netMeetingResponse').count()==0
    await page.locator('[data-coop=join]').click()
    assert state['joined'] and state['responses']==[]
   await expect(page.locator('#meetingConfirmTitle')).to_be_visible()
   return context,page,errors
  for width in [1366,390]:
   state.update(joined=False,responses=[],inbox=[])
   state['terms']={'version':1,'starts_at':'2099-10-20T16:00:00Z','ends_at':'2099-10-20T17:00:00Z','place':'Synthetic room','conditions':'Test only','minimum_attendees':1,'capacity':5,'facilitator_id':None,'opener_id':None}
   context,page,errors=await session(B,width)
   # Organizer proposes a role after membership; this fixture does not confirm it.
   state['terms'].update(version=2,facilitator_id=B)
   await page.locator('[data-coop=meetingRefresh]').click()
   await expect(page.locator('.netMeetingResponse')).to_have_count(1)
   await page.locator('.netMeetingResponse button').click()
   facilitator=page.locator('.netMeetingResponse').filter(has=page.locator('[name=role][value=facilitator]'))
   await facilitator.locator('button').click()
   await expect(facilitator.locator('button')).to_have_text('Отозвать')
   assert state['writes'][-1]=={'p_cooperation':P,'p_version':2,'p_role':'facilitator','p_confirm':True}
   state['inbox']=[{'cooperation_id':P,'cooperation_kind':'project','cooperation_title':'Synthetic Swedish meeting','unread_count':1,'last_activity_at':datetime.now(timezone.utc).isoformat(),'last_event_type':'update_posted','last_actor_id':A,'last_label':'Synthetic meeting update'}]
   await page.evaluate("location.hash='#/me'")
   await expect(page.locator('#networkPanel')).to_contain_text('Synthetic meeting update')
   read_event.clear()
   await page.locator('[data-coop=openNotify][data-id="'+P+'"]').click()
   await expect(page.locator('#meetingConfirmTitle')).to_be_visible()
   await asyncio.wait_for(read_event.wait(),10)
   assert state['inbox'][0]['unread_count']==0
   await expect(page.locator('#mobilePrimaryNav a[href="#/together"] .net-count')).to_have_count(0)
   assert not errors,errors
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   await page.screenshot(path=str(OUT/f'newcomer-{width}.png'),full_page=False)
   print(f'PASS {width}: search -> join without consent -> attendance -> own offered role -> in-app update -> open/read')
   await context.close()
  await browser.close()
asyncio.run(main())
