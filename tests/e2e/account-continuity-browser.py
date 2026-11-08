"""Synthetic HTTP UI regression; real PostgreSQL authorization is tested separately."""
import asyncio,json,os,shutil,re
from urllib.parse import urlparse,parse_qs
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4487/')
API='https://abcdefghijklmnopqrst.supabase.co'
ME='11111111-1111-4111-8111-111111111111';OTHER='22222222-2222-4222-8222-222222222222'
CHAT='33333333-3333-4333-8333-333333333333';SECOND='44444444-4444-4444-8444-444444444444'
def mid(i):return 'a0000000-0000-4000-8000-'+str(i).zfill(12)
def message(i,body=None):return {'id':mid(i),'conversation_id':CHAT,'author_id':OTHER,'body':body or 'Synthetic message '+str(i),'created_at':'2026-11-01T12:00:00.123456+00:00'}
async def main():
 async with async_playwright() as pw:
  browser=await pw.webkit.launch() if os.getenv('BROWSER_ENGINE')=='webkit' else await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  for width in [1366,390]:
   context=await browser.new_context(viewport={'width':width,'height':844},service_workers='block')
   await context.add_init_script("localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done');sessionStorage.setItem('folkoop-entry-mode-v1','account');")
   errors=[];sent=[];lost=True;searches=[];profile_loads=0
   async def routing(route):
    nonlocal lost,profile_loads
    url=route.request.url
    if url.endswith('/network-config.js'):
     await route.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps({'enabled':True,'url':API,'publishableKey':'sb_publishable_synthetic_only'})+';',content_type='application/javascript');return
    if not url.startswith(API):
     if url.startswith(BASE):await route.continue_()
     else:await route.abort()
     return
    payload=route.request.post_data_json if route.request.post_data else {};result=[]
    if url.endswith('/verify'):result={'access_token':'synthetic-only','expires_in':3600}
    elif url.endswith('/user'):result={'id':ME}
    elif url.endswith('/fk_claim_pilot_invite'):result=True
    elif '/fk_profiles?' in url:
     if 'id=eq.' in url:profile_loads+=1
     result=[{'id':ME,'name':'Synthetic reader','skills':'','about':'','listed':True}]
    elif '/fk_conversations?' in url:result=[{'id':CHAT,'kind':'direct','owner_id':None,'title':'Synthetic chat'}]
    elif '/fk_conversation_members?' in url:result=[{'conversation_id':CHAT,'user_id':u,'role':'member','last_read_at':None} for u in [ME,OTHER]]
    elif url.endswith('/fk_search_account'):
     searches.append(payload)
     result=[{'key':'message:'+mid(i),'kind':'messages','id':mid(i),'parent_id':CHAT,'title':'Synthetic chat','body':'needle old '+str(i),'route':'messages'} for i in (range(1,52) if not payload['p_after'] else range(51,54))]
    elif '/fk_messages?' in url:
     q=parse_qs(urlparse(url).query)
     result=[message(51,'needle old 51')] if 'id' in q else []
    elif url.endswith('/fk_send_message_once'):
     sent.append(payload)
     if lost:lost=False;await route.abort();return
     result=mid(999)
    elif url.endswith('/fk_mark_messages_read'):result={'unread_count':0}
    headers={'content-type':'application/json'}
    if route.request.method=='GET' and '/rest/v1/' in url:headers['content-range']='0-'+str(max(len(result)-1,0))+'/'+str(len(result))
    await route.fulfill(body=json.dumps(result),headers=headers)
   await context.route('**/*',routing)
   page=await context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'?intro=0#/me')
   await page.fill('#netLogin [name=email]','synthetic@example.test');await page.click('#netLogin [value=code]')
   await page.fill('#netLogin [name=code]','123456');await page.check('#netLogin [name=policyAccepted]');await page.click('#netLogin [value=verify]')
   await expect(page.locator('.personal-identity')).to_be_visible()
   await page.locator('.profile-editor').wait_for()
   if await page.locator('.profile-editor').get_attribute('open') is None: await page.locator('.profile-editor > summary').click()
   await page.fill('#netProfile [name=name]','Keep unsaved name')
   before=profile_loads;await page.evaluate("window.dispatchEvent(new Event('focus'))")
   await page.wait_for_timeout(200);assert profile_loads==before
   await page.evaluate("document.activeElement.blur();window.dispatchEvent(new Event('focus'))")
   for _ in range(30):
    if profile_loads>before:break
    await page.wait_for_timeout(100)
   assert profile_loads>before
   await expect(page.locator('#netProfile [name=name]')).to_have_value('Keep unsaved name')
   await page.click('#globalSearchButton');await page.fill('#accountSearchInput','needle')
   await expect(page.locator('#accountSearchResults button')).to_have_count(50)
   await page.locator('#accountSearch button',has_text='↓').click()
   await expect(page.locator('#accountSearchResults button')).to_have_count(53)
   assert searches[-1]['p_after']=='message:'+mid(50)
   await page.locator('#accountSearchResults button').nth(50).click()
   await expect(page.locator('[data-message-id="'+mid(51)+'"]')).to_be_visible()
   await expect(page.locator('.account-search-match')).to_contain_text('needle old 51')
   await page.fill('#netMessage textarea','Retry safely')
   await page.locator('#netMessage button').click()
   await expect(page.locator('#netMessage textarea')).to_have_value('Retry safely')
   await page.locator('#netMessage button').click()
   await expect(page.locator('#netMessage textarea')).to_have_value('')
   assert len(sent)==2 and sent[0]['p_command']==sent[1]['p_command'],sent
   assert not errors,errors
   print('PASS foreground refresh/draft, remote search paging, old message context, lost-response retry',width)
   await context.close()
  await browser.close()
asyncio.run(main())
