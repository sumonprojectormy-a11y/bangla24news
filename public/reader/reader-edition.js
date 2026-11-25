function districtOptions(selected) {
 return districtList().map(d=>`<option value="${safe(d.id)}" ${selected===d.id?'selected':''}>${safe(t(d.bn,d.en))}</option>`).join('');
}
function myNews(cards) {
 const district=districtList().find(d=>d.id===localStorage.myDistrict);
 const country=countries.find(c=>c[1]===localStorage.newsCountry);
 const hits=stories.filter(s=>(district&&[district.id,district.bn].includes(s.district))||(country&&(s.country===country[1]||country.slice(2).includes(s.id))));
 return sectionTitle(t('আমার খবর','My news'))+`<form id="preferences" class="panel actions"><label>${t('নিজ জেলা','Home district')}<select name="district"><option value="">—</option>${districtOptions(district?.id)}</select></label><label>${t('বসবাসের দেশ','Country of residence')}<select name="country"><option value="">—</option>${countries.map(c=>`<option value="${safe(c[1])}" ${country===c?'selected':''}>${t(c[0],c[1])}</option>`).join('')}</select></label><button>${t('সংরক্ষণ করুন','Save preferences')}</button></form>`+alertSettings()+(hits.length?cards(hits):`<p>${district||country?t('এই পছন্দে এখনো খবর নেই।','No stories match your selections yet.'):t('নিজ জেলা বা বসবাসের দেশ বেছে নিন।','Choose your district or country to start your feed.')}</p>`);
}
function briefingPage() {
 const today=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Dhaka'});
 const ids=newsroom.briefings?.[today];
 const entries=(ids||[0,2,3,9,1]).map(id=>stories.find(s=>String(s.id)===String(id))).filter(Boolean);
 return sectionTitle(t('আজকের ৫ খবর','Daily five'))+`<p class="meta">${ids?safe(today):t('নমুনা ব্রিফিং','Sample briefing')}</p><ol class="digest">${entries.map(s=>`<li><h2><a href="${url(s)}">${title(s)}</a></h2><p>${desc(s)}</p></li>`).join('')}</ol>`;
}
function advancedSearch() {
 const field=(key,label,control)=>`<label for="${key}">${label}${control}</label>`;
 openDialog(t('খবর খুঁজুন','Search news'),`<form id="search-filters" class="desk-grid">
 ${field('query',t('বিষয়','Keywords'),'<input id="query" type="search">')}
 ${field('search-section',t('সংবাদ বিভাগ','Section'),`<select id="search-section"><option value="">—</option>${deskSections.map(id=>`<option value="${id}">${name(id)}</option>`).join('')}</select>`)}
 ${field('search-district',t('জেলা','District'),`<select id="search-district"><option value="">—</option>${districtOptions('')}</select>`)}
 ${field('since',t('শুরুর তারিখ','From'),'<input id="since" type="date">')}
 ${field('until',t('শেষ তারিখ','Through'),'<input id="until" type="date">')}</form><div id="results" aria-live="polite"></div>`);
 const run=()=>{
  const term=$('query').value.trim().toLowerCase(), section=$('search-section').value, district=districtList().find(d=>d.id===$('search-district').value);
  const from=$('since').value, until=$('until').value;
  const hits=stories.filter(s=>{
   const day=s.publishedAt?new Date(s.publishedAt).toLocaleDateString('sv-SE',{timeZone:'Asia/Dhaka'}):'';
   return (!section||s.section===section)&&(!district||[district.id,district.bn].includes(s.district))&&(!from||(day&&day>=from))&&(!until||(day&&day<=until))&&[s.bn,s.en,s.descBn,s.descEn,s.district,s.upazila,name(s.section)].some(v=>String(v||'').toLowerCase().includes(term));
  });
  $('results').innerHTML=from&&until&&from>until?t('তারিখের ক্রম ঠিক করুন।','Check the date range.'):hits.length?feed(hits):t('কোনো খবর পাওয়া যায়নি।','No matching stories.');
 };
 $('search-filters').oninput=run;$('search-filters').onsubmit=e=>{e.preventDefault();run()};$('query').focus();run();
}
