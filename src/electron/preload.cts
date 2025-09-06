import type { EventPayloadMapping, Settings } from '@/types/electron.d.ts';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    settings: {
        get: () => ipcRendererInvoke('settings:get'),
        save: (settings) => ipcRendererSend('settings:save', settings),
    },
} satisfies Window['api']);

export function ipcRendererInvoke<Key extends keyof EventPayloadMapping>(
    key: Key
): Promise<EventPayloadMapping[Key]> {
    return ipcRenderer.invoke(key);
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
