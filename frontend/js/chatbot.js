// Creates a floating chat widget in the bottom-left corner (bottom-right is taken by Google Translate)
const chatBubble = document.createElement('div');
chatBubble.innerHTML = `
  <div id="chatToggleBtn" style="position:fixed; bottom:16px; left:16px; z-index:9999; background:#154212; color:white; width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.3); font-size:26px;">💬</div>
  <div id="chatWindow" style="display:none; position:fixed; bottom:80px; left:16px; z-index:9999; width:320px; max-height:420px; background:white; border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.2); overflow:hidden; flex-direction:column;">
    <div style="background:#154212; color:white; padding:12px 16px; font-weight:600;">AgriHarvest Assistant</div>
    <div id="chatMessages" style="flex:1; overflow-y:auto; padding:12px; height:280px; font-size:14px;"></div>
    <div style="display:flex; border-top:1px solid #eee; padding:8px; gap:6px;">
      <input id="chatInput" placeholder="Ask a question..." style="flex:1; border:1px solid #ccc; border-radius:6px; padding:8px; font-size:13px;">
      <button id="chatMicBtn" style="background:#f0f0f0; border:none; border-radius:6px; padding:8px 10px; cursor:pointer;">🎤</button>
      <button id="chatSendBtn" style="background:#154212; color:white; border:none; border-radius:6px; padding:8px 12px; cursor:pointer;">Send</button>
    </div>
  </div>
`;
document.body.appendChild(chatBubble);

document.getElementById('chatToggleBtn').addEventListener('click', () => {
  const win = document.getElementById('chatWindow');
  win.style.display = win.style.display === 'none' ? 'flex' : 'none';
});

function addChatMessage(text, sender) {
  const messages = document.getElementById('chatMessages');
  const bubble = document.createElement('div');
  bubble.style.margin = '6px 0';
  bubble.style.padding = '8px 10px';
  bubble.style.borderRadius = '8px';
  bubble.style.maxWidth = '85%';
  bubble.innerText = text;
  if (sender === 'user') {
    bubble.style.background = '#e8f3ec';
    bubble.style.marginLeft = 'auto';
  } else {
    bubble.style.background = '#f3f4f5';
  }
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  addChatMessage(text, 'user');
  input.value = '';

  const res = await fetch('http://127.0.0.1:5000/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  });
  const data = await res.json();
  addChatMessage(data.reply, 'bot');
  if (typeof speakText === 'function') speakText(data.reply, 'en-IN');
}

document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
document.getElementById('chatInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendChatMessage();
});
document.getElementById('chatMicBtn').addEventListener('click', () => {
  if (typeof startVoiceInput === 'function') startVoiceInput('chatInput', 'en-IN');
});

addChatMessage("Hi! Ask me about crop prices, listing produce, or finding buyers.", 'bot');