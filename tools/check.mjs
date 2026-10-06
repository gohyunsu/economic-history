import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const docs=path.join(root,'docs');
const index=JSON.parse(fs.readFileSync(path.join(root,'content','slide-index.json'),'utf8'));
const expectedSlides=index.reduce((sum,item)=>sum+item.count,0);
const lectureDir=path.join(docs,'lecture');
const readingDir=path.join(docs,'reading');
const lectures=fs.readdirSync(lectureDir).filter(x=>x.endsWith('.html'));
const readings=fs.readdirSync(readingDir).filter(x=>x.endsWith('.html'));
let errors=[];
let slideSections=0;
let images=0;

for(const entry of index){
  const html=fs.readFileSync(path.join(lectureDir,`${entry.date}.html`),'utf8');
  const sections=[...html.matchAll(/<section class="slide" id="s(\d{3})"/g)];
  if(sections.length!==entry.count)errors.push(`${entry.date}: ${sections.length}/${entry.count} sections`);
  slideSections+=sections.length;
  for(let number=1;number<=entry.count;number++){
    const file=path.join(docs,'assets','slides',entry.date,`${String(number).padStart(3,'0')}.webp`);
    if(!fs.existsSync(file))errors.push(`Missing slide image: ${file}`);
    else images++;
  }
}

let readingQuestions=0;
for(const name of readings){
  const id=path.basename(name,'.html');
  const source=fs.readFileSync(path.join(root,'content','readings',`${id}.md`),'utf8');
  const html=fs.readFileSync(path.join(readingDir,name),'utf8');
  const headings=[...source.matchAll(/^## /gm)].length;
  const questions=[...source.matchAll(/^:::question /gm)].length;
  const sections=[...html.matchAll(/<section class="reading-section" id="r(\d{2})"/g)];
  const details=[...html.matchAll(/<details class="question"><summary>/g)];
  const answers=[...html.matchAll(/<div class="question-answer">/g)];
  const nav=[...html.matchAll(/data-reading-link="r(\d{2})"/g)];
  if(sections.length!==headings)errors.push(`${id}: ${sections.length}/${headings} reading sections`);
  if(details.length!==questions||answers.length!==questions)errors.push(`${id}: ${details.length} disclosure cards, ${answers.length} answers, ${questions} source questions`);
  if(nav.length!==headings)errors.push(`${id}: ${nav.length}/${headings} reading navigation links`);
  sections.forEach((section,i)=>{if(section[1]!==String(i+1).padStart(2,'0')||nav[i]?.[1]!==section[1])errors.push(`${id}: reading navigation mismatch at ${i+1}`);});
  readingQuestions+=questions;
}

for(const name of [...lectures.map(x=>`lecture/${x}`),...readings.map(x=>`reading/${x}`),'index.html']){
  const file=path.join(docs,name);
  const html=fs.readFileSync(file,'utf8');
  if(/@@MATH(?:BLOCK|INLINE)\d+@@/.test(html))errors.push(`Unrendered math token: ${name}`);
  if(/<del\b/i.test(html))errors.push(`Unexpected strikethrough: ${name}`);
  if(/\*\*[^*\n]+\*\*/.test(html))errors.push(`Unrendered bold Markdown: ${name}`);
  const prefix=path.dirname(file);
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const ref=match[1];
    if(/^(?:https?:|#|data:|mailto:)/.test(ref))continue;
    const local=decodeURIComponent(ref.split(/[?#]/)[0]);
    if(!fs.existsSync(path.resolve(prefix,local)))errors.push(`Broken local link: ${name} -> ${ref}`);
  }
}

for(const dir of ['docs','content','guide']){
  const walk=p=>{for(const item of fs.readdirSync(p,{withFileTypes:true})){
    const full=path.join(p,item.name);
    if(item.isDirectory())walk(full);
    else if(/\.(m4a|mp3|pptx?)$/i.test(item.name)||(/\.pdf$/i.test(item.name)&&path.relative(root,full)!=='docs\\study-guide.pdf'&&path.relative(root,full)!=='docs/study-guide.pdf'&&path.relative(root,full)!=='guide\\main.pdf'&&path.relative(root,full)!=='guide/main.pdf'))errors.push(`Source-like file in project: ${full}`);
  }};walk(path.join(root,dir));
}

if(!fs.existsSync(path.join(docs,'study-guide.pdf')))errors.push('Missing downloadable PDF');
if(lectures.length!==5)errors.push(`${lectures.length}/5 lecture pages`);
if(readings.length!==8)errors.push(`${readings.length}/8 reading pages`);
if(slideSections!==314||images!==314||expectedSlides!==314)errors.push(`Slide coverage: ${slideSections} sections, ${images} images, ${expectedSlides} expected`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log(`Verified ${lectures.length} lectures, ${slideSections} slide explanations and images, ${readings.length} reading guides with ${readingQuestions} disclosure answers, navigation, links and PDF.`);
