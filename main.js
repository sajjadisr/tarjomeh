// script.js

// DOM Elements
const sourceLangSelect = document.getElementById('source-lang');
const targetLangSelect = document.getElementById('target-lang');
const sourceText = document.getElementById('source-text');
const translatedText = document.getElementById('translated-text');
const translateBtn = document.getElementById('translate-btn');
const swapBtn = document.getElementById('swap-languages');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const body = document.body;

// Sample translations for demonstration
// In a real app, this would be replaced with API calls
const sampleTranslations = {
    en: {
        "Hello": "سلام",
        "Good morning": "صبح بخیر",
        "How are you?": "حالت چطوره؟",
        "Thank you": "ممنونم",
        "Goodbye": "خداحافظ",
        "Welcome": "خوش آمدید",
        "Please": "لطفاً",
        "Yes": "بله",
        "No": "نه",
        "I love programming": "من برنامه نویسی را دوست دارم"
    },
    fa: {
        "سلام": "Hello",
        "صبح بخیر": "Good morning",
        "حالت چطوره؟": "How are you?",
        "ممنونم": "Thank you",
        "خداحافظ": "Goodbye",
        "خوش آمدید": "Welcome",
        "لطفاً": "Please",
        "بله": "Yes",
        "نه": "No",
        "من برنامه نویسی را دوست دارم": "I love programming"
    }
};

// Set initial language directions
function setDirection() {
    const sourceLang = sourceLangSelect.value;
    const targetLang = targetLangSelect.value;
    
    // Set text direction for input and output
    sourceText.dir = sourceLang === 'fa' ? 'rtl' : 'ltr';
    translatedText.dir = targetLang === 'fa' ? 'rtl' : 'ltr';
    
    // Set body direction based on primary language
    body.dir = sourceLang === 'fa' ? 'rtl' : 'ltr';
}

// Swap languages
function swapLanguages() {
    const tempLang = sourceLangSelect.value;
    sourceLangSelect.value = targetLangSelect.value;
    targetLangSelect.value = tempLang;
    
    const tempText = sourceText.value;
    sourceText.value = translatedText.value;
    translatedText.value = tempText;
    
    setDirection();
}

// Translate text
function translateText() {
    const sourceLang = sourceLangSelect.value;
    const text = sourceText.value.trim();
    
    if (!text) {
        translatedText.value = '';
        return;
    }
    
    // In a real app, this would call a translation API
    // For demo purposes, we'll use our sample translations
    const translations = sampleTranslations[sourceLang];
    
    if (translations && translations[text]) {
        translatedText.value = translations[text];
    } else {
        // Simple word-by-word translation for demo
        const words = text.split(' ');
        const translatedWords = words.map(word => {
            return translations && translations[word] ? translations[word] : `[${word}]`;
        });
        
        translatedText.value = translatedWords.join(' ');
    }
}

// Clear all text fields
function clearAll() {
    sourceText.value = '';
    translatedText.value = '';
    sourceText.focus();
}

// Copy translation to clipboard
function copyTranslation() {
    if (!translatedText.value) return;
    
    translatedText.select();
    document.execCommand('copy');
    
    // Visual feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

// Event Listeners
sourceLangSelect.addEventListener('change', () => {
    // Ensure target language is different
    if (sourceLangSelect.value === targetLangSelect.value) {
        targetLangSelect.value = sourceLangSelect.value === 'en' ? 'fa' : 'en';
    }
    setDirection();
});

targetLangSelect.addEventListener('change', () => {
    // Ensure source language is different
    if (targetLangSelect.value === sourceLangSelect.value) {
        sourceLangSelect.value = targetLangSelect.value === 'en' ? 'fa' : 'en';
    }
    setDirection();
});

translateBtn.addEventListener('click', translateText);
swapBtn.addEventListener('click', swapLanguages);
clearBtn.addEventListener('click', clearAll);
copyBtn.addEventListener('click', copyTranslation);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setDirection();
    sourceText.focus();
});

// Handle Enter key for translation (with Shift for new line)
sourceText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        translateText();
    }
});