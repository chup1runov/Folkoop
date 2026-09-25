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
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True)
async def main():
 passed=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  context=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':390,'height':844})
  page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE+'#/me')
  await expect(page.locator('#networkPanel')).to_contain_text('Сервер ещё не подключён')
  assert await page.locator('#netLogin').count()==0
  passed.append('Disabled backend does not fake sign-in or interrupt local My page')
  await context.close()
  state={'profile':[],'groups':[],'members':[],'posts':[],'requests':[],'fail_post':False}
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
    elif url.endswith('/fk_save_profile'):
     state['profile']=[{'id':UID,'name':payload['p_name'],'skills':payload['p_skills'],'about':payload['p_about'],'listed':payload['p_listed']}];result=None
    elif url.endswith('/fk_create_community'):
     state['groups']=[{'id':CID,'owner_id':UID,'name':payload['p_name'],'description':payload['p_description']}]
     state['members']=[{'user_id':UID,'community_id':CID,'banned':False}];result=CID
    elif url.endswith('/fk_publish'):
     if state['fail_post']:
      await route.fulfill(status=500,json={'private_error':'must not echo'});return
     state['posts']=[{'id':PID,'author_id':UID,'community_id':CID,'body':payload['p_body']}];result=PID
    elif '/fk_profiles?' in url:result=state['profile'] if 'listed=eq.true' not in url else [p for p in state['profile'] if p['listed']]
    elif '/fk_communities?' in url:result=state['groups']
    elif '/fk_memberships?' in url:result=state['members']
    elif '/fk_posts?' in url:result=state['posts']
    await route.fulfill(body=json.dumps(result),content_type='application/json');return
   await route.continue_()
  await context.route('**/*',routing)
  page=await context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE+'#/me')
  await page.fill('#netLogin [name=email]','synthetic@example.test')
  await page.click('#netLogin [value=code]')
  await expect(page.locator('#netStatus')).to_contain_text('Если адрес приглашён')
  assert state['requests'][0][1]['create_user'] is False
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
  await page.click('[data-net=logout]')
  await expect(page.locator('#netLogin')).to_be_visible()
  assert await page.locator('#networkPanel').get_by_text('Test workshop',exact=True).count()==0
  passed.append('Logout removes network content')
  assert errors==[],errors
  await context.close();await browser.close()
 OUT.joinpath('network-ui-results.json').write_text(json.dumps({'passed':passed,'limits':['Synthetic API, not hosted Supabase end-to-end','Chromium only; PostgreSQL RLS tested separately']},ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+p for p in passed))
asyncio.run(main())
