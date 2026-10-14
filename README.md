# Garnet Spirits — Shopify Theme

Tema Online Store 2.0 del brand Garnet Spirits (Cm2 Spirits Srls). Fonte di verità per tono, colori e dati prodotto: `GarnetSpiritsWiki/wiki/`.

## Brand nel tema

- Palette: nero `#0a0a0a`, rosso granato `#8B1A1A` (Gin Almandino), ambra `#C47A1E` (Bitter Spessartina)
- Font (open, licenza OFL): Jost, titoli in maiuscolo e testo — incluso in `assets/`
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

## Badge prodotto (tag)

Si impostano dal prodotto su Shopify, campo **Tag**. Su ogni prodotto si vede un solo badge, in quest'ordine di priorità:

| Badge | Come si attiva | Cosa succede |
|---|---|---|
| **In arrivo** | tag `in-arrivo` (va bene anche `in arrivo`) | Badge sulla foto; al posto di "+ Carrello" c'è **Avvisami**, che porta all'iscrizione newsletter. Il prodotto deve essere pubblicato; le scorte possono restare a zero |
| **Esaurito** | automatico, scorte a zero | Badge sulla foto e tasto **Avvisami** verso la newsletter |
| **Offerta** | automatico, se il **Prezzo di confronto** della variante è più alto del prezzo | Prezzo vecchio barrato accanto a quello nuovo, badge nel colore del prodotto |
| **Novità** | tag `novita` (va bene anche `novità`) | Badge bianco; il prodotto resta acquistabile. Ricordarsi di togliere il tag dopo qualche settimana |

## Colore prodotto

Metafield `custom.colore` (tipo Colore). Lo usano il tasto "+ Carrello" e il suo popup, prezzi, etichette e badge. Se vuoto, il tasto "+ Carrello" e il popup usano il rosso.

## Barra annunci

Personalizza → Announcement Bar. Fissa in alto, anche su mobile. Il **Testo annuncio** ("One sip, one secret.") si alterna con i blocchi **Messaggio offerta** (Aggiungi blocco), ognuno con testo e link facoltativo. "Secondi per messaggio" regola la velocità.

- Link per portare all'iscrizione newsletter in fondo alla pagina: `/#newsletter`
- Se un visitatore chiude la barra, riappare quando i messaggi cambiano

## Newsletter

- Popup all'ingresso (Personalizza → Newsletter Popup), mostrato una sola volta
- Modulo fisso nel footer di ogni pagina (Personalizza → Footer, campi "Newsletter"), con gli stessi testi del popup
- I contatti arrivano in Clienti con tag `newsletter,popup` o `newsletter,footer`
- Qualsiasi link a `/#newsletter` porta al modulo del footer

## Drink List

Contiene i 6 cocktail ufficiali della Drink List 2026. Per aggiungere foto: Pages → Drink List → Customize → blocco cocktail → Foto.

Su telefono lo scorrimento si ferma a ogni drink e ogni scheda chiusa è alta uno schermo. Tap su tutta la scheda apre/chiude la ricetta; aprendola la pagina scorre fino alla fine della scheda. Per togliere lo scorrimento a scatti: blocco "DRINK LIST MOBILE" in fondo a `assets/theme.css`.

## Altre note

- Age gate 18+ attivo di default (cookie 365 giorni)
- Recensioni: non incluse; installare un'app (es. Judge.me) e inserire il suo blocco in `sections/main-product.liquid`
- Footer: ragione sociale e sede preimpostate; **Partita IVA** da inserire in Customize → Footer
- Favicon: Customize → Theme settings → Brand
