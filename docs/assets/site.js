const prefix=document.body.dataset.prefix||'';
const searchDialog=document.getElementById('search-dialog');
const searchInput=document.getElementById('search-input');
const searchResults=document.getElementById('search-results');
function openSearch(){searchDialog.showModal();searchInput.focus();renderSearch('')}
document.querySelectorAll('[data-search-trigger]').forEach(b=>b.addEventListener('click',openSearch));
document.querySelectorAll('[data-search-close]').forEach(b=>b.addEventListener('click',()=>searchDialog.close()));
document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();openSearch()}});
function renderSearch(query){
  const q=query.trim().toLocaleLowerCase('ko');
  if(!q){searchResults.innerHTML='<p>찾고 싶은 개념이나 사례를 입력하세요.</p>';return}
  const words=q.split(/\s+/).filter(Boolean);
  const found=(window.GUIDE_SEARCH||[]).filter(x=>words.every(w=>`${x.title} ${x.chapterTitle} ${x.text}`.toLocaleLowerCase('ko').includes(w))).slice(0,14);
  searchResults.innerHTML=found.length?found.map(x=>`<a href="${prefix}${x.url}"><small>${escapeHtml(x.chapterTitle)} · ${escapeHtml(x.slide)}</small><strong>${escapeHtml(x.title)}</strong><span>${escapeHtml(searchSnippet(x.text,words))}</span></a>`).join(''):'<p>일치하는 내용이 없습니다.</p>';
}
function searchSnippet(source,words){
  const lower=source.toLocaleLowerCase('ko');
  const at=lower.indexOf(words[0]);
  const start=Math.max(0,at-45);
  const end=Math.min(source.length,start+140);
  return `${start?'…':''}${source.slice(start,end)}${end<source.length?'…':''}`;
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
searchInput.addEventListener('input',()=>renderSearch(searchInput.value));
searchDialog.addEventListener('click',e=>{if(e.target===searchDialog)searchDialog.close()});

const slideDialog=document.getElementById('slide-dialog');
document.querySelectorAll('[data-zoom-src]').forEach(button=>button.addEventListener('click',()=>{
  slideDialog.querySelector('img').src=button.dataset.zoomSrc;
  slideDialog.querySelector('img').alt=button.dataset.zoomLabel;
  slideDialog.querySelector('p').textContent=button.dataset.zoomLabel;
  slideDialog.showModal();
}));
document.querySelectorAll('[data-dialog-close]').forEach(b=>b.addEventListener('click',()=>slideDialog.close()));
slideDialog.addEventListener('click',e=>{if(e.target===slideDialog)slideDialog.close()});

  const originalDialog=document.getElementById('original-text-dialog');
  if(originalDialog){
    const readingId=originalDialog.dataset.readingId;
    const status=originalDialog.querySelector('[data-original-status]');
  const pageSelect=originalDialog.querySelector('[data-original-page]');
  const pageView=originalDialog.querySelector('[data-original-view]');
  const search=originalDialog.querySelector('[data-original-search]');
  const matches=originalDialog.querySelector('[data-original-matches]');
  const previous=originalDialog.querySelector('[data-original-prev]');
  const next=originalDialog.querySelector('[data-original-next]');
    let pages=[];
    let current=0;
    let loading=null;
    function parseOriginal(raw){
      const markers=[...raw.matchAll(/^\[\[PAGE (\d+)\]\]\s*$/gm)];
      if(!markers.length)throw new Error('원문 텍스트의 쪽 구분을 읽지 못했습니다.');
      return markers.map((marker,i)=>({number:Number(marker[1]),text:raw.slice(marker.index+marker[0].length,markers[i+1]?.index??raw.length).trim()}));
  }
  function setStatus(message,error=false){status.textContent=message;status.classList.toggle('is-error',error)}
  function renderPage(){
    const page=pages[current];
    pageView.replaceChildren();
    if(!page)return;
    pageSelect.value=String(current);
    previous.disabled=current===0;
    next.disabled=current===pages.length-1;
    const needle=search.value.trim();
    const appendHighlighted=(target,value)=>{
      if(!needle){target.textContent=value;return}
      const lower=value.toLocaleLowerCase();
      const query=needle.toLocaleLowerCase();
      let cursor=0;
      while(cursor<value.length){
        const found=lower.indexOf(query,cursor);
        if(found<0){target.append(document.createTextNode(value.slice(cursor)));break}
        target.append(document.createTextNode(value.slice(cursor,found)));
        const mark=document.createElement('mark');mark.textContent=value.slice(found,found+needle.length);target.append(mark);
        cursor=found+needle.length;
      }
    };
    const blocks=page.text.split(/\n{2,}/).map(block=>block.trim()).filter(Boolean);
    for(const [index,block] of blocks.entries()){
      const rows=block.split('\n');
      if(rows.length>1&&rows.every(row=>row.includes('|'))){
        const table=document.createElement('table');
        table.className='original-data-table';
        for(const [rowIndex,row] of rows.entries()){
          const tr=document.createElement('tr');
          for(const cell of row.split('|')){
            const node=document.createElement(rowIndex===0?'th':'td');
            appendHighlighted(node,cell.trim());
            tr.append(node);
          }
          table.append(tr);
        }
        pageView.append(table);
        continue;
      }
      const heading=block==='Notes'||block==='REFERENCES'||block==='References'||/^TABLE [IVX]+$/.test(block)||index===0&&block.length<90;
      const node=document.createElement(heading?'h3':'p');
      if(block==='Notes')node.className='original-notes-heading';
      appendHighlighted(node,block);
      pageView.append(node);
    }
  }
  function renderMatches(){
    matches.replaceChildren();
    const query=search.value.trim().toLocaleLowerCase();
    if(!query||!pages.length)return;
    const found=pages.map((page,i)=>({page,i})).filter(item=>item.page.text.toLocaleLowerCase().includes(query));
    matches.append(document.createTextNode(found.length?`${found.length}개 PDF 쪽에서 발견: `:'일치하는 쪽이 없습니다.'));
      for(const item of found){
      const button=document.createElement('button');button.type='button';button.textContent=String(item.page.number);
      button.addEventListener('click',()=>{current=item.i;renderPage();pageView.scrollTop=0});
      matches.append(button);
    }
  }
    function loadOriginal(raw){
      pages=parseOriginal(raw);
    current=0;
    pageSelect.replaceChildren();
    for(const [i,page] of pages.entries()){
      const option=document.createElement('option');option.value=String(i);option.textContent=`${page.number} / ${pages.length}`;pageSelect.append(option);
    }
      setStatus(`${pages.length}쪽의 원문 텍스트를 열었습니다.`);
      renderPage();renderMatches();
    }
    document.querySelectorAll('[data-original-open]').forEach(button=>button.addEventListener('click',async()=>{
      originalDialog.showModal();
      if(pages.length)return;
      if(loading)return;
      setStatus('원문 텍스트를 불러오는 중입니다.');
      loading=fetch(`../assets/original-text/${encodeURIComponent(readingId)}.txt`)
        .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.text()})
        .then(loadOriginal);
      try{
        await loading;
      }catch(error){setStatus('원문 텍스트를 불러오지 못했습니다. 잠시 후 다시 열어 주세요.',true)}
      finally{loading=null}
    }));
  originalDialog.querySelector('[data-original-close]').addEventListener('click',()=>originalDialog.close());
  originalDialog.addEventListener('click',event=>{if(event.target===originalDialog)originalDialog.close()});
  previous.addEventListener('click',()=>{if(current>0){current--;renderPage();pageView.scrollTop=0}});
  next.addEventListener('click',()=>{if(current<pages.length-1){current++;renderPage();pageView.scrollTop=0}});
  pageSelect.addEventListener('change',()=>{current=Number(pageSelect.value);renderPage();pageView.scrollTop=0});
  search.addEventListener('input',()=>{renderMatches();renderPage()});
}

const sections=[...document.querySelectorAll('.slide')];
const links=[...document.querySelectorAll('[data-slide-link]')];
if(sections.length&&links.length){
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
    if(!visible.length)return;
    links.forEach(a=>a.classList.toggle('is-active',a.dataset.slideLink===visible[0].target.dataset.slide));
  },{rootMargin:'-90px 0px -68% 0px'});
  sections.forEach(s=>observer.observe(s));
}
const readingSections=[...document.querySelectorAll('.reading-section[id]')];
const readingLinks=[...document.querySelectorAll('[data-reading-link]')];
if(readingSections.length&&readingLinks.length){
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
    if(!visible.length)return;
    readingLinks.forEach(a=>a.classList.toggle('is-active',a.dataset.readingLink===visible[0].target.id));
  },{rootMargin:'-90px 0px -68% 0px'});
  readingSections.forEach(s=>observer.observe(s));
}
const progress=document.querySelector('.reading-progress');
function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${max>0?Math.max(0,Math.min(100,scrollY/max*100)):0}%`}
addEventListener('scroll',updateProgress,{passive:true});updateProgress();
