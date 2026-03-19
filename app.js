
const checklistItems = [
  "Freins AV",
  "Freins AR",
  "Pneus",
  "Direction / Suspension",
  "Échappement",
  "Fuites (huile/liquide)",
  "Éclairage",
  "Essuie-glace",
  "Batterie / Charge",
  "Courroies / accessoires",
  "Filtre air / cabine"
];

const fluidItems = [
  "Huile moteur",
  "Coolant",
  "Freins",
  "Direction",
  "Lave-glace",
  "Transmission"
];

const storageKey = "fiche_srt_enterprise_v2";

function createRows() {
  const checklistRoot = document.getElementById("checklistRows");
  const fluidRoot = document.getElementById("fluidRows");

  checklistRoot.innerHTML = checklistItems.map((item, i) => `
    <div class="row check">
      <div class="name">${item}</div>
      <label class="choice"><input type="radio" name="check_${i}" value="ok"></label>
      <label class="choice"><input type="radio" name="check_${i}" value="todo"></label>
    </div>
  `).join("");

  fluidRoot.innerHTML = fluidItems.map((item, i) => `
    <div class="row fluid">
      <div class="name">${item}</div>
      <label class="choice"><input type="radio" name="fluid_${i}" value="bas"></label>
      <label class="choice"><input type="radio" name="fluid_${i}" value="bon"></label>
      <label class="choice"><input type="radio" name="fluid_${i}" value="fuite"></label>
    </div>
  `).join("");
}

function allFieldIds() {
  return [
    "ro","date","tech","unite","annee","marque","modele","couleur",
    "plaque","km","vin","cle","freins_av","freins_ar","pneus_av","pneus_ar",
    "pression","batterie_v","alternateur_v","obd"
  ];
}

function collectData() {
  const data = {};
  allFieldIds().forEach(id => data[id] = document.getElementById(id).value);

  data.checklist = checklistItems.map((_, i) => {
    const checked = document.querySelector(`input[name="check_${i}"]:checked`);
    return checked ? checked.value : "";
  });

  data.fluids = fluidItems.map((_, i) => {
    const checked = document.querySelector(`input[name="fluid_${i}"]:checked`);
    return checked ? checked.value : "";
  });

  return data;
}

function saveData(showAlert = true) {
  localStorage.setItem(storageKey, JSON.stringify(collectData()));
  if (showAlert) alert("Fiche sauvegardée");
}

function loadData() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;
  const data = JSON.parse(raw);

  allFieldIds().forEach(id => {
    if (data[id] !== undefined) document.getElementById(id).value = data[id];
  });

  (data.checklist || []).forEach((value, i) => {
    if (!value) return;
    const el = document.querySelector(`input[name="check_${i}"][value="${value}"]`);
    if (el) el.checked = true;
  });

  (data.fluids || []).forEach((value, i) => {
    if (!value) return;
    const el = document.querySelector(`input[name="fluid_${i}"][value="${value}"]`);
    if (el) el.checked = true;
  });
}

function resetData() {
  if (!confirm("Effacer la fiche en cours ?")) return;
  localStorage.removeItem(storageKey);
  location.reload();
}

function buildSummary() {
  const d = collectData();
  const okItems = checklistItems.filter((_, i) => d.checklist[i] === "ok");
  const todoItems = checklistItems.filter((_, i) => d.checklist[i] === "todo");
  const fluidProblems = fluidItems
    .map((name, i) => ({ name, value: d.fluids[i] }))
    .filter(x => x.value && x.value !== "bon")
    .map(x => `${x.name}: ${x.value}`);

  return [
    "FICHE INSPECTION SRT",
    `RO: ${d.ro || "-"}`,
    `Date: ${d.date || "-"}`,
    `Tech: ${d.tech || "-"}`,
    `Véhicule: ${[d.annee, d.marque, d.modele].filter(Boolean).join(" ") || "-"}`,
    `Plaque: ${d.plaque || "-"}`,
    `VIN: ${d.vin || "-"}`,
    `KM: ${d.km || "-"}`,
    "",
    `Checklist OK: ${okItems.join(", ") || "Aucun"}`,
    `À faire: ${todoItems.join(", ") || "Aucun"}`,
    `Fluides à surveiller: ${fluidProblems.join(", ") || "Aucun"}`,
    "",
    "Mesures:",
    `Freins AV: ${d.freins_av || "-"} mm`,
    `Freins AR: ${d.freins_ar || "-"} mm`,
    `Pneus AV: ${d.pneus_av || "-"} mm`,
    `Pneus AR: ${d.pneus_ar || "-"} mm`,
    `Pression: ${d.pression || "-"} psi`,
    `Batterie: ${d.batterie_v || "-"} V`,
    `Alternateur: ${d.alternateur_v || "-"} V`,
    "",
    "Codes OBD / Recommandations:",
    d.obd || "-"
  ].join("\n");
}

async function shareSummary() {
  saveData(false);
  const text = buildSummary();
  if (navigator.share) {
    try {
      await navigator.share({ title: "Fiche Inspection SRT", text });
    } catch (e) {}
  } else {
    navigator.clipboard.writeText(text);
    alert("Résumé copié dans le presse-papiers");
  }
}

function autoBind() {
  document.querySelectorAll("input, textarea").forEach(el => {
    el.addEventListener("input", () => saveData(false));
    el.addEventListener("change", () => saveData(false));
  });
}

window.addEventListener("DOMContentLoaded", () => {
  createRows();
  loadData();
  autoBind();
  document.getElementById("btnSave").addEventListener("click", () => saveData(true));
  document.getElementById("btnResetTop").addEventListener("click", resetData);
  document.getElementById("btnShare").addEventListener("click", shareSummary);
  document.getElementById("btnPrint").addEventListener("click", () => window.print());
});
