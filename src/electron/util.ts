import { ipcMain, WebContents, WebFrameMain } from 'electron';
import { pathToFileURL } from 'url';
import { getUiPath } from './pathResolver.js';
import type { EventPayloadMapping } from '@/types/electron.d.ts';

export function isDev(): boolean {
    return process.env.NODE_ENV === 'development';
}

export function ipcMainHandle<Key extends keyof EventPayloadMapping>(
    key: Key,
    handler: (payload: EventPayloadMapping[Key]) => EventPayloadMapping[Key]
) {
    ipcMain.handle(key, (event, payload) => {
        validateEventFrame(event.senderFrame);
        return handler(payload);
    });
}

export function ipcMainOn<Key extends keyof EventPayloadMapping>(
    key: Key,
    handler: (payload: EventPayloadMapping[Key]) => void
) {
    ipcMain.on(key, (event, payload: EventPayloadMapping[Key]) => {
        validateEventFrame(event.senderFrame);
        return handler(payload);
    });
}

export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(
    key: Key,
    webContents: WebContents,
    payload: EventPayloadMapping[Key]
) {
    webContents.send(key, payload);
}

export function validateEventFrame(frame: WebFrameMain | null) {
    if (frame && isDev() && new URL(frame.url).host === 'localhost:5123') return;
    if (frame?.url === pathToFileURL(getUiPath()).toString()) return;
    throw new Error('Malicious Event');
}
