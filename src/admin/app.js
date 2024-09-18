// import AuthLogo from './assets/images/logo.png';

export default {
  config: {
    auth: { logo: "https://thaimerit.com/images/logo-big.png" },
    head: { favicon : "https://thaimerit.com/images/logo-big.png" },
    locales: [
      // 'ar',
      // 'fr',
      // 'cs',
      // 'de',
      // 'dk',
      // 'es',
      // 'he',
      // 'id',
      // 'it',
      // 'ja',
      // 'ko',
      // 'ms',
      // 'nl',
      // 'no',
      // 'pl',
      // 'pt-BR',
      // 'pt',
      // 'ru',
      // 'sk',
      // 'sv',
      // 'en',
      // 'th',
      // 'tr',
      // 'uk',
      // 'vi',
      // 'zh-Hans',
      // 'zh',
    ],
    translations: {
      en: {
        "app.components.LeftMenu.navbrand.title": "Thaimerit Dashboard",
        "Auth.form.welcome.subtitle": "Log in to your Thaimerit account",
        "Auth.form.welcome.title": "Welcome to Thaimerit Admin",
        "Auth.form.email.placeholder": "enter your email",
        "app.components.HomePage.welcomeBlock.content.again": "We hope you are making a merit on everyday",
      },
    },
  },
  bootstrap(app) {
    console.log(app);
  },
};
