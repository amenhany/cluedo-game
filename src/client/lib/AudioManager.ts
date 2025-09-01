export class AudioManager {
    private static instance: AudioManager;
    private ctx: AudioContext;
    private masterGain: GainNode;
    private musicGain: GainNode;
    private sfxGain: GainNode;
    private staticGain: GainNode;
    private STATIC_GAIN_MULTIPLIER = 10;
    private currentMusic?: AudioBufferSourceNode;
    private currentStatic?: AudioBufferSourceNode;
    private cache = new Map<string, AudioBuffer>();

    private constructor() {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.connect(this.masterGain);

        this.staticGain = this.ctx.createGain();
        this.staticGain.connect(this.sfxGain);
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

    async playRandomSfx(...urls: string[]) {
        this.playSfx(urls[Math.floor(Math.random() * urls.length)]);
    }

    async playStatic(url: string, loop = true, callback?: () => void) {
        if (this.currentStatic) {
            this.currentStatic.stop();
        }

        const buffer = await this.load(url);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.staticGain);
        if (!this.currentMusic) {
            this.staticGain.gain.value = 5;
        }
        source.loop = loop;
        source.start(0);

        this.currentStatic = source;
        if (callback) {
            source.onended = () => {
                if (this.currentStatic === source) callback();
            };
        }
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

        this.staticGain.gain.value =
            this.staticGain.gain.value / this.STATIC_GAIN_MULTIPLIER;
        this.currentMusic = source;
        source.onended = () => {
            if (this.currentMusic === source) {
                this.staticGain.gain.value =
                    this.staticGain.gain.value * this.STATIC_GAIN_MULTIPLIER;
                callback?.();
            }
        };
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
            setTimeout(
                () =>
                    (this.staticGain.gain.value =
                        this.staticGain.gain.value * this.STATIC_GAIN_MULTIPLIER),
                1500
            );
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
