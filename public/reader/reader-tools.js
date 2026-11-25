function readerTipForm() {
 const districtOptions = districtList().map(d=>`<option value="${safe(d.id)}">${safe(t(d.bn,d.en))}</option>`).join('');
 return `<section class="panel reader-tip"><h1>${t('আপনার এলাকার খবর পাঠান','Send a local news tip')}</h1>
 <p>${t('আপনার তথ্য নিউজরুম যাচাই করবে। যোগাযোগের তথ্য শুধু সম্পাদকরা দেখতে পাবেন।','The newsroom reviews submissions. Only editors can see your contact details.')}</p>
 <form id="reader-tip-form" class="desk-grid">
 <label>${t('জেলা','District')}<select name="district" required><option value="">${t('জেলা বাছুন','Choose a district')}</option>${districtOptions}</select></label>
 <label>${t('উপজেলা (ঐচ্ছিক)','Upazila (optional)')}<select name="upazila" disabled><option value="">—</option></select></label>
 <label>${t('শিরোনাম','Headline')}<input name="headline" required minlength="5" maxlength="160"></label>
 <label>${t('যোগাযোগ (ঐচ্ছিক)','Contact (optional)')}<input name="contact" maxlength="160"></label>
 <label>${t('কী ঘটেছে, কোথায় ও কখন?','What happened, where and when?')}<textarea name="details" rows="5" required minlength="20" maxlength="4000"></textarea></label>
 <label>${t('ছবি (ঐচ্ছিক, সর্বোচ্চ ৪০০ কেবি)','Photo (optional, up to 400 KB)')}<input name="photo" type="file" accept="image/jpeg,image/png,image/webp"></label>
 <button class="primary-link">${t('খবর পাঠান','Send tip')}</button>
 <p role="status"></p></form></section>`;
}
function connectReaderTip() {
 const form = $('reader-tip-form');
 if (!form) return;
 const {district,upazila,photo} = form.elements;
 district.value = localStorage.getItem('myDistrict') || '';
 district.onchange = () => {
  const selected = districtList().find(d=>d.id===district.value);
  upazila.replaceChildren(new Option('—',''),...(selected?.upazilas||[]).map(u=>new Option(t(u.bn,u.en),u.bn)));
  upazila.disabled=!selected;
 };
 district.onchange();
 form.onsubmit = async event => {
  event.preventDefault();
  const message=form.querySelector('[role=status]');
  const button=form.querySelector('button');
  const image=photo.files[0];
  if (image && (image.size>409600 || !['image/jpeg','image/png','image/webp'].includes(image.type))) {
   message.textContent=t('৪০০ কেবির মধ্যে JPG, PNG বা WebP ছবি বাছুন।','Choose a JPG, PNG or WebP photo under 400 KB.');
   return;
  }
  button.disabled=true;
  message.textContent=t('পাঠানো হচ্ছে…','Sending…');
  try {
   const data=Object.fromEntries(new FormData(form));
   data.photo=image?await new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=()=>reject(reader.error);
    reader.readAsDataURL(image);
   }):'';
   const response=await fetch('/api/reader-tips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
   if (!response.ok) throw new Error('Submission failed');
   form.reset();
   district.onchange();
   message.textContent=t('খবরটি নিউজরুমে পাঠানো হয়েছে।','Your tip was sent to the newsroom.');
  } catch {
   message.textContent=t('পাঠানো যায়নি। আবার চেষ্টা করুন।','The tip could not be sent. Please try again.');
  } finally {button.disabled=false;}
 };
}
function followedDistrict(cards) {
 const district=districtList().find(d=>d.id===localStorage.getItem('myDistrict'));
 if (!district) return '';
 const local=stories.filter(s=>s.district===district.id||s.district===district.bn).slice(0,4);
 return `<section class="desk-section"><div class="section-title"><h2>${t('আমার জেলা','My district')} · ${safe(t(district.bn,district.en))}</h2><a href="/#district">${t('জেলা বদলান','Change district')}</a></div>${local.length?cards(local):`<p>${t('এই জেলায় এখনো কোনো খবর নেই।','No stories for this district yet.')}</p>`}</section>`;
}
const sampleBriefs = {
 0: [
  'ঢাকার যাত্রায় মেট্রো, বাস ও হাঁটার পথ একসঙ্গে বিবেচনা করা যায়।\nসংযোগ ও অপেক্ষার সময় ধরলে যাত্রার পূর্ণ হিসাব পাওয়া যায়।\nবের হওয়ার আগে শেষ গন্তব্য পর্যন্ত পথ দেখে নিন।',
  'Plan Dhaka journeys around metro, bus and walking together.\nInclude waiting and transfer time in your estimate.\nCheck the final stretch to your destination before leaving.'
 ],
 1: [
  'মৌসুমের আগে দলগুলো ব্যাটিং, বোলিং ও ফিল্ডিং অনুশীলন করে।\nক্যাচ ও থ্রোয়ের জন্য ছোট লক্ষ্য ঠিক করা যায়।\nসূচিতে ফিটনেস ও দলীয় সমন্বয় রাখুন।',
  'Teams prepare for the season with batting, bowling and fielding drills.\nSet small goals for catching and throwing.\nInclude fitness and team coordination in the schedule.'
 ],
 2: [
  'সকালের হাঁটায় শ্রীমঙ্গলের চা-বাগানের দৃশ্য দেখা যায়।\nবাগানে ঢোকার আগে অনুমতি ও প্রবেশের নিয়ম জেনে নিন।\nকর্মীদের চলাচলের পথ খালি রাখুন।',
  'A morning walk offers a view of Srimangal’s tea gardens.\nCheck entry rules and permission before visiting.\nKeep paths clear for workers.'
 ]
};
function articleBrief(story) {
 const brief=t(story.briefBn,story.briefEn||story.briefBn)||sampleBriefs[story.id]?.[en?1:0];
 if (!brief) return '';
 const lines=brief.split(/\n+/).map(line=>line.trim()).filter(Boolean).slice(0,3);
 return `<aside class="panel article-brief"><h2>${t('এক মিনিটে খবর','The story in one minute')}</h2><ul>${lines.map(line=>`<li>${safe(line)}</li>`).join('')}</ul></aside>`;
}
