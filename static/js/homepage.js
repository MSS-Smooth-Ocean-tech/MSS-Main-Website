const counters = document.querySelectorAll('.stat-num[data-target]');
let started = false;

function runCounters() {

  counters.forEach(counter => {

    const startValue = parseFloat(counter.dataset.start) || 0;
    const target = parseFloat(counter.dataset.target);
    const suffix = counter.dataset.suffix || "";
    const prefix = counter.dataset.prefix || "";

    const duration = 1800;
    const startTime = performance.now();

    function update(now) {

      const progress = Math.min((now - startTime) / duration, 1);
      const value = startValue + (target - startValue) * progress;

      if (target % 1 !== 0) {
        counter.innerText = prefix + value.toFixed(1) + suffix;
      } else {
        counter.innerText = prefix + Math.floor(value) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.innerText = prefix + target + suffix;
      }

    }

    requestAnimationFrame(update);

  });

}

const observer = new IntersectionObserver(entries => {

  if (entries[0].isIntersecting && !started) {
    started = true;
    runCounters();
  }

}, { threshold: 0.4 });

observer.observe(document.querySelector('.stats-strip'));

const reveals = document.querySelectorAll(".reveal");

function revealSections() {

  reveals.forEach(el => {

    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;

    if (elementTop < windowHeight - 100) {
      el.classList.add("active");
    }

  });

}

window.addEventListener("scroll", revealSections);
window.addEventListener("load", revealSections);

function parseMoneyHp(str) {
    return parseInt((str || '').replace(/[^0-9]/g, '')) || 0;
  }

  function formatMoneyHp(input) {
    const raw = parseMoneyHp(input.value);
    input.value = raw ? raw.toLocaleString('en-US') : '';
  }

  function shortFmtHp(n) {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return '$' + Math.round(n / 1000).toLocaleString('en-US') + 'k';
    return '$' + n.toLocaleString('en-US');
  }

  function analyzeSavingsHp() {
    const fleet   = parseFloat(document.getElementById('fleet-select-hp').value);
    const monthly = parseMoneyHp(document.getElementById('spend-input-hp').value);
    const inputEl = document.getElementById('spend-input-hp');

    if (!monthly || monthly <= 0) {
      inputEl.style.outline = '2px solid #ef4444';
      inputEl.focus();
      return;
    }
    inputEl.style.outline = '';

    const annual      = monthly * 12;
    const savingsRate = fleet < 0.5 ? 0.30 : fleet < 0.8 ? 0.40 : 0.45;
    const mssCost     = Math.round(annual * (1 - savingsRate));
    const pct         = Math.round(savingsRate * 100);

    document.getElementById('inhouse-amt-hp').textContent = shortFmtHp(annual);
    document.getElementById('mss-amt-hp').textContent     = shortFmtHp(mssCost);

    const badge = document.getElementById('savings-badge-hp');
    badge.textContent      = pct + '% Saved';
    badge.style.visibility = 'visible';

    document.getElementById('bar-inhouse-hp').style.height = '0px';
    document.getElementById('bar-mss-hp').style.height     = '0px';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById('bar-inhouse-hp').style.height = '200px';
        document.getElementById('bar-mss-hp').style.height     = Math.round(200 * (1 - savingsRate)) + 'px';
      });
    });
  }

  function resetChartHp() {
    document.getElementById('bar-inhouse-hp').style.height       = '0px';
    document.getElementById('bar-mss-hp').style.height           = '0px';
    document.getElementById('inhouse-amt-hp').textContent        = '—';
    document.getElementById('mss-amt-hp').textContent            = '—';
    document.getElementById('savings-badge-hp').style.visibility = 'hidden';
  }

  document.getElementById('spend-input-hp').addEventListener('input', function () {
    formatMoneyHp(this);
    resetChartHp();
  });
  document.getElementById('fleet-select-hp').addEventListener('change', resetChartHp);

  // Run initial calculation with default values
  analyzeSavingsHp();
