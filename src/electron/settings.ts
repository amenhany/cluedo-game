import ElectronStore, { Schema } from 'electron-store';
import type { Settings } from '@/types/electron.d.ts';

const defaults: Settings = {
    masterVolume: 1,
    musicVolume: 1,
    sfxVolume: 1,
    fullscreen: true,
    lang: 'en',
    filter: 'none',
};

const schema: Schema<Settings> = {
    masterVolume: { type: 'number', maximum: 1, minimum: 0 },
    musicVolume: { type: 'number', maximum: 1, minimum: 0 },
    sfxVolume: { type: 'number', maximum: 1, minimum: 0 },
    fullscreen: { type: 'boolean' },
    lang: { type: 'string', enum: ['en', 'ar'] },
    filter: { type: 'string', enum: ['none', 'b&w'] },
};

const storage = new ElectronStore<Settings>({ schema, defaults });

export function saveSettings(settings: Partial<Settings>) {
    Object.entries(settings).forEach(([setting, value]) => {
        storage.set(setting, value);
    });
}

export function getSetting<K extends keyof Settings>(setting: K): Settings[K] {
    return storage.get(setting, defaults[setting]);
}

export function getAllSettings() {
    return storage.store;
}
