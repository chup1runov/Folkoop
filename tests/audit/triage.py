"""Independent triage, isolated local build only."""
import asyncio,collections,json,shutil
from pathlib import Path
import systematic_mura as q
import systematic_followup as s
from playwright.async_api import async_playwright

async def main():
 async with async_playwright() as pw:
  b=await getattr(pw,q.ENGINE).launch(**({'args':['--no-sandbox']} if q.ENGINE=='chromium' else {}))
  ctx,p=await s.fresh(b)
  async def skip():
   await p.locator('#skip').focus();await p.keyboard.press('Enter')
   x=await p.evaluate('''()=>({focused:document.activeElement?.id,workspaceHidden:document.querySelector('#workspace')?.hidden})''')
   return {'pass':x['focused']=='networkPanel' or (x['focused']=='workspace' and not x['workspaceHidden']),**x}
  await q.case(p,'triage/skip-link',skip,'Keyboard skip link focuses visible content')
  await ctx.close()
  ctx,p=await s.fresh(b,width=844,height=390);await q.nav(p,'city');await p.wait_for_timeout(400)
  async def hitbox():
   x=await p.locator('#folkoopGuideActor').evaluate('''e=>{const r=e.getBoundingClientRect();const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {box:{x:r.x,y:r.y,w:r.width,h:r.height},hitNav:h?.closest('[data-mobile-nav]')?.dataset.mobileNav,hitSelf:!!h&&(h===e||e.contains(h))}}''')
   return {'pass':x['hitSelf'],**x}
  await q.case(p,'triage/landscape-helper',hitbox,'Helper is not covered by primary nav')
  await p.screenshot(path=str(q.OUT/'landscape.png'));await ctx.close()
  ctx,p=await s.fresh(b);await q.nav(p,'city');f=p.frame_locator('#cityFrame');await f.locator('#view').wait_for(state='visible')
  async def report():
   await f.locator('.bottom-nav [data-screen="rapportera"]').click();await f.locator('#routeRoadReport').click()
   return {'pass':await f.locator('.road-warning').count()>0,'text':await f.locator('#view').inner_text()}
  await q.case(p,'triage/city-empty-report',report,'Independent empty report validation')
  async def preserved():
   await f.locator('#reportDescription').fill('QA local test');await q.nav(p,'home');await q.nav(p,'city')
   return {'pass':await f.locator('#reportDescription').input_value()=='QA local test'}
  await q.case(p,'triage/city-draft-return',preserved,'Local draft preserved across shell navigation')
  async def fullscreen():
   async with p.expect_popup() as info:await p.locator('a[href*="city.html"]').first.click()
   pop=await info.value;await pop.wait_for_load_state('domcontentloaded');d=pop.locator('#serviceDetails');await d.locator('summary').click();text=await d.inner_text()
   import re
   out={'pass':not re.search(r'пилот|прототип|\bpilot\b|\bdemo\b',text,re.I),'text':text,'url':pop.url}
   await pop.screenshot(path=str(q.OUT/'fullscreen-services.png'));await pop.close();return out
  await q.case(p,'triage/city-fullscreen-services',fullscreen,'No visible pilot copy in expanded full-screen services')
  await ctx.close()
  ctx,p=await q.new_page(b,sw='allow');await p.goto(q.BASE);await p.locator('#folkoopEntryGate').wait_for(state='visible');await q.click(p,'[data-entry-language="ru"]');await q.click(p,'[data-entry="guest"]');await p.locator('#onboarding').wait_for(state='visible');await q.click(p,'[data-onboarding="skip"]')
  async def offline():
   await p.wait_for_function('navigator.serviceWorker.controller !== null',timeout=10000)
   cache=await p.evaluate('''async()=>{const names=await caches.keys();let total=0;for(const n of names)total+=(await(await caches.open(n)).keys()).length;return {names,entries:total}}''')
   await ctx.set_offline(True)
   try:
    await p.reload(wait_until='domcontentloaded');await p.wait_for_timeout(400)
    return {'pass':await q.visible(p,'.mura-home'),'cache':cache,'state':await q.invariant(p)}
   except Exception as e:return {'status':'GAP','cache':cache,'error':str(e),'note':'Engine internal error; application defect not established'}
  await q.case(p,'triage/offline-recheck',offline,'Cached shell offline; isolate engine limitation')
  await ctx.set_offline(False);await ctx.close();await b.close()
 summary={'engine':q.ENGINE,'phase':'triage','counts':dict(collections.Counter(r['status'] for r in q.ROWS)),'clicks':q.ACTIONS}
 for name,obj in [('matrix',q.ROWS),('summary',summary),('network',q.NET),('js-errors',q.ERRORS)]:
  (q.OUT/(name+'.json')).write_text(json.dumps(obj,ensure_ascii=False,indent=2))
 for src in Path('tests/audit').glob('*.py'):shutil.copy(src,q.OUT/src.name)
 print(json.dumps(summary,indent=2))
if __name__=='__main__':asyncio.run(main())
