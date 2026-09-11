# GOTAM’S — Site vitrine

Site statique (HTML / CSS / JavaScript) pour **GOTAMS SARL**, Yaoundé - Soa, Centre, Cameroun.  
Ouvrir `index.html` dans un navigateur. Aucun serveur n’est requis.

## Pages

- `index.html` — Accueil
- `pages/nos-produits/nos-produits.html` — Lait, yaourt, okara
- `pages/notre-histoire/notre-histoire.html` — Histoire, valeurs, équipe
- `pages/notre-processus/notre-processus.html` — Huit étapes de fabrication
- `pages/satisfaction/satisfaction.html` — Orientation vers les deux enquêtes + export CSV
- `pages/satisfaction/enquete-menages.html` — Questionnaire ménages (fiche terrain V3)
- `pages/satisfaction/enquete-commercants.html` — Questionnaire commerçants + lettre d’intention non engageante
- `pages/commander/commander.html` — Panier et envoi WhatsApp

## Contact utilisé

Issu des fiches terrain GOTAMS (sauf information plus récente fournie ailleurs) :

- GOTAMS SARL
- Yaoundé - Soa, Centre, Cameroun
- contact@gotams.org
- 699 232 344 (`https://wa.me/237699232344`)

Les placeholders de l’ancien site (`+237 6XX XX XX XX`, `contact@gotams.cm`) n’ont **pas** été repris.

## Enquêtes (démonstration)

Les réponses sont enregistrées dans `localStorage` (`gotams.surveys.v1`) avec :

- `id` unique
- `type` : `household` ou `merchant`
- `createdAt`
- `answers`

La fonction `persistSurvey` dans `pages/satisfaction/satisfaction.js` est isolée pour un remplacement ultérieur par :

- `POST /api/surveys/households`
- `POST /api/surveys/merchants`

Export CSV : bouton « Exporter les données » sur `satisfaction.html`.

## Produits et prix (sources HTML existantes)

| Produit        | Variantes                                 | Fourchette      |
| -------------- | ----------------------------------------- | --------------- |
| Lait de soja   | Nature, Vanille, Cacao, Gingembre         | 500 – 1000 FCFA |
| Yaourt de soja | Fraise, Ananas, Mangue, Bissap, Gingembre | 300 – 600 FCFA  |
| Okara          | Alimentation animale                      | 100 – 250 FCFA  |

Aucun total de commande n’est calculé : ces fourchettes ne permettent pas un prix unitaire certain.

## Informations à vérifier avant mise en production

Présentes dans les HTML d’origine, **non renforcées** ici :

- Statistiques type « 92 % d’intolérance au lactose », « −50 % plus économique », livraison « J+1 » / « le jour même si commande avant 12 h »
- Certifications : HACCP, MINSANTE (indiqué « en cours »), Centre Pasteur
- Soja « non-OGM »
- Extraction « à froid » et « riche en probiotiques »
- Durée de conservation 7–10 jours
- Dates de la chronologie (2024–2026) et mention du programme TEF
- Témoignages nominatifs (Amina K., Paul M., Christelle N.) — **non repris** : sources non vérifiables
- Photos d’équipe générées / distantes — **non reprises**
- Noms d’associées encore en placeholder — **non inventés**
- Newsletter / groupe WhatsApp sans URL réelle — **non repris**
- Zones de livraison Yaoundé (Centre Ville, Bastos, etc.) : options de l’ancien formulaire, à confirmer
- Formats 0,5 L / 1 L sur la commande : cohérents avec les fiches d’enquête, à confirmer comme formats commerciaux

## Identité visuelle

Palette inspirée du logo officiel :

- Vert profond `#004D2A` / `#064E2B`
- Vert `#16823C`
- Vert feuille `#75A928`
- Crème `#FFF9ED`
- Beige soja `#E8C991`
- Orange d’accent discret

Typographie : Playfair Display (titres) et DM Sans (texte), chargées depuis Google Fonts. Le design reste lisible si la police distante échoue (Georgia / system-ui).

## Architecture

```
gotams/
├── index.html
├── accueil/
│   ├── accueil.css
│   └── accueil.js
├── pages/
│   ├── agro-premium-organic/
│   ├── commander/
│   ├── nos-produits/
│   ├── notre-histoire/
│   ├── notre-processus/
│   └── satisfaction/
└── assets/
    ├── css/   global.css
    ├── js/    global.js
    └── images/
        ├── logo/
        ├── icons/
        └── common/
```

## Accessibilité

- HTML sémantique, labels associés, focus visible
- Menu mobile avec `aria-expanded`
- `prefers-reduced-motion` respecté
- Zones cliquables ≥ 44 px
