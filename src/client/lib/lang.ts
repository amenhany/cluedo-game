import en from '@/assets/lang/en.json';
import ar from '@/assets/lang/ar.json';

export type Lang = 'en' | 'ar';

// builtin language packs
const LANGS: Record<Lang, Record<string, string>> = { en, ar };

let currentLang: Lang = 'en';

export function setLang(lang: Lang) {
    currentLang = lang;
}

export function t(id: string): string {
    const pack = LANGS[currentLang];
    return pack[id] ?? id; // fallback to id if not found
}
