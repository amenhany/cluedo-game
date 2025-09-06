// SettingsProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { Settings } from '@/types/electron';
import { AudioManager } from '@/lib/AudioManager';
import { setLang } from '@/lib/lang';

type SettingsContextType = {
   settings: Settings | null;
   update: (partial: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
   const [settings, setSettings] = useState<Settings | null>(null);
   const audioManager = AudioManager.getInstance();

   useEffect(() => {
      (async () => {
         const all = await window.api.settings.get();
         setSettings(all);
         audioManager.setMasterVolume(all.masterVolume);
         audioManager.setMusicVolume(all.musicVolume);
         audioManager.setSfxVolume(all.sfxVolume);
         setLang(all.lang);
      })();
   }, []);

   const update = (partial: Partial<Settings>) => {
      if (!settings) return;
      const newSettings = { ...settings, ...partial };
      setSettings(newSettings);
      window.api.settings.save(partial);

      audioManager.setMasterVolume(newSettings.masterVolume);
      audioManager.setMusicVolume(newSettings.musicVolume);
      audioManager.setSfxVolume(newSettings.sfxVolume);
      setLang(newSettings.lang);
   };

   return (
      <SettingsContext.Provider value={{ settings, update }}>
         {children}
      </SettingsContext.Provider>
   );
}

export function useSettings() {
   const ctx = useContext(SettingsContext);
   if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
   return ctx;
}
