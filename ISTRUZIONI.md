# Garnet Spirits — Shopify Theme
## Istruzioni per l'installazione

---

### 1. Font (OBBLIGATORIO prima di pubblicare)

Il tema usa **Aliens & Cows** e **Korolev**. I file non sono inclusi per motivi di licenza.
Carica i seguenti file nella cartella `assets/` del tema:

| File | Peso |
|------|------|
| `aliens-cows.woff2` | display/headings |
| `aliens-cows.woff` | display/headings (fallback) |
| `korolev-light.woff2` | body font-weight 300 |
| `korolev-light.woff` | body font-weight 300 (fallback) |
| `korolev-regular.woff2` | body font-weight 400 |
| `korolev-regular.woff` | body font-weight 400 (fallback) |
| `korolev-medium.woff2` | body font-weight 500 |
| `korolev-medium.woff` | body font-weight 500 (fallback) |
| `korolev-bold.woff2` | body font-weight 700 |
| `korolev-bold.woff` | body font-weight 700 (fallback) |

---

### 2. Installazione tema

1. Vai su **Shopify Admin → Online Store → Themes**
2. Clicca **"Add theme" → "Upload zip file"**
3. Carica `garnet-theme.zip`
4. Clicca **"Customize"** per aprire l'editor visuale

---

### 3. Menu di navigazione

Crea due menu in **Shopify Admin → Online Store → Navigation**:

**Main Menu** (`main-menu`):
- Home → `/`
- Chi siamo → `/pages/chi-siamo`
- Prodotti → `/collections/all`
- Drink List → `/pages/drink-list`

**Footer** (`footer`):
- Home → `/`
- Chi siamo → `/pages/chi-siamo`
- Prodotti → `/collections/all`
- Drink List → `/pages/drink-list`

---

### 4. Pagine da creare

In **Shopify Admin → Online Store → Pages**:

| Titolo | Handle (URL) | Template |
|--------|-------------|---------|
| Chi siamo | `chi-siamo` | `about` |
| Drink List | `drink-list` | `drink-list` |
| Privacy Policy | `privacy-policy` | (default) |
| Termini e Condizioni | `termini-e-condizioni` | (default) |

---

### 5. Prodotti — Metafields personalizzati

Per ogni prodotto, aggiungi questi metafields in **Admin → Products → [prodotto] → Metafields**:

| Namespace | Key | Tipo | Esempio |
|-----------|-----|------|---------|
| `custom` | `tipologia` | single_line_text | Compound Gin |
| `custom` | `gradazione` | single_line_text | 40% Vol. |
| `custom` | `volume` | single_line_text | 700 ml |
| `custom` | `residuo_zuccherino` | single_line_text | 15 g/l |
| `custom` | `botaniche` | multi_line_text | Melagrana, Ginepro, Arancia, ... |
| `custom` | `olfatto` | multi_line_text | Note fresche e balsamiche... |
| `custom` | `gusto` | multi_line_text | Fresco, morbido e leggermente dolce... |
| `custom` | `finale` | multi_line_text | Elegante, fruttato e floreale... |

---

### 6. Prodotti — Configurazione

**Garnet Gin Almandino**
- Tipo prodotto: `Compound Gin`
- Prezzo: 32.00 €
- Tag: `gin`, `almandino`

**Garnet Bitter Spessartina**
- Tipo prodotto: `Bitter`  ← importante! Il tema usa il tipo per scegliere colori
- Prezzo: 28.00 €
- Tag: `bitter`, `spessartina`

---

### 7. Drink List — Aggiungere cocktail

1. Vai su **Online Store → Pages → Drink List**
2. Clicca **"Customize"**
3. Nella sezione "Drink List" clicca **"Add block → Cocktail"**
4. Compila: nome, descrizione, spirito base, foto, ingredienti, preparazione

---

### 8. Age Gate

L'age gate è abilitato di default. Usa un cookie di 365 giorni per ricordare la scelta.
Per personalizzarlo: **Customize → Age Gate** (appare come sezione globale).

---

### Struttura file del tema

```
shopify-theme/
├── assets/
│   ├── theme.css          ← tutti gli stili
│   ├── theme.js           ← tutto il JavaScript
│   └── [font files]       ← da caricare manualmente
├── config/
│   ├── settings_schema.json
│   └── settings_data.json
├── layout/
│   └── theme.liquid       ← layout principale
├── locales/
│   └── it.default.json
├── sections/
│   ├── age-gate.liquid
│   ├── header.liquid
│   ├── footer.liquid
│   ├── cart-drawer.liquid
│   ├── hero.liquid
│   ├── brand-story.liquid
│   ├── featured-products.liquid
│   ├── main-product.liquid
│   ├── main-collection.liquid
│   ├── about-content.liquid
│   └── drink-list.liquid
├── snippets/
│   └── product-card.liquid
└── templates/
    ├── index.json
    ├── product.json
    ├── collection.json
    ├── page.about.json
    ├── page.drink-list.json
    └── cart.liquid
```
