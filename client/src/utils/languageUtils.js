// src/utils/languageUtils.js

/**
 * Persian/Farsi Unicode ranges for text detection
 */
const PERSIAN_RANGES = [
  [0x0600, 0x06FF], // Arabic
  [0x0750, 0x077F], // Arabic Supplement  
  [0xFB50, 0xFDFF], // Arabic Presentation Forms-A
  [0xFE70, 0xFEFF], // Arabic Presentation Forms-B
];

/**
 * Detects if a language code is RTL
 * @param {string} lang - Language code (e.g., 'fa', 'en')
 * @returns {boolean}
 */
export const isRTL = (lang) => {
  const rtlLanguages = ['fa', 'ar', 'he', 'ur', 'ps', 'sd'];
  return rtlLanguages.includes(lang?.toLowerCase());
};

/**
 * Detects if text contains Persian characters
 * @param {string} text - Text to analyze
 * @returns {boolean}
 */
export const containsPersian = (text) => {
  if (!text) return false;
  
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    for (let [start, end] of PERSIAN_RANGES) {
      if (charCode >= start && charCode <= end) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Auto-detects text direction based on content
 * @param {string} text - Text to analyze
 * @returns {'rtl' | 'ltr'}
 */
export const detectTextDirection = (text) => {
  return containsPersian(text) ? 'rtl' : 'ltr';
};

/**
 * Gets appropriate CSS classes for RTL/LTR layouts
 * @param {string} direction - 'rtl' or 'ltr'
 * @returns {string} - Tailwind CSS classes
 */
export const getDirectionClasses = (direction = 'ltr') => {
  const isRtl = direction === 'rtl';
  
  return {
    text: isRtl ? 'text-right' : 'text-left',
    margin: isRtl ? 'mr-4' : 'ml-4',
    padding: isRtl ? 'pr-4' : 'pl-4',
    border: isRtl ? 'border-r' : 'border-l',
    float: isRtl ? 'float-right' : 'float-left',
    clear: isRtl ? 'clear-right' : 'clear-left',
  };
};

/**
 * Formats time for subtitle display (supports both formats)
 * @param {number} seconds - Time in seconds
 * @param {string} format - 'srt' | 'vtt' | 'readable'
 * @returns {string} - Formatted time string
 */
export const formatTime = (seconds, format = 'readable') => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  switch (format) {
    case 'srt':
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
    case 'vtt':
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    case 'readable':
    default:
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

/**
 * Parses time string to seconds
 * @param {string} timeString - Time string in various formats
 * @returns {number} - Time in seconds
 */
export const parseTime = (timeString) => {
  if (!timeString) return 0;
  
  // Handle different time formats
  const timeRegex = /(\d{1,2}):(\d{2}):(\d{2})[.,]?(\d{0,3})?/;
  const match = timeString.match(timeRegex);
  
  if (match) {
    const [, hours, minutes, seconds, milliseconds = '0'] = match;
    return parseInt(hours) * 3600 + 
           parseInt(minutes) * 60 + 
           parseInt(seconds) + 
           parseInt(milliseconds.padEnd(3, '0')) / 1000;
  }
  
  return 0;
};

/**
 * Validates Persian text quality
 * @param {string} text - Persian text to validate
 * @returns {Object} - Validation result with suggestions
 */
export const validatePersianText = (text) => {
  const issues = [];
  const suggestions = [];
  
  if (!containsPersian(text)) {
    issues.push('no-persian');
    suggestions.push('Text should contain Persian characters');
  }
  
  // Check for common issues
  if (text.includes('ي')) {
    issues.push('wrong-yeh');
    suggestions.push('Use Persian ی instead of Arabic ي');
  }
  
  if (text.includes('ك')) {
    issues.push('wrong-kaf');
    suggestions.push('Use Persian ک instead of Arabic ك');
  }
  
  // Check for mixed directions (simplified)
  const hasEnglish = /[a-zA-Z]/.test(text);
  const hasPersian = containsPersian(text);
  
  if (hasEnglish && hasPersian) {
    issues.push('mixed-script');
    suggestions.push('Consider proper handling of mixed English-Persian text');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
    score: Math.max(0, 100 - (issues.length * 25))
  };
};

/**
 * Cleans and normalizes Persian text
 * @param {string} text - Text to clean
 * @returns {string} - Cleaned text
 */
export const cleanPersianText = (text) => {
  if (!text) return '';
  
  return text
    // Replace Arabic characters with Persian equivalents
    .replace(/ي/g, 'ی')  // Arabic yeh -> Persian yeh
    .replace(/ك/g, 'ک')  // Arabic kaf -> Persian kaf
    .replace(/ء/g, 'ٔ')   // Arabic hamza -> Persian hamza
    // Remove extra whitespaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Estimates reading time for Persian text
 * @param {string} text - Persian text
 * @returns {number} - Estimated reading time in seconds
 */
export const estimateReadingTime = (text) => {
  if (!text) return 0;
  
  const wordCount = text.trim().split(/\s+/).length;
  // Average Persian reading speed: ~150 words per minute
  const wordsPerSecond = 150 / 60;
  
  return Math.max(2, Math.ceil(wordCount / wordsPerSecond));
};

/**
 * Gets language-specific CSS font family
 * @param {string} lang - Language code
 * @returns {string} - CSS font family
 */
export const getFontFamily = (lang) => {
  switch (lang) {
    case 'fa':
      return 'font-persian';
    case 'ar':
      return 'font-arabic';
    default:
      return 'font-english';
  }
};

export default {
  isRTL,
  containsPersian,
  detectTextDirection,
  getDirectionClasses,
  formatTime,
  parseTime,
  validatePersianText,
  cleanPersianText,
  estimateReadingTime,
  getFontFamily,
};