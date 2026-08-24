const userId = localStorage.getItem('user_id');
let selectedOffer = null;

function statusBadge(status) {
  if (status === 'accepted') return `<span class="inline-flex items-center gap-1 bg-primary-fixed text-on-primary-fixed-variant px-2 py-1 rounded-full font-label-sm text-label-sm"><span class="material-symbols-outlined text-[16px]">check_circle</span>Accepted</span>`;
  if (status === 'rejected') return `<span class="inline-flex items-center gap-1 bg-error-container text-error px-2 py-1 rounded-full font-label-sm text-label-sm"><span class="material-symbols-outlined text-[16px]">cancel</span>Rejected</span>`;
  return `<span class="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-1 rounded-full font-label-sm text-label-sm"><span class="material-symbols-outlined text-[16px]">pending_actions</span>Awaiting Response</span>`;
}

function renderList(offers) {
  const container = document.getElementById('offerListContainer');
  container.innerHTML = offers.map(o => `
    <article class="bg-surface-container-lowest rounded-xl border ${selectedOffer && selectedOffer.id === o.id ? 'border-t-2 border-t-primary' : 'border-outline-variant'} shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-4 cursor-pointer hover:bg-surface-container-low transition-colors offer-card" data-offer-id="${o.id}">
      <div class="flex justify-between items-start">
        <div>
          <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Offer #${o.id}</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface mt-1">₹${o.offered_price}</h3>
        </div>
        ${statusBadge(o.status)}
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.offer-card').forEach(card => {
    card.addEventListener('click', () => {
      const offer = offers.find(o => o.id === parseInt(card.getAttribute('data-offer-id')));
      selectOffer(offer);
      renderList(offers);
    });
  });
}

function timelineStep(icon, title, desc, state) {
  // state: 'done' | 'active' | 'pending'
  const circle = state === 'done'
    ? `<div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10 mt-1 shadow-sm"><span class="material-symbols-outlined text-on-primary text-[14px]">check</span></div>`
    : state === 'active'
    ? `<div class="w-6 h-6 rounded-full bg-tertiary border-2 border-surface flex items-center justify-center z-10 mt-1 shadow-sm"><div class="w-2 h-2 rounded-full bg-on-tertiary animate-pulse"></div></div>`
    : `<div class="w-6 h-6 rounded-full bg-surface-variant border-2 border-outline-variant flex items-center justify-center z-10 mt-1"></div>`;

  return `
  <div class="flex gap-4 items-start relative timeline-item">
    <div class="timeline-line z-0"></div>
    ${circle}
    <div class="flex-1 ${state === 'pending' ? 'opacity-50' : ''}">
      <h4 class="font-label-md text-label-md text-on-surface">${title}</h4>
      <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">${desc}</p>
    </div>
  </div>`;
}

function selectOffer(offer) {
  selectedOffer = offer;
  document.getElementById('detailTitle').innerText = `Offer #${offer.id}`;
  document.getElementById('detailPrice').innerText = `₹${offer.offered_price}`;

  const actions = document.getElementById('actionButtons');
  if (offer.status === 'offered') {
    actions.innerHTML = `
      <button class="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary rounded-lg h-touch-target-min px-4 font-label-md text-label-md hover:opacity-90 transition-opacity" id="acceptBtn">
        <span class="material-symbols-outlined">check_circle</span>Accept Offer
      </button>
      <button class="flex-1 flex items-center justify-center gap-2 bg-transparent border-[1.5px] border-error text-error rounded-lg h-touch-target-min px-4 font-label-md text-label-md hover:bg-error-container transition-colors" id="rejectBtn">
        <span class="material-symbols-outlined">cancel</span>Reject
      </button>`;
    document.getElementById('acceptBtn').onclick = () => updateStatus(offer.id, 'accepted');
    document.getElementById('rejectBtn').onclick = () => updateStatus(offer.id, 'rejected');
  } else {
    actions.innerHTML = `<p class="font-body-sm text-body-sm text-on-surface-variant">This offer has been ${offer.status}.</p>`;
  }

  const timeline = document.getElementById('timelineContainer');
  timeline.innerHTML =
    timelineStep('send', 'Offer Sent', 'Digital offer created and sent to buyer.', 'done') +
    timelineStep('check', offer.status === 'accepted' ? 'Offer Accepted' : offer.status === 'rejected' ? 'Offer Rejected' : 'Awaiting Response',
      offer.status === 'accepted' ? 'Buyer confirmed the offer.' : offer.status === 'rejected' ? 'Buyer declined this offer.' : 'Waiting for buyer to respond.',
      offer.status === 'offered' ? 'active' : 'done') +
    timelineStep('local_shipping', 'Logistics & Delivery', 'Pickup and transport coordination.', 'pending') +
    timelineStep('payments', 'Payment Released', 'Funds transferred once delivery is confirmed.', 'pending');
}

async function loadOffers() {
  if (!userId) return;
  const offers = await apiCall(`/offers/buyer/${userId}`);
  if (!offers.length) {
    document.getElementById('noOffersMsg').classList.remove('hidden');
    return;
  }
  renderList(offers);
  selectOffer(offers[0]);
}

async function updateStatus(offerId, status) {
  await apiCall(`/offers/${offerId}/status`, 'PATCH', { status });
  loadOffers();
}

loadOffers();