// GameWorld.js — мир «ASMR Keyboard Escape» вокруг героя: точки взаимодействия хаба и Safe Zone по маркерам карты
// (stand-*, portal, treadmill-N, winpad-N, stage-N), таблички над воротами и киосками, доска рекордов в мире,
// и косметика на герое: шапка на голове, питомец рядом, лента трейла, аура, эмоции (позы блочного героя).
// Решения (Speed, Wins) — Game.js и GameProgress.js; здесь — поиск ближайшей точки и вид.
//
//   GameWorld.build(app, ObbyCourse);                         // под загрузкой, после ObbyCourse.build
//   const near = GameWorld.near(hero);                        // { kind: 'stand'|'portal'|'treadmill'|'winpad'|'stage', id, n, tier, m }
//   await GameWorld.dress(hero, { look, hat, pet, trail, aura });   // надеть косметику (повторяемо)
//   GameWorld.update(dt, hero, state);                        // питомец, трейл, эмоция, таблички

/** Подписи табличек над киосками (ключи Lang есть в Game.js). */
const WORLD_STANDS = ['trails', 'auras', 'rebirth', 'shop', 'daily', 'wheel', 'top'];

/** Продавцы киосков: имя, наряд (look героя), шапка, реплики ru/en при встрече. */
const WORLD_NPCS = {
    trails: { name: { ru: 'Мятная Мия', en: 'Minty Mia' }, look: { skin: 0xffe0c4, shirt: 0x7ef0c8, pants: 0xffffff, hair: 'long', hairColor: 0xff9ad5, cap: -1 }, hat: 'assets/models/hats/cone_hat.glb',
        hi: { ru: ['Трейл ускорит каждый шаг!', 'Свежие трейлы, прямо из морозилки!', 'Хочешь бегать в 5 раз быстрее?'], en: ['A trail boosts every step!', 'Fresh trails, straight from the freezer!', 'Wanna run 5x faster?'] } },
    auras: { name: { ru: 'Маг Карамель', en: 'Caramel Mage' }, look: { skin: 0xf4c9a0, shirt: 0xa77bff, pants: 0x3a2370, hair: 'spiky', hairColor: 0xffffff, cap: -1 }, hat: 'assets/models/hats/wizard_hat.glb',
        hi: { ru: ['Аура сияет и ускоряет!', 'Чувствую в тебе скорость...', 'Звёздная аура ждёт тебя!'], en: ['An aura shines and speeds you up!', 'I sense speed in you...', 'The starlight aura awaits!'] } },
    rebirth: { name: { ru: 'Король Пломбир', en: 'King Sundae' }, look: { skin: 0xffe0c4, shirt: 0xffd23f, pants: 0x8a5cf0, hair: 'short', hairColor: 0x7a4426, cap: -1 }, hat: 'assets/models/hats/candy_crown.glb',
        hi: { ru: ['Переродись — стань быстрее навсегда!', 'Перерождение умножит твою силу!', 'Достигни уровня — и приходи ко мне!'], en: ['Rebirth and be faster forever!', 'Rebirth multiplies your power!', 'Reach the level and come to me!'] } },
    shop: { name: { ru: 'Модница Зефирка', en: 'Fashion Mallow' }, look: { skin: 0xfff0e0, shirt: 0xff5fa8, pants: 0xffffff, hair: 'long', hairColor: 0x3a2418, cap: -1 }, hat: 'assets/models/hats/bow.glb',
        hi: { ru: ['Новые скины и питомцы!', 'Примерь шапку — тебе пойдёт!', 'Заходи, у меня всё сладкое!'], en: ['New skins and pets!', 'Try a hat on, it suits you!', 'Come in, everything is sweet!'] } },
    daily: { name: { ru: 'Дед Подарок', en: 'Grandpa Gift' }, look: { skin: 0xf7d2b0, shirt: 0xff4f6a, pants: 0x2fa884, hair: 'short', hairColor: 0xffffff, cap: -1 }, hat: 'assets/models/hats/party_hat.glb',
        hi: { ru: ['Подарок дня ждёт тебя!', 'Заходи каждый день — будет скин!', 'Сюрприз! Сюрприз!'], en: ['Your daily gift is waiting!', 'Come every day for a skin!', 'Surprise! Surprise!'] } },
    wheel: { name: { ru: 'Крутилка Лола', en: 'Spinny Lola' }, look: { skin: 0xffe0c4, shirt: 0xfbe86a, pants: 0x5ab8ff, hair: 'spiky', hairColor: 0xff7ab8, cap: -1 }, hat: 'assets/models/hats/propeller.glb',
        hi: { ru: ['Крутани колесо удачи!', 'Сегодня точно повезёт!', 'Бесплатное вращение каждый день!'], en: ['Spin the wheel of luck!', 'Today is your lucky day!', 'A free spin every day!'] } },
    top: { name: { ru: 'Диджей Клик', en: 'DJ Click' }, look: { skin: 0xc68a5e, shirt: 0x5ab8ff, pants: 0x2a2246, hair: 'short', hairColor: 0x1b1b24, cap: 0xff5fa8 }, hat: 'assets/models/hats/headphones.glb',
        hi: { ru: ['Самые быстрые — в моём топе!', 'Обгони их всех!', 'Кто следующий рекордсмен?'], en: ['The fastest are on my board!', 'Beat them all!', 'Who is the next record holder?'] } },
};

/** @satisfies {Record<string, any>} */
const GameWorld = {
    /** @type {any} */ app: null,
    /** @type {any} */ course: null,
    /** @type {any[]} */ points: [],
    /** @type {any[]} */ signs: [],
    /** @type {any} */ board: null,
    /** @type {any} */ hat: null,
    /** @type {any} */ pet: null,
    /** @type {any} */ petPos: null,
    /** @type {any} */ trail: null,
    /** @type {any} */ trailNode: null,
    /** @type {any} */ aura: null,
    /** @type {any} */ dressed: {},
    emote: '', emoteT: 0,
    /** @type {any[]} */ npcs: [],
    /** @type {any} */ tags: null,

    _named(name) {
        const re = new RegExp('^' + name + '-(\\d+)$'), out = [];
        for (const d of this.app.location.map.objects) {
            if (d.kind !== 'marker') continue;
            const m = re.exec(String(d.name));
            if (m) out.push({ n: Number(m[1]), d });
            else if (d.name === name) out.push({ n: 0, d });
        }
        return out.sort((a, b) => a.n - b.n);
    },
    _pt(d) {
        const rot = Array.isArray(d.rot) ? d.rot : [0, 0, 0], sc = Array.isArray(d.scale) ? d.scale : [1, 1, 1];
        return { x: Number(d.x) || 0, y: Number(d.h) || 0, z: Number(d.y) || 0, yaw: (Number(rot[1]) || 0) * Math.PI / 180, s0: Number(sc[0]) || 1, s1: Number(sc[1]) || 1, s2: Number(sc[2]) || 1 };
    },

    // ---------------------------------------------------------------------------------------------
    // Постройка
    // ---------------------------------------------------------------------------------------------

    async build(app, course) {
        this.clear();
        this.app = app; this.course = course;
        const add = (kind, id, d, n, r, extra) => { const p = this._pt(d); const pt = Object.assign({ kind, id, n, x: p.x, y: p.y, z: p.z, yaw: p.yaw, r }, extra || {}); this.points.push(pt); return Object.assign(p, { point: pt }); };
        for (const s of WORLD_STANDS) {
            const m = this.app.location.marker('stand-' + s);
            if (!m) continue;
            const p = add('stand', s, m, 0, Math.max(160, this._pt(m).s0 * 100));
            this._sign(p.x, p.y + 470, p.z, Lang.t('world.stand.' + s), '#ff4fa3', 520);
        }
        const portal = this.app.location.marker('portal');
        if (portal) { const p = add('portal', 'portal', portal, 0, Math.max(180, this._pt(portal).s0 * 100)); this._sign(p.x, p.y + 600, p.z, Lang.t('world.portal'), '#a77bff', 560); }
        for (const e of this._named('treadmill')) {
            const p = this._pt(e.d), tier = Math.max(1, Math.min(4, Math.round(p.s1)));
            // Safe Zone рядом (номер checkpoint) — «акция» на дорожку этой зоны
            let zone = 0;
            for (const c of course.checkpoints) if (Math.hypot(c.x - p.x, c.z - p.z) < 1100) zone = c.n;
            const off = zone ? GameProgress.treadmillDeal(zone, tier) : 0;
            const pt = add('treadmill', 'treadmill-' + e.n, e.d, e.n, 120, { tier, zone, off }).point;
            const t = GAME_TREADMILLS[tier - 1];
            if (tier > 1) {
                const sign = this._sign(p.x, p.y + 330, p.z, 'x' + t.mult + ' ' + Lang.t('world.treadmill'), '#' + t.color.toString(16).padStart(6, '0'), 380,
                    off ? Lang.t('world.deal', { n: Math.round(off * 100) }) : '');
                /** @type {any} */ (pt).sign = sign; /** @type {any} */ (pt).signText = 'x' + t.mult + ' ' + Lang.t('world.treadmill');
            }
            void pt;
        }
        for (const e of this._named('winpad')) {
            add('winpad', 'winpad-' + e.n, e.d, e.n, Math.max(110, this._pt(e.d).s0 * 100));
        }
        for (const e of this._named('stage')) {
            const st = GAME_STAGES[e.n - 1];
            const p = add('stage', 'stage-' + e.n, e.d, e.n, Math.max(200, this._pt(e.d).s0 * 100));
            if (st) this._sign(p.x, p.y + 560, p.z, Lang.t('world.stage', { n: e.n }) + ' · ⚡' + GameProgress.fmt(st.req), st.color, 640, (st.name[Lang.code] || st.name.en));
        }
        this._seatProps();
        await this._propColliders();
        const top = this.app.location.marker('stand-top');
        if (top) { const p = this._pt(top); this.board = this._sign(p.x, p.y + 760, p.z, '', '#5a301a', 620, '', 1.15); }
        return this;
    },

    /** Предметы хаба на плитах-клавиатурах встают на колпачки (KE_KEY_LIFT), а под ними колпачков нет — без наложений. */
    _seatProps() {
        const lift = typeof KE_KEY_LIFT !== 'undefined' ? KE_KEY_LIFT : 24;
        const R = { winpad: 140, treadmill: 150, fountain: 320, stand_: 170, portal: 90, stage_gate: 70 };
        const excl = [];
        for (const rec of this.app.location.objects) {
            const m = String(rec.def.model || '');
            if (!rec.mesh || !/models\/(hub|landmarks|enemies)\//.test(m)) continue;
            const x = rec.mesh.position.x, z = rec.mesh.position.z, y = rec.mesh.position.y;
            const hit = this.course.rayDown(x, y + 80, z, 260);
            if (!hit || !hit.col || !GameKeys.isBoard(hit.col.piece)) continue;
            rec.mesh.position.y = hit.y + lift - 2;
            const key = Object.keys(R).find(k => m.includes('/' + k));
            const sc = Array.isArray(rec.def.scale) ? Number(rec.def.scale[0]) || 1 : 1;
            if (key && key !== 'stage_gate' && key !== 'portal') excl.push({ x, z, r: R[key] * sc });
        }
        GameKeys.setExclusions(excl);
    },

    /** Коллайдер трассы для предмета карты: box | cyl в мировых px; wall — стена (иначе на верх можно встать). */
    _col(kind, x, y, z, yawDeg, hx, hz, y0, y1, wall) {
        const R = this.course.rotation([0, yawDeg, 0]);
        /** @type {any} */
        const c = { kind, O: [x, y, z], ax: R.ax, ay: R.ay, az: R.az, aabb: [0, 0, 0, 0, 0, 0], y0, y1, enabled: true, dynamic: false, wall: !!wall, piece: null, prop: true };
        if (kind === 'cyl') { c.rx = hx; c.rz = hz; } else { c.hx = hx; c.hz = hz; }
        this.course._aabb(c);
        this.course.colliders.push(c);
        this.course._insert(c);
        return c;
    },

    /**
     * Твёрдые предметы хаба и мира: киоски, фонтан, ориентиры — стены по габариту модели; ворота этапов, портал и арка-пончик —
     * только боковые столбы (проход свободен); дорожки и Wins-пады — низкие опоры, на них встают. Декор на плитах — ствол.
     * Габарит — model.min/max (px модели) × scale, поворот — курс объекта карты. Боты и камера видят их так же (ObbyCourse).
     */
    async _propColliders() {
        let n = 0;
        for (const rec of this.app.location.objects) {
            const m = String(rec.def.model || '');
            if (!m || rec.def.kind === 'marker' || /safezone_floor_ring|cotton_cloud|choco_wave|marsh_ball/.test(m)) continue;
            const kind = /\/hub\//.test(m) ? 'hub' : /\/landmarks\//.test(m) ? 'land' : /\/nature\//.test(m) ? 'deco' : /enemies\/fan/.test(m) ? 'fan' : '';
            if (!kind) continue;
            let model = null;
            try { model = await Model3D.load(m); } catch (e) { model = null; }
            if (!model || !model.min || !model.max) continue;
            const sc = Array.isArray(rec.def.scale) ? rec.def.scale.map(Number) : [1, 1, 1];
            const sx = sc[0] || 1, sy = sc[1] || 1, sz = sc[2] || 1;
            const minX = model.min[0] * sx, maxX = model.max[0] * sx, minZ = model.min[2] * sz, maxZ = model.max[2] * sz, H = model.max[1] * sy;
            const yaw = Array.isArray(rec.def.rot) ? Number(rec.def.rot[1]) || 0 : 0;
            const pos = rec.mesh ? rec.mesh.position : null;
            const x = pos ? pos.x : Number(rec.def.x) || 0, z = pos ? pos.z : Number(rec.def.y) || 0;
            const y = pos ? pos.y : this.course.groundAt(x, z, 3000, 6000) || 0;
            // центр габарита (модель может быть смещена от начала)
            const cxL = (minX + maxX) / 2, czL = (minZ + maxZ) / 2, hx = (maxX - minX) / 2, hz = (maxZ - minZ) / 2;
            const yr = -yaw * Math.PI / 180, cs = Math.cos(-yr), sn = Math.sin(-yr);
            const at = (lx, lz) => [x + lx * cs - lz * sn, z + lx * sn + lz * cs];
            const box = (lx, lz, bx, bz, y0, y1, wall) => { const p = at(lx, lz); this._col('box', p[0], y, p[1], yaw, bx, bz, y0, y1, wall); n++; };
            if (/stage_gate|portal|donut_arch/.test(m)) {
                const post = Math.max(30, Math.min(hz * 0.18, 70));      // столбы по краям ширины (ось Z модели)
                box(cxL, czL - hz + post, Math.max(30, hx), post, 0, H, true);
                box(cxL, czL + hz - post, Math.max(30, hx), post, 0, H, true);
            } else if (/treadmill/.test(m)) {
                const top = /treadmill_t\d/.test(m) ? 14 * sy : Math.min(40, H * 0.6);
                box(cxL, czL, hx, hz, -40, top, false);                   // встать на ленту
                box(maxX - 18 * sx, czL, 18 * sx, hz, 0, H, true);       // пульт спереди
            } else if (/winpad/.test(m)) {
                const p = at(cxL, czL); this._col('cyl', p[0], y, p[1], 0, hx, hz, -40, Math.min(26, H), false); n++;
            } else if (kind === 'deco') {
                const r = Math.max(22, Math.min(hx, hz) * 0.3);
                const p = at(cxL, czL); this._col('cyl', p[0], y, p[1], 0, r, r, 0, H, true); n++;
            } else if (/fountain|cake_tower|ice_cream_tower|giant_lollipop/.test(m)) {
                const r = Math.min(hx, hz) * (/giant_lollipop/.test(m) ? 0.25 : 0.85);
                const p = at(cxL, czL); this._col('cyl', p[0], y, p[1], 0, r, r, 0, H, true); n++;
            } else box(cxL, czL, hx * 0.92, hz * 0.92, 0, H, true);
        }
        this.propColliders = n;
    },

    /** Продавцы у киосков: герой-риг со своим нарядом и шапкой, табличка с именем; реагируют на игрока (update → _npcs). */
    async spawnNpcs(tags) {
        this.tags = tags;
        for (const n of this.npcs) { try { n.body.dispose(); } catch (e) { /* уже */ } }
        this.npcs = [];
        for (const id of WORLD_STANDS) {
            const mk = this.app.location.marker('stand-' + id), def = WORLD_NPCS[id];
            if (!mk || !def) continue;
            const p = this._pt(mk);
            // киоск — модель hub/stand_<id>; продавец у прилавка, сбоку, лицом к площади
            const kiosk = this.app.location.objects.find(r => String(r.def.model || '').includes('/stand_' + id + '.'));
            const kx = kiosk && kiosk.mesh ? kiosk.mesh.position.x : p.x, kz = kiosk && kiosk.mesh ? kiosk.mesh.position.z : p.z;
            let fx = p.x - kx, fz = p.z - kz; const L = Math.hypot(fx, fz) || 1; fx /= L; fz /= L;
            const x = kx + fx * 215 - fz * 175, z = kz + fz * 215 + fx * 175;
            const g = this.course.groundAt(x, z, p.y + 200, 600), y = g == null ? p.y : g;
            const body = /** @type {any} */ (GameHero.create(this.course, this.app.location.view, { look: def.look, x, y, z, yaw: Math.atan2(fz, fx) }));
            body.place(x, y, z, Math.atan2(fz, fx));
            const npc = { id, def, body, home: Math.atan2(fz, fx), tagId: 'npc-' + id, near: false, reactT: 0 };
            if (def.hat) {
                try {
                    const root = Model3D.build(await Model3D.load(def.hat), this.app.location.view.scene, { name: 'npc-hat' });
                    if (root) {
                        World3D.addObject(this.app.location.view, root, 'actor', { outline: false });
                        if (body.attachHat) body.attachHat(root); else { root.parent = body.avatar.head; root.position.set(0, 20, 0); }
                    }
                } catch (e) { /* без шапки */ }
            }
            this._col('cyl', x, y, z, 0, 34, 34, 0, 170, true);   // продавец твёрдый
            if (tags) tags.add(npc.tagId, def.name[Lang.code] || def.name.en);
            this.npcs.push(npc);
        }
    },

    /** Продавец отвечает на событие игрока: 'open' (окно открыто), 'buy' (покупка). */
    npcReact(id, kind) {
        const n = this.npcs.find(q => q.id === id);
        if (!n) return;
        const ru = Lang.code === 'ru';
        const lines = kind === 'buy' ? (ru ? ['Отличный выбор!', 'Носи с удовольствием!', 'Спасибо за покупку!'] : ['Great choice!', 'Enjoy it!', 'Thanks for shopping!'])
            : (ru ? ['Выбирай!', 'Смотри, что есть!', 'Для тебя — лучшее!'] : ['Take a look!', 'Pick anything!', 'Only the best for you!']);
        if (this.tags) this.tags.say(n.tagId, lines[Math.floor(Math.random() * lines.length)], 2.6);
        if (n.body.emote) n.body.emote(kind === 'buy' ? 'clap' : 'cheer', 2);
        n.waveT = 1.6;
    },

    _npcs(dt, hero) {
        for (const n of this.npcs) {
            const b = n.body, dx = hero.x - b.x, dz = hero.z - b.z, d = Math.hypot(dx, dz);
            const near = d < 700;
            // смотрит на игрока, когда тот рядом; иначе — на площадь
            const want = d < 1100 ? Math.atan2(dz, dx) : n.home;
            let a = want - b.yaw; a = Math.atan2(Math.sin(a), Math.cos(a));
            b.yaw += a * Math.min(1, dt * 6);
            b.step(dt, {});
            if (near && !n.near && n.reactT <= 0) {
                n.reactT = 14; n.waveT = 2.2;
                const hi = n.def.hi[Lang.code] || n.def.hi.en;
                if (this.tags) this.tags.say(n.tagId, hi[Math.floor(Math.random() * hi.length)], 3);
                if (b.emote) b.emote('wave', 2.2);
            }
            n.near = near; n.reactT -= dt; n.waveT = (n.waveT || 0) - dt;
            if (b.pose) b.pose('idle', dt);
            // блочный продавец движка (нет клипов) машет рукой сам
            if (!b.emote && n.waveT > 0 && b.avatar && b.avatar.armR) b.avatar.armR.rotation.z = 2.5 + Math.sin(performance.now() / 110) * 0.45;
            if (this.tags) this.tags.place(n.tagId, b.x, b.y + (b.height || 180) + 40, b.z, d < 3000);
        }
    },

    clear() {
        for (const s of this.signs) { try { s.mesh.dispose(false, true); } catch (e) { /* уже */ } }
        this.signs = []; this.points = []; this.board = null;
    },

    /** Табличка-плашка над точкой: всегда к камере по вертикали, рисуется холстом. */
    _sign(x, y, z, text, color, width, sub, tall) {
        const scene = this.app.location.view.scene;
        const W = 512, H = Math.round(256 * (tall || (sub ? 0.62 : 0.4)) * 2) / 2 | 0;
        const tex = new BABYLON.DynamicTexture('sign-tex', { width: W, height: Math.max(64, H) }, scene, true);
        tex.hasAlpha = true;
        const plane = BABYLON.MeshBuilder.CreatePlane('sign', { width, height: width * Math.max(64, H) / W }, scene);
        const mat = new BABYLON.StandardMaterial('sign-mat', scene);
        mat.diffuseTexture = tex; mat.emissiveColor = new BABYLON.Color3(1, 1, 1); mat.disableLighting = true;
        mat.useAlphaFromDiffuseTexture = true; mat.backFaceCulling = false;
        plane.material = mat;
        plane.position.set(x, y, z);
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
        plane.isPickable = false;
        plane.renderingGroupId = World3D.LAYER && World3D.LAYER.OVERLAY != null ? World3D.LAYER.OVERLAY : 0;
        const s = { mesh: plane, tex, color, sub: sub || '', W, H: Math.max(64, H) };
        this.signs.push(s);
        this._paintSign(s, text);
        return s;
    },

    _paintSign(s, text, lines) {
        const ctx = /** @type {CanvasRenderingContext2D} */ (/** @type {any} */ (s.tex.getContext()));
        if (!ctx) return;
        const W = s.W, H = s.H, r = 34;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(40,22,14,0.86)';
        ctx.beginPath(); ctx.moveTo(r, 4); ctx.arcTo(W - 4, 4, W - 4, H - 4, r); ctx.arcTo(W - 4, H - 4, 4, H - 4, r); ctx.arcTo(4, H - 4, 4, 4, r); ctx.arcTo(4, 4, W - 4, 4, r); ctx.fill();
        ctx.lineWidth = 8; ctx.strokeStyle = s.color; ctx.stroke();
        const font = (px) => '900 ' + px + 'px ' + (getComputedStyle(document.documentElement).getPropertyValue('--ke-font') || '"Nunito", system-ui, sans-serif');
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        if (lines) {
            ctx.font = font(42); ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#2a160c'; ctx.lineWidth = 8;
            ctx.strokeText(text, W / 2, 46); ctx.fillText(text, W / 2, 46);
            ctx.font = font(30); ctx.textAlign = 'left';
            lines.forEach((ln, i) => {
                const y = 100 + i * 40;
                ctx.fillStyle = ln.me ? '#7ef0c8' : '#ffffff';
                ctx.fillText(ln.rank + '. ' + ln.name, 36, y);
                ctx.textAlign = 'right'; ctx.fillText('⚡' + GameProgress.fmt(ln.score), W - 36, y); ctx.textAlign = 'left';
            });
        } else {
            const main = s.sub ? H * 0.36 : H / 2;
            ctx.font = font(s.sub ? 54 : 58); ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#2a160c'; ctx.lineWidth = 10;
            ctx.strokeText(text, W / 2, main); ctx.fillText(text, W / 2, main);
            if (s.sub) { ctx.font = font(36); ctx.fillStyle = s.color; ctx.lineWidth = 8; ctx.strokeText(s.sub, W / 2, H * 0.74); ctx.fillText(s.sub, W / 2, H * 0.74); }
        }
        s.tex.update(true);
    },

    /** Открытый уровень дорожки — у табличек «акции» гаснет строка скидки. */
    refreshDeals() {
        for (const p of this.points) {
            const s = p.kind === 'treadmill' && p.sign;
            if (!s || !p.off) continue;
            const owned = GameProgress.treadmillOwned(p.tier);
            const sub = owned ? '' : Lang.t('world.deal', { n: Math.round(p.off * 100) });
            if (s.sub !== sub) { s.sub = sub; this._paintSign(s, p.signText); }
        }
    },

    /** Доска рекордов в хабе: [{ rank, name, score, me }]. */
    setBoard(rows) { if (this.board) this._paintSign(this.board, Lang.t('world.top'), rows.slice(0, 8)); },

    /** Ближайшая точка взаимодействия к герою (по кругу и высоте). */
    near(hero) {
        let best = null, bd = Infinity;
        for (const p of this.points) {
            const d = Math.hypot(hero.x - p.x, hero.z - p.z);
            if (d < p.r && Math.abs(hero.y - p.y) < 260 && d < bd) { best = p; bd = d; }
        }
        return best;
    },

    // ---------------------------------------------------------------------------------------------
    // Косметика
    // ---------------------------------------------------------------------------------------------

    /** Надеть: look (цвета и волосы), hat / pet (пути моделей), trail (запись GAME_TRAILS), aura (GAME_AURAS). */
    async dress(hero, o) {
        const view = this.app.location.view, scene = view.scene;
        const key = JSON.stringify([o.look, o.hat, o.pet, o.trail && o.trail.id, o.aura && o.aura.id]);
        if (this.dressed.key === key && this.dressed.hero === hero) return;
        this.dressed = { key, hero };
        const rigged = typeof KeCharacter !== 'undefined' && hero instanceof KeCharacter;
        // вид героя: риг — перекраска частей; блочный герой движка — новый аватар с этим look (тело и физика те же)
        if (o.look && rigged) { hero.setLook(o.look); this.hat = null; }
        else if (o.look) {
            const old = hero.avatar;
            hero.avatar = ObbyAvatar.create(view, o.look, hero.height);
            if (old) old.dispose();
            this.hat = null;
            hero.sync();
        }
        // шапка
        if (rigged) hero.attachHat(null);
        else if (this.hat) { try { this.hat.dispose(false, true); } catch (e) { /* нет */ } this.hat = null; }
        if (o.hat && rigged) {
            try {
                const root = Model3D.build(await Model3D.load(o.hat), scene, { name: 'hat' });
                if (root) { hero.attachHat(root); this.hat = root; }
            } catch (e) { console.warn('GameWorld: шапка', e); }
        } else if (o.hat) {
            try {
                const model = await Model3D.load(o.hat);
                const root = Model3D.build(model, scene, { name: 'hat' });
                if (root) {
                    World3D.addObject(view, root, 'actor', { outline: false });
                    root.parent = hero.avatar.head;
                    root.position.set(0, 20, 0);
                    this.hat = root;
                }
            } catch (e) { console.warn('GameWorld: шапка', e); }
        }
        // питомец
        if (this.pet) { try { this.pet.dispose(false, true); } catch (e) { /* нет */ } this.pet = null; }
        if (o.pet) {
            try {
                const model = await Model3D.load(o.pet);
                const root = Model3D.build(model, scene, { name: 'pet' });
                if (root) { World3D.addObject(view, root, 'actor', { outline: false }); this.pet = root; this.petPos = null; }
            } catch (e) { console.warn('GameWorld: питомец', e); }
        }
        // трейл: лента за спиной
        if (this.trail) { try { this.trail.dispose(); } catch (e) { /* нет */ } this.trail = null; }
        if (!this.trailNode) this.trailNode = new BABYLON.TransformNode('trail-node', scene);
        if (o.trail && BABYLON.TrailMesh) {
            const tr = new BABYLON.TrailMesh('trail', this.trailNode, scene, 34, 42, true);
            const mat = new BABYLON.StandardMaterial('trail-mat', scene);
            const c = o.trail.colors[0], c2 = o.trail.colors[1];
            mat.emissiveColor = BABYLON.Color3.FromHexString('#' + c.toString(16).padStart(6, '0'));
            mat.diffuseColor = BABYLON.Color3.FromHexString('#' + c2.toString(16).padStart(6, '0'));
            mat.disableLighting = true; mat.alpha = 0.72; mat.backFaceCulling = false;
            tr.material = mat;
            tr.renderingGroupId = World3D.LAYER && World3D.LAYER.OVERLAY != null ? World3D.LAYER.OVERLAY : 0;
            tr.isPickable = false;
            this.trail = tr;
            this.trail._ke = o.trail;
        }
        // аура: мягкое кольцо искр вокруг героя
        if (this.aura) { try { this.aura.dispose(); } catch (e) { /* нет */ } this.aura = null; }
        if (o.aura && this.app.fx) {
            const col = '#' + o.aura.color.toString(16).padStart(6, '0');
            this.aura = this.app.fx.create({
                rate: 26, capacity: 70, life: [0.6, 1.2], size: [8, 18], speed: [10, 40], color: col, color2: '#ffffff',
                box: [[-50, 0, -50], [50, 160, 50]], direction: [[-0.2, 1, -0.2], [0.2, 1.6, 0.2]], gravity: [0, 40, 0],
                follow: () => new BABYLON.Vector3(hero.x, hero.y + 10, hero.z),
                sizeGradient: [[0, 0.3], [0.3, 1], [1, 0]], colorGradient: [[0, col, 0], [0.25, col, 0.9], [1, '#ffffff', 0]],
            });
        }
    },

    /** Эмоция (Wins-пад, финиш): id из Shop-слота emote, длительность с. */
    playEmote(id, sec) {
        const h = this.dressed.hero;
        if (h && typeof KeCharacter !== 'undefined' && h instanceof KeCharacter) { h.emote(id || 'cheer', sec || 2.4); return; }
        this.emote = id || 'cheer'; this.emoteT = sec || 2.4;
    },

    /** Поза эмоции поверх позы героя (зовётся после hero.pose). */
    _emotePose(hero, dt) {
        const a = hero.avatar, t = (this.emoteT -= dt), w = this.emote;
        if (t <= 0) { this.emote = ''; return; }
        const T = 2.4 - t, s = Math.sin(T * 10);
        const set = (la, ra, ll, rl, bob, spin, roll) => {
            a.armL.rotation.z = la; a.armR.rotation.z = ra; a.legL.rotation.z = ll; a.legR.rotation.z = rl;
            a.body.position.y = bob; a.body.rotation.y = spin; a.body.rotation.z = roll || 0;
        };
        switch (w) {
            case 'wave': set(0, 2.6 + s * 0.4, 0, 0, 0, 0); break;
            case 'spin': set(1.4, 1.4, 0, 0, 0, T * 9); break;
            case 'jump': set(2.8, 2.8, 0.4, -0.4, Math.abs(Math.sin(T * 6)) * 60, 0); break;
            case 'dance': set(1.6 + s * 0.8, 1.6 - s * 0.8, s * 0.5, -s * 0.5, Math.abs(s) * 10, Math.sin(T * 5) * 0.6); break;
            case 'flip': set(2.8, 2.8, 0.6, 0.6, Math.sin(Math.min(1, T / 0.8) * Math.PI) * 90, 0, Math.min(1, T / 0.8) * Math.PI * 2); break;
            case 'robot': set(Math.round(s) * 1.4, -Math.round(s) * 1.4, 0, 0, 0, Math.round(Math.sin(T * 3)) * 0.5); break;
            case 'floss': set(0.6 + s * 0.6, -0.6 + s * 0.6, 0, 0, Math.abs(s) * 6, s * 0.25); break;
            case 'sit': set(1.2, 1.2, 1.5, 1.5, -40, 0); break;
            case 'clap': set(1.6 + Math.abs(s) * 0.5, 1.6 + Math.abs(s) * 0.5, 0, 0, 0, 0); break;
            case 'dab': set(2.2, 0.8, 0.2, -0.2, 0, 0.4, 0.2); break;
            case 'bow': set(0.3, 0.3, 0, 0, 0, 0, -Math.sin(Math.min(1, T) * Math.PI) * 0.8); break;
            case 'moon': set(0.4, -0.4, Math.sin(T * 6) * 0.7, -Math.sin(T * 6) * 0.7, 0, Math.PI); break;
            default: set(2.7 + s * 0.35, 2.7 - s * 0.35, 0, 0, Math.abs(Math.sin(T * 6)) * 22, 0); break;
        }
    },

    update(dt, hero, state) {
        if (hero && this.npcs.length) this._npcs(dt, hero);
        // таблички — без логики; трейл за спиной героя
        if (this.trailNode && hero) {
            const back = 26;
            this.trailNode.position.set(hero.x - Math.cos(hero.yaw) * back, hero.y + 70, hero.z - Math.sin(hero.yaw) * back);
            if (this.trail && this.trail._ke && this.trail._ke.rainbow) {
                const h = (performance.now() / 1000 * 0.35) % 1;
                const c = BABYLON.Color3.FromHSV(h * 360, 0.6, 1);
                /** @type {any} */ (this.trail.material).emissiveColor = c;
            }
        }
        // питомец парит рядом и догоняет
        if (this.pet && hero) {
            const side = 80, behind = 110;
            const tx = hero.x - Math.cos(hero.yaw) * behind - Math.sin(hero.yaw) * side, tz = hero.z - Math.sin(hero.yaw) * behind + Math.cos(hero.yaw) * side;
            if (!this.petPos) this.petPos = { x: tx, y: hero.y, z: tz };
            const k = 1 - Math.exp(-dt * 6), p = this.petPos;
            p.x += (tx - p.x) * k; p.z += (tz - p.z) * k; p.y += (hero.y - p.y) * (1 - Math.exp(-dt * 4));
            const tt = performance.now() / 1000;
            this.pet.position.set(p.x, p.y + 70 + Math.sin(tt * 3) * 12, p.z);
            const dx = hero.x - p.x, dz = hero.z - p.z;
            if (dx * dx + dz * dz > 400) this.pet.rotation.y = -Math.atan2(dz, dx);
        }
        if (hero && hero.avatar && hero.avatar.body) {
            if (this.emote && state !== 'dead') this._emotePose(hero, dt);
            else if (hero.avatar.body.rotation.y) hero.avatar.body.rotation.y = 0;
        }
    },
};
