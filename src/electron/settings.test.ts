import { describe, it, expect, vi, beforeEach } from 'vitest';
import Store from 'electron-store';
import { saveSettings, getSetting, getAllSettings } from './settings.js';

// Mock electron-store
vi.mock('electron-store', () => {
    const defaults = {
        masterVolume: 1,
        musicVolume: 1,
        sfxVolume: 1,
        fullscreen: true,
        lang: 'en',
        filter: 'none',
    };

    const store: Record<string, any> = { ...defaults };

    return {
        default: vi.fn(() => ({
            set: (key: string, value: any) => {
                store[key] = value;
            },
            get: (key: string, defaultValue: any) => {
                return store[key] ?? defaultValue;
            },
            store,
        })),
    };
});

describe('Settings Storage', () => {
    let storeInstance: any;

    beforeEach(() => {
        vi.clearAllMocks();
        storeInstance = new (Store as any)();
    });

    it('returns default value if key not set', () => {
        const value = getSetting('masterVolume');
        expect(value).toBe(1);
    });

    it('returns stored value if key is set', () => {
        saveSettings({ musicVolume: 0.7 });
        const value = getSetting('musicVolume');
        expect(value).toBe(0.7);
    });

    it('saves multiple settings correctly', () => {
        saveSettings({ sfxVolume: 0.5, fullscreen: false });
        expect(getSetting('sfxVolume')).toBe(0.5);
        expect(getSetting('fullscreen')).toBe(false);
    });

    it('retrieves all settings', () => {
        const all = getAllSettings();
        expect(all).toEqual(storeInstance.store);
    });

    it('handles string settings like lang and filter', () => {
        saveSettings({ lang: 'ar', filter: 'b&w' });
        expect(getSetting('lang')).toBe('ar');
        expect(getSetting('filter')).toBe('b&w');
    });
});
