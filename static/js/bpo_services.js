function roiUpdate() {
  const team   = parseInt(document.getElementById('team-slider').value);
  const vol    = parseInt(document.getElementById('vol-slider').value);
  const region = parseFloat(document.getElementById('region-select').value);

  document.getElementById('team-val').textContent = team + ' FTEs';
  document.getElementById('vol-val').textContent  = vol.toLocaleString('en-US');

  const baseCost   = team * 28000 * region;
  const mssCost    = baseCost * 0.58;
  const savings    = baseCost - mssCost;
  const pct        = Math.round((savings / baseCost) * 100);

  document.getElementById('roi-savings').textContent = '$' + Math.round(savings).toLocaleString('en-US');
  document.getElementById('roi-pct').innerHTML = `<span>+ ${pct}%</span> reduction in costs`;

  // Build 3-year chart
  const chart  = document.getElementById('roi-chart');
  const maxH   = 140;
  chart.innerHTML = '';

  [1, 2, 3].forEach(yr => {
    const ih  = baseCost * yr;
    const mss = mssCost  * yr;
    const ihH  = maxH;
    const mssH = Math.round((mss / ih) * maxH);

    chart.innerHTML += `
      <div class="roi-yr">
        <div class="roi-yr-bars">
          <div class="roi-bar ih"  style="height:${ihH}px"></div>
          <div class="roi-bar mss" style="height:${mssH}px"></div>
        </div>
        <div class="roi-yr-label">Year ${yr}</div>
      </div>`;
  });
}

roiUpdate();