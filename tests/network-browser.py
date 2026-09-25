"""HTTP/UI contract checks with synthetic Supabase responses. Not a live Auth test.
Database authorization is independently checked by network-rls.sql on PostgreSQL.
"""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Sverinav/')
API='https://abcdefghijklmnopqrst.supabase.co'
UID='11111111-1111-4111-8111-111111111111'
CID='22222222-2222-4222-8222-222222222222'
PID='33333333-3333-4333-8333-333333333333'
OTHER='44444444-4444-4444-8444-444444444444'
CHAT='55555555-5555-4555-8555-555555555555'
MSG='66666666-6666-4666-8666-666666666666'
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True)
async def main():
 passed=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  context=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':390,'height':844})
  async def disabled_config(route):
   if route.request.url.endswith('/network-config.js'):
    await route.fulfill(body='globalThis.FolkoopNetworkConfig={enabled:false,url:\'\',publishableKey:\'\'};',content_type='application/javascript');return
   await route.continue_()
  await context.route('**/*',disabled_config)
  page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE+'#/me')
  await expect(page.locator('#networkPanel')).to_contain_text('Сервер ещё не подключён')
  assert await page.locator('#netLogin').count()==0
  passed.append('Disabled backend does not fake sign-in or interrupt local My page')
  await context.close()
  state={'profile':[],'groups':[],'members':[],'posts':[],'requests':[],'fail_post':False,'chats':[],'chat_members':[],'chat_invites':[],'chat_messages':[],'other_profile':{'id':OTHER,'name':'Synthetic Bob','skills':'Design','about':'Pilot tester','listed':True}}
  context=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':390,'height':844})
  async def routing(route):
   url=route.request.url
   if url.endswith('/network-config.js'):
    await route.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps({'enabled':True,'url':API,'publishableKey':'sb_publishable_example_for_tests_only'})+';',content_type='application/javascript');return
   if url.startswith(API):
    payload=route.request.post_data_json if route.request.post_data else {}
    state['requests'].append((url,payload));result=[]
    if url.endswith('/verify'):result={'access_token':'synthetic-only','expires_in':3600}
    elif url.endswith('/user'):result={'id':UID}
    elif url.endswith('/fk_claim_first_pilot'):result=True
    elif url.endswith('/fk_save_profile'):
     state['profile']=[{'id':UID,'name':payload['p_name'],'skills':payload['p_skills'],'about':payload['p_about'],'listed':payload['p_listed']}];result=None
    elif url.endswith('/fk_create_community'):
     state['groups']=[{'id':CID,'owner_id':UID,'name':payload['p_name'],'description':payload['p_description']}]
     state['members']=[{'user_id':UID,'community_id':CID,'banned':False}];result=CID
    elif url.endswith('/fk_start_direct'):
     state['chats']=[{'id':CHAT,'kind':'direct','owner_id':None,'title':'','created_at':'2026-09-25T10:00:00Z'}]
     state['chat_members']=[{'conversation_id':CHAT,'user_id':UID,'role':'member','joined_at':'2026-09-25T10:00:00Z','last_read_at':None},{'conversation_id':CHAT,'user_id':OTHER,'role':'member','joined_at':'2026-09-25T10:00:00Z','last_read_at':None}]
     result=CHAT
    elif url.endswith('/fk_send_message'):
     state['chat_messages'].append({'id':MSG,'conversation_id':payload['p_conversation'],'author_id':UID,'body':payload['p_body'],'created_at':'2026-09-25T10:01:00Z'});result=MSG
    elif url.endswith('/fk_mark_chat_read'):
     for m in state['chat_members']:
      if m['conversation_id']==payload['p_conversation'] and m['user_id']==UID:m['last_read_at']='2026-09-25T10:01:30Z'
     result=None
    elif url.endswith('/fk_publish'):
     if state['fail_post']:
      await route.fulfill(status=500,json={'private_error':'must not echo'});return
     state['posts']=[{'id':PID,'author_id':UID,'community_id':CID,'body':payload['p_body']}];result=PID
    elif '/fk_profiles?' in url:
     if 'id=eq.'+UID in url:result=state['profile']
     elif 'listed=eq.true' in url:result=[p for p in state['profile'] if p['listed']]+[state['other_profile']]
     else:result=state['profile']+[state['other_profile']]
    elif '/fk_communities?' in url:result=state['groups']
    elif '/fk_memberships?' in url:result=state['members']
    elif '/fk_posts?' in url:result=state['posts']
    elif '/fk_conversations?' in url:result=state['chats']
    elif '/fk_conversation_members?' in url:result=state['chat_members']
    elif '/fk_conversation_invites?' in url:result=state['chat_invites']
    elif '/fk_messages?' in url:result=state['chat_messages']
    await route.fulfill(body=json.dumps(result),content_type='application/json');return
   await route.continue_()
  await context.route('**/*',routing)
  page=await context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE+'#/me')
  await page.fill('#netLogin [name=email]','synthetic@example.test')
  await page.click('#netLogin [value=code]')
  await expect(page.locator('#netStatus')).to_contain_text('Если адрес разрешён')
  assert state['requests'][0][1]['create_user'] is True
  await page.fill('#netLogin [name=code]','123456')
  await page.click('#netLogin [value=verify]')
  await expect(page.locator('#netProfile')).to_be_visible()
  passed.append('OTP request then Auth verification, not fabricated login')
  await page.fill('#netProfile [name=name]','Synthetic Alice')
  await page.click('#netProfile button')
  await expect(page.locator('#netStatus')).to_contain_text('Сохранено на сервере')
  assert state['profile'][0]['listed'] is False
  assert state['profile'][0]['skills']==''
  assert await page.evaluate("!Object.values(localStorage).some(x=>x.includes('synthetic-only'))")
  passed.append('Private-by-default profile, optional skills and no persistent token')
  await page.click('#nav a[href="#/people"]')
  await page.fill('#netGroup [name=name]','Test workshop')
  await page.fill('#netGroup [name=description]','A synthetic test, not a real community')
  await page.click('#netGroup button')
  await expect(page.locator('#netPost')).to_be_visible()
  await page.fill('#netPost [name=body]','<img src=x onerror=alert(1)> Test post')
  await page.click('#netPost button')
  await expect(page.locator('#networkPanel')).to_contain_text('Test post')
  assert await page.locator('#networkPanel img').count()==0
  passed.append('Group creation and publication use API replies; external text is escaped')
  state['fail_post']=True
  await page.fill('#netPost [name=body]','Retain this unsent text')
  await page.click('#netPost button')
  await expect(page.locator('#netStatus')).to_contain_text('не подтверждено')
  await expect(page.locator('#netPost [name=body]')).to_have_value('Retain this unsent text')
  await page.select_option('#language','en')
  await expect(page.locator('#netPost [name=body]')).to_have_value('Retain this unsent text')
  passed.append('Failed writes and language changes preserve unsent text')
  for width in [320,390,1280]:
   await page.set_viewport_size({'width':width,'height':844})
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  passed.append('Network controls reflow at 320,390,1280px')
  await page.set_viewport_size({'width':390,'height':844})
  await page.select_option('#language','ru')
  await page.click('#messageLink')
  await expect(page.locator('#networkPanel')).to_contain_text('Сообщения')
  await page.select_option('#netDirect [name=other]',OTHER)
  await page.click('#netDirect button')
  await expect(page.locator('#netMessage')).to_be_visible()
  await expect(page.locator('#networkPanel')).to_contain_text('Synthetic Bob')
  await page.fill('#netMessage [name=body]','<img src=x onerror=alert(1)> hello')
  await page.click('#netMessage button')
  await expect(page.locator('#networkPanel')).to_contain_text('hello')
  assert await page.locator('#networkPanel img').count()==0
  assert any(url.endswith('/fk_start_direct') for url,_ in state['requests'])
  assert any(url.endswith('/fk_send_message') for url,_ in state['requests'])
  passed.append('Direct messaging uses server RPCs and escapes message HTML')
  await page.click('[data-net=logout]')
  await expect(page.locator('#netLogin')).to_be_visible()
  assert await page.locator('#networkPanel').get_by_text('Test workshop',exact=True).count()==0
  passed.append('Logout removes network content')
  assert errors==[],errors
  await context.close();await browser.close()
 OUT.joinpath('network-ui-results.json').write_text(json.dumps({'passed':passed,'limits':['Synthetic API, not hosted Supabase end-to-end','Chromium only; PostgreSQL RLS tested separately']},ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+p for p in passed))
asyncio.run(main())
