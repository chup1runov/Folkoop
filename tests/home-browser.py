"""FOLKOOP v0.23 action-first Home browser contract.
Synthetic API only; no live accounts or transactions.
"""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Sverinav/')
API='https://abcdefghijklmnopqrst.supabase.co'
UID='11111111-1111-4111-8111-111111111111'
OTHER='22222222-2222-4222-8222-222222222222'
PROJECT='33333333-3333-4333-8333-333333333333'
PURCHASE='44444444-4444-4444-8444-444444444444'
CHAT='55555555-5555-4555-8555-555555555555'
COMM='66666666-6666-4666-8666-666666666666'
POST='77777777-7777-4777-8777-777777777777'
TASK='88888888-8888-4888-8888-888888888888'
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True)

async def main():
 passed=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  context=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':390,'height':844})
  state={'requests':[]}
  profile={'id':UID,'name':'Synthetic Alice','skills':'Repair','about':'Pilot','listed':True}
  other={'id':OTHER,'name':'Synthetic Bob','skills':'Design','about':'Pilot','listed':True}
  cooperations=[
   {'id':PROJECT,'owner_id':UID,'kind':'project','title':'Общая мастерская','description':'Проект','location_text':'Göteborg','status':'active','target_quantity':None,'unit':'','created_at':'2026-09-25T17:00:00Z','updated_at':'2026-09-25T17:00:00Z'},
   {'id':PURCHASE,'owner_id':UID,'kind':'purchase','title':'Совместные дрова','description':'Закупка','location_text':'Göteborg','status':'active','target_quantity':10,'unit':'m3','created_at':'2026-09-25T17:00:00Z','updated_at':'2026-09-25T17:00:00Z'}
  ]
  memberships=[{'cooperation_id':PROJECT,'user_id':UID,'role':'owner','joined_at':'2026-09-25T17:00:00Z'},{'cooperation_id':PURCHASE,'user_id':UID,'role':'owner','joined_at':'2026-09-25T17:00:00Z'}]
  groups=[{'id':COMM,'owner_id':OTHER,'name':'Соседи Олофсторпа','description':'Локальное сообщество'}]
  post={'id':POST,'community_id':COMM,'author_id':OTHER,'body':'В субботу общий субботник','created_at':'2026-09-25T17:05:00Z'}
  activity=[{'cooperation_id':PROJECT,'cooperation_kind':'project','cooperation_title':'Общая мастерская','unread_count':2,'last_activity_at':'2026-09-25T17:10:00Z','last_event_type':'task_updated','last_actor_id':OTHER,'last_label':'doing · Найти помещение'}]
  chat_inbox=[{'conversation_id':CHAT,'unread_count':3,'last_message_at':'2026-09-25T17:11:00Z','linked_cooperation_id':PROJECT}]
  invites=[{'conversation_id':'99999999-9999-4999-8999-999999999999','user_id':UID,'invited_by':OTHER,'created_at':'2026-09-25T17:09:00Z'}]
  tasks=[{'id':TASK,'cooperation_id':PROJECT,'creator_id':OTHER,'assignee_id':UID,'title':'Позвонить владельцу помещения','details':'Уточнить цену','status':'todo','created_at':'2026-09-25T17:03:00Z','updated_at':'2026-09-25T17:08:00Z'}]
  confirmations=[{'cooperation_id':PURCHASE,'user_id':UID,'quantity':4,'decision':'pending','note':'','decided_at':None,'collected_at':None,'collected_note':'','updated_at':'2026-09-25T17:07:00Z'}]
  processes=[{'cooperation_id':PURCHASE,'stage':'confirming','confirmation_deadline':'2030-01-02T12:00:00Z','external_order_reference':'','ordered_at':None,'expected_delivery_at':None,'delivery_note':'','delivered_at':None,'pickup_place':'','pickup_start':None,'pickup_end':None,'result_note':'','finished_at':None,'updated_at':'2026-09-25T17:07:00Z'}]

  async def routing(route):
   url=route.request.url
   if url.endswith('/network-config.js'):
    await route.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps({'enabled':True,'url':API,'publishableKey':'sb_publishable_example_for_tests_only'})+';',content_type='application/javascript');return
   if not url.startswith(API):
    await route.continue_();return
   payload=route.request.post_data_json if route.request.post_data else {}
   state['requests'].append((url,payload));result=[]
   if url.endswith('/verify'):result={'access_token':'synthetic-home','expires_in':3600}
   elif url.endswith('/user'):result={'id':UID}
   elif url.endswith('/fk_claim_first_pilot'):result=True
   elif '/fk_profiles?' in url:
    if 'id=eq.'+UID in url:result=[profile]
    else:result=[profile,other]
   elif '/fk_communities?' in url:result=groups
   elif '/fk_memberships?' in url:result=[{'community_id':COMM,'user_id':UID,'banned':False}]
   elif '/fk_posts?' in url:result=[post]
   elif '/fk_blocks?' in url:result=[]
   elif '/fk_conversations?' in url:result=[{'id':CHAT,'kind':'group','owner_id':UID,'title':'Общая мастерская','created_at':'2026-09-25T17:00:00Z'}]
   elif '/fk_conversation_members?' in url:result=[{'conversation_id':CHAT,'user_id':UID,'role':'owner','joined_at':'2026-09-25T17:00:00Z','last_read_at':'2026-09-25T17:00:00Z'}]
   elif '/fk_conversation_invites?' in url:result=invites
   elif url.endswith('/rpc/fk_chat_inbox'):result=chat_inbox
   elif url.endswith('/rpc/fk_activity_inbox'):result=activity
   elif '/fk_cooperations?' in url:result=cooperations
   elif '/fk_cooperation_members?' in url:result=memberships
   elif '/fk_cooperation_chats?' in url:result=[{'cooperation_id':PROJECT,'conversation_id':CHAT,'created_at':'2026-09-25T17:00:00Z'}]
   elif '/fk_project_tasks?' in url and 'assignee_id=eq.' in url:result=tasks
   elif '/fk_purchase_confirmations?' in url and 'user_id=eq.' in url:result=confirmations
   elif '/fk_purchase_process?' in url:result=processes
   elif '/fk_messages?' in url:result=[]
   elif any(x in url for x in ['/fk_cooperation_updates?','/fk_purchase_commitments?','/fk_purchase_offers?','/fk_purchase_offer_choice?','/fk_cooperation_activity?']):
    result=[]
   await route.fulfill(body=json.dumps(result),content_type='application/json')

  await context.route('**/*',routing)
  page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE+'#/me')
  await page.fill('#netLogin [name=email]','synthetic@example.test')
  await page.fill('#netLogin [name=code]','123456')
  await page.click('#netLogin [value=verify]')
  await page.evaluate("location.hash='#/home'")
  await expect(page.locator('#networkPanel')).to_contain_text('Требует внимания')
  await expect(page.locator('#networkPanel')).to_contain_text('Позвонить владельцу помещения')
  await expect(page.locator('#networkPanel')).to_contain_text('Подтверди количество в закупке')
  await expect(page.locator('#networkPanel')).to_contain_text('Непрочитанные сообщения · 3')
  await expect(page.locator('#networkPanel')).to_contain_text('Приглашения в чаты · 1')
  passed.append('Home prioritizes tasks, purchase confirmation, messages and invitations')

  await expect(page.locator('#networkPanel')).to_contain_text('В субботу общий субботник')
  await expect(page.locator('#networkPanel')).to_contain_text('Соседи Олофсторпа')
  await expect(page.locator('#networkPanel')).to_contain_text('Общая мастерская')
  passed.append('Home merges community publications and cooperation activity into a bounded action feed')

  await page.click('[data-home=createCoop][data-kind=project]')
  await expect(page.locator('#netCoopCreate')).to_be_visible()
  await expect(page.locator('#netCoopCreate [name=kind]')).to_have_value('project')
  passed.append('Home quick action opens real network Project creation, not a mock shortcut')

  await page.evaluate("location.hash='#/home'")
  await page.click('[data-home=openCommunity]')
  await expect(page.locator('#netPost')).to_be_visible()
  passed.append('Home community publication opens its real community context')

  assert errors==[],errors
  await page.screenshot(path=str(OUT/'folkoop-v023-home-mobile.png'),full_page=True)
  await context.close();await browser.close()

 OUT.joinpath('home-results.json').write_text(json.dumps({'passed':passed,'limits':['Synthetic API; not a real social feed','Home is action-first and intentionally capped instead of infinite scroll']},ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+x for x in passed))

asyncio.run(main())
