"""Observational A/B first-viewport audit on the exact built application.
This is browser-engineering evidence, NEVER simulated human-comprehension evidence.
No account, API writes, live participants or variant assignment.
"""
import asyncio
import json
import os
import shutil
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium').lower()
OUT=Path(os.getenv('QA_OUTPUT','qa-output'))/'first-contact-ab'
OUT.mkdir(parents=True,exist_ok=True)
VIEWPORTS=[(390,844),(320,568),(1280,800)]
VARIANTS=[('A-current-welcome',''),('B-three-equal-paths','?first-contact=three-paths')]

async def examine(browser,name,query,width,height):
    context=await browser.new_context(
        viewport={'width':width,'height':height},
        service_workers='block',locale='en-US',reduced_motion='reduce')
    # Application intentionally skips the first-contact gate under navigator.webdriver.
    # Restore first-visit behavior for a NEW real-browser-like anonymous tab.
    await context.add_init_script(
        "Object.defineProperty(navigator,'webdriver',{get:()=>false})")
    async def local_only(route):
        if route.request.method not in ('GET','HEAD'):
            await route.abort()
            raise AssertionError('First-contact audit attempted a network write')
        if route.request.url.startswith(BASE):
            await route.continue_()
        else:
            await route.abort()
    await context.route('**/*',local_only)
    page=await context.new_page()
    errors=[]
    page.on('pageerror',lambda exc:errors.append(str(exc)))
    case={'variant':name,'viewport':[width,height],'engine':ENGINE,'type':'ENGINEERING_ONLY','errors':errors}
    try:
        await page.goto(BASE+query,wait_until='load')
        try:
            await expect(page.locator('#folkoopEntryGate')).to_be_visible(timeout=6000)
            case['gate_visible']=True
        except AssertionError:
            case['gate_visible']=False
        case.update(await page.evaluate("""() => {
            const gate=document.querySelector('#folkoopEntryGate');
            const card=gate?.querySelector('.entry-welcome-card');
            const g=gate?.getBoundingClientRect();
            const c=card?.getBoundingClientRect();
            const rect=(el)=>{
                const r=el.getBoundingClientRect();
                const cs=getComputedStyle(el);
                const shown=cs.display!=='none'&&cs.visibility!=='hidden'&&!el.hidden;
                const inside=!!c&&r.top>=Math.max(0,c.top)-1&&
                    r.bottom<=Math.min(innerHeight,c.bottom)+1;
                return {top:Math.round(r.top),bottom:Math.round(r.bottom),
                        shown,fullyOnViewport:r.top>=0&&r.bottom<=innerHeight,
                        fullyWithinScrollPane:inside,
                        immediatelyVisible:shown&&inside};
            };
            const choices=[...gate?.querySelectorAll('[data-entry-path]')||[]].map(el=>({
                action:el.dataset.entryPath,
                text:el.textContent.trim(),...rect(el)
            }));
            const cards=[...gate?.querySelectorAll('[data-entry-choice]')||[]].map(el=>({
                mode:el.dataset.entryChoice,
                title:el.querySelector('h2')?.textContent.trim()||'',
                text:el.querySelector('p')?.textContent.trim()||'',
                ...rect(el)
            }));
            const primary=gate?.querySelector('[data-entry="guest"]');
            const signup=gate?.querySelector('[data-entry="email"]');
            return {
                title:gate?.querySelector('#entryGateTitle')?.textContent?.trim()||null,
                intro:gate?.querySelector('#entryGateBody')?.textContent?.trim()||null,
                note:gate?.querySelector('#entryGateNote')?.textContent?.trim()||null,
                gateHidden:gate?.hidden??null,gateClass:gate?.className||'',
                gateAriaModal:gate?.getAttribute('aria-modal')||null,
                modalHeight:g?Math.round(g.height):null,
                paneTop:c?Math.round(c.top):null,paneBottom:c?Math.round(c.bottom):null,
                paneScrollHeight:card?.scrollHeight??null,
                paneClientHeight:card?.clientHeight??null,
                languageCount:gate?.querySelectorAll('[data-entry-language]').length||0,
                currentLanguage:document.documentElement.lang,
                languageRow:gate?.querySelector('.entry-language-choices')?
                  rect(gate.querySelector('.entry-language-choices')):null,
                cards,choices,
                guest:primary?{text:primary.textContent.trim(),...rect(primary)}:null,
                signupVisible:signup?rect(signup).immediatelyVisible:false,
                bodyScrollX:document.documentElement.scrollWidth>innerWidth+1,
                activeBeforeTab:document.activeElement?.id||document.activeElement?.tagName
            };
        }"""))
        await page.screenshot(path=str(OUT/(name+'-'+str(width)+'-'+ENGINE+'.png')))
        await page.keyboard.press('Tab')
        case['firstTab']=await page.evaluate("""() => {
          const a=document.activeElement;
          return {tag:a?.tagName||null,id:a?.id||null,
            label:a?.getAttribute('aria-label')||a?.textContent?.trim().slice(0,55)||null,
            insideGate:!!a?.closest('#folkoopEntryGate')};
        }""")
        print('AB_VIEWPORT_AUDIT '+json.dumps(case,ensure_ascii=False,sort_keys=True),flush=True)
        assert case['gate_visible'], name+' welcome never became visible'
        assert not case['bodyScrollX'],name+' global horizontal overflow'
        assert not errors,errors
    finally:
        (OUT/(name+'-'+str(width)+'-'+ENGINE+'.json')).write_text(
            json.dumps(case,ensure_ascii=False,indent=2),encoding='utf8')
        await context.close()

async def main():
    async with async_playwright() as pw:
        if ENGINE=='webkit':
            browser=await pw.webkit.launch()
        elif ENGINE=='chromium':
            browser=await pw.chromium.launch(
                executable_path=shutil.which('chromium') or shutil.which('google-chrome'),
                args=['--no-sandbox'])
        else:
            raise ValueError('Unsupported BROWSER_ENGINE '+ENGINE)
        try:
            for width,height in VIEWPORTS:
                for name,query in VARIANTS:
                    await examine(browser,name,query,width,height)
        finally:
            await browser.close()
    print('AB_VIEWPORT_AUDIT_FINISHED: 2 variants x 3 viewports; no human sample',flush=True)

if __name__=='__main__':
    asyncio.run(main())
