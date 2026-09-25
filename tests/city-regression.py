"""Run unchanged legacy browser assertions against the internal City entry point.
Only the initial document URL changes; fixture routing, assertions and app code do not.
"""
import os,runpy,sys
from urllib.parse import urlsplit,urlunsplit
from playwright.async_api import Page
base=urlsplit(os.getenv('BASE_URL','http://127.0.0.1:4173/Sverinav/'))
original=Page.goto
async def goto_city(self,url,*args,**kwargs):
    parsed=urlsplit(url)
    if (parsed.scheme,parsed.netloc,parsed.path)==(base.scheme,base.netloc,base.path):
        url=urlunsplit((parsed.scheme,parsed.netloc,parsed.path+'city.html',parsed.query,parsed.fragment))
    return await original(self,url,*args,**kwargs)
Page.goto=goto_city
if len(sys.argv)!=2:raise SystemExit('Expected one City regression script')
runpy.run_path(sys.argv[1],run_name='__main__')
