import { app, BrowserWindow, Menu } from 'electron';

import path from 'path';
import net from 'net';
import { ipcMainHandle, ipcMainOn, isDev } from './util.js';
import { getPreloadPath } from './pathResolver.js';
import { getAllSettings, getSetting, saveSettings } from './settings.js';
import { Server, Origins } from 'boardgame.io/dist/cjs/server.js';
import { Cluedo } from '../game/index.js';
import { createMenu } from './menu.js';

let serverInstance: ReturnType<typeof Server> | undefined;
let servers:
    | {
          apiServer: import('http').Server;
          appServer: import('http').Server;
      }
    | undefined;

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

    function canListen(host: string, port: number) {
        return new Promise((resolve) => {
            const server = net
                .createServer()
                .once('error', () => resolve(false))
                .once('listening', () => server.close(() => resolve(true)))
                .listen({ host, port });
        });
    }

    ipcMainHandle('game:is-port-available', async (port) => {
        const results = await Promise.allSettled([
            canListen('127.0.0.1', port),
            canListen('::1', port),
        ]);

        return results.every((r) => r.status === 'fulfilled' && r.value === true);
    });

    ipcMainHandle('game:start-server', async ({ port }) => {
        if (serverInstance && servers) {
            return { ok: false, message: 'Server already running' };
        }

        if (!serverInstance) {
            serverInstance = Server({
                games: [Cluedo],
                origins: Origins.LOCALHOST_IN_DEVELOPMENT,
            });
        }

        servers = await serverInstance.run({ port });

        return { ok: true, port };
    });

    ipcMainOn('game:wipe-match', async (matchID: string) => {
        if (serverInstance) {
            await serverInstance.db.wipe(matchID);
        }
    });

    ipcMainOn('game:close-server', async () => {
        if (serverInstance && servers) {
            await serverInstance.kill(servers);
            servers = undefined;
        }
    });

    if (process.platform === 'darwin') {
        createMenu();
    } else {
        Menu.setApplicationMenu(null);
    }

    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }
});
