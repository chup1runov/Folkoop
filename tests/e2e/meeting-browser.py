"""Synthetic HTTP/UI contract. SQL tests independently verify real authorization."""
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
  browser=await pw.webkit.launch() if ENGINE=='webkit' else await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  state={'terms':None,'responses':[],'writes':[],'fail':False,'reports':[],'ended':False,'next':None}
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
    elif '/fk_cooperation_members?' in url:result=[{'cooperation_id':P,'user_id':x,'role':'owner' if x==A else 'member'} for x in [A,B]]+([{'cooperation_id':N,'user_id':A,'role':'owner'}] if state['next'] else [])
    elif url.endswith('/fk_meeting_snapshot'):
     result={'terms':state['terms'],'responses':state['responses'],'current':True,'people_confirmed':False,'attendee_count':sum(x['confirmed'] and x['role']=='attendee' for x in state['responses']),'checked_at':datetime.now(timezone.utc).isoformat()}
     if v['p_cooperation']==N:result.update(terms=state['next'],responses=[],attendee_count=0)
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
     state['responses']=[x for x in state['responses'] if not(x['user_id']==uid and x['role']==v['p_role'])]+[{'user_id':uid,'role':v['p_role'],'confirmed':v['p_confirm']}];result=None
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
   await page.goto(BASE+'?intro=0#/projects')
   # goto only changes hash here, retaining in-memory session.
   await page.locator('[data-coop="open"][data-id="'+P+'"]').click()
   await expect(page.locator('#meetingConfirmTitle')).to_be_visible()
   return context,page,errors
  context,page,errors=await session(A,1280)
  form=page.locator('#netMeetingTerms')
  await form.locator('[name=start]').fill('2099-10-20T18:00')
  await form.locator('[name=end]').fill('2099-10-20T19:00')
  await form.locator('[name=offset]').select_option('+02:00')
  await form.locator('[name=endOffset]').select_option('+02:00')
  await form.locator('[name=place]').fill('Synthetic room <img src=x>')
  await form.locator('[name=conditions]').fill('Free. Ask Bob about access.')
  await form.locator('[name=minimum]').fill('2')
  await form.locator('[name=capacity]').fill('4')
  await form.locator('[name=facilitator]').select_option(B)
  await form.locator('[name=opener]').select_option(B)
  await form.locator('button').click()
  await expect(page.locator('#netStatus')).to_contain_text('Сохранено')
  assert state['terms']['version']==1 and state['responses']==[]
  assert await page.locator('.netMeetingResponse').count()==1
  assert await page.locator('.meeting-confirmations img').count()==0
  await page.locator('.netMeetingResponse button').click()
  await expect(page.locator('.netMeetingResponse button')).to_have_text('Отозвать')
  assert state['writes'][-1]=={'p_cooperation':P,'p_version':1,'p_role':'attendee','p_confirm':True}
  assert not errors,errors
  await context.close()
  context,page,errors=await session(B,390)
  assert await page.locator('#netMeetingTerms').count()==0
  await expect(page.locator('.meeting-confirmations')).to_contain_text('Перед принятием роли')
  await page.locator('.netMeetingResponse button').click()
  await expect(page.locator('.netMeetingResponse')).to_have_count(3)
  facilitator=page.locator('.netMeetingResponse').filter(has=page.locator('[name=role][value=facilitator]'))
  await facilitator.locator('button').click()
  await expect(facilitator.locator('button')).to_have_text('Отозвать')
  opener=page.locator('.netMeetingResponse').filter(has=page.locator('[name=role][value=opener]'))
  await opener.locator('button').click()
  await expect(opener.locator('button')).to_have_text('Отозвать')
  assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  await page.screenshot(path=str(OUT/f'meeting-{ENGINE}-mobile.png'),full_page=True)
  state['fail']=True
  await opener.locator('button').click()
  await expect(page.locator('#netStatus')).to_contain_text('Не удалось')
  assert await page.locator('.netMeetingResponse').count()==0
  state['fail']=False
  await page.locator('[data-coop=meetingRefresh]').click()
  await expect(page.locator('.netMeetingResponse')).to_have_count(3)
  assert not errors,errors
  # Time elapsing alone must not invent a result.
  state['ended']=True;state['terms']['starts_at']='2020-01-01T10:00:00Z';state['terms']['ends_at']='2020-01-01T11:00:00Z'
  await page.locator('[data-coop=meetingRefresh]').click()
  await expect(page.locator('.meeting-outcome')).to_contain_text('Итог ещё не указан')
  await page.select_option('#netMeetingOutcome [name=result]','held')
  await page.fill('#netMeetingOutcome [name=note]','Practice <img src=x>')
  await page.locator('#netMeetingOutcome button').first.click()
  await expect(page.locator('.meeting-outcome')).to_contain_text('Сообщения участников')
  assert await page.locator('.meeting-outcome img').count()==0
  assert await page.locator('#netMeetingRepeat').count()==0
  owner_context,owner_page,owner_errors=await session(A,1280)
  await owner_page.select_option('#netMeetingOutcome [name=result]','held')
  await owner_page.locator('#netMeetingOutcome button').first.click()
  await expect(owner_page.locator('.meeting-outcome')).to_contain_text('Подтверждено организатором')
  await page.locator('[data-coop=meetingRefresh]').click()
  await expect(page.locator('.meeting-outcome')).to_contain_text('Подтверждено организатором')
  await page.select_option('#netMeetingOutcome [name=result]','not_held')
  await page.locator('#netMeetingOutcome button').first.click()
  await expect(page.locator('.meeting-outcome')).to_contain_text('Ответы расходятся')
  await page.locator('#netMeetingOutcome [value=withdrawn]').click()
  await expect(page.locator('.meeting-outcome')).to_contain_text('Сообщения участников')
  assert len(state['reports'])==1 and state['reports'][0]['user_id']==A
  await owner_page.locator('[data-coop=meetingRefresh]').click()
  await owner_page.locator('.meeting-outcome summary').click()
  repeat=owner_page.locator('#netMeetingRepeat')
  assert await repeat.locator('[name=start]').input_value()==''
  await repeat.locator('[name=start]').fill('2099-10-20T18:00')
  await repeat.locator('[name=end]').fill('2099-10-20T19:00')
  await repeat.locator('[name=offset]').select_option('+02:00')
  await repeat.locator('[name=endOffset]').select_option('+02:00')
  await repeat.locator('button').click()
  await expect(owner_page.locator('.meeting-outcome')).to_contain_text('Предыдущая встреча')
  await expect(owner_page.locator('.netMeetingResponse button')).to_have_text('Я приду')
  assert state['writes'][-1]=={'p_cooperation':P,'p_version':1,'p_starts_at':'2099-10-20T16:00:00.000Z','p_ends_at':'2099-10-20T17:00:00.000Z'}
  assert await owner_page.locator('#netMeetingOutcome').count()==0
  await owner_page.locator('.meeting-outcome [data-id="'+P+'"]').click()
  await expect(owner_page.locator('.meeting-outcome')).to_contain_text('Открыть следующую встречу')
  assert not errors+owner_errors,errors+owner_errors
  await owner_page.screenshot(path=str(OUT/f'meeting-outcome-{ENGINE}.png'),full_page=True)
  await owner_context.close();await context.close();await browser.close()
  print('PASS organizer proposals, self attendance/roles, escaped terms, stale response recovery and mobile geometry ('+ENGINE+')')
  print('PASS two-account outcome, disagreement, withdrawal, repeat with blank dates/no consent, previous/next links ('+ENGINE+')')
asyncio.run(main())
