// GameHero.js — персонаж игрока и ботов в стиле Roblox: тело ObbyBody (та же физика трассы) + вид — риг из Blender
// (assets/models/hero/hero.glb, клипы hero_clips.glb: idle, walk, run, jump, fall, land, dead и 20 эмоций). Скин Shop
// (look: skin, shirt, pants, hair, hairColor, cap) — перекраска частей по группам: Skin (Head, Hand_*), Shirt (Torso, Arm_*),
// Pants (Leg_*), Hair (Hair_*), Cap; причёска — одна видимая часть Hair_<стиль>. Шапка магазина — на кость HatPoint.
// Нет файла модели — герой прежний (ObbyCharacter): игра не падает.
//
//   await GameHero.preload();                                   // под загрузкой: модель и клипы
//   const hero = GameHero.create(ObbyCourse, view, { look, x, y, z, yaw });   // KeCharacter или ObbyCharacter
//   hero.pose('run', dt); hero.emote('dance'); hero.attachHat(mesh); hero.setLook(look);

/** Части по группам перекраски (префикс имени части модели). */
const HERO_PAINT = { Head: 'skin', Hand_: 'skin', Torso: 'shirt', Arm_: 'shirt', Leg_: 'pants', Hair_: 'hairColor', Cap: 'cap' };
const HERO_HAIRS = ['short', 'spiky', 'long'];
/** Эмоции магазина → клип модели (jump у модели — прыжок, эмоция — jump_emote). */
const HERO_EMOTE_CLIP = { jump: 'jump_emote' };

class KeCharacter extends ObbyBody {
    /** @param {any} course @param {any} view @param {any} [opts] */
    constructor(course, view, opts) {
        super(course, opts);
        const o = opts || {};
        this.view = view;
        this.rig = Rig.create(GameHero.model, view, { name: 'hero', clips: GameHero.clips ? [GameHero.clips] : [] });
        /** @type {any[]} */ this._mats = [];
        /** @type {any} */ this.hat = null;
        this.state = 'idle';
        this.shield = false;
        this.visible = true;
        this._emote = ''; this._emoteT = 0; this._t = 0;
        // совместимость с кодом, который ждёт ObbyCharacter.avatar (табличка, подъём на клавишах)
        this.avatar = { root: this.rig.root, head: this.rig.nodes.get('HatPoint') || this.rig.nodes.get('Head') || this.rig.root, meshes: this.rig._meshes || [] };
        this.setLook(o.look || {});
        this.rig.play('idle', { fade: 0 });
        this.sync();
    }

    step(dt, cmd) { super.step(dt, cmd); this.sync(); }

    place(x, y, z, yaw) { super.place(x, y, z, yaw); this._emote = ''; this.sync(); }

    sync() {
        const r = this.rig.root;
        // на клавиатуре ноги — на колпачках (физика — верх плиты), плавно
        const on = this.grounded && this.support && typeof GameKeys !== 'undefined' && GameKeys.isBoard(this.support.piece);
        const want = on ? (typeof KE_FOOT_LIFT !== 'undefined' ? KE_FOOT_LIFT : 18) : 0, cur = this._keyLift || 0;
        this._keyLift = cur + (want - cur) * (want > cur ? 0.5 : 0.18);
        r.position.set(this.x, this.y + this._keyLift, this.z);
        r.rotation.y = -this.yaw;
    }

    /** Скин: цвета групп и причёска. Материалы рига общие — у этого героя свои клоны. */
    setLook(look) {
        const L = Object.assign({ skin: 0xffd9b8, shirt: 0xff5fa8, pants: 0x5a301a, hair: 'spiky', hairColor: 0x7a4426, cap: -1 }, look || {});
        this.look = L;
        const old = this._mats;
        this._mats = [];
        if (!this._orig) { this._orig = new Map(); for (const mesh of this.rig._meshes || []) this._orig.set(mesh, mesh.material); }
        const col = (n) => BABYLON.Color3.FromHexString('#' + Math.max(0, Number(n) || 0).toString(16).padStart(6, '0'));
        for (const mesh of this.rig._meshes || []) {
            const part = String((mesh.metadata && mesh.metadata.part) || mesh.name || '');
            const key = Object.keys(HERO_PAINT).find(k => part.startsWith(k));
            const src = /** @type {any} */ (this._orig.get(mesh));
            if (!key || !src) continue;
            const c = col(L[HERO_PAINT[key]]);
            const paint = (mat) => {
                const cl = mat.clone(mat.name + '-' + this.rig.name) || mat;
                if (cl === mat) return mat;
                cl.diffuseColor = c; cl.metadata = Object.assign({}, mat.metadata);
                this._mats.push(cl);
                return cl;
            };
            if (src.subMaterials) {
                const mm = new BABYLON.MultiMaterial('hero-mm', this.view.scene);
                mm.subMaterials = src.subMaterials.map((sm) => sm ? paint(sm) : sm);
                this._mats.push(mm);
                mesh.material = mm;
            } else mesh.material = paint(mesh.material);
        }
        for (const m of old) { try { m.dispose(false, false); } catch (e) { /* нет */ } }   // прежние клоны — после замены
        const capOn = L.cap != null && L.cap >= 0, hairShown = capOn && L.hair === 'spiky' ? 'short' : L.hair;   // шипы сквозь кепку — короткая стрижка
        for (const h of HERO_HAIRS) this.rig.setPartVisible('Hair_' + h, hairShown === h);
        this.rig.setPartVisible('Cap', capOn);
    }

    /** Шапка магазина: меш Model3D (начало — центр верха головы) на кость HatPoint. */
    attachHat(mesh) {
        if (this.hat) { try { this.rig.detach(this.hat, true); } catch (e) { /* уже */ } this.hat = null; }
        // под шапкой шипы торчали бы насквозь — короткая стрижка того же цвета; без шапки — причёска скина
        const hair = this.look ? this.look.hair : 'short';
        for (const h of HERO_HAIRS) this.rig.setPartVisible('Hair_' + h, mesh ? (hair !== 'none' && h === (hair === 'spiky' ? 'short' : hair)) : h === hair);
        if (!mesh) return;
        this.rig.attach(this.rig.nodes.has('HatPoint') ? 'HatPoint' : 'Head', mesh, { pos: [0, 0, 0] });
        this.hat = mesh;
        if (this.look && this.look.cap >= 0) this.rig.setPartVisible('Cap', false);
    }

    /** Эмоция (клип модели); 'cheer' по умолчанию. */
    emote(id, sec) {
        const clip = HERO_EMOTE_CLIP[id] || id || 'cheer';
        this._emote = this.rig.has(clip) ? clip : 'cheer';
        this._emoteT = sec || 2.4;
    }

    /** Поза: 'idle' | 'run' | 'air' | 'dead' | 'cheer' (контракт ObbyBots). Клипы рига с переходами. */
    pose(state, dt) {
        this._t += dt || 0;
        const sp = Math.hypot(this.vx || 0, this.vz || 0);
        if (this._emote && state !== 'dead' && state !== 'air' && (state !== 'run' || sp < 60)) {
            this._emoteT -= dt || 0;
            if (this._emoteT > 0) { this.rig.play(this._emote); this.state = 'emote'; return; }
            this._emote = '';
        } else if (state === 'run' || state === 'air') this._emote = '';
        if (state === 'run') {
            const clip = sp < 260 ? 'walk' : 'run';
            this.rig.play(this.rig.has(clip) ? clip : 'run', { speed: Math.max(0.7, Math.min(2.6, sp / (clip === 'walk' ? 200 : 560))) });
        } else if (state === 'air') this.rig.play((this.vy || 0) > 120 && this.rig.has('jump') ? 'jump' : 'fall', { loop: (this.vy || 0) <= 120, holdLast: true, fade: 0.12 });
        else if (state === 'dead') this.rig.play(this.rig.has('dead') ? 'dead' : 'fall', { loop: false, holdLast: true, fade: 0.08 });
        else if (state === 'cheer') this.rig.play(this.rig.has('cheer') ? 'cheer' : 'idle');
        else this.rig.play('idle');
        this.state = state;
        if (this.shield) { const v = Math.floor(this._t * 8) % 2 ? 0.35 : 0.85; for (const m of this.rig._meshes || []) m.visibility = v; }
    }

    setVisible(on) { this.visible = !!on; this.rig.setEnabled(this.visible); }

    setShield(on) {
        this.shield = !!on;
        if (!on) for (const m of this.rig._meshes || []) m.visibility = 1;
    }

    dispose() {
        if (this.hat) { try { this.rig.detach(this.hat, true); } catch (e) { /* уже */ } }
        try { this.rig.dispose(); } catch (e) { /* уже */ }
        for (const m of this._mats) { try { m.dispose(); } catch (e) { /* нет */ } }
        this._mats = [];
    }
}

/** @satisfies {Record<string, any>} */
const GameHero = {
    /** @type {any} */ model: null,
    /** @type {any} */ clips: null,
    ok: false,

    async preload() {
        try {
            this.model = await Rig.load('assets/models/hero/hero.glb');
            try { this.clips = await Rig.load('assets/models/hero/hero_clips.glb'); } catch (e) { this.clips = null; }
            this.ok = !!this.model;
        } catch (e) { this.ok = false; console.warn('GameHero: модели героя нет — блочный герой движка', e); }
        return this.ok;
    },

    /** Герой или бот: KeCharacter на риге, иначе ObbyCharacter движка. */
    create(course, view, opts) {
        if (this.ok) { try { return new KeCharacter(course, view, opts); } catch (e) { console.warn('GameHero:', e); this.ok = false; } }
        return new ObbyCharacter(course, view, opts);
    },
};
