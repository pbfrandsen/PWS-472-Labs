/* ─── PWS-472 Site JS ─────────────────────────────────────────── */

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

  let done = 0, total = 9;
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
const LABS = [
  { id: 'lab-0', title: 'Lab 0: Introduction to the Supercomputer', url: 'lab-0.html',
    body: 'logging ssh supercomputer job script slurm sbatch squeue nano netid byu hpc cluster' },
  { id: 'lab-1', title: 'Lab 1: Estimating FST from Empirical Data', url: 'lab-1.html',
    body: 'fst genepop biopython population genetics loci fis fit python conda easycontroller' },
  { id: 'lab-2', title: 'Lab 2: Neutral Variation', url: 'lab-2.html',
    body: "tajima d dendropy neutral variation segregating sites pairwise differences pi nucleotide diversity stickleback primate mitochondrial" },
  { id: 'lab-3', title: 'Lab 3: DNA Barcoding', url: 'lab-3.html',
    body: 'bold barcode of life dna barcoding species identification unknown sequences biome invasive' },
  { id: 'lab-4', title: 'Lab 4: Final Project Proposal', url: 'lab-4.html',
    body: 'final project proposal organism question genetic data molecular markers accession conservation' },
  { id: 'lab-5', title: 'Lab 5: Genome Assembly and QC', url: 'lab-5.html',
    body: 'genome assembly hifiasm pacbio hifi busco plodia pantry moth contiguity n50 fasta fastq gfa' },
  { id: 'lab-6', title: 'Lab 6: PCA and Admixture', url: 'lab-6.html',
    body: 'pca principal component analysis admixture angsd pcangsd ngsadmix bam bowtie2 siskin population structure' },
  { id: 'lab-7', title: 'Lab 7: Demographic Histories with PSMC', url: 'lab-7.html',
    body: 'psmc demographic history pairwise sequential markovian coalescent bcftools samtools mpileup population size' },
  { id: 'lab-8', title: 'Lab 8: Phylogenetics with MEGA', url: 'lab-8.html',
    body: 'mega phylogenetics maximum likelihood parsimony bold fasta alignment muscle tree phylogeny outgroup coi' },
];

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
  initCopyButtons();
  initChecklist();
  initSidebarActive();
  initToc();
  initSearch();
  initMobileMenu();
  updateSidebarProgress();
  initIndexCards();
});
