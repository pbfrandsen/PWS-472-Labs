/* ─── PWS-472 Site JS ─────────────────────────────────────────── */

/* ── Code blocks ───────────────────────────────────────────────── */
// Markdown renders bare <pre>; wrap each one in a .code-block with a copy button.
function initCodeBlocks() {
  document.querySelectorAll('.lab-content pre').forEach(pre => {
    if (pre.closest('.code-block')) return;
    const outer = pre.closest('.highlighter-rouge') || pre;
    const block = document.createElement('div');
    block.className = 'code-block';
    outer.replaceWith(block);
    block.innerHTML = '<button class="copy-btn">Copy</button>';
    block.appendChild(pre);
  });
}

// Markdown links to other sites open in a new tab, as the old HTML did.
function initExternalLinks() {
  document.querySelectorAll('.lab-content a[href^="http"]').forEach(a => {
    if (a.host !== location.host) { a.target = '_blank'; a.rel = 'noopener'; }
  });
}

/* ── Copy buttons ──────────────────────────────────────────────── */
function initCopyButtons() {
  document.querySelectorAll('.code-block').forEach(block => {
    const btn = block.querySelector('.copy-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const code = block.querySelector('pre').innerText;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });
}

/* ── Progress checklist ────────────────────────────────────────── */
function initChecklist() {
  const checklist = document.querySelector('.progress-checklist');
  if (!checklist) return;

  const labId = document.body.dataset.lab;
  const storageKey = 'pws472_progress_' + labId;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch(e) {}

  const items = checklist.querySelectorAll('.checklist-item');
  const fill = checklist.querySelector('.progress-bar-fill');
  const countEl = checklist.querySelector('.checklist-count');

  function updateBar() {
    const checked = checklist.querySelectorAll('input:checked').length;
    const pct = Math.round(checked / items.length * 100);
    if (fill) fill.style.width = pct + '%';
    if (countEl) countEl.textContent = checked + '/' + items.length + ' complete';
    // also update sidebar progress
    updateSidebarProgress();
    // store
    const state = {};
    items.forEach(item => {
      const cb = item.querySelector('input');
      state[cb.id] = cb.checked;
    });
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch(e) {}
    // mark card done if all complete
    if (labId) {
      const allDone = checked === items.length;
      try {
        const global = JSON.parse(localStorage.getItem('pws472_done') || '{}');
        global[labId] = allDone;
        localStorage.setItem('pws472_done', JSON.stringify(global));
      } catch(e) {}
    }
  }

  items.forEach(item => {
    const cb = item.querySelector('input');
    if (saved[cb.id]) { cb.checked = true; item.classList.add('checked'); }
    cb.addEventListener('change', () => {
      item.classList.toggle('checked', cb.checked);
      updateBar();
    });
    item.querySelector('label').addEventListener('click', () => {
      cb.checked = !cb.checked;
      item.classList.toggle('checked', cb.checked);
      updateBar();
    });
  });

  updateBar();
}

/* ── Sidebar progress ──────────────────────────────────────────── */
function updateSidebarProgress() {
  const fill = document.getElementById('sidebar-progress-fill');
  const label = document.getElementById('sidebar-progress-label');
  if (!fill) return;

  let done = 0;
  const total = document.querySelectorAll('.sidebar-link[data-lab]').length || 1;
  try {
    const global = JSON.parse(localStorage.getItem('pws472_done') || '{}');
    done = Object.values(global).filter(Boolean).length;
  } catch(e) {}

  fill.style.width = Math.round(done / total * 100) + '%';
  if (label) label.textContent = done + ' / ' + total + ' labs done';

  // mark sidebar links
  try {
    const global = JSON.parse(localStorage.getItem('pws472_done') || '{}');
    document.querySelectorAll('.sidebar-link[data-lab]').forEach(link => {
      const id = link.dataset.lab;
      link.classList.toggle('done', !!global[id]);
    });
  } catch(e) {}
}

/* ── Active sidebar link ────────────────────────────────────────── */
function initSidebarActive() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === page || (page === 'index.html' && href === './')) {
      link.classList.add('active');
    }
  });
}

/* ── Smooth TOC scrolling ───────────────────────────────────────── */
function initToc() {
  document.querySelectorAll('.sidebar-toc a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ── Search ─────────────────────────────────────────────────────── */
// LABS is defined inline by _layouts/default.html from each lab's front matter.

function initSearch() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  function highlight(text, query) {
    if (!query) return text;
    const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

  function doSearch(q) {
    if (!q.trim()) { results.classList.remove('visible'); return; }
    const ql = q.toLowerCase();
    const matches = LABS.filter(l =>
      l.title.toLowerCase().includes(ql) || l.body.toLowerCase().includes(ql)
    );
    if (!matches.length) {
      results.innerHTML = '<div id="search-empty">No results for "' + q + '"</div>';
    } else {
      results.innerHTML = matches.map(l => {
        const snippet = l.body.split(' ').filter(w => w.includes(ql.split(' ')[0])).slice(0,5).join(', ');
        return `<a class="search-result" href="${l.url}">
          <div class="sr-title">${highlight(l.title, q)}</div>
          <div class="sr-snippet">${highlight(snippet || l.body.slice(0,80), q)}</div>
        </a>`;
      }).join('');
    }
    results.classList.add('visible');
  }

  input.addEventListener('input', e => doSearch(e.target.value));
  input.addEventListener('focus', e => { if (e.target.value) doSearch(e.target.value); });
  document.addEventListener('click', e => {
    if (!e.target.closest('#search-wrap')) results.classList.remove('visible');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { results.classList.remove('visible'); input.value = ''; }
  });
}

/* ── Mobile menu ────────────────────────────────────────────────── */
function initMobileMenu() {
  const btn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('sidebar');
  if (!btn || !sidebar) return;
  btn.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!e.target.closest('#sidebar') && !e.target.closest('#menu-btn'))
      sidebar.classList.remove('open');
  });
}

/* ── Index page: render done badges ────────────────────────────── */
function initIndexCards() {
  try {
    const global = JSON.parse(localStorage.getItem('pws472_done') || '{}');
    document.querySelectorAll('.lab-card[data-lab]').forEach(card => {
      if (global[card.dataset.lab]) {
        card.classList.add('completed');
        if (!card.querySelector('.done-badge')) {
          const b = document.createElement('span');
          b.className = 'done-badge';
          b.textContent = '✓ Done';
          card.prepend(b);
        }
      }
    });
  } catch(e) {}
}

/* ── Bootstrap ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCodeBlocks();
  initExternalLinks();
  initCopyButtons();
  initChecklist();
  initSidebarActive();
  initToc();
  initSearch();
  initMobileMenu();
  updateSidebarProgress();
  initIndexCards();
});
