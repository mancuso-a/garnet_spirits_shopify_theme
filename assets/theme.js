/* ═══════════════════════════════════════════════════════════
   GARNET SPIRITS — theme.js
   ═══════════════════════════════════════════════════════════ */

/* ── AGE GATE ─────────────────────────────────────────────── */
const AgeGate = {
  COOKIE_KEY: 'garnet_age_verified',

  init() {
    const verified = this.getCookie(this.COOKIE_KEY);
    if (!verified) {
      const gate = document.getElementById('age-gate');
      if (gate) gate.classList.remove('hidden');
    }
  },

  accept() {
    this.setCookie(this.COOKIE_KEY, '1', 365);
    const gate = document.getElementById('age-gate');
    if (gate) {
      gate.style.opacity = '0';
      gate.style.transition = 'opacity 0.5s';
      setTimeout(() => gate.classList.add('hidden'), 500);
    }
  },

  deny() {
    const gate = document.getElementById('age-gate');
    if (gate) {
      gate.innerHTML = `
        <div style="font-family:var(--font-display);font-size:1.1rem;color:var(--color-gray);text-align:center;padding:2rem;">
          Accesso negato.<br>
          <span style="font-family:var(--font-body);font-size:0.8rem;font-weight:300;">
            Questo sito è riservato ai maggiorenni.
          </span>
        </div>`;
    }
  },

  setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Strict`;
  },

  getCookie(name) {
    const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
  }
};

/* ── CART DRAWER ──────────────────────────────────────────── */
const CartDrawer = {
  drawer: null,
  overlay: null,
  countEl: null,

  init() {
    this.drawer  = document.getElementById('cart-drawer');
    this.overlay = document.getElementById('cart-overlay');
    this.countEl = document.getElementById('cart-count');

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  },

  open() {
    if (!this.drawer) return;
    this.drawer.classList.add('open');
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.render();
  },

  close() {
    if (!this.drawer) return;
    this.drawer.classList.remove('open');
    this.overlay.classList.remove('open');
    document.body.style.overflow = '';
  },

  toggle() {
    if (this.drawer && this.drawer.classList.contains('open')) {
      this.close();
    } else {
      this.open();
    }
  },

  updateCount() {
    if (!this.countEl) return;
    fetch('/cart.js')
      .then(r => r.json())
      .then(cart => {
        const count = cart.item_count;
        if (count > 0) {
          this.countEl.textContent = count;
          this.countEl.classList.add('visible');
        } else {
          this.countEl.classList.remove('visible');
        }
      })
      .catch(() => {});
  },

  render() {
    const itemsEl   = document.getElementById('cart-drawer-items');
    const footerEl  = document.getElementById('cart-drawer-footer');
    if (!itemsEl) return;

    fetch('/cart.js')
      .then(r => r.json())
      .then(cart => {
        if (cart.item_count === 0) {
          itemsEl.innerHTML = `
            <div class="cart-drawer__empty">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p>Il carrello è vuoto</p>
              <a href="/collections/all" class="btn btn--outline" style="padding:.6rem 1.5rem;font-size:.72rem;" onclick="CartDrawer.close()">
                Scopri i prodotti
              </a>
            </div>`;
          if (footerEl) footerEl.style.display = 'none';
        } else {
          itemsEl.innerHTML = cart.items.map(item => {
            const itemColor = (window.GARNET_COLORS && window.GARNET_COLORS[item.handle]) || '';
            const priceStyle = itemColor ? ('style="color:' + itemColor + '"') : '';
            return `
              <div class="cart-item" data-key="${item.key}">
                <div class="cart-item__image">
                  ${item.image
                    ? `<img src="${this.imageUrl(item.image, 240)}" srcset="${this.imageUrl(item.image, 160)} 160w, ${this.imageUrl(item.image, 240)} 240w, ${this.imageUrl(item.image, 320)} 320w" sizes="80px" width="80" height="110" alt="${item.title}" loading="lazy">`
                    : '<div style="width:100%;height:100%;background:var(--color-card);"></div>'}
                </div>
                <div class="cart-item__info">
                  <div class="cart-item__name">${item.product_title}</div>
                  <div class="cart-item__meta">${item.variant_title || '700 ml'}</div>
                  <div class="qty-selector qty-selector--sm" aria-label="Quantità">
                    <button type="button" class="qty-selector__btn" onclick="CartDrawer.changeQty('${item.key}', ${item.quantity - 1})" aria-label="Riduci quantità">−</button>
                    <span class="qty-selector__val">${item.quantity}</span>
                    <button type="button" class="qty-selector__btn" onclick="CartDrawer.changeQty('${item.key}', ${item.quantity + 1})" aria-label="Aumenta quantità">+</button>
                  </div>
                  <span class="cart-item__price" ${priceStyle}>
                    ${this.formatMoney(item.final_line_price)}
                  </span>
                  <button class="cart-item__remove" onclick="CartDrawer.removeItem('${item.key}')">
                    Rimuovi
                  </button>
                </div>
              </div>`;
          }).join('');

          if (footerEl) {
            footerEl.style.display = 'block';
            const subtotalEl = document.getElementById('cart-drawer-subtotal');
            if (subtotalEl) subtotalEl.textContent = this.formatMoney(cart.total_price);
            const bar = document.getElementById('free-shipping-bar');
            if (bar) {
              const threshold = parseInt(bar.dataset.threshold, 10) || 0;
              const pct = threshold ? Math.min(100, (cart.total_price / threshold) * 100) : 0;
              const fill = document.getElementById('free-shipping-fill');
              const msg = document.getElementById('free-shipping-msg');
              if (fill) { fill.style.width = pct + '%'; fill.classList.toggle('complete', pct >= 100); }
              if (msg) msg.innerHTML = pct >= 100 ? '<strong>Spedizione gratuita applicata.</strong>' : 'Ancora <strong>' + this.formatMoney(threshold - cart.total_price) + '</strong> per la spedizione gratuita';
            }
          }
        }
      })
      .catch(() => {
        itemsEl.innerHTML = '<p style="color:var(--color-gray);padding:1rem;font-size:.82rem;">Errore nel caricamento del carrello.</p>';
      });
  },

  addItem(variantId, quantity = 1, properties = {}) {
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity, properties })
    })
      .then(r => r.json())
      .then(item => {
        this.updateCount();
        this.open();
        Toast.show(`${item.product_title} aggiunto al carrello`);
        return item;
      })
      .catch(err => {
        Toast.show('Errore: prodotto non disponibile');
        console.error(err);
      });
  },

  removeItem(key) {
    this.changeQty(key, 0);
  },

  changeQty(key, quantity) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: Math.max(0, quantity) })
    })
      .then(() => {
        this.updateCount();
        this.render();
      });
  },

  imageUrl(src, width) {
    try {
      const url = new URL(src, window.location.origin);
      url.searchParams.set('width', width);
      return url.toString();
    } catch (e) {
      return src;
    }
  },

  formatMoney(cents) {
    return '€ ' + (cents / 100).toFixed(2).replace('.', ',');
  }
};

/* ── PRODUCT FORM ─────────────────────────────────────────── */
const ProductForm = {
  init() {
    document.querySelectorAll('[data-product-form]').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const variantId = form.querySelector('[name="id"]').value;
        const qtyInput  = form.querySelector('[data-qty-value]');
        const qty       = qtyInput ? parseInt(qtyInput.textContent) : 1;
        const btn       = form.querySelector('[data-add-cart]');
        if (btn) {
          btn.textContent = 'Aggiunto ✓';
          btn.disabled = true;
          setTimeout(() => {
            btn.textContent = 'Aggiungi al carrello';
            btn.disabled = false;
          }, 1800);
        }
        CartDrawer.addItem(variantId, qty);
      });
    });
  }
};

/* ── QTY SELECTOR ─────────────────────────────────────────── */
function changeQty(id, delta) {
  const el = document.querySelector(`[data-qty-id="${id}"]`);
  if (!el) return;
  const v = Math.max(1, Math.min(99, parseInt(el.textContent) + delta));
  el.textContent = v;
}

/* ── DRINK LIST FILTER ────────────────────────────────────── */
const DrinkFilter = {
  init() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const spirit = btn.dataset.filter;
        document.querySelectorAll('.cocktail-card').forEach(card => {
          const match = spirit === 'all' || card.dataset.spirit.split(' ').includes(spirit);
          card.dataset.hidden = match ? 'false' : 'true';
        });
      });
    });
  }
};

/* ── RECIPE TOGGLE ────────────────────────────────────────── */
function toggleRecipe(btn) {
  const body = btn.nextElementSibling;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open');
  btn.classList.toggle('open');
  const card = btn.closest('.cocktail-card');
  card?.classList.toggle('recipe-open', !isOpen);
  btn.querySelector('.toggle-label').textContent = isOpen ? 'Vedi ricetta' : 'Chiudi ricetta';
  // Aprendo la ricetta, porta la fine della scheda in fondo allo schermo
  if (!isOpen && card) {
    requestAnimationFrame(() => card.scrollIntoView({ behavior: 'smooth', block: 'end' }));
  }
}

// Tap o clic su tutta la scheda del drink: apre/chiude la ricetta
document.addEventListener('click', (e) => {
  const card = e.target.closest('.cocktail-card');
  if (!card || e.target.closest('a, button, input, select, textarea')) return;
  if (window.getSelection && String(window.getSelection()).length) return;
  const btn = card.querySelector('.recipe-toggle');
  if (btn) toggleRecipe(btn);
});

// Link che finiscono con #newsletter (es. "/#newsletter" nella barra annunci): scorre all'iscrizione nel footer della pagina corrente
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href$="#newsletter"]');
  const target = document.getElementById('newsletter');
  if (!link || !target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Solo con mouse: su telefono il focus automatico (senza scroll) apriva la tastiera sopra il modulo
  // e il browser non lo spostava più quando poi si toccava il campo. Lì lasciamo che sia il tocco a farlo.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    setTimeout(() => target.querySelector('input[type="email"]')?.focus({ preventScroll: true }), 700);
  }
});

// Freccia hero: scorre alla sezione successiva, tenendo conto del menu fisso
function scrollPastSection(el) {
  const section = el.closest('.shopify-section') || el.closest('section');
  const next = section && section.nextElementSibling;
  if (!next) return;
  const header = document.querySelector('.site-header');
  const offset = header ? header.getBoundingClientRect().bottom : 0;
  window.scrollTo({ top: next.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
}

/* ── TOAST ────────────────────────────────────────────────── */
const Toast = {
  el: null,
  timer: null,
  init() { this.el = document.getElementById('toast'); },
  show(msg, duration = 2800) {
    if (!this.el) return;
    this.el.textContent = msg;
    this.el.classList.add('show');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.el.classList.remove('show'), duration);
  }
};

/* ── MOBILE NAV ───────────────────────────────────────────── */
const MobileNav = {
  init() {
    const btn = document.querySelector('.hamburger');
    const nav = document.querySelector('.mobile-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      nav.classList.toggle('open');
    });
  }
};

/* ── HEADER SCROLL ────────────────────────────────────────── */
const HeaderScroll = {
  init() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    let last = 0;
    window.addEventListener('scroll', () => {
      const current = window.scrollY;
      if (current > 80) {
        header.style.background = 'rgba(10,10,10,0.98)';
      } else {
        header.style.background = 'rgba(10,10,10,0.92)';
      }
      last = current;
    }, { passive: true });
  }
};

/* ═══════════════════════════════════════════════════════════
   NUOVE FUNZIONI — DAWN FEATURE PARITY
   ═══════════════════════════════════════════════════════════ */

/* ── PREDICTIVE SEARCH ────────────────────────────────────── */
const PredictiveSearch = {
  overlay: null,
  input: null,
  results: null,
  timer: null,

  init() {
    this.overlay = document.getElementById('search-overlay');
    this.input   = document.getElementById('search-input');
    this.results = document.getElementById('predictive-results');
    if (!this.overlay || !this.input) return;

    this.input.addEventListener('input', () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.fetch(this.input.value.trim()), 280);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  },

  open() {
    if (!this.overlay) return;
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.input && this.input.focus(), 80);
  },

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (this.input) this.input.value = '';
    if (this.results) this.results.innerHTML = '';
  },

  fetch(query) {
    if (!query || query.length < 2) {
      if (this.results) this.results.innerHTML = '';
      return;
    }
    fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=6`)
      .then(r => r.json())
      .then(data => {
        const products = data.resources?.results?.products || [];
        this.render(query, products);
      })
      .catch(() => {});
  },

  render(query, products) {
    if (!this.results) return;
    if (!products.length) {
      this.results.innerHTML = `
        <div class="predictive-results__heading">Risultati</div>
        <p class="predictive-no-results">Nessun risultato per "<strong>${query}</strong>"</p>`;
      return;
    }
    this.results.innerHTML = `
      <div class="predictive-results__heading">Prodotti (${products.length})</div>
      ${products.map(p => `
        <a class="predictive-result" href="${p.url}">
          <div class="predictive-result__img">
            ${p.featured_image?.url ? `<img src="${p.featured_image.url}&width=120" alt="${p.title}" loading="lazy">` : ''}
          </div>
          <div>
            <div class="predictive-result__title">${p.title}</div>
            <div class="predictive-result__price">${p.price ? '€ ' + (p.price / 100).toFixed(2).replace('.', ',') : ''}</div>
          </div>
        </a>`).join('')}`;
  }
};

/* ── WISHLIST ──────────────────────────────────────────────── */
const Wishlist = {
  KEY: 'garnet_wishlist',

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },

  save(list) {
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },

  toggle(productId, productTitle) {
    const list = this.get();
    const idx  = list.indexOf(productId);
    if (idx > -1) {
      list.splice(idx, 1);
      Toast.show(`${productTitle} rimosso dalla wishlist`);
    } else {
      list.push(productId);
      Toast.show(`${productTitle} aggiunto alla wishlist ♥`);
    }
    this.save(list);
    this.updateButtons();
    return idx === -1; // true = added
  },

  has(productId) {
    return this.get().includes(productId);
  },

  updateButtons() {
    document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      const id = btn.dataset.wishlistId;
      btn.classList.toggle('active', this.has(id));
      btn.setAttribute('aria-label', this.has(id) ? 'Rimuovi dalla wishlist' : 'Aggiungi alla wishlist');
    });
  },

  init() {
    this.updateButtons();
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-wishlist-id]');
      if (!btn) return;
      e.preventDefault();
      this.toggle(btn.dataset.wishlistId, btn.dataset.wishlistTitle || 'Prodotto');
    });
  }
};

/* ── QUICK ADD ────────────────────────────────────────────── */
const QuickAdd = {
  modal: null,

  init() {
    this.modal = document.getElementById('quick-add-modal');
    if (!this.modal) return;

    document.getElementById('quick-add-backdrop')?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
  },

  open(variantId, productTitle, productPrice, color) {
    if (!this.modal) return;
    this.modal.style.setProperty('--product-color', color || '#C0392B');
    document.getElementById('qa-product-name').textContent = productTitle || '';
    document.getElementById('qa-product-price').textContent = productPrice || '';
    document.getElementById('qa-variant-id').value = variantId || '';
    this.modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('open');
    document.body.style.overflow = '';
  },

  submit() {
    const id  = document.getElementById('qa-variant-id')?.value;
    const qty = parseInt(document.getElementById('qa-qty')?.textContent || 1);
    if (!id) return;
    CartDrawer.addItem(id, qty);
    this.close();
  }
};

/* ── COLLECTION FILTERS ───────────────────────────────────── */
const CollectionFilters = {
  filterSidebar: null,

  init() {
    this.filterSidebar = document.getElementById('collection-filters');

    // Filter group toggles
    document.querySelectorAll('.filter-group__toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const body = btn.nextElementSibling;
        btn.classList.toggle('collapsed');
        body.classList.toggle('collapsed');
      });
    });

    // Checkbox filters → apply on change
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => this.apply());
    });

    // Mobile sidebar
    document.getElementById('mobile-filter-toggle')?.addEventListener('click', () => {
      this.filterSidebar?.classList.contains('open') ? this.close() : this.open();
    });

    // Close on overlay click / Escape (mobile)
    document.getElementById('filter-overlay')?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.filterSidebar?.classList.contains('open')) this.close();
    });

    // Sort select
    document.getElementById('sort-select')?.addEventListener('change', (e) => {
      this.applySort(e.target.value);
    });

    // Active filter chips (remove)
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-remove-filter]');
      if (chip) {
        const name  = chip.dataset.removeFilter;
        const value = chip.dataset.removeValue;
        const cb = document.querySelector(`input[data-filter-name="${name}"][value="${value}"]`);
        if (cb) { cb.checked = false; this.apply(); }
      }
    });
  },

  open() {
    if (!this.filterSidebar) return;
    this.filterSidebar.classList.add('open');
    const overlay = document.getElementById('filter-overlay');
    if (overlay) overlay.style.display = 'block';
  },

  close() {
    this.filterSidebar?.classList.remove('open');
    const overlay = document.getElementById('filter-overlay');
    if (overlay) overlay.style.display = 'none';
  },

  applyAndClose() {
    this.apply();
    this.close();
  },

  apply() {
    const params = new URLSearchParams(window.location.search);
    // Clear existing filter params
    for (const key of [...params.keys()]) {
      if (key.startsWith('filter.')) params.delete(key);
    }
    params.delete('page');

    const activeChips = [];
    document.querySelectorAll('.filter-option input[type="checkbox"]:checked').forEach(cb => {
      const key = cb.dataset.filterName;
      const val = cb.value;
      params.append(`filter.${key}`, val);
      activeChips.push({ name: key, value: val, label: cb.closest('.filter-option')?.querySelector('.filter-option__label')?.textContent?.trim() });
    });

    // Price range
    const minPrice = document.getElementById('filter-price-min')?.value;
    const maxPrice = document.getElementById('filter-price-max')?.value;
    if (minPrice) params.set('filter.v.price.gte', minPrice);
    if (maxPrice) params.set('filter.v.price.lte', maxPrice);

    this.renderActiveChips(activeChips);
    this.fetchResults(params);
  },

  applySort(val) {
    const params = new URLSearchParams(window.location.search);
    if (val) { params.set('sort_by', val); } else { params.delete('sort_by'); }
    this.fetchResults(params);
  },

  fetchResults(params) {
    const resultsEl = document.getElementById('collection-results');
    if (!resultsEl) return;

    const url = `${window.location.pathname}?${params.toString()}&section_id=main-collection`;
    resultsEl.classList.add('loading');

    // Update browser URL without reload
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);

    fetch(url)
      .then(r => r.text())
      .then(html => {
        const doc  = new DOMParser().parseFromString(html, 'text/html');
        const grid = doc.getElementById('product-grid-inner');
        const count = doc.getElementById('collection-count');
        if (grid) {
          document.getElementById('product-grid-inner').innerHTML = grid.innerHTML;
        }
        if (count) {
          document.getElementById('collection-count').textContent = count.textContent;
        }
        resultsEl.classList.remove('loading');
        Wishlist.updateButtons();
      })
      .catch(() => resultsEl.classList.remove('loading'));
  },

  renderActiveChips(chips) {
    const container = document.getElementById('active-filters');
    if (!container) return;
    container.innerHTML = chips.map(c => `
      <button class="active-filter-chip" data-remove-filter="${c.name}" data-remove-value="${c.value}">
        ${c.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>`).join('');
    document.getElementById('clear-filters')?.classList.toggle('visible', chips.length > 0);
  },

  clearAll() {
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => cb.checked = false);
    const min = document.getElementById('filter-price-min');
    const max = document.getElementById('filter-price-max');
    if (min) min.value = '';
    if (max) max.value = '';
    this.apply();
  }
};

/* ── STICKY ADD-TO-CART ───────────────────────────────────── */
const StickyATC = {
  bar: null,
  trigger: null,

  init() {
    this.bar     = document.getElementById('sticky-atc');
    this.trigger = document.querySelector('[data-product-form]');
    if (!this.bar || !this.trigger) return;

    const obs = new IntersectionObserver(([entry]) => {
      this.bar.classList.toggle('visible', !entry.isIntersecting);
    }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' });

    obs.observe(this.trigger);
  }
};

/* ── IMAGE LIGHTBOX ───────────────────────────────────────── */
// Visualizzatore a schermo intero: swipe su mobile (scroll-snap), frecce/tastiera su desktop
const Lightbox = {
  box: null,
  track: null,
  images: [],
  current: 0,

  init() {
    this.box = document.getElementById('lightbox');
    this.track = document.getElementById('lightbox-track');
    if (!this.box || !this.track) return;

    document.getElementById('lightbox-close')?.addEventListener('click', () => this.close());
    document.getElementById('lightbox-prev')?.addEventListener('click', () => this.go(this.current - 1));
    document.getElementById('lightbox-next')?.addEventListener('click', () => this.go(this.current + 1));
    // Tap fuori dall'immagine chiude
    this.box.addEventListener('click', (e) => {
      if (e.target === this.box || e.target.classList.contains('lightbox__slide')) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (!this.box.classList.contains('open')) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.go(this.current - 1);
      if (e.key === 'ArrowRight') this.go(this.current + 1);
    });
    let raf;
    this.track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = this.track.clientWidth || 1;
        this.current = Math.round(this.track.scrollLeft / w);
        this.updateUi();
      });
    }, { passive: true });

    // Galleria pagina prodotto: tap su un'immagine dell'anteprima apre il visualizzatore
    const track = document.querySelector('[data-lightbox-gallery]');
    if (!track) return;
    const gallery = track.dataset.lightboxGallery.split('|').filter(Boolean);
    track.querySelectorAll('[data-lightbox-index]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.open(gallery, parseInt(a.dataset.lightboxIndex, 10) || 0);
      });
    });
    // Miniature: scorrono l'anteprima all'immagine scelta
    document.querySelectorAll('[data-gallery-thumb]').forEach(btn => {
      btn.addEventListener('click', () => {
        track.scrollTo({ left: parseInt(btn.dataset.galleryThumb, 10) * track.clientWidth, behavior: 'smooth' });
      });
    });
  },

  open(images, index = 0) {
    if (!images.length) return;
    this.images = images;
    this.track.innerHTML = images.map((src, i) =>
      `<div class="lightbox__slide"><img class="lightbox__img" src="${src}" alt="Immagine ${i + 1}" ${Math.abs(i - index) > 1 ? 'loading="lazy"' : ''}></div>`
    ).join('');
    this.box.classList.toggle('lightbox--single', images.length < 2);
    this.box.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.current = index;
    this.track.scrollLeft = index * this.track.clientWidth;
    this.updateUi();
    document.getElementById('lightbox-close')?.focus({ preventScroll: true });
  },

  close() {
    this.box?.classList.remove('open');
    document.body.style.overflow = '';
  },

  go(index) {
    if (!this.images.length) return;
    const i = (index + this.images.length) % this.images.length;
    this.track.scrollTo({ left: i * this.track.clientWidth, behavior: 'smooth' });
  },

  updateUi() {
    const counter = document.getElementById('lightbox-counter');
    if (counter) counter.textContent = this.images.length > 1 ? `${this.current + 1} / ${this.images.length}` : '';
  }
};

/* ── CARD IMAGE SLIDER ────────────────────────────────────── */
// Scorrimento immagini nella card e nell'anteprima prodotto: swipe nativo + frecce (desktop) + puntini.
// Delegato sul document così funziona anche per card caricate via AJAX.
const CardSlider = {
  init() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-card-prev], [data-card-next]');
      if (!btn) return;
      e.preventDefault();
      const slides = btn.closest('.product-card__img-wrap, .product-detail__gallery')?.querySelector('[data-card-slides]');
      if (!slides) return;
      const w = slides.clientWidth;
      const count = slides.children.length;
      let i = Math.round(slides.scrollLeft / w) + (btn.hasAttribute('data-card-next') ? 1 : -1);
      i = (i + count) % count;
      slides.scrollTo({ left: i * w, behavior: 'smooth' });
    });
    document.addEventListener('scroll', (e) => {
      const slides = e.target;
      if (!(slides instanceof Element) || !slides.matches('[data-card-slides]')) return;
      const i = Math.round(slides.scrollLeft / (slides.clientWidth || 1));
      slides.closest('.product-card__img-wrap, .product-detail__gallery')?.querySelectorAll('.product-card__dot')
        .forEach((d, n) => d.classList.toggle('is-active', n === i));
      if (slides.matches('[data-lightbox-gallery]')) {
        document.querySelectorAll('[data-gallery-thumb]')
          .forEach(t => t.classList.toggle('is-active', +t.dataset.galleryThumb === i));
      }
    }, { capture: true, passive: true });
  }
};

/* ── BACK TO TOP ──────────────────────────────────────────── */
const BackToTop = {
  btn: null,
  init() {
    this.btn = document.getElementById('back-to-top');
    if (!this.btn) return;
    window.addEventListener('scroll', () => {
      this.btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    this.btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
};

/* ── NEWSLETTER POPUP ─────────────────────────────────────── */
const NewsletterPopup = {
  KEY: 'garnet_newsletter_shown',
  DELAY: 5000,

  init() {
    const popup = document.getElementById('newsletter-popup');
    if (!popup) return;
    if (localStorage.getItem(this.KEY)) return;

    setTimeout(() => popup.classList.add('open'), this.DELAY);

    document.getElementById('newsletter-close')?.addEventListener('click', () => this.close());
    document.getElementById('newsletter-no-thanks')?.addEventListener('click', () => this.close());
    document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = e.target.querySelector('input[type="email"]')?.value;
      if (email) {
        Toast.show('Grazie per l\'iscrizione! 🎉');
        this.close(true);
      }
    });
  },

  close(subscribed = false) {
    const popup = document.getElementById('newsletter-popup');
    popup?.classList.remove('open');
    localStorage.setItem(this.KEY, subscribed ? 'subscribed' : 'dismissed');
  }
};

/* ── COOKIE CONSENT ───────────────────────────────────────── */
const CookieConsent = {
  KEY: 'garnet_cookie_consent',

  init() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    if (localStorage.getItem(this.KEY)) {
      banner.classList.add('hidden');
      return;
    }

    document.getElementById('cookie-accept')?.addEventListener('click', () => this.accept());
    document.getElementById('cookie-decline')?.addEventListener('click', () => this.decline());
  },

  accept() {
    localStorage.setItem(this.KEY, 'accepted');
    document.getElementById('cookie-banner')?.classList.add('hidden');
  },

  decline() {
    localStorage.setItem(this.KEY, 'declined');
    document.getElementById('cookie-banner')?.classList.add('hidden');
  }
};

/* ── ANNOUNCEMENT BAR ─────────────────────────────────────── */
const AnnouncementBar = {
  KEY: 'garnet_ann_dismissed',
  timer: null,

  init() {
    const bar = document.getElementById('announcement-bar');
    if (!bar || bar.classList.contains('hidden')) return;
    document.getElementById('ann-close')?.addEventListener('click', () => {
      bar.classList.add('hidden');
      document.documentElement.classList.remove('has-announcement');
      clearInterval(this.timer);
      try { localStorage.setItem(bar.dataset.key || this.KEY, '1'); } catch (e) {}
    });

    // Alterna claim e messaggi di offerta
    const msgs = bar.querySelectorAll('.announcement-bar__msg');
    if (msgs.length < 2) return;
    const seconds = parseInt(bar.dataset.interval, 10) || 5;
    let i = 0;
    this.timer = setInterval(() => {
      msgs[i].classList.remove('is-active');
      i = (i + 1) % msgs.length;
      msgs[i].classList.add('is-active');
    }, seconds * 1000);
  }
};

/* ── RECENTLY VIEWED ──────────────────────────────────────── */
const RecentlyViewed = {
  KEY: 'garnet_recently_viewed',
  MAX: 6,

  track(productId, productTitle, productUrl, productImage, productPrice) {
    if (!productId) return;
    let list = this.get();
    list = list.filter(p => p.id !== productId);
    list.unshift({ id: productId, title: productTitle, url: productUrl, image: productImage, price: productPrice });
    list = list.slice(0, this.MAX);
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },

  render() {
    const container = document.getElementById('recently-viewed-grid');
    if (!container) return;
    const section = document.getElementById('recently-viewed-section');
    const trackEl = document.getElementById('product-tracking-data');
    const currentId = trackEl ? String(trackEl.dataset.productId) : null;
    // Più recente prima; il prodotto che stai guardando non viene ripetuto
    const ids = this.get().map(p => String(p.id)).filter(id => id !== currentId);
    let shown = 0;
    container.querySelectorAll('[data-rv-card]').forEach(card => {
      const idx = ids.indexOf(card.getAttribute('data-rv-card'));
      card.hidden = idx === -1;
      card.style.order = idx === -1 ? '' : String(idx);
      if (idx !== -1) shown++;
    });
    if (!shown) {
      section?.remove();
      return;
    }
    if (section) section.style.display = '';
  },

  init() {
    // Track current product if on product page
    const el = document.getElementById('product-tracking-data');
    if (el) {
      this.track(
        el.dataset.productId,
        el.dataset.productTitle,
        el.dataset.productUrl,
        el.dataset.productImage,
        el.dataset.productPrice
      );
    }
    this.render();
  }
};

/* ── AGE CONFIRM (dichiarazione maggiore età prima del checkout) ── */
const AgeConfirm = {
  init() {
    document.querySelectorAll('[data-age-checkout]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const box = btn.parentElement.querySelector('[data-age-confirm]');
        const input = box && box.querySelector('[data-age-confirm-input]');
        const error = box && box.querySelector('[data-age-confirm-error]');
        if (input && !input.checked) {
          if (error) error.hidden = false;
          box.classList.add('age-confirm--error');
          input.focus();
          return;
        }
        if (error) error.hidden = true;
        btn.classList.add('is-loading');
        try {
          await fetch('/cart/update.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attributes: { 'Maggiore età': 'Dichiarata il ' + new Date().toLocaleString('it-IT') } })
          });
        } catch (err) { /* in ogni caso si prosegue al checkout */ }
        window.location.href = btn.getAttribute('href') || '/checkout';
      });
    });
    document.querySelectorAll('[data-age-confirm-input]').forEach(input => {
      input.addEventListener('change', () => {
        const box = input.closest('[data-age-confirm]');
        if (input.checked) {
          box.classList.remove('age-confirm--error');
          const error = box.querySelector('[data-age-confirm-error]');
          if (error) error.hidden = true;
        }
      });
    });
  }
};

/* ── REVIEWS ──────────────────────────────────────────────── */
const Reviews = {
  init() {
    // Star rating selector for write-review form
    const stars = document.querySelectorAll('.review-form__star');
    stars.forEach((star, i) => {
      star.addEventListener('click', () => {
        stars.forEach((s, j) => s.classList.toggle('active', j <= i));
        document.getElementById('review-rating-input').value = i + 1;
      });
      star.addEventListener('mouseenter', () => {
        stars.forEach((s, j) => s.classList.toggle('active', j <= i));
      });
    });
    document.querySelector('.review-form__stars')?.addEventListener('mouseleave', () => {
      const val = parseInt(document.getElementById('review-rating-input')?.value || 0);
      stars.forEach((s, j) => s.classList.toggle('active', j < val));
    });

    // Submit review form (demo — in production uses Shopify Product Reviews or Judge.me)
    document.getElementById('review-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      Toast.show('Recensione inviata! Sarà pubblicata dopo moderazione.');
      e.target.reset();
      stars.forEach(s => s.classList.remove('active'));
    });
  }
};

/* ── SOCIAL SHARE ─────────────────────────────────────────── */
const SocialShare = {
  init() {
    document.querySelectorAll('[data-share]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type  = btn.dataset.share;
        const url   = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        let shareUrl = '';

        if (type === 'whatsapp') shareUrl = `https://wa.me/?text=${title}%20${url}`;
        if (type === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        if (type === 'twitter')  shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        const copyLink = () => {
          navigator.clipboard?.writeText(window.location.href).then(() => {
            const fb = btn.closest('.social-share')?.querySelector('.social-share__copy-feedback');
            if (fb) { fb.classList.add('show'); setTimeout(() => fb.classList.remove('show'), 2000); }
          });
        };
        if (type === 'copy') { copyLink(); return; }
        if (type === 'instagram') {
          // Instagram non ha un link di condivisione web: su telefono si apre il menu di
          // condivisione (con Instagram tra le app), su desktop si copia il link.
          if (navigator.share) {
            navigator.share({ title: document.title, url: window.location.href }).catch(() => {});
          } else {
            copyLink();
          }
          return;
        }
        if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
      });
    });
  }
};

/* ── PAGE LOADER ──────────────────────────────────────────── */
const PageLoader = {
  bar: null,
  init() {
    this.bar = document.getElementById('page-loader');
    if (!this.bar) return;
    document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto"]):not([href^="tel"]):not([target])').forEach(a => {
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        this.start();
      });
    });
  },
  start() {
    if (!this.bar) return;
    this.bar.classList.remove('done');
    this.bar.classList.add('loading');
  }
};

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  AgeGate.init();
  CartDrawer.init();
  CartDrawer.updateCount();
  ProductForm.init();
  DrinkFilter.init();
  Toast.init();
  MobileNav.init();
  HeaderScroll.init();
  // New features
  PredictiveSearch.init();
  Wishlist.init();
  QuickAdd.init();
  CollectionFilters.init();
  StickyATC.init();
  Lightbox.init();
  CardSlider.init();
  BackToTop.init();
  NewsletterPopup.init();
  CookieConsent.init();
  AnnouncementBar.init();
  RecentlyViewed.init();
  AgeConfirm.init();
  Reviews.init();
  SocialShare.init();
  PageLoader.init();
});
