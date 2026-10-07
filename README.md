# Garnet Spirits — Shopify Theme

Tema Online Store 2.0 del brand Garnet Spirits (Cm2 Spirits Srls). Fonte di verità per tono, colori e dati prodotto: `GarnetSpiritsWiki/wiki/`.

## Brand nel tema

- Palette: nero `#0a0a0a`, rosso granato `#8B1A1A` (Gin Almandino), ambra `#C47A1E` (Bitter Spessartina)
- Font (tutti open, licenza OFL): Josefin Sans (titoli) · Jost (testo) — inclusi in `assets/`
- Claim: *One sip, one secret.* (announcement bar e footer) · *Incanta i sensi* (hero)
- Il tema distingue Gin/Bitter dal **Tipo prodotto** (`Compound Gin` / `Bitter`) o dal titolo che contiene "Bitter"

## Installazione

Il repo è collegato a Shopify via GitHub (Online Store → Themes → Add theme → Connect from GitHub). Ogni push su `master` aggiorna il tema.

## Menu (Online Store → Navigation)

`main-menu` e `footer`: Home `/` · Chi siamo `/pages/chi-siamo` · Prodotti `/collections/all` · Drink List `/pages/drink-list`

## Pagine (Online Store → Pages)

| Titolo | Handle | Template |
|---|---|---|
| Chi siamo | `chi-siamo` | `page.about` |
| Drink List | `drink-list` | `page.drink-list` |
| Wishlist | `wishlist` | `page.wishlist` |
| Privacy Policy | `privacy-policy` | `page` (default) |
| Termini e Condizioni | `termini-e-condizioni` | `page` (default) |

## Prodotti

Metafield (namespace `custom`) da creare in Settings → Custom data → Products:
`tipologia`, `gradazione`, `formato`, `residuo_zuccherino` (testo riga singola) · `botaniche` (testo, separato da virgole), `olfatto`, `gusto`, `finale` (testo multi-riga).

| | Garnet Gin Almandino | Garnet Bitter Spessartina |
|---|---|---|
| Tipo prodotto | `Compound Gin` | `Bitter` |
| tipologia | Compound Gin | Pomegranate Bitter |
| gradazione | 40% Vol. | 25% Vol. |
| formato | 700 ml | 700 ml |
| residuo_zuccherino | 15 g/l | — |
| botaniche | Melagrana, ginepro, arancia, limone, bergamotto, camomilla, rosa, ibisco, cardamomo, melissa | Melagrana, arancia amara, china, genziana, rabarbaro, cannella |
| olfatto | Fresco, balsamico; melagrana prominente con sentori agrumati e floreali | Intenso e profumato; melagrana matura, agrumi, spezie dolci, radici amare |
| gusto | Morbido, leggermente dolce; melagrana e agrumi vivaci, delicate note floreali | Deciso ma equilibrato; amaro classico armonizzato dalla freschezza della melagrana |
| finale | Elegante, fruttato, floreale, con ritorno di melagrana | Persistente, secco, con chiusura agrumata e fruttata |

Prezzi: da definire nel pannello Shopify.

## Drink List

Contiene i 6 cocktail ufficiali della Drink List 2026. Per aggiungere foto: Pages → Drink List → Customize → blocco cocktail → Foto.

## Altre note

- Age gate 18+ attivo di default (cookie 365 giorni)
- Recensioni: non incluse; installare un'app (es. Judge.me) e inserire il suo blocco in `sections/main-product.liquid`
- Footer: ragione sociale e sede preimpostate; **Partita IVA** da inserire in Customize → Footer
- Favicon: Customize → Theme settings → Brand
