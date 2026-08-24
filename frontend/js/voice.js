// Text-to-speech: reads any text aloud in the browser's chosen language
function speakText(text, lang = 'en-IN') {
  if (!('speechSynthesis' in window)) {
    alert('Voice output is not supported in this browser.');
    return;
  }
  window.speechSynthesis.cancel(); // stop any currently playing speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // slightly slower, easier to understand
  window.speechSynthesis.speak(utterance);
}

// Speech-to-text: converts spoken words into text, fills a given input field
function startVoiceInput(targetInputId, lang = 'en-IN') {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Voice input is not supported in this browser. Try Chrome.');
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById(targetInputId);
    if (input) input.value = transcript;
  };

  recognition.onerror = (event) => {
    console.error('Voice input error:', event.error);
  };

  recognition.start();
}