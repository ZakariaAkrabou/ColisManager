import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";

const STORAGE_KEY = "app-language";

type AppLanguage = "en" | "fr" | "ar";

const getInitialLanguage = (): AppLanguage => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "fr" || saved === "ar") {
        return saved;
    }

    return "fr";
};

const applyDocumentLanguage = (lang: AppLanguage) => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
};

const initialLanguage = getInitialLanguage();

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        fr: { translation: fr },
        ar: { translation: ar },
    },
    lng: initialLanguage,
    fallbackLng: "fr",
    interpolation: {
        escapeValue: false,
    },
});

applyDocumentLanguage(initialLanguage);

i18n.on("languageChanged", (lang) => {
    if (lang === "en" || lang === "fr" || lang === "ar") {
        localStorage.setItem(STORAGE_KEY, lang);
        applyDocumentLanguage(lang);
    }
});

export default i18n;
