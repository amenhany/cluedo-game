export type Settings = {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    fullscreen: boolean;
    lang: Lang;
    filter: Filter;
};

export type Packs = {
    selected: string;
};

export type EventPayloadMapping = {
    'settings:get': Settings;
    'settings:save': Partial<Settings>;
    'packs:get': Packs;
    'packs:set': Packs;
    'game:start-server': { port: number };
};
