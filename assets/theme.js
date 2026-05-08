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
            const isAmber = item.product_type && item.product_type.toLowerCase().includes('bitter');
            const priceClass = isAmber ? 'cart-item__price--amber' : '';
            return `
              <div class="cart-item" data-key="${item.key}">
                <div class="cart-item__image">
                  ${item.image
                    ? `<img src="${item.image}" alt="${item.title}" loading="lazy">`
                    : '<div style="width:100%;height:100%;background:var(--color-card);"></div>'}
                </div>
                <div class="cart-item__info">
                  <div class="cart-item__name">${item.product_title}</div>
                  <div class="cart-item__meta">700 ml · Qtà: ${item.quantity}</div>
                  <span class="cart-item__price ${priceClass}">
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
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: 0 })
    })
      .then(() => {
        this.updateCount();
        this.render();
      });
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
          const match = spirit === 'all' || card.dataset.spirit === spirit;
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
  btn.querySelector('.toggle-label').textContent = isOpen ? 'Vedi ricetta' : 'Chiudi ricetta';
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

  open(variantId, productTitle, productPrice) {
    if (!this.modal) return;
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
      this.filterSidebar?.classList.toggle('open');
    });

    // Close on overlay click (mobile)
    document.getElementById('filter-overlay')?.addEventListener('click', () => {
      this.filterSidebar?.classList.remove('open');
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
const Lightbox = {
  box: null,
  img: null,
  images: [],
  current: 0,

  init() {
    this.box = document.getElementById('lightbox');
    this.img = document.getElementById('lightbox-img');
    if (!this.box) return;

    document.getElementById('lightbox-close')?.addEventListener('click', () => this.close());
    document.getElementById('lightbox-prev')?.addEventListener('click', () => this.prev());
    document.getElementById('lightbox-next')?.addEventListener('click', () => this.next());
    this.box.addEventListener('click', (e) => { if (e.target === this.box) this.close(); });
    document.addEventListener('keydown', (e) => {
      if (!this.box.classList.contains('open')) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    // Attach to product images
    document.querySelectorAll('[data-lightbox-src]').forEach((el, i) => {
      this.images.push(el.dataset.lightboxSrc);
      el.addEventListener('click', () => this.open(i));
    });
  },

  open(index) {
    if (!this.box || !this.images.length) return;
    this.current = index;
    this.show();
    this.box.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.box?.classList.remove('open');
    document.body.style.overflow = '';
  },

  prev() { this.current = (this.current - 1 + this.images.length) % this.images.length; this.show(); },
  next() { this.current = (this.current + 1) % this.images.length; this.show(); },

  show() {
    if (this.img) {
      this.img.src = this.images[this.current];
      this.img.alt = `Immagine ${this.current + 1}`;
    }
    const counter = document.getElementById('lightbox-counter');
    if (counter) counter.textContent = `${this.current + 1} / ${this.images.length}`;
    const nav = document.querySelectorAll('.lightbox__nav');
    nav.forEach(n => n.style.display = this.images.length > 1 ? 'block' : 'none');
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

/* ── FREE SHIPPING BAR ────────────────────────────────────── */
const FreeShippingBar = {
  THRESHOLD_CENTS: 6000, // €60

  init() {
    this.update();
  },

  update() {
    const bar    = document.querySelector('.free-shipping-bar__fill');
    const text   = document.querySelector('.free-shipping-bar__text');
    const achieved = document.querySelector('.free-shipping-bar__achieved');
    if (!bar) return;

    fetch('/cart.js').then(r => r.json()).then(cart => {
      const total    = cart.total_price;
      const pct      = Math.min(100, (total / this.THRESHOLD_CENTS) * 100);
      const remaining = Math.max(0, this.THRESHOLD_CENTS - total);

      bar.style.width = `${pct}%`;
      bar.classList.toggle('complete', pct >= 100);

      if (text) {
        if (pct >= 100) {
          text.innerHTML = '<strong>🎉 Spedizione gratuita applicata!</strong>';
          if (achieved) achieved.style.display = 'block';
        } else {
          const rem = '€ ' + (remaining / 100).toFixed(2).replace('.', ',');
          text.innerHTML = `Ancora <strong>${rem}</strong> per la spedizione gratuita`;
          if (achieved) achieved.style.display = 'none';
        }
      }
    }).catch(() => {});
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

  init() {
    const bar = document.getElementById('announcement-bar');
    if (!bar) return;
    if (localStorage.getItem(this.KEY)) {
      bar.classList.add('hidden');
      return;
    }
    document.body.classList.add('has-announcement');
    document.getElementById('ann-close')?.addEventListener('click', () => {
      bar.classList.add('hidden');
      document.body.classList.remove('has-announcement');
      localStorage.setItem(this.KEY, '1');
    });
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
    const list = this.get();
    if (!list.length) {
      document.getElementById('recently-viewed-section')?.remove();
      return;
    }
    // Show the section (hidden by default to avoid flash)
    const section = document.getElementById('recently-viewed-section');
    if (section) section.style.display = '';
    container.innerHTML = list.map(p => `
      <article class="product-card">
        <a href="${p.url}">
          <div class="product-card__image product-card__image--placeholder">
            ${p.image ? `<img src="${p.image}&width=400" alt="${p.title}" loading="lazy">` : ''}
          </div>
        </a>
        <div class="product-card__body">
          <h3 class="product-card__name"><a href="${p.url}">${p.title}</a></h3>
          <div class="product-card__footer">
            <span class="product-card__price product-card__price--gin">${p.price}</span>
            <a href="${p.url}" class="btn btn--outline" style="padding:.6rem 1rem;font-size:.72rem;">Vedi</a>
          </div>
        </div>
      </article>`).join('');
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
        if (type === 'copy') {
          navigator.clipboard?.writeText(window.location.href).then(() => {
            const fb = btn.closest('.social-share')?.querySelector('.social-share__copy-feedback');
            if (fb) { fb.classList.add('show'); setTimeout(() => fb.classList.remove('show'), 2000); }
          });
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
  BackToTop.init();
  FreeShippingBar.init();
  NewsletterPopup.init();
  CookieConsent.init();
  AnnouncementBar.init();
  RecentlyViewed.init();
  Reviews.init();
  SocialShare.init();
  PageLoader.init();
});
