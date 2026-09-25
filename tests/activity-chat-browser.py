"""FOLKOOP v0.21 browser contract: linked work chat, activity inbox and unread badges.
All API responses are synthetic; no live account or message is created.
"""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Sverinav/')
API='https://abcdefghijklmnopqrst.supabase.co'
UID='11111111-1111-4111-8111-111111111111'
OTHER='22222222-2222-4222-8222-222222222222'
PROJECT='33333333-3333-4333-8333-333333333333'
CHAT='44444444-4444-4444-8444-444444444444'
MSG='55555555-5555-4555-8555-555555555555'
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True)

async def main():
 passed=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  context=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':390,'height':844})
  state={
   'profile':[], 'cooperations':[], 'coop_members':[], 'coop_chats':[],
   'activity':[], 'activity_inbox':[], 'chats':[], 'chat_members':[],
   'chat_inbox':[], 'messages':[], 'requests':[]
  }
  other={'id':OTHER,'name':'Synthetic Member','skills':'Design','about':'Test only','listed':True}

  async def routing(route):
   url=route.request.url
   if url.endswith('/network-config.js'):
    await route.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps({'enabled':True,'url':API,'publishableKey':'sb_publishable_example_for_tests_only'})+';',content_type='application/javascript');return
   if not url.startswith(API):
    await route.continue_();return
   payload=route.request.post_data_json if route.request.post_data else {}
   state['requests'].append((url,payload));result=[]

   if url.endswith('/verify'):result={'access_token':'synthetic-activity','expires_in':3600}
   elif url.endswith('/user'):result={'id':UID}
   elif url.endswith('/fk_claim_first_pilot'):result=True
   elif url.endswith('/fk_save_profile'):
    state['profile']=[{'id':UID,'name':payload['p_name'],'skills':payload['p_skills'],'about':payload['p_about'],'listed':payload['p_listed']}];result=None
   elif url.endswith('/fk_create_cooperation'):
    state['cooperations']=[{'id':PROJECT,'owner_id':UID,'kind':'project','title':payload['p_title'],'description':payload['p_description'],'location_text':payload['p_location'],'status':'open','target_quantity':None,'unit':'','created_at':'2026-09-25T16:00:00Z','updated_at':'2026-09-25T16:00:00Z'}]
    state['coop_members']=[{'cooperation_id':PROJECT,'user_id':UID,'role':'owner','joined_at':'2026-09-25T16:00:00Z'}]
    state['coop_chats']=[{'cooperation_id':PROJECT,'conversation_id':CHAT,'created_at':'2026-09-25T16:00:00Z'}]
    state['chats']=[{'id':CHAT,'kind':'group','owner_id':UID,'title':payload['p_title'][:80],'created_at':'2026-09-25T16:00:00Z'}]
    state['chat_members']=[{'conversation_id':CHAT,'user_id':UID,'role':'owner','joined_at':'2026-09-25T16:00:00Z','last_read_at':'2026-09-25T16:00:00Z'}]
    state['activity']=[{'id':1,'cooperation_id':PROJECT,'actor_id':UID,'subject_id':PROJECT,'event_type':'created','label':payload['p_title'],'created_at':'2026-09-25T16:00:00Z'}]
    state['activity_inbox']=[{'cooperation_id':PROJECT,'cooperation_kind':'project','cooperation_title':payload['p_title'],'unread_count':0,'last_activity_at':'2026-09-25T16:00:00Z','last_event_type':'created','last_actor_id':UID,'last_label':payload['p_title']}]
    state['chat_inbox']=[{'conversation_id':CHAT,'unread_count':0,'last_message_at':None,'linked_cooperation_id':PROJECT}]
    result=PROJECT
   elif url.endswith('/fk_mark_cooperation_read'):
    for x in state['activity_inbox']:
     if x['cooperation_id']==payload['p_cooperation']:x['unread_count']=0
    result=None
   elif url.endswith('/fk_mark_chat_read'):
    for x in state['chat_inbox']:
     if x['conversation_id']==payload['p_conversation']:x['unread_count']=0
    for m in state['chat_members']:
     if m['conversation_id']==payload['p_conversation'] and m['user_id']==UID:m['last_read_at']='2026-09-25T16:05:00Z'
    result=None
   elif '/fk_profiles?' in url:
    if 'id=eq.'+UID in url:result=state['profile']
    elif 'listed=eq.true' in url:result=state['profile']+[other]
    else:result=state['profile']+[other]
   elif '/fk_cooperations?' in url:result=state['cooperations']
   elif '/fk_cooperation_members?' in url:result=state['coop_members']
   elif '/fk_cooperation_chats?' in url:result=state['coop_chats']
   elif '/fk_cooperation_activity?' in url:result=state['activity']
   elif url.endswith('/rpc/fk_activity_inbox'):result=state['activity_inbox']
   elif url.endswith('/rpc/fk_chat_inbox'):result=state['chat_inbox']
   elif '/fk_conversations?' in url:result=state['chats']
   elif '/fk_conversation_members?' in url:result=state['chat_members']
   elif '/fk_messages?' in url:result=state['messages']
   elif any(x in url for x in ['/fk_communities?','/fk_memberships?','/fk_blocks?','/fk_conversation_invites?','/fk_cooperation_updates?','/fk_project_tasks?']):
    result=[]
   await route.fulfill(body=json.dumps(result),content_type='application/json')

  await context.route('**/*',routing)
  page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE+'#/me')
  await page.fill('#netLogin [name=email]','synthetic@example.test')
  await page.fill('#netLogin [name=code]','123456')
  await page.click('#netLogin [value=verify]')
  await page.fill('#netProfile [name=name]','Synthetic Owner')
  await page.check('#netProfile [name=listed]')
  await page.click('#netProfile button')

  await page.click('#nav a[href="#/projects"]')
  await page.fill('#netCoopCreate [name=title]','Shared Workshop')
  await page.fill('#netCoopCreate [name=description]','Linked chat test')
  await page.click('#netCoopCreate button')
  await expect(page.locator('[data-coop=openLinkedChat]')).to_be_visible()
  await expect(page.locator('#networkPanel')).to_contain_text('Активность')
  passed.append('Project creation exposes its automatically linked work chat and activity journal')

  # Return to list, then simulate events created by another participant.
  await page.click('[data-coop=back]')
  state['coop_members'].append({'cooperation_id':PROJECT,'user_id':OTHER,'role':'member','joined_at':'2026-09-25T16:01:00Z'})
  state['chat_members'].append({'conversation_id':CHAT,'user_id':OTHER,'role':'member','joined_at':'2026-09-25T16:01:00Z','last_read_at':None})
  state['activity']=[
   {'id':3,'cooperation_id':PROJECT,'actor_id':OTHER,'subject_id':OTHER,'event_type':'update_posted','label':'Progress from another member','created_at':'2026-09-25T16:03:00Z'},
   {'id':2,'cooperation_id':PROJECT,'actor_id':OTHER,'subject_id':OTHER,'event_type':'member_joined','label':'','created_at':'2026-09-25T16:02:00Z'},
  ]+state['activity']
  state['activity_inbox'][0].update({'unread_count':2,'last_activity_at':'2026-09-25T16:03:00Z','last_event_type':'update_posted','last_actor_id':OTHER,'last_label':'Progress from another member'})
  state['messages']=[{'id':MSG,'conversation_id':CHAT,'author_id':OTHER,'body':'Unread work-chat message','created_at':'2026-09-25T16:04:00Z'}]
  state['chat_inbox'][0].update({'unread_count':1,'last_message_at':'2026-09-25T16:04:00Z'})

  await page.click('[data-net=refresh]')
  await expect(page.locator('#nav a[href="#/projects"] .net-count')).to_have_text('2')
  await expect(page.locator('#messageLink .net-count')).to_have_text('1')
  await expect(page.locator('#networkPanel .net-count').first).to_have_text('2')
  passed.append('Activity and chat unread counts are independent and visible in navigation')

  await page.click('#nav a[href="#/me"]')
  await expect(page.locator('#networkPanel')).to_contain_text('Progress from another member')
  await expect(page.locator('#networkPanel')).to_contain_text('Shared Workshop')
  passed.append('My page surfaces in-app cooperation activity notifications')

  await page.click('[data-coop=openNotify]')
  await expect(page.locator('#networkPanel')).to_contain_text('Progress from another member')
  assert state['activity_inbox'][0]['unread_count']==0
  await expect(page.locator('#nav a[href="#/projects"] .net-count')).to_have_count(0)
  passed.append('Opening the cooperation marks its activity read on the server')

  await page.click('[data-coop=openLinkedChat]')
  await expect(page.locator('#networkPanel')).to_contain_text('Unread work-chat message')
  await expect(page.locator('#networkPanel')).to_contain_text('Рабочий чат')
  assert state['chat_inbox'][0]['unread_count']==0
  await expect(page.locator('#messageLink .net-count')).to_have_count(0)
  passed.append('Opening the linked work chat marks message unread separately')

  assert errors==[],errors
  await context.close();await browser.close()

 OUT.joinpath('activity-chat-ui-results.json').write_text(json.dumps({'passed':passed,'limits':['Synthetic API; no push/realtime transport','Unread changes require explicit refresh/open in this version']},ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+p for p in passed))

asyncio.run(main())
