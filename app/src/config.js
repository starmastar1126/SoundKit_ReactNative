export const API_KEY = "fskfsdkfjhsdkjh";
export const WEBSITE = "https://music.krea8iv.com/demo/";
export const BASE_URL = WEBSITE + "api/" + API_KEY + "/";
export const DEFAULT_LANG = "en";
export const DEFAULT_THEME = "dark";
export const DEFAULT_HOME = "feed";//it can be feed or explore
export const PUBLIC_ACCESS = true;
export const STORE_MODULE = true;
export const VIDEO_MODULE = true;
export const ENABLE_PREMIUM = true;
export const ENABLE_RADIO_PLUGIN = true;
export const ENABLE_BLOG_PLUGIN = true;
export const ENABLE_FB_LOGIN = true;
export const YEARLYPRODUCT_ID = "";
export const MONTHLYPRODUCT_ID = "";

/**
 * Track access determine what should be done when user don't have access to play track
 * 1 - Can play all tracks with sold track
 * 2 - Cannot play sold tracks unless he's a premium listener or have purchase the track
 * @type {number}
 */
export const TRACK_PLAY_ACCESS = 1;
export const ENABLEDUMMY = false;
export const BASE_CURRENCY = '$';
export const ADMOB_ID = '';
export const CONTACT_LINK = "https://music.krea8iv.com/demo/contact";
export const PRIVACY_LINK = "https://music.krea8iv.com/demo/privacy";
export const TERMS_LINK = "https://music.krea8iv.com/demo/terms";
export const APP_LINK = "https://music.krea8iv.com/demo";
export const LANGUAGES = [
    {key : 'en', name : 'English ', icon : require('./images/flags/en.png')},
    {key : 'de', name : 'German', icon : require('./images/flags/de.png')},
    {key : 'es', name : 'Spanish', icon : require('./images/flags/es.png')},
    {key : 'fr', name : 'French', icon : require('./images/flags/fr.png')},
    {key : 'it', name : 'Italian', icon : require('./images/flags/it.png')},
    {key : 'ja', name : 'Japanese', icon : require('./images/flags/ja.png')},
    {key : 'nl', name : 'Dutch', icon : require('./images/flags/nl.png')},
    {key : 'pl', name : 'Polish', icon : require('./images/flags/pl.png')},
    {key : 'pt', name : 'Portuguese', icon : require('./images/flags/pt.png')},
    {key : 'ru', name : 'Russian ', icon : require('./images/flags/ru.png')}
];
