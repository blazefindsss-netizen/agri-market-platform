// Creates a floating language selector, bottom-right of every page
const translateContainer = document.createElement('div');
translateContainer.id = 'google_translate_element';
translateContainer.style.position = 'fixed';
translateContainer.style.bottom = '16px';
translateContainer.style.right = '16px';
translateContainer.style.zIndex = '9999';
translateContainer.style.background = 'white';
translateContainer.style.borderRadius = '10px';
translateContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
translateContainer.style.padding = '4px 8px';
document.body.appendChild(translateContainer);

window.googleTranslateElementInit = function () {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'hi,mr,ta,te,kn,gu,pa,bn,en', // Hindi, Marathi, Tamil, Telugu, Kannada, Gujarati, Punjabi, Bengali, English
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
  }, 'google_translate_element');
};

const gtScript = document.createElement('script');
gtScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
document.body.appendChild(gtScript);