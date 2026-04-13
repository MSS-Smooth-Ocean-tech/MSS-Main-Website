const scriptTag = document.getElementById('roi-data');
const roiData = scriptTag ? JSON.parse(scriptTag.textContent) : {};

function roiUpdate() {
  const team   = parseInt(document.getElementById('team-slider').value);
  const region = document.getElementById('region-select').value;
  const data   = roiData[region];

  if (!data) return;
  
  document.getElementById('team-val').textContent = team + ' FTEs';
  const mssFTEs = 2 + (team - 1) * 0.75;
  const inHouseCost = data.actual_cost * team * 12;
  const mssCost     = data.updated_cost * mssFTEs * 12;
  const pct = Math.round(((inHouseCost - mssCost) / inHouseCost) * 100);
  updateRightChart(pct, mssCost, inHouseCost);
}

function updateRightChart(pct, mssCost, inHouseCost) {
  const badge  = document.getElementById('savings-badge-hp');
  const barIH  = document.getElementById('bar-inhouse-hp');
  const barMSS = document.getElementById('bar-mss-hp');

  if (!badge || !barIH || !barMSS) return;

  badge.textContent = Math.max(0, pct) + '% Saved';
  badge.style.visibility = 'visible';

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