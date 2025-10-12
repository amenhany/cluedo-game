import type { EventPayloadMapping } from '@/types/electron.d.ts';
const { contextBridge, ipcRenderer } = require('electron');

export function ipcRendererInvoke<Key extends keyof EventPayloadMapping>(
    key: Key,
    payload?: EventPayloadMapping[Key]
): Promise<any> {
    return ipcRenderer.invoke(key, payload);
}

export function ipcRendererOn<Key extends keyof EventPayloadMapping>(
    key: Key,
    callback: (payload: EventPayloadMapping[Key]) => void
) {
    const cb = (_: Electron.IpcRendererEvent, payload: EventPayloadMapping[Key]) =>
        callback(payload);
    ipcRenderer.on(key, cb);
    return () => ipcRenderer.off(key, cb);
}

export function ipcRendererSend<Key extends keyof EventPayloadMapping>(
    key: Key,
    payload: EventPayloadMapping[Key]
) {
    ipcRenderer.send(key, payload);
}

contextBridge.exposeInMainWorld('api', {
    settings: {
        get: () => ipcRendererInvoke('settings:get'),
        save: (settings) => ipcRendererSend('settings:save', settings),
    },
    game: {
        isPortAvailable: (port) => ipcRenderer.invoke('game:is-port-available', port),
        startServer: (options) => ipcRenderer.invoke('game:start-server', options),
        closeServer: () => ipcRenderer.send('game:close-server'),
        wipeMatch: (matchID) => ipcRendererSend('game:wipe-match', matchID),
    },
} satisfies Window['api']);
