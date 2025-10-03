import en from '@/assets/lang/en.json';
import ar from '@/assets/lang/ar.json';

// builtin language packs
const LANGS: Record<Lang, Record<string, string>> = { en, ar };

let currentLang: Lang = 'en';

export function setLang(lang: Lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
}

export function t(id: string, vars?: Record<string, string | number>): string {
    const pack = LANGS[currentLang];
    let text = pack[id] ?? id;

    if (vars) {
        for (const [key, value] of Object.entries(vars)) {
            text = text.replaceAll(`{${key}}`, String(value));
        }
    }

    return text;
}
