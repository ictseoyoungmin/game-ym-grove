const variants=[
{id:'core-brand',name:'Core Ym',file:'assets/core-brand.svg',tag:'Default',unlocked:true,gain:'+0.1/sec'},
{id:'ai-agents',name:'AI / Agents',file:'assets/ai-agents.svg',tag:'Intelligence',unlocked:true,gain:'+Spark'},
{id:'ml-deep-learning',name:'ML / Deep Learning',file:'assets/ml-deep-learning.svg',tag:'Neural',unlocked:true,gain:'+Growth'},
{id:'jepa-vision',name:'JEPA / Vision',file:'assets/jepa-vision.svg',tag:'Vision',unlocked:false,gain:'+Preview'},
{id:'security',name:'Security',file:'assets/security.svg',tag:'Trust',unlocked:true,gain:'+Trust'},
{id:'data-analytics',name:'Data / Analytics',file:'assets/data-analytics.svg',tag:'Insight',unlocked:true,gain:'+Insight'},
{id:'cloud-infra',name:'Cloud / Infra',file:'assets/cloud-infra.svg',tag:'Scale',unlocked:false,gain:'+Slots'},
{id:'gaming-rl',name:'Gaming / RL',file:'assets/gaming-rl.svg',tag:'Play',unlocked:false,gain:'Critical'},
{id:'research',name:'Research',file:'assets/research.svg',tag:'Discovery',unlocked:true,gain:'+Rare'},
{id:'education',name:'Education',file:'assets/education.svg',tag:'Learn',unlocked:false,gain:'-Cost'},
{id:'premium-pro',name:'Premium / Pro',file:'assets/premium-pro.svg',tag:'Quality',unlocked:false,gain:'+All'},
{id:'sustainability',name:'Sustainability',file:'assets/sustainability.svg',tag:'Balance',unlocked:false,gain:'+Idle'},
{id:'api-integrations',name:'API / Integrations',file:'assets/api-integrations.svg',tag:'Connect',unlocked:false,gain:'+Link'},
{id:'tools-utilities',name:'Tools / Utilities',file:'assets/tools-utilities.svg',tag:'Utility',unlocked:false,gain:'+Auto'}];
let spark=1240,insight=32,trust=14,selected=0;const stats={Intelligence:62,Curiosity:48,Stability:36,Growth:54,Connection:72};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],fmt=n=>Math.floor(n).toLocaleString('en-US');
function updateRes(){ $('#spark').textContent=fmt(spark);$('#insight').textContent=fmt(insight);$('#trust').textContent=fmt(trust); }
function renderStats(id){document.getElementById(id).innerHTML=Object.entries(stats).map(([k,v])=>`<div class="stat"><div class="stat-head"><span>${k}</span><span>${v}</span></div><div class="bar"><span style="--value:${v}%"></span></div></div>`).join('')}
function renderCollection(){const grid=$('#collection');grid.innerHTML=variants.map((v,i)=>`<article class="ym-card ${v.unlocked?'':'locked'}" style="--i:${i}"><span class="badge">${v.unlocked?'OPEN':'LOCK'}</span><img src="${v.file}" alt="${v.name}"><strong>${v.name}</strong><span>${v.tag} · ${v.gain}</span></article>`).join('');$('#unlockCount').textContent=`${variants.filter(v=>v.unlocked).length} / ${variants.length}`;}
function renderSlots(){const u=variants.filter(v=>v.unlocked).slice(0,5);$('#slots').innerHTML=u.map(v=>`<article class="slot"><img src="${v.file}" alt="${v.name}"><div><b>${v.name}</b><span>${v.tag} module active</span></div><em>${v.gain}</em></article>`).join('')}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),1200)}
function particle(x,y,text='+1'){const zone=$('#creatureZone'),r=zone.getBoundingClientRect(),p=document.createElement('div');p.className='spark-particle';p.textContent=text;p.style.left=`${x-r.left}px`;p.style.top=`${y-r.top}px`;p.style.setProperty('--dx',`${Math.random()*80-40}px`);zone.appendChild(p);setTimeout(()=>p.remove(),760)}
function select(i){selected=i%variants.length;const v=variants[selected];$('#currentIcon').src=v.file;$('#currentName').textContent=v.name;}
$$('.nav').forEach(b=>b.onclick=()=>{$$('.nav').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===b.dataset.target));});
$('#creatureBtn').onclick=e=>{spark++;updateRes();const c=$('#creatureBtn');c.classList.remove('tapped');void c.offsetWidth;c.classList.add('tapped');particle(e.clientX,e.clientY,'+1')};
$('#growBtn').onclick=()=>{if(spark<20)return toast('Spark가 부족합니다');spark-=20;const keys=Object.keys(stats),k=keys[Math.floor(Math.random()*keys.length)];stats[k]=Math.min(100,stats[k]+4);renderStats('statList');renderStats('labStats');updateRes();toast(`${k} +4`)};
$('#hintBtn').onclick=()=>{insight++;updateRes();toast('힌트: Connection이 높아 AI 계열에 가깝습니다')};
$$('.feed').forEach(b=>b.onclick=()=>{if(spark<35)return toast('Spark 35 필요');spark-=35;const k=b.dataset.stat;stats[k]=Math.min(100,stats[k]+8);renderStats('statList');renderStats('labStats');updateRes();toast(`${k} 방향성 강화`)});
$('#evolveBtn').onclick=()=>{const u=variants.filter(v=>v.unlocked);const next=u[(u.findIndex(v=>v.id===variants[selected].id)+1)%u.length];select(variants.indexOf(next));toast(`${next.name} 미리보기`)};
$('#auraBtn').onclick=()=>{trust++;updateRes();toast('Brand aura +1')};
setInterval(()=>{spark+=0.1;updateRes()},1000);renderStats('statList');renderStats('labStats');renderCollection();renderSlots();
