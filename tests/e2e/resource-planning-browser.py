"""Full existing FOLKOOP shell with direct R1 hooks and synthetic HTTP.
The feature gate is enabled only by this test interceptor. Not hosted acceptance.
"""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.environ['BASE_URL']
API='https://abcdefghijklmnopqrst.supabase.co'
UID='11111111-1111-4111-8111-111111111111'
P='22222222-2222-4222-8222-222222222222'
R='33333333-3333-4333-8333-333333333333'
OUT=Path('qa-output');OUT.mkdir(exist_ok=True)
async def main():
 passed=[];errors=[]
 coop=lambda id,kind,title:{'id':id,'owner_id':UID,'kind':kind,'title':title,'description':'Synthetic R1 integration fixture','location_text':'Göteborg','status':'open','target_quantity':None,'unit':'','created_at':'2026-10-06T10:00:00Z','updated_at':'2026-10-06T10:00:00Z'}
 state={'requirements':[],'availability':None,'revision':0,'calls':[],'failure':None}
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  context=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':390,'height':844})
  async def routing(route):
   url=route.request.url
   if url.endswith('/network-config.js'):
    await route.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps({'enabled':True,'url':API,'publishableKey':'sb_publishable_example_for_tests_only','resourcePlanningEnabled':True})+';',content_type='application/javascript');return
   if url.startswith(API):
    a=route.request.post_data_json if route.request.post_data else {};state['calls'].append((url,a));result=[]
    resource='/fk_resource_' in url or '/fk_save_resource_' in url or '/fk_remove_resource_' in url or '/fk_export_resource_' in url
    if resource and state['failure']:
     await route.fulfill(status=409 if state['failure']=='40001' else 404,json={'code':state['failure'],'message':'private error must not be rendered'});return
    if url.endswith('/verify'):result={'access_token':'synthetic-test-session','expires_in':3600}
    elif url.endswith('/user'):result={'id':UID}
    elif url.endswith('/fk_claim_pilot_invite'):result=True
    elif '/fk_profiles?' in url:result=[{'id':UID,'name':'Synthetic R1 owner','skills':'','about':'','listed':True}]
    elif '/fk_cooperations?' in url:result=[coop(P,'project','R1 repair project'),coop(R,'resource','R1 materials')]
    elif '/fk_cooperation_members?' in url:result=[{'cooperation_id':id,'user_id':UID,'role':'owner','joined_at':'2026-10-06T10:00:00Z'} for id in [P,R]]
    elif '/fk_resource_requirements?' in url:result=state['requirements']
    elif '/fk_resource_availability?' in url:result=[state['availability']] if state['availability'] else []
    elif url.endswith('/fk_resource_availability_revision'):result=state['revision']
    elif url.endswith('/fk_save_resource_requirement'):
     state['requirements']=[e for e in state['requirements'] if e['id']!=a['p_id']]+[{'id':a['p_id'],'cooperation_id':P,'flow_id':a['p_flow'],'title':a['p_title'],'kind':a['p_kind'],'quantity':a['p_quantity'],'unit':a['p_unit'],'needed_from':a['p_from'],'needed_until':a['p_until'],'conditions':a['p_conditions'],'revision':a['p_expected_revision']+1}]
     result=a['p_expected_revision']+1
    elif url.endswith('/fk_remove_resource_requirement'):
     state['requirements']=[e for e in state['requirements'] if e['id']!=a['p_id']];result=True
    elif url.endswith('/fk_save_resource_availability'):
     state['revision']=a['p_expected_revision']+1
     state['availability']={'resource_id':R,'kind':a['p_kind'],'quantity':a['p_quantity'],'unit':a['p_unit'],'available_from':a['p_from'],'available_until':a['p_until'],'conditions':a['p_conditions'],'revision':state['revision']};result=state['revision']
    elif url.endswith('/fk_remove_resource_availability'):state['availability']=None;state['revision']+=1;result=True
    await route.fulfill(body=json.dumps(result),content_type='application/json');return
   await route.continue_()
  await context.route('**/*',routing)
  page=await context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept())
  await page.goto(BASE+'#/me')
  await page.fill('#netLogin [name=email]','synthetic@example.test');await page.click('#netLogin [value=code]')
  await page.fill('#netLogin [name=code]','123456');await page.check('#netLogin [name=policyAccepted]');await page.click('#netLogin [value=verify]')
  await expect(page.locator('#netProfile')).to_be_visible()
  passed.append('Existing sign-in and admission UI is reused unchanged')
  await page.evaluate("location.hash='#/projects'")
  await page.locator('[data-coop=open][data-id="'+P+'"]').click()
  await expect(page.locator('[data-rp-form=project]')).to_be_visible()
  await page.locator('[data-rp-form] [name=title]').fill('R1 material <script>not executed</script>')
  await page.locator('[data-rp-form] [name=quantity]').fill('0.125')
  await page.locator('[data-rp-form] [name=conditions]').fill('Synthetic private conditions')
  await page.locator('[data-rp-save]').click()
  await expect(page.locator('.rp-records')).to_contain_text('R1 material <script>')
  assert state['requirements'][0]['quantity']=='0.125'
  assert await page.locator('.rp-records script').count()==0
  assert any('quantity::text' in u for u,_ in state['calls'])
  passed.append('Project detail form uses existing client plus exact-string R1 RPC and safe text')
  await page.locator('[data-rp-action=edit]').click()
  await page.locator('[data-rp-form] [name=quantity]').fill('2')
  state['failure']='40001';await page.locator('[data-rp-save]').click()
  await expect(page.locator('[data-rp-save]')).to_be_disabled()
  assert 'private error' not in await page.locator('[data-resource-planning-panel]').inner_text()
  state['failure']=None;await page.locator('[data-rp-action=refresh]').click()
  await expect(page.locator('[data-rp-save]')).to_be_enabled()
  passed.append('HTTP conflict retains draft, locks mutation and requires explicit reload')
  for language in ['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk']:
   # The existing shell hides its desktop language selector at mobile widths.
   await page.set_viewport_size({'width':1280,'height':844})
   await page.locator('#language').select_option(language)
   await page.set_viewport_size({'width':390,'height':844})
   await expect(page.locator('[data-rp-form=project]')).to_be_visible()
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  await page.set_viewport_size({'width':1280,'height':844})
  await page.locator('#language').select_option('ru')
  await page.set_viewport_size({'width':390,'height':844})
  await page.screenshot(path=str(OUT/'r1-project-in-shell-390.png'),full_page=True)
  passed.append('R1 survives actual shell language rerenders in eleven languages at 390px')
  await page.locator('[data-rp-action=edit]').click();await page.locator('[data-rp-action=remove]').click()
  await expect(page.locator('.rp-records')).to_have_count(0)
  await page.locator('[data-coop=back]').click();await page.evaluate("location.hash='#/together'")
  await page.locator('[data-coop=open][data-id="'+R+'"]').click()
  await expect(page.locator('[data-rp-form=resource]')).to_be_visible()
  await page.locator('[data-rp-form] [name=quantity]').fill('0')
  await page.locator('[data-rp-save]').click()
  await expect(page.locator('[data-rp-action=remove]')).to_be_visible()
  assert state['availability']['quantity']=='0'
  await page.locator('[data-rp-action=remove]').click();await expect(page.locator('[data-rp-action=remove]')).to_have_count(0)
  await page.locator('[data-rp-form] [name=quantity]').fill('0.3');await page.locator('[data-rp-save]').click()
  await expect(page.locator('[data-rp-action=remove]')).to_be_visible()
  assert state['revision']==3
  passed.append('Resource detail handles missing, zero, erase and explicit new generation')
  state['failure']='PGRST202';await page.locator('[data-rp-action=refresh]').click()
  await expect(page.locator('[data-rp-status]')).to_contain_text('модуль недоступен')
  await expect(page.locator('[data-rp-save]')).to_be_disabled()
  state['failure']=None
  passed.append('Missing RPC fails closed rather than showing successful empty data')
  await page.evaluate("location.hash='#/me'")
  await page.locator('[data-net=logout]').click();await expect(page.locator('#netLogin')).to_be_visible()
  assert await page.locator('[data-rp-form]').count()==0
  assert 'Synthetic private conditions' not in await page.locator('#networkPanel').inner_text()
  passed.append('Leaving account clears resource panel without preserving private draft')
  assert not errors,errors
  await browser.close()
 (OUT/'r1-full-shell.json').write_text(json.dumps({'synthetic_http':True,'production':False,'passed':len(passed),'checks':passed},ensure_ascii=False,indent=2))
 print(json.dumps({'passed':len(passed),'checks':passed},ensure_ascii=False))
asyncio.run(main())
