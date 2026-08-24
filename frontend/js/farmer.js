document.getElementById('farmerName').innerText = localStorage.getItem('user_id') ? 'Farmer #' + localStorage.getItem('user_id') : 'Guest';

let chartInstance = null;

async function loadChart(crop) {
  const district = 'Nashik';
  const data = await apiCall(`/prices/${crop}?district=${district}`);

  if (chartInstance) chartInstance.destroy();

  const ctx = document.getElementById('priceChart');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: `${crop} price (${district})`,
        data: data.map(d => d.price),
        borderColor: '#4A7C59',
        backgroundColor: 'rgba(74,124,89,0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 0
      }]
    },
    options: {
      plugins: { legend: { labels: { font: { family: 'Inter' } } } },
      scales: {
        x: { ticks: { font: { family: 'JetBrains Mono', size: 10 } } },
        y: { ticks: { font: { family: 'JetBrains Mono', size: 10 } } }
      }
    }
  });

  const signal = await apiCall(`/prices/${crop}/signal?district=${district}`);
  const signalEl = document.getElementById('signalText');
  const arrow = signal.signal === 'rising' ? '▲' : '▼';
  signalEl.className = 'signal-card ' + (signal.signal || '');
  signalEl.innerHTML = signal.recommendation
    ? `<strong style="font-family:'JetBrains Mono'">${arrow}</strong> ${signal.recommendation}`
    : 'No recommendation available yet.';
}

document.getElementById('cropSelect').addEventListener('change', (e) => loadChart(e.target.value));
loadChart('onion');

document.getElementById('listingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user_id = localStorage.getItem('user_id');
  await apiCall('/listings', 'POST', {
    user_id: parseInt(user_id),
    crop: document.getElementById('crop').value,
    quantity: parseFloat(document.getElementById('quantity').value),
    expected_price: parseFloat(document.getElementById('expected_price').value),
    location: document.getElementById('location').value,
    quality_grade: 'A'
  });
  document.getElementById('listingForm').reset();
  loadMyListings();
});

async function loadMyListings() {
  const user_id = localStorage.getItem('user_id');
  const listings = await apiCall(`/listings/${user_id}`);
  document.getElementById('myListings').innerHTML = listings.map(l => `
    <div class="card">
      <strong>${l.crop}</strong> <span class="badge ${l.status}">${l.status}</span>
      <br>${l.quantity}kg @ <span class="price">₹${l.expected_price}</span>
      <br><button onclick="viewMatches(${l.id})">View matches</button>
    </div>
  `).join('') || '<p>No listings yet — create one above.</p>';
}

async function viewMatches(listingId) {
  const matches = await apiCall(`/matches/${listingId}`);
  document.getElementById('matchesArea').innerHTML = matches.map(m => `
    <div class="card">
      Buyer #${m.buyer_id} wants ${m.quantity_needed}kg of ${m.crop}
      <br>Offers <span class="price">₹${m.price_range[0]}–₹${m.price_range[1]}</span> · ${m.location}
      <br><button onclick="sendOffer(${listingId}, ${m.demand_id}, ${m.price_range[1]})">Send offer</button>
    </div>
  `).join('') || '<p>No matches found for this listing.</p>';
}

async function sendOffer(listingId, demandId, price) {
  await apiCall('/offers', 'POST', { listing_id: listingId, demand_id: demandId, offered_price: price });
  alert('Offer sent!');
}

loadMyListings();