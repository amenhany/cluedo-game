declare module 'boardgame.io/dist/cjs/server.js' {
    import {
        Server as OriginalServer,
        Origins as OriginalOrigins,
    } from 'boardgame.io/server';
    export const Server: typeof OriginalServer;
    export const Origins: typeof OriginalOrigins;
}

declare module 'boardgame.io/dist/cjs/core.js' {
    export const INVALID_MOVE: 'INVALID_MOVE';
}
