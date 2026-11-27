const sections = [
 ['home','প্রচ্ছদ','Home'],['latest','সর্বশেষ','Latest'],['national','বাংলাদেশ','Bangladesh'],['politics','রাজনীতি','Politics'],['district','জেলার খবর','Districts'],['world','বিশ্ব','World'],['business','বাণিজ্য','Business'],['sports','খেলা','Sports'],['entertainment','বিনোদন','Culture'],['opinion','মতামত','Opinion'],['life','জীবনযাপন','Lifestyle'],['diaspora','প্রবাস','Diaspora'],['tech','প্রযুক্তি','Technology'],['education','শিক্ষা','Education'],['jobs','চাকরি','Jobs'],['live','লাইভ আপডেট','Live updates']
];
const demoStories = [
 ['national','ঢাকা বদলাচ্ছে, বদলাচ্ছে যাতায়াতের অভ্যাস','How Dhaka’s daily commute is changing','মেট্রো, বাস ও হাঁটার পথ মিলিয়ে শহরের দৈনন্দিন যাত্রা আরও সহজ করার উপায়।','How metro, bus and walking connections can make everyday trips easier.','dhaka'],
 ['sports','নতুন মৌসুমের আগে ক্রিকেটারদের প্রস্তুতি','Cricketers prepare for a new season','অনুশীলনের রুটিনে ফিটনেস, ফিল্ডিং ও দলীয় সমন্বয়ে নজর।','Fitness, fielding and teamwork shape the preseason routine.','cricket'],
 ['district','চা-বাগানের পথে শ্রীমঙ্গলের এক সকাল','A morning among Srimangal’s tea gardens','চা-বাগানের পথ, সকালের আলো আর স্থানীয় মানুষের গল্প।','Tea-garden paths, morning light and the people who work the land.','tea','মৌলভীবাজার'],
 ['business','কাঁচাবাজারে দামের ওঠানামা বুঝবেন কীভাবে','Making sense of changing market prices','মৌসুম, সরবরাহ ও পরিবহন খরচ কীভাবে বাজারে প্রভাব ফেলে।','How seasons, supply and transport affect the price of produce.','market'],
 ['politics','স্থানীয় বাজেট নিয়ে নাগরিক আলোচনার গুরুত্ব','Why public discussion matters for local budgets','ওয়ার্ডের প্রয়োজন ও বরাদ্দ বুঝতে বাসিন্দারা যে প্রশ্নগুলো করতে পারেন।','Questions residents can ask about ward priorities and spending.'],
 ['world','দক্ষিণ এশিয়ার শহরে তাপ মোকাবিলার নতুন ভাবনা','South Asian cities rethink their response to heat','ছায়া, সবুজায়ন ও পথচারীবান্ধব নকশা নিয়ে একটি ব্যাখ্যা।','A look at shade, urban greenery and pedestrian-friendly design.'],
 ['entertainment','স্বল্পদৈর্ঘ্য চলচ্চিত্রে নতুন গল্প বলার সুযোগ','New voices in short filmmaking','ছোট পরিসরে চরিত্র, শব্দ ও দৃশ্য দিয়ে গল্প নির্মাণের অভিজ্ঞতা।','How filmmakers use character, sound and images to tell short stories.'],
 ['opinion','পথচারীর জন্য শহরে কতটা জায়গা আছে','How much room does the city give pedestrians?','ফুটপাত ও পারাপারের নকশায় মানুষের অভিজ্ঞতাকে অগ্রাধিকার দেওয়ার কথা।','A case for using everyday experiences to guide street design.'],
 ['life','সপ্তাহের বাজারে অপচয় কমানোর উপায়','How to waste less on your weekly shop','ঘরে কী আছে দেখে তালিকা করুন এবং খাবার রাখার জায়গা ঠিক করুন।','Check what you already have, make a list and plan storage.','market'],
 ['diaspora','কুয়ালালামপুরে বাংলা বই ঘিরে পাঠচক্র','A Bengali reading circle in Kuala Lumpur','প্রবাসে ভাষা ও সাহিত্যের সঙ্গে সম্পর্ক ধরে রাখার একটি উপায়।','Reading together can help keep language and literature close abroad.'],
 ['tech','পুরোনো ফোন বদলানোর আগে যা যাচাই করবেন','What to check before replacing an old phone','ব্যাটারি, সফটওয়্যার আপডেট ও মেরামতের খরচ মিলিয়ে দেখুন।','Compare battery health, software support and repair costs.'],
 ['education','দল বেঁধে পড়ার সময় কীভাবে কাজে লাগাবেন','How to get more from group study','প্রশ্ন ভাগ করা ও নিজের ভাষায় উত্তর বোঝানোর কয়েকটি কৌশল।','Share questions and practise explaining answers in your own words.'],
 ['jobs','চাকরির আবেদনের আগে জীবনবৃত্তান্ত সাজান','Refresh your résumé before applying','কাজের অভিজ্ঞতা সংক্ষেপে তুলে ধরতে ফলাফল ও উদাহরণ ব্যবহার করুন।','Use concrete outcomes and examples to summarize your experience.'],
 ['district','পদ্মার পাড়ে রাজশাহীর এক বিকেল','An afternoon by the Padma in Rajshahi','স্থানীয় পথ, নদীর ধারের খোলা জায়গা আর বিকেলের অবসর।','A look at riverside paths and open spaces in Rajshahi.','','রাজশাহী'],
 ['district','খুলনার নদীপাড়ে হাঁটার পরিকল্পনা','Planning a riverside walk in Khulna','পড়ন্ত বিকেলে ছোট পথ ধরে শহর দেখার অভিজ্ঞতা।','A short late-afternoon route to explore the city.','','খুলনা'],
 ['national','ঢাকার পাড়ায় হাঁটার পথ নিয়ে পাঁচটি প্রশ্ন','Five questions about walking routes in Dhaka','গন্তব্য কাছে হলেও পথের ছায়া ও নিরাপদ পারাপার গুরুত্বপূর্ণ।','Even on short trips, shade and safe crossings matter.','dhaka']
].map(([section,bn,en,descBn,descEn,image,district],id)=>({section,bn,en,descBn,descEn,image,district,id}));
let newsroom = {articles:[], breaking:[], lead:null, live:{updates:[]}};
let geography = [];
const samples = [...demoStories,...fullDemoStories,...extraDemoStories];
let stories = samples;
// Do not promote the stock database setup rows into the reader's edition.
function isSetupStory(story) {
 return /^\/news\/demo-(national|politics|international|sports|entertainment|technology|economy)$/.test(story.path || '') &&
        story.bn.startsWith('নমুনা প্রতিবেদন · ');
}
const hasCoverPhoto = story => Boolean(story && (story.image || story.photoUrl));
let visibleLatest = 16;
const safe = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const districtList = () => geography.flatMap(division=>division.districts);
const routeName = () => (['#main','#page-top'].includes(location.hash)?'':location.hash.slice(1)) || (location.pathname.startsWith('/article/') ? 'story-'+location.pathname.split('/').at(-1) : location.pathname.startsWith('/district/') ? 'district' : location.pathname.startsWith('/live/') ? 'live' : 'home');
const when = value => new Intl.DateTimeFormat(t('bn-BD','en-GB'),{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Dhaka'}).format(new Date(value));
const paragraphs = value => value ? value.split(/\n+/).filter(Boolean).map(line=>'<p>'+safe(line)+'</p>').join('') : '';
const demoBodies = {
 0:['দৈনন্দিন যাত্রায় শুধু ট্রেনে ওঠার সময় ধরলে পুরো হিসাব মেলে না। স্টেশনে পৌঁছানোর পথ, অপেক্ষা এবং শেষ গন্তব্য পর্যন্ত হাঁটার সময়ও ধরতে হয়।','একই গন্তব্যে দুদিন ভিন্ন সময়ে বেরিয়ে যাত্রার সময় লিখে রাখুন। যাত্রাবদলের স্থান, ফুটপাত এবং রাস্তা পারাপারের সুবিধা তুলনা করলে নিজের জন্য কার্যকর পথ বেছে নেওয়া সহজ হবে।'],
 1:['নতুন মৌসুমের আগে অনুশীলনে ব্যাটিং ও বোলিংয়ের পাশাপাশি ফিল্ডিংয়ের ছোট ছোট লক্ষ্য রাখা যায়। লোকাল ক্লাবগুলো ক্যাচ, থ্রো ও দৌড়ের জন্য আলাদা সময় ভাগ করতে পারে।'],
 2:['শ্রীমঙ্গলের সকালের আলোয় চা-বাগানের সারি দেখতে ভালো লাগে। হাঁটার পরিকল্পনা করলে আগে অনুমতি ও প্রবেশের নিয়ম জেনে নিন। কাজের সময় শ্রমিকদের চলাচলের পথ খোলা রাখুন।']
};
const $ = id => document.getElementById(id);
const requestedLanguage=new URLSearchParams(location.search).get('lang');
let en = ['bn','en'].includes(requestedLanguage)?requestedLanguage==='en':localStorage.lang === 'en', ticker = 0;
const t = (bn,english)=>en?english:bn;
const name = id=>{const s=sections.find(x=>x[0]===id);return s?t(s[1],s[2]):''};
const title = s=>safe(t(s.bn,s.en||s.bn));
const desc = s=>safe(t(s.descBn,s.descEn||s.descBn));
const translated=s=>Boolean(s.en&&s.descEn&&(!s.bodyBn||s.bodyEn));
const url = (s,english=en)=>s.path || '/article/'+s.id+'?lang='+(english&&translated(s)?'en':'bn');
const pic = s=>s.photoUrl?`<img width="960" height="540" src="${safe(s.photoUrl)}" alt="" loading="lazy">`:s.image?`<img width="768" height="512" src="/reader/${localStorage.lowData==='on'?'thumb-':''}${s.image}.webp" alt="" ${(s.id||localStorage.lowData==='on')?'loading="lazy"':''}>`:'';
const sectionTitle = (label,link,linkLabel=t('সব খবর','View all'))=>`<div class="section-title"><h2>${label}</h2>${link?`<a href="/#${link}">${linkLabel}</a>`:''}</div>`;
const card = (s,lead=false)=>`<article class="story ${lead?'lead':''}">${(s.image||s.photoUrl)?`<a href="${url(s)}" aria-label="${title(s)}" tabindex="-1">${pic(s)}</a>`:''}<a class="kicker" href="/#${s.section}">${name(s.section)}</a><${lead?'h2':'h3'}><a href="${url(s)}">${title(s)}</a></${lead?'h2':'h3'}><p>${desc(s)}</p></article>`;
const feed = items=>`<ul class="feed">${items.map(s=>`<li><time>${s.publishedAt?when(s.publishedAt):name(s.section)}</time><a href="${url(s)}">${title(s)}</a></li>`).join('')}</ul>`;
const deskSections = ['national','district','politics','world','business','sports','diaspora','entertainment','life','opinion','tech','education','jobs'];
const sectionStories = section=>stories.filter(s=>s.section===section||(section==='district'&&s.district)).sort((a,b)=>Number(Boolean(b.publishedAt))-Number(Boolean(a.publishedAt))||Number(b.id>=200)-Number(a.id>=200));
const picks = ()=>newsroom.articles.length?newsroom.articles.slice(0,4):[demoStories[2],demoStories[3],demoStories[9],demoStories[10]];
const toolsNav = ()=>`<nav class="reader-tools" aria-label="${t('পাঠকসেবা','Reader tools')}"><a href="/#live"><span aria-hidden="true">●</span> ${name('live')}</a><a href="/#my-news">${t('আমার খবর','My news')}</a><a href="/#briefing">${t('আজকের ৫ খবর','Daily five')}</a><a href="/#send-tip">${t('খবর পাঠান','Send a tip')}</a><a href="/#photos">${t('ছবির পাতা','Photos')}</a><a href="/#guides">${t('ব্যাখ্যা ও গাইড','Explainers & guides')}</a><a href="/#edition">${t('আজকের সংস্করণ','Today’s edition')}</a><a href="/#saved">${t('পড়ার তালিকা','Reading list')}</a></nav>`;
const galleryKeys = [0,1,2,3,101,108,116,120,126,131,146,151];
const photoGrid = (limit) => `<div class="photo-grid">${galleryKeys.slice(0,limit).map(id=>samples.find(s=>s.id===id)).filter(Boolean).map(s=>`<button class="photo-tile" type="button" data-photo="${s.id}">${pic(s)}<span>${title(s)}</span></button>`).join('')}</div>`;
const countries = [['মালয়েশিয়া','Malaysia',9,145],['যুক্তরাজ্য','United Kingdom',146],['সৌদি আরব','Saudi Arabia',147],['সংযুক্ত আরব আমিরাত','United Arab Emirates',148],['কানাডা','Canada',149],['কাতার','Qatar',208],['সিঙ্গাপুর','Singapore',209],['ওমান','Oman',210]];
const diasporaNav = () => `<div class="country-row"><a href="/#service-malaysia">${t('প্রবাস সেবাডেস্ক','Diaspora service desk')}</a>${countries.map(([bn,english,...ids])=>`<a href="${url({id:ids.at(-1)})}">${t(bn,english)}</a>`).join('')}</div>`;
const district = ()=>`<section class="panel"><h3>${t('নিজ জেলার খবর খুঁজুন','Find news by district')}</h3><div class="actions"><select id="division" aria-label="${t('বিভাগ','Division')}"></select><select id="district" aria-label="${t('জেলা','District')}"></select><select id="upazila" aria-label="${t('উপজেলা','Upazila')}"></select><button id="my-district">${t('আমার জেলা সংরক্ষণ','Save my district')}</button></div><a id="district-link"></a><p id="district-message" role="status"></p></section>`;
function connectDistrict(cards){
 if(!$('district'))return;
 const division=$('division'), districtSelect=$('district'), upazila=$('upazila');
 const initial=location.pathname.match(/^\/district\/([a-z-]+)$/)?.[1]||localStorage.myDistrict||'';
 const options=(items,label)=>`<option value="">${label}</option>`+items.map(([value,name])=>`<option value="${safe(value)}">${safe(name)}</option>`).join('');
 division.innerHTML=options(geography.map((d,i)=>[i,t(d.bn,d.en)]),t('সব বিভাগ','All divisions'));
 const parent=geography.findIndex(d=>d.districts.some(x=>x.id===initial));
 if(parent>=0)division.value=String(parent);
 function refreshStories(){
  const chosen=districtList().find(d=>d.id===districtSelect.value);
  const rows=stories.filter(s=>s.district&&(!chosen||(s.district===chosen.bn||s.district===chosen.id))&&(!upazila.value||s.upazila===upazila.value)&&(!division.value||chosen||geography[Number(division.value)].districts.some(d=>s.district===d.bn||s.district===d.id)));
  $('district-results').innerHTML=rows.length?cards(rows):`<p>${t('এই এলাকায় এখনো কোনো খবর প্রকাশিত হয়নি।','No stories have been published for this area yet.')}</p>`;
  $('district-link').textContent=chosen?t(chosen.bn,chosen.en):'';
  if(chosen)$('district-link').href='/district/'+chosen.id;
  $('my-district').disabled=!chosen;
 }
 function changeDistrict(){
  const chosen=districtList().find(d=>d.id===districtSelect.value);
  upazila.innerHTML=options((chosen?.upazilas||[]).map(d=>[d.bn,t(d.bn,d.en)]),t('সব উপজেলা','All upazilas'));
  upazila.disabled=!chosen;
  refreshStories();
 }
 function changeDivision(selected=''){
  const districts=division.value?geography[Number(division.value)].districts:districtList();
  districtSelect.innerHTML=options(districts.map(d=>[d.id,t(d.bn,d.en)]),t('সব জেলা','All districts'));
  districtSelect.value=selected;
  changeDistrict();
 }
 division.onchange=()=>changeDivision();
 districtSelect.onchange=changeDistrict;
 upazila.onchange=refreshStories;
 $('my-district').onclick=()=>{localStorage.myDistrict=districtSelect.value;$('district-message').textContent=t('জেলা সংরক্ষিত হয়েছে।','District saved.')};
 changeDivision(initial);
}
function render(){
 const route=routeName();
 const reading=route.startsWith('story-')?stories.find(s=>String(s.id)===route.slice(6)):null;
 if(reading&&!translated(reading))en=false;
 $('lang').hidden=Boolean(reading&&!translated(reading));
 document.documentElement.lang=t('bn','en');
 $('date').textContent=new Intl.DateTimeFormat(t('bn-BD','en-GB'),{dateStyle:'full',timeZone:'Asia/Dhaka'}).format(new Date());
 $('lang').textContent=t('English','বাংলা');
 document.querySelector('.edition').textContent=t('ই-পেপার','E-paper');
 $('facebook-label').textContent=t('ফেসবুকে অনুসরণ করুন','Follow on Facebook');
 $('footer-description').textContent=t('বাংলাদেশ, বিশ্ব ও প্রবাসের খবর এক ঠিকানায়।','Bangladesh, world and diaspora coverage in one place.');
 $('footer').textContent='bangla24.news · '+t('দেশের কথা, মানুষের কথা','Stories of Bangladesh and its people');
 const footerGroups=[
  [t('সংবাদ','News'),[['/#latest',name('latest')],['/#national',name('national')],['/#district',name('district')],['/#world',name('world')],['/#diaspora',name('diaspora')]]],
  [t('পাঠকসেবা','Reader tools'),[['/#live',name('live')],['/#photos',t('ছবির পাতা','In pictures')],['/#guides',t('ব্যাখ্যা ও গাইড','Explainers & guides')],['/#edition',t('ই-পেপার','E-paper')],['/#saved',t('পড়ার তালিকা','Reading list')]]],
  [t('প্রকাশনা','Publication'),[['/archive',t('সংবাদ আর্কাইভ','News archive')],['/#send-tip',t('খবর পাঠান','Send a tip')],['/#about',t('আমাদের সম্পর্কে','About us')],['/admin',t('নিউজরুম','Newsroom')]]]
 ];
 $('footer-links').innerHTML=footerGroups.map(([heading,links])=>`<section aria-label="${heading}"><h2>${heading}</h2><ul>${links.map(([href,label])=>`<li><a href="${href}">${label}</a></li>`).join('')}</ul></section>`).join('');
 $('nav').setAttribute('aria-label',t('প্রধান বিভাগ','Main sections'));
 $('nav').innerHTML=sections.map(([id])=>`<a href="/#${id==='home'?'':id}" ${route===id?'aria-current="page"':''}>${name(id)}</a>`).join('');
 const selectedBreaking=newsroom.breaking.map(id=>stories.find(s=>s.id===id)).filter(Boolean);
 const breakStories=selectedBreaking.length?selectedBreaking:[demoStories[0],demoStories[2],demoStories[3]];
 ticker%=breakStories.length;
 const breaking=breakStories[ticker];
 const featured=stories.find(s=>s.id===newsroom.lead);
 const lead=hasCoverPhoto(featured)?featured:stories.find(hasCoverPhoto);
 const tickerLabel=selectedBreaking.length?t('ব্রেকিং','Breaking'):t('নমুনা শিরোনাম','Sample headline');
 const tickerHtml=`<div class="ticker"><strong>${tickerLabel}</strong><a href="${url(breaking)}">${title(breaking)}</a><button id="prev" aria-label="Previous headline">‹</button><button id="next" aria-label="Next headline">›</button></div>`;
 const label=`<p class="meta">${t('নমুনা সংস্করণ · প্রদর্শনীর জন্য সংবাদ ও চিত্র','Demo edition · Sample stories and illustrative images')}</p>`;
 const originalFeatures=[{"bn":"জামদানির ফুল কাপড়ে ওঠে কীভাবে?","descBn":"পাতলা জমিনে একটি ফুল বুনতে তাঁতি কোথায় বাড়তি সুতা দেন, একটি শাড়ির নকশা ধরে দেখে নিন।","path":"/blog/jamdani-weaving-motifs.html","section":"guides","photoUrl":"/blog/jamdani-weaving.webp"},{"bn":"নকশিকাঁথার গল্প ধরে রাখবেন যেভাবে","descBn":"পুরোনো কাঁথার নকশা চেনার পাশাপাশি যিনি ফোঁড় তুলেছিলেন, তাঁর কথাও লিখে রাখুন।","path":"/blog/nakshi-kantha-family-story.html","section":"guides","photoUrl":"/blog/kantha.webp"},{"bn":"পুরোনো পারিবারিক ছবি গোছাতে প্রথম দশটি ছবি বাছুন","descBn":"ছবির মানুষ, জায়গা আর সময়ের পরিচয় কীভাবে পরের প্রজন্মের জন্য রেখে দেবেন।","path":"/blog/family-photo-album.html","section":"guides","photoUrl":"/blog/album.webp"},{"bn":"ছোট ছাদে বাগান শুরু করুন দুই টবে","descBn":"পুদিনা আর ধনেপাতার জন্য জায়গা বাছা থেকে প্রথম সপ্তাহের পরিচর্যা।","path":"/blog/small-rooftop-herb-garden.html","section":"guides","photoUrl":"/blog/garden.webp"}];
 const cards=items=>`<div class="cards">${items.map(s=>card(s)).join('')}</div>`;
 let html;
 if(route==='home'){
  const cover=stories.filter(s=>s!==lead&&(s.image||s.photoUrl)).slice(0,2);
  const latest=stories.filter(s=>s!==lead&&!cover.includes(s)).slice(0,6);
  html=`${tickerHtml}${toolsNav()}<div class="grid front-page">${card(lead,true)}<div class="rail cover-rail">${cover.map(s=>card(s)).join('')}</div><aside class="rail latest"><div class="latest-tabs" role="group" aria-label="${t('খবরের তালিকা','News lists')}"><button id="latest-tab" aria-pressed="true">${name('latest')}</button><button id="picks-tab" aria-pressed="false">${t('বাছাই','Editor’s picks')}</button></div><div id="headline-feed">${feed(latest)}</div><a class="text-link" href="/#latest">${t('সব সংবাদ','All news')}</a></aside></div>${label}
  <section class="district-promo panel"><div><h2>${name('district')}</h2><p>${t('বিভাগ, জেলা ও উপজেলা ধরে স্থানীয় খবর পড়ুন।','Browse local stories by division, district and upazila.')}</p></div><a class="primary-link" href="/#district">${t('আমার জেলার খবর','Find my district')}</a></section>${followedDistrict(cards)}
  <section class="desk-section guides-desk">${sectionTitle(t('ব্যাখ্যা ও গাইড','Explainers & guides'),'guides',t('সব গাইড','All guides'))}${cards([...originalFeatures,fullDemoStories[0]])}</section>
  ${deskSections.map(section=>`<section class="desk-section">${sectionTitle(name(section),section)}${section==='diaspora'?diasporaNav():''}${cards(sectionStories(section).slice(0,4))}</section>`).join('')}
  <section class="photo-desk">${sectionTitle(t('ছবির পাতা','In pictures'),'photos',t('সব ছবি','All photos'))}${photoGrid(4)}</section>`;
  setTimeout(()=>{
   if(!$('latest-tab'))return;
   const toggle=useLatest=>{ $('latest-tab').setAttribute('aria-pressed',String(useLatest));$('picks-tab').setAttribute('aria-pressed',String(!useLatest));$('headline-feed').innerHTML=feed(useLatest?latest:picks()); };
   $('latest-tab').onclick=()=>toggle(true);$('picks-tab').onclick=()=>toggle(false);
  },0);

 }else if(route.startsWith('story-') && stories.some(s=>String(s.id)===route.slice(6))){
  const story=stories.find(s=>String(s.id)===route.slice(6));
  html=`<article class="article"><a class="kicker" href="/#${story.section}">${name(story.section)}</a><h1>${title(story)}</h1>${translated(story)?`<a class="text-link" href="${url(story,!en)}" hreflang="${en?'bn':'en'}">${t('Read in English','বাংলায় পড়ুন')}</a>`:''}${story.noticeDeadline?noticeStamp(story):''}<p>${desc(story)}</p>${story.publishedAt?`<p class="meta">${safe(story.byline)} ${safe(story.location||districtList().find(d=>d.id===story.district)?.bn||story.district||'')} · ${when(story.publishedAt)} · ${t('আপডেট','Updated')} ${when(story.updatedAt)}</p>`:label}${story.sourceUrl?`<p><a class="text-link" href="${safe(story.sourceUrl)}" target="_blank" rel="noopener">${t('মূল উৎস','Original source')}</a></p>`:''}${articleBrief(story)}${pic(story)}${story.image?`<p class="meta">${safe(story.credit)||t('প্রতীকী চিত্র','Illustrative image')}</p>`:''}${paragraphs(t(story.bodyBn,story.bodyEn||story.bodyBn)||(en?['A door-to-door commute includes the walk to the station, time spent waiting and the final stretch. Compare two departure times and note which route offers easier transfers and crossings.','Preseason training can include small fielding goals alongside batting and bowling. Local clubs can set aside separate sessions for catching, throwing and running.','Before walking among the tea gardens of Srimangal, check access rules and ask permission. Leave working paths clear for the people tending the gardens.'][story.id]:demoBodies[story.id]?.join('\n')))}${story.correction?`<aside class="panel"><strong>${t('সংশোধনী','Correction')}</strong><time>${when(story.correctedAt||story.updatedAt)}</time><p>${safe(story.correction)}</p></aside>`:''}<div class="actions"><button id="save">${t('পড়ার তালিকায় রাখুন','Save to reading list')}</button><a class="primary-link" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.origin+url(story))}">${t('ফেসবুকে শেয়ার করুন','Share on Facebook')}</a><button id="report-error">${t('ভুল জানান','Report an error')}</button><button id="share">${t('লিংক কপি করুন','Copy link')}</button></div>${sectionTitle(t('আরও পড়ুন','Read more'),'latest')}${feed([...sectionStories(story.section).filter(s=>s!==story),...stories.filter(s=>s.section!==story.section)].slice(0,4))}</article>`;
 }else if(route.startsWith('service-')){html=serviceDesk(route,cards);
 }else if(route==='my-news'){html=myNews(cards);
 }else if(route==='briefing'){html=briefingPage();
 }else if(route==='data-mode'){html=sectionTitle(t('কম ডেটা মোড','Low-data mode'))+`<label class="panel"><input id="lite" type="checkbox" ${localStorage.lowData==='on'?'checked':''}> ${t('ছোট ছবি ব্যবহার করুন','Use smaller news images')}</label>`;
 }else if(route==='guides'){
  html=`${sectionTitle(t('ব্যাখ্যা ও গাইড','Explainers & guides'))}${cards(originalFeatures)}${label}${cards(fullDemoStories)}`;
 }else if(route==='photos'){
  html=`${sectionTitle(t('ছবির পাতা','In pictures'))}${label}${photoGrid(galleryKeys.length)}`;
 }else if(route==='send-tip'){
  html=readerTipForm();

 }else if(route==='live'){
  const key=location.pathname.startsWith('/live/')?location.pathname.split('/').pop():null;
  const current = newsroom.live.title ? newsroom.live : null;
  const archive = newsroom.liveArchive || [];
  const live = key ? [current, ...archive].find(day => day?.id === key) : current;
  html = sectionTitle(name('live'));
  if (live) {
    const updates = live.updates.map(update => `<li><time>${when(update.time)}</time><h3><a href="${safe(update.path)}">${safe(update.title)}</a></h3>${paragraphs(update.text)}</li>`).join('');
    html += `<div class="panel"><span class="badge">${live.status === 'live' ? t('লাইভ', 'Live') : t('লাইভ শেষ', 'Ended')}</span>
      <h1>${safe(live.title)}</h1><a class="text-link" href="/live/${safe(live.id)}">${t('স্থায়ী লিংক', 'Permanent link')}</a>
      <ol class="timeline">${updates}</ol></div>`;
  } else {
    html += `<p class="panel">${key ? t('এই কভারেজটি পাওয়া যায়নি।', 'This coverage is unavailable.') : t('এই মুহূর্তে কোনো লাইভ আপডেট নেই।', 'There are no live updates right now.')}</p>`;
  }
  html += archive.map(day => `<p><a href="/live/${safe(day.id)}">${safe(day.id)} · ${safe(day.title)}</a></p>`).join('');
 }else if(route==='district'){
  const currentDistrict=districtList().find(d=>location.pathname==='/district/'+d.id);
  html=`${toolsNav()}${sectionTitle(currentDistrict?t(currentDistrict.bn,currentDistrict.en):name('district'))}${district()}<div id="district-results">${cards(stories.filter(s=>s.district))}</div>${label}`;
 }else if(['edition','about','saved'].includes(route)){
  const saved=JSON.parse(localStorage.saved||'[]');
  html=route==='edition'?`${sectionTitle(t('আজকের ই-পেপার','Today’s e-paper'))}${label}<div class="panel">${cards(deskSections.flatMap(section=>sectionStories(section).slice(0,1)))}<button id="print">${t('প্রিন্ট করুন','Print edition')}</button></div>`:route==='saved'?`${sectionTitle(t('পড়ার তালিকা','Reading list'))}${saved.length?feed(stories.filter(s=>saved.includes(s.id))):`<p>${t('এখনও কোনো খবর সংরক্ষণ করা হয়নি।','No stories saved yet.')}</p>`}`:`${sectionTitle(t('আমাদের সম্পর্কে','About bangla24.news'))}${label}<p>${t('বাংলাদেশ ও প্রবাসের পাঠকের জন্য বাংলা ও ইংরেজিতে একটি ডিজিটাল সংবাদপত্রের নমুনা।','A Bengali and English digital newspaper preview for readers in Bangladesh and abroad.')}</p>`;
 }else{
  html=`${sectionTitle(name(route)||name('latest'))}${route==='diaspora'?diasporaNav():''}${cards(route==='latest'?stories.slice(0,visibleLatest):sectionStories(route))}${route==='latest'&&visibleLatest<stories.length?`<button id="more-news">${t('আরও সংবাদ','More news')}</button>`:''}${label}`;
 }
 $('main').innerHTML=html;
 if($('lite'))$('lite').onchange=e=>{localStorage.lowData=e.target.checked?'on':'off'};
 if($('preferences'))$('preferences').onsubmit=e=>{e.preventDefault();const data=new FormData(e.target);localStorage.myDistrict=data.get('district');localStorage.newsCountry=data.get('country');render()};
 if($('more-news'))$('more-news').onclick=()=>{visibleLatest+=16;const position=scrollY;render();window.scrollTo(0,position)};
 $('main').querySelectorAll('[data-photo]').forEach(button=>button.onclick=()=>{
  const s=samples.find(item=>item.id===Number(button.dataset.photo));
  openDialog(t('ছবির পাতা','In pictures'),`<figure class="photo-preview">${pic(s)}<figcaption>${title(s)} · ${t('প্রতীকী চিত্র','Illustrative image')}</figcaption></figure><a class="text-link" href="${url(s)}">${t('খবর পড়ুন','Read story')}</a>`);
 });
 if($('prev')){ $('prev').onclick=()=>{ticker=(ticker+breakStories.length-1)%breakStories.length;render();$('prev').focus()};$('next').onclick=()=>{ticker=(ticker+1)%breakStories.length;render();$('next').focus()};}
 connectDistrict(cards);
 connectAlerts();deliverAlerts();
 connectReaderTip();
 if($('print'))$('print').onclick=()=>window.print();
 if($('save')) {
  const id=stories.find(s=>String(s.id)===route.slice(6)).id;
  $('report-error').onclick=()=>reportIssue(stories.find(s=>s.id===id));
  const saved=JSON.parse(localStorage.saved||'[]');
  if(saved.includes(id))$('save').textContent=t('সংরক্ষিত','Saved');
  $('save').onclick=()=>{if(!saved.includes(id))saved.push(id);localStorage.saved=JSON.stringify(saved);$('save').textContent=t('সংরক্ষিত','Saved')};
  $('share').onclick=async()=>{try{await navigator.clipboard.writeText(location.origin+url(stories.find(s=>s.id===id)));$('share').textContent=t('কপি হয়েছে','Copied')}catch{window.prompt(t('লিংক কপি করুন','Copy link'),location.origin+url(stories.find(s=>s.id===id)))}};
 }
}
function openDialog(label, html, kind = '') {
 const dialog=$('dialog');
 dialog.classList.toggle('section-menu',kind==='menu');
 $('dialog-title').textContent=label;
 $('close').setAttribute('aria-label',t('বন্ধ করুন','Close'));
 $('dialog-body').innerHTML=html;
 dialog.showModal();
 if(kind==='menu') $('dialog-title').focus();
}
$('close').onclick=()=>$('dialog').close();
$('menu').onclick=()=>{
 const route=routeName();
 const primary=['home','latest','district','live'];
 const links=ids=>ids.map(id=>[id,name(id)]);
 const groups=[
  ['quick',t('দ্রুত যান','Quick access'),links(primary)],
  ['sections',t('সংবাদ বিভাগ','News sections'),links(sections.map(([id])=>id).filter(id=>!primary.includes(id)))],
  ['tools',t('পাঠকসেবা','Reader tools'),[
   ['service-malaysia',t('প্রবাস সেবাডেস্ক','Diaspora service desk')],['my-news',t('আমার খবর','My news')],['briefing',t('আজকের ৫ খবর','Daily five')],['data-mode',t('কম ডেটা মোড','Low-data mode')],['edition',t('ই-পেপার','E-paper')],['saved',t('পড়ার তালিকা','Reading list')],
   ['photos',t('ছবির পাতা','In pictures')],['guides',t('ব্যাখ্যা ও গাইড','Explainers & guides')],
   ['send-tip',t('খবর পাঠান','Send a tip')],['about',t('আমাদের সম্পর্কে','About us')],
   ['newsroom',t('নিউজরুম','Newsroom')]
  ]]
 ];
 const tiles=items=>items.map(([id,label])=>{
  const href=id==='newsroom'?'/admin':id==='home'?'/':'/#'+id;
  return `<li><a href="${href}" ${route===id?'aria-current="page"':''}>${label}</a></li>`;
 }).join('');
 openDialog(t('সব বিভাগ','All sections'),`<nav class="menu-directory" aria-label="${t('সব বিভাগ','All sections')}">${groups.map(([kind,heading,items])=>`<section class="menu-group menu-${kind}"><h3>${heading}</h3><ul>${tiles(items)}</ul></section>`).join('')}</nav>`,'menu');
};
$('search').onclick=advancedSearch;
$('dialog-body').onclick=e=>{if(e.target.closest('a'))$('dialog').close()};
$('lang').onclick=()=>{const reading=stories.find(s=>routeName()==='story-'+s.id);localStorage.lang=en?'bn':'en';if(reading){location.assign(url(reading,!en));return}en=!en;render()};
$('theme').onclick=()=>{localStorage.dark=String(document.documentElement.classList.toggle('dark'));$('theme').setAttribute('aria-pressed',localStorage.dark)};
document.documentElement.classList.toggle('dark',localStorage.dark==='true');
$('theme').setAttribute('aria-pressed',String(localStorage.dark==='true'));
document.querySelector('.skip-to-content').onclick=event=>{
 event.preventDefault();
 $('main').focus();
};
addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});
render();
async function loadNews(){
 try{
  const result=await fetch('/api/news');
  if(!result.ok)return;
  const next=await result.json();
  next.articles=next.articles.filter(story=>!isSetupStory(story));
  if(JSON.stringify(next)===JSON.stringify(newsroom))return;
  newsroom=next;
  stories=[...newsroom.articles,...samples];
  if(!(document.activeElement?.closest('form')||$('dialog').open))render();else deliverAlerts();
 }catch{}
}
fetch('/reader/geography.json').then(response=>response.json()).then(data=>{geography=data;if(['district','send-tip','my-news'].includes(routeName())||(routeName()==='home'&&localStorage.myDistrict))render()}).catch(()=>{});
loadNews();
setInterval(()=>{if(!document.hidden&&(routeName()==='live'||(['daily','breaking'].includes(localStorage.alertFrequency)&&localStorage.alertPaused!=='1'))){loadNews();deliverAlerts()}},30000);

const siteHeader = $('site-header');
let previousScroll = Math.max(0, window.scrollY);
let scrollDirection = 0;
let distanceInDirection = 0;
let headerUpdatePending = false;

function returnToTop(event) {
 event.preventDefault();
 const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 siteHeader.querySelector('.masthead-identity a').focus({ preventScroll: true });
 window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' });
}

document.getElementById('back-to-top').addEventListener('click', returnToTop);
document.getElementById('footer-back-to-top').addEventListener('click', returnToTop);

function updateFloatingHeader() {
 const position = Math.max(0, window.scrollY);
 const delta = position - previousScroll;
 const direction = Math.sign(delta);

 if (direction && direction !== scrollDirection) {
  scrollDirection = direction;
  distanceInDirection = 0;
 }

 distanceInDirection += Math.abs(delta);
 const pastHeader = position > siteHeader.offsetHeight;
 const topControl=$('back-to-top');
 const footerAction=$('footer-back-to-top');
 const footerActionVisible=footerAction.getBoundingClientRect().top < window.innerHeight-12;
 topControl.classList.toggle('is-visible',position>400&&!footerActionVisible);
 siteHeader.classList.toggle('is-floating', pastHeader);

 if (!pastHeader) {
  siteHeader.classList.remove('is-hidden');
 } else if (distanceInDirection >= 8) {
  siteHeader.classList.toggle('is-hidden', scrollDirection > 0);
 }

 previousScroll = position;
 headerUpdatePending = false;
}

function queueScrollUpdate() {
 if (headerUpdatePending) return;
 headerUpdatePending = true;
 requestAnimationFrame(updateFloatingHeader);
}
window.addEventListener('scroll',queueScrollUpdate,{passive:true});
window.addEventListener('resize',queueScrollUpdate);
updateFloatingHeader();
