// Vitrine — renderização com logo/avatar
function fromBase64(b64){return decodeURIComponent(Array.prototype.map.call(atob(b64),c=>'%' + ('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''))}
function getParam(name){ const params=new URLSearchParams(location.search); return params.get(name); }

function applyTheme(theme){ const root=document.documentElement; if(!theme) return; if(theme.primary) root.style.setProperty('--color-primary', theme.primary); if(theme.background) root.style.setProperty('--color-bg', theme.background); if(theme.text) root.style.setProperty('--color-text', theme.text); if(theme.accent) root.style.setProperty('--color-accent', theme.accent); if(theme.radius!==undefined) root.style.setProperty('--radius', (theme.radius|0)+'px'); }

function render(config){
  const title=(config.title||'Minha Vitrine').trim();
  document.getElementById('vt-title').textContent=title;
  document.getElementById('vt-desc').textContent=config.description||'';
  applyTheme(config.theme);

  // Logo ou fallback com inicial
  const logoEl=document.getElementById('vt-logo');
  const fbEl=document.getElementById('vt-logo-fallback');
  const fbLetter=document.getElementById('vt-logo-letter');
  if(logoEl && config.logo){ logoEl.src=config.logo; logoEl.style.display='block'; if(fbEl) fbEl.style.display='none'; }
  else { const letter=title?title[0].toUpperCase():'S'; if(fbLetter) fbLetter.textContent=letter; if(fbEl) fbEl.style.display='flex'; if(logoEl) logoEl.style.display='none'; }

  const cont=document.getElementById('items');
  cont.classList.toggle('list', config.layout==='list');
  cont.innerHTML='';
  (config.items||[]).forEach(item=>{
    const card=document.createElement('article'); card.className='card-item';
    if(item.img){ const img=document.createElement('img'); img.alt=item.title||''; img.src=item.img; card.appendChild(img); }
    const body=document.createElement('div'); body.className='body';
    const h3=document.createElement('h3'); h3.textContent=item.title||'';
    const p=document.createElement('p'); p.textContent=item.description||'';
    const actions=document.createElement('div'); actions.className='actions';
    const a=document.createElement('a'); a.className='btn btn-link'; a.textContent=item.cta||'Abrir'; a.href=item.link||'#'; a.target='_blank'; a.rel='noopener noreferrer'; actions.appendChild(a);
    body.appendChild(h3); if(p.textContent) body.appendChild(p); body.appendChild(actions); card.appendChild(body); cont.appendChild(card);
  });
}

function loadConfig(){ const data=getParam('data'); if(data){ try{ const json=fromBase64(data); return JSON.parse(json); }catch(e){ console.error('Falha ao decodificar dados',e); } }
  const raw=localStorage.getItem('vitrine_config'); if(raw){ try{ return JSON.parse(raw); }catch(e){} }
  return { title:'Exemplo de Vitrine', description:'Este é um exemplo gerado automaticamente.', theme:{ primary:'#5B4CF6', background:'#0D1117', text:'#E6EDF3', accent:'#FFB020', radius:12 }, layout:'grid', items:[ { img:'https://picsum.photos/seed/1/600/400', title:'Item 1', description:'Descrição do item 1', link:'https://example.com', cta:'Abrir' }, { img:'https://picsum.photos/seed/2/600/400', title:'Item 2', description:'Descrição do item 2', link:'https://example.com', cta:'Abrir' }, { img:'https://picsum.photos/seed/3/600/400', title:'Item 3', description:'Descrição do item 3', link:'https://example.com', cta:'Abrir' } ] } }

document.getElementById('btn-share').addEventListener('click', async ()=>{ const url=location.href; if(navigator.share){ try{ await navigator.share({title:document.title||'Vitrine', url}); }catch(e){} } else { try{ await navigator.clipboard.writeText(url); alert('Link copiado!'); }catch(e){ const ta=document.createElement('textarea'); ta.value=url; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); alert('Link copiado!'); } } })

const cfg=loadConfig(); render(cfg);