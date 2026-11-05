// GameChoco.js — шоколадное море «Keyboard Escape Classic»: вместо плоской воды движка — глянцевый мраморный шоколад
// (бесшовная текстура разводов молочного и тёмного шоколада + карта нормалей, два слоя медленно текут навстречу,
// блик солнца, тени трассы) и бульканье: вокруг героя на поверхности надуваются пузыри, лопаются с брызгами,
// расходящимся колечком и звуком «бульк». Смерть в шоколаде решает по-прежнему ObbyCourse (waterAt маркеров water).
//
//   GameChoco.build(app);            // после карты: прячет меши Water3D, кладёт поверхность на их уровень
//   GameChoco.update(dt, hero);      // течение, пузыри рядом с героем

/** @satisfies {Record<string, any>} */
const GameChoco = {
    /** @type {any} */ app: null,
    /** @type {any[]} */ surfaces: [],
    /** @type {any} */ mat: null,
    /** @type {any} */ tex: null,
    /** @type {any} */ bump: null,
    /** @type {any[]} */ bubbles: [],
    /** @type {any} */ bubbleMat: null,
    /** @type {any} */ ringMat: null,
    _spawnT: 0,
    _t: 0,

    cfg() {
        const mobile = typeof IS_MOBILE !== 'undefined' && IS_MOBILE;
        return { count: mobile ? 8 : 16, near: 450, far: mobile ? 3400 : 4600, tile: 1400 };
    },

    build(app) {
        this.clear();
        this.app = app;
        const view = app.location.view, scene = view.scene, terrain = app.location.terrain;
        const waters = (terrain && terrain.waters) || [];
        if (!waters.length) return this;
        this._makeMaterials(scene);
        for (const w of waters) {
            const r = Math.max(400, Number(w.R) || 0) * 1.04;
            const mesh = BABYLON.MeshBuilder.CreateDisc('choco-sea', { radius: r, tessellation: 96 }, scene);
            mesh.rotation.x = Math.PI / 2;
            mesh.position.set(w.x, w.level + 1, w.y);
            // UV в мировых единицах (плитка KE одна на все водоёмы): u, v = координата / tile
            const tile = this.cfg().tile, pos = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            if (pos) {
                const uv = new Float32Array((pos.length / 3) * 2);
                for (let i = 0, j = 0; i < pos.length; i += 3, j += 2) { uv[j] = (pos[i] + w.x) / tile; uv[j + 1] = (pos[i + 1] + w.y) / tile; }
                mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uv, false);
            }
            mesh.material = this.mat;
            mesh.isPickable = false;
            World3D.addObject(view, mesh, 'prop', { outline: false, ink: false, castShadow: false });
            mesh.receiveShadows = true;
            if (w.mesh) w.mesh.setEnabled(false);
            this.surfaces.push({ mesh, w });
        }
        this._sfx();
        return this;
    },

    clear() {
        for (const s of this.surfaces) { try { s.mesh.dispose(); if (s.w.mesh) s.w.mesh.setEnabled(true); } catch (e) { /* уже */ } }
        for (const b of this.bubbles) { try { b.mesh.dispose(); b.ring.dispose(); } catch (e) { /* уже */ } }
        this.surfaces = []; this.bubbles = [];
    },

    /** Шум с целыми частотами — бесшовный на квадрате [0,1)² (сумма синусов, смещения фаз фиксированы). */
    _field(u, v) {
        const T = Math.PI * 2;
        // разводы: искажение координат и полосы
        const wx = u + 0.08 * Math.sin(T * (2 * v + 0.3)) + 0.05 * Math.sin(T * (3 * u + 5 * v + 0.7));
        const wy = v + 0.08 * Math.sin(T * (2 * u + 0.6)) + 0.05 * Math.sin(T * (4 * u - 3 * v + 0.2));
        return 0.5 + 0.5 * Math.sin(T * (3 * wx + 2 * wy) + 1.6 * Math.sin(T * (2 * wx - wy)) + 0.8 * Math.sin(T * (5 * wy + 0.4)));
    },

    _makeMaterials(scene) {
        const N = 256;
        const mat = this.mat = new BABYLON.StandardMaterial('choco-sea-mat', scene);
        mat.specularColor = new BABYLON.Color3(0.55, 0.42, 0.36);
        mat.specularPower = 48;
        mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
        try {
            const tex = this.tex = new BABYLON.DynamicTexture('choco-tex', { width: N, height: N }, scene, true);
            const btx = this.bump = new BABYLON.DynamicTexture('choco-bump', { width: N, height: N }, scene, true);
            const c1 = /** @type {CanvasRenderingContext2D} */ (/** @type {any} */ (tex.getContext()));
            const c2 = /** @type {CanvasRenderingContext2D} */ (/** @type {any} */ (btx.getContext()));
            if (c1 && c2) {
                const img = c1.createImageData(N, N), nrm = c2.createImageData(N, N);
                const H = new Float32Array(N * N);
                for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) H[y * N + x] = this._field(x / N, y / N);
                const dark = [74, 36, 20], milk = [138, 78, 44], cream = [196, 134, 88];
                for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
                    const h = H[y * N + x], i = (y * N + x) * 4;
                    // полосы: тёмный → молочный, тонкие сливочные прожилки на гребнях
                    const k = Math.pow(h, 1.6), vein = Math.max(0, 1 - Math.abs(h - 0.82) * 14);
                    for (let c = 0; c < 3; c++) img.data[i + c] = Math.round(dark[c] + (milk[c] - dark[c]) * k + (cream[c] - milk[c]) * vein * 0.6);
                    img.data[i + 3] = 255;
                    const hx = H[y * N + (x + 1) % N] - H[y * N + (x + N - 1) % N], hy = H[((y + 1) % N) * N + x] - H[((y + N - 1) % N) * N + x];
                    const nx = -hx * 2.2, ny = -hy * 2.2, nz = 1, L = Math.hypot(nx, ny, nz);
                    nrm.data[i] = Math.round((nx / L * 0.5 + 0.5) * 255); nrm.data[i + 1] = Math.round((ny / L * 0.5 + 0.5) * 255);
                    nrm.data[i + 2] = Math.round((nz / L * 0.5 + 0.5) * 255); nrm.data[i + 3] = 255;
                }
                c1.putImageData(img, 0, 0); c2.putImageData(nrm, 0, 0);
                tex.update(true); btx.update(true);
                tex.wrapU = tex.wrapV = btx.wrapU = btx.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
                tex.anisotropicFilteringLevel = 8;
                mat.diffuseTexture = tex;
                mat.bumpTexture = btx;
                btx.level = 0.55;
                btx.uScale = btx.vScale = 1.6;
            } else { tex.dispose(); btx.dispose(); this.tex = this.bump = null; mat.diffuseColor = BABYLON.Color3.FromHexString('#5a301a'); }
        } catch (e) { mat.diffuseColor = BABYLON.Color3.FromHexString('#5a301a'); }
        // пузырь — тот же глянцевый шоколад, чуть светлее
        const bm = this.bubbleMat = new BABYLON.StandardMaterial('choco-bubble-mat', scene);
        bm.diffuseColor = BABYLON.Color3.FromHexString('#7a4426'); bm.specularColor = new BABYLON.Color3(0.9, 0.75, 0.65); bm.specularPower = 64;
        const rm = this.ringMat = new BABYLON.StandardMaterial('choco-ring-mat', scene);
        rm.diffuseColor = BABYLON.Color3.FromHexString('#c48a5e'); rm.emissiveColor = BABYLON.Color3.FromHexString('#3a1e0e'); rm.alpha = 0.6; rm.backFaceCulling = false;
    },

    _sfx() {
        try {
            const n = Math.floor(44100 * 0.16), a = new Float32Array(n);
            for (let i = 0; i < n; i++) {
                const t = i / 44100, k = i / n;
                const f = 140 + 520 * Math.pow(k, 0.6);                       // «бульк»: низкий тон вверх
                a[i] = Math.sin(2 * Math.PI * f * t + 3 * Math.sin(2 * Math.PI * 30 * t)) * Math.pow(1 - k, 2) * Math.min(1, k * 40) * 0.6;
            }
            const b = Sound.makeBuffer(a, 44100);
            if (b) Sound.putBuffer('bloop', b);
        } catch (e) { /* без звука */ }
    },

    /** Точка на шоколаде рядом с героем (не под трассой: проверка — нет опоры над поверхностью). */
    _spot(hero) {
        const C = this.cfg();
        for (let k = 0; k < 14; k++) {
            const a = Math.random() * Math.PI * 2, d = C.near + Math.random() * (C.far - C.near);
            const x = hero.x + Math.cos(a) * d, z = hero.z + Math.sin(a) * d;
            const lv = this.app.location.waterAt(x, z);
            if (lv == null) continue;
            if (this.app.location.terrain.fieldHeight(x, z) > lv - 5) continue;      // отмель, остров
            return { x, z, y: lv };
        }
        return null;
    },

    update(dt, hero) {
        if (!this.surfaces.length) return;
        this._t += dt;
        if (this.tex) { this.tex.uOffset = (this._t * 0.006) % 1; this.tex.vOffset = (this._t * 0.004) % 1; }
        if (this.bump) { this.bump.uOffset = -(this._t * 0.011) % 1; this.bump.vOffset = (this._t * 0.007) % 1; }
        const C = this.cfg(), scene = this.app.location.view.scene, fx = this.app.fx;
        this._spawnT -= dt;
        if (hero && this._spawnT <= 0 && this.bubbles.filter(b => b.t >= 0).length < C.count) {
            this._spawnT = 0.18 + Math.random() * 0.35;
            const p = this._spot(hero);
            if (p) {
                let b = this.bubbles.find(q => q.t < 0);
                if (!b) {
                    const mesh = BABYLON.MeshBuilder.CreateSphere('choco-bubble', { diameter: 2, segments: 10, slice: 0.5 }, scene);
                    mesh.material = this.bubbleMat; mesh.isPickable = false;
                    World3D.addObject(this.app.location.view, mesh, 'prop', { outline: false, ink: false, castShadow: false });
                    const ring = BABYLON.MeshBuilder.CreateTorus('choco-ring', { diameter: 2, thickness: 0.12, tessellation: 28 }, scene);
                    ring.material = this.ringMat; ring.isPickable = false;
                    b = { mesh, ring, t: -1 };
                    this.bubbles.push(b);
                }
                b.x = p.x; b.z = p.z; b.y = p.y; b.t = 0; b.life = 0.9 + Math.random() * 1.4; b.r = 18 + Math.random() * 46; b.popped = false;
                b.mesh.setEnabled(true); b.ring.setEnabled(false);
            }
        }
        for (const b of this.bubbles) {
            if (b.t < 0) continue;
            b.t += dt;
            const k = b.t / b.life;
            if (k < 1) {
                const r = b.r * (0.2 + 0.8 * Math.sin(Math.min(1, k * 1.15) * Math.PI / 2)) * (1 + 0.06 * Math.sin(b.t * 18));
                b.mesh.position.set(b.x, b.y, b.z);
                b.mesh.scaling.set(r, r * (0.7 + 0.3 * k), r);
            } else if (!b.popped) {
                b.popped = true;
                b.mesh.setEnabled(false);
                b.ring.setEnabled(true);
                if (fx) fx.create({ burst: 10, capacity: 12, life: [0.3, 0.6], size: [5, 12], speed: [90, 220], color: '#6b3a1e', color2: '#a0623a', blend: 'standard', duration: 0.05,
                    position: [b.x, b.y + 4, b.z], direction: [[-0.6, 1.2, -0.6], [0.6, 2.2, 0.6]], gravity: [0, -900, 0] });
                const d = hero ? Math.hypot(hero.x - b.x, hero.z - b.z) : 9999;
                if (d < 1800) { try { Sound.play('synth:bloop', { volume: 0.35 * (1 - d / 1800), detune: (Math.random() - 0.5) * 600 }); } catch (e) { /* без звука */ } }
            } else {
                const q = (b.t - b.life) / 0.7;                     // колечко расходится и гаснет
                if (q >= 1) { b.t = -1; b.ring.setEnabled(false); continue; }
                const rr = b.r * (1 + q * 2.2);
                b.ring.position.set(b.x, b.y + 2, b.z);
                b.ring.scaling.set(rr, 1, rr);
                b.ring.visibility = 0.7 * (1 - q);
            }
        }
    },
};
