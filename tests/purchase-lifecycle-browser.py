"""Synthetic browser contract for FOLKOOP v0.20 purchase lifecycle.
No live order, provider, payment or delivery is created.
"""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Sverinav/')
API='https://abcdefghijklmnopqrst.supabase.co'
UID='11111111-1111-4111-8111-111111111111'
OTHER='44444444-4444-4444-8444-444444444444'
BUY='77777777-7777-4777-8777-777777777777'
OFFER='bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb'
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True)

async def main():
 passed=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  context=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':390,'height':844})
  state={
   'profile':[], 'cooperations':[], 'members':[], 'commitments':[],
   'offers':[], 'choice':[], 'process':[], 'confirmations':[], 'requests':[]
  }
  supplier={'id':OTHER,'name':'Synthetic Supplier','skills':'Delivery','about':'Test only','listed':True}

  async def routing(route):
   url=route.request.url
   if url.endswith('/network-config.js'):
    await route.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps({'enabled':True,'url':API,'publishableKey':'sb_publishable_example_for_tests_only'})+';',content_type='application/javascript');return
   if not url.startswith(API):
    await route.continue_();return
   payload=route.request.post_data_json if route.request.post_data else {}
   state['requests'].append((url,payload));result=[]

   if url.endswith('/verify'):result={'access_token':'synthetic-lifecycle','expires_in':3600}
   elif url.endswith('/user'):result={'id':UID}
   elif url.endswith('/fk_claim_first_pilot'):result=True
   elif url.endswith('/fk_save_profile'):
    state['profile']=[{'id':UID,'name':payload['p_name'],'skills':payload['p_skills'],'about':payload['p_about'],'listed':payload['p_listed']}];result=None
   elif url.endswith('/fk_create_cooperation'):
    state['cooperations']=[{'id':BUY,'owner_id':UID,'kind':'purchase','title':payload['p_title'],'description':payload['p_description'],'location_text':payload['p_location'],'status':'open','target_quantity':payload['p_target_quantity'],'unit':payload['p_unit'],'created_at':'2026-09-25T12:00:00Z','updated_at':'2026-09-25T12:00:00Z'}]
    state['members']=[{'cooperation_id':BUY,'user_id':UID,'role':'owner','joined_at':'2026-09-25T12:00:00Z'}]
    state['process']=[{'cooperation_id':BUY,'stage':'collecting','confirmation_deadline':None,'external_order_reference':'','ordered_at':None,'expected_delivery_at':None,'delivery_note':'','delivered_at':None,'pickup_place':'','pickup_start':None,'pickup_end':None,'result_note':'','finished_at':None,'updated_at':'2026-09-25T12:00:00Z'}]
    state['offers']=[{'id':OFFER,'cooperation_id':BUY,'provider_id':OTHER,'unit_price':5.25,'currency':'SEK','min_quantity':2,'available_quantity':20,'delivery_mode':'delivery','delivery_fee':100,'lead_time_days':2,'valid_until':'2030-12-31','note':'Synthetic supplier offer','created_at':'2026-09-25T12:00:30Z','updated_at':'2026-09-25T12:00:30Z'}]
    result=BUY
   elif url.endswith('/fk_set_purchase_commitment'):
    state['commitments']=[{'cooperation_id':BUY,'user_id':UID,'quantity':payload['p_quantity'],'note':payload['p_note'],'updated_at':'2026-09-25T12:01:00Z'}] if float(payload['p_quantity'])>0 else [];result=None
   elif url.endswith('/fk_choose_purchase_offer'):
    state['choice']=[] if payload['p_offer'] is None else [{'cooperation_id':BUY,'offer_id':payload['p_offer'],'selected_by':UID,'selected_at':'2026-09-25T12:02:00Z'}]
    state['process'][0]['stage']='collecting' if payload['p_offer'] is None else 'offer_selected';result=None
   elif url.endswith('/fk_start_purchase_confirmation'):
    state['process'][0]['stage']='confirming';state['process'][0]['confirmation_deadline']=payload['p_deadline']
    state['cooperations'][0]['status']='active'
    state['confirmations']=[{'cooperation_id':BUY,'user_id':UID,'quantity':state['commitments'][0]['quantity'],'decision':'pending','note':'','decided_at':None,'collected_at':None,'collected_note':'','updated_at':'2026-09-25T12:03:00Z'}];result=None
   elif url.endswith('/fk_confirm_purchase_participation'):
    conf=state['confirmations'][0];conf['decision']='confirmed' if payload['p_confirm'] else 'declined';conf['note']=payload['p_note'];conf['decided_at']='2026-09-25T12:04:00Z';result=None
   elif url.endswith('/fk_mark_purchase_ordered'):
    p=state['process'][0];p.update({'stage':'ordered','external_order_reference':payload['p_reference'],'ordered_at':'2026-09-25T12:05:00Z','expected_delivery_at':payload['p_expected_delivery'],'delivery_note':payload['p_note'],'pickup_place':payload['p_pickup_place'],'pickup_start':payload['p_pickup_start'],'pickup_end':payload['p_pickup_end']});result=None
   elif url.endswith('/fk_set_purchase_delivery_plan'):
    p=state['process'][0];p.update({'expected_delivery_at':payload['p_expected_delivery'],'delivery_note':payload['p_note'],'pickup_place':payload['p_pickup_place'],'pickup_start':payload['p_pickup_start'],'pickup_end':payload['p_pickup_end']});result=None
   elif url.endswith('/fk_mark_purchase_delivered'):
    p=state['process'][0];p['stage']='delivered';p['delivered_at']='2026-09-25T12:06:00Z';p['delivery_note']=payload['p_note'] or p['delivery_note'];result=None
   elif url.endswith('/fk_mark_purchase_collected'):
    conf=state['confirmations'][0];conf['collected_at']='2026-09-25T12:07:00Z' if payload['p_collected'] else None;conf['collected_note']=payload['p_note'];state['process'][0]['stage']='distributing' if payload['p_collected'] else state['process'][0]['stage'];result=None
   elif url.endswith('/fk_finish_purchase'):
    state['process'][0]['stage']='done';state['process'][0]['result_note']=payload['p_result_note'];state['process'][0]['finished_at']='2026-09-25T12:08:00Z';state['cooperations'][0]['status']='done';result=None
   elif '/fk_profiles?' in url:
    if 'id=eq.'+UID in url:result=state['profile']
    elif 'listed=eq.true' in url:result=state['profile']+[supplier]
    else:result=state['profile']+[supplier]
   elif '/fk_cooperations?' in url:result=state['cooperations']
   elif '/fk_cooperation_members?' in url:result=state['members']
   elif '/fk_purchase_commitments?' in url:result=state['commitments']
   elif '/fk_purchase_offers?' in url:result=state['offers']
   elif '/fk_purchase_offer_choice?' in url:result=state['choice']
   elif '/fk_purchase_process?' in url:result=state['process']
   elif '/fk_purchase_confirmations?' in url:result=state['confirmations']
   elif any(x in url for x in ['/fk_communities?','/fk_memberships?','/fk_blocks?','/fk_conversations?','/fk_conversation_members?','/fk_conversation_invites?','/fk_cooperation_updates?','/fk_project_tasks?']):
    result=[]
   await route.fulfill(body=json.dumps(result),content_type='application/json')

  await context.route('**/*',routing)
  page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE+'#/me')
  await page.fill('#netLogin [name=email]','synthetic@example.test')
  await page.fill('#netLogin [name=code]','123456')
  await page.click('#netLogin [value=verify]')
  await page.fill('#netProfile [name=name]','Synthetic Organizer')
  await page.check('#netProfile [name=listed]')
  await page.click('#netProfile button')

  await page.click('#nav a[href="#/together"]')
  await page.select_option('#netCoopCreate [name=kind]','purchase')
  await page.fill('#netCoopCreate [name=title]','Совместные дрова')
  await page.fill('#netCoopCreate [name=targetQuantity]','10')
  await page.fill('#netCoopCreate [name=unit]','m3')
  await page.click('#netCoopCreate button')
  await page.fill('#netCommitment [name=quantity]','4')
  await page.click('#netCommitment button.button')
  await page.click('[data-coop=selectOffer]')
  await expect(page.locator('#netPurchaseStart')).to_be_visible()
  passed.append('Selected supplier offer exposes final-confirmation step')

  await page.fill('#netPurchaseStart [name=deadline]','2030-01-01T12:00')
  await page.click('#netPurchaseStart button')
  await expect(page.locator('#netPurchaseConfirm')).to_be_visible()
  await expect(page.locator('#networkPanel')).to_contain_text('Финальное подтверждение')
  passed.append('Starting confirmation snapshots participant quantity and changes stage')

  await page.fill('#netPurchaseConfirm [name=note]','Подтверждаю четыре')
  await page.click('#netPurchaseConfirm [value=yes]')
  await expect(page.locator('#netPurchaseOrdered')).to_be_visible()
  await page.fill('#netPurchaseOrdered [name=reference]','EXT-TEST')
  await page.fill('#netPurchaseOrdered [name=pickupPlace]','Test Center')
  await page.click('#netPurchaseOrdered button')
  await expect(page.locator('#networkPanel')).to_contain_text('заказ оформлен вне FOLKOOP')
  await expect(page.locator('#networkPanel')).to_contain_text('EXT-TEST')
  passed.append('Organizer mark is explicitly external/self-reported, not a fake order submission')

  await page.fill('#netPurchaseDelivered [name=note]','Synthetic arrival')
  await page.click('#netPurchaseDelivered button')
  await expect(page.locator('#netPurchaseCollected')).to_be_visible()
  await page.fill('#netPurchaseCollected [name=note]','Synthetic pickup')
  await page.click('#netPurchaseCollected [value=yes]')
  await expect(page.locator('#networkPanel')).to_contain_text('Выдача участникам')
  passed.append('Delivery and participant collection are separate self-reported states')

  await page.fill('#netPurchaseFinish [name=note]','Synthetic lifecycle completed without payment.')
  await page.click('#netPurchaseFinish button')
  await expect(page.locator('#networkPanel')).to_contain_text('Завершено')
  assert state['cooperations'][0]['status']=='done'
  assert not any('/payment' in url or '/checkout' in url for url,_ in state['requests'])
  passed.append('Purchase closes with result note and no payment or checkout request')

  assert errors==[],errors
  await context.close();await browser.close()

 OUT.joinpath('purchase-lifecycle-ui-results.json').write_text(json.dumps({'passed':passed,'limits':['Synthetic API, not a real order or delivery','No money transfer, supplier acceptance or legal contract tested']},ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+p for p in passed))

asyncio.run(main())
