import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const root = path.resolve(import.meta.dirname, '..');
const docs = path.join(root, 'docs');
const title = '경제사';
const meta = [
  {id:'260902', title:'강의 개요와 학습 안내', short:'장기사·분류사·학습 경로', color:'blue', intro:'경제생활과 제도의 변화를 긴 시간에서 읽는 강의의 시각, 주차별 학습 경로, 참고 교재와 평가 방식을 정리한다.'},
  {id:'260909', title:'경제사학: 사실, 이론, 반사실', short:'방법론과 클리오메트릭스', color:'teal', intro:'역사 자료에 경제 이론을 적용하되 자료의 생성 과정과 제도적 맥락을 함께 읽는다. 발전단계론, 성장사학, 클리오메트릭스와 신제도경제사를 차례로 연결한다.'},
  {id:'260916', title:'인구: 생존, 이동, 성장', short:'맬서스·질병·이주', color:'amber', intro:'인구는 산출을 나누는 분모이면서 노동, 수요, 전염과 이주의 주체다. 출생·사망·이동의 회계식에서 시작해 장기 성장과 세계적 인구 이동을 분석한다.'},
  {id:'260923', title:'농업: 토지와 노동의 제도', short:'장원·흑사병·농업혁명', color:'blue', intro:'농업 생산력과 토지의 권리 구조를 함께 보면 장원, 흑사병, 농민 해방, 인클로저와 공업화가 한 인과 사슬로 연결된다.'},
  {id:'260930', title:'공업: 길드에서 공장 이전까지', short:'도시·선대제·매뉴팩처', color:'teal', intro:'생산이 도시 길드의 규칙에서 농촌 가내공업, 선대제, 매뉴팩처로 옮아간 과정을 노동 통제, 거래비용, 규모의 경제로 읽는다.'},
];
const readings = [
  {id:'mccloskey', date:'260909', title:'Does the Past Have Useful Economics?', author:'D. N. McCloskey · 1976', source:'https://ideas.repec.org/a/aea/jeclit/v14y1976i2p434-61.html'},
  {id:'david', date:'260909', title:'Clio and the Economics of QWERTY', author:'Paul A. David · 1985', source:'https://www.jstor.org/stable/1805621'},
  {id:'goldin', date:'260909', title:'Cliometrics and the Nobel', author:'Claudia Goldin · 1995', source:'https://www.aeaweb.org/articles?id=10.1257/jep.9.2.191'},
  {id:'greif', date:'260909', title:'Cliometrics after 40 years', author:'Avner Greif · 1997', source:'https://web.stanford.edu/~avner/Greif_Papers/1997%20Clio%20AER.pdf'},
  {id:'population-basics', date:'260916', title:'인구와 경제: 기본 개념 검토', author:'한국의 경제발전과 인구변동 · 1차시', source:'https://youtu.be/luHh0S9SlH4'},
  {id:'demographic-transition', date:'260916', title:'인구변천', author:'한국의 경제발전과 인구변동 · 2차시', source:'https://youtu.be/J4jeB1QHjOY'},
  {id:'mortality-transition', date:'260916', title:'사망률 변천', author:'한국의 경제발전과 인구변동 · 3차시', source:'https://youtu.be/953x7Le4PnY'},
  {id:'fertility-transition', date:'260916', title:'출생률 변천', author:'한국의 경제발전과 인구변동 · 4차시', source:'https://youtu.be/d1JINF3af34'},
];
const slideIndex = JSON.parse(fs.readFileSync(path.join(root,'content','slide-index.json'),'utf8'));
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function readLecture(m) {
  const info = slideIndex.find(x=>x.date===m.id);
  if (!info) throw new Error(`Missing index for ${m.id}`);
  const source = fs.readFileSync(path.join(root,'content','lectures',`${m.id}.md`),'utf8').replaceAll('\r\n','\n');
  const headings = [...source.matchAll(/^## 슬라이드 (\d{1,3})(?: · (.*))?$/gm)];
  if (headings.length !== info.count) throw new Error(`${m.id}: ${headings.length} notes for ${info.count} slides`);
  const slides = headings.map((h,i)=>({
    number:Number(h[1]),
    title:(h[2]||info.slides[i].title).trim(),
    markdown:source.slice(h.index+h[0].length,headings[i+1]?.index??source.length).trim(),
  }));
  slides.forEach((s,i)=>{
    if(s.number!==i+1) throw new Error(`${m.id}: expected slide ${i+1}, got ${s.number}`);
    if(s.markdown.length<90) throw new Error(`${m.id} slide ${s.number}: explanation too short`);
  });
  return {...m,count:info.count,slides};
}
const lectures=meta.map(readLecture);
const readingDocs=readings.map(r=>({...r,markdown:fs.readFileSync(path.join(root,'content','readings',`${r.id}.md`),'utf8')}));
function htmlWithMath(markdown) {
  const questions=[];
  const questionLines=markdown.replaceAll('\r\n','\n').split('\n');
  const plainLines=[];
  for(let i=0;i<questionLines.length;i++){
    const match=questionLines[i].match(/^:::question (.+)$/);
    if(!match){plainLines.push(questionLines[i]);continue;}
    const body=[];
    while(++i<questionLines.length&&questionLines[i].trim()!==':::')body.push(questionLines[i]);
    if(i>=questionLines.length)throw new Error(`Unclosed question: ${match[1]}`);
    questions.push({title:match[1],body:body.join('\n').trim()});
    plainLines.push('',`@@QUESTION${questions.length-1}@@`,'');
  }
  markdown=plainLines.join('\n');
  const tokens=[];
  let prepared=markdown.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g,(_,tex)=>`\n\n@@MATHBLOCK${tokens.push({kind:'block',tex})-1}@@\n\n`);
  prepared=prepared.replace(/(?<!\\)\$((?:\\\$|[^$\n])+?)\$/g,(_,tex)=>`@@MATHINLINE${tokens.push({kind:'inline',tex})-1}@@`);
  let html=marked.parse(prepared,{gfm:true,breaks:false});
  html=html.replace(/<p>@@MATHBLOCK(\d+)@@<\/p>/g,(_,n)=>`<div class="equation">\\[${esc(tokens[+n].tex)}\\]</div>`);
  html=html.replace(/@@MATHINLINE(\d+)@@/g,(_,n)=>`<span class="math-inline">\\(${esc(tokens[+n].tex)}\\)</span>`);
  html=html.replace(/<p>@@QUESTION(\d+)@@<\/p>/g,(_,n)=>`<details class="question"><summary>${esc(questions[+n].title)}</summary>${htmlWithMath(questions[+n].body)}</details>`);
  if(/@@MATH(?:BLOCK|INLINE)\d+@@/.test(html)) throw new Error('Unreplaced math token');
  if(/@@QUESTION\d+@@/.test(html)) throw new Error('Unreplaced question token');
  return html;
}
function texEscape(s) {return String(s).replace(/[\\{}%&#_^~]/g,c=>({'\\':'\\textbackslash{}','{':'\\{','}':'\\}','%':'\\%','&':'\\&','#':'\\#','_':'\\_','^':'\\^{}','~':'\\~{}'}[c]));}
function inlineTex(s) {
  let out=''; let i=0;
  while(i<s.length){
    if(s[i]==='$' && s[i-1]!=='\\') {const j=s.indexOf('$',i+1); if(j>i){out+=s.slice(i,j+1);i=j+1;continue;}}
    if(s.startsWith('**',i)){const j=s.indexOf('**',i+2);if(j>i){out+=`\\textbf{${inlineTex(s.slice(i+2,j))}}`;i=j+2;continue;}}
    if(s[i]==='`'){const j=s.indexOf('`',i+1);if(j>i){out+=`\\texttt{${texEscape(s.slice(i+1,j))}}`;i=j+1;continue;}}
    if(s[i]==='['){const link=s.slice(i).match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);if(link){out+=`\\href{${link[2]}}{${texEscape(link[1])}}`;i+=link[0].length;continue;}}
    let j=i+1;while(j<s.length&&!['$','*','`','['].includes(s[j]))j++;
    out+=texEscape(s.slice(i,j));i=j;
  }
  return out;
}
function markdownToTex(md){
  const lines=md.replaceAll('\r\n','\n').split('\n');const out=[];
  for(let i=0;i<lines.length;i++){
    const line=lines[i].trim();if(!line){out.push('');continue;}
    if(line==='$$'){let block=[];i++;while(i<lines.length&&lines[i].trim()!=='$$')block.push(lines[i++]);if(i>=lines.length)throw new Error('Unclosed math');out.push('\\[',...block,'\\]');continue;}
    if(line.startsWith(':::question ')){out.push(`\\paragraph{${inlineTex(line.slice(12))}}`);continue;}
    if(line===':::')continue;
    if(line.startsWith('### ')){out.push(`\\paragraph{${inlineTex(line.slice(4))}}`);continue;}
    if(line.startsWith('## ')){out.push(`\\subsubsection{${inlineTex(line.slice(3))}}`);continue;}
    if(line.startsWith('- ')){out.push(`\\noindent\\textbullet\ ${inlineTex(line.slice(2))}\\par`);continue;}
    if(line.startsWith('<details>')){const plain=line.replace(/<[^>]*>/g,' ');out.push(`${inlineTex(plain)}\\par`);continue;}
    if(line.startsWith('|')){out.push(inlineTex(line.replaceAll('|',' · '))+'\\par');continue;}
    out.push(inlineTex(line)+'\\par');
  }
  return out.join('\n');
}
function writeTex(){
  let out=String.raw`\documentclass[10pt,a4paper]{article}
\usepackage[a4paper,margin=22mm,headheight=14pt]{geometry}
\usepackage{kotex}
\usepackage{amsmath,amssymb}
\usepackage{xcolor}
\usepackage[colorlinks=true,linkcolor=blue!55!black,urlcolor=blue!55!black]{hyperref}
\setlength{\parindent}{0pt}
\setlength{\parskip}{0.55em}
\setcounter{tocdepth}{2}
\begin{document}
\begin{titlepage}\centering\vspace*{3cm}
{\Large 경제사\par}\vspace{1.1cm}
{\Huge\bfseries 슬라이드별 학습 가이드\par}\vspace{1.1cm}
{\large 인구, 농업, 공업과 경제사 연구의 방법\par}
\vfill {\large 2026년 2학기\par}\end{titlepage}
\tableofcontents\clearpage
`;
  for(const c of lectures){
    out+=`\n\\section{${texEscape(c.title)}}\n${inlineTex(c.intro)}\\par\n`;
    for(const s of c.slides)out+=`\n\\subsection{${texEscape(`슬라이드 ${String(s.number).padStart(2,'0')} · ${s.title}`)}}\n${markdownToTex(s.markdown)}\n`;
    for(const r of readingDocs.filter(x=>x.date===c.id))out+=`\n\\subsection{읽기 · ${texEscape(r.title)}}\n${markdownToTex(r.markdown)}\n`;
  }
  // Math mode's Latin font has no Hangul glyphs; wrap Korean labels in text mode.
  const hangulInMath=expr=>expr.replace(/\\text\{([^}]*[가-힣][^}]*)\}/g,(_,s)=>`\\mbox{${s}}`).replace(/[가-힣]+/g,(s,pos,whole)=>whole.slice(0,pos).endsWith('\\mbox{')?s:`\\mbox{${s}}`);
  out=out.replace(/\$([^$\n]+)\$/g,(_,expr)=>`$${hangulInMath(expr)}$`);
  out=out.replace(/\\\[([\s\S]*?)\\\]/g,(_,expr)=>`\\[${hangulInMath(expr)}\\]`);
  out+='\n\\end{document}\n';
  fs.mkdirSync(path.join(root,'guide'),{recursive:true});fs.writeFileSync(path.join(root,'guide','main.tex'),out);
}
const mathjax=`<script>window.MathJax={tex:{inlineMath:[['\\\\(','\\\\)']],displayMath:[['\\\\[','\\\\]']]},options:{skipHtmlTags:['script','noscript','style','textarea','pre','code']}};</script><script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>`;
const navCards=current=>lectures.map(c=>`<a class="chapter-link ${current===c.id?'is-current':''}" href="../lecture/${c.id}.html"><span class="chapter-num">${c.id.slice(2)}</span><span><strong>${esc(c.title)}</strong><small>${esc(c.short)}</small></span><span class="chapter-count">${c.count}</span></a>`).join('');
function shell(pageTitle,body,prefix=''){
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="경제사 슬라이드별 학습 가이드"><title>${esc(pageTitle)} · 경제사</title><link rel="stylesheet" href="${prefix}assets/site.css">${mathjax}</head><body data-prefix="${prefix}"><div class="reading-progress" aria-hidden="true"></div><header class="site-header"><a class="brand" href="${prefix}index.html"><span class="brand-mark">∂</span><span class="brand-title">경제사 <b>가이드</b></span></a><span class="header-divider"></span><span class="header-subtitle">슬라이드별 학습 가이드</span><a class="pdf-link" href="${prefix}study-guide.pdf" download>PDF 가이드 ↓</a><button type="button" class="search-trigger" data-search-trigger aria-label="전체 검색 열기"><span>⌕</span> 검색 <kbd>/</kbd></button></header>${body}<dialog id="slide-dialog" class="slide-dialog"><button type="button" class="dialog-close" data-dialog-close aria-label="이미지 닫기">×</button><img alt="확대한 슬라이드"><p></p></dialog><dialog id="search-dialog" class="search-dialog"><div class="search-panel"><div class="search-input-row"><span>⌕</span><input type="search" id="search-input" placeholder="개념, 사례, 수식 검색" aria-label="전체 내용 검색"><button type="button" data-search-close aria-label="검색 닫기">×</button></div><div id="search-results" class="search-results"></div><p class="search-hint">슬라이드와 읽기 해설을 함께 검색합니다. Esc로 닫기</p></div></dialog><script src="${prefix}assets/search-index.js"></script><script src="${prefix}assets/site.js"></script></body></html>`;
}
function sidebar(c){return `<aside class="sidebar"><a class="sidebar-home" href="../index.html">← 전체 목차</a><div class="sidebar-label">강의</div><nav aria-label="강의 목록" class="chapter-nav">${navCards(c.id)}</nav><div class="sidebar-label sidebar-label-slides">이 강의의 슬라이드</div><nav aria-label="슬라이드 목차" class="slide-nav">${c.slides.map(s=>`<a href="#s${String(s.number).padStart(3,'0')}" data-slide-link="${String(s.number).padStart(3,'0')}"><span>${String(s.number).padStart(2,'0')}</span>${esc(s.title)}</a>`).join('')}</nav></aside>`;}
function writeIndex(){
  const cards=lectures.map(c=>`<a class="overview-card card-${c.color}" href="lecture/${c.id}.html"><div class="overview-card-top"><span>${c.id.slice(2)}</span><span>${c.count}개 슬라이드</span></div><h3>${esc(c.title)}</h3><p>${esc(c.short)}</p><div class="card-arrow">학습하기 <span>↗</span></div></a>`).join('');
  const body=`<main class="home-main"><section class="home-hero"><div class="eyebrow">경제사 · 2026년 2학기</div><h1>사람과 제도를 따라<br><em>경제의 긴 시간을 읽다</em></h1><p>경제사의 방법에서 출발해 인구, 농업, 공업의 변화를 연결한다. 각 슬라이드의 그림과 해설을 나란히 읽고, 주차별 읽기 자료를 독립된 가이드로 공부할 수 있다.</p><div class="hero-actions"><a class="primary-button" href="lecture/260902.html">처음부터 읽기 <span>→</span></a><a class="pdf-link" href="study-guide.pdf" download>PDF 내려받기 ↓</a><span>5개 강의 · 314개 슬라이드</span></div><div class="hero-formula" aria-label="일인당 생산">\\[y_t=Y_t/N_t\\]</div></section><section class="learning-path"><div class="section-kicker">학습 경로</div><h2>방법에서 사람과 생산으로</h2><div class="path-line"><span>경제사학</span><b>→</b><span>인구</span><b>→</b><span>농업</span><b>→</b><span>공업</span></div><div class="overview-grid">${cards}</div></section><section class="home-note"><h2>읽는 방법</h2><p>왼쪽 목차에서 슬라이드로 이동하고 이미지를 누르면 확대됩니다. 각 회차 끝에는 관련 읽기 자료의 상세 해설이 이어집니다. 수식은 변수의 뜻과 단위를 확인하며 따라가세요.</p></section><footer class="site-footer">경제사 · 2026-2</footer></main>`;
  fs.writeFileSync(path.join(docs,'index.html'),shell('전체 목차',body));
}
function extraDiagram(c,s){
  const diagram=c.id==='260916'&&s.number===9?'malthus-dynamics.svg':null;
  if(!diagram)return '';
  return `<figure class="concept-figure"><img src="../assets/diagrams/${diagram}" alt="기술 개선 뒤 인구 증가와 1인당 산출의 변화를 보이는 맬서스 모형"><figcaption>기술 충격은 먼저 소득을 높이고, 인구 반응은 장기 균형을 이동시킨다.</figcaption></figure>`;
}
function writeLecture(c,i){
  const slides=c.slides.map(s=>{
    const n=String(s.number).padStart(3,'0');const image=`../assets/slides/${c.id}/${n}.webp`;
    return `<section class="slide" id="s${n}" data-slide="${n}"><div class="slide-heading"><span class="slide-index">${c.id.slice(2)} / ${n}</span><h2>${esc(s.title)}</h2></div><div class="slide-grid"><figure class="slide-figure"><button type="button" class="slide-image-button" data-zoom-src="${image}" data-zoom-label="${c.title} · 슬라이드 ${s.number}" aria-label="슬라이드 ${s.number} 이미지 확대"><img src="${image}" alt="${c.title} 슬라이드 ${s.number}" width="1500" height="1061" loading="lazy" decoding="async"><span class="zoom-hint">확대해서 보기 ↗</span></button><figcaption>슬라이드 ${s.number}</figcaption></figure><div class="explanation">${htmlWithMath(s.markdown)}${extraDiagram(c,s)}</div></div></section>`;
  }).join('');
  const assigned=readingDocs.filter(r=>r.date===c.id);
  const assignment=assigned.length?`<section class="learning-path reading-assignment"><div class="section-kicker">이어 읽기</div><h2>이 회차의 읽기 자료</h2><div class="overview-grid">${assigned.map(r=>`<a class="overview-card card-teal" href="../reading/${r.id}.html"><div class="overview-card-top"><span>READING</span><span>상세 해설</span></div><h3>${esc(r.title)}</h3><p>${esc(r.author)}</p><div class="card-arrow">읽기 가이드 <span>↗</span></div></a>`).join('')}</div></section>`:'';
  const prev=lectures[i-1],next=lectures[i+1];
  const pager=`<nav class="chapter-pager" aria-label="이전·다음 강의">${prev?`<a href="${prev.id}.html"><small>이전 강의</small><strong>← ${esc(prev.title)}</strong></a>`:'<span></span>'}${next?`<a href="${next.id}.html"><small>다음 강의</small><strong>${esc(next.title)} →</strong></a>`:'<span></span>'}</nav>`;
  const main=`<div class="layout">${sidebar(c)}<main class="lecture-main"><section class="lecture-hero"><div class="eyebrow">${c.id.slice(2)} · ${c.count}개 슬라이드</div><h1>${esc(c.title)}</h1><div class="lecture-intro"><p>${esc(c.intro)}</p></div><div class="lecture-start"><a href="#s001">첫 슬라이드로 내려가기 ↓</a><span>${i+1} / ${lectures.length}</span></div></section>${slides}${assignment}${pager}<footer class="site-footer">경제사 · 2026-2</footer></main></div>`;
  fs.writeFileSync(path.join(docs,'lecture',`${c.id}.html`),shell(c.title,main,'../'));
}
function writeReading(r){
  const c=lectures.find(x=>x.id===r.date);
  const diagram=r.id==='demographic-transition'?'<figure class="concept-figure reading-diagram"><img src="../assets/diagrams/demographic-transition.svg" alt="사망률이 먼저 낮아지고 출생률이 뒤이어 낮아지는 인구변천 도식"><figcaption>곡선 사이의 간격이 자연증가율을 결정한다. 각 나라의 실제 전환 시기와 속도는 다르다.</figcaption></figure>':'';
  const body=`<div class="layout"><aside class="sidebar"><a class="sidebar-home" href="../lecture/${c.id}.html">← ${esc(c.title)}</a><div class="sidebar-label">같은 회차의 읽기 자료</div><nav class="chapter-nav">${readingDocs.filter(x=>x.date===r.date).map(x=>`<a class="chapter-link ${x.id===r.id?'is-current':''}" href="${x.id}.html"><span class="chapter-num">↗</span><span><strong>${esc(x.title)}</strong><small>${esc(x.author)}</small></span></a>`).join('')}</nav></aside><main class="lecture-main"><section class="lecture-hero"><div class="eyebrow">READING · ${r.date.slice(2)}</div><h1>${esc(r.title)}</h1><div class="lecture-intro"><p>${esc(r.author)}</p></div><div class="lecture-start"><a href="${esc(r.source)}" target="_blank" rel="noopener">원문 정보와 자료 보기 ↗</a><span>읽기 가이드</span></div></section>${diagram}<article class="reading-body explanation">${htmlWithMath(r.markdown)}</article><nav class="chapter-pager"><a href="../lecture/${c.id}.html"><small>강의로 돌아가기</small><strong>← ${esc(c.title)}</strong></a></nav><footer class="site-footer">경제사 · 2026-2</footer></main></div>`;
  fs.writeFileSync(path.join(docs,'reading',`${r.id}.html`),shell(r.title,body,'../'));
}
fs.mkdirSync(path.join(docs,'lecture'),{recursive:true});fs.mkdirSync(path.join(docs,'reading'),{recursive:true});fs.mkdirSync(path.join(docs,'assets'),{recursive:true});
writeTex();writeIndex();lectures.forEach(writeLecture);readingDocs.forEach(writeReading);
const indexText=markdown=>markdown.replace(/^:::question /gm,'').replace(/^:::[ \t]*$/gm,'').replace(/<[^>]+>|\$\$?/g,' ').replace(/[*_`#|\\]/g,' ').replace(/\s+/g,' ');
const search=[...lectures.flatMap(c=>c.slides.map(s=>({url:`lecture/${c.id}.html#s${String(s.number).padStart(3,'0')}`,chapterTitle:c.title,slide:String(s.number),title:s.title,text:indexText(s.markdown)}))),...readingDocs.map(r=>({url:`reading/${r.id}.html`,chapterTitle:'읽기 자료',slide:'읽기',title:r.title,text:indexText(r.markdown)}))];
fs.writeFileSync(path.join(docs,'assets','search-index.js'),`window.GUIDE_SEARCH=${JSON.stringify(search)};\n`);
console.log(`Built ${lectures.length} lectures, ${search.length} searchable sections, and guide/main.tex`);
