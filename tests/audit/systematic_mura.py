"""Exploratory UI audit. Local build only; never send real account/API mutations.
An audit records FAIL/GAP/ERROR without hiding remaining cases. NOT a release gate.
"""
import asyncio, collections, json, os, re, traceback
from pathlib import Path
from playwright.async_api import async_playwright

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium')
OUT=Path(os.getenv('QA_OUTPUT','qa-audit'))/ENGINE
OUT.mkdir(parents=True,exist_ok=True)
BANNED=re.compile(r'пилот|демо|учебн|сервер|не подключено|\bpilot\b|server-backed|\bprototype\b|\bundefined\b|\[object Object\]',re.I)
LANGS=['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk']
ROWS,INVENTORY,NET,ERRORS=[],{},[],[]
ACTIONS=0

async def visible(page,sel):
 loc=page.locator(sel)
 return await loc.count()>0 and await loc.first.is_visible()
async def click(page,sel):
 global ACTIONS
 await page.locator(sel).first.click(timeout=3500)
 ACTIONS+=1
 await page.wait_for_timeout(90)
async def case(page,id,fn,expected='',kind='functional'):
 before=len(ERRORS)
 row={'id':id,'engine':ENGINE,'viewport':page.viewport_size,'kind':kind,'expected':expected}
 try:
  result=await fn()
  if isinstance(result,dict):
   status=result.pop('status',None)
   ok=result.pop('pass',False)
   row['status']=status or ('PASS' if ok else 'FAIL')
   row['actual']=result
  else:row['status']='PASS' if result else 'FAIL'
 except Exception as e:row.update(status='ERROR',actual={'error':str(e)[:900]})
 row['url']=page.url
 row['new_js_errors']=ERRORS[before:]
 if row['status'] in ('FAIL','ERROR','GAP'):
  name=re.sub(r'[^a-zA-Z0-9_-]','_',id)[:100]+'.png'
  try:
   await page.screenshot(path=str(OUT/name));row['screenshot']=name
  except Exception:pass
 ROWS.append(row)
 (OUT/'matrix.json').write_text(json.dumps(ROWS,ensure_ascii=False,indent=2))
 print(row['status'],id,flush=True)
 return row
async def new_page(browser,width=390,height=844,language='ru',sw='block',blocked=False):
 ctx=await browser.new_context(viewport={'width':width,'height':height},locale=language,timezone_id='Europe/Stockholm',service_workers=sw,has_touch=width<760,is_mobile=width<760)
 await ctx.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});")
 if blocked:await ctx.add_init_script("Storage.prototype.getItem=()=>{throw Error('QA_STORAGE_BLOCKED')};Storage.prototype.setItem=()=>{throw Error('QA_STORAGE_BLOCKED')};")
 async def local_only(route):
  r=route.request
  if r.url.startswith(BASE) and r.method in ('GET','HEAD','OPTIONS'):await route.continue_()
  else:
   NET.append({'url':r.url,'method':r.method,'blocked':True});await route.abort()
 await ctx.route('**/*',local_only)
 page=await ctx.new_page();page.set_default_timeout(3500)
 page.on('pageerror',lambda e:ERRORS.append({'url':page.url,'error':str(e)}))
 return ctx,page
async def enter(page,skip=True):
 await page.goto(BASE,wait_until='domcontentloaded')
 await page.locator('#folkoopEntryGate').wait_for(state='visible')
 await click(page,'[data-entry="guest"]')
 await page.locator('#onboarding').wait_for(state='visible')
 if skip:
  await click(page,'[data-onboarding="skip"]');await page.locator('.mura-home').wait_for(state='visible')
async def nav(page,route):
 if route in ('people','communities'):
  await click(page,'[data-mobile-nav="together"]');await click(page,'[data-mobile-subnav="'+route+'"]')
 else:await click(page,'[data-mobile-nav="'+route+'"]')
async def list_view(page,route):
 await nav(page,route)
 if route=='projects':await click(page,'[data-mobile-subnav="projects-overview"]')
 if route=='messages':await click(page,'[data-mobile-subnav="messages-chats"]')
 for s in ('[data-coop="back"]','[data-net="back"]','[data-net="backChats"]'):
  if await visible(page,s):await click(page,s)
async def invariant(page):
 return await page.evaluate('''()=>{const v=s=>[...document.querySelectorAll(s)].filter(e=>e.getClientRects().length&&!e.closest('[hidden]')).length;
 let mode;try{mode=sessionStorage.getItem('folkoop-entry-mode-v1')}catch{mode='storage-blocked'};
 return {mode,entry:v('#folkoopEntryGate'),login:v('#netLogin'),forms:v('#networkPanel form'),center:v('[data-mobile-subnav="center"]'),settings:v('[data-mobile-subnav="settings"]'),about:v('[data-mobile-subnav="about"]'),overflow:document.documentElement.scrollWidth>innerWidth+1};}''')
async def route_case(page,route):
 await nav(page,route);x=await invariant(page)
 return {'pass':page.url.endswith('#/'+route) and x['mode']=='guest' and not any(x[k] for k in ('entry','login','forms','center','settings','about')),**x}
async def selected_case(page,route):
 active=await page.locator('#mobilePrimaryNav [aria-current="page"]').get_attribute('data-mobile-nav')
 sub=await page.locator('#mobileContextDock [aria-current="page"]').count()
 return {'pass':active==('together' if route in ('people','communities') else route) and sub==(0 if route in ('home','me') else 1),'primary':active,'secondary_count':sub}
async def helper_case(page):
 await click(page,'#folkoopGuideActor');text=await page.locator('#folkoopHelperPanel').inner_text()
 ok=not BANNED.search(text);await page.keyboard.press('Escape')
 return {'pass':ok and not await visible(page,'#folkoopHelperPanel'),'text':text}
async def inventory(page):
 return await page.locator('#networkPanel button:visible,#networkPanel a:visible,#workspace button:visible,#workspace a:visible').evaluate_all('''es=>es.map(e=>({tag:e.tagName,text:e.innerText.trim().slice(0,150),net:e.getAttribute('data-net'),coop:e.getAttribute('data-coop'),home:e.getAttribute('data-home'),id:e.getAttribute('data-id'),href:e.getAttribute('href')}))''')
async def geometry(page):
 return await page.evaluate('''()=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};
 const fixed=['.topbar','#mobileContextDock','#mobilePrimaryNav','#folkoopGuideActor'].map(s=>({selector:s,...(document.querySelector(s)?rect(document.querySelector(s)):{})}));
 const clipped=[...document.querySelectorAll('#mobilePrimaryNav a span')].filter(e=>e.getClientRects().length&&e.scrollWidth>e.clientWidth+1).map(e=>({text:e.innerText,scroll:e.scrollWidth,client:e.clientWidth}));
 return {vw:innerWidth,vh:innerHeight,scrollWidth:document.documentElement.scrollWidth,bodyHeight:document.documentElement.scrollHeight,fixed,clipped};}''')

async def tour_audit(browser):
 ctx,page=await new_page(browser)
 await page.goto(BASE);await page.locator('#folkoopEntryGate').wait_for(state='visible')
 await case(page,'entry-real-first-contact',lambda:entry_boundary(page),'Only language and visit-Mura path; disclosure visible')
 await click(page,'[data-entry="guest"]');await page.locator('#onboarding').wait_for(state='visible')
 for n in range(12):
  if not await visible(page,'#onboarding'):break
  await page.wait_for_timeout(600)
  await case(page,'tour-step-'+str(n),lambda:tour_geometry(page),'Dialog visible, keyboard focus inside, animation settled')
  await click(page,'[data-onboarding="next"]')
 await case(page,'tour-finish',lambda:guest_home(page),'Tour ends in Mura Home, not registration')
 await click(page,'#folkoopGuideActor');await click(page,'[data-helper="tour"]');await page.wait_for_timeout(450)
 await click(page,'[data-onboarding="next"]');await click(page,'[data-onboarding="back"]')
 await case(page,'tour-back',lambda:progress_one(page),'Back returns to step 1')
 await page.keyboard.press('Escape')
 await case(page,'tour-escape',lambda:guest_home(page),'Escape closes tour and stays in Mura')
 await page.emulate_media(reduced_motion='reduce')
 await click(page,'#folkoopGuideActor');await click(page,'[data-helper="tour"]')
 await click(page,'[data-onboarding="next"]');await page.wait_for_timeout(100)
 await case(page,'tour-reduced-motion',lambda:reduced_motion(page),'No long guide animation with reduced-motion')
 await click(page,'[data-onboarding="skip"]');await ctx.close()
async def entry_boundary(page):
 text=await page.locator('#folkoopEntryGate').inner_text()
 return {'pass':not await visible(page,'[data-entry="email"]') and await page.locator('[data-entry-language]').count()==11 and 'интерактивная история' in text,'text':text}
async def guest_home(page):
 x=await invariant(page)
 return {'pass':await visible(page,'.mura-home') and x['mode']=='guest' and not x['login'] and not x['entry'],**x}
async def progress_one(page):
 text=await page.locator('#onboardingProgress').inner_text();return {'pass':'1 / 8' in text,'progress':text}
async def tour_geometry(page):
 x=await page.locator('.onboarding-card').evaluate('''e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,inside:r.x>=-1&&r.y>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1}}''')
 progress=await page.locator('#onboardingProgress').inner_text()
 await page.locator('[data-onboarding="next"]').focus();await page.keyboard.press('Tab')
 focus=await page.evaluate("()=>!!document.activeElement?.closest('#onboarding')")
 return {'pass':x['inside'] and focus,'progress':progress,'dialog':x,'focus_inside':focus}
async def reduced_motion(page):
 durations=await page.locator('#folkoopGuideActor').evaluate("e=>({animation:getComputedStyle(e).animationDuration,transition:getComputedStyle(e).transitionDuration})")
 return {'pass':not await page.locator('#folkoopGuideActor.teleport-out').count(),'durations':durations}

async def core_audit(browser,width,height):
 ctx,page=await new_page(browser,width,height);prefix=f'{width}x{height}/';await enter(page);inv={}
 for route in ('home','together','people','communities','projects','city','messages','me'):
  await case(page,prefix+'route/'+route,lambda r=route:route_case(page,r),'Requested content and Mura mode retained')
  await case(page,prefix+'selected/'+route,lambda r=route:selected_case(page,r),'One correct selected tab')
  await case(page,prefix+'helper/'+route,lambda:helper_case(page),'Contextual help stays in character and closes with Escape')
  inv[route]=await inventory(page);g=await geometry(page)
  ROWS.append({'id':prefix+'geometry/'+route,'status':'INFO','engine':ENGINE,'viewport':page.viewport_size,'actual':g,'url':page.url,'kind':'measurement'})
  if route in ('home','together','messages','city'):await page.screenshot(path=str(OUT/f'{width}-{height}-{route}.png'))
 INVENTORY[prefix]=inv
 for route,action,back in (('together','data-coop="open"','data-coop="back"'),('projects','data-coop="open"','data-coop="back"'),('communities','data-net="open"','data-net="back"'),('messages','data-net="openChat"','data-net="backChats"')):
  for item in inv[route]:
   if not item['id']:continue
   await list_view(page,route)
   await case(page,prefix+route+'/open/'+item['id'][-3:],lambda it=item,a=action,b=back:open_entity(page,it,a,b),'Detail opens with content and no editable form')
   if route in ('together','projects'):
    for i in range(await page.locator('#networkPanel details:visible').count()):
     await case(page,prefix+route+'/disclosure/'+item['id'][-3:]+'/'+str(i),lambda n=i:toggle_detail(page,n),'Disclosure opens with safe read-only contents')
    await case(page,prefix+route+'/expanded-copy/'+item['id'][-3:],lambda:expanded_copy(page),'No pilot/server/debug copy in visible detail')
   if route=='messages':await case(page,prefix+'chat/back-label/'+item['id'][-3:],lambda:chat_back_label(page),'Back label refers to conversations, not communities')
   await click(page,'['+back+']')
   await case(page,prefix+route+'/back/'+item['id'][-3:],lambda b=back:back_result(page,b),'Explicit back returns to listing')
 for i,item in enumerate(inv['home']):
  await nav(page,'home')
  await case(page,prefix+'home/action/'+str(i),lambda it=item:home_action(page,it),'Home control opens its promised destination')
 await nav(page,'people')
 await case(page,prefix+'people/linked-relations',lambda:people_relations(page),'People have actionable story relations','contract-gap')
 await list_view(page,'projects');await click(page,'[data-coop="open"]')
 for key in ('projects-tasks','projects-updates','projects-overview'):
  await case(page,prefix+'detail-switch/'+key,lambda k=key:detail_switch(page,k,'.coop-summary'),'Tab switches content, not just highlight')
 await list_view(page,'messages');await click(page,'[data-net="openChat"]')
 for key in ('messages-direct','messages-groups','messages-chats'):
  await case(page,prefix+'detail-switch/'+key,lambda k=key:detail_switch(page,k,'[data-net="backChats"]'),'Tab returns to requested chat list/filter')
 for dest in ('center','settings','about'):
  await case(page,prefix+'guard/'+dest,lambda d=dest:guard(page,d),'Excluded route cannot escape Mura context')
 await list_view(page,'projects');await click(page,'[data-coop="open"]')
 await case(page,prefix+'entity/reload',lambda:entity_reload(page),'Open entity identity survives reload','contract-gap')
 await list_view(page,'projects');await nav(page,'home');await nav(page,'projects');await click(page,'[data-coop="open"]')
 await case(page,prefix+'entity/browser-back',lambda:entity_browser_back(page),'Browser Back returns from detail to list','contract-gap')
 await ctx.close()
async def open_entity(page,item,action,back):
 await click(page,'['+action+'][data-id="'+item['id']+'"]')
 text=await page.locator('#networkPanel').inner_text();x=await invariant(page)
 return {'pass':await visible(page,'['+back+']') and len(text)>80 and not x['forms'] and not x['login'],'text':text[:2000],**x}
async def back_result(page,back):return {'pass':not await visible(page,'['+back+']')}
async def toggle_detail(page,n):
 el=page.locator('#networkPanel details:visible').nth(n);title=await el.locator('summary').inner_text()
 if await el.get_attribute('open') is not None:await el.locator('summary').click()
 await el.locator('summary').click();x=await invariant(page)
 return {'pass':await el.get_attribute('open') is not None and not x['forms'] and not x['login'],'title':title,**x}
async def expanded_copy(page):
 text=await page.locator('#networkPanel').inner_text();hits=[text[max(0,m.start()-40):m.end()+100] for m in BANNED.finditer(text)]
 return {'pass':not hits,'hits':hits}
async def chat_back_label(page):
 label=await page.locator('[data-net="backChats"]').inner_text();return {'pass':'сообщества' not in label.lower(),'label':label}
async def home_action(page,item):
 if item['home']:sel=f'[data-home="{item["home"]}"][data-id="{item["id"]}"]'
 elif item['net']:sel=f'[data-net="{item["net"]}"][data-id="{item["id"]}"]'
 else:sel=f'.mura-home a[href="{item["href"]}"]'
 await click(page,sel)
 if item['home']=='openCoop':ok=await visible(page,'.coop-summary')
 elif item['home']=='openCommunity':ok=page.url.endswith('#/communities') and await visible(page,'[data-net="back"]')
 elif item['net']=='openChat':ok=page.url.endswith('#/messages') and await visible(page,'[data-net="backChats"]')
 else:ok=page.url.endswith(item['href'])
 return {'pass':ok,'control':item,'destination':page.url}
async def people_relations(page):
 count=await page.locator('.mura-person-page-card').count();links=await page.locator('.mura-person-page-card a,.mura-person-page-card button').count()
 return {'status':'PASS' if links>0 else 'GAP','people':count,'actionable_relations':links}
async def detail_switch(page,key,detail):
 await click(page,f'[data-mobile-subnav="{key}"]')
 return {'pass':not await visible(page,detail),'selected':await page.locator(f'[data-mobile-subnav="{key}"]').get_attribute('aria-current'),'detail_still_visible':await visible(page,detail)}
async def guard(page,dest):
 await page.evaluate('(r)=>{location.hash="#/"+r}',dest);await page.wait_for_timeout(180);x=await invariant(page)
 return {'pass':page.url.endswith('#/'+('city' if dest=='center' else 'me')) and not x['entry'] and not x['login'],'destination':page.url,**x}
async def entity_reload(page):
 before=page.url;await page.reload();await page.wait_for_timeout(250);exists=await visible(page,'.coop-summary')
 return {'status':'PASS' if exists else 'GAP','before':before,'after':page.url,'detail_restored':exists}
async def entity_browser_back(page):
 await page.go_back();await page.wait_for_timeout(180)
 return {'status':'PASS' if page.url.endswith('#/projects') and not await visible(page,'.coop-summary') else 'GAP','destination':page.url}

async def language_audit(browser):
 ctx,page=await new_page(browser);await enter(page)
 for code in LANGS:
  await nav(page,'me');await click(page,'[data-mobile-action="language"]');await click(page,'[data-folkoop-guide-lang="'+code+'"]')
  await case(page,'locale/'+code,lambda c=code:locale_result(page,c),'Selected locale, direction and story language coherent','localization')
  await nav(page,'home');g=await geometry(page)
  ROWS.append({'id':'locale-geometry/'+code,'status':'INFO','engine':ENGINE,'viewport':page.viewport_size,'actual':g,'url':page.url})
 await ctx.close()
async def locale_result(page,code):
 x=await page.evaluate('''()=>({lang:document.documentElement.lang,dir:document.documentElement.dir,panelDir:document.querySelector('#networkPanel')?.dir,text:document.querySelector('#networkPanel')?.innerText?.slice(0,800)})''')
 fallback=code not in ('sv','en','ru') and ('Private draft' in x['text'] or 'things and projects' in x['text'])
 rtl_bad=code in ('ar','fa') and x['panelDir']!='rtl'
 return {'pass':x['lang']==code and not rtl_bad and not fallback,'english_story_fallback':fallback,'rtl_panel_mismatch':rtl_bad,**x}

async def city_audit(browser):
 ctx,page=await new_page(browser);await enter(page);await nav(page,'city');f=page.frame_locator('#cityFrame')
 await f.locator('#view').wait_for(state='visible')
 for screen in ('home','nara','rapportera','beslut'):
  async def test(s=screen):
   await f.locator('.bottom-nav [data-screen="'+s+'"]').click();await page.wait_for_timeout(200);text=await f.locator('body').inner_text()
   controls=await f.locator('button:visible,a:visible,input:visible,select:visible,textarea:visible').evaluate_all('''es=>es.map(e=>({tag:e.tagName,id:e.id,screen:e.getAttribute('data-screen'),action:e.getAttribute('data-action'),text:e.innerText?.slice(0,100),href:e.getAttribute('href')}))''')
   INVENTORY['city/'+s]=controls
   return {'pass':len(text)>100 and not re.search(r'демо|пилот|прототип',text,re.I),'text':text[:2400]}
  await case(page,'city/'+screen,test,'City subsection opens without legacy demo/pilot shell')
 await case(page,'city/fullscreen-context',lambda:city_popup(page),'Full-screen City preserves Mura context')
 await ctx.close()
async def city_popup(page):
 link=page.locator('a[href*="city.html"]').first;href=await link.get_attribute('href')
 async with page.expect_popup() as info:await link.click()
 pop=await info.value;await pop.wait_for_load_state('domcontentloaded');url=pop.url;text=await pop.locator('body').inner_text()
 await pop.screenshot(path=str(OUT/'city-fullscreen.png'));await pop.close()
 return {'pass':'mura=1' in url,'href':href,'opened_url':url,'text':text[:2200]}

async def exit_audit(browser,blocked=False):
 ctx,page=await new_page(browser,blocked=blocked);await enter(page)
 if blocked:
  await nav(page,'city');await case(page,'storage-blocked/mura-city',lambda:blocked_city(page),'Mura knows her city even without browser storage')
 await nav(page,'me');await click(page,'[data-net="logout"]')
 suffix='-storage-blocked' if blocked else ''
 await case(page,'exit-gate'+suffix,lambda:exit_gate(page),'Account access only after explicit exit')
 await click(page,'[data-entry="guest"]')
 await case(page,'exit-cancel-return'+suffix,lambda:return_home(page),'Return from exit sheet restores Mura')
 await nav(page,'me');await click(page,'[data-net="logout"]');await click(page,'[data-entry="email"]')
 await page.locator('#netLogin').wait_for(state='visible')
 await case(page,'account-boundary'+suffix,lambda:account_boundary(page),'Account entry distinct; no fictional unread counters')
 if not blocked:
  for route in ('together','projects','messages'):
   await nav(page,route);await case(page,'signed-out-nav/'+route,lambda:account_other_route(page),'Signed-out view does not look like Mura','contract-gap')
  await nav(page,'me');await case(page,'account/empty-email',lambda:empty_email(page),'Empty email rejected without outbound auth request')
  await click(page,'[data-net="localGuest"]')
  await case(page,'local/profile-editor',lambda:local_profile(page),'Local profile edits without network submission')
  await case(page,'local/draft-lifecycle',lambda:local_draft(page),'Local create/search/complete/delete round trip')
 await ctx.close()
async def blocked_city(page):
 text=await page.locator('body').inner_text();return {'pass':await visible(page,'#cityFrame') and 'Укажи свой город' not in text,'text':text[:1800]}
async def exit_gate(page):return {'pass':await visible(page,'#folkoopEntryGate') and await visible(page,'[data-entry="email"]'),'title':await page.locator('#entryGateTitle').inner_text()}
async def return_home(page):return {'pass':await visible(page,'.mura-home') and not await visible(page,'#netLogin'),'url':page.url}
async def account_boundary(page):
 title=await page.locator('.pilot-login-shell h2').inner_text();navtext=await page.locator('#mobilePrimaryNav').inner_text();stale=bool(re.search(r'\b[135]\b',navtext))
 return {'pass':not await visible(page,'#folkoopGuideActor') and not stale,'title':title,'helper_visible':await visible(page,'#folkoopGuideActor'),'nav':navtext,'stale_fixture_badges':stale}
async def account_other_route(page):
 v=await visible(page,'#folkoopGuideActor')
 return {'status':'GAP' if v else 'PASS','helper_visible':v,'login_visible':await visible(page,'#netLogin'),'text':(await page.locator('body').inner_text())[:1300]}
async def empty_email(page):
 before=len(NET);await page.locator('#netLogin [name="email"]').fill('');await click(page,'#netLogin button[name="operation"]')
 invalid=await page.locator('#netLogin [name="email"]').evaluate('(e)=>!e.validity.valid')
 return {'pass':invalid and len(NET)==before,'invalid':invalid,'new_external_requests':len(NET)-before}
async def local_profile(page):
 await click(page,'.my-place-hero [data-action="toggle-my-place-editor"]');await page.locator('#profileForm [name="name"]').fill('QA local sample');await page.locator('#profileForm [name="city"]').fill('Göteborg');await click(page,'#profileForm button[type="submit"]')
 return {'pass':'QA local sample' in await page.locator('.my-place-hero').inner_text(),'status_text':await page.locator('#status').inner_text()}
async def local_draft(page):
 await nav(page,'projects');await click(page,'[data-create="project"]');await page.locator('#draftForm [name="title"]').fill('QA local project');await page.locator('#draftForm [name="body"]').fill('Isolated browser draft; never published.');await click(page,'#draftForm button[type="submit"]')
 await page.locator('#draftSearch').fill('QA local project');found=await page.locator('.draft').count();await click(page,'.draft [data-toggle]');completed=await page.locator('.draft.complete').count()==1
 page.once('dialog',lambda d:d.accept());await click(page,'.draft [data-delete]')
 return {'pass':found==1 and completed and await page.locator('.draft').count()==0,'found':found,'completed':completed,'remaining':await page.locator('.draft').count()}

async def main():
 async with async_playwright() as pw:
  engine=getattr(pw,ENGINE);browser=await engine.launch(**({'args':['--no-sandbox']} if ENGINE=='chromium' else {}))
  suites=[('tour',lambda:tour_audit(browser))]
  suites += [(f'core-{w}-{h}',lambda w=w,h=h:core_audit(browser,w,h)) for w,h in [(320,844),(390,844),(1280,900)]]
  suites += [('languages',lambda:language_audit(browser)),('city',lambda:city_audit(browser)),('exit-local',lambda:exit_audit(browser)),('blocked-storage',lambda:exit_audit(browser,True))]
  for label,fn in suites:
   try:await fn()
   except Exception as e:
    ROWS.append({'id':'suite/'+label,'status':'ERROR','engine':ENGINE,'actual':{'error':str(e),'trace':traceback.format_exc()[-1600:]}});print('ERROR suite',label,str(e),flush=True)
  await browser.close()
 summary={'engine':ENGINE,'baseline':'c1a3dc8ef8d907a43809b78b975805ab015ef93b','check_counts':dict(collections.Counter(r['status'] for r in ROWS)),'clicks':ACTIONS,'blocked_external_requests':len(NET),'blocked_non_get_requests':sum(x['method'] not in ('GET','HEAD','OPTIONS') for x in NET),'limits':['Isolated build, not a physical iPhone','No live account, email, purchase, message or official submission','External sources blocked; freshness/availability not certified','Successful audit execution is not product acceptance']}
 for name,data in [('matrix',ROWS),('inventory',INVENTORY),('network',NET),('js-errors',ERRORS),('summary',summary)]:
  (OUT/(name+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2))
 print(json.dumps(summary,ensure_ascii=False,indent=2))
 if os.getenv('GITHUB_STEP_SUMMARY'):
  with open(os.environ['GITHUB_STEP_SUMMARY'],'a') as f:f.write('## Audit execution complete — NOT release acceptance\n```json\n'+json.dumps(summary,ensure_ascii=False,indent=2)+'\n```\nSee matrix.json for every PASS/FAIL/GAP/ERROR.\n')
if __name__=='__main__':asyncio.run(main())
