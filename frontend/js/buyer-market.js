const listingId = localStorage.getItem('last_listing_id');

function renderCard(match, isBest) {
  return `
  <div class="bg-surface-container-lowest rounded-xl shadow-sm ${isBest ? 'shadow-lg border-t-2 border-primary' : 'border border-outline-variant'} overflow-hidden relative hover:shadow-md transition-shadow duration-200">
    ${isBest ? `<div class="absolute top-4 right-4 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1 z-10 shadow-sm"><span class="material-symbols-outlined text-[14px]">star</span>Best Match</div>` : ''}
    <div class="p-6 pb-4">
      <div class="flex items-start gap-4 mb-6">
        <div class="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant">
          <span class="material-symbols-outlined text-primary">storefront</span>
        </div>
        <div>
          <h3 class="font-headline-sm text-headline-sm text-on-surface">Buyer #${match.buyer_id}</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
            <span class="material-symbols-outlined text-[16px]">location_on</span>${match.location || 'Location not specified'}
          </p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-lg mb-6 border border-outline-variant">
        <div>
          <p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Required Crop</p>
          <p class="font-body-md text-body-md font-semibold text-on-surface mt-1">${match.crop}</p>
        </div>
        <div>
          <p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Volume Needed</p>
          <p class="font-body-md text-body-md font-semibold text-on-surface mt-1">${match.quantity_needed} kg</p>
        </div>
        <div class="col-span-2 pt-2 border-t border-outline-variant mt-2">
          <p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Target Price Range</p>
          <div class="flex items-baseline gap-2 mt-1">
            <p class="font-headline-md text-headline-md font-bold ${isBest ? 'text-primary' : 'text-on-surface'}">₹${match.price_range[0]}–₹${match.price_range[1]}</p>
          </div>
        </div>
      </div>
      <button class="w-full h-touch-target-min ${isBest ? 'bg-primary text-on-primary' : 'bg-transparent border-2 border-primary text-primary'} font-label-md text-label-md rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm send-offer-btn" data-demand-id="${match.demand_id}" data-price="${match.price_range[1]}">
        <span class="material-symbols-outlined text-[20px]">send</span>Send Offer
      </button>
    </div>
  </div>`;
}

async function loadMatches() {
  if (!listingId) {
    document.getElementById('noListingMsg').classList.remove('hidden');
    return;
  }

  const matches = await apiCall(`/matches/${listingId}`);
  const grid = document.getElementById('demandGrid');

  if (!matches.length) {
    document.getElementById('noMatchesMsg').classList.remove('hidden');
    return;
  }

  grid.innerHTML = matches.map((m, i) => renderCard(m, i === 0)).join('');

  document.querySelectorAll('.send-offer-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const demandId = btn.getAttribute('data-demand-id');
      const price = btn.getAttribute('data-price');
      await apiCall('/offers', 'POST', {
        listing_id: parseInt(listingId),
        demand_id: parseInt(demandId),
        offered_price: parseFloat(price)
      });
      btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span>Offer Sent';
      btn.disabled = true;
      btn.classList.add('opacity-60', 'cursor-not-allowed');
    });
  });
}

loadMatches();