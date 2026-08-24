const district = 'Nashik';
let activeCrop = 'cotton';

async function loadPriceCard(crop, priceElId, changeIconId, changeTextId) {
  const data = await apiCall(`/prices/${crop}?district=${district}`);
  if (!data.length) return;
  const latest = data[data.length - 1];
  const prev = data[data.length - 2] || latest;
  const diff = (latest.price - prev.price).toFixed(0);
  const pct = prev.price ? ((diff / prev.price) * 100).toFixed(1) : 0;

  document.getElementById(priceElId).childNodes[0].nodeValue = `₹${latest.price} `;
  const changeTextEl = document.getElementById(changeTextId);
  const changeIconEl = document.getElementById(changeIconId);
  const rising = diff >= 0;
  changeTextEl.innerText = `${rising ? '+' : ''}₹${diff} (${pct}%) vs previous`;
  changeIconEl.innerText = rising ? 'trending_up' : 'trending_down';
}

async function loadRecommendation() {
  const signal = await apiCall(`/prices/${activeCrop}/signal?district=${district}`);
  document.getElementById('recommendationText').innerHTML =
    `${signal.signal === 'rising' ? 'Prices rising' : 'Prices falling'} for <strong class="font-bold">${activeCrop}</strong> — ${signal.recommendation || ''}`;
  document.getElementById('signalBadge').innerText = signal.signal === 'rising' ? 'Consider waiting' : 'Consider selling soon';
}

let forecastChartInstance = null;
async function loadForecastChart(crop) {
  const data = await apiCall(`/prices/${crop}?district=${district}`);
  const ctx = document.getElementById('forecastChart');
  if (forecastChartInstance) forecastChartInstance.destroy();
  forecastChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: `${crop} price`,
        data: data.map(d => d.price),
        borderColor: '#154212',
        backgroundColor: 'rgba(21,66,18,0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 0
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });
}

function switchCrop(crop) {
  activeCrop = crop;
  document.getElementById('btn-cotton').className = crop === 'cotton'
    ? "px-3 py-1 bg-surface-container-lowest shadow-sm rounded-md font-label-sm text-label-sm text-on-surface"
    : "px-3 py-1 text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-variant rounded-md transition-colors";
  document.getElementById('btn-onion').className = crop === 'onion'
    ? "px-3 py-1 bg-surface-container-lowest shadow-sm rounded-md font-label-sm text-label-sm text-on-surface"
    : "px-3 py-1 text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-variant rounded-md transition-colors";
  loadForecastChart(crop);
  loadRecommendation();
}

loadPriceCard('onion', 'price-onion', 'change-onion-icon', 'change-onion-text');
loadPriceCard('tomato', 'price-tomato', 'change-tomato-icon', 'change-tomato-text');
loadPriceCard('cotton', 'price-cotton', 'change-cotton-icon', 'change-cotton-text');
loadRecommendation();
loadForecastChart(activeCrop);