// Floating account pill, top-right corner, shown on every logged-in page
const role = localStorage.getItem('role');
const userId = localStorage.getItem('user_id');

if (role && userId) {
  const pill = document.createElement('div');
  pill.style.cssText = `
    position:fixed; top:16px; right:16px; z-index:9998;
    background:white; border-radius:20px; padding:8px 14px;
    box-shadow:0 2px 8px rgba(0,0,0,0.15); font-size:13px;
    display:flex; align-items:center; gap:10px; font-family:sans-serif;
  `;
  pill.innerHTML = `
    <span style="color:#154212; font-weight:600;">${role === 'farmer' ? '🌾' : '🏬'} ${role.charAt(0).toUpperCase() + role.slice(1)} #${userId}</span>
    <button id="logoutBtn" style="background:#ba1a1a; color:white; border:none; border-radius:12px; padding:4px 10px; font-size:12px; cursor:pointer;">Logout</button>
  `;
  document.body.appendChild(pill);

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
  });
}