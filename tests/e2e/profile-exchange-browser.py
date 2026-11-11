"""Profile exchange route: real application, isolated API fixtures, no live writes."""
import asyncio,json,os,shutil
from datetime import datetime,timedelta,timezone
from urllib.parse import urlparse
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4507/')
API='https://abcdefghijklmnopqrst.supabase.co'
UID='11111111-1111-4111-8111-111111111111';OTHER='22222222-2222-4222-8222-222222222222'
PROJECT='33333333-3333-4333-8333-333333333333';CHAT='44444444-4444-4444-8444-444444444444'
def moment(hours=0):return (datetime.now(timezone.utc)+timedelta(hours=hours)).isoformat()
async def main():
 async with async_playwright() as pw:
  browser=await pw.webkit.launch() if os.getenv('BROWSER_ENGINE')=='webkit' else await pw.chromium.launch(executable_path=shutil.which('chromium'))
  for width,theme,lang in [(320,'dark','ru'),(1366,'light','ru'),(390,'dark','ar')]:
   ctx=await browser.new_context(service_workers='block',viewport={'width':width,'height':844},color_scheme=theme)
   await ctx.add_init_script("localStorage.setItem('folkoop-language',"+json.dumps(lang)+");localStorage.setItem('folkoop-language-choice-v1','done');localStorage.setItem('folkoop-theme',"+json.dumps(theme)+")")
   projects=[{'id':'66666666-6666-4666-8666-666666666666','owner_id':UID,'kind':'resource','title':'Synthetic exchange resource','description':'PRIVATE_DESCRIPTION','location_text':'PRIVATE_ADDRESS','status':'open','updated_at':moment(-1)}, {'id':'77777777-7777-4777-8777-777777777777','owner_id':OTHER,'kind':'resource','title':'Other owner resource','status':'open','updated_at':moment(-1)}, {'id':PROJECT,'owner_id':UID,'kind':'project','title':'Synthetic exchange project','description':'Test only','status':'active','created_at':moment(-2)}]
   members=[{'cooperation_id':PROJECT,'user_id':UID},{'cooperation_id':PROJECT,'user_id':OTHER}]
   async def routing(route):
    url=route.request.url;result=[];path=urlparse(url).path
    if url.endswith('/network-config.js'):
     await route.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps({'enabled':True,'url':API,'publishableKey':'sb_publishable_example_for_tests_only'})+';',content_type='application/javascript');return
    if not url.startswith(API):await route.continue_();return
    if path.endswith('/verify'):result={'access_token':'synthetic-exchange','expires_in':3600}
    elif path.endswith('/user'):result={'id':UID}
    elif path.endswith('/fk_claim_first_pilot'):result=True
    elif '/fk_profiles?' in url:
     result=[{'id':UID,'name':'Exchange owner','listed':True},{'id':OTHER,'name':'Other owner','listed':True}]
    elif '/fk_cooperations?' in url:result=projects
    elif '/fk_cooperation_members?' in url:result=members
    elif '/fk_conversations?' in url:result=[{'id':CHAT,'kind':'direct','owner_id':UID}]
    elif '/fk_conversation_members?' in url:result=[{'conversation_id':CHAT,'user_id':UID},{'conversation_id':CHAT,'user_id':OTHER}]
    headers={'access-control-expose-headers':'content-range'}
    if isinstance(result,list):headers['content-range']=f'0-{max(0,len(result)-1)}/{len(result)}'
    await route.fulfill(body=json.dumps(result),content_type='application/json',headers=headers)
   await ctx.route('**/*',routing)
   page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'#/me');await page.wait_for_load_state('networkidle')
   await page.fill('#netLogin [name=email]','synthetic@example.test');await page.click('#netLogin [value=code]')
   await page.fill('#netLogin [name=code]','123456');await page.check('#netLogin [name=policyAccepted]');await page.click('#netLogin [value=verify]')
   await expect(page.locator('#netExchange')).to_be_visible()
   await expect(page.locator('#netExchange [name=selected]')).to_have_count(1)
   await expect(page.locator('#netExchange [name=selected]')).not_to_be_checked()
   await page.locator('#netExchange [name=selected]').check()
   await page.locator('#netExchange button').click()
   await expect(page.locator('textarea[aria-label=JSON]')).to_be_visible()
   packet=json.loads(await page.locator('textarea[aria-label=JSON]').input_value())
   assert len(packet['records'])==1 and packet['records'][0]['title']=='Synthetic exchange resource'
   assert not any(s in json.dumps(packet) for s in ['PRIVATE_DESCRIPTION','PRIVATE_ADDRESS',OTHER,UID,'Other owner resource'])
   await page.goto(BASE+'#/home');await page.wait_for_load_state('networkidle')
   await expect(page.locator('#netExchange')).to_have_count(0)
   await page.goto(BASE+'#/me');await page.wait_for_load_state('networkidle')
   await expect(page.locator('#netExchange')).to_be_visible()
   assert errors==[],errors
   print(f'PASS profile exchange route {width}/{lang}: own selection, private fields excluded, home preserved')
   await ctx.close()
  await browser.close()
asyncio.run(main())
