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
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { role: 'selectAll' },
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
        ]),
    );
}
