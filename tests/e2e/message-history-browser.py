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
   rows=[message(i) for i in range(1,102)];seen=set();writes=[];errors=[];raced=False
   async def routing(route):
    nonlocal raced
    url=route.request.url
    if url.endswith('/network-config.js'):
     await route.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps({'enabled':True,'url':API,'publishableKey':'sb_publishable_synthetic_only'})+';',content_type='application/javascript');return
    if not url.startswith(API):
     if url.startswith(BASE):await route.continue_()
     else:await route.abort()
     return
    if os.getenv('INJECT_UNRELATED_FAILURE')=='1' and '/fk_purchase_process?' in url:
     await route.fulfill(status=503,body='{}',content_type='application/json');return
    payload=route.request.post_data_json if route.request.post_data else {};result=[]
    if url.endswith('/verify'):result={'access_token':'synthetic-only','expires_in':3600}
    elif url.endswith('/user'):result={'id':ME}
    elif url.endswith('/fk_claim_pilot_invite'):result=True
    elif '/fk_profiles?' in url:
     # Navigate while the initial authenticated load is still in flight.
     await asyncio.sleep(0.2)
     result=[{'id':ME,'name':'Synthetic reader','skills':'','about':'','listed':True},{'id':OTHER,'name':'Synthetic author','skills':'','about':'','listed':True}]
    elif '/fk_conversations?' in url:result=[{'id':c,'kind':'direct','owner_id':None,'title':''} for c in [CHAT,SECOND]]
    elif '/fk_conversation_members?' in url:result=[{'conversation_id':c,'user_id':u,'role':'member','last_read_at':None} for c in [CHAT,SECOND] for u in [ME,OTHER]]
    elif url.endswith('/fk_chat_inbox'):result=[{'conversation_id':CHAT,'unread_count':len(rows)-len(seen),'last_message_at':rows[-1]['created_at']},{'conversation_id':SECOND,'unread_count':0}]
    elif '/fk_messages?' in url:
     q=parse_qs(urlparse(url).query)
     if q['conversation_id'][0]=='eq.'+CHAT:
      result=sorted(rows,key=lambda x:(x['created_at'],x['id']),reverse=True)
      if 'or' in q:
       before=re.search(r'id.lt.([a-f0-9-]+)',q['or'][0]).group(1);result=[m for m in result if m['id']<before]
      result=result[:int(q.get('limit',['101'])[0])]
    elif url.endswith('/fk_mark_messages_read'):
     writes.append(payload)
     if not raced:rows.append(message(999,'Arrived after fetch'));raced=True
     assert payload['p_conversation']==CHAT
     assert set(payload)=={'p_conversation','p_messages'}
     seen.update(payload['p_messages']);result={'unread_count':len(rows)-len(seen)}
    elif url.endswith('/fk_mark_chat_read'):raise AssertionError('Legacy clock-based read RPC used')
    await route.fulfill(body=json.dumps(result),content_type='application/json')
   await context.route('**/*',routing)
   page=await context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'?intro=0#/me')
   await page.fill('#netLogin [name=email]','synthetic@example.test');await page.click('#netLogin [value=code]')
   await page.fill('#netLogin [name=code]','123456');await page.check('#netLogin [name=policyAccepted]');await page.click('#netLogin [value=verify]')
   await expect(page.locator('#netProfile')).to_be_visible()
   if os.getenv('INJECT_UNRELATED_FAILURE')=='1':await expect(page.locator('.notice[role=status]')).to_be_visible()
   await page.evaluate("location.hash='#/messages'")
   await page.locator('[data-net="openChat"][data-id="'+CHAT+'"]').click()
   await expect(page.locator('[data-message-id]')).to_have_count(100)
   await expect(page.locator('[data-message-id="'+mid(101)+'"]')).to_be_in_viewport()
   await page.wait_for_timeout(700)
   assert writes and mid(101) in seen,(width,writes)
   assert mid(1) not in seen and mid(999) not in seen
   assert len(seen)<20,'Only the viewport, not the entire loaded page, is acknowledged'
   await page.fill('#netMessage textarea','Keep my draft')
   older=page.locator('[data-net=olderMessages]');await older.scroll_into_view_if_needed()
   top=await page.locator('[data-message-id]').first.evaluate('(el)=>el.getBoundingClientRect().top')
   await older.click();await expect(page.locator('[data-message-id]')).to_have_count(101)
   assert len(await page.locator('[data-message-id]').evaluate_all('(xs)=>[...new Set(xs.map(x=>x.dataset.messageId))]'))==101
   await expect(page.locator('#netMessage textarea')).to_have_value('Keep my draft')
   await expect(page.locator('[data-net=olderMessages]')).to_have_count(0)
   after=await page.locator('[data-message-id="'+mid(2)+'"]').evaluate('(el)=>el.getBoundingClientRect().top')
   assert abs(top-after)<5,(width,top,after)
   assert mid(999) not in seen,'Racing arrival remains unread until refreshed and shown'
   await page.locator('[data-net=backChats]').click();await page.locator('[data-net="openChat"][data-id="'+SECOND+'"]').click()
   await expect(page.locator('[data-message-id]')).to_have_count(0)
   await expect(page.locator('#netMessage textarea')).to_have_value('')
   await page.locator('[data-net=backChats]').click();await page.locator('[data-net="openChat"][data-id="'+CHAT+'"]').click()
   await expect(page.locator('[data-message-id="'+mid(999)+'"]')).to_be_in_viewport()
   await page.wait_for_timeout(700);assert mid(999) in seen
   await expect(page.locator('#netMessage textarea')).to_have_value('Keep my draft')
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert not errors,errors
   print('PASS newest 101, cursor older page, exact viewport reads/race, draft/scroll and chat isolation',width,flush=True)
   await context.close()
  await browser.close()
asyncio.run(main())
