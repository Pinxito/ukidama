# ukidama
# Calculateur d'atelier — UKIDAMA

Un outil web autonome (HTML/CSS/JS, sans backend) pour estimer le tarif juste d'un atelier artistique : temps de travail réel, matériel, frais annexes, et trois niveaux de prix selon qui finance l'atelier. Génère aussi un devis PDF prêt à envoyer.

https://pinxito.github.io/ukidama/

---

## Ce que ça calcule

```
Coût réel de l'atelier
    = (temps de travail total × taux horaire)
    + matériel (fixe + consommables × participants)
    + frais annexes (salle, transport, assurance, divers)
```

Le **temps de travail total** ne se limite pas aux heures face au public : préparation, animation, rangement, communication (échanges avec le client, devis), administratif (facturation) et transport sont tous comptés.

À partir de ce coût réel, l'outil applique un coefficient selon **qui finance l'atelier** :

| Financeur | Mode d'affichage | Coefficient |
|---|---|---|
| Particulier | Prix libre — 3 tarifs simultanés | Solidaire ×1.05 · Normal ×1.25 · Soutien ×1.60 |
| Association partenaire | Prix libre — 3 tarifs simultanés | idem, ajustable |
| École / centre de loisirs | Tarif institutionnel unique | ×1.10 |
| Entreprise (team building) | Tarif institutionnel unique | ×1.50 |
| Musée / institution culturelle | Tarif institutionnel unique | ×1.70 |

Un **prix plancher par participant** évite qu'un petit groupe fasse tomber le prix sous un seuil raisonnable.

## Repères tarifaires (sourcés)

Le taux horaire par défaut et les boutons de repère rapide s'appuient sur des références professionnelles réelles, pas des estimations :

- **Maison des Artistes / SNSP** — barème syndical minimum recommandé pour l'animation/intervention : **60 €/h**
- **Référentiel DCA 2025** (réseau des centres d'art contemporain) — minimum pour une intervention en atelier artistique : **60 €/h**
- **Ministère de la Culture** — rémunération pratiquée par les structures culturelles : **40 à 80 €/h**, jusqu'à **120 €/h** en exceptionnel
- **CAAP / FRAAP (2026)** — tarif horaire repère indexé sur le SMIC (7×SMIC horaire), avec la 1ère heure comptée double pour absorber la préparation sur place : **≈ 84 €/h HT**

L'outil propose une case à cocher pour appliquer cette règle CAAP/FRAAP (1ère heure doublée) directement dans le calcul du temps de travail.

> Les droits d'auteur (ADAGP) ne sont **pas** inclus dans ce calculateur : ils dépendent du type d'exploitation de l'œuvre (exposition, reproduction, communication) et se négocient au cas par cas via le pôle Exposition de l'ADAGP. Si un atelier débouche sur une exposition ou une diffusion publique des œuvres produites, traiter ce point séparément.

## Fonctionnalités

- 6 modèles d'atelier pré-remplis (Enfant, Adulte débutant, Céramique, Cyanotype, Gravure, Haut de gamme) + mode personnalisé
- Détail du temps de travail sur 6 postes (prépa, animation, rangement, communication, administratif, transport)
- Matériel séparé en coût fixe (réutilisable) et consommables (par participant)
- Frais annexes : salle, transport, assurance, divers
- Coefficients tarifaires éditables
- Sélecteur de financeur avec bascule automatique prix libre / tarif institutionnel
- Comparaison visuelle avec les tarifs pratiqués à Paris pour le type d'atelier choisi
- Export PDF du devis en un clic (jsPDF, aucun serveur requis)

## Structure du projet

```
ukidama-workshop-calculator/
├── index.html      # structure de la page
├── style.css       # design (identité visuelle "cyanotype")
├── script.js       # logique de calcul et génération PDF
└── README.md
```

Tout est en JavaScript natif, sans framework ni build. Aucune dépendance à installer — seuls deux CDN sont chargés dans `index.html` : Google Fonts et [jsPDF](https://github.com/parallax/jsPDF) (pour l'export PDF).

## Déployer sur GitHub Pages

1. Pousse ce dépôt sur GitHub (public)
2. **Settings → Pages → Deploy from a branch → main → / (root) → Save**
3. Ton URL sera du type `https://tonpseudo.github.io/ukidama-workshop-calculator/`

## Intégrer dans Google Sites

Dans Google Sites : **Insérer → Intégrer → URL**, puis colle l'URL GitHub Pages. Le calculateur s'affiche dans un iframe directement dans la page.

## Tester en local

Aucun serveur nécessaire — double-clique sur `index.html`, ou ouvre `ukidama-calculateur-atelier.html` (version à fichier unique, identique mais tout-en-un, pratique pour un aperçu rapide sans dépôt Git).

## Personnaliser

- **Nouveaux types d'atelier** : ajouter une entrée dans l'objet `presets` en haut de `script.js` (durée, coût matériel, fourchette de prix Paris)
- **Nouveaux financeurs** : ajouter une entrée dans `funderConfig` (`mode: "tiers"` pour le prix libre, `mode: "single"` avec un `coef` pour un tarif institutionnel)
- **Coefficients par défaut** : modifier les valeurs `value` des champs `coefSolidaire`, `coefNormal`, `coefSoutien` dans `index.html`
- **Identité visuelle** : toutes les couleurs sont en variables CSS (`:root`) en haut de `style.css`

## Limites connues

- Les données saisies ne sont pas sauvegardées entre deux visites (pas de stockage persistant). Pour historiser les ateliers, il faudrait ajouter Google Sheets en backend via Google Apps Script, ou une base de données légère.
- Les fourchettes de prix parisiennes affichées à titre de comparaison sont indicatives et à réactualiser périodiquement.

## Licence

Usage interne UKIDAMA. À adapter librement selon les besoins de l'association.
