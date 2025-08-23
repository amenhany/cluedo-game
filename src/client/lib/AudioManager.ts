export class AudioManager {
    private static instance: AudioManager;
    private ctx: AudioContext;
    private masterGain: GainNode;
    private musicGain: GainNode;
    private sfxGain: GainNode;
    private currentMusic?: AudioBufferSourceNode;
    private cache = new Map<string, AudioBuffer>();

    private constructor() {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.connect(this.masterGain);
    }

    static getInstance() {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    async load(url: string) {
        if (this.cache.has(url)) return this.cache.get(url)!;

        const arrayBuf = await fetch(url).then((res) => res.arrayBuffer());
        const audioBuf = await this.ctx.decodeAudioData(arrayBuf);
        this.cache.set(url, audioBuf);
        return audioBuf;
    }

    async playSfx(url: string, loop = false) {
        const buffer = await this.load(url);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.sfxGain);
        source.loop = loop;
        source.start(0);

        return source;
    }

    async playMusic(url: string, loop = false, callback?: () => void) {
        if (this.currentMusic) {
            this.currentMusic.stop();
        }

        const buffer = await this.load(url);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.musicGain);
        source.loop = loop;
        source.start(0);

        this.currentMusic = source;
        if (callback) {
            source.onended = () => {
                if (this.currentMusic === source) callback();
            };
        }
        return source;
    }

    async playPlaylist(playlist: string[], idx = 0) {
        if (idx >= playlist.length) return;
        this.playMusic(playlist[idx], false, () => this.playPlaylist(playlist, idx + 1));
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = undefined;
        }
    }

    setMasterVolume(volume: number) {
        this.masterGain.gain.value = volume;
    }

    setMusicVolume(volume: number) {
        this.musicGain.gain.value = volume;
    }

    setSfxVolume(volume: number) {
        this.sfxGain.gain.value = volume;
    }
}
