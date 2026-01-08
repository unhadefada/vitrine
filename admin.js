// Admin da vitrine com login simples (client-side)
// * Atenção: login somente para uso básico em páginas estáticas. Não protege dados sensíveis. *

const ADMIN_PASSWORD = 'admin';

// Funções de Base64 seguras para UTF-8
function toBase64(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (m, p1) => String.fromCharCode('0x' + p1)));
}
function fromBase64(b64) {
  return decodeURIComponent(Array.prototype.map.call(atob(b64), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
}

// Elementos
const $ = (sel) => document.querySelector(sel);
const els = {
  loginView: $('#login-view'),
  adminApp: $('#admin-app'),
  authActions: $('#auth-actions'),
  loginPass: $('#login-pass'),
  loginRemember: $('#login-remember'),
  btnLogin: $('#btn-login'),
  btnLogout: $('#btn-logout'),
  title: document.getElementById('cfg-title'),
  desc: document.getElementById('cfg-desc'),
  primary: document.getElementById('cfg-primary'),
  bg: document.getElementById('cfg-bg'),
  text: document.getElementById('cfg-text'),
  accent: document.getElementById('cfg-accent'),
  layout: document.getElementById('cfg-layout'),
  radius: document.getElementById('cfg-radius'),
  itemImgFile: document.getElementById('item-img-file'),
  itemImgUrl: document.getElementById('item-img-url'),
  itemTitle: document.getElementById('item-title'),
  itemDesc: document.getElementById('item-desc'),
  itemLink: document.getElementById('item-link'),
  itemCta: document.getElementById('item-cta'),
  btnAdd: document.getElementById('btn-add'),
  itemsTableBody: document.querySelector('#items-table tbody'),
  btnSaveLocal: document.getElementById('btn-save-local'),
  btnLoadLocal: document.getElementById('btn-load-local'),
  btnExport: document.getElementById('btn-export'),
  fileImport: document.getElementById('file-import'),
  btnGenerate: document.getElementById('btn-generate'),
  shareUrl: document.getElementById('share-url'),
  btnCopy: document.getElementById('btn-copy'),
  btnPreview: document.getElementById('btn-preview'),
};

// Autenticação simples (local/session storage)
function isAuthed() {
  return sessionStorage.getItem('vitrine_admin_auth') === '1' || localStorage.getItem('vitrine_admin_auth') === '1';
}
function setAuth(persistent) {
  sessionStorage.setItem('vitrine_admin_auth', '1');
  if (persistent) localStorage.setItem('vitrine_admin_auth', '1');
}
function clearAuth() {
  sessionStorage.removeItem('vitrine_admin_auth');
  localStorage.removeItem('vitrine_admin_auth');
}
function showLogin() {
  els.loginView.style.display = '';
  els.adminApp.style.display = 'none';
  els.authActions.style.display = 'none';
}
function showAdmin() {
  els.loginView.style.display = 'none';
  els.adminApp.style.display = '';
  els.authActions.style.display = '';
}

// Eventos de login/logout
els.btnLogin.addEventListener('click', () => {
  const pass = (els.loginPass.value || '').trim();
  if (pass !== ADMIN_PASSWORD) {
    alert('Senha incorreta.');
    return;
  }
  setAuth(els.loginRemember.checked);
  showAdmin();
});

els.btnLogout.addEventListener('click', () => {
  clearAuth();
  showLogin();
});

// Estado inicial
if (isAuthed()) {
  showAdmin();
} else {
  showLogin();
}

// ====== Lógica do Admin ======
let config = {
  title: 'Minha Vitrine',
  description: 'Seleção de links e produtos',
  theme: {
    primary: '#2D7CF5',
    background: '#0D1117',
    text: '#E6EDF3',
    accent: '#FFB020',
    radius: 12,
  },
  layout: 'grid',
  items: [],
};

function syncFormToConfig() {
  config.title = els.title.value || config.title;
  config.description = els.desc.value || '';
  config.theme.primary = els.primary.value || config.theme.primary;
  config.theme.background = els.bg.value || config.theme.background;
  config.theme.text = els.text.value || config.theme.text;
  config.theme.accent = els.accent.value || config.theme.accent;
  config.theme.radius = Number(els.radius.value || config.theme.radius);
  config.layout = els.layout.value || config.layout;
}

function syncConfigToForm() {
  if (!els.title) return; // se não carregou elementos (antes do login)
  els.title.value = config.title;
  els.desc.value = config.description;
  els.primary.value = config.theme.primary;
  els.bg.value = config.theme.background;
  els.text.value = config.theme.text;
  els.accent.value = config.theme.accent;
  els.radius.value = config.theme.radius;
  els.layout.value = config.layout;
}

function renderItems() {
  if (!els.itemsTableBody) return;
  els.itemsTableBody.innerHTML = '';
  config.items.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${item.img ? `<img src="${item.img}" alt="${item.title}">` : '-'}</td>   
      <td>${item.title || '-'}</td>
      <td>${item.link ? `<a href="${item.link}" target="_blank" rel="noopener">${item.link}</a>` : '-'}</td>
      <td>
        <button class="btn" data-act="up" data-idx="${idx}">↑</button>
        <button class="btn" data-act="down" data-idx="${idx}">↓</button>
        <button class="btn" data-act="edit" data-idx="${idx}">Editar</button>
        <button class="btn" data-act="del" data-idx="${idx}">Remover</button>
      </td>
    `;
    els.itemsTableBody.appendChild(tr);
  });
}

function addItem(item) {
  config.items.push(item);
  renderItems();
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

// Eventos do formulário
if (els.btnAdd) {
  els.btnAdd.addEventListener('click', async () => {
    syncFormToConfig();
    let imgData = '';
    if (els.itemImgFile && els.itemImgFile.files && els.itemImgFile.files[0]) {
      try { imgData = await readImageFile(els.itemImgFile.files[0]); } catch (e) {}
    } else if (els.itemImgUrl && els.itemImgUrl.value) {
      imgData = els.itemImgUrl.value.trim();
    }
    const item = {
      img: imgData,
      title: els.itemTitle.value.trim(),
      description: els.itemDesc.value.trim(),
      link: els.itemLink.value.trim(),
      cta: els.itemCta.value.trim() || 'Abrir',
    };
    if (!item.title || !item.link) {
      alert('Informe ao menos Título e Link.');
      return;
    }
    addItem(item);
    // limpar
    if (els.itemImgFile) els.itemImgFile.value = '';
    if (els.itemImgUrl) els.itemImgUrl.value = '';
    els.itemTitle.value = '';
    els.itemDesc.value = '';
    els.itemLink.value = '';
    els.itemCta.value = '';
  });
}

if (els.itemsTableBody) {
  els.itemsTableBody.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const act = btn.getAttribute('data-act');
    const idx = Number(btn.getAttribute('data-idx'));
    if (act === 'up' && idx > 0) {
      [config.items[idx-1], config.items[idx]] = [config.items[idx], config.items[idx-1]];
      renderItems();
    } else if (act === 'down' && idx < config.items.length - 1) {
      [config.items[idx+1], config.items[idx]] = [config.items[idx], config.items[idx+1]];
      renderItems();
    } else if (act === 'del') {
      if (confirm('Remover este item?')) {
        config.items.splice(idx, 1);
        renderItems();
      }
    } else if (act === 'edit') {
      const it = config.items[idx];
      if (els.itemImgUrl) els.itemImgUrl.value = it.img && it.img.startsWith('http') ? it.img : '';
      els.itemTitle.value = it.title || '';
      els.itemDesc.value = it.description || '';
      els.itemLink.value = it.link || '';
      els.itemCta.value = it.cta || '';
      // remove para re-adicionar
      config.items.splice(idx, 1);
      renderItems();
    }
  });
}

// Local storage
if (els.btnSaveLocal) {
  els.btnSaveLocal.addEventListener('click', () => {
    syncFormToConfig();
    localStorage.setItem('vitrine_config', JSON.stringify(config));
    alert('Configuração salva no navegador.');
  });
}
if (els.btnLoadLocal) {
  els.btnLoadLocal.addEventListener('click', () => {
    const raw = localStorage.getItem('vitrine_config');
    if (!raw) { alert('Nada salvo.'); return; }
    try {
      config = JSON.parse(raw);
      syncConfigToForm();
      renderItems();
      alert('Configuração carregada do navegador.');
    } catch (e) {
      alert('Falha ao carregar.');
    }
  });
}

// Exportar / Importar
if (els.btnExport) {
  els.btnExport.addEventListener('click', () => {
    syncFormToConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'vitrine_config.json'; a.click();
    URL.revokeObjectURL(url);
  });
}
if (els.fileImport) {
  els.fileImport.addEventListener('change', async () => {
    const f = els.fileImport.files[0];
    if (!f) return;
    const txt = await f.text();
    try {
      config = JSON.parse(txt);
      syncConfigToForm();
      renderItems();
      alert('Configuração importada.');
    } catch (e) {
      alert('JSON inválido.');
    }
  });
}

// Gerar link
function buildShareUrl() {
  syncFormToConfig();
  const b64 = toBase64(JSON.stringify(config));
  const share = `vitrine.html?data=${b64}`; // caminho relativo
  return share;
}
if (els.btnGenerate) {
  els.btnGenerate.addEventListener('click', () => {
    const share = buildShareUrl();
    els.shareUrl.textContent = share;
  });
}
if (els.btnCopy) {
  els.btnCopy.addEventListener('click', async () => {
    const txt = els.shareUrl.textContent.trim();
    if (!txt) { alert('Gere o link primeiro.'); return; }
    try {
      const href = window.location.origin ? (new URL(txt, window.location.href)).href : txt;
      await navigator.clipboard.writeText(href);
      alert('Link copiado!');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = txt; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      alert('Link copiado!');
    }
  });
}
if (els.btnPreview) {
  els.btnPreview.addEventListener('click', () => {
    const share = buildShareUrl();
    window.open(share, '_blank');
  });
}

// Inicializar UI do admin (quando authed)
syncConfigToForm();
renderItems();