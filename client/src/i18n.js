// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.projects': 'Projects',
      'nav.dashboard': 'Dashboard',
      'nav.profile': 'Profile',
      'nav.login': 'Login',
      'nav.register': 'Register',
      'nav.logout': 'Logout',
      
      // Home Page
      'home.title': 'Persian Community Translation Hub',
      'home.subtitle': 'Collaborate to translate videos and articles into Persian',
      'home.cta': 'Get Started',
      'home.features.subtitle': 'Subtitle Translation',
      'home.features.subtitleDesc': 'Add Persian subtitles to videos with our intuitive editor',
      'home.features.article': 'Article Translation',
      'home.features.articleDesc': 'Translate articles with side-by-side editing interface',
      'home.features.collaborate': 'Real-time Collaboration',
      'home.features.collaborateDesc': 'Work together with other translators in real-time',
      
      // Projects
      'projects.title': 'Translation Projects',
      'projects.type.video': 'Video Subtitles',
      'projects.type.article': 'Article Translation',
      'projects.status.active': 'Active',
      'projects.status.completed': 'Completed',
      'projects.status.review': 'Under Review',
      'projects.join': 'Join Project',
      'projects.continue': 'Continue',
      
      // Common
      'common.loading': 'Loading...',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.submit': 'Submit',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.search': 'Search',
      
      // Auth
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.fullName': 'Full Name',
      'auth.username': 'Username',
      'auth.persianLevel': 'Persian Language Level',
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.alreadyHaveAccount': 'Already have an account?',
      'auth.dontHaveAccount': "Don't have an account?",
      
      // Errors
      'error.general': 'Something went wrong',
      'error.network': 'Network error occurred',
      'error.unauthorized': 'Unauthorized access',
    }
  },
  fa: {
    translation: {
      // Navigation
      'nav.home': 'خانه',
      'nav.projects': 'پروژه‌ها',
      'nav.dashboard': 'داشبورد',
      'nav.profile': 'پروفایل',
      'nav.login': 'ورود',
      'nav.register': 'ثبت‌نام',
      'nav.logout': 'خروج',
      
      // Home Page
      'home.title': 'مرکز ترجمه جامعه فارسی',
      'home.subtitle': 'برای ترجمه ویدئوها و مقالات به فارسی همکاری کنید',
      'home.cta': 'شروع کنید',
      'home.features.subtitle': 'ترجمه زیرنویس',
      'home.features.subtitleDesc': 'با ادیتور آسان ما زیرنویس فارسی برای ویدئوها اضافه کنید',
      'home.features.article': 'ترجمه مقاله',
      'home.features.articleDesc': 'مقالات را با رابط ویرایش کنار هم ترجمه کنید',
      'home.features.collaborate': 'همکاری لحظه‌ای',
      'home.features.collaborateDesc': 'با سایر مترجمان به صورت لحظه‌ای همکاری کنید',
      
      // Projects
      'projects.title': 'پروژه‌های ترجمه',
      'projects.type.video': 'زیرنویس ویدئو',
      'projects.type.article': 'ترجمه مقاله',
      'projects.status.active': 'فعال',
      'projects.status.completed': 'تکمیل شده',
      'projects.status.review': 'در حال بررسی',
      'projects.join': 'پیوستن به پروژه',
      'projects.continue': 'ادامه',
      
      // Common
      'common.loading': 'در حال بارگذاری...',
      'common.save': 'ذخیره',
      'common.cancel': 'لغو',
      'common.submit': 'ارسال',
      'common.edit': 'ویرایش',
      'common.delete': 'حذف',
      'common.search': 'جستجو',
      
      // Auth
      'auth.email': 'ایمیل',
      'auth.password': 'رمز عبور',
      'auth.confirmPassword': 'تکرار رمز عبور',
      'auth.fullName': 'نام کامل',
      'auth.username': 'نام کاربری',
      'auth.persianLevel': 'سطح زبان فارسی',
      'auth.login': 'ورود',
      'auth.register': 'ثبت‌نام',
      'auth.forgotPassword': 'رمز عبور را فراموش کرده‌اید؟',
      'auth.alreadyHaveAccount': 'از قبل حساب دارید؟',
      'auth.dontHaveAccount': 'حساب ندارید؟',
      
      // Errors
      'error.general': 'خطایی رخ داد',
      'error.network': 'خطای شبکه رخ داد',
      'error.unauthorized': 'دسترسی غیرمجاز',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Add RTL/LTR class to body based on language
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'fa' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lng);
  
  // Update body classes for font families
  if (lng === 'fa') {
    document.body.classList.add('font-persian');
    document.body.classList.remove('font-english');
  } else {
    document.body.classList.add('font-english');
    document.body.classList.remove('font-persian');
  }
});

export default i18n;