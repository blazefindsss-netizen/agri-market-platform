document.getElementById('submitLotBtn').addEventListener('click', async () => {
  const user_id = localStorage.getItem('user_id');
  if (!user_id) {
    document.getElementById('submitStatus').innerText = 'Please log in first.';
    return;
  }

  const crop = document.getElementById('cropType').value;
  const quantity = parseFloat(document.getElementById('quantity').value);
  const expected_price = parseFloat(document.getElementById('expectedPrice').value);
  const location = document.getElementById('location').value;

  if (!crop || !quantity || !expected_price || !location) {
    document.getElementById('submitStatus').innerText = 'Please fill in all fields.';
    return;
  }

  const checkedCount = document.querySelectorAll('.grade-check:checked').length;
  const quality_grade = checkedCount === 3 ? 'A' : checkedCount >= 1 ? 'B' : 'C';

  const result = await apiCall('/listings', 'POST', {
    user_id: parseInt(user_id),
    crop, quantity, expected_price, location, quality_grade
  });

  if (result.id) {
    localStorage.setItem('last_listing_id', result.id);
    document.getElementById('submitStatus').innerText = `Lot created successfully (Grade ${quality_grade}). Redirecting...`;
    setTimeout(() => window.location.href = 'buyer-market.html', 1200);
  } else {
    document.getElementById('submitStatus').innerText = 'Something went wrong — please try again.';
  }
});