// client/src/utils/languageUtils.js

/**
 * Detects if a language is RTL (Right-to-Left)
 * @param {string} lang - Language code (e.g., 'fa', 'en')
 * @returns {boolean}
 */
export const isRTL = (lang) => {
  return ['fa', 'ar', 'he', 'ur'].includes(lang);
};