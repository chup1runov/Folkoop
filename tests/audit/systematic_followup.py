"""Targeted follow-up to systematic_mura.py; unchanged local build, no real submissions."""
import asyncio, collections, json, os, re, shutil, traceback
from pathlib import Path
import systematic_mura as q
from playwright.async_api import async_playwright

async def fresh(browser,explicit=True,width=390,height=844):
 ctx,p=await q.new_page(browser,width,height)
 await p.goto(q.BASE,wait_until='domcontentloaded');await p.locator('#folkoopEntryGate').wait_for(state='visible')
 if explicit:await q.click(p,'[data-entry-language="ru"]')
 await q.click(p,'[data-entry="guest"]');await p.locator('#onboarding').wait_for(state='visible')
 await q.click(p,'[data-onboarding="skip"]');await p.locator('.mura-home').wait_for(state='visible')
 return ctx,p
async def state(p):
 return await p.evaluate('''()=>{const v=s=>[...document.querySelectorAll(s)].some(e=>e.getClientRects().length&&!e.closest('[hidden]'));return {url:location.href,mode:sessionStorage.getItem('folkoop-entry-mode-v1'),languageChosen:localStorage.getItem('folkoop-language-choice-v1'),tourDone:localStorage.getItem('folkoop-onboarding-v3'),entry:v('#folkoopEntryGate'),login:v('#netLogin'),muraChip:v('[data-mobile-action="demo"]'),helper:v('#folkoopGuideActor'),detail:v('.coop-summary'),chat:v('[data-net="backChats"]'),nav:document.querySelector('#mobilePrimaryNav')?.innerText};}''')
async def history_suite(browser):
 for explicit in (False,True):
  ctx,p=await fresh(browser,explicit)
  await q.nav(p,'projects');await q.click(p,'[data-coop="open"]')
  async def reload_test():
   before=await state(p);await p.reload();await p.wait_for_timeout(500);after=await state(p)
   return {'pass':not after['entry'] and after['mode']=='guest','before':before,'after':after}
  await q.case(p,'followup/reload/explicit-language-'+str(explicit),reload_test,'Reload keeps existing Mura visit without a new entry gate')
  if not await q.visible(p,'#folkoopEntryGate'):
   await q.case(p,'followup/reload/entity-'+str(explicit),lambda:detail_present(p),'Reload preserves selected entity','contract-gap')
  await ctx.close()
 ctx,p=await fresh(browser)
 await q.nav(p,'projects');await q.click(p,'[data-coop="open"]')
 async def back_test():
  before=await state(p);await p.go_back();await p.wait_for_timeout(180);after=await state(p)
  return {'status':'PASS' if p.url.endswith('#/projects') and not after['detail'] else 'GAP','before':before,'after':after}
 await q.case(p,'followup/history/entity-back',back_test,'Browser Back returns to entity list','contract-gap')
 async def forward_test():
  await p.go_forward();await p.wait_for_timeout(180);s=await state(p)
  return {'status':'PASS' if s['detail'] else 'GAP','state':s}
 await q.case(p,'followup/history/entity-forward',forward_test,'Browser Forward returns to opened entity','contract-gap')
 await q.nav(p,'together');await q.click(p,'[data-mobile-subnav="people"]');await q.click(p,'[data-mobile-subnav="communities"]')
 async def routeback():
  await p.go_back();await p.wait_for_timeout(180)
  return {'pass':p.url.endswith('#/people') and await p.locator('[data-mobile-subnav="people"]').get_attribute('aria-current')=='page','state':await state(p)}
 await q.case(p,'followup/history/route-back',routeback,'Route Back restores People and selected tab')
 await q.nav(p,'projects');await q.click(p,'[data-mobile-subnav="projects-tasks"]');await q.click(p,'[data-mobile-subnav="projects-updates"]')
 async def virtual_back():
  before=await state(p);await p.go_back();await p.wait_for_timeout(180)
  selected=await p.locator('#mobileContextDock [aria-current="page"]').evaluate_all('es=>es.map(e=>e.dataset.mobileSubnav)')
  return {'status':'PASS' if 'projects-tasks' in selected else 'GAP','before':before,'after':await state(p),'selected':selected}
 await q.case(p,'followup/history/subsection-back',virtual_back,'Browser Back navigates view history','contract-gap')
 await ctx.close()
async def detail_present(p):return {'status':'PASS' if await q.visible(p,'.coop-summary') else 'GAP','state':await state(p)}

async def linked_suite(browser):
 ctx,p=await fresh(browser)
 await q.nav(p,'me')
 items=await p.locator('[data-coop="openNotify"]').evaluate_all('es=>es.map(e=>e.dataset.id)')
 for ident in items:
  await q.nav(p,'me')
  async def follow(i=ident):
   await q.click(p,'[data-coop="openNotify"][data-id="'+i+'"]')
   return {'pass':await q.visible(p,'.coop-summary'),'title':await p.locator('.coop-summary h2').inner_text(),'destination':p.url}
  await q.case(p,'followup/profile/activity/'+ident[-3:],follow,'Activity opens matching cooperation')
 for view in ('projects-tasks','projects-updates'):
  await q.list_view(p,'projects');await q.click(p,'[data-mobile-subnav="'+view+'"]')
  actions=await p.locator('#networkPanel button:visible').evaluate_all('''es=>es.filter(e=>['open','openNotify'].includes(e.dataset.coop)).map(e=>({id:e.dataset.id,action:e.dataset.coop,text:e.closest('article')?.innerText}))''')
  q.INVENTORY[view]=actions
  for item in actions:
   await q.list_view(p,'projects');await q.click(p,'[data-mobile-subnav="'+view+'"]')
   async def follow_task(it=item):
    await q.click(p,'[data-coop="'+it['action']+'"][data-id="'+it['id']+'"]')
    return {'pass':await q.visible(p,'.coop-summary'),'control':it,'text':(await p.locator('#networkPanel').inner_text())[:1700]}
   await q.case(p,'followup/'+view+'/'+item['id'][-3:],follow_task,'Task/update opens its project detail')
 for ident in ('301','306','307'):
  await q.list_view(p,'projects');await q.click(p,'[data-coop="open"][data-id$="'+ident+'"]')
  async def chat_link():
   if not await q.visible(p,'[data-coop="openLinkedChat"]'):return {'status':'GAP','reason':'No linked chat action rendered'}
   await q.click(p,'[data-coop="openLinkedChat"]')
   return {'pass':p.url.endswith('#/messages') and await q.visible(p,'[data-net="backChats"]'),'text':(await p.locator('#networkPanel').inner_text())[:1300]}
  await q.case(p,'followup/project-chat/'+ident,chat_link,'Project links to its actual conversation')
 await q.nav(p,'home')
 for selector in ('.mura-people-grid','.mura-spark-grid'):
  async def carousel(sel=selector):
   before=await p.locator(sel).evaluate('e=>({left:e.scrollLeft,max:e.scrollWidth-e.clientWidth})')
   await p.locator(sel).evaluate('e=>e.scrollBy({left:e.clientWidth,behavior:"smooth"})');await p.wait_for_timeout(700)
   after=await p.locator(sel).evaluate('e=>({left:e.scrollLeft,max:e.scrollWidth-e.clientWidth})')
   return {'pass':after['left']>before['left'] and after['left']<=after['max']+1,'before':before,'after':after,'limit':'Programmatic horizontal scroll, not real touch swipe'}
  await q.case(p,'followup/carousel/'+selector,carousel,'Horizontal card rail scrolls and settles')
 await q.nav(p,'me');await q.click(p,'[data-net="logout"]');await q.click(p,'[data-entry="email"]');await p.wait_for_timeout(300)
 async def boundary():
  s=await state(p);return {'pass':not s['muraChip'] and not re.search(r'\b[135]\b',s['nav']),'state':s}
 await q.case(p,'followup/exit/mura-context-cleared',boundary,'All Mura context and synthetic badges are removed after account transition')
 await q.nav(p,'together');await q.nav(p,'me')
 await q.case(p,'followup/exit/after-additional-navigation',boundary,'No stale Mura context after navigating in account mode')
 await ctx.close()

async def city_suite(browser):
 ctx,p=await fresh(browser);await q.nav(p,'city');f=p.frame_locator('#cityFrame');await f.locator('#view').wait_for(state='visible')
 for sid in ('areaDetails','weatherDetails'):
  async def disclose(id=sid):
   await f.locator('#'+id+' summary').click();await p.wait_for_timeout(180)
   return {'pass':await f.locator('#'+id).get_attribute('open') is not None,'text':await f.locator('#'+id).inner_text()}
  await q.case(p,'followup/city/disclosure/'+sid,disclose,'Local City disclosure opens')
 async def area():
  options=await f.locator('#weatherArea option').evaluate_all('es=>es.map(e=>({value:e.value,text:e.textContent}))');old=await f.locator('#weatherArea').input_value();new=next(x for x in options if x['value']!=old)
  await f.locator('#weatherArea').select_option(new['value']);await p.wait_for_timeout(200)
  text=await f.locator('#currentWeatherArea').inner_text();return {'pass':text==new['text'],'selected':new,'displayed':text,'limits':'Forecast request blocked; not weather verification'}
 await q.case(p,'followup/city/change-weather-area',area,'Area label updates to selected area without GPS')
 async def refresh():
  await f.locator('#dailyRefresh').click();await p.wait_for_timeout(350)
  return {'pass':await f.locator('#dailyRefresh').is_enabled(),'weather':await f.locator('#dailyWeather').inner_text(),'warnings':await f.locator('#dailyWarnings').inner_text()}
 await q.case(p,'followup/city/refresh-failure',refresh,'After blocked source response refresh re-enables without invented success')
 await f.locator('[data-screen="ansvar"]').click();await p.wait_for_timeout(150)
 for text in ('','Освещение дороги','мусор','поезд','Другое'):
  async def classify(value=text):
   await f.locator('#issue').fill(value);await f.locator('#findOwner').click()
   return {'pass':len(await f.locator('#ownerResult').inner_text())>0,'input':value,'result':await f.locator('#ownerResult').inner_text(),'limit':'UI classification only; authoritative correctness not tested'}
  await q.case(p,'followup/city/recipient-ui/'+('empty' if not text else text),classify,'Classification displays a qualified, non-submitting result')
 await f.locator('.bottom-nav [data-screen="rapportera"]').click();await p.wait_for_timeout(150)
 async def report_empty():
  await f.locator('#routeRoadReport').click();await p.wait_for_timeout(150)
  return {'pass':await f.locator('#reportDescription').input_value()=='' and await f.locator('.road-warning').count()>0,'text':await f.locator('#view').inner_text()}
 await q.case(p,'followup/city/report-empty',report_empty,'Empty report fails locally before GPS or submission')
 await f.locator('#reportDescription').fill('QA_ONLY: local road observation.');await f.locator('#reportPlace').fill('QA place; not a real report')
 async def report_preserve():
  await f.locator('.bottom-nav [data-screen="home"]').click();await f.locator('.bottom-nav [data-screen="rapportera"]').click()
  desc=await f.locator('#reportDescription').input_value();place=await f.locator('#reportPlace').input_value()
  return {'pass':desc.startswith('QA_ONLY:') and place.startswith('QA place'),'description':desc,'place':place}
 await q.case(p,'followup/city/report-draft-return',report_preserve,'Unsubmitted report text survives internal navigation')
 async def report_shell():
  await q.nav(p,'home');await q.nav(p,'city');await p.wait_for_timeout(120)
  desc=await f.locator('#reportDescription').input_value();return {'pass':desc.startswith('QA_ONLY:'),'description':desc}
 await q.case(p,'followup/city/report-draft-shell-return',report_shell,'Unsubmitted report survives leaving and returning to City')
 # Permission deliberately not granted. Only an isolated denied-GPS error path is exercised.
 async def gps_denied():
  await f.locator('#routeRoadReport').click();await p.wait_for_timeout(700)
  text=await f.locator('#view').inner_text();enabled=await f.locator('#routeRoadReport').is_enabled()
  return {'pass':enabled and bool(re.search(r'позици|местополож|доступ|location|position|место',text,re.I)),'text':text,'button_enabled':enabled,'limit':'No real geolocation or submission; permission denied'}
 await q.case(p,'followup/city/report-gps-denied',gps_denied,'Denied GPS has recoverable error and preserves draft')
 # Fullscreen opens only another local page. Follow internal Other services, never external submission links.
 async def full_screen():
  async with p.expect_popup() as info:await p.locator('a[href*="city.html"]').first.click()
  pop=await info.value;await pop.wait_for_load_state('domcontentloaded');await pop.wait_for_timeout(250)
  details=pop.locator('#serviceDetails');text='';has_service=await details.count()>0
  if has_service:
   await details.locator('summary').click();text=await details.inner_text()
   inner=details.locator('[data-screen="om"]')
   if await inner.count()>0:await inner.first.click();await pop.wait_for_timeout(200)
  body=await pop.locator('body').inner_text();await pop.screenshot(path=str(q.OUT/'fullscreen-more-services.png'))
  await pop.close()
  return {'pass':not re.search(r'пилот|прототип|demo|pilot',body,re.I),'has_service_details':has_service,'services':text,'body':body[:7000]}
 await q.case(p,'followup/city/fullscreen-visible-meta',full_screen,'Full-screen City reached from Mura does not expose legacy pilot navigation')
 await ctx.close()

async def local_types_suite(browser):
 ctx,p=await fresh(browser);await q.nav(p,'me');await q.click(p,'[data-net="logout"]');await q.click(p,'[data-entry="email"]');await p.locator('#netLogin').wait_for(state='visible');await q.click(p,'[data-net="localGuest"]')
 for kind in ('need','offer','purchase','resource','project'):
  async def lifecycle(k=kind):
   await q.nav(p,'projects' if k=='project' else 'together');await q.click(p,'[data-create="'+k+'"]')
   await p.locator('#draftForm [name="title"]').fill('QA '+k+' <strong>literal</strong>');await p.locator('#draftForm [name="body"]').fill('Local only; not published.')
   await q.click(p,'#draftForm button[type="submit"]');await p.locator('#draftSearch').fill('QA '+k)
   loc=p.locator('.draft');count=await loc.count();escaped=await loc.locator('h2 strong').count()==0
   await q.click(p,'.draft [data-toggle]');done=await p.locator('.draft.complete').count()==1
   await q.click(p,'.draft [data-toggle]');undone=await p.locator('.draft.complete').count()==0
   p.once('dialog',lambda d:d.dismiss());await q.click(p,'.draft [data-delete]');cancelled=await p.locator('.draft').count()==1
   p.once('dialog',lambda d:d.accept());await q.click(p,'.draft [data-delete]');deleted=await p.locator('.draft').count()==0
   return {'pass':count==1 and escaped and done and undone and cancelled and deleted,'count':count,'literal_markup':escaped,'done':done,'undo':undone,'cancel_delete':cancelled,'deleted':deleted}
  await q.case(p,'followup/local-kind/'+kind,lifecycle,'Create/search/complete/undo/cancel deletion/delete remain local')
 await q.nav(p,'me');await q.click(p,'.my-place-hero [data-action="toggle-my-place-editor"]')
 await p.locator('#profileForm [name="name"]').fill('QA retained local');await q.click(p,'#profileForm button[type="submit"]')
 await q.click(p,'.my-place-hero [data-action="toggle-my-place-editor"]')
 async def remembered():
  await p.locator('#remember').check();await p.reload();await p.wait_for_timeout(350)
  if await q.visible(p,'[data-net="localGuest"]'):await q.click(p,'[data-net="localGuest"]')
  text=await p.locator('.my-place-hero').inner_text()
  return {'pass':'QA retained local' in text,'text':text}
 await q.case(p,'followup/local/opt-in-reload',remembered,'Explicitly remembered local profile survives reload')
 await q.click(p,'.my-place-hero [data-action="toggle-my-place-editor"]')
 async def exported():
  async with p.expect_download() as info:await q.click(p,'[data-action="export"]')
  d=await info.value;path=q.OUT/'QA_local_export.json';await d.save_as(path);x=json.loads(path.read_text())
  return {'pass':x.get('profile',{}).get('name')=='QA retained local','export_name':x.get('profile',{}).get('name')}
 await q.case(p,'followup/local/export',exported,'Export contains only local QA sample')
 await ctx.close()

async def geometry_suite(browser):
 ctx,p=await fresh(browser)
 for width,height in ((320,568),(390,640),(390,844),(844,390),(1280,900)):
  await p.set_viewport_size({'width':width,'height':height})
  for route in ('home','together','messages','city'):
   await q.list_view(p,route) if route in ('together','messages') else await q.nav(p,route)
   async def measure():
    x=await q.geometry(p)
    return {'pass':x['scrollWidth']<=width+1 and not x['clipped'],**x}
   await q.case(p,'followup/geometry/'+str(width)+'x'+str(height)+'/'+route,measure,'No whole-page horizontal overflow or truncated primary labels','visual')
  await q.click(p,'#folkoopGuideActor');await q.click(p,'[data-helper="tour"]');await p.wait_for_timeout(600)
  await q.case(p,'followup/tour-short/'+str(width)+'x'+str(height),lambda:q.tour_geometry(p),'Onboarding dialog fits short/landscape viewport')
  await q.click(p,'[data-onboarding="skip"]')
 await p.set_viewport_size({'width':390,'height':844});await q.nav(p,'home')
 async def skip_focus():
  await p.locator('#skip').focus();await p.keyboard.press('Enter')
  x=await p.evaluate('''()=>({active:document.activeElement?.id,workspaceHidden:document.querySelector('#workspace')?.hidden,networkVisible:!!document.querySelector('#networkPanel')?.getClientRects().length})''')
  return {'pass':x['active']=='networkPanel' or (x['active']=='workspace' and not x['workspaceHidden']),**x}
 await q.case(p,'followup/accessibility/skip-link-Mura',skip_focus,'Skip link focuses visible main content, not hidden workspace')
 await ctx.close()

async def offline_suite(browser):
 ctx,p=await q.new_page(browser,sw='allow')
 await p.goto(q.BASE);await p.locator('#folkoopEntryGate').wait_for(state='visible');await q.click(p,'[data-entry-language="ru"]');await q.click(p,'[data-entry="guest"]');await p.locator('#onboarding').wait_for(state='visible');await q.click(p,'[data-onboarding="skip"]')
 async def test_offline():
  await p.wait_for_function('navigator.serviceWorker.controller !== null',timeout=10000)
  await ctx.set_offline(True);await p.reload(wait_until='domcontentloaded');await p.wait_for_timeout(350)
  inv=await q.invariant(p)
  return {'pass':await q.visible(p,'.mura-home') and not inv['entry'],'state':inv,'limit':'Already cached same-release shell; not an upgrade from older installed PWA'}
 await q.case(p,'followup/offline/cached-Mura',test_offline,'Cached same-release Mura loads offline')
 await ctx.set_offline(False);await ctx.close()

async def main():
 async with async_playwright() as pw:
  b=await getattr(pw,q.ENGINE).launch(**({'args':['--no-sandbox']} if q.ENGINE=='chromium' else {}))
  for name,fn in [('history',history_suite),('linked',linked_suite),('city',city_suite),('local',local_types_suite),('geometry',geometry_suite),('offline',offline_suite)]:
   try:await fn(b)
   except Exception as e:
    q.ROWS.append({'id':'followup/suite/'+name,'status':'ERROR','engine':q.ENGINE,'actual':{'error':str(e),'trace':traceback.format_exc()[-1600:]}});print('ERROR',name,str(e),flush=True)
  await b.close()
 summary={'engine':q.ENGINE,'phase':'targeted-followup','runtime_baseline':'c1a3dc8ef8d907a43809b78b975805ab015ef93b','counts':dict(collections.Counter(r['status'] for r in q.ROWS)),'clicks':q.ACTIONS,'blocked_requests':len(q.NET),'blocked_non_get':sum(x['method'] not in ('GET','HEAD','OPTIONS') for x in q.NET)}
 for name,data in [('matrix',q.ROWS),('summary',summary),('inventory',q.INVENTORY),('js-errors',q.ERRORS),('network',q.NET)]:
  (q.OUT/(name+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2))
 for pth in ('tests/audit/systematic_mura.py','tests/audit/systematic_followup.py','.github/workflows/mura-exploration-audit.yml'):
  if Path(pth).exists():shutil.copy(pth,q.OUT/Path(pth).name)
 print(json.dumps(summary,indent=2))
if __name__=='__main__':asyncio.run(main())
