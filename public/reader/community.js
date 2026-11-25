const missions={
 Malaysia:'kualalumpur', 'United Kingdom':'london','Saudi Arabia':'riyadh','United Arab Emirates':'abudhabi',Canada:'ottawa',Qatar:'doha',Singapore:'singapore',Oman:'muscat'
};
const deskSlug=c=>c.toLowerCase().replaceAll(' ','-');
const noticeZones={Malaysia:'Asia/Kuala_Lumpur','United Kingdom':'Europe/London','Saudi Arabia':'Asia/Riyadh','United Arab Emirates':'Asia/Dubai',Canada:'America/Toronto',Qatar:'Asia/Qatar',Singapore:'Asia/Singapore',Oman:'Asia/Muscat'};
function noticeExpired(s,now=new Date()){
 return now.toLocaleDateString('sv-SE',{timeZone:noticeZones[s.country]||'Asia/Dhaka'})>s.noticeDeadline;
}
function noticeStamp(s){
 const ended=noticeExpired(s);
 return `<p class="meta"><strong class="badge">${ended?t('মেয়াদ শেষ','Expired'):t('চলমান','Current')}</strong> ${t('শেষ তারিখ','Deadline')} · <time datetime="${safe(s.noticeDeadline)}">${safe(s.noticeDeadline)}</time></p>`;
}
function serviceDesk(route,cards){
 const choice=countries.find(c=>route==='service-'+deskSlug(c[1]))||countries[0];
 const [bn,country,...ids]=choice, base='https://'+missions[country]+'.mofa.gov.bd';
 const resources=[[t('বাংলাদেশ মিশন','Bangladesh mission'),base+'/']];
 if(country==='Malaysia')resources.push([t('হাইকমিশনের বিজ্ঞপ্তি','High Commission notices'),base+'/pages/notices'],[t('ই-পাসপোর্ট আবেদনের তথ্য','E-passport application information'),base+'/pages/static-pages/6952667a35ce18e1c05a96a3']);
 const news=stories.filter(s=>s.country===country||ids.includes(s.id));
 const notices=newsroom.articles.filter(s=>s.country===country&&s.noticeDeadline).sort((a,b)=>Number(noticeExpired(a))-Number(noticeExpired(b))||(noticeExpired(a)?b.noticeDeadline.localeCompare(a.noticeDeadline):a.noticeDeadline.localeCompare(b.noticeDeadline)));
 const noticesHtml=notices.length?sectionTitle(t('সময়সীমাসহ বিজ্ঞপ্তি','Notices with deadlines'))+notices.map(s=>`<article>${noticeStamp(s)}<h3><a href="${url(s)}">${title(s)}</a></h3></article>`).join(''):'';
 return sectionTitle(t('প্রবাস সেবাডেস্ক','Diaspora service desk'))+`<nav class="country-row">${countries.map(c=>`<a href="/#service-${deskSlug(c[1])}" ${choice===c?'aria-current="page"':''}>${t(c[0],c[1])}</a>`).join('')}</nav><h2>${t(bn,country)}</h2><ul class="feed">${resources.map(([label,href])=>`<li><time datetime="2026-11-25">${t('যাচাই: ২৫ নভেম্বর ২০২৬','Checked 25 November 2026')}</time><a href="${href}" target="_blank" rel="noopener">${label}</a></li>`).join('')}</ul>${noticesHtml}${sectionTitle(t('সংশ্লিষ্ট খবর','Related coverage'))}${cards(news.filter(s=>!s.noticeDeadline))}`;
}
function personalFeedLink(){
 if(!localStorage.myDistrict&&!localStorage.newsCountry)return '';
 const query=new URLSearchParams({district:localStorage.myDistrict||'',country:localStorage.newsCountry||'',mode:localStorage.alertFrequency==='breaking'?'breaking':'daily'});
 return `<a class="text-link" href="/feeds/my-news.xml?${safe(query.toString())}">${t('আরএসএস রিডারে পড়ুন','Subscribe in an RSS reader')}</a>`;
}
function alertSettings(){
 const frequency=localStorage.alertFrequency||'off';
 const select=(v,b,e)=>`<option value="${v}" ${frequency===v?'selected':''}>${t(b,e)}</option>`;
 return `<details class="panel" id="alert-settings"><summary>${t('আমার খবরের অ্যালার্ট','My news alerts')}</summary>
 <p>${t('সাইট খোলা থাকলে সংরক্ষিত এলাকার নতুন খবরের অ্যালার্ট পাবেন। সময় আপনার ডিভাইস অনুযায়ী।','Receive updates for saved locations while the site is open. Times follow your device.')}</p>
 <form id="alert-form" class="actions"><label>${t('অ্যালার্ট','Alerts')}<select name="frequency">${select('off','বন্ধ','Off')}${select('breaking','ব্রেকিং খবর','Breaking news')}${select('daily','দৈনিক সারাংশ','Daily summary')}</select></label>
 <label>${t('নীরব সময় শুরু','Quiet from')}<input name="start" type="time" required value="${safe(localStorage.alertStart||'22:00')}"></label>
 <label>${t('নীরব সময় শেষ','Quiet until')}<input name="end" type="time" required value="${safe(localStorage.alertEnd||'07:00')}"></label>
 <button>${t('সংরক্ষণ করুন','Save alerts')}</button></form><button id="pause-alerts" ${frequency==='off'?'disabled':''}>${localStorage.alertPaused==='1'?t('আবার চালু করুন','Resume alerts'):t('সাময়িক বন্ধ','Pause alerts')}</button><p id="alert-rss">${personalFeedLink()}</p><p id="alert-feedback" role="status"></p></details>`;
}
function connectAlerts(){
 if(!$('alert-form'))return;
 const form=$('alert-form'), feedback=$('alert-feedback');
 form.onsubmit=e=>{
  e.preventDefault();const f=new FormData(form);
  if(f.get('frequency')!=='off'&&!localStorage.myDistrict&&!localStorage.newsCountry){feedback.textContent=t('আগে জেলা বা দেশ সংরক্ষণ করুন।','Save a district or country first.');return}
  localStorage.alertFrequency=f.get('frequency');localStorage.alertStart=f.get('start');localStorage.alertEnd=f.get('end');localStorage.alertPaused='0';
  $('pause-alerts').disabled=f.get('frequency')==='off';$('pause-alerts').textContent=t('সাময়িক বন্ধ','Pause alerts');$('alert-rss').innerHTML=personalFeedLink();feedback.textContent=t('অ্যালার্ট সেটিংস সংরক্ষিত।','Alert settings saved.');deliverAlerts();
 };
 $('pause-alerts').onclick=()=>{const pause=localStorage.alertPaused!=='1';localStorage.alertPaused=pause?'1':'0';$('pause-alerts').textContent=pause?t('আবার চালু করুন','Resume alerts'):t('সাময়িক বন্ধ','Pause alerts');deliverAlerts()};
}
function deliverAlerts(now=new Date()){
 const panel=$('personal-alert'),mode=localStorage.alertFrequency;
 if(!panel)return;
 if(!['breaking','daily'].includes(mode)||localStorage.alertPaused==='1'){panel.hidden=true;return}
 const clock=[now.getHours(),now.getMinutes()].map(n=>String(n).padStart(2,'0')).join(':');
 const start=localStorage.alertStart||'22:00',end=localStorage.alertEnd||'07:00';
 if(start<end?clock>=start&&clock<end:start>end&&(clock>=start||clock<end)){panel.hidden=true;return}
 const district=districtList().find(d=>d.id===localStorage.myDistrict),country=localStorage.newsCountry;
 const day=now.toLocaleDateString('sv-SE');
 const hits=newsroom.articles.filter(s=>((district&&[district.id,district.bn].includes(s.district))||(country&&s.country===country))&&(mode==='breaking'?newsroom.breaking.includes(s.id):new Date(s.publishedAt).toLocaleDateString('sv-SE')===day));
 if(!hits.length){panel.hidden=true;return}
 const key=[mode,day,localStorage.myDistrict, country,mode==='breaking'?hits.map(s=>s.id).join(','):'digest'].join('|');
 if(localStorage.alertDismissed===key){panel.hidden=true;return}
 panel.innerHTML=`<strong>${mode==='daily'?t('আপনার দৈনিক সারাংশ','Your daily summary'):t('আপনার ব্রেকিং খবর','Your breaking news')}</strong>${feed(hits)}<button type="button">${t('বন্ধ করুন','Dismiss')}</button>`;
 panel.hidden=false;panel.querySelector('button').onclick=()=>{localStorage.alertDismissed=key;panel.hidden=true};
}
function reportIssue(story){
 const selected=window.getSelection();
 const quote=selected&&document.querySelector('.article')?.contains(selected.anchorNode)?selected.toString().slice(0,800):'';
 openDialog(t('ভুল জানান','Report an error'),`<form id="error-form" class="desk-grid"><strong>${title(story)}</strong>
 <label>${t('সংশ্লিষ্ট বাক্য','Relevant sentence')}<textarea name="quote" maxlength="800">${safe(quote)}</textarea></label>
 <label>${t('কী সংশোধন করা দরকার?','What needs correcting?')}<textarea name="details" required minlength="5" maxlength="2000"></textarea></label>
 <button>${t('নিউজরুমে পাঠান','Send to newsroom')}</button><p role="status"></p></form>`);
 const form=$('error-form');form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('button'),status=form.querySelector('[role=status]');button.disabled=true;
 try{const r=await fetch('/api/reader-tips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'correction',article:String(story.id),...Object.fromEntries(new FormData(form))})});
 if(!r.ok)throw Error();form.innerHTML=`<p role="status">${t('আপনার প্রতিবেদন নিউজরুমে পৌঁছেছে।','Your report has reached the newsroom.')}</p>`;
 }catch{button.disabled=false;status.textContent=t('পাঠানো যায়নি। আবার চেষ্টা করুন।','Could not send. Please try again.')}};
}
