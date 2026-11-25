async function downloadStoryCard(story, language) {
 const english=language==='en';
 const headline=english?story.en:story.bn;
 if(!headline)throw Error('Select an article with a headline in this language.');
 const load=async src=>{
  const image=new Image();
  image.src=src;
  await image.decode();
  return image;
 };
 const [logo,photo]=await Promise.all([load('/reader/logo.png'),story.image?load('/reader/'+story.image+'.webp'):null,document.fonts.ready]);
 const canvas=document.createElement('canvas');
 canvas.width=1200;canvas.height=630;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#fff';ctx.fillRect(0,0,1200,630);
 ctx.drawImage(logo,52,35,330,330*logo.height/logo.width);
 ctx.fillStyle='#b71932';ctx.fillRect(52,129,1096,4);
 const width=photo?638:1096;
 if(photo){
  const w=409,h=378,scale=Math.max(w/photo.width,h/photo.height);
  ctx.save();ctx.beginPath();ctx.rect(739,159,w,h);ctx.clip();
  ctx.drawImage(photo,739+(w-photo.width*scale)/2,159+(h-photo.height*scale)/2,photo.width*scale,photo.height*scale);ctx.restore();
 }
 const words=headline.trim().split(/\s+/u);
 let size=64,lines=[];
 for(;size>=12;size-=2){
  ctx.font='bold '+size+'px "Noto Sans Bengali", sans-serif';
  lines=[''];
  for(const word of words){
   const i=lines.length-1;
   const joined=lines[i]?lines[i]+' '+word:word;
   if(lines[i]&&ctx.measureText(joined).width>width)lines.push(word);
   else lines[i]=joined;
  }
  if(lines.length*size*1.45<=340&&lines.every(line=>ctx.measureText(line).width<=width))break;
 }
 ctx.fillStyle='#161616';ctx.textBaseline='middle';
 lines.forEach((line,i)=>ctx.fillText(line,52,345+(i-(lines.length-1)/2)*size*1.45,width));
 ctx.fillStyle='#181818';ctx.fillRect(0,558,1200,72);
 ctx.fillStyle='#fff';ctx.font='bold 29px sans-serif';ctx.fillText('bangla24.news',52,594);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
 if(!blob)throw Error('The image could not be exported.');
 const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='bangla24-'+story.id+'-'+language+'.png';
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),60000);
}
