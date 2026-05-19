# Design System — Life2

Guide de redesign complet à appliquer sur toute l'application. Respecte chaque règle à la lettre.

---

## Philosophie générale

Le design actuel est trop générique : fond lavande/beige pâle, cards blanches plates, emojis en guise d'icônes, typographie sans personnalité. L'objectif est un style **playful éditorial** : chaleureux, adulte, avec de l'âme. Inspiré d'une fusion entre un magazine scandinave et une app lifestyle moderne.

**Une règle absolue : chaque élément doit sembler dessiné pour ce projet, pas sorti d'un template.**

---

## Typographie

### Polices à importer (Google Fonts)

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,400;1,9..144,600&family=Instrument+Sans:wght@400;500&display=swap" rel="stylesheet">
```

### Règles d'utilisation

| Élément | Police | Style | Taille |
|---|---|---|---|
| Titres de pages (h1) | Fraunces | weight 500, letter-spacing -1px | 34–40px |
| Titres de modules/sections | Fraunces | weight 500, letter-spacing -0.4px | 18–22px |
| Corps de texte, labels, nav | Instrument Sans | weight 400 | 13–15px |
| Valeurs numériques importantes | Fraunces | weight 500 | selon contexte |
| Accents en italic | Fraunces italic | pour mettre en valeur un prénom, un mot clé | — |

### Ce qu'il ne faut PAS faire
- ❌ N'utilise jamais Inter, Roboto, Arial ou System-ui pour les titres
- ❌ Pas de `font-weight: 700` sur Fraunces (trop lourd) — utilise 500 ou 600
- ❌ Pas de letter-spacing positif sur les titres Fraunces

---

## Palette de couleurs

```css
:root {
  /* Backgrounds */
  --color-bg:        #FDFAF5;   /* fond principal, blanc chaud */
  --color-cream:     #F7F3EC;   /* fond secondaire, surfaces */
  --color-border:    rgba(44, 74, 53, 0.12); /* bordures subtiles */

  /* Forest — couleur principale */
  --color-forest:       #2C4A35;
  --color-forest-light: #3D6B4A;
  --color-forest-muted: rgba(44, 74, 53, 0.08); /* pour les hover légers */

  /* Accents */
  --color-butter:     #E8C84A;  /* jaune beurre — indicateur actif, accents */
  --color-butter-bg:  #F5E49A;  /* version claire */
  --color-sage:       #8FAF7E;  /* vert sauge — secondaire */

  /* Texte */
  --color-ink:      #1E2820;   /* texte principal */
  --color-ink-soft: #3A4A3E;   /* texte secondaire */
  --color-muted:    #7A8A7E;   /* texte tertiaire, labels */

  /* Modules — fonds colorés distincts */
  --color-module-budget:    #EBF0E8;  /* vert sauge très clair */
  --color-module-recettes:  #F0EBE4;  /* sable chaud */
  --color-module-courses:   #E4EBF0;  /* bleu ciel pâle */
  --color-module-calendar:  #EEE4F0;  /* lilas très doux */
}
```

### Ce qu'il ne faut PAS faire
- ❌ Supprime tous les fonds `#F0F0FF`, lavande, `#EEF`, et dégradés violets/bleus génériques
- ❌ Pas de `box-shadow` sur les cards de modules — c'est la couleur de fond qui crée la séparation
- ❌ Pas de blanc pur `#FFFFFF` pour les fonds principaux — utilise `--color-bg`

---

## Sidebar (navigation latérale)

```css
.sidebar {
  background: var(--color-forest);     /* vert forêt foncé */
  width: 200px;
  padding: 24px 0;
}

/* Logo */
.logo-mark {
  background: var(--color-butter);
  border-radius: 8px;
  font-family: 'Fraunces', serif;
  font-style: italic;
  color: var(--color-forest);
}
.logo-name {
  font-family: 'Fraunces', serif;
  color: #fff;
  font-weight: 500;
}

/* Items de navigation */
.nav-item {
  color: rgba(255, 255, 255, 0.55);
  font-family: 'Instrument Sans', sans-serif;
  font-size: 13.5px;
  padding: 10px 20px;
}
.nav-item:hover {
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.05);
}
.nav-item.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

/* Indicateur actif : barre beurre à gauche */
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--color-butter);
  border-radius: 0 2px 2px 0;
}

/* Bloc partenaire en bas */
.sidebar-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px 20px 0;
}
.partner-chip {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.partner-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5CBA7D;  /* vert présence en ligne */
  margin-left: auto;
}
```

### Ce qu'il ne faut PAS faire
- ❌ Plus de sidebar gris clair ou blanc
- ❌ Pas d'emojis dans la navigation — utilise des icônes Tabler (voir section icônes)
- ❌ Pas de fond coloré différent pour chaque item actif — seulement la barre `::before` beurre

---

## Page d'accueil (Accueil)

### Header de page
```css
/* Salutation */
.greeting-sub {
  font-size: 13px;
  color: var(--color-muted);
  letter-spacing: 0.3px;
  margin-bottom: 4px;
  font-family: 'Instrument Sans', sans-serif;
}
.greeting-title {
  font-family: 'Fraunces', serif;
  font-size: 38px;
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: -1px;
  line-height: 1;
}
/* Le prénom en italic + couleur forêt */
.greeting-title em {
  font-style: italic;
  color: var(--color-forest);
}
```

### Grille de modules
- Layout : CSS Grid 2 colonnes, `gap: 14px`
- Budget et Calendrier prennent `grid-column: span 2` (pleine largeur)
- Recettes et Courses sont côte à côte

```css
.module {
  border-radius: 16px;
  padding: 22px 24px;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  /* PAS de box-shadow, PAS de border blanc */
}
.module:hover {
  transform: translateY(-3px);
}
.module:active {
  transform: scale(0.98);
}

/* Couleurs par module */
.module-budget    { background: var(--color-module-budget); }
.module-recettes  { background: var(--color-module-recettes); }
.module-courses   { background: var(--color-module-courses); }
.module-calendar  { background: var(--color-module-calendar); }

/* Label du module */
.module-label {
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: -0.4px;
}
.module-meta {
  font-size: 12px;
  color: var(--color-muted);
  margin-top: 3px;
  font-family: 'Instrument Sans', sans-serif;
}
```

#### Module Budget — layout spécial
Le module Budget affiche en ligne : titre à gauche + mini barre de progression + montant à droite.

```jsx
<div className="module module-budget" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <div>
    {/* icône + label + meta */}
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-muted)', marginBottom: '6px' }}>
        <span>Dépensé</span><span>62%</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(44,74,53,0.12)', borderRadius: '3px', width: '110px' }}>
        <div style={{ width: '62%', height: '100%', background: 'var(--color-forest)', borderRadius: '3px' }} />
      </div>
    </div>
    <div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 500, color: 'var(--color-forest)' }}>
        4'030
      </div>
      <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>CHF ce mois</div>
    </div>
  </div>
</div>
```

#### Module Calendrier — layout spécial
Affiche le prochain événement à droite :

```jsx
<div className="module module-calendar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <div>{/* icône + label */}</div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.5)', borderRadius: '10px', padding: '10px 14px' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: '26px', fontWeight: 500 }}>21</div>
      <div style={{ fontSize: '10px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MAI</div>
    </div>
    <div style={{ width: '1px', height: '32px', background: 'var(--color-border)' }} />
    <div>
      <div style={{ fontSize: '13px', fontWeight: 500 }}>Paris</div>
      <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>Jeu → Lun · 5 jours</div>
      <span style={{ background: 'var(--color-forest)', color: '#fff', fontSize: '10px', padding: '3px 8px', borderRadius: '12px', display: 'inline-block', marginTop: '5px' }}>Voyage</span>
    </div>
  </div>
</div>
```

---

## Pages intérieures — règles communes

### Header de chaque page
```css
.page-header {
  padding: 36px 40px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.page-title {
  font-family: 'Fraunces', serif;
  font-size: 34px;
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: -0.8px;
}
/* Bouton d'action principal (ex: "+ Ajouter", "+ Évènement") */
.btn-primary {
  background: var(--color-forest);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 9px 16px;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover {
  background: var(--color-forest-light);
}
/* Bouton destructif (ex: "Tout vider") */
.btn-danger {
  background: transparent;
  color: #C4614A;
  border: 1px solid rgba(196, 97, 74, 0.3);
  border-radius: 10px;
  padding: 9px 16px;
  font-size: 13px;
  cursor: pointer;
}
```

### Pills / filtres de catégories
```css
.filter-bar {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
}
.filter-pill {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-family: 'Instrument Sans', sans-serif;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-ink-soft);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.filter-pill:hover {
  border-color: var(--color-forest);
  color: var(--color-forest);
}
.filter-pill.active {
  background: var(--color-forest);
  color: #fff;
  border-color: var(--color-forest);
}
```

### Tags de catégorie (sur les cards de recettes, events, etc.)
```css
.tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-family: 'Instrument Sans', sans-serif;
  font-weight: 500;
}
/* Couleurs par type */
.tag-voyage    { background: rgba(44,74,53,0.12);  color: var(--color-forest); }
.tag-recettes  { background: rgba(232,200,74,0.2); color: #7A6010; }
.tag-sante     { background: rgba(92,186,125,0.15); color: #2D6B45; }
.tag-sortie    { background: rgba(196,97,74,0.12); color: #8B3A28; }
```

---

## Page Budget

### Tabs (Nolan / Lylou / Commun / Synthèse)
```css
.tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--color-cream);
  border-radius: 12px;
  width: fit-content;
}
.tab {
  padding: 7px 18px;
  border-radius: 9px;
  font-size: 13px;
  font-family: 'Instrument Sans', sans-serif;
  background: transparent;
  color: var(--color-muted);
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}
.tab.active {
  background: #fff;
  color: var(--color-ink);
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
```

### Sections de budget (Revenus, Obligatoire, Voiture…)
```css
.budget-section {
  background: #fff;
  border: 0.5px solid var(--color-border);
  border-radius: 14px;
  padding: 20px 22px;
  margin-bottom: 14px;
}
.budget-section-label {
  font-size: 11px;
  font-family: 'Instrument Sans', sans-serif;
  font-weight: 500;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 16px;
}
/* Couleurs par catégorie */
.budget-section-label.revenus    { color: var(--color-forest); }
.budget-section-label.obligatoire { color: #C4614A; }
.budget-section-label.voiture    { color: #E8A020; }
.budget-section-label.abonnements { color: #7A60C0; }

/* Champ de saisie budget */
.budget-field {
  display: flex;
  align-items: center;
  border: 0.5px solid var(--color-border);
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 8px;
  transition: border-color 0.15s;
}
.budget-field:focus-within {
  border-color: var(--color-forest);
}
.budget-currency-prefix {
  font-size: 13px;
  color: var(--color-muted);
  margin-right: 10px;
  font-family: 'Instrument Sans', sans-serif;
}
.budget-input {
  border: none;
  background: transparent;
  font-family: 'Fraunces', serif;
  font-size: 16px;
  color: var(--color-ink);
  text-align: right;
  flex: 1;
  outline: none;
}
```

---

## Page Recettes

### Card de recette
```css
/* Remplace les cards plates blanches par des éléments plus expressifs */
.recipe-card {
  background: #fff;
  border: 0.5px solid var(--color-border);
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.15s;
}
.recipe-card:hover {
  transform: translateY(-4px);
  border-color: rgba(44, 74, 53, 0.25);
}
.recipe-name {
  font-family: 'Fraunces', serif;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: -0.3px;
}
.recipe-time {
  font-size: 12px;
  color: var(--color-muted);
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}
```

---

## Page Courses

### Input d'ajout
```css
.courses-input {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 12px 16px;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 14px;
  color: var(--color-ink);
  background: #fff;
  flex: 1;
  outline: none;
  transition: border-color 0.15s;
}
.courses-input:focus {
  border-color: var(--color-forest);
}
.courses-add-btn {
  width: 40px;
  height: 40px;
  background: var(--color-forest);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.courses-add-btn:hover {
  background: var(--color-forest-light);
}
```

### Header de catégorie (ex: DIVERS)
```css
.courses-category-header {
  font-size: 11px;
  font-family: 'Instrument Sans', sans-serif;
  font-weight: 500;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--color-muted);
  margin: 20px 0 8px;
}

/* Item de course */
.course-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border: 0.5px solid var(--color-border);
  border-radius: 10px;
  margin-bottom: 6px;
  transition: opacity 0.15s;
}
.course-item.checked {
  opacity: 0.4;
  text-decoration: line-through;
}
/* Checkbox custom */
.course-checkbox {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--color-border);
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}
.course-checkbox.checked {
  background: var(--color-forest);
  border-color: var(--color-forest);
}
```

---

## Page Calendrier

### Tabs Agenda / Mois
Utilise le même style que les tabs Budget (voir ci-dessus).

### Event card (vue Agenda)
```css
.event-card {
  display: flex;
  align-items: stretch;
  background: #fff;
  border: 0.5px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 6px;
  transition: transform 0.15s;
}
.event-card:hover {
  transform: translateX(3px);
}
/* Barre colorée à gauche selon catégorie */
.event-bar {
  width: 4px;
  background: var(--color-forest);  /* change selon catégorie */
  flex-shrink: 0;
}
.event-bar.voyage    { background: var(--color-forest); }
.event-bar.sante     { background: #5CBA7D; }
.event-bar.sortie    { background: #C4614A; }
.event-bar.rdv       { background: #7A60C0; }

.event-content {
  padding: 12px 16px;
  flex: 1;
}
.event-title {
  font-family: 'Fraunces', serif;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-ink);
}
.event-category {
  font-size: 12px;
  color: var(--color-muted);
  margin-top: 2px;
}
```

### Header de date (ex: MAI 2026)
```css
.calendar-month-header {
  font-size: 11px;
  font-family: 'Instrument Sans', sans-serif;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-forest);
  margin: 24px 0 12px;
}
.calendar-day-row {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 12px;
  align-items: start;
  margin-bottom: 8px;
}
.calendar-day-num {
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 500;
  color: var(--color-ink);
  line-height: 1;
}
.calendar-day-label {
  font-size: 11px;
  color: var(--color-muted);
  text-transform: capitalize;
}
/* Jour actuel mis en valeur */
.calendar-day-today .calendar-day-num {
  color: var(--color-forest);
}
.calendar-day-today .calendar-day-label {
  color: var(--color-forest);
}
```

---

## Icônes

Utilise exclusivement **Tabler Icons** (outline). Remplace tous les emojis actuels par des icônes Tabler.

```html
<!-- Ajouter dans le <head> -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
```

| Section | Icône Tabler |
|---|---|
| Accueil | `ti-home` |
| Budget | `ti-wallet` |
| Recettes | `ti-chef-hat` |
| Courses | `ti-shopping-cart` |
| Calendrier | `ti-calendar` |
| Réglages | `ti-settings` |
| Ajouter | `ti-plus` |
| Horloge / durée | `ti-clock` |
| Partenaire / user | `ti-user` |

Usage : `<i class="ti ti-home" aria-hidden="true"></i>`

---

## Ce qu'il faut supprimer / remplacer

| Avant | Après |
|---|---|
| Fond sidebar `#F0F0FF` ou lavande | `#2C4A35` (vert forêt) |
| Cards blanches avec `box-shadow` | Blocs colorés sans shadow |
| Emojis dans la nav (🏠 💰 🔍 🛒 📅) | Icônes Tabler outline |
| Fond page `#F5F5F5` ou blanc cassé générique | `#FDFAF5` (blanc chaud) |
| Typographie Inter/système | Fraunces (titres) + Instrument Sans (corps) |
| Pills actives en violet/bleu | Pills actives fond `#2C4A35` + texte blanc |
| Indicateur nav actif fond coloré entier | Barre `::before` beurre `#E8C84A` (3px) |
| Bouton primary violet/bleu | `#2C4A35` fond, blanc texte, `border-radius: 10px` |

---

## Exemple complet — Home (référence visuelle)

Voici le rendu cible de la page d'accueil en pseudo-code structurel :

```
[Sidebar forest] [Main warm-white]
  Logo "L" beurre    Greeting: "Mardi, 19 mai"
  — Accueil ←barre  H1: "Bonjour, *Nolan*" (italic vert)
  — Budget           
  — Recettes         [Chip: "Paris 21–25 mai · voyage"]
  — Courses          
  — Calendrier       Grid 2 cols:
                     [Module Budget vert-sauge — full width
                       Wallet icon + "Budget" Fraunces
                       → barre progression + "4'030 CHF"]
                     [Module Recettes sable] [Module Courses bleu]
  ─────────────      [Module Calendrier lilas — full width
  avec Lylou •vert    → event card: "21 MAI | Paris | Voyage"]
```

---

*Ce document est le guide de référence unique. En cas de doute sur un choix visuel, reviens à la philosophie : chaleureux, adulte, éditorial. Jamais générique.*
