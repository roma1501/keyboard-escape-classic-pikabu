// GameHazards.js — опасности этапов «ASMR Keyboard Escape», расставленные маркерами карты (js/Maps.js):
//   ball-N / ballend-N   зефирные шары катятся от старта к концу (scale: радиус м, скорость ×100 px/с, период с)
//   wave-N / waveend-N   волна шоколада бежит по этапу (scale: полуширина ×100 px, высота ×100 px, скорость ×100 px/с)
//   chaser-N             монстр гонится за героем по своей территории (scale: радиус ×100 px, скорость ×100 px/с, тип 1…9: HAZARD_MONSTERS)
//   fan-N                ветер сдувает героя (прямоугольник scale[0]·100 × scale[2]·100, rot[1] — куда, scale[1] — сила ×100 px/с)
// Решения — по данным карты и ObbyCourse (инвариант 4: Babylon у логики не спрашивается); меши — только вид.
//
//   await GameHazards.build(app, ObbyCourse);
//   const cause = GameHazards.update(dt, hero, alive);   // 'ball' | 'wave' | 'monster' | null — смерть решает игра
//   GameHazards.reset();                                 // волны и шары с начала (возрождение)

/** Монстры по типу маркера chaser-N (scale[2]): модель, клипы, рост px, радиус тела. */
const HAZARD_MONSTERS = {
    // охранники — брейнрот-персонажи в Roblox-стиле (assets/models/guards, радиус тела — GUARDS.md)
    1: { id: 'tung_sahur', model: 'assets/models/guards/tung_sahur.glb', clips: 'assets/models/guards/tung_sahur_clips.glb', radius: 70, color: 0xb07a52 },
    2: { id: 'ballerina_cappuccina', model: 'assets/models/guards/ballerina_cappuccina.glb', clips: 'assets/models/guards/ballerina_cappuccina_clips.glb', radius: 70, color: 0xff9ad5 },
    3: { id: 'tralalero', model: 'assets/models/guards/tralalero.glb', clips: 'assets/models/guards/tralalero_clips.glb', radius: 75, color: 0x5ab8ff },
    4: { id: 'patapim', model: 'assets/models/guards/patapim.glb', clips: 'assets/models/guards/patapim_clips.glb', radius: 70, color: 0x8a5a3a },
    5: { id: 'bananini', model: 'assets/models/guards/bananini.glb', clips: 'assets/models/guards/bananini_clips.glb', radius: 65, color: 0xfbe86a },
    6: { id: 'cappuccino_assassino', model: 'assets/models/guards/cappuccino_assassino.glb', clips: 'assets/models/guards/cappuccino_assassino_clips.glb', radius: 70, color: 0xfff4e4 },
    // конфетные монстры
    7: { id: 'gummy_bear', model: 'assets/models/enemies/gummy_bear.glb', clips: 'assets/models/enemies/gummy_bear_clips.glb', radius: 90, color: 0xff4f6a },
    8: { id: 'choco_golem', model: 'assets/models/enemies/choco_golem.glb', clips: 'assets/models/enemies/choco_golem_clips.glb', radius: 100, color: 0x5a301a },
    9: { id: 'lolli_boss', model: 'assets/models/enemies/lolli_boss.glb', clips: 'assets/models/enemies/lolli_boss_clips.glb', radius: 95, color: 0xff7ae0 },
};

/** @satisfies {Record<string, any>} */
const GameHazards = {
    /** @type {any} */ app: null,
    /** @type {any} */ course: null,
    /** @type {any[]} */ balls: [],
    /** @type {any[]} */ waves: [],
    /** @type {any[]} */ chasers: [],
    /** @type {any[]} */ fans: [],
    /** @type {any[]} */ meshes: [],
    /** @type {any} */ ballProto: null,
    /** @type {any} */ waveProto: null,
    /** @type {((type: string, data: any) => void) | null} */ onEvent: null,
    time: 0,

    _named(name) {
        const re = new RegExp('^' + name + '-(\\d+)$');
        const out = [];
        for (const d of this.app.location.map.objects) {
            if (d.kind !== 'marker') continue;
            const m = re.exec(String(d.name));
            if (m) out.push({ n: Number(m[1]), d });
            else if (d.name === name) out.push({ n: 1, d });
        }
        return out.sort((a, b) => a.n - b.n);
    },

    _pt(d) {
        const rot = Array.isArray(d.rot) ? d.rot : [0, 0, 0], sc = Array.isArray(d.scale) ? d.scale : [1, 1, 1];
        return { x: Number(d.x) || 0, y: Number(d.h) || 0, z: Number(d.y) || 0, yaw: (Number(rot[1]) || 0) * Math.PI / 180, s0: Number(sc[0]) || 1, s1: Number(sc[1]) || 1, s2: Number(sc[2]) || 1 };
    },

    /** Высота опоры под точкой (верх деталей трассы) или null — пропасть. */
    ground(x, z, fromY) { return this.course.groundAt(x, z, fromY + 120, 900); },

    // ---------------------------------------------------------------------------------------------
    // Постройка
    // ---------------------------------------------------------------------------------------------

    async build(app, course, opts) {
        this.clear();
        this.app = app; this.course = course;
        this.onEvent = (opts && opts.onEvent) || null;
        this.getBots = (opts && opts.bots) || null;          // () => [{ actor, alive, kill(cause) }] — монстры, шары и волны сбивают и ботов
        this.playerBias = 0.55;                               // расстояние до игрока × это: игрок — предпочтительная цель
        const view = app.location.view;
        const ends = (name) => new Map(this._named(name).map(e => [e.n, this._pt(e.d)]));
        const ballEnds = ends('ballend'), waveEnds = ends('waveend');
        for (const e of this._named('ball')) {
            const a = this._pt(e.d), b = ballEnds.get(e.n);
            if (!b) continue;
            const len = Math.hypot(b.x - a.x, b.z - a.z);
            this.balls.push({ a, b, len, r: Math.max(40, a.s0 * 100), speed: Math.max(100, a.s1 * 100), period: Math.max(0.6, a.s2), t: e.n * 0.7, live: [] });
        }
        for (const e of this._named('wave')) {
            const a = this._pt(e.d), b = waveEnds.get(e.n);
            if (!b) continue;
            const len = Math.hypot(b.x - a.x, b.z - a.z);
            this.waves.push({ a, b, len, dir: [(b.x - a.x) / (len || 1), (b.z - a.z) / (len || 1)], W: Math.max(100, a.s0 * 100), H: Math.max(80, a.s1 * 100), speed: Math.max(100, a.s2 * 100), s: -400, wait: 2, mesh: null, fx: 0 });
        }
        for (const e of this._named('chaser')) {
            const p = this._pt(e.d), kind = HAZARD_MONSTERS[Math.round(p.s2)] || HAZARD_MONSTERS[1];
            this.chasers.push({ n: e.n, home: p, R: Math.max(300, p.s0 * 100), speed: Math.max(150, p.s1 * 100), kind, x: p.x, y: p.y, z: p.z, yaw: p.yaw, rig: null, mesh: null, state: 'idle', roar: 0 });
        }
        for (const e of this._named('fan')) {
            const p = this._pt(e.d);
            this.fans.push({ p, hx: Math.max(50, p.s0 * 100), hz: Math.max(50, p.s2 * 100), force: Math.max(0, p.s1 * 100), dir: [Math.cos(p.yaw), Math.sin(p.yaw)], mesh: null });
        }
        this._tuneChasers();
        await this._buildViews(view);
        this.reset();
        return this;
    },

    /** Скорость монстра — от рекомендованной Speed его этапа (этап — отрезок между соседними чекпоинтами, ближайший к логову). */
    _tuneChasers() {
        const U = 'undefined', k = typeof KE_CHASER_SPEED !== U ? KE_CHASER_SPEED : 1.08, vmin = typeof KE_CHASER_MIN !== U ? KE_CHASER_MIN : 560;
        const pts = [this.course.spawn].concat(this.course.checkpoints).filter(Boolean);
        for (const c of this.chasers) {
            let best = 1, bd = Infinity;
            for (let i = 1; i < pts.length + 1; i++) {
                const a = pts[i - 1], b = pts[i] || this.course.finish;
                if (!a || !b) continue;
                const dx = b.x - a.x, dz = b.z - a.z, L2 = dx * dx + dz * dz || 1;
                const t = Math.max(0, Math.min(1, ((c.x - a.x) * dx + (c.z - a.z) * dz) / L2));
                const d = Math.hypot(a.x + dx * t - c.x, a.z + dz * t - c.z);
                if (d < bd) { bd = d; best = i; }
            }
            c.stage = best;
            const st = GAME_STAGES[best - 1];
            const v = st ? GameProgress.speedToRun(st.req) * k : 0;
            c.speed = Math.max(c.speed, vmin, v);
        }
    },

    clear() {
        const view = this.app && this.app.location ? this.app.location.view : null;
        for (const c of this.chasers) if (c.rig) { try { c.rig.dispose(); } catch (e) { /* уже */ } }
        for (const m of this.meshes) { try { if (view) World3D.removeObject(view, m); m.dispose(); } catch (e) { /* уже */ } }
        this.balls = []; this.waves = []; this.chasers = []; this.fans = []; this.meshes = [];
        this.ballProto = this.waveProto = null;
    },

    async _model(url, view, name) {
        try {
            const model = await Model3D.load(url);
            const root = Model3D.build(model, view.scene, { name });
            if (root) { World3D.addObject(view, root, 'actor', { outline: false }); this.meshes.push(root); }
            return root;
        } catch (e) { return null; }
    },

    _fallback(view, kind, color, size) {
        const scene = view.scene;
        const m = kind === 'sphere' ? BABYLON.MeshBuilder.CreateSphere('hz-' + kind, { diameter: size, segments: 16 }, scene)
            : BABYLON.MeshBuilder.CreateBox('hz-' + kind, { width: size, height: size, depth: size }, scene);
        const mat = new BABYLON.StandardMaterial('hz-mat-' + kind, scene);
        mat.diffuseColor = BABYLON.Color3.FromHexString('#' + color.toString(16).padStart(6, '0'));
        m.material = mat;
        World3D.addObject(view, m, 'actor', { outline: false });
        this.meshes.push(m);
        return m;
    },

    async _buildViews(view) {
        // шары: прототип модели, клоны на каждый живой шар
        if (this.balls.length) {
            let proto = await this._model('assets/models/enemies/marsh_ball.glb', view, 'marsh-ball');
            this.ballDrop = proto ? -50 : 0;       // начало модели — низ шара (Ø 1 м): клон опускаем, чтобы центр был в узле-держателе
            if (!proto) proto = this._fallback(view, 'sphere', 0xfff0f6, 100);
            proto.setEnabled(false);
            this.ballProto = proto;
        }
        for (const w of this.waves) {
            let m = await this._model('assets/models/enemies/choco_wave.glb', view, 'choco-wave');
            if (!m) { m = this._fallback(view, 'box', 0x6b3a1e, 100); m.position.y = 0; }
            m.scaling.set(3.2, w.H / 100, (w.W * 2) / 100);
            m.rotation.y = -Math.atan2(w.dir[1], w.dir[0]);
            m.setEnabled(false);
            w.mesh = m;
        }
        for (const c of this.chasers) {
            try {
                const model = await Rig.load(c.kind.model);
                let lib = null;
                try { lib = await Rig.load(c.kind.clips); } catch (e) { lib = null; }
                c.rig = Rig.create(model, view, { name: 'monster-' + c.n, clips: lib ? [lib] : [] });
                c.rig.play('idle');
            } catch (e) {
                c.mesh = this._fallback(view, 'box', c.kind.color, 200);
            }
        }
        for (const f of this.fans) {
            // модель вентилятора стоит на карте рядом (если поставили); вид ветра — частицы игры
            f.fx = 0;
        }
    },

    /** Волны и шары — с начала цикла, монстры — по логовам (возрождение героя, телепорт). */
    reset() {
        for (const b of this.balls) { for (const l of b.live) this._ballGone(l, false); b.live = []; b.t = 0; }
        for (const w of this.waves) { w.s = -400; w.wait = 1.5; if (w.mesh) w.mesh.setEnabled(false); }
        for (const c of this.chasers) { c.x = c.home.x; c.y = c.home.y; c.z = c.home.z; c.state = 'idle'; this._placeChaser(c, 0); }
    },

    // ---------------------------------------------------------------------------------------------
    // Кадр
    // ---------------------------------------------------------------------------------------------

    /** @param {number} dt @param {any} hero тело героя (ноги x, y, z; radius, height) @param {boolean} alive @param {boolean} safe герой в Safe Zone */
    update(dt, hero, alive, safe) {
        this.time += dt;
        let cause = null;
        const bots = this.getBots ? this.getBots() : [];
        const hx = hero.x, hy = hero.y, hz = hero.z, hr = hero.radius || 28, hc = hy + (hero.height || 180) * 0.5;
        // --- шары: вырастают из пола с облачком пудры, катятся по верху колпачков со следом посыпки, в конце сдуваются
        const lift = typeof KE_KEY_LIFT !== 'undefined' ? KE_KEY_LIFT : 24;
        const fx = this.app && this.app.fx;
        for (const b of this.balls) {
            b.t -= dt;
            if (b.t <= 0 && b.live.length < 6 && this.ballProto) {
                b.t = b.period;
                const mesh = this.ballProto.clone('marsh-ball-live', null);
                if (mesh) {
                    const holder = new BABYLON.TransformNode('marsh-ball-holder', this.app.location.view.scene);
                    mesh.parent = holder; mesh.position.set(0, (this.ballDrop || 0) * (b.r * 2) / 100, 0);
                    mesh.setEnabled(true);
                    const s0 = (b.r * 2) / 100; mesh.scaling.set(s0, s0, s0);
                    const l = { d: 0, y: b.a.y, vy: 0, mesh, holder, spin: 0, age: 0, trail: null, gone: false };
                    if (fx) {
                        fx.create({ burst: 26, capacity: 30, life: [0.4, 0.9], size: [14, 30], speed: [80, 240], color: '#ffffff', color2: '#ffd1ec', duration: 0.05,
                            position: [b.a.x, b.a.y + lift + 10, b.a.z], direction: [[-1, 0.6, -1], [1, 1.4, 1]], gravity: [0, -300, 0], blend: 'standard', alpha: 0.85 });
                        l.trail = fx.create({ rate: 30, capacity: 40, life: [0.35, 0.7], size: [6, 12], speed: [10, 50], color: '#ffd1ec', color2: '#ffffff',
                            direction: [[-0.4, 0.6, -0.4], [0.4, 1, 0.4]], gravity: [0, -260, 0], follow: () => new BABYLON.Vector3(holder.position.x, holder.position.y - b.r * 0.7, holder.position.z) });
                    }
                    b.live.push(l);
                }
            }
            for (let i = b.live.length - 1; i >= 0; i--) {
                const l = b.live[i];
                l.age += dt;
                const grow = Math.min(1, l.age / 0.45), eg = 1 + 2.2 * Math.pow(grow - 1, 3) + 1.2 * Math.pow(grow - 1, 2);   // easeOutBack
                const moving = grow >= 0.6;
                if (moving) l.d += b.speed * dt;
                const k = l.d / (b.len || 1);
                const x = b.a.x + (b.b.x - b.a.x) * k, z = b.a.z + (b.b.z - b.a.z) * k;
                const g = this.ground(x, z, l.y);
                if (g != null && l.y <= g + 4) { l.y = g; l.vy = 0; } else { l.vy -= 3000 * dt; l.y += l.vy * dt; }
                if (moving) l.spin += (b.speed * dt) / b.r;
                const shrink = k > 0.93 ? Math.max(0, 1 - (k - 0.93) / 0.07) : 1;     // сдувается в конце пути
                const sc = Math.max(0.01, Math.min(eg, 1.15) * shrink);
                const onBoard = g != null && l.y <= g + 4;
                l.holder.position.set(x, l.y + (onBoard ? lift : 0) + b.r * sc, z);
                l.holder.scaling.set(sc, sc, sc);
                const yaw = Math.atan2(b.b.z - b.a.z, b.b.x - b.a.x);
                l.holder.rotation.set(0, -yaw, -l.spin);
                if (k >= 1 || l.y < this.course.killY) { this._ballGone(l, k >= 1); b.live.splice(i, 1); continue; }
                const R = b.r * sc;
                if (alive && !cause && sc > 0.5) {
                    const dx = hx - x, dy = hc - l.holder.position.y, dz = hz - z;
                    if (dx * dx + dy * dy + dz * dz < (R + hr) * (R + hr) * 0.9) cause = 'ball';
                }
                if (sc > 0.5) for (const bot of bots) {
                    const A = bot.actor, dx = A.x - x, dy = A.y + 90 - l.holder.position.y, dz = A.z - z;
                    if (dx * dx + dy * dy + dz * dz < (R + 28) * (R + 28) * 0.9) bot.kill('trap');
                }
            }
        }
        // --- волны
        const gap = typeof KE_WAVE_GAP !== 'undefined' ? KE_WAVE_GAP : 3.5;
        for (const w of this.waves) {
            if (w.wait > 0) { w.wait -= dt; if (w.wait <= 0) { w.s = -200; if (this.onEvent) this.onEvent('wave', w); } else { if (w.mesh) w.mesh.setEnabled(false); continue; } }
            w.s += w.speed * dt;
            if (w.s > w.len + 200) { w.wait = gap; if (w.mesh) w.mesh.setEnabled(false); continue; }
            const x = w.a.x + w.dir[0] * w.s, z = w.a.z + w.dir[1] * w.s;
            if (w.mesh) { w.mesh.setEnabled(true); w.mesh.position.set(x, w.a.y - 20, z); }
            if (alive && !cause) {
                const rx = hx - w.a.x, rz = hz - w.a.z;
                const along = rx * w.dir[0] + rz * w.dir[1], side = -rx * w.dir[1] + rz * w.dir[0];
                if (Math.abs(side) < w.W && along > w.s - 160 && along < w.s + 60 && hy < w.a.y + w.H - 20) cause = 'wave';
            }
            for (const bot of bots) {
                const A = bot.actor, rx = A.x - w.a.x, rz = A.z - w.a.z;
                const along = rx * w.dir[0] + rz * w.dir[1], side = -rx * w.dir[1] + rz * w.dir[0];
                if (Math.abs(side) < w.W && along > w.s - 160 && along < w.s + 60 && A.y < w.a.y + w.H - 20) bot.kill('trap');
            }
        }
        // --- монстры
        for (const c of this.chasers) {
            const dxh = hx - c.home.x, dzh = hz - c.home.z;
            const inside = alive && !safe && dxh * dxh + dzh * dzh < c.R * c.R;
            // цель: ближайший на территории; до игрока расстояние × playerBias — его монстр выбирает охотнее
            let target = null, best = Infinity;
            if (inside) { best = Math.hypot(hx - c.x, hz - c.z) * this.playerBias; target = { x: hx, y: hy, z: hz, player: true }; }
            for (const bot of bots) {
                const A = bot.actor, ex = A.x - c.home.x, ez = A.z - c.home.z;
                if (ex * ex + ez * ez > c.R * c.R) continue;
                const d = Math.hypot(A.x - c.x, A.z - c.z);
                if (d < best) { best = d; target = { x: A.x, y: A.y, z: A.z, bot }; }
            }
            let tx = c.home.x, tz = c.home.z, sp = c.speed * 0.5;
            if (target) { tx = target.x; tz = target.z; sp = target.player ? c.speed : c.speed * 0.9; if (c.state !== 'chase') { c.state = 'chase'; if (target.player && this.onEvent) this.onEvent('roar', c); } }
            else if (c.state === 'chase') c.state = 'home';
            const dx = tx - c.x, dz = tz - c.z, d = Math.hypot(dx, dz);
            let moving = false;
            if (d > 30) {
                const st = Math.min(d, sp * dt), nx = c.x + dx / d * st, nz = c.z + dz / d * st;
                const g = this.ground(nx, nz, c.y);
                // за край не идёт: у пропасти стоит и ревёт
                if (g != null && Math.abs(g - c.y) < 160) { c.x = nx; c.z = nz; c.y = g; moving = true; }
                c.yaw = Math.atan2(dz, dx);
            }
            if (c.state === 'home' && d < 40) c.state = 'idle';
            if (c.rig) c.rig.play(moving ? 'run' : 'idle', { speed: moving ? Math.max(0.8, sp / 420) : 1 });
            this._placeChaser(c, dt);
            const reach = (typeof KE_CHASER_CATCH !== 'undefined' ? KE_CHASER_CATCH : 70) + c.kind.radius * 0.6;
            if (inside && !cause) {
                const cd = Math.hypot(hx - c.x, hz - c.z);
                if (cd < reach && Math.abs(hy - c.y) < 220) { cause = 'monster'; if (c.rig) c.rig.play('attack', { layer: 'upper', loop: false }); }
            }
            if (target && target.bot) {
                const A = target.bot.actor;
                if (Math.hypot(A.x - c.x, A.z - c.z) < reach && Math.abs(A.y - c.y) < 220) { target.bot.kill('trap'); if (c.rig) c.rig.play('attack', { layer: 'upper', loop: false }); }
            }
        }
        // --- ветер
        if (alive) for (const f of this.fans) {
            const rx = hx - f.p.x, rz = hz - f.p.z;
            const lx = rx * Math.cos(f.p.yaw) + rz * Math.sin(f.p.yaw), lz = -rx * Math.sin(f.p.yaw) + rz * Math.cos(f.p.yaw);
            if (Math.abs(lx) < f.hx && Math.abs(lz) < f.hz && hy < f.p.y + 600) {
                const k = 1 - Math.abs(lx) / f.hx * 0.4;
                hero.x += f.dir[0] * f.force * k * dt;
                hero.z += f.dir[1] * f.force * k * dt;
                f.fx = 1;
            } else f.fx = 0;
        }
        return cause;
    },

    /** Шар закончил путь: хлопок пудры (puff), след гаснет, меши уходят. */
    _ballGone(l, puff) {
        const fx = this.app && this.app.fx;
        if (puff && fx && l.holder) {
            const p = l.holder.position;
            fx.create({ burst: 22, capacity: 26, life: [0.3, 0.7], size: [12, 26], speed: [120, 320], color: '#ffffff', color2: '#ffb8e0', duration: 0.05,
                position: [p.x, p.y, p.z], blend: 'standard', alpha: 0.85, gravity: [0, -200, 0] });
        }
        if (l.trail) { try { l.trail.stop(); } catch (e) { /* уже */ } }
        try { l.mesh.dispose(); if (l.holder) l.holder.dispose(); } catch (e) { /* уже */ }
    },

    _placeChaser(c, dt) {
        const node = c.rig ? c.rig.root : c.mesh;
        if (!node) return;
        node.position.set(c.x, c.y + (c.rig ? 0 : 100), c.z);
        node.rotation.y = -c.yaw;
        void dt;
    },

    /** Мир ветров для частиц: [{ x, z, y, dir, on }]. */
    windSpots() { return this.fans.map(f => ({ x: f.p.x, y: f.p.y, z: f.p.z, dir: f.dir, hx: f.hx, hz: f.hz, on: f.fx })); },
};
