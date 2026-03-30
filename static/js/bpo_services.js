/* ---------------------- ROI + RIGHT CHART ---------------------- */

function roiUpdate() {
  const team   = parseInt(document.getElementById('team-slider').value);
  const vol    = parseInt(document.getElementById('vol-slider').value);
  const region = parseFloat(document.getElementById('region-select').value);

  // Update labels
  document.getElementById('team-val').textContent = team + ' FTEs';
  document.getElementById('vol-val').textContent  = vol.toLocaleString('en-US');

  // Base calculation
  const baseCost = team * 28000 * region;
  const mssCost  = baseCost * 0.58;
  const savings  = baseCost - mssCost;
  const pct      = Math.round((savings / baseCost) * 100);

  // Update ROI text (if used elsewhere)
  const savingsEl = document.getElementById('roi-savings');
  const pctEl     = document.getElementById('roi-pct');

  if (savingsEl) {
    savingsEl.textContent =
      '$' + Math.round(savings).toLocaleString('en-US');
  }

  if (pctEl) {
    pctEl.innerHTML = `<span>+ ${pct}%</span> reduction in costs`;
  }

  // 👉 Update RIGHT chart
  updateRightChart(baseCost, mssCost);
}

/* ---------------------- RIGHT CHART ---------------------- */

function updateRightChart(baseCost, mssCost) {
  const ihAmt  = document.getElementById('inhouse-amt-hp');
  const mssAmt = document.getElementById('mss-amt-hp');
  const badge  = document.getElementById('savings-badge-hp');
  const barIH  = document.getElementById('bar-inhouse-hp');
  const barMSS = document.getElementById('bar-mss-hp');

  if (!ihAmt || !mssAmt || !badge || !barIH || !barMSS) return;

  const savingsRate = 1 - (mssCost / baseCost);
  const pct = Math.round(savingsRate * 100);

  // Update values
  ihAmt.textContent  = shortFmt(baseCost);
  mssAmt.textContent = shortFmt(mssCost);

  badge.textContent      = pct + '% Saved';
  badge.style.visibility = 'visible';

  // Reset heights
  barIH.style.height  = '0px';
  barMSS.style.height = '0px';

  // Animate
  setTimeout(() => {
    barIH.style.height  = '200px';
    barMSS.style.height = Math.round(200 * (mssCost / baseCost)) + 'px';
  }, 50);
}

/* ---------------------- HELPERS ---------------------- */

function shortFmt(num) {
  if (num >= 1e6) return '$' + (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return '$' + (num / 1e3).toFixed(1) + 'K';
  return '$' + Math.round(num);
}

/* ---------------------- INIT ---------------------- */

window.addEventListener('DOMContentLoaded', () => {
  roiUpdate(); // run once on load
});