"""Real DOM tests of the R1 form + transport + validators using synthetic responses.
Runs without a server from file content; no real Auth/database/physical outcome.
"""
import asyncio,json,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'qa-output'; OUT.mkdir(exist_ok=True)
P='11111111-1111-4111-8111-111111111111'
R='22222222-2222-4222-8222-222222222222'
async def main():
 checks=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':390,'height':844})
  await page.set_content('<!doctype html><html lang="ru"><head><meta charset="utf-8"></head><body><main><section id="rp"></section></main></body></html>')
  for f in ['resource-planning-core.js','resource-planning-lifecycle.js','resource-planning-transport.js','resource-planning-copy.js','resource-planning-forms.js']:
   await page.add_script_tag(content=(ROOT/'apps/web'/f).read_text())
  await page.add_style_tag(content=(ROOT/'apps/web/resource-planning-forms.css').read_text())
  await page.evaluate('''([P,R])=>{
   window.calls=[];window.entries=[];window.av=null;window.rev=0;window.errorCode=null;window.listeners=[];window.epoch=1;window.uid=P;
   window.api=FolkoopResourceTransport.create({context:()=>({userId:uid,epoch}),onChange:f=>{listeners.push(f);return ()=>{};},request:async(path,options)=>{
    calls.push({path,body:options.body});if(errorCode)throw Object.assign(new Error('private detail'),{code:errorCode});
    const a=options.body;
    if(path.includes('fk_resource_requirements?'))return entries;
    if(path.includes('fk_resource_availability?'))return av?[av]:[];
    if(path.endsWith('/fk_resource_availability_revision'))return rev;
    if(path.endsWith('/fk_save_resource_requirement')){entries=entries.filter(e=>e.id!==a.p_id);entries.push({id:a.p_id,cooperation_id:P,flow_id:a.p_flow,title:a.p_title,kind:a.p_kind,quantity:a.p_quantity,unit:a.p_unit,needed_from:a.p_from,needed_until:a.p_until,conditions:a.p_conditions,revision:a.p_expected_revision+1});return a.p_expected_revision+1;}
    if(path.endsWith('/fk_remove_resource_requirement')){entries=entries.filter(e=>e.id!==a.p_id);return true;}
    if(path.endsWith('/fk_save_resource_availability')){rev=a.p_expected_revision+1;av={resource_id:R,kind:a.p_kind,quantity:a.p_quantity,unit:a.p_unit,available_from:a.p_from,available_until:a.p_until,conditions:a.p_conditions,revision:rev};return rev;}
    if(path.endsWith('/fk_remove_resource_availability')){av=null;rev++;return true;}
    if(path.endsWith('/fk_export_resource_planning'))return {schema_version:1,scope:'own_resource_planning_only',snapshot:false,kind:a.p_kind,records:a.p_kind==='requirements'?entries:av?[av]:[],has_more:false,next_cursor:null};
    throw new Error('Unexpected synthetic request');
   }});
   window.c={coop:{id:P,kind:'project',status:'open'},owner:true,member:true,readOnly:false,user:{id:P},language:'ru'};
   window.form=FolkoopResourceForms.create({api,uuid:()=> '33333333-3333-4333-8333-333333333333',confirm:()=>true,download:p=>window.exported=p});
   window.draw=()=>form.mount(document.getElementById('rp'),c);draw();
  }''',[P,R])
  await expect(page.locator('[data-rp-form]')).to_be_visible()
  await page.locator('[name=title]').fill('<img src=x onerror="window.injected=1">')
  await page.locator('[name=quantity]').fill('0.125')
  await page.locator('[name=conditions]').fill('Private synthetic conditions')
  await page.locator('[data-rp-save]').click()
  await expect(page.locator('.rp-records')).to_contain_text('<img src=x')
  assert await page.locator('.rp-records img').count()==0
  assert not await page.evaluate('window.injected')
  assert (await page.evaluate('entries[0].quantity'))=='0.125'
  checks.append('Project save preserves exact quantity and renders user text safely')
  # Editing, validation and conflicting revisions; no automatic retry.
  await page.locator('[data-rp-action=edit]').click()
  await page.locator('[name=quantity]').fill('1e3')
  n=await page.evaluate('calls.length')
  await page.locator('[data-rp-save]').click()
  await expect(page.locator('[data-rp-status]')).to_contain_text('Проверь')
  assert await page.evaluate('calls.length')==n
  await page.locator('[name=quantity]').fill('2')
  await page.evaluate("errorCode='RESOURCE_CONFLICT'")
  await page.locator('[data-rp-save]').click()
  await expect(page.locator('[data-rp-save]')).to_be_disabled()
  assert await page.locator('[name=quantity]').input_value()=='2'
  await page.evaluate('errorCode=null')
  await page.locator('[data-rp-action=refresh]').click()
  await expect(page.locator('[data-rp-save]')).to_be_enabled()
  checks.append('Invalid quantities make no requests; conflicts retain draft and require reload')
  await page.locator('[data-rp-action=edit]').click()
  await page.locator('[data-rp-action=remove]').click()
  await expect(page.locator('.rp-records')).to_have_count(0)
  checks.append('Confirmed selective deletion reloads without fake reservation claim')
  # Availability empty versus explicit zero, same canonical Resource.
  await page.evaluate('R=>{c={...c,coop:{id:R,kind:"resource",status:"open"}};draw();}',R)
  await expect(page.locator('[data-rp-form=resource]')).to_be_visible()
  await page.locator('[name=quantity]').fill('0')
  await page.locator('[data-rp-save]').click()
  await expect(page.locator('[data-rp-action=remove]')).to_be_visible()
  assert await page.evaluate('av.quantity')=='0'
  await page.locator('[data-rp-action=export]').click()
  assert await page.evaluate('exported.scope')=='own_resource_planning_only'
  assert await page.evaluate('exported.records[0].quantity')=='0'
  await page.locator('[data-rp-action=remove]').click()
  await expect(page.locator('[data-rp-action=remove]')).to_have_count(0)
  assert await page.evaluate('av') is None
  await page.locator('[name=quantity]').fill('0.3')
  await page.locator('[data-rp-save]').click()
  assert await page.evaluate('rev')==3
  checks.append('Private availability distinguishes missing from zero and preserves erase generations')
  # All language packs, RTL and mobile overflow.
  for lang in ['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk']:
   await page.evaluate('lang=>{document.documentElement.lang=lang;document.documentElement.dir=["ar","fa"].includes(lang)?"rtl":"ltr";c.language=lang;draw();}',lang)
   await expect(page.locator('[data-rp-form=resource]')).to_be_visible()
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   assert await page.locator('label').count()>=6
  checks.append('All eleven languages have labelled controls without 390px horizontal overflow')
  await page.evaluate('()=>{c.language="ru";document.documentElement.dir="ltr";draw();}')
  await page.screenshot(path=str(OUT/'r1-resource-form-390.png'),full_page=True)
  # Member of resource does not obtain private inventory.
  before=await page.evaluate('calls.length')
  await page.evaluate('()=>{c.owner=false;draw();}')
  await expect(page.locator('[data-rp-form]')).to_have_count(0)
  assert await page.evaluate('calls.length')==before
  checks.append('Resource membership does not trigger private availability reads')
  # Mura read-only demo: no network, no login interruption, no mutations.
  await page.evaluate('()=>{c={...c,owner:true,readOnly:true,coop:{id:"00000000-0000-4000-8000-000000000306",kind:"project",status:"open"}};draw();}')
  await expect(page.locator('#rp li')).to_have_count(3)
  assert await page.locator('#rp button').count()==0
  assert await page.evaluate('calls.length')==before
  checks.append('Mura planning example is read-only with zero HTTP calls')
  # Auth change immediately erases in-memory draft and rendered private data.
  await page.evaluate('R=>{c={...c,readOnly:false,coop:{id:R,kind:"resource",status:"open"},user:{id:uid}};draw();}',R)
  await expect(page.locator('[name=conditions]')).to_be_visible()
  await page.locator('[name=conditions]').fill('Unsaved private draft')
  await page.evaluate('()=>{epoch++;uid=null;listeners.forEach(f=>f(null));}')
  await expect(page.locator('[data-rp-form]')).to_have_count(0)
  assert 'Unsaved private draft' not in await page.locator('#rp').inner_text()
  checks.append('Auth change immediately clears rendered data and ephemeral drafts')
  # Disabled schema: never empty-success or simulated persistence.
  await page.evaluate('P=>{uid=P;c={...c,user:{id:P},coop:{id:P,kind:"project",status:"open"}};errorCode="RESOURCE_SCHEMA_UNAVAILABLE";draw();}',P)
  await expect(page.locator('[data-rp-status]')).to_contain_text('модуль недоступен')
  assert await page.locator('[data-rp-form]').count()==0
  checks.append('Unavailable schema fails closed without editable empty state')
  await browser.close()
 (OUT/'r1-component.json').write_text(json.dumps({'synthetic':True,'checks':checks,'passed':len(checks)},ensure_ascii=False,indent=2))
 print(json.dumps({'passed':len(checks),'checks':checks},ensure_ascii=False))
asyncio.run(main())
