// GameTreadmills.js — живые беговые дорожки: лента (часть Belt модели hub/treadmill_t1…t4) едет полосками, лампочки (Lights)
// мигают, экран пульта (Screen) показывает множитель и прибавку; пока на ленте кто-то бежит — лента быстрее, искры и линии
// скорости цвета уровня летят назад. Уровень дорожки — маркер treadmill-N рядом (scale[1]). Логика шагов — Game.treadmill.
//
//   GameTreadmills.build(app);                          // после карты (меши объектов уже есть)
//   GameTreadmills.update(dt, hero, active);            // active — точка treadmill, на которой бежит герой (или null)
//   GameTreadmills.faceYaw(point) → курс «лицом к пульту» для героя на ленте

/** @satisfies {Record<string, any>} */
const GameTreadmills = {
    /** @type {any} */ app: null,
    /** @type {any[]} */ list: [],
    _fxT: 0,

    build(app) {
        this.clear();
        this.app = app;
        const scene = app.location.view.scene;
        const marks = app.location.markers('treadmill');
        for (const rec of app.location.objects) {
            const m = String(rec.def.model || '');
            if (!rec.mesh || !/treadmill/.test(m)) continue;
            const x = rec.mesh.position.x, z = rec.mesh.position.z;
            let tier = 1, bd = Infinity;
            for (const mk of marks) {
                const d = Math.hypot((Number(mk.x) || 0) - x, (Number(mk.y) || 0) - z);
                if (d < bd) { bd = d; tier = Math.max(1, Math.min(4, Math.round(Array.isArray(mk.scale) ? Number(mk.scale[1]) || 1 : 1))); }
            }
            const T = GAME_TREADMILLS[tier - 1] || GAME_TREADMILLS[0];
            const parts = [rec.mesh].concat(rec.mesh.getChildMeshes(false));
            const part = (name) => parts.find(p => String((p.metadata && p.metadata.part) || p.name).startsWith(name)) || null;
            const t = { rec, tier, x, z, yaw: Array.isArray(rec.def.rot) ? (Number(rec.def.rot[1]) || 0) * Math.PI / 180 : 0,
                color: T.color, belt: part('Belt'), screen: part('Screen'), lights: part('Lights'), tex: null, scr: null, ph: Math.random() * 6, run: 0 };
            this._beltMat(scene, t);
            this._screenMat(scene, t);
            if (t.lights && t.lights.material) { t.lights.material = t.lights.material.clone('tm-lights'); }
            this.list.push(t);
        }
        return this;
    },

    clear() { for (const t of this.list) { try { if (t.tex) t.tex.dispose(); if (t.scr) t.scr.dispose(); } catch (e) { /* нет */ } } this.list = []; },

    _hex(c) { return '#' + Number(c).toString(16).padStart(6, '0'); },

    /** Лента: тёмная резина с яркими поперечными полосами цвета уровня (U едет — лента бежит). */
    _beltMat(scene, t) {
        if (!t.belt) return;
        try {
            const tex = new BABYLON.DynamicTexture('tm-belt', { width: 256, height: 64 }, scene, true);
            const ctx = /** @type {CanvasRenderingContext2D} */ (/** @type {any} */ (tex.getContext()));
            ctx.fillStyle = '#2a1a14'; ctx.fillRect(0, 0, 256, 64);
            for (let i = 0; i < 4; i++) { ctx.fillStyle = this._hex(t.color); ctx.globalAlpha = 0.9; ctx.fillRect(i * 64 + 6, 0, 14, 64); ctx.globalAlpha = 0.35; ctx.fillRect(i * 64 + 24, 0, 6, 64); }
            ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(0, 4, 256, 3); ctx.fillRect(0, 57, 256, 3);
            tex.update(true);
            tex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE; tex.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
            const mat = new BABYLON.StandardMaterial('tm-belt-mat', scene);
            mat.diffuseTexture = tex; mat.specularColor = new BABYLON.Color3(0.25, 0.25, 0.25);
            t.belt.material = mat; t.tex = tex;
        } catch (e) { /* без холста — лента цветом */ }
    },

    /** Экран пульта: множитель уровня, светится. */
    _screenMat(scene, t) {
        if (!t.screen) return;
        try {
            const tex = new BABYLON.DynamicTexture('tm-screen', { width: 256, height: 128 }, scene, true);
            const mat = new BABYLON.StandardMaterial('tm-screen-mat', scene);
            mat.diffuseTexture = tex; mat.emissiveTexture = tex; mat.emissiveColor = new BABYLON.Color3(0, 0, 0); mat.disableLighting = true;
            t.screen.material = mat; t.scr = tex;
            this._paintScreen(t, 0);
        } catch (e) { /* нет */ }
    },

    _paintScreen(t, add) {
        if (!t.scr) return;
        const ctx = /** @type {CanvasRenderingContext2D} */ (/** @type {any} */ (t.scr.getContext()));
        const T = GAME_TREADMILLS[t.tier - 1];
        ctx.fillStyle = '#12202a'; ctx.fillRect(0, 0, 256, 128);
        ctx.fillStyle = this._hex(t.color); ctx.font = '900 64px "Nunito", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('x' + T.mult, 128, add ? 46 : 64);
        if (add) { ctx.fillStyle = '#7ef0c8'; ctx.font = '900 34px "Nunito", system-ui, sans-serif'; ctx.fillText('+' + GameProgress.fmt(add) + '/s', 128, 100); }
        t.scr.update(true);
        t._shown = add;
    },

    /** Курс героя на ленте — лицом к пульту (+X модели). */
    faceYaw(p) { const t = this.near(p); return t ? t.yaw : null; },
    near(p) { let best = null, bd = Infinity; for (const t of this.list) { const d = Math.hypot(t.x - p.x, t.z - p.z); if (d < bd) { bd = d; best = t; } } return bd < 400 ? best : null; },

    update(dt, hero, active, perSec) {
        const fx = this.app && this.app.fx;
        const on = active ? this.near(active) : null;
        for (const t of this.list) {
            const running = t === on;
            t.run += ((running ? 1 : 0.25) - t.run) * Math.min(1, dt * 4);
            if (t.tex) t.tex.uOffset = (t.tex.uOffset + dt * (0.35 + t.run * 2.4)) % 1;
            t.ph += dt * (running ? 9 : 2.2);
            if (t.lights && t.lights.material) {
                const k = 0.5 + 0.5 * Math.sin(t.ph);
                const c = BABYLON.Color3.FromHexString(this._hex(t.color));
                /** @type {any} */ (t.lights.material).emissiveColor = c.scale(0.25 + k * (running ? 0.9 : 0.35));
            }
            const show = running ? Math.round(perSec || 0) : 0;
            if (show !== t._shown) this._paintScreen(t, show);
        }
        // искры и линии скорости назад с ленты
        this._fxT -= dt;
        if (on && fx && this._fxT <= 0) {
            this._fxT = 0.09;
            const bx = -Math.cos(on.yaw), bz = -Math.sin(on.yaw), col = this._hex(on.color);
            fx.create({ burst: 4, capacity: 8, life: [0.25, 0.5], size: [8, 16], speed: [300, 520], color: col, color2: '#ffffff', duration: 0.05,
                position: [hero.x + bx * 60, hero.y + 20, hero.z + bz * 60], direction: [[bx, 0.2, bz], [bx, 0.6, bz]], gravity: [0, -400, 0] });
            fx.create({ burst: 2, capacity: 4, life: [0.18, 0.3], size: [26, 50], speed: [700, 900], color: '#ffffff', alpha: 0.5, blend: 'standard', duration: 0.05,
                position: [hero.x, hero.y + 60 + Math.random() * 80, hero.z], direction: [[bx, 0, bz], [bx, 0.05, bz]] });
        }
    },
};
