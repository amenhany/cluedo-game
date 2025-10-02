import { app, Menu } from 'electron';
import { isDev } from './util.js';

export function createMenu() {
    Menu.setApplicationMenu(
        Menu.buildFromTemplate([
            {
                label: app.name,
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' },
                ],
            },
            {
                label: 'View',
                type: 'submenu',
                submenu: [
                    { role: 'toggleDevTools', visible: isDev(), enabled: isDev() },
                    { type: 'separator' },
                    { role: 'togglefullscreen' },
                ],
            },
        ])
    );
}
