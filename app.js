'use strict';
const D = window.DATA;
const $ = id => document.getElementById(id);
const formatter = new Intl.NumberFormat('en-US');
const fmt = value => formatter.format(Math.round(value));
const monthLabels = new Map(D.months.map(key => {
  const date = new Date(key + '-15T12:00:00Z');
  return [key, ['long', 'short'].map(style => date.toLocaleDateString('en-US', {
    month: style, year: style === 'long' ? 'numeric' : '2-digit', timeZone: 'UTC'
  }))];
}));
const monthName = key => monthLabels.get(key)[0];
const shortMonth = key => monthLabels.get(key)[1];
let geography='town';
const G=window.DISTRICTS;
const place=t=>t==='all'?'Connecticut statewide':geography==='town'?t:G[geography].label+' District '+t;
let program='SNAP',town='all',month=D.months.at(-1),measure='percent';const baseline='2025-07';
const townCount=(t,m)=>D.data[program][t][m]?.n??null;
const count=(t,m)=>t==='all'?D.statewide[program][m]:geography==='town'?townCount(t,m):G[geography].allocations[t].reduce((s,r)=>s+townCount(r.town,m)*r.weight,0);
const loss=t=>count(t,baseline)-count(t,month),percent=t=>count(t,baseline)>0?100*loss(t)/count(t,baseline):null;
function opts(id,items){items.forEach(([v,n])=>{const o=document.createElement('option');o.value=v;o.textContent=n;$(id).append(o);});}
opts('town',D.towns.map(t=>[t,t]));opts('month',D.months.filter(m=>m>=baseline).map(m=>[m,monthName(m)]));$('month').value=month;
$('updated').textContent=D.updated?new Date(D.updated).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'America/New_York'}):'Not supplied with workbook';$('latest').textContent='Reporting through '+monthName(D.months.at(-1));$('town-source-date').textContent=new Date(D.sources.town.updatedAt).toLocaleDateString('en-US');$('state-updated').textContent=new Date(D.sources.state.updatedAt).toLocaleDateString('en-US');$('sync-date').textContent=new Date(D.syncedAt).toLocaleDateString('en-US');$('checked-date').textContent=new Date(window.REFRESH_STATUS?.checkedAt||D.syncedAt).toLocaleDateString('en-US');
$('geography').onchange=e=>{geography=e.target.value;town='all';$('town').innerHTML='<option value="all">Statewide · 169 municipalities</option>';opts('town',geography==='town'?D.towns.map(t=>[t,t]):Object.keys(G[geography].allocations).sort((a,b)=>a-b).map(id=>[id,place(id)]));render();};
$('town').onchange=e=>{town=e.target.value;render();};$('month').onchange=e=>{month=e.target.value;render();};$('measure').onchange=e=>{measure=e.target.value;renderMap();};$('reset').onclick=()=>choose('all');
for(const p of ['SNAP','Medicaid'])$(p.toLowerCase()).onclick=()=>{program=p;render();};
function choose(t){town=t;$('town').value=t;render();}
function metric(id,labelId,value,lossLabel,gainLabel,suffix=''){const gain=value<0;$(id).textContent=value===null?'Not available':(suffix?Math.abs(value).toFixed(1):fmt(Math.abs(value)))+suffix;$(id).className=gain?'gain':'';$(labelId).textContent=gain?gainLabel:lossLabel;}
function render(){$('snap-policy').hidden=program!=='SNAP';for(const p of ['SNAP','Medicaid'])$(p.toLowerCase()).setAttribute('aria-pressed',String(program===p));$('scope').textContent=place(town)+' · '+program;const estimated=geography!=='town'&&town!=='all';$('unit').textContent=estimated?'Estimated counts · town population allocation':town==='all'?'DSS statewide source · assistance-category counts':'DSS town source · assistance-category counts';$('source-scope').textContent=town==='all'?'Statewide totals use the DSS statewide dataset. Town sums and district estimates can differ because of source coverage and suppression.':'Town and district figures use the DSS town dataset. Map change is measured from July 2025.';$('chart-key').textContent=estimated?'Estimated count':'Published count';$('selection-label').textContent=geography==='town'?'Municipality':G[geography].label+' district';$('geography-note').textContent=geography==='town'?'Select a municipality to focus the figures and trend.':G[geography].vintage+' · 2020 Census population weights. Select a district to view estimated losses and its trend.';$('allocation-details').hidden=!estimated;if(estimated)$('allocations').innerHTML=G[geography].allocations[town].map(r=>'<tr><td>'+r.town+'</td><td>'+(r.weight*100).toFixed(2)+'%</td><td>'+fmt((townCount(r.town,baseline)-townCount(r.town,month))*r.weight)+'</td></tr>').join('');metric('loss','loss-label',loss(town),'Net enrollment loss','Net enrollment gain');metric('percent','percent-label',percent(town),'Percent loss','Percent gain','%');const prev=D.months[D.months.indexOf(month)-1];metric('momentum','momentum-label',count(town,prev)-count(town,month),'Loss since previous month','Gain since previous month');$('momentum-note').textContent=monthName(prev)+' to '+monthName(month);const baselineLabel = $('baseline-count').previousElementSibling; if (baselineLabel) baselineLabel.textContent = 'Total enrollment · July 2025'; $('baseline-count').textContent=fmt(count(town,baseline));$('current-count').textContent=fmt(count(town,month));$('selected-month').textContent='Total enrollment · '+monthName(month);$('chart-subtitle').textContent='January 2025 through '+monthName(month)+' · OBBBA enacted July 4, 2025';renderMap();renderChart();}
const allCoords=D.geo.features.flatMap(f=>(f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates).flat(2));const xs=allCoords.map(p=>p[0]),ys=allCoords.map(p=>p[1]);const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);const width=600,height=360,sx=(width-20)/(xmax-xmin),sy=(height-20)/(ymax-ymin),scale=Math.min(sx,sy/1.32),project=p=>[10+(p[0]-xmin)*scale,10+(ymax-p[1])*scale*1.32];
function geometryPath(f){return (f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates).map(poly=>poly.map(ring=>ring.map((p,i)=>(i?'L':'M')+project(p).map(n=>n.toFixed(2)).join(',')).join(' ')+'Z').join(' ')).join(' ');}
// Each view uses the same baseline and the precision displayed in its legend.
function mapValue(id) {
  const value = measure === 'percent' ? percent(id) : loss(id);
  if (!Number.isFinite(value)) return null;
  const precision = measure === 'percent' ? 10 : 1;
  return Math.sign(value) * Math.round(Math.abs(value) * precision) / precision;
}

function changeLabel(value) {
  if (value === null) return 'Percentage unavailable';
  if (value === 0) return 'No change at displayed precision';
  const amount = measure === 'percent' ? Math.abs(value).toFixed(1) + '%' : fmt(Math.abs(value));
  return amount + (value < 0 ? ' gain' : ' loss');
}

function makeScale(values) {
  const valid = values.filter(Number.isFinite);
  const low = Math.min(...valid);
  const high = Math.max(...valid);
  const mixed = low < 0 && high > 0;
  const near = mixed || low === 0 || high === 0 ? 0 : Math.min(Math.abs(low), Math.abs(high));
  const far = Math.max(Math.abs(low), Math.abs(high));
  return function shade(value) {
    if (!Number.isFinite(value)) return '#aaaeb4';
    if (value === 0) return '#f0f2f5';
    const fraction = far === near ? 0.5 : (Math.abs(value) - near) / (far - near);
    const start = value > 0 ? [184, 212, 238] : [184, 224, 215];
    const end = value > 0 ? [28, 67, 131] : [19, 102, 89];
    const rgb = start.map((channel, index) => Math.round(channel + fraction * (end[index] - channel)));
    return 'rgb(' + rgb.join(',') + ')';
  };
}

const pathCache = new WeakMap();
const visiblePaths = new Map();
let lastView = '';
let highlightedId;

function renderMap() {
  const view = [geography, program, month, measure].join('|');
  if (view !== lastView) {
    const district = geography !== 'town';
    const features = district ? G[geography].geo.features : D.geo.features;
    const entries = features.map(feature => {
      const id = String(district ? feature.properties.id : feature.properties.Town);
      if (!pathCache.has(feature)) pathCache.set(feature, geometryPath(feature));
      return { id, value: mapValue(id), path: pathCache.get(feature) };
    });
    const values = entries.map(entry => entry.value);
    const shade = makeScale(values);
    const date = monthName(month);
    $('map-period').textContent = 'July 2025 → ' + date;
    const shapes = entries.map(({ id, value, path }) => {
      const label = place(id) + ' · ' + (district ? 'Estimated change: ' : '') +
        changeLabel(value) + ' · July 2025 to ' + date;
      return '<path d="' + path + '" fill="' + shade(value) + '" data-town="' + id +
        '" tabindex="0" role="button" aria-pressed="false" aria-label="' + label +
        '" class="' + (district ? 'district' : '') + '"><title>' + label + '</title></path>';
    });
    $('map').innerHTML = '<svg viewBox="0 0 600 360" role="group" aria-label="Connecticut ' +
      (district ? G[geography].label + ' districts' : 'municipalities') + '">' + shapes.join('') + '</svg>';
    visiblePaths.clear();
    highlightedId = undefined;
    for (const path of $('map').querySelectorAll('[data-town]')) {
      const id = path.dataset.town;
      visiblePaths.set(id, path);
      path.onclick = () => choose(id);
      path.onkeydown = event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          choose(id);
        }
      };
      path.onmouseenter = path.onfocus = () => detail(id);
      path.onmouseleave = path.onblur = () => detail(town);
    }
    const swatch =      $('legend').innerHTML =
      '<b class="legend-caption">Enrollment change since July 2025</b>' +
      '<span><i style="background:#1c4383"></i>Blue: losses (darkest = highest loss in this view)</span>' +
      '<span><i style="background:#136659"></i>Green: gains</span>' +
      '<span><i style="background:#f0f2f5"></i>No change at displayed precision</span>' +
      '<span><i style="background:#aaaeb4"></i>Unavailable</span>';
    lastView = view;
  }
  if (highlightedId !== town) {
    const previous = visiblePaths.get(highlightedId);
    const next = visiblePaths.get(town);
    previous?.classList.remove('selected');
    previous?.setAttribute('aria-pressed', 'false');
    next?.classList.add('selected');
    next?.setAttribute('aria-pressed', 'true');
    highlightedId = town;
  }
  detail(town);
}
function detail(t){if(t==='all'){$('map-detail').textContent='Statewide view. Select a '+(geography==='town'?'municipality':'district')+' to explore changes.';return;}const l=loss(t),p=percent(t);$('map-detail').textContent=place(t)+' · '+(geography==='town'?'':'estimated ')+fmt(Math.abs(l))+' net '+(l<0?'gain':'loss')+' since July 2025'+' ('+(p===null?'percentage unavailable':Math.abs(p).toFixed(1)+'%')+') · '+fmt(count(t,month))+' in '+monthName(month);}
const policyMilestones=[
{program:'SNAP',month:'2025-11',label:'Expanded SNAP work rules',date:'November 2025',source:'https://portal.ct.gov/dss/all-programs/dss-benefits-and-hr1/hr1-for-members/hr1-work-rule-changes'},
{program:'SNAP',month:'2025-12',label:'Work-rule verification begins',date:'December 2025',source:'https://ctvoices.org/wp-content/uploads/2026/08/CT-Voices-_-SNAP-OBBBA-Report-2026-Final-Report.pdf#page=13'},
{program:'Medicaid',month:'2027-01',label:'HUSKY D work rules scheduled',date:'January 1, 2027',source:'https://portal.ct.gov/dss/all-programs/dss-benefits-and-hr1/hr1-for-members/hr1-work-rule-changes'}
];
const bandStyles=[['A','#5c83b0','6 3'],['C','#397b77','3 3'],['D','#800020',''],['LB','#79618d','2 4']];
function bandCount(b,t,m){return t==='all'?D.stateBands[b][m]:geography==='town'?D.bands[b][t][m]:G[geography].allocations[t].reduce((v,r)=>v+D.bands[b][r.town][m]*r.weight,0);}
function renderChart(){document.body.classList.toggle('show-bands',program==='Medicaid');$('band-legend').hidden=$('husky-context').hidden=program!=='Medicaid';$('band-legend').innerHTML='<span><i style="border-color:#204a80"></i>Medicaid total</span>'+bandStyles.map(([b,c,dash])=>'<span><i style="border-color:'+c+';border-top-style:'+(dash?'dashed':'solid')+'"></i>HUSKY '+b+'</span>').join('');let ms=D.months.filter(m=>m<=month),values=ms.map(m=>count(town,m));let w=560,h=315,pad={l:57,r:18,t:24,b:42},max=Math.max(...values)*1.08||1;const x=i=>pad.l+i*(w-pad.l-pad.r)/(ms.length-1),y=n=>h-pad.b-n/max*(h-pad.t-pad.b);let s='<svg viewBox="0 0 560 315" role="img" aria-label="Monthly '+program+' assistance-category counts for '+place(town)+'"><title>Monthly counts; exact values are in the monthly data table below</title>';for(let i=0;i<=4;i++){let v=max*i/4;s+='<line x1="57" x2="542" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#dce5f0"/><text x="49" y="'+(y(v)+4)+'" text-anchor="end">'+(v>=10000?Math.round(v/1000)+'k':fmt(v))+'</text>';}
let bi=ms.indexOf(baseline),bx=x(bi),labelX=Math.min(bx+12,365);s+='<rect x="'+bx+'" y="24" width="'+(542-bx)+'" height="249" fill="#965b6c" opacity="0.10"/><line x1="'+bx+'" x2="'+bx+'" y1="24" y2="273" stroke="#965b6c" stroke-width="1.5" stroke-dasharray="4 4"/><path d="M'+(bx-5)+',12 L'+bx+',7 L'+(bx+5)+',12 L'+bx+',17 Z" fill="#965b6c"/><text x="'+labelX+'" y="16" style="fill:#804657;font-weight:700;font-size:12px">OBBBA enacted · July 4, 2025</text>';let coords=values.map((v,i)=>x(i)+','+y(v));s+='<path d="M'+x(0)+',273 L'+coords.join(' L')+' L'+x(ms.length-1)+',273 Z" fill="#204a800e"/><polyline points="'+coords.join(' ')+'" fill="none" stroke="#204a80" stroke-width="3"/>';for(let i=0;i<ms.length;i++){s+='<circle cx="'+x(i)+'" cy="'+y(values[i])+'" r="3.5" fill="#204a80"><title>'+monthName(ms[i])+': '+fmt(values[i])+'</title></circle>';if(i===0||i===bi||i===ms.length-1||(i%4===0&&Math.abs(i-bi)>1&&ms.length-1-i>1))s+='<text x="'+x(i)+'" y="300" text-anchor="middle">'+shortMonth(ms[i])+'</text>';}s+='<circle cx="'+bx+'" cy="'+y(values[bi])+'" r="6" fill="#965b6c" stroke="#ffffff" stroke-width="2"><title>July 4, 2025: OBBBA enacted. Marker uses the July monthly count; timing does not establish causation.</title></circle></svg>';const relevant=policyMilestones.filter(e=>e.program===program);let markers='';relevant.forEach((e,i)=>{const index=ms.indexOf(e.month);if(index<0)return;const px=x(index),py=y(values[index]);markers+='<line x1="'+px+'" x2="'+px+'" y1="32" y2="273" stroke="#a15b18" stroke-width="1.3" stroke-dasharray="2 4"/><circle cx="'+px+'" cy="'+py+'" r="5" fill="#a15b18" stroke="white" stroke-width="1.5"/><circle cx="'+px+'" cy="'+(40+i*22)+'" r="9" fill="#a15b18"/><text x="'+px+'" y="'+(44+i*22)+'" text-anchor="middle" style="fill:white;font-size:11px;font-weight:bold">'+(i+1)+'</text><title>'+e.date+': '+e.label+'</title>';});if(program==='Medicaid')for(const [b,c,dash] of bandStyles){const points=ms.map((m,i)=>x(i)+','+y(bandCount(b,town,m))).join(' ');markers+='<polyline points="'+points+'" fill="none" stroke="'+c+'" stroke-width="'+(b==='D'?3:1.8)+'" stroke-dasharray="'+dash+'"><title>HUSKY '+b+'; values in monthly data table</title></polyline>';for(let i=0;i<ms.length;i++)markers+='<circle cx="'+x(i)+'" cy="'+y(bandCount(b,town,ms[i]))+'" r="2.5" fill="'+c+'"><title>HUSKY '+b+' · '+monthName(ms[i])+': '+fmt(bandCount(b,town,ms[i]))+'</title></circle>';}s=s.replace('</svg>',markers+'</svg>');$('chart').innerHTML=s;$('policy-milestones').innerHTML=relevant.map((e,i)=>'<p><b>'+(i+1)+'</b> <a href="'+e.source+'" target="_blank" rel="noopener noreferrer">'+e.date+' · '+e.label+'</a>'+(e.month>month?' <span>(beyond displayed period)</span>':'')+'</p>').join('')+'<small>Markers use monthly observations; timing does not establish causation. HUSKY D changes apply to part of the Medicaid population.</small>';$('monthly').innerHTML=ms.map(m=>'<tr><td>'+monthName(m)+'</td><td>'+fmt(count(town,m))+'</td><td>'+fmt(count(town,baseline)-count(town,m))+'</td>'+((program==='Medicaid'?['A','C','D','LB']:[]).map(b=>'<td class="band-column">'+fmt(bandCount(b,town,m))+'</td>').join(''))+'</tr>').join('');}

render();

if(window.parent!==window&&typeof ResizeObserver!=='undefined'){let last=0;new ResizeObserver(()=>{const height=Math.ceil(document.body.getBoundingClientRect().height);if(height!==last){last=height;window.parent.postMessage({type:'ct-benefits-height',height},'*');}}).observe(document.body);}

