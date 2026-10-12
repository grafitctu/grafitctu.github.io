"""Compare current upstream content hashes and discover newly linked PDFs.
Fetches data only; never executes downloaded code and never deletes missing files.
"""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urljoin,urlparse
from html.parser import HTMLParser
import sys,json,hashlib,concurrent.futures,argparse,datetime
sys.stdout.reconfigure(encoding='utf8')
p=argparse.ArgumentParser();p.add_argument('checkout');p.add_argument('--date',default=datetime.date.today().isoformat());p.add_argument('--output');p.add_argument('--browser-evidence');p.add_argument('--source-workspace',help='Author workspace containing localSources (defaults to this script parent)');args=p.parse_args()
ROOT=Path(args.source_workspace).resolve() if args.source_workspace else Path(__file__).resolve().parents[1];base=Path(args.checkout)/'vyuka';registry=json.loads((base/'upstream-sources.json').read_text(encoding='utf8'));OUT=Path(args.output) if args.output else ROOT/'output/teaching-weekly'/args.date;OUT.mkdir(parents=True,exist_ok=True)
repairs={x['from']:x['to'] for x in registry.get('urlRepairs',[])}
excluded={x['course']:x for x in registry.get('sourcePolicies',[]) if x.get('checkExternal') is False}
browser={}
if args.browser_evidence:
 evidence=json.loads(Path(args.browser_evidence).read_text(encoding='utf8'))
 observed=datetime.datetime.fromisoformat(evidence['checkedAt'])
 now=datetime.datetime.now(datetime.timezone.utc)
 if observed.tzinfo is None or not -60 <= (now-observed).total_seconds() <= 7200:raise ValueError('Browser evidence must be timezone-aware and from this run (at most two hours old)')
 browser={x['url']:x for x in evidence.get('files',[])+evidence.get('plans',[])}
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.table=0;self.tables=0;self.active=None
 def handle_starttag(self,tag,attrs):
  if tag=='table':self.table+=1;self.tables+=1
  if tag=='a' and dict(attrs).get('href'):self.active={'href':dict(attrs)['href'],'text':'','table':self.tables if self.table else 0}
 def handle_data(self,text):
  if self.active:self.active['text']+=text
 def handle_endtag(self,tag):
  if tag=='table':self.table-=1
  if tag=='a' and self.active:self.links.append(self.active);self.active=None
def fetch(entry):
 try:
  request_url=repairs.get(entry['url'],entry['url'])
  with urlopen(Request(request_url,headers={'Cache-Control':'no-cache','User-Agent':'GRAFIT weekly teaching audit'}),timeout=45) as r:data=r.read();final=r.url
  if urlparse(final).hostname in ['auth.fit.cvut.cz'] or '/login' in final or '/users/sign_in' in final:raise RuntimeError('Source requires an authenticated FIT browser session')
  if urlparse(request_url).path.lower().endswith('.pdf') and not data.startswith(b'%PDF-'):raise RuntimeError('Source did not return a PDF (possibly a login page)')
  digest=hashlib.sha256(data).hexdigest();result=dict(entry,currentSha256=digest,bytes=len(data),status='unchanged' if digest==entry.get('sha256') else 'changed')
  if entry.get('role')=='plan':
   parser=Links();parser.feed(data.decode('utf8',errors='replace'));links=sorted({repairs.get(urljoin(final,x['href']),urljoin(final,x['href'])) for x in parser.links if ('.pdf' in x['href'].lower() or ('/presentations/' in urljoin(final,x['href']) and x['href'].split('#')[0].endswith('.html'))) and (entry['course']!='pga' or (x['table']==1 and 'původní' not in x['text'].lower()))})
   result['pdfLinks']=links;result['newPDFs']=[x for x in links if x not in known and x not in {repairs.get(y,y) for y in entry.get('baselineLinks',[])}];result['status']='new-links' if result['newPDFs'] else 'checked'
   if entry.get('sha256') and digest!=entry['sha256']:result['status']='changed'
  if result['status'] in ['changed','new-links']:
   target=OUT/'incoming'/hashlib.sha256(entry['url'].encode()).hexdigest();target.parent.mkdir(exist_ok=True);target.write_bytes(data);result['incoming']=str(target.resolve())
  return result
 except Exception as e:
  receipt=browser.get(entry['url'])
  if receipt:
   try:
    if entry.get('role')=='plan':
     if receipt.get('authenticated') is not True:raise ValueError('Plan receipt does not confirm authenticated browser access')
     links=sorted({repairs.get(x,x) for x in receipt['materialLinks']})
     new=[x for x in links if x not in known and x not in {repairs.get(y,y) for y in entry.get('baselineLinks',[])}]
     return dict(entry,status='new-links' if new else 'checked',pdfLinks=links,newPDFs=new,verification='authenticated-browser-dom',browserEvidence=args.browser_evidence,cliReason=str(e))
    source=Path(receipt['downloadPath']);mtime=datetime.datetime.fromtimestamp(source.stat().st_mtime,datetime.timezone.utc)
    if not -60 <= (now-mtime).total_seconds() <= 7200:raise ValueError('Browser download is stale; download the current source again')
    data=source.read_bytes();digest=hashlib.sha256(data).hexdigest()
    if digest!=receipt['sha256'] or not data.startswith(b'%PDF-'):raise ValueError('Browser download PDF/hash validation failed')
    result=dict(entry,currentSha256=digest,bytes=len(data),status='unchanged' if digest==entry.get('sha256') else 'changed',verification='authenticated-browser-download',browserEvidence=args.browser_evidence,cliReason=str(e))
    if result['status']=='changed':
     target=OUT/'incoming'/hashlib.sha256(entry['url'].encode()).hexdigest();target.parent.mkdir(exist_ok=True);target.write_bytes(data);result['incoming']=str(target)
    return result
   except Exception as validation:return dict(entry,status='unavailable',reason=str(e),browserEvidenceError=str(validation))
  return dict(entry,status='unavailable',reason=str(e))
known={x['url'] for x in registry['materials']};plans=[x for x in registry['plans'] if x['course'] not in excluded]
if any(url.startswith('https://pages.fit.cvut.cz/pauspetr/') for url in known) and not any(p['url']=='https://pages.fit.cvut.cz/pauspetr/teaching.html' for p in plans):plans.append({'course':'paus-shared','url':'https://pages.fit.cvut.cz/pauspetr/teaching.html'})
entries=list({x['url']:x for x in registry['materials'] if x['course'] not in excluded}.values())+[dict(x,role='plan') for x in plans]
results=list(concurrent.futures.ThreadPoolExecutor(4).map(fetch,entries))
for plan in registry['plans']:
 if plan['course'] in excluded:continue
 for link in plan.get('unavailableLinks',[]):
  checked=fetch(dict(link,course=plan['course'],role='plan-linked-source'))
  results.append(checked)
for entry in registry.get('localSources',[]):
 source=ROOT/entry['source']
 if not source.exists():results.append(dict(entry,status='unavailable',reason='Local author source missing'));continue
 digest=hashlib.sha256(source.read_bytes()).hexdigest();results.append(dict(entry,currentSha256=digest,status='unchanged' if digest==entry['sha256'] else 'changed'))
changes=[x for x in results if x['status'] in ['changed','new-links']];unavailable=[x for x in results if x['status']=='unavailable']
report={'checked':args.date,'results':results,'changes':changes,'unavailable':unavailable,'excludedExternalCourses':list(excluded.values()),'status':'partial' if unavailable else 'changed' if changes else 'unchanged'}
(OUT/'upstream-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'checked':len(results),'changed':len(changes),'unavailable':len(unavailable),'status':report['status']},ensure_ascii=False))
