const scriptTag = document.getElementById('roi-data');
const roiData = scriptTag ? JSON.parse(scriptTag.textContent) : {};




function roiUpdate() {
  const team   = parseInt(document.getElementById('team-slider').value);
  const region = document.getElementById('region-select').value;
  const data   = roiData[region];

  if (!data) return;
  
  document.getElementById('team-val').textContent = team + ' FTEs';
  const mssFTEs = team <= 2 ? 2 : 2 + (team - 1) * 0.85;
  const inHouseCost = data.actual_cost * team * 12;
  const mssCost     = data.updated_cost * mssFTEs * 12;
  const pct = Math.round(((inHouseCost - mssCost) / inHouseCost) * 100);
  updateRightChart(pct, mssCost, inHouseCost);
}

function updateRightChart(pct, mssCost, inHouseCost) {
  const badge  = document.getElementById('savings-badge-hp');
  const barIH  = document.getElementById('bar-inhouse-hp');
  const barMSS = document.getElementById('bar-mss-hp');
  const arcFill = document.getElementById('arc-fill');
  const arcPct  = document.getElementById('arc-pct');
  if (arcFill && arcPct) {
    const totalDash = 251; 
    const displayPct = Math.max(0, Math.min(100, pct));
    arcPct.textContent = displayPct + '%';
    arcFill.style.strokeDashoffset = totalDash - (totalDash * displayPct / 100);
  }


if (!barIH || !barMSS) return;

  barIH.style.height  = '0px';
  barMSS.style.height = '0px';

  setTimeout(() => {
    barIH.style.height  = '200px'; 
    barMSS.style.height = Math.min(200, Math.round(200 * (mssCost / inHouseCost))) + 'px';
  }, 50);
}


/* ---------------------- INIT ---------------------- */

window.addEventListener('DOMContentLoaded', () => {
  roiUpdate(); // run once on load
});