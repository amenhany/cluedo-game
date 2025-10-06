export const isDev = import.meta.env.DEV;

export async function isServerAlive(serverURL: string) {
    try {
        const res = await fetch(`http://${serverURL}/games`, { method: 'GET' });
        return res.ok;
    } catch {
        return false;
    }
}
