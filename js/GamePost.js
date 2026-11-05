// GamePost.js — постобработка «Keyboard Escape Classic» (Babylon DefaultRenderingPipeline на камере вида): сглаживание FXAA,
// мягкий bloom на бликах глазури и неоне трейлов, цветокоррекция под конфетный мир (контраст, насыщенность, тёплый тон),
// виньетка, лёгкая резкость (хроматическая аберрация и зерно выключены). Уровень — от Quality:
// низкий — только FXAA и цвет, средний — + bloom и виньетка, высокий — + резкость. Буст скорости и Rebirth дают короткий «импульс».
//
//   GamePost.init(app);          // после первой карты (камера вида уже есть)
//   GamePost.pulse(0.6);         // вспышка: сильнее bloom и аберрация на долю секунды (Rebirth, Wins-пад)
//   GamePost.update(dt, k);      // кадр: k 0..1 — скорость героя (больше виньетка и аберрация на бегу)

/** @satisfies {Record<string, any>} */
const GamePost = {
    /** @type {any} */ pipe: null,
    level: 2,
    _pulse: 0,
    _k: 0,

    init(app) {
        // низкий уровень графики (в том числе программная отрисовка без видеокарты — так у проверок площадок): конвейер не создаём
        // вовсе — его шейдеры и проходы тормозят первый кадр, а game_ready уходит только после него
        if (typeof Quality !== 'undefined' && Quality.level === 0) { this.pipe = null; return; }
        try {
            const view = app.location.view, scene = view.scene;
            if (this.pipe) this.pipe.dispose();
            const hdr = !(typeof IS_MOBILE !== 'undefined' && IS_MOBILE);
            const p = this.pipe = new BABYLON.DefaultRenderingPipeline('ke-post', hdr, scene, [view.camera]);
            p.samples = 1;
            p.fxaaEnabled = true;
            p.imageProcessingEnabled = true;
            const ip = p.imageProcessing;
            ip.contrast = 1.12;
            ip.exposure = 1.04;
            ip.toneMappingEnabled = false;          // toon-краски игры уже в гамме: тонмаппинг их тускнит
            ip.colorCurvesEnabled = true;
            const cc = new BABYLON.ColorCurves();
            cc.globalSaturation = 18;               // сочнее сладости
            cc.highlightsHue = 30; cc.highlightsDensity = 12; cc.highlightsSaturation = 10;   // тёплые блики (карамель)
            cc.shadowsHue = 300; cc.shadowsDensity = 10; cc.shadowsSaturation = 14;           // тени с розово-шоколадным тоном
            ip.colorCurves = cc;
            ip.vignetteEnabled = true;
            ip.vignetteWeight = 1.6;
            ip.vignetteStretch = 0.25;
            ip.vignetteColor = new BABYLON.Color4(0.28, 0.08, 0.16, 0);
            ip.vignetteBlendMode = BABYLON.ImageProcessingConfiguration.VIGNETTEMODE_MULTIPLY;
            p.bloomThreshold = 0.78;
            p.bloomWeight = 0.32;
            p.bloomKernel = 48;
            p.bloomScale = 0.5;
            p.sharpen.edgeAmount = 0.22;
            p.sharpen.colorAmount = 1;
            p.chromaticAberration.aberrationAmount = 8;
            p.chromaticAberration.radialIntensity = 0.9;
            p.grain.intensity = 5;
            p.grain.animated = true;
            this.apply(typeof Quality !== 'undefined' ? Quality.level : 2);
            if (typeof Quality !== 'undefined' && Quality.onChange) Quality.onChange((lv) => this.apply(lv));
        } catch (e) { console.warn('GamePost: постобработка недоступна', e); this.pipe = null; }
    },

    /** Уровень графики 0 низкий · 1 средний · 2 высокий. */
    apply(level) {
        const p = this.pipe;
        if (!p) return;
        this.level = level | 0;
        p.bloomEnabled = this.level >= 1;
        p.imageProcessing.vignetteEnabled = this.level >= 1;
        p.sharpenEnabled = this.level >= 2;
        p.chromaticAberrationEnabled = false;     // цветные ореолы по краям мешали (по просьбе пользователя — выключено)
        p.grainEnabled = false;
    },

    pulse(k) { this._pulse = Math.max(this._pulse, k || 0.5); },   // вспышка bloom и виньетки

    update(dt, k) {
        const p = this.pipe;
        if (!p) return;
        this._pulse = Math.max(0, this._pulse - dt * 1.6);
        this._k += ((k || 0) - this._k) * Math.min(1, dt * 3);
        const pu = this._pulse;
        if (p.bloomEnabled) { p.bloomWeight = 0.32 + pu * 0.5; p.bloomThreshold = 0.78 - pu * 0.25; }
        if (p.imageProcessing.vignetteEnabled) p.imageProcessing.vignetteWeight = 1.5 + this._k * 1.6 + pu * 1.2;
    },
};
