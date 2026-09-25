"""Synthetic browser contract for FOLKOOP supplier-offer comparison.
No live Supabase account or payment is used.
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
   'profile':[], 'cooperations':[], 'coop_members':[], 'commitments':[],
   'offers':[], 'choice':[], 'requests':[]
  }
  other={'id':OTHER,'name':'Synthetic Supplier','skills':'Firewood delivery','about':'Pilot supplier','listed':True}

  async def routing(route):
   url=route.request.url
   if url.endswith('/network-config.js'):
    await route.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps({'enabled':True,'url':API,'publishableKey':'sb_publishable_example_for_tests_only'})+';',content_type='application/javascript');return
   if not url.startswith(API):
    await route.continue_();return
   payload=route.request.post_data_json if route.request.post_data else {}
   state['requests'].append((url,payload));result=[]

   if url.endswith('/verify'): result={'access_token':'synthetic-marketplace','expires_in':3600}
   elif url.endswith('/user'): result={'id':UID}
   elif url.endswith('/fk_claim_first_pilot'): result=True
   elif url.endswith('/fk_save_profile'):
    state['profile']=[{'id':UID,'name':payload['p_name'],'skills':payload['p_skills'],'about':payload['p_about'],'listed':payload['p_listed']}];result=None
   elif url.endswith('/fk_create_cooperation'):
    state['cooperations']=[{'id':BUY,'owner_id':UID,'kind':'purchase','title':payload['p_title'],'description':payload['p_description'],'location_text':payload['p_location'],'status':'open','target_quantity':payload['p_target_quantity'],'unit':payload['p_unit'],'created_at':'2026-09-25T12:00:00Z','updated_at':'2026-09-25T12:00:00Z'}]
    state['coop_members']=[{'cooperation_id':BUY,'user_id':UID,'role':'owner','joined_at':'2026-09-25T12:00:00Z'}]
    state['offers']=[{'id':OFFER,'cooperation_id':BUY,'provider_id':OTHER,'unit_price':5.25,'currency':'SEK','min_quantity':2,'available_quantity':20,'delivery_mode':'delivery','delivery_fee':100,'lead_time_days':2,'valid_until':'2030-12-31','note':'Synthetic supplier offer','created_at':'2026-09-25T12:00:30Z','updated_at':'2026-09-25T12:00:30Z'}]
    result=BUY
   elif url.endswith('/fk_choose_purchase_offer'):
    state['choice']=[] if payload['p_offer'] is None else [{'cooperation_id':BUY,'offer_id':payload['p_offer'],'selected_by':UID,'selected_at':'2026-09-25T12:01:00Z'}];result=None
   elif url.endswith('/fk_set_purchase_commitment'):
    state['commitments']=[{'cooperation_id':BUY,'user_id':UID,'quantity':payload['p_quantity'],'note':payload['p_note'],'updated_at':'2026-09-25T12:02:00Z'}] if float(payload['p_quantity'])>0 else [];result=None
   elif '/fk_profiles?' in url:
    if 'id=eq.'+UID in url: result=state['profile']
    elif 'listed=eq.true' in url: result=[other]+[p for p in state['profile'] if p['listed']]
    else: result=state['profile']+[other]
   elif '/fk_cooperations?' in url: result=state['cooperations']
   elif '/fk_cooperation_members?' in url: result=state['coop_members']
   elif '/fk_purchase_commitments?' in url: result=state['commitments']
   elif '/fk_purchase_offers?' in url: result=state['offers']
   elif '/fk_purchase_offer_choice?' in url: result=state['choice']
   elif any(x in url for x in ['/fk_communities?','/fk_memberships?','/fk_blocks?','/fk_conversations?','/fk_conversation_members?','/fk_conversation_invites?']):
    result=[]
   await route.fulfill(body=json.dumps(result),content_type='application/json')

  await context.route('**/*',routing)
  page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE+'#/me')
  await page.fill('#netLogin [name=email]','synthetic@example.test')
  await page.fill('#netLogin [name=code]','123456')
  await page.click('#netLogin [value=verify]')
  await expect(page.locator('#netProfile')).to_be_visible()

  await page.fill('#netProfile [name=name]','Synthetic Buyer')
  await page.click('#netProfile button')
  await page.click('#nav a[href="#/together"]')
  await page.select_option('#netCoopCreate [name=kind]','purchase')
  await page.fill('#netCoopCreate [name=title]','Совместные дрова')
  await page.fill('#netCoopCreate [name=description]','Собираем общий заказ')
  await page.fill('#netCoopCreate [name=location]','Göteborg')
  await page.fill('#netCoopCreate [name=targetQuantity]','10')
  await page.fill('#netCoopCreate [name=unit]','m3')
  await page.click('#netCoopCreate button')

  await expect(page.locator('#networkPanel')).to_contain_text('Synthetic Supplier')
  await expect(page.locator('#networkPanel')).to_contain_text('5.25 SEK / m3')
  await expect(page.locator('#networkPanel')).to_contain_text('Synthetic supplier offer')
  assert await page.locator('#networkPanel img').count()==0
  passed.append('Joint purchase renders structured supplier offer as escaped text')

  await page.click('[data-coop=selectOffer]')
  await expect(page.locator('#networkPanel')).to_contain_text('Выбрано')
  assert state['choice'] and state['choice'][0]['offer_id']==OFFER
  assert any(url.endswith('/fk_choose_purchase_offer') for url,_ in state['requests'])
  passed.append('Purchase owner selects a preferred offer through server RPC')

  await page.fill('#netCommitment [name=quantity]','2')
  await page.fill('#netCommitment [name=note]','Нужна доставка')
  await page.click('#netCommitment button.button')
  await expect(page.locator('#networkPanel')).to_contain_text('2 / 10 m3')
  passed.append('Buyer quantity coordination remains independent of supplier selection and payment')

  assert errors==[],errors
  await context.close();await browser.close()

 OUT.joinpath('marketplace-ui-results.json').write_text(json.dumps({'passed':passed,'limits':['Synthetic API, not a hosted vendor transaction','No payment, order submission or legal acceptance tested']},ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+p for p in passed))

asyncio.run(main())
