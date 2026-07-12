// ============ Deux axes indépendants ============
// La technique (quoi) et le public (qui) sont deux choix séparés :
// un même atelier cyanotype peut être donné à des enfants, des ados
// ou des adultes confirmés — ce n'est pas la technique qui détermine le public.

// Minimums recommandés par discipline (protection de l'artiste, non officiels).
// huile/acrylique/cyanotype/céramique/dessin sourcés ; gravure est une estimation
// par analogie (technique outillée, proche de la gravure en coût de mise en œuvre).
// Temps de prépa/rangement propres à chaque technique (heures, base adulte) —
// un atelier léger (dessin, cyanotype) ne demande pas la même installation
// qu'un atelier lourd (céramique : tours, fours, terre).
const techniques = {
  ceramique: { label:"Céramique",           material:20, duration:3,   prep:2,   cleanup:1.5,  paris:[50,90],  minPrice:70 },
  cyanotype: { label:"Cyanotype",           material:15, duration:2,   prep:1,   cleanup:0.5,  paris:[45,85],  minPrice:40 },
  acrylique: { label:"Peinture acrylique",  material:12, duration:2.5, prep:1,   cleanup:0.5,  paris:[35,55],  minPrice:35 },
  huile:     { label:"Peinture à l'huile",  material:25, duration:3,   prep:1.5, cleanup:1,    paris:[45,85],  minPrice:60 },
  dessin:    { label:"Dessin",              material:8,  duration:2,   prep:0.5, cleanup:0.25, paris:[25,50],  minPrice:25 },
  gravure:   { label:"Gravure",             material:10, duration:2.5, prep:1,   cleanup:1,    paris:[35,45],  minPrice:35 }
};

// Coefficients appliqués sur les valeurs de base de la technique.
const publics = {
  enfant:   { label:"Enfant (6-11 ans)",              materialMult:0.6, durationMult:0.75, priceMult:0.55 },
  ado:      { label:"Ado (12-17 ans)",                materialMult:0.8, durationMult:0.9,  priceMult:0.75 },
  adulte:   { label:"Adulte débutant",                materialMult:1.0, durationMult:1.0,  priceMult:1.0  },
  confirme: { label:"Adulte confirmé / haut de gamme",materialMult:1.4, durationMult:1.1,  priceMult:1.5  }
};

// Coefficient institutionnel appliqué au coût total pour les financeurs
// qui ne relèvent pas du prix libre grand public.
const funderConfig = {
  "particulier":  { label:"Particulier",  mode:"tiers", coef:null },
  "association":  { label:"Association partenaire", mode:"tiers", coef:null },
  "ecole":        { label:"École / centre de loisirs", mode:"single", coef:1.10 },
  "entreprise":   { label:"Entreprise (team building)", mode:"single", coef:1.50 },
  "musee":        { label:"Musée / institution culturelle", mode:"single", coef:1.70 }
};

// Repères sourcés (voir note en bas de l'outil pour les références)
const rateBenchmarks = [
  { label:"Plancher syndical · 60 €/h — ateliers grand public", value:60 },
  { label:"CAAP/FRAAP · 84 €/h — si payé par une structure", value:84 },
  { label:"Musée/institution · 120 €/h — exceptionnel", value:120 }
];

let activeTechnique = "cyanotype";
let activePublic = "adulte";

const $ = id => document.getElementById(id);
const eur = n => n.toLocaleString('fr-FR', { style:'currency', currency:'EUR', maximumFractionDigits:0 });

function buildTechniqueChips(){
  const container = $("techniqueChips");
  container.innerHTML = "";
  Object.entries(techniques).forEach(([key, t]) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip" + (key === activeTechnique ? " active" : "");
    chip.textContent = t.label;
    chip.onclick = () => { activeTechnique = key; buildTechniqueChips(); applyPreset(); };
    container.appendChild(chip);
  });
}

function buildPublicChips(){
  const container = $("publicChips");
  container.innerHTML = "";
  Object.entries(publics).forEach(([key, p]) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip" + (key === activePublic ? " active" : "");
    chip.textContent = p.label;
    chip.onclick = () => { activePublic = key; buildPublicChips(); applyPreset(); };
    container.appendChild(chip);
  });
}

function buildRateChips(){
  const container = $("rateChips");
  container.innerHTML = "";
  rateBenchmarks.forEach(b => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = b.label;
    chip.onclick = () => { $("hourlyRate").value = b.value; recalc(); };
    container.appendChild(chip);
  });
}

// Recalcule la durée et le coût matériel pré-remplis à partir de la
// combinaison technique × public actuellement sélectionnée.
function applyPreset(){
  const t = techniques[activeTechnique];
  const p = publics[activePublic];
  $("animTime").value = Math.round(t.duration * p.durationMult * 4) / 4; // arrondi au quart d'heure
  $("prepTime").value = Math.round(t.prep * p.durationMult * 4) / 4;
  $("cleanupTime").value = Math.round(t.cleanup * p.durationMult * 4) / 4;
  $("materialCost").value = Math.round(t.material * p.materialMult);
  $("minPrice").value = Math.round(t.minPrice * p.priceMult);
  recalc();
}

function currentParisRange(){
  const t = techniques[activeTechnique];
  const p = publics[activePublic];
  return [Math.round(t.paris[0] * p.priceMult), Math.round(t.paris[1] * p.priceMult)];
}

function recalc(){
  const participants   = Math.max(1, parseFloat($("participants").value) || 1);
  const animTime       = parseFloat($("animTime").value) || 0;
  const prepTime       = parseFloat($("prepTime").value) || 0;
  const cleanupTime    = parseFloat($("cleanupTime").value) || 0;
  const commTime       = parseFloat($("commTime").value) || 0;
  const adminTime      = parseFloat($("adminTime").value) || 0;
  const transportTime  = parseFloat($("transportTime").value) || 0;
  const hourlyRate     = parseFloat($("hourlyRate").value) || 0;

  const materialFixed  = parseFloat($("materialFixed").value) || 0;
  const materialPerHead= parseFloat($("materialCost").value) || 0;

  const roomRental      = parseFloat($("roomRental").value) || 0;
  const transportCost   = parseFloat($("transportCost").value) || 0;
  const insurance       = parseFloat($("insurance").value) || 0;
  const miscCost        = parseFloat($("miscCost").value) || 0;

  const coefSolidaire = Math.max(1, parseFloat($("coefSolidaire").value) || 1);
  const coefNormal    = Math.max(1, parseFloat($("coefNormal").value) || 1);
  const coefSoutien   = Math.max(1, parseFloat($("coefSoutien").value) || 1);
  const minPrice      = parseFloat($("minPrice").value) || 0;
  const sessionCount  = Math.max(1, parseFloat($("sessionCount").value) || 1);

  const funderKey = $("funderType").value;
  const funder = funderConfig[funderKey];

  // Règle CAAP/FRAAP : la 1ère heure d'atelier face au public compte double
  // (elle absorbe une partie de la prépa/installation sur place). N'a d'effet
  // que si la durée de l'atelier est d'au moins 1h.
  const caapBonus = ($("caapRule").checked && animTime >= 1) ? 1 : 0;

  // La préparation, la communication et l'administratif sont un travail fait une
  // fois pour un format d'atelier donné : s'il est reproduit plusieurs fois, ce
  // temps s'amortit sur l'ensemble des séances plutôt que d'être facturé en entier
  // à chacune (c'est ce qui explique l'écart avec les tarifs du marché, où les
  // artisans reproduisent le même atelier des dizaines de fois).
  const amortizedPrep = (prepTime + commTime + adminTime) / sessionCount;

  const timeTotal    = amortizedPrep + animTime + cleanupTime + transportTime + caapBonus;
  const artistCost   = timeTotal * hourlyRate;
  const materialCost = materialFixed + materialPerHead * participants;
  const fixedCost    = roomRental + transportCost + insurance + miscCost;
  const totalCost    = artistCost + materialCost + fixedCost;

  const round5 = n => Math.round(n / 5) * 5;
  const applyFloor = pricePerPerson => Math.max(round5(pricePerPerson), minPrice);

  const solidairePP = applyFloor((totalCost * coefSolidaire) / participants);
  const normalPP    = applyFloor((totalCost * coefNormal) / participants);
  const soutienPP   = applyFloor((totalCost * coefSoutien) / participants);

  const solidaireTotal = solidairePP * participants;
  const normalTotal    = normalPP * participants;
  const soutienTotal   = soutienPP * participants;

  // Affichage du détail des coûts
  $("outTimeTotal").textContent   = timeTotal.toLocaleString('fr-FR', {maximumFractionDigits:2}) + " h";
  $("outArtistCost").textContent  = eur(artistCost);
  $("outMaterialCost").textContent= eur(materialCost);
  $("outFixedCost").textContent   = eur(fixedCost);
  $("outTotalCost").textContent   = eur(totalCost);

  let heroPricePP;

  if (funder.mode === "tiers"){
    $("tiersBlock").style.display = "";
    $("institutionBlock").style.display = "none";
    $("tierSolidaire").textContent = eur(solidairePP);
    $("tierNormal").textContent    = eur(normalPP);
    $("tierSoutien").textContent   = eur(soutienPP);
    $("heroLabel").textContent = "Tarif normal conseillé";
    $("heroSubLabel").textContent = "par participant · " + funder.label;
    heroPricePP = normalPP;
  } else {
    $("tiersBlock").style.display = "none";
    $("institutionBlock").style.display = "";
    const institutionPP = applyFloor((totalCost * funder.coef) / participants);
    const institutionTotal = institutionPP * participants;
    $("institutionLabel").textContent = `Coefficient ${funder.label.toLowerCase()}`;
    $("institutionCoef").textContent = "× " + funder.coef.toFixed(2);
    $("institutionTotal").textContent = eur(institutionTotal);
    $("heroLabel").textContent = "Tarif institutionnel conseillé";
    $("heroSubLabel").textContent = "par participant · " + funder.label;
    heroPricePP = institutionPP;
  }

  $("outPricePerPerson").textContent = eur(heroPricePP);
  $("funderHint").textContent = funder.mode === "tiers"
    ? "Prix libre : les 3 tarifs s'appliquent en même temps, chaque participant choisit."
    : "Tarif institutionnel unique — pas de tarif solidaire pour ce type de financeur.";

  // Comparaison marché parisien : dépend de la technique ET du public choisis
  const technique = techniques[activeTechnique];
  const publicInfo = publics[activePublic];
  const range = currentParisRange();
  $("compareType").textContent = `${technique.label} · ${publicInfo.label}`;
  $("parisMin").textContent = range[0] + " €";
  $("parisMax").textContent = range[1] + " €";

  const scaleMax = Math.max(range[1], heroPricePP) * 1.15;
  const rangeLeft  = (range[0] / scaleMax) * 100;
  const rangeWidth = ((range[1] - range[0]) / scaleMax) * 100;
  const markerLeft = Math.min(97, (heroPricePP / scaleMax) * 100);

  $("barRange").style.left  = rangeLeft + "%";
  $("barRange").style.width = rangeWidth + "%";
  $("barMarker").style.left = markerLeft + "%";

  return {
    participants, timeTotal, artistCost, materialCost, fixedCost, totalCost,
    solidairePP, normalPP, soutienPP, solidaireTotal, normalTotal, soutienTotal,
    funder, heroPricePP, technique, publicInfo, sessionCount
  };
}

function generatePDF(){
  const r = recalc();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const workshopName = $("pdfWorkshopName").value || `${r.technique.label} — ${r.publicInfo.label}`;
  const clientName = $("pdfClientName").value || "—";
  const today = new Date().toLocaleDateString('fr-FR');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(90, 18, 63);
  doc.text("UKIDAMA", 20, 24);

  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text("Devis d'atelier", 20, 32);

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 38, 190, 38);

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(`Atelier : ${workshopName}`, 20, 48);
  doc.text(`Public : ${r.publicInfo.label}`, 20, 55);
  doc.text(`Client / organisateur : ${clientName}`, 20, 62);
  doc.text(`Financeur : ${r.funder.label}`, 20, 69);
  doc.text(`Date du devis : ${today}`, 20, 76);
  doc.text(`Participants estimés : ${r.participants}`, 20, 83);
  const infoBottom = r.sessionCount > 1 ? 90 : 83;
  if (r.sessionCount > 1){
    doc.text(`Préparation amortie sur ${r.sessionCount} séances`, 20, 90);
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(20, infoBottom + 6, 190, infoBottom + 6);

  let y = infoBottom + 16;
  doc.setFont("helvetica", "bold");
  doc.text("Détail des coûts", 20, y);
  doc.setFont("helvetica", "normal");
  y += 8;

  const rows = [
    [`Temps de travail total (${r.timeTotal.toLocaleString('fr-FR', {maximumFractionDigits:2})} h)`, eur(r.artistCost)],
    ["Matériel (fixe + consommables)", eur(r.materialCost)],
    ["Frais annexes", eur(r.fixedCost)],
  ];
  rows.forEach(([label, val]) => {
    doc.text(label, 20, y);
    doc.text(val, 170, y, { align: "right" });
    y += 7;
  });

  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Coût réel de l'atelier", 20, y);
  doc.text(eur(r.totalCost), 170, y, { align: "right" });
  y += 12;

  if (r.funder.mode === "tiers"){
    doc.setFillColor(90, 18, 63);
    doc.rect(20, y, 170, 30, "F");
    doc.setTextColor(246, 233, 239);
    doc.setFontSize(10);
    doc.text("SOLIDAIRE", 45, y + 12, { align: "center" });
    doc.text("NORMAL", 105, y + 12, { align: "center" });
    doc.text("SOUTIEN", 165, y + 12, { align: "center" });
    doc.setFontSize(16);
    doc.text(eur(r.solidairePP), 45, y + 23, { align: "center" });
    doc.text(eur(r.normalPP), 105, y + 23, { align: "center" });
    doc.text(eur(r.soutienPP), 165, y + 23, { align: "center" });
    y += 44;
  } else {
    doc.setFillColor(90, 18, 63);
    doc.rect(20, y, 170, 24, "F");
    doc.setTextColor(246, 233, 239);
    doc.setFontSize(10);
    doc.text(`TARIF ${r.funder.label.toUpperCase()}`, 105, y + 10, { align: "center" });
    doc.setFontSize(16);
    doc.text(eur(r.heroPricePP) + " / participant", 105, y + 19, { align: "center" });
    y += 38;
  }

  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Devis indicatif généré par le calculateur d'atelier UKIDAMA.", 20, y);

  doc.save(`devis-${workshopName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

// Écouteurs
[
  "participants","animTime","prepTime","cleanupTime","commTime","adminTime","transportTime","hourlyRate",
  "materialFixed","materialCost","roomRental","transportCost","insurance","miscCost",
  "coefSolidaire","coefNormal","coefSoutien","minPrice","funderType","caapRule","sessionCount"
].forEach(id => $(id).addEventListener("input", recalc));

buildTechniqueChips();
buildPublicChips();
buildRateChips();
applyPreset();
