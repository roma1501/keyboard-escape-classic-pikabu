// GameKeys.js — живые клавиатуры: на верхней грани каждой детали-клавиатуры трассы (box_key<палитра>.glb) лежит сетка
// колпачков клавиш с буквами (шаг KE_KEY_PITCH). Колпачки — thin instances: один меш на букву (общая геометрия колпачка
// assets/models/keys/keycap.glb из Blender + клетка буквы в атласе), цвет — у инстанса. Рисуются только клавиши рядом
// с героем (KE_KEY_VIEW_DIST), дальше видна плита с нарисованной сеткой клавиш (текстура верхней грани — тот же атлас).
// Шаг героя по клавише: GameKeys.cellAt(...) отдаёт клетку, GameKeys.press(cell, glow) утапливает и подсвечивает её.
// Решения игры (шаг, Speed) — в Game.js: здесь только вид и учёт клеток (чистая геометрия по данным детали).
//
//   GameKeys.addPalettes();                          // до ObbyCourseView.build: цвета корпусов палитр в ObbyCourse.COLORS
//   await GameKeys.build(app, ObbyCourse);           // после ObbyCourseView.build: колпачки, текстуры плит
//   const cell = GameKeys.cellAt(hero.support, hero.x, hero.z);   // { key, piece, i, j, x, y, z } | null
//   if (cell && cell.key !== last) GameKeys.press(cell, 0xffd23f);
//   GameKeys.update(dt, hero.x, hero.z);             // анимация нажатий, пересборка видимого набора

/** Палитры клавиатур: корпус [светлый, тёмный] и цвета колпачков. rows — цвета по рядам (радуга), иначе — вперемешку. */
const KEY_PALETTES = {
    keychoco: { body: [0x4a2a18, 0x2e1a0f], keys: [0x6b3a1e, 0x5a301a, 0x7a4426, 0x8a5230], legend: 0xf7d9b5 },
    keymilk: { body: [0x8a5a3a, 0x6b4428], keys: [0xb07a52, 0xa06a44, 0xc28a5e, 0xd6a274], legend: 0x4a2a18 },
    keywhite: { body: [0xd9c7b0, 0xbfa98e], keys: [0xfff4e4, 0xf7e6cc, 0xffffff, 0xeedcc0], legend: 0x8a5a3a },
    keypink: { body: [0xd64f8f, 0xb23a74], keys: [0xff9ad5, 0xff7ab8, 0xffb8e0, 0xff5fa8], legend: 0x7a1f4f },
    keylilac: { body: [0x7a5cc0, 0x5e45a0], keys: [0xb89aff, 0xa784ff, 0xcab4ff, 0x9a72f0], legend: 0x3a2370 },
    keymint: { body: [0x2fa884, 0x1f8a6a], keys: [0x7ef0c8, 0x5fe0b4, 0xa6f7dc, 0x4fd6a8], legend: 0x145c46 },
    keylemon: { body: [0xd6b42a, 0xb8971c], keys: [0xfbe86a, 0xfff39a, 0xf4d84a, 0xffe27a], legend: 0x6b5a10 },
    keycaramel: { body: [0xb8682a, 0x96521e], keys: [0xf7b267, 0xe8a050, 0xffc580, 0xe0904a], legend: 0x6b3a12 },
    keycotton: { body: [0x7fb8e6, 0x5e9ccc], keys: [0xbfe6ff, 0xffd1ec, 0xd8f2ff, 0xffe8f6], legend: 0x3a5a8a },
    keyrainbow: { body: [0x3a2f5c, 0x2a2246], rows: [0xff6b6b, 0xf7b267, 0xfbe86a, 0x8ee05a, 0x5ab8ff, 0xa77bff, 0xff9ad5], legend: 0x2a2246 },
};

/** Подписи клавиш по рядам — как на настоящей клавиатуре (ряд j % 4, клавиша i % длина). */
const KEY_ROWS = ['1234567890', 'QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

/** @satisfies {Record<string, any>} */
const GameKeys = {
    /** @type {any} */ app: null,
    /** @type {any} */ course: null,
    /** @type {any[]} */ boards: [],             // детали-клавиатуры: { piece, palette, nx, nz, static }
    /** @type {Map<string, any>} */ glyphs: new Map(),   // буква → { mesh, mats: Float32Array, cols: Float32Array, n, cap, keys: [] }
    /** @type {Map<string, any>} */ live: new Map(),     // ключ клетки → { g, idx, base: number[], color: number[] }
    /** @type {any[]} */ pressed: [],
    /** @type {Array<{ x: number, z: number, r: number }>} */ excl: [],     // круги без колпачков (под падом, дорожкой, киоском)
    /** @type {any} */ atlas: null,
    /** @type {any} */ material: null,
    _cx: 1e9, _cz: 1e9,
    _dirty: new Set(),
    CELLS: 8,                                     // атлас 8×8 клеток: 0 — белая (бока), дальше буквы

    cfg() {
        const U = 'undefined';
        const mobile = typeof IS_MOBILE !== U && IS_MOBILE;
        const low = typeof Quality !== 'undefined' && Quality.level === 0;
        return {
            pitch: typeof KE_KEY_PITCH !== U ? KE_KEY_PITCH : 96,
            press: typeof KE_KEY_PRESS_SEC !== U ? KE_KEY_PRESS_SEC : 0.32,
            depth: typeof KE_KEY_DEPTH !== U ? KE_KEY_DEPTH : 9,
            view: (typeof KE_KEY_VIEW_DIST !== U ? KE_KEY_VIEW_DIST : 7000) * (mobile ? 0.65 : 1) * (low ? 0.5 : 1),
            lift: typeof KE_KEY_LIFT !== U ? KE_KEY_LIFT : 24,
            tall: typeof KE_KEY_TALL !== U ? KE_KEY_TALL : 1.7,
        };
    },

    /** Корпуса палитр — в цвета деталей обби (до ObbyCourseView.build: вид делает материалы по списку). */
    addPalettes() {
        for (const k of Object.keys(KEY_PALETTES)) ObbyCourse.COLORS[k] = KEY_PALETTES[k].body.slice();
    },

    isBoard(p) { return !!(p && p.type === 'box' && KEY_PALETTES[p.color]); },

    // ---------------------------------------------------------------------------------------------
    // Постройка
    // ---------------------------------------------------------------------------------------------

    async build(app, course) {
        this.clear();
        this.app = app; this.course = course;
        const C = this.cfg();
        for (const p of course.pieces) {
            if (!this.isBoard(p)) continue;
            const nx = Math.max(1, Math.round(p.sx / C.pitch)), nz = Math.max(1, Math.round(p.sz / C.pitch));
            this.boards.push({ piece: p, palette: KEY_PALETTES[p.color], nx, nz, dynamic: !!p.dynamic });
        }
        const scene = app.location.view.scene;
        this.atlas = this._makeAtlas(scene);
        this._paintBoardTops(scene);
        const geo = await this._capGeometry();
        this._makeGlyphMeshes(app.location.view, geo);
        this._cx = this._cz = 1e9;
        return this;
    },

    clear() {
        for (const g of this.glyphs.values()) { try { World3D.removeObject(this.app.location.view, g.mesh); } catch (e) { try { g.mesh.dispose(); } catch (e2) { /* нет */ } } }
        this.glyphs.clear(); this.live.clear(); this.pressed = []; this.boards = [];
        if (this.material) { try { this.material.dispose(false, true); } catch (e) { /* нет */ } this.material = null; }
    },

    /** Атлас букв: клетка 0 — белая, 1… — буквы KEY_ROWS (светлый колпачок, буква тёмной глазурью — красит цвет инстанса). */
    _makeAtlas(scene) {
        const N = this.CELLS, size = 1024, cell = size / N;
        this.cellOf = {};
        try {
            const t = new BABYLON.DynamicTexture('keys-atlas', { width: size, height: size }, scene, true);
            const ctx = /** @type {CanvasRenderingContext2D} */ (/** @type {any} */ (t.getContext()));
            if (!ctx) { t.dispose(); return null; }
            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size);
            const chars = Array.from(new Set(KEY_ROWS.join('').split('')));
            const fam = (typeof document !== 'undefined' && document.fonts && document.fonts.check && document.fonts.check('900 40px "Nunito"')) ? '"Nunito", ' : '';
            chars.forEach((ch, i) => {
                const k = i + 1, cx = (k % N) * cell, cy = Math.floor(k / N) * cell;
                this.cellOf[ch] = k;
                // мягкая «вогнутость» колпачка: светлее в центре
                const g = ctx.createRadialGradient(cx + cell / 2, cy + cell / 2, cell * 0.1, cx + cell / 2, cy + cell / 2, cell * 0.62);
                g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e4e0ea');
                ctx.fillStyle = g; ctx.fillRect(cx, cy, cell, cell);
                ctx.fillStyle = 'rgba(40,30,50,0.62)';
                ctx.font = '900 ' + Math.round(cell * 0.5) + 'px ' + fam + 'system-ui, Arial, sans-serif';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(ch, cx + cell / 2, cy + cell * 0.54);
            });
            t.update(true);
            t.anisotropicFilteringLevel = 8;
            t.wrapU = t.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
            return t;
        } catch (e) { return null; }
    },

    /** Текстура верхней грани плит-клавиатур (её видно вдали и под колпачками): сетка 4×4 клеток, тёмные швы. */
    _paintBoardTops(scene) {
        const mats = ObbyCourseView.mats || {};
        for (const name of Object.keys(KEY_PALETTES)) {
            const m = mats['top:' + name];
            if (!m) continue;
            const P = KEY_PALETTES[name];
            try {
                const size = 512, n = 4, c = size / n;
                const t = new BABYLON.DynamicTexture('keys-top-' + name, { width: size, height: size }, scene, true);
                const ctx = /** @type {CanvasRenderingContext2D} */ (/** @type {any} */ (t.getContext()));
                if (!ctx) { t.dispose(); continue; }
                ctx.fillStyle = '#' + P.body[1].toString(16).padStart(6, '0'); ctx.fillRect(0, 0, size, size);
                for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
                    const col = this.keyColor(P, i, j, 0);
                    const hex = '#' + col.toString(16).padStart(6, '0');
                    const pad = c * 0.09, r = c * 0.14;
                    const x = i * c + pad, y = j * c + pad, w = c - 2 * pad;
                    ctx.fillStyle = hex;
                    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + w, r); ctx.arcTo(x + w, y + w, x, y + w, r); ctx.arcTo(x, y + w, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x + r, y + w * 0.12, w - 2 * r, w * 0.12);
                }
                t.update(true);
                t.wrapU = t.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
                t.anisotropicFilteringLevel = 8;
                if (m.diffuseTexture) m.diffuseTexture.dispose();
                m.diffuseTexture = t;
                m.diffuseColor = new BABYLON.Color3(1, 1, 1);
            } catch (e) { /* без холста — ровный цвет */ }
        }
    },

    /** Цвет колпачка клетки (i, j) детали seed: радуга — по рядам, иначе — псевдослучайно из набора. */
    keyColor(P, i, j, seed) {
        if (P.rows) return P.rows[((j % P.rows.length) + P.rows.length) % P.rows.length];
        const h = Math.abs(((i * 73856093) ^ (j * 19349663) ^ (seed * 83492791)) | 0);
        return P.keys[h % P.keys.length];
    },

    keyChar(i, j) { const row = KEY_ROWS[((j % 4) + 4) % 4]; return row[((i % row.length) + row.length) % row.length]; },

    /** Геометрия колпачка в px: части Top (буква) и Side из Blender; нет файла — своя усечённая призма. */
    async _capGeometry() {
        try {
            const model = await Model3D.load('assets/models/keys/keycap.glb');
            const top = model.parts.find(p => /top/i.test(p.name)), side = model.parts.filter(p => !/top/i.test(p.name));
            if (top) return { top: this._flat(top), side: side.map(p => this._flat(p)) };
        } catch (e) { console.warn('GameKeys: keycap.glb не загрузился — колпачок кодом', e); }
        return this._fallbackCap();
    },

    /** Часть модели → { pos, nrm, idx } (индексы — общий вид). */
    _flat(part) {
        const pos = Array.from(part.positions), nrm = part.normals ? Array.from(part.normals) : null;
        const n = pos.length / 3;
        const idx = part.indices ? Array.from(part.indices) : Array.from({ length: n }, (_, i) => i);
        return { pos, nrm, idx };
    },

    _fallbackCap() {
        const w = 43, t = 36, h = 26;     // полуразмер низа, верха, высота: верх на y = 0
        const P = [[-w, -h, -w], [w, -h, -w], [w, -h, w], [-w, -h, w], [-t, 0, -t], [t, 0, -t], [t, 0, t], [-t, 0, t]];
        const side = { pos: [], nrm: null, idx: [] };
        const quad = (a, b, c, d) => { const o = side.pos.length / 3; for (const v of [a, b, c, d]) side.pos.push(...P[v]); side.idx.push(o, o + 2, o + 1, o, o + 3, o + 2); };
        quad(0, 1, 5, 4); quad(1, 2, 6, 5); quad(2, 3, 7, 6); quad(3, 0, 4, 7);
        const top = { pos: [-t, 0, -t, t, 0, -t, t, 0, t, -t, 0, t], nrm: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], idx: [0, 2, 1, 0, 3, 2] };
        return { top, side: [side] };
    },

    /** Меш на каждую букву: та же геометрия, UV верха — в клетку буквы, бока — в белую клетку. */
    _makeGlyphMeshes(view, geo) {
        const scene = view.scene, N = this.CELLS;
        const mat = this.material = new BABYLON.StandardMaterial('keys-mat', scene);
        mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
        if (this.atlas) mat.diffuseTexture = this.atlas;
        mat.specularColor = new BABYLON.Color3(0.32, 0.3, 0.34);
        mat.specularPower = 40;
        // габарит верха — для планарной развёртки буквы
        let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
        for (let i = 0; i < geo.top.pos.length; i += 3) { x0 = Math.min(x0, geo.top.pos[i]); x1 = Math.max(x1, geo.top.pos[i]); z0 = Math.min(z0, geo.top.pos[i + 2]); z1 = Math.max(z1, geo.top.pos[i + 2]); }
        const pad = 0.06;
        for (const ch of Object.keys(this.cellOf || { A: 1 })) {
            const k = (this.cellOf || {})[ch] || 1, cu = (k % N) / N, cv = 1 - (Math.floor(k / N) + 1) / N;   // DynamicTexture: v снизу
            const pos = [], uv = [], idx = [], nrm = [];
            const put = (part, uvFn) => {
                const o = pos.length / 3;
                for (let i = 0; i < part.pos.length; i += 3) {
                    pos.push(part.pos[i], part.pos[i + 1], part.pos[i + 2]);
                    uv.push(...uvFn(part.pos[i], part.pos[i + 2]));
                }
                for (const v of part.idx) idx.push(o + v);
            };
            for (const s of geo.side) put(s, () => [0.5 / N, 1 - 0.5 / N]);
            // буква: u вдоль +Z (вправо на экране, когда смотришь вдоль +X), v вдоль +X (вдаль)
            put(geo.top, (x, z) => {
                const u = (z - z0) / Math.max(1, z1 - z0), v = (x - x0) / Math.max(1, x1 - x0);
                return [cu + (pad + u * (1 - 2 * pad)) / N, cv + (pad + v * (1 - 2 * pad)) / N];
            });
            const vd = new BABYLON.VertexData();
            vd.positions = pos; vd.indices = idx; vd.uvs = uv;
            BABYLON.VertexData.ComputeNormals(pos, idx, nrm);
            vd.normals = nrm;
            const mesh = new BABYLON.Mesh('key-' + ch, scene);
            vd.applyToMesh(mesh, true);
            mesh.material = mat;
            mesh.isPickable = false;
            mesh.alwaysSelectAsActiveMesh = true;
            World3D.addObject(view, mesh, 'prop', { outline: false, ink: false, castShadow: false });
            mesh.thinInstanceSetBuffer('matrix', new Float32Array(16), 16, false);
            mesh.thinInstanceSetBuffer('color', new Float32Array(4), 4, false);
            mesh.thinInstanceCount = 0;
            this.glyphs.set(ch, { mesh, mats: new Float32Array(0), cols: new Float32Array(0), n: 0, cap: 0, keys: [] });
        }
    },

    // ---------------------------------------------------------------------------------------------
    // Видимый набор
    // ---------------------------------------------------------------------------------------------

    /** Центр клетки (i, j) детали p в мире. */
    cellWorld(p, i, j, out) {
        const C = this.cfg(), hx = p.sx / 2, hz = p.sz / 2;
        const lx = -hx + (i + 0.5) * C.pitch, lz = -hz + (j + 0.5) * C.pitch;
        const o = out || [0, 0, 0];
        o[0] = p.O[0] + p.ax[0] * lx + p.az[0] * lz;
        o[1] = p.O[1] + p.ax[1] * lx + p.az[1] * lz;
        o[2] = p.O[2] + p.ax[2] * lx + p.az[2] * lz;
        return o;
    },

    _excluded(x, z) {
        for (const e of this.excl) { const dx = x - e.x, dz = z - e.z; if (dx * dx + dz * dz < e.r * e.r) return true; }
        return false;
    },

    /** Колпачки не рисуются в кругах (предметы стоят на плите); пересборка — на следующем кадре. */
    setExclusions(list) { this.excl = list || []; this._cx = this._cz = 1e9; },

    /** Пересобрать инстансы клавиш вокруг (cx, cz). Подвижные плиты колпачков не получают (у них — текстура). */
    rebuild(cx, cz) {
        const C = this.cfg(), R = C.view, R2 = R * R;
        this._cx = cx; this._cz = cz;
        for (const g of this.glyphs.values()) { g.n = 0; g.keys.length = 0; }
        this.live.clear();
        const w = [0, 0, 0];
        const lists = new Map();
        for (const b of this.boards) {
            if (b.dynamic) continue;
            const p = b.piece;
            const r = Math.hypot(p.sx, p.sz) / 2;
            const dx = p.O[0] - cx, dz = p.O[2] - cz;
            if (Math.hypot(dx, dz) - r > R) continue;
            for (let j = 0; j < b.nz; j++) for (let i = 0; i < b.nx; i++) {
                this.cellWorld(p, i, j, w);
                const ex = w[0] - cx, ez = w[2] - cz;
                if (ex * ex + ez * ez > R2) continue;
                if (this._excluded(w[0], w[2])) continue;
                const ch = this.keyChar(i, j);
                let list = lists.get(ch);
                if (!list) { list = []; lists.set(ch, list); }
                list.push({ p, i, j, x: w[0], y: w[1], z: w[2], col: this.keyColor(b.palette, i, j, p.id) });
            }
        }
        const lin = (c) => [((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255];
        for (const [ch, g] of this.glyphs) {
            const list = lists.get(ch) || [];
            const n = list.length;
            if (n > g.cap) { g.cap = Math.ceil(n * 1.3) + 8; g.mats = new Float32Array(g.cap * 16); g.cols = new Float32Array(g.cap * 4); }
            for (let k = 0; k < n; k++) {
                const e = list[k], p = e.p, m = g.mats, o = k * 16;
                // столбцы матрицы: оси детали (единичные), перенос — центр клетки (верх колпачка чуть выше плиты)
                m[o] = p.ax[0]; m[o + 1] = p.ax[1]; m[o + 2] = p.ax[2]; m[o + 3] = 0;
                m[o + 4] = p.ay[0] * C.tall; m[o + 5] = p.ay[1] * C.tall; m[o + 6] = p.ay[2] * C.tall; m[o + 7] = 0;
                m[o + 8] = p.az[0]; m[o + 9] = p.az[1]; m[o + 10] = p.az[2]; m[o + 11] = 0;
                m[o + 12] = e.x + p.ay[0] * C.lift; m[o + 13] = e.y + p.ay[1] * C.lift; m[o + 14] = e.z + p.ay[2] * C.lift; m[o + 15] = 1;
                const c = lin(e.col);
                g.cols[k * 4] = c[0]; g.cols[k * 4 + 1] = c[1]; g.cols[k * 4 + 2] = c[2]; g.cols[k * 4 + 3] = 1;
                const key = p.id + ':' + e.i + ':' + e.j;
                this.live.set(key, { g, idx: k, y: m[o + 13], color: c, ay: p.ay });
                g.keys.push(key);
            }
            g.n = n;
            const mesh = g.mesh;
            mesh.thinInstanceSetBuffer('matrix', g.mats, 16, false);
            mesh.thinInstanceSetBuffer('color', g.cols, 4, false);
            mesh.thinInstanceCount = n;
            mesh.setEnabled(n > 0);
            if (n > 0) mesh.thinInstanceRefreshBoundingInfo(false);
        }
        // нажатые остаются нажатыми
        for (const pr of this.pressed) pr.rec = this.live.get(pr.key) || null;
    },

    // ---------------------------------------------------------------------------------------------
    // Шаги
    // ---------------------------------------------------------------------------------------------

    /** Клетка клавиатуры под точкой (x, z) на опоре col (ObbyBody.support): { key, piece, i, j } | null. */
    cellAt(col, x, z) {
        const p = col && col.piece;
        if (!p || !this.isBoard(p)) return null;
        const C = this.cfg();
        const pose = p.dynamic && this.course && this.course.current ? this.course.current(p) : p;
        const O = pose.O || p.O, ax = pose.ax || p.ax, az = pose.az || p.az;
        const dx = x - O[0], dz = z - O[2];
        const lx = dx * ax[0] + dz * ax[2], lz = dx * az[0] + dz * az[2];
        const i = Math.floor((lx + p.sx / 2) / C.pitch), j = Math.floor((lz + p.sz / 2) / C.pitch);
        if (i < 0 || j < 0 || i * C.pitch >= p.sx || j * C.pitch >= p.sz) return null;
        return { key: p.id + ':' + i + ':' + j, piece: p, i, j };
    },

    /** Утопить и подсветить клавишу клетки; glow — цвет подсветки (0xRRGGBB) из косметики «Glow». */
    press(cell, glow) {
        if (!cell) return;
        const C = this.cfg();
        const old = this.pressed.find(q => q.key === cell.key);
        const g = glow == null ? 0xffffff : glow;
        const gc = [((g >> 16) & 255) / 255, ((g >> 8) & 255) / 255, (g & 255) / 255];
        if (old) { old.t = C.press; old.glow = gc; return; }
        this.pressed.push({ key: cell.key, t: C.press, glow: gc, rec: this.live.get(cell.key) || null });
        if (this.pressed.length > 40) { const q = this.pressed.shift(); if (q) this._pose(q, 0); }
    },

    /** Поза нажатия: k 0..1 (1 — полностью утоплена и светится). */
    _pose(pr, k) {
        const r = pr.rec;
        if (!r) return;
        const C = this.cfg(), g = r.g, o = r.idx * 16, d = C.depth * k;
        g.mats[o + 13] = r.y - r.ay[1] * d;
        const c = r.color, gl = pr.glow, w = Math.min(1, k * 1.15);
        // свет: к цвету подсветки + чуть ярче (эмиссии нет — тон поднимаем над 1)
        g.cols[r.idx * 4] = c[0] + (gl[0] * 1.35 - c[0]) * w;
        g.cols[r.idx * 4 + 1] = c[1] + (gl[1] * 1.35 - c[1]) * w;
        g.cols[r.idx * 4 + 2] = c[2] + (gl[2] * 1.35 - c[2]) * w;
        this._dirty.add(g);
    },

    update(dt, x, z) {
        const C = this.cfg();
        if (Math.hypot(x - this._cx, z - this._cz) > C.view * 0.18) this.rebuild(x, z);
        for (let i = this.pressed.length - 1; i >= 0; i--) {
            const pr = this.pressed[i];
            pr.t -= dt;
            const k = pr.t > C.press * 0.6 ? 1 : Math.max(0, pr.t / (C.press * 0.6));
            this._pose(pr, k * k * (3 - 2 * k));
            if (pr.t <= 0) this.pressed.splice(i, 1);
        }
        for (const g of this._dirty) {
            g.mesh.thinInstanceBufferUpdated('matrix');
            g.mesh.thinInstanceBufferUpdated('color');
        }
        this._dirty.clear();
    },

    /** Мир клетки для эффектов (искры над нажатой клавишей). */
    cellPos(cell) { return cell ? this.cellWorld(cell.piece.dynamic && this.course.current ? Object.assign({}, cell.piece, this.course.current(cell.piece)) : cell.piece, cell.i, cell.j) : null; },
};

// Ноги героя и ботов на клавиатуре стоят на колпачках (физика — верх плиты, вид поднят на KE_FOOT_LIFT плавно).
if (typeof ObbyCharacter !== 'undefined') {
    const baseSync = ObbyCharacter.prototype.sync;
    ObbyCharacter.prototype.sync = function () {
        baseSync.call(this);
        const self = /** @type {any} */ (this);
        const on = this.grounded && this.support && GameKeys.isBoard(this.support.piece);
        const want = on ? (typeof KE_FOOT_LIFT !== 'undefined' ? KE_FOOT_LIFT : 18) : 0;
        self._keyLift = (self._keyLift || 0) + (want - (self._keyLift || 0)) * (want > (self._keyLift || 0) ? 0.5 : 0.18);
        const r = this.avatar && this.avatar.root;
        if (r) r.position.y += self._keyLift;
    };
}
