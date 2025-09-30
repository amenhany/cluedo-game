import { app, BrowserWindow } from 'electron';

import path from 'path';
import { ipcMainHandle, ipcMainOn, isDev } from './util.js';
import { getPreloadPath } from './pathResolver.js';
import { getAllSettings, getSetting, saveSettings } from './settings.js';
import { Server, Origins } from 'boardgame.io/dist/cjs/server.js';
import { Cluedo } from '../game/index.js';

let serverInstance: ReturnType<typeof Server> | undefined;

app.on('ready', () => {
    const fullscreen = getSetting('fullscreen');

    const mainWindow = new BrowserWindow({
        fullscreen,
        fullscreenable: true,
        webPreferences: {
            preload: getPreloadPath(),
            contextIsolation: true,
            sandbox: false,
        },
    });

    mainWindow.on('enter-full-screen', () => saveSettings({ fullscreen: true }));
    mainWindow.on('leave-full-screen', () => saveSettings({ fullscreen: false }));

    ipcMainHandle('settings:get', () => getAllSettings());
    ipcMainOn('settings:save', (settings) => {
        saveSettings(settings);
        if (settings.fullscreen !== undefined)
            mainWindow.setFullScreen(settings.fullscreen);
    });

    ipcMainHandle('game:start-server', async ({ port }) => {
        if (serverInstance) {
            return { ok: false, message: 'Server already running' };
        }

        serverInstance = Server({
            games: [Cluedo],
            origins: Origins.LOCALHOST_IN_DEVELOPMENT,
        });

        await serverInstance.run({ port });

        return { ok: true, port };
    });

    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }
});
