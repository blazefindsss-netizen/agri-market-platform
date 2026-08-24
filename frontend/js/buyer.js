document.getElementById('buyerName').innerText = localStorage.getItem('user_id') ? 'Buyer #' + localStorage.getItem('user_id') : 'Guest';

document.getElementById('demandForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user_id = localStorage.getItem('user_id');
  await apiCall('/demands', 'POST', {
    user_id: parseInt(user_id),
    crop: document.getElementById('crop').value,
    quantity_needed: parseFloat(document.getElementById('quantity_needed').value),
    price_min: parseFloat(document.getElementById('price_min').value),
    price_max: parseFloat(document.getElementById('price_max').value),
    location: document.getElementById('location').value,
    quality_spec: 'A'
  });
  document.getElementById('demandForm').reset();
  loadMyDemands();
});

async function loadMyDemands() {
  const user_id = localStorage.getItem('user_id');
  const demands = await apiCall(`/demands/${user_id}`);
  document.getElementById('myDemands').innerHTML = demands.map(d => `
    <div class="card">
      <strong>${d.crop}</strong>
      <br>Need ${d.quantity_needed}kg — <span class="price">₹${d.price_min}-₹${d.price_max}</span>
    </div>
  `).join('') || '<p>No demands posted yet — use the form above.</p>';
}

async function loadOffers() {
  const user_id = localStorage.getItem('user_id');
  const offers = await apiCall(`/offers/buyer/${user_id}`);
  document.getElementById('offersArea').innerHTML = offers.map(o => `
    <div class="card">
      Offer <span class="price">₹${o.offered_price}</span> — <span class="badge ${o.status === 'accepted' ? 'open' : 'pending'}">${o.status}</span>
      ${o.status === 'offered' ? `
        <br><button onclick="respondToOffer(${o.id}, 'accepted')">Accept</button>
        <button onclick="respondToOffer(${o.id}, 'rejected')">Reject</button>
      ` : ''}
    </div>
  `).join('') || '<p>No offers yet.</p>';
}

async function respondToOffer(offerId, status) {
  await apiCall(`/offers/${offerId}/status`, 'PATCH', { status });
  loadOffers();
}

loadMyDemands();
loadOffers();