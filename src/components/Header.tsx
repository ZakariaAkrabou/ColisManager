import { Menu, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { t, i18n } = useTranslation();

  const localeMap: Record<string, string> = {
    fr: "fr-FR",
    en: "en-GB",
    ar: "ar-MA",
  };

  const dateLocale = localeMap[i18n.language] ?? "fr-FR";

  const isActiveLanguage = (lang: "ar" | "fr" | "en") => i18n.language === lang;

  return (
    <header className="h-15 bg-brand-orange text-white flex items-center justify-between px-4 md:px-6 shadow-md z-10 sticky top-0 shrink-0 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex items-center gap-2 md:gap-4 text-base md:text-lg font-semibold">
        <button
          className="bg-transparent border-none text-white cursor-pointer flex items-center justify-center p-1.5 rounded hover:bg-white/20 transition-colors dark:hover:bg-white/10"
          onClick={onToggleSidebar}
        >
          <Menu size={24} />
        </button>
        <span className="hidden sm:inline">{t("header.appNameFull")}</span>
        <span className="sm:hidden">{t("header.appNameShort")}</span>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-2 md:gap-3 text-sm">
          <span className="hidden md:inline opacity-90 dark:text-slate-200">
            {t("header.language")}
          </span>
          <button
            type="button"
            onClick={() => i18n.changeLanguage("ar")}
            className={`fi fi-sa text-xl md:text-2xl rounded-sm overflow-hidden cursor-pointer hover:scale-110 transition-transform shadow-sm ${isActiveLanguage("ar") ? "ring-2 ring-white/80" : ""}`}
            title={t("common.arabic")}
            aria-label={t("common.arabic")}
          />
          <button
            type="button"
            onClick={() => i18n.changeLanguage("fr")}
            className={`fi fi-fr text-xl md:text-2xl rounded-sm overflow-hidden cursor-pointer hover:scale-110 transition-transform shadow-sm ${isActiveLanguage("fr") ? "ring-2 ring-white/80" : ""}`}
            title={t("common.french")}
            aria-label={t("common.french")}
          />
          <button
            type="button"
            onClick={() => i18n.changeLanguage("en")}
            className={`fi fi-gb text-xl md:text-2xl rounded-sm overflow-hidden cursor-pointer hover:scale-110 transition-transform shadow-sm ${isActiveLanguage("en") ? "ring-2 ring-white/80" : ""}`}
            title={t("common.english")}
            aria-label={t("common.english")}
          />
        </div>

        <div className="hidden sm:flex text-sm font-medium opacity-95 items-center gap-2 dark:text-slate-200">
          <span>
            {new Date().toLocaleDateString(dateLocale, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <Calendar size={18} />
        </div>
      </div>
    </header>
  );
}
