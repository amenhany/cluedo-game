import type { Packs, Settings } from './electron';

export {};

declare global {
    type Filter = 'none' | 'b&w';
    type Lang = 'en' | 'ar';

    interface Window {
        api: {
            settings: {
                get(): Promise<Settings>;
                save(settings: Partial<Settings>): void;
            };
            packs?: {
                get(): Promise<Packs>;
                set(pack: Packs): void;
            };
            game: {
                isPortAvailable(port: number): Promise<boolean>;
                startServer(options: {
                    port: number;
                }): Promise<{ ok: boolean; port?: number; message?: string }>;
                closeServer(): void;
            };
        };
    }
}
