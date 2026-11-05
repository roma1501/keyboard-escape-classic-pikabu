// Game.js — «ASMR Keyboard Escape: Candy & Chocolate» на Lory Engine 1.40. Каждый шаг по клавише = +Speed: мир из конфетных
// и шоколадных клавиатур, хаб со стойками и беговыми дорожками, 10 этапов с опасностями, Safe Zone с Wins-падами, Rebirth.
// Трасса и точки — карта world (js/Maps.js, правится в редакторе), детали — ObbyCourse, клавиши — GameKeys, опасности —
// GameHazards, хаб и косметика на герое — GameWorld, прогресс — GameProgress (данные — GameData), интерфейс — GameHud.
//
// Состояния: 'menu' (лобби поверх хаба) -> 'run' (свободная игра: хаб и этапы) -> 'dead' (падение/монстр, возрождение в начале
// этапа) -> 'run'; 'result' — окно награды Wins-пада (игра идёт, герой стоит), «Продолжить» — телепорт в хаб.
// Сохранение — один объект Platform.save: { prog, stage, tutorialDone, shop, daily, wheel }.

ObbyCourse.hookMaps();

Object.assign(LANG_STRINGS.ru, {
    'kg.play': 'Играть', 'kg.jump': 'Прыжок', 'kg.open': 'Открыть', 'kg.buy': 'Купить', 'kg.hub': 'Хаб',
    'kg.stage': 'Этап {n}', 'kg.safe': 'Безопасная зона {n}', 'kg.safeHub': 'Хаб — безопасно',
    'kg.needSpeed': 'Нужно ⚡{n} — разгонись на клавишах или дорожке!', 'kg.welcome': 'Этап {n}: {name}',
    'kg.wins': '+{n} 🏆', 'kg.died.ball': 'Сбил зефирный шар!', 'kg.died.wave': 'Накрыло шоколадом!', 'kg.died.monster': 'Поймал монстр!',
    'kg.died.fall': 'Упал в шоколад!', 'kg.died.trap': 'Ловушка!', 'kg.treadLocked': 'Дорожка x{m}: {p} 🏆', 'kg.treadDeal': 'Дорожка x{m} со скидкой −{n}%: {p} 🏆', 'world.deal': 'СКИДКА −{n}%', 'kg.treadOn': 'Дорожка x{m}',
    'kg.noWins': 'Не хватает побед', 'kg.rebirthDone': 'Перерождение! Множитель x{m}', 'kg.level': 'Уровень {n}!',
    'kg.teleport': 'Телепорт: {name}', 'kg.knock': 'Вы сбили {name}!', 'kg.joined': '{name} зашёл', 'kg.left': '{name} вышел',
    'kg.finished': '{name} дошёл до финиша!', 'kg.boost': 'x2 скорость на 60 с!', 'kg.finish': 'Финиш! Ты сбежал с клавиатуры!', 'kg.tower': 'Вершина паркур-башни!',
    'tut.ke.speed.t': 'Каждый шаг = +скорость', 'tut.ke.speed.h': 'Бегай по клавишам: каждая нажатая клавиша прибавляет скорость',
    'tut.ke.stage.t': 'Вперёд на этап', 'tut.ke.stage.h': 'Добеги до ворот «Этап 1». Монстры и ловушки отправят в начало этапа',
    'world.stand.trails': 'ТРЕЙЛЫ', 'world.stand.auras': 'АУРЫ', 'world.stand.rebirth': 'ПЕРЕРОЖДЕНИЕ', 'world.stand.shop': 'МАГАЗИН',
    'world.stand.daily': 'ПОДАРОК', 'world.stand.wheel': 'КОЛЕСО', 'world.stand.top': 'РЕКОРДЫ', 'world.portal': 'ТЕЛЕПОРТ',
    'world.treadmill': 'дорожка', 'world.wins': 'ПОБЕДЫ', 'world.stage': 'ЭТАП {n}', 'world.top': 'ТОП СКОРОСТИ',
});
Object.assign(LANG_STRINGS.en, {
    'kg.play': 'Play', 'kg.jump': 'Jump', 'kg.open': 'Open', 'kg.buy': 'Buy', 'kg.hub': 'Hub',
    'kg.stage': 'Stage {n}', 'kg.safe': 'Safe Zone {n}', 'kg.safeHub': 'Hub — safe',
    'kg.needSpeed': 'Need ⚡{n} — speed up on the keys or a treadmill!', 'kg.welcome': 'Stage {n}: {name}',
    'kg.wins': '+{n} 🏆', 'kg.died.ball': 'Hit by a marshmallow!', 'kg.died.wave': 'Swept by chocolate!', 'kg.died.monster': 'Caught by a monster!',
    'kg.died.fall': 'Fell into chocolate!', 'kg.died.trap': 'Trapped!', 'kg.treadLocked': 'Treadmill x{m}: {p} 🏆', 'kg.treadDeal': 'Treadmill x{m}, {n}% off: {p} 🏆', 'world.deal': '{n}% OFF', 'kg.treadOn': 'Treadmill x{m}',
    'kg.noWins': 'Not enough Wins', 'kg.rebirthDone': 'Rebirth! Multiplier x{m}', 'kg.level': 'Level {n}!',
    'kg.teleport': 'Teleport: {name}', 'kg.knock': 'You knocked over {name}!', 'kg.joined': '{name} joined', 'kg.left': '{name} left',
    'kg.finished': '{name} reached the finish!', 'kg.boost': 'x2 Speed for 60 s!', 'kg.finish': 'Finish! You escaped the keyboard!', 'kg.tower': 'Parkour tower top!',
    'tut.ke.speed.t': 'Every step = +Speed', 'tut.ke.speed.h': 'Run across the keys: every key you press adds speed',
    'tut.ke.stage.t': 'Onward to a stage', 'tut.ke.stage.h': 'Reach the "Stage 1" gate. Monsters and traps send you back to the stage start',
    'world.stand.trails': 'TRAILS', 'world.stand.auras': 'AURAS', 'world.stand.rebirth': 'REBIRTH', 'world.stand.shop': 'SHOP',
    'world.stand.daily': 'GIFT', 'world.stand.wheel': 'WHEEL', 'world.stand.top': 'TOP', 'world.portal': 'TELEPORT',
    'world.treadmill': 'treadmill', 'world.wins': 'WINS', 'world.stage': 'STAGE {n}', 'world.top': 'TOP SPEED',
});

const GAME_MAP_ID = 'world';
const HERO_LOOK = { skin: 0xffd9b8, shirt: 0xff5fa8, pants: 0x5a301a, hair: 'spiky', hairColor: 0x7a4426, cap: -1 };
const KEY_SOUNDS = ['assets/sounds/key1.mp3', 'assets/sounds/key2.mp3', 'assets/sounds/key3.mp3', 'assets/sounds/key4.mp3', 'assets/sounds/key5.ogg', 'assets/sounds/key6.ogg'];
const hexColor = (n) => '#' + Number(n).toString(16).padStart(6, '0');

/** @satisfies {Record<string, any>} */
const Game = {
    /** @type {LoryApp | null} */ app: null,
    /** @type {any} */ save: null,
    /** @type {'menu' | 'run' | 'dead' | 'result'} */ state: 'menu',
    /** @type {any} */ hero: null,
    /** @type {any} */ tags: null,
    cam: { x: 0, y: 0, h: 0, frameHeight: 610, frameWidth: 580 },
    stage: 0, deadT: 0, botsReady: false,
    lastKey: '', stepDist: 0, lastX: 0, lastZ: 0, clickT: 0, popAcc: 0, popT: 0,
    treadAcc: 0, padCool: 0, boostT: 0, shieldT: 0, jumpT: 0, inStage: 0, warned: 0,
    /** @type {any} */ near: null,
    /** @type {any[]} */ board: [],
    boardT: 0, scoreT: 0, lastSent: 0, landedT: 0,
    glow: 0xffffff, glowFx: 'none', emote: 'cheer',

    // -------------------------------------------------------------------------------------------
    // Запуск
    // -------------------------------------------------------------------------------------------

    async init(app) {
        this.app = app;
        // Под экраном загрузки сцену не видно, но движок её уже рисует: в низком разрешении эти кадры в разы дешевле
        // (программная отрисовка без видеокарты — у проверок площадок — упирается в пиксели). Нормальное — в первом update.
        this.loadRatio();
        const w = /** @type {any} */ (window);
        if (w.keLoadPaint) w.keLoadPaint();             // логотип загрузки — на языке площадки
        const saved = (await Platform.load()) || {};
        this.save = Object.assign({ stage: 0, tutorialDone: false }, saved);
        GameProgress.init(this.save.prog, () => this.persist());
        this.save.prog = GameProgress.state;
        HudLayout.init({ app });
        const jumpKeys = ['Space'].concat(Platform.name === 'playables' ? ['Mouse2'] : []);
        Input.init({ app, mouse: 'drag', actions: Object.assign({}, Input.DEFAULTS, { jump: Object.assign({}, Input.DEFAULTS.jump, { keys: jumpKeys }) }) });
        GameHud.init({
            onPlay: () => this.play(), onHowTo: () => this.howTo(), onPause: () => this.togglePause(true), onResume: () => this.togglePause(false),
            onSound: () => GameHud.setSound(!Sound.toggleMuted()),
            onTeleport: (n) => this.teleport(n), onRebirth: () => this.rebirth(),
            onBuyTrail: (id) => this.buy(GameProgress.buyTrail(id)), onEquipTrail: (id) => this.buy(GameProgress.equipTrail(id)),
            onBuyAura: (id) => this.buy(GameProgress.buyAura(id)), onEquipAura: (id) => this.buy(GameProgress.equipAura(id)),
            onBuyTreadmill: (tier) => { const r = this.buy(GameProgress.buyTreadmill(tier)); GameWorld.refreshDeals(); return r; },
            onMaxSpeed: (v) => GameProgress.setMaxSpeed(v), onQuality: () => {},
            onBoost: () => this.boostAd(), onInteract: () => { this._tapInteract = true; }, onLogin: () => this.login(),
            onWindow: (name, open) => this.windowChanged(name, open),
        });
        GameHud.setSound(!Sound.muted);
        GameOffers.init({
            canSkip: () => this.state === 'run' && this.stage >= 1 && this.stage < ObbyCourse.checkpoints.length,
            onShield: (s) => { this.shieldT = s; GameHud.toast(Lang.t('of.shieldOn'), 1500); this.sfx('assets/sounds/level.ogg', 0.7); },
            onJump: (s) => { this.jumpT = s; GameHud.toast(Lang.t('of.jumpOn'), 1500); this.sfx('assets/sounds/jump2.ogg', 0.7); },
            onBoost: (s) => { this.boostT = s; GameHud.toast(Lang.t('kg.boost'), 1500); this.sfx('assets/sounds/level.ogg', 0.7); },
            onSkip: () => this.skipStage(),
        });
        // магазин косметики, подарок дня, колесо: валюта — Wins из GameProgress (синхронизирует GameUiShop)
        this.installUiAds();
        GameUiShop.init(this.save, () => this.persist());
        GameUiShop.onLook(() => this.applyLook());
        GameProgress.on((e) => this.progressEvent(e));
        await this.prepare(app);
        Tutorial.init({
            app, state: () => this.save, field: 'tutorialDone', persist: () => this.persist(),
            steps: [
                Tutorial.preset('move'), Tutorial.preset('look'), Tutorial.preset('jump'),
                { id: 'speed', title: 'tut.ke.speed.t', hint: 'tut.ke.speed.h', check: () => Math.min(1, (GameProgress.state.totalSteps - (this._tutSteps || 0)) / 25) },
                { id: 'stage', title: 'tut.ke.stage.t', hint: 'tut.ke.stage.h', event: 'stage', world: () => { const g = GameWorld.points.find(p => p.kind === 'stage' && p.n === 1); return g ? { x: g.x, y: g.z, h: g.y + 420 } : null; } },
            ],
            onFinish: () => { Input.configure({ controls: true }); },
            ...GameHud.tutorialOpts(),
        });
        window.addEventListener('keydown', (e) => {
            if ((e.code === 'Escape' || e.code === 'KeyP') && !GameHud.hasWindow()) this.togglePause(!Pause.has('manual'));
        });
        if (typeof Quality !== 'undefined') Quality.onChange(() => ObbyBots.setCount(ObbyBots.cfg().count));
        Platform.onAd((e) => { if (this.hero) this.hero.setShield(!!(e && e.active)); });
        this.refreshHud();
        this.toMenu();
    },

    /** До загрузки карты (движок и уровень графики уже есть): низкое разрешение на всю загрузку. Карта — первая (world). */
    firstMap() { this.loadRatio(); return GAME_MAP_ID; },

    async ready() { Platform.gameplay(false); },

    /** Playables (KE_UI_INTERSTITIAL = 1): межстраничная реклама при каждом нажатии кнопки интерфейса. Действие кнопки идёт сразу,
     *  запрос рекламы — следом. Не трогает управление (стик, прыжок), туториал, плашку паузы площадки и кнопки «за рекламу»
     *  (rewarded уже запрошен — Platform._adBusy), и паузу после rewarded (KE_SKIP_INTERSTITIAL_SEC). Частоту показа решает YouTube. */
    installUiAds() {
        if (Platform.name !== 'playables' || !(typeof KE_UI_INTERSTITIAL !== 'undefined' && KE_UI_INTERSTITIAL > 0)) return;
        if (!Platform.interstitialSupported()) return;
        document.addEventListener('click', (e) => {
            const t = /** @type {HTMLElement} */ (e.target);
            const el = t && t.closest ? t.closest('button, #gh-prompt') : null;
            if (!el || el.closest('.lory-input-layer, .lory-tut, #platform-pause') || /** @type {any} */ (el).disabled) return;
            if (Tutorial.active) return;
            setTimeout(() => {
                const P = /** @type {any} */ (Platform);
                if (P._adBusy || Platform.adActive) return;                       // rewarded по этой кнопке уже идёт
                const gap = (typeof KE_SKIP_INTERSTITIAL_SEC !== 'undefined' ? KE_SKIP_INTERSTITIAL_SEC : 45) * 1000;
                if (P._rewardedEndAt && Date.now() - P._rewardedEndAt < gap) return;
                Platform.interstitial().catch(() => {});
            }, 0);
        }, true);
    },

    /** Программная отрисовка (SwiftShader, llvmpipe, Microsoft Basic Render) — видеокарты нет. */
    softwareGpu() {
        try { const env = typeof Quality !== 'undefined' ? Quality.environment() : null; return !!(env && /swiftshader|llvmpipe|software|basic render/i.test(String(env.gpu))); } catch (e) { return false; }
    },

    /** Разрешение на время загрузки: четверть стороны (сцена закрыта экраном загрузки). */
    loadRatio() {
        if (typeof World3D === 'undefined' || !World3D.setPixelRatio) return;
        this._lowRes = true;
        World3D.setPixelRatio(0.25);
    },

    /** Загрузка снята — нормальное разрешение уровня графики; без видеокарты — не больше 0.7 (иначе кадр слишком дорог). */
    liveRatio() {
        this._lowRes = false;
        if (typeof Quality !== 'undefined') { Quality._ratio = 0; Quality.applyPixelRatio(); }
        else if (typeof World3D !== 'undefined') World3D.setPixelRatio(null);
        if (this.softwareGpu() && typeof World3D !== 'undefined') World3D.setPixelRatio(Math.min(0.7, World3D.pixelRatio || 1));
    },

    /** Трасса, клавиши, опасности, мир, герой, боты — под экраном загрузки. */
    async prepare(app) {
        const loc = app.location, view = loc.view;
        await this.preloadModels(loc);
        ObbyCourse.build(loc.map, { waterAt: (x, z) => loc.waterAt(x, z) });
        GameKeys.addPalettes();
        ObbyCourseView.build(app, ObbyCourse, { side: 0x3a2418, markers: false });   // флажки и арка обби не нужны: свои ворота и кольца
        await GameKeys.build(app, ObbyCourse);
        await GameHazards.build(app, ObbyCourse, { onEvent: (t, d) => this.hazardEvent(t, d), bots: () => this.liveBots() });
        await GameWorld.build(app, ObbyCourse);
        GameTreadmills.build(app);
        GameWorld.refreshDeals();
        GameChoco.build(app);
        // каждый заход — с начального спауна в хабе (открытые Safe Zone остаются: телепорт в портале)
        this.stage = 0; this.save.stage = 0;
        const r = ObbyCourse.respawn(this.stage);
        await GameHero.preload();
        this.hero = GameHero.create(ObbyCourse, view, { look: HERO_LOOK, x: r.x, y: r.y, z: r.z, yaw: r.yaw });
        this.hero.place(r.x, r.y, r.z, r.yaw);
        await this.applyLook();
        ObbyCourseView.setStage(this.stage);
        app.camera.azimuth = r.yaw;
        app.camera.follow(this.cam);
        // камера не уходит в плиты и растворяет декор между собой и героем; небо — вечный солнечный день
        Object.assign(app.camera.c, { collide: 1, fade: 1 });
        // средняя кнопка мыши камерой не управляет (ни панорамы, ни автопрокрутки браузера)
        const prevIgnore = app.camera.ignorePointer;
        app.camera.ignorePointer = (e) => e.button === 1 || (e.buttons & 4) !== 0 || !!(prevIgnore && prevIgnore(e));
        window.addEventListener('mousedown', (e) => { if (e.button === 1) e.preventDefault(); }, { capture: true });
        window.addEventListener('auxclick', (e) => { if (e.button === 1) e.preventDefault(); }, { capture: true });
        if (typeof Sky3D !== 'undefined') Sky3D.frozen = true;
        if (app.camera.sight) app.camera.sight.query = (from, to) => {
            const dx = to.x - from.x, dy = to.y - from.y, dz = to.z - from.z, L = Math.hypot(dx, dy, dz) || 1;
            const hit = ObbyCourse.ray(from.x, from.y, from.z, dx / L, dy / L, dz / L, L);
            return hit ? hit.t : null;
        };
        this.syncCam();
        if (app.camera.snap) app.camera.snap();
        this.tags = new ObbyNameTags(view);
        await GameWorld.spawnNpcs(this.tags);
        this.botsReady = false;
        GameBots.install();
        ObbyBots.init({
            course: ObbyCourse, lang: Lang.code, tags: this.tags, names: GAME_BOT_NAMES,
            createActor: (spec) => GameHero.create(ObbyCourse, view, { look: spec.look }),
            getPlayer: () => ({ actor: this.hero, stage: this.stage, alive: this.state === 'run' }),
            onChat: (bot, text) => GameHud.chat(bot.name, text, hexColor(bot.look.shirt)),
            onEvent: (type, bot, data) => this.botEvent(type, bot, data),
        });
        await ObbyBots.build();
        this.botsReady = true;
        this.makeBoard();
        this.registerFx();
        GamePost.init(app);
        app.onUpdate((dt) => this.tags.update(dt));
    },

    /** Модели, которые подготовка грузит сама (герой, охранники карты, шары, волна, шапки продавцов), — одним параллельным заходом:
     *  дальше Model3D.load берёт их из кэша, и между последовательными сетевыми ожиданиями не рисуются лишние кадры загрузки. */
    async preloadModels(loc) {
        const urls = new Set(['assets/models/hero/hero.glb', 'assets/models/hero/hero_clips.glb', 'assets/models/enemies/marsh_ball.glb', 'assets/models/enemies/choco_wave.glb']);
        for (const m of loc.map.objects) {
            if (m.kind !== 'marker' || !/^chaser-\d+$/.test(String(m.name))) continue;
            const k = HAZARD_MONSTERS[Math.round(Array.isArray(m.scale) ? Number(m.scale[2]) || 1 : 1)];
            if (k) { urls.add(k.model); urls.add(k.clips); }
        }
        for (const id of Object.keys(WORLD_NPCS)) if (WORLD_NPCS[id].hat) urls.add(WORLD_NPCS[id].hat);
        await Promise.all([...urls].map(u => Model3D.load(u).catch(() => null)));
    },

    registerFx() {
        const fx = /** @type {LoryApp} */ (this.app).fx;
        if (!fx) return;
        fx.register('ke-key', [{ burst: 7, capacity: 12, life: [0.25, 0.5], size: [6, 12], speed: [80, 180], color: '#ffffff', direction: [[-0.6, 1, -0.6], [0.6, 2, 0.6]], gravity: [0, -900, 0] }]);
        fx.register('ke-wins', [
            { burst: 60, capacity: 80, life: [0.6, 1.4], size: [10, 22], speed: [150, 420], color: '#ffd23f', color2: '#fff3b0', direction: [[-1, 1.2, -1], [1, 2.4, 1]], gravity: [0, -700, 0] },
            { delay: 0.12, burst: 26, capacity: 30, life: [0.8, 1.6], size: [16, 30], speed: [40, 120], color: '#ff7ab8', direction: [[-0.4, 1, -0.4], [0.4, 1.6, 0.4]] },
        ]);
        fx.register('ke-death', [
            { burst: 40, capacity: 50, life: [0.4, 1], size: [12, 26], speed: [120, 380], color: '#6b3a1e', color2: '#a0522d', blend: 'standard', gravity: [0, -900, 0] },
            { burst: 18, capacity: 20, life: [0.3, 0.7], size: [10, 20], speed: [60, 200], color: '#ffffff' },
        ]);
        fx.register('ke-rebirth', [
            { burst: 120, capacity: 140, life: [0.8, 1.8], size: [10, 26], speed: [200, 600], color: '#a77bff', color2: '#7ef0c8', direction: [[-1, 0.4, -1], [1, 2, 1]] },
            { delay: 0.2, burst: 50, capacity: 60, life: [1, 2], size: [20, 40], speed: [30, 100], color: '#ffffff' },
        ]);
        fx.register('ke-level', [{ burst: 40, capacity: 50, life: [0.6, 1.2], size: [8, 18], speed: [120, 300], color: '#7ef0c8', color2: '#ffd23f', direction: [[-0.7, 1.4, -0.7], [0.7, 2.4, 0.7]] }]);
        fx.register('ke-wind', [{ burst: 3, capacity: 6, life: [0.5, 0.9], size: [30, 70], speed: [600, 900], color: '#ffffff', alpha: 0.35, blend: 'standard' }]);
    },

    // -------------------------------------------------------------------------------------------
    // Косметика: Shop (GameUiShop.look) + трейл и аура прогресса
    // -------------------------------------------------------------------------------------------

    /** Косметика Shop + трейл и аура прогресса — на героя. */
    async applyLook() {
        if (!this.hero) return;
        const l = /** @type {any} */ (GameUiShop.look() || {});
        this.glow = l.glow ? l.glow.color : 0xffffff;
        this.glowFx = l.glow ? l.glow.fx || 'none' : 'none';
        this.emote = l.emote || 'cheer';
        const hat = l.hat, pet = l.pet;
        await GameWorld.dress(this.hero, {
            look: Object.assign({}, HERO_LOOK, l.skin || {}),
            hat: hat ? hat.model : null, pet: pet ? pet.model : null,
            trail: GameProgress.trail(), aura: GameProgress.aura(),
        });
    },

    progressEvent(e) {
        if (e.type === 'level') {
            this.sfx('assets/sounds/level.ogg', 0.6);
            if (GameHud.setLevelUp) GameHud.setLevelUp(e.level);
            this.fxAt('ke-level', 0, 120);
        } else if (e.type === 'buy') {
            this.sfx('assets/sounds/purchase.mp3', 0.7);
            GameWorld.npcReact(e.kind === 'trails' ? 'trails' : e.kind === 'auras' ? 'auras' : 'rebirth', 'buy');
            if (e.kind === 'trails' || e.kind === 'auras') this.applyLook();
        }
        if (e.type === 'change' && this._lookKey !== GameProgress.state.trail + '|' + GameProgress.state.aura) {
            this._lookKey = GameProgress.state.trail + '|' + GameProgress.state.aura;
            this.applyLook();
        }
        this._hudDirty = true;
    },

    buy(res) {
        if (res && !res.ok && res.reason === 'wins') { GameHud.toast(Lang.t('kg.noWins'), 1400); this.sfx('assets/sounds/deny.mp3', 0.6); }
        if (GameHud.refresh) GameHud.refresh();
        this.refreshHud();
        return res;
    },

    // -------------------------------------------------------------------------------------------
    // Состояния
    // -------------------------------------------------------------------------------------------

    toMenu() {
        this.state = 'menu';
        GameHud.menu(true);
        Input.clearContext();
        Input.configure({ controls: false });
        Platform.gameplay(false);
        Sound.music('assets/sounds/music.mp3');
    },

    play() {
        if (this.state !== 'menu') return;
        this.state = 'run';
        GameHud.run(true);
        Input.configure({ controls: true });
        this.respawnHero(true);
        const cam = /** @type {LoryApp} */ (this.app).camera;
        cam.azimuth = ObbyCourse.respawn(this.stage).yaw;
        Input.setContext({ id: 'jump', label: Lang.t('kg.jump'), icon: '⤒', action: 'jump' }, 1);
        Platform.gameplay(true);
        if (typeof Telemetry !== 'undefined') Telemetry.progress('started', 'stage_' + (this.stage + 1), { step_index: this.stage + 1 });
        this._tutSteps = GameProgress.state.totalSteps;
        if (!this.save.tutorialDone) Tutorial.autoStart();
        Tutorial.whenIdle(() => GameUiShop.offerDaily());
        this.updateStageHud();
    },

    howTo() {
        if (Pause.has('manual')) this.togglePause(false);
        if (this.state === 'menu') this.play();
        this._tutSteps = GameProgress.state.totalSteps;
        Tutorial.start({ replay: true });
    },

    togglePause(on) {
        if (this.state === 'menu' && on) return;
        Pause.set('manual', !!on);
        GameHud.pause(!!on);
    },

    /** Окно HUD открылось/закрылось (паузу ставит сам GameHud): доске рекордов — свежие данные. */
    windowChanged(name, open) {
        if (name === 'top' && open) this.updateBoard();
    },

    persist() {
        try {
            this.save.prog = GameProgress.state;
            if (typeof Shop !== 'undefined' && Shop.state) this.save.shop = Shop.state;
            if (typeof DailyGift !== 'undefined' && DailyGift.state) this.save.daily = DailyGift.state;
            if (typeof Wheel !== 'undefined' && Wheel.state) this.save.wheel = Wheel.state;
            Platform.save(this.save);
        } catch (e) { console.warn('Platform.save:', e); }
    },

    respawnHero(silent) {
        const r = ObbyCourse.respawn(this.stage);
        this.hero.place(r.x, r.y, r.z, r.yaw);
        this.hero.pose('idle', 0);
        this.lastKey = ''; this.stepDist = 0; this.lastX = r.x; this.lastZ = r.z;
        GameHazards.reset();
        if (!silent) this.sfx('assets/sounds/teleport.ogg', 0.5);
        this.syncCam();
        const cam = /** @type {LoryApp} */ (this.app).camera;
        if (cam.snap) cam.snap();
    },

    syncCam() {
        const h = this.hero;
        this.cam.x = h.x; this.cam.y = h.z; this.cam.h = h.y + 70;
        // бег быстрее — камера чуть дальше, чтобы видеть прыжок
        const k = Math.min(1, (GameProgress.runSpeed() - 330) / 1800);
        this.cam.frameHeight = 610 + 300 * k; this.cam.frameWidth = 580 + 300 * k;
    },

    // -------------------------------------------------------------------------------------------
    // Кадр
    // -------------------------------------------------------------------------------------------

    update(dt) {
        const app = /** @type {LoryApp} */ (this.app), cam = app.camera;
        if (this._lowRes) this.liveRatio();
        ObbyCourse.update(dt);
        GameProgress.tick(dt);
        const look = Input.consumeLook();
        if (this.state === 'menu') cam.azimuth += dt * 0.12;
        else {
            cam.azimuth += look.dx * 0.0045;
            cam.pitch = Math.max(0.14, Math.min(1.25, cam.pitch + look.dy * 0.0035));
        }
        const alive = this.state === 'run' && !Platform.adActive && !(this.shieldT > 0);
        if (this.state === 'run') this.stepHero(dt);
        else if (this.state === 'dead') this.stepDead(dt);
        else { this.hero.step(dt, {}); this.hero.pose('idle', dt); }
        GameWorld.update(dt, this.hero, this.state);
        // опасности
        const cause = GameHazards.update(dt, this.hero, alive, this.isSafe());
        if (cause && this.state === 'run') this.die(cause);
        this.syncCam();
        ObbyBots.update(dt);
        ObbyCourseView.update(dt, { x: this.hero.x, z: this.hero.z });
        GameKeys.update(dt, this.hero.x, this.hero.z);
        if (typeof Rig !== 'undefined') Rig.updateAll(dt);
        this.windFx(dt);
        GameChoco.update(dt, this.hero);
        const tr = this.state === 'run' ? this._tread : null;
        GameTreadmills.update(dt, this.hero, tr, tr ? GameProgress.treadmillRate(tr.tier) * GameProgress.perStep() * GameProgress.treadmillMult(tr.tier) * (this.boostT > 0 ? 2 : 1) : 0);
        GamePost.update(dt, this.state === 'run' ? Math.min(1, Math.hypot(this.hero.vx, this.hero.vz) / 2000) + (this.boostT > 0 ? 0.25 : 0) : 0);
        // таймеры
        if (this.padCool > 0) this.padCool -= dt;
        if (this.boostT > 0) { this.boostT = Math.max(0, this.boostT - dt); if (GameHud.setBoost) GameHud.setBoost(Math.ceil(this.boostT)); }
        if (this.shieldT > 0) { this.shieldT = Math.max(0, this.shieldT - dt); this.shieldFx(dt); }
        if (this.jumpT > 0) this.jumpT = Math.max(0, this.jumpT - dt);
        const baseJump = typeof OBBY_JUMP_SPEED !== 'undefined' ? OBBY_JUMP_SPEED : 1120;
        if (this.hero && this.hero.cfg) this.hero.cfg.jump = this.jumpT > 0 ? baseJump * 1.32 : baseJump;
        this.boardT -= dt; if (this.boardT <= 0) { this.boardT = 4; this.updateBoard(); }
        this.scoreT -= dt; if (this.scoreT <= 0) { this.scoreT = 30; this.submitScore(); }
        this.flushPops(dt);
        if (this._hudDirty) { this._hudDirty = false; this.refreshHud(); }
    },

    stepHero(dt) {
        const cam = /** @type {LoryApp} */ (this.app).camera, h = this.hero;
        const m = Input.move();
        const fx = Math.cos(cam.azimuth), fz = Math.sin(cam.azimuth);
        const dx = fx * m.y - fz * m.x, dz = fz * m.y + fx * m.x;
        const jumped = Input.pressed('jump');
        const wasGrounded = h.grounded;
        h.step(dt, { dx, dz, jump: jumped, speed: GameProgress.runSpeed() });
        if (jumped && wasGrounded && !h.grounded) this.sfx(['assets/sounds/jump1.mp3', 'assets/sounds/jump2.ogg'], 0.45);
        if (!wasGrounded && h.grounded) { this.landedT = 0.1; this.sfx(['assets/sounds/land1.ogg', 'assets/sounds/key3.mp3'], 0.35); }
        const near = this.near = GameWorld.near(h);
        const onTread = near && near.kind === 'treadmill' && h.grounded && GameProgress.treadmillOwned(near.tier);
        const moving = Math.hypot(h.vx, h.vz) > 60;
        h.pose(!h.grounded ? 'air' : (moving || onTread) ? 'run' : 'idle', dt);
        if (h.bounced) { h.bounced = false; this.sfx('assets/sounds/jump2.ogg', 0.6); }
        // смерть: вода-шоколад, лава, ловушки, пропасть
        const hit = ObbyCourse.hazardAt(h.x, h.y, h.z, h.radius * 0.9, h.height);
        if (hit) { this.die(hit.cause || 'fall', hit); return; }
        if (h.grounded) {
            this.stepKeys(h);
            const ns = ObbyCourse.reached(h.x, h.y, h.z, this.stage);
            if (ns > this.stage) this.reachStage(ns);
        }
        this._tread = onTread ? near : null;
        if (onTread) {
            this.treadmill(dt, near);
            // на ленте без ввода — лицом к пульту, бег на месте
            const fy = GameTreadmills.faceYaw(near);
            if (fy != null && Math.hypot(m.x, m.y) < 0.2) { let a = fy - h.yaw; a = Math.atan2(Math.sin(a), Math.cos(a)); h.yaw += a * Math.min(1, dt * 8); h.sync(); }
        }
        this.interact(near);
    },

    /** Шаги по клавишам: новая клетка клавиатуры — шаг; вне клавиатур — каждые KE_KEY_PITCH px. */
    stepKeys(h) {
        const cell = GameKeys.cellAt(h.support, h.x, h.z);
        const pitch = typeof KE_KEY_PITCH !== 'undefined' ? KE_KEY_PITCH : 96;
        if (cell) {
            if (cell.key !== this.lastKey) {
                this.lastKey = cell.key;
                GameKeys.press(cell, this.glow);
                this.onStep(cell);
            }
        } else {
            this.lastKey = '';
            this.stepDist += Math.hypot(h.x - this.lastX, h.z - this.lastZ);
            if (this.stepDist >= pitch) { this.stepDist = 0; this.onStep(null); }
        }
        this.lastX = h.x; this.lastZ = h.z;
    },

    onStep(cell) {
        const add = GameProgress.step(1, this.boostT > 0 ? 2 : 1);
        this.popAcc += add;
        // ASMR-щелчок: не чаще 14 раз в секунду, тише на высокой скорости
        const now = performance.now() / 1000;
        if (cell && now - this.clickT > 0.07) {
            this.clickT = now;
            this.sfx(KEY_SOUNDS, 0.55 - Math.min(0.25, GameProgress.runSpeed() / 9000));
            if (this.glowFx !== 'none') this.keyFx(cell);
        }
        if (Tutorial.active) Tutorial.complete('speed');
    },

    keyFx(cell) {
        const fx = /** @type {LoryApp} */ (this.app).fx, p = GameKeys.cellPos(cell);
        if (!fx || !p) return;
        const colors = { sparkle: '#ffffff', hearts: '#ff6fae', stars: '#ffd23f', rainbow: '#7ef0c8', fire: '#ff7a2a', bubbles: '#9fe3ff' };
        fx.create({ burst: 6, capacity: 8, life: [0.3, 0.6], size: [8, 16], speed: [80, 200], color: colors[this.glowFx] || hexColor(this.glow), color2: '#ffffff',
            position: [p[0], p[1] + 10, p[2]], direction: [[-0.5, 1, -0.5], [0.5, 2, 0.5]], gravity: [0, -600, 0], duration: 0.05 });
    },

    /** «+N» над героем: копится и вылетает не чаще ~11 раз в секунду. */
    flushPops(dt) {
        this.popT -= dt;
        if (this.popAcc <= 0 || this.popT > 0) return;
        this.popT = 0.09;
        const v = /** @type {LoryApp} */ (this.app).location.view, h = this.hero;
        const s = v.projectToScreen(h.x + (Math.random() - 0.5) * 60, h.z + (Math.random() - 0.5) * 60, h.y + 210);
        if (s && s.visible && !s.behind) GameHud.popPlus('+' + GameProgress.fmt(this.popAcc), s.x, s.y, this.boostT > 0 ? '#ffd23f' : null);
        this.popAcc = 0;
    },

    treadmill(dt, p) {
        const rate = GameProgress.treadmillRate(p.tier);
        this.treadAcc += rate * dt;
        while (this.treadAcc >= 1) {
            this.treadAcc -= 1;
            const add = GameProgress.step(1, (this.boostT > 0 ? 2 : 1) * GameProgress.treadmillMult(p.tier));
            this.popAcc += add;
            const now = performance.now() / 1000;
            if (now - this.clickT > 0.11) { this.clickT = now; this.sfx(KEY_SOUNDS, 0.32); }
        }
    },

    /** Контекстная кнопка у стойки, портала, закрытой дорожки; Wins-пад — касанием; ворота этапа — баннер. */
    interact(p) {
        const kind = p ? p.kind : '';
        if (kind === 'stand' || kind === 'portal') {
            const win = p.kind === 'portal' ? 'teleport' : p.id;
            Input.setContext({ id: 'open', label: Lang.t('kg.open'), icon: '🍭', action: 'interact' }, 2);
            if (GameHud.prompt) GameHud.prompt('[' + this.keyLabel() + '] ' + Lang.t('kg.open') + ': ' + Lang.t(p.kind === 'portal' ? 'world.portal' : 'world.stand.' + p.id));
            if (Input.pressed('interact') || this.takeTap()) this.openWindow(win);
        } else if (kind === 'treadmill' && !GameProgress.treadmillOwned(p.tier)) {
            const t = GAME_TREADMILLS[p.tier - 1], off = p.off || 0, price = GameProgress.treadmillPrice(p.tier, off);
            Input.setContext({ id: 'open', label: Lang.t('kg.buy'), icon: '🏆', action: 'interact' }, 2);
            const txt = off ? Lang.t('kg.treadDeal', { m: t.mult, p: GameProgress.fmt(price), n: Math.round(off * 100) }) : Lang.t('kg.treadLocked', { m: t.mult, p: GameProgress.fmt(t.price) });
            if (GameHud.prompt) GameHud.prompt('[' + this.keyLabel() + '] ' + txt);
            if (Input.pressed('interact') || this.takeTap()) { const r = this.buy(GameProgress.buyTreadmill(p.tier, off)); if (r && r.ok) GameWorld.refreshDeals(); }
        } else {
            Input.clearContext('open');
            if (GameHud.prompt) GameHud.prompt(kind === 'treadmill' ? Lang.t('kg.treadOn', { m: GameProgress.treadmillMult(p.tier) }) : null);
        }
        if (kind === 'winpad' && this.padCool <= 0 && this.hero.grounded) this.winPad(p.n);
        if (kind === 'stage' && this.inStage !== p.n) this.enterStage(p.n);
        if (kind !== 'stage' && kind !== '' && this.inStage) this.inStage = 0;
    },

    /** Клавиша взаимодействия под текущий ввод: E на клавиатуре, «👆» на касании. */
    keyLabel() { return Input.device === 'touch' ? '👆' : (Input.labelOf ? Input.labelOf('interact') : 'E') || 'E'; },
    takeTap() { const t = !!this._tapInteract; this._tapInteract = false; return t; },

    openWindow(name) {
        if (name === 'top') this.updateBoard();
        GameWorld.npcReact(name, 'open');
        GameHud.open(name);
        this.sfx('assets/sounds/ui-click.mp3', 0.5);
    },

    enterStage(n) {
        this.inStage = n;
        const st = GAME_STAGES[n - 1];
        if (!st) return;
        GameHud.zoneBanner(Lang.t('kg.welcome', { n, name: st.name[Lang.code] || st.name.en }), 'stage');
        if (GameProgress.state.speed < st.req && this.warned !== n) {
            this.warned = n;
            setTimeout(() => GameHud.zoneBanner(Lang.t('kg.needSpeed', { n: GameProgress.fmt(st.req) }), 'warn'), 1600);
        }
        if (n === 1) Tutorial.complete('stage');
        this.updateStageHud(n);
    },

    isSafe() {
        const h = this.hero;
        if (this.stage === 0 && ObbyCourse.spawn && Math.hypot(h.x - ObbyCourse.spawn.x, h.z - ObbyCourse.spawn.z) < 2600) return true;
        for (const c of ObbyCourse.checkpoints) if (Math.hypot(h.x - c.x, h.z - c.z) < c.r * 1.6 && Math.abs(h.y - c.y) < 300) return true;
        return false;
    },

    die(cause, hit) {
        if (this.state !== 'run') return;
        this.state = 'dead';
        this.deadT = typeof KE_DEATH_SEC !== 'undefined' ? KE_DEATH_SEC : 0.9;
        const h = this.hero;
        if (cause === 'trap' && hit) h.knock((hit.n ? hit.n[0] : 0) * 700, 650, (hit.n ? hit.n[2] : 0) * 700);
        else if (cause === 'ball' || cause === 'monster' || cause === 'wave') h.knock(-Math.cos(h.yaw) * 500, 700, -Math.sin(h.yaw) * 500);
        this.sfx('assets/sounds/damage.mp3', 0.7);
        this.fxAt('ke-death', 0, 80);
        /** @type {LoryApp} */ (this.app).camera.shake(240, 0.012);
        const key = { ball: 'kg.died.ball', wave: 'kg.died.wave', monster: 'kg.died.monster', trap: 'kg.died.trap' }[cause] || 'kg.died.fall';
        GameHud.toast(Lang.t(key), 1300);
        if (Tutorial.roundCounts()) Platform.ads.roundEnded(false);
        this.submitScore();
        GameOffers.fail(this.stage);
        if (typeof Telemetry !== 'undefined') Telemetry.progress('failed', 'stage_' + (this.stage + 1), { step_index: this.stage + 1, cause: String(cause) });
    },

    stepDead(dt) {
        this.deadT -= dt;
        this.hero.step(dt, {});
        this.hero.pose('dead', dt);
        if (this.deadT <= 0) { this.state = 'run'; this.respawnHero(true); this.updateStageHud(); GameOffers.afterRespawn(); }
    },

    reachStage(ns) {
        const K = ObbyCourse.checkpoints.length;
        if (ns > K) { this.finishWorld(); return; }
        this.stage = ns;
        GameOffers.pass();
        ObbyCourseView.setStage(ns);
        ObbyBots.playerCheckpoint(ns);
        GameProgress.reachStage(ns);
        this.save.stage = ns;
        this.persist();
        GameHud.zoneBanner(Lang.t('kg.safe', { n: ns }), 'safe');
        this.sfx('assets/sounds/candy.mp3', 0.7);
        this.updateStageHud();
        if (typeof Telemetry !== 'undefined') Telemetry.progress('completed', 'stage_' + ns, { step_index: ns });
    },

    finishWorld() {
        this.stage = ObbyCourse.checkpoints.length + 1;
        this.save.stage = ObbyCourse.checkpoints.length;
        this.persist();
        GameHud.zoneBanner(Lang.t('kg.finish'), 'safe');
        GameProgress.reachStage(GAME_STAGES.length);
    },

    /** Wins-пад Safe Zone n: награда, эмоция, окно результата; «Продолжить» — телепорт в хаб (точка interstitial). */
    winPad(n) {
        this.padCool = 999;
        GameOffers.pass();
        const wins = GameProgress.padWins(n);
        GameProgress.addWins(wins);
        this.fxAt('ke-wins', 0, 40);
        GamePost.pulse(0.6);
        this.sfx('assets/sounds/reward.mp3', 0.8);
        GameWorld.playEmote(this.emote, 2.6);
        if (Tutorial.roundCounts()) Platform.ads.roundEnded(true);
        this.submitScore();
        this.state = 'result';
        Input.clearContext('open');
        const st = n <= GAME_STAGES.length ? GAME_STAGES[n - 1] : null;
        let doubled = false;
        const go = () => {
            this.state = 'run';
            this.stage = 0; this.save.stage = 0; this.persist();
            this.respawnHero(false);
            ObbyCourseView.setStage(0);
            this.padCool = typeof KE_WINPAD_COOLDOWN !== 'undefined' ? KE_WINPAD_COOLDOWN : 1.5;
            this.updateStageHud();
        };
        GameHud.result({ wins, stage: n, stageName: n === 12 ? Lang.t('kg.tower') : st ? (st.name[Lang.code] || st.name.en) : Lang.t('kg.finish'), total: GameProgress.state.wins }, {
            onContinue: () => Platform.ads.next(go),
            onDouble: async () => {
                if (doubled) return false;
                const ok = await Platform.rewarded('wins-x2');
                if (!ok || doubled) return false;
                doubled = true;
                GameProgress.addWins(wins);
                if (GameHud.resultDoubled) GameHud.resultDoubled(wins * 2);
                this.sfx('assets/sounds/reward.mp3', 0.8);
                return true;
            },
        });
    },

    /** Телепорт из окна портала: хаб бесплатно, открытая Safe Zone — за Wins; через точку interstitial. */
    teleport(n) {
        n = n | 0;
        if (n > 0) { const r = GameProgress.payTeleport(n); if (!r.ok) { this.buy(r); return; } }
        GameHud.close();
        Platform.ads.next(() => {
            this.stage = n; this.save.stage = n; this.persist();
            GameOffers.pass();
            ObbyCourseView.setStage(n);
            this.state = 'run';
            this.respawnHero(false);
            const st = GAME_STAGES[n - 1];
            GameHud.toast(Lang.t('kg.teleport', { name: n ? (st ? (st.name[Lang.code] || st.name.en) : n) : Lang.t('kg.hub') }), 1500);
            this.updateStageHud();
        });
    },

    /** Пропуск этапа за рекламу: сразу в следующую Safe Zone (как будто этап пройден). */
    skipStage() {
        const K = ObbyCourse.checkpoints.length;
        if (this.stage >= K) return;
        const ns = this.stage + 1;
        this.reachStage(ns);
        this.respawnHero(false);
        GameHud.toast(Lang.t('of.skipOn', { n: ns }), 1600);
    },

    /** Щит: мягкое кольцо искр вокруг героя, пока идёт. */
    shieldFx(dt) {
        const fx = /** @type {LoryApp} */ (this.app).fx, h = this.hero;
        this._shT = (this._shT || 0) - dt;
        if (!fx || !h || this._shT > 0) return;
        this._shT = 0.12;
        fx.create({ burst: 5, capacity: 8, life: [0.4, 0.7], size: [10, 18], speed: [20, 60], color: '#7ef0c8', color2: '#ffffff', duration: 0.05,
            position: [h.x, h.y + 90, h.z], box: [[-70, -80, -70], [70, 80, 70]], gravity: [0, 60, 0] });
    },

    rebirth() {
        const r = GameProgress.rebirth();
        if (!r.ok) { this.sfx('assets/sounds/deny.mp3', 0.6); return; }
        this.sfx('assets/sounds/rebirth.ogg', 0.9);
        this.fxAt('ke-rebirth', 0, 60);
        GamePost.pulse(1);
        GameHud.toast(Lang.t('kg.rebirthDone', { m: GameProgress.fmt(GameProgress.rebirthMult()) }), 2200);
        if (GameHud.refresh) GameHud.refresh();
        this.refreshHud();
    },

    async boostAd() {
        if (this.boostT > 0 || this._boostBusy) return;
        this._boostBusy = true;
        try {
            const ok = await Platform.rewarded('speed-boost');
            if (ok) { this.boostT = 60; GameHud.toast(Lang.t('kg.boost'), 1600); this.sfx('assets/sounds/level.ogg', 0.7); }
        } finally { this._boostBusy = false; }
    },

    // -------------------------------------------------------------------------------------------
    // HUD, рекорды, события
    // -------------------------------------------------------------------------------------------

    refreshHud() {
        const s = GameProgress.state, L = GameProgress.levelInfo();
        GameHud.setStats({
            speed: s.speed, maxSpeed: s.maxSpeed, cap: Math.max(1, s.speed), wins: s.wins, level: L.level, levelCur: L.cur, levelNext: L.next, levelK: L.k,
            rebirths: s.rebirths, mult: GameProgress.mult() * (this.boostT > 0 ? 2 : 1), perStep: GameProgress.perStep() * (this.boostT > 0 ? 2 : 1),
            canRebirth: GameProgress.canRebirth(),
        });
    },

    updateStageHud(n) {
        const total = GAME_STAGES.length;
        const cur = n || Math.min(total, this.stage + 1);
        const st = GAME_STAGES[cur - 1];
        const name = this.stage === 0 && !n ? Lang.t('kg.hub') : st ? (st.name[Lang.code] || st.name.en) : '';
        GameHud.setStage(cur, total, name, st ? st.req : 0);
    },

    makeBoard() {
        const names = (GAME_BOT_NAMES[Lang.code] || GAME_BOT_NAMES.en).slice().sort((a, b) => (a.length * 31 + a.charCodeAt(1)) % 17 - (b.length * 31 + b.charCodeAt(1)) % 17);
        let seed = 7;
        const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
        this.board = names.slice(0, 14).map((name, i) => ({ name, base: Math.round(80 * Math.pow(1.55, 13 - i) * (0.7 + rnd() * 0.6)), rate: 0.4 + rnd() * 2.2 }));
    },

    /** Рекорды: таблица площадки (Platform.leaderboard — Яндекс, Playgama) раз в 30 с; нет её — живой «сервер» ботов. */
    async updateBoard() {
        const now = performance.now();
        if (this._lbReal !== false && (!this._lbAt || now - this._lbAt > 30000)) {
            this._lbAt = now;
            try {
                const rows = await Platform.leaderboard({ avatarSize: 'small' });
                this._lbReal = Array.isArray(rows) ? rows : false;
            } catch (e) { this._lbReal = false; }
            GameHud.setLogin(Platform.canLogin() && !Platform.authorized());
        }
        if (Array.isArray(this._lbReal)) {
            const rows = this._lbReal.map(r => ({ rank: r.rank, name: r.name, score: r.score, me: !!r.me, avatar: r.avatar }));
            if (GameHud.setLeaderboard) GameHud.setLeaderboard(rows);
            GameWorld.setBoard(rows);
            return;
        }
        const me = { name: Lang.code === 'ru' ? 'Ты' : 'You', score: Math.floor(GameProgress.state.speed), me: true };
        const t = performance.now() / 1000;
        const rows = this.board.map(b => ({ name: b.name, score: Math.floor(b.base + b.rate * t * 3), me: false })).concat([me]);
        rows.sort((a, b) => b.score - a.score);
        const out = rows.slice(0, 10).map((r, i) => Object.assign({ rank: i + 1 }, r));
        if (!out.some(r => r.me)) out.push(Object.assign({ rank: rows.indexOf(me) + 1 }, me));
        if (GameHud.setLeaderboard) GameHud.setLeaderboard(out);
        GameWorld.setBoard(out);
    },

    /** Результат в рекорды площадки: после каждого раунда (смерть, Wins-пад) и раз в 30 с — без отсечения локальным рекордом. */
    submitScore() {
        const v = Math.floor(GameProgress.state.speed);
        this.lastSent = v;
        try { Platform.submitScore(v); } catch (e) { /* площадка без рекордов */ }
        this._lbAt = 0;
    },

    /** «Войдите в аккаунт»: окно входа площадки по нажатию; после входа — прогресс аккаунта (если он дальше) или сохранить текущий. */
    async login() {
        let ok = false;
        try { ok = await Platform.login(); } catch (e) { ok = false; }
        GameHud.setLogin(Platform.canLogin() && !Platform.authorized());
        if (!ok) return;
        let cloud = null;
        try { cloud = await Platform.load(); } catch (e) { cloud = null; }
        const cw = cloud && cloud.prog ? Number(cloud.prog.winsTotal) || 0 : 0;
        if (cw > (GameProgress.state.winsTotal || 0)) { location.reload(); return; }   // прогресс аккаунта дальше — начать с него
        this.persist();
        this._lbAt = 0; this.updateBoard();
    },

    /** Боты рядом с игроком, которых могут сбить опасности: живые, считаются (не «заморожены» вдали). */
    liveBots() {
        if (!this.botsReady || !ObbyBots.list) return [];
        return ObbyBots.list.filter(b => b.state === 'run' && !b.frozen && !(b.invT > 0)).map(b => ({ actor: b.actor, kill: (cause) => ObbyBots.kill(b, cause) }));
    },

    botEvent(type, bot, data) {
        if (!this.botsReady) return;
        if (type === 'join') GameHud.chat('', Lang.t('kg.joined', { name: bot.name }));
        else if (type === 'leave') GameHud.chat('', Lang.t('kg.left', { name: bot.name }));
        else if (type === 'finish') GameHud.chat('', Lang.t('kg.finished', { name: bot.name }), '#ffd23f');
        else if (type === 'knock') {
            this.sfx('assets/sounds/land1.ogg', 0.8);
            /** @type {LoryApp} */ (this.app).camera.shake(160, 0.01);
            GameHud.toast(Lang.t('kg.knock', { name: bot.name }), 1400);
        } else void data;
    },

    hazardEvent(type, d) {
        if (type === 'roar' && d) {
            const h = this.hero, dist = Math.hypot(h.x - d.x, h.z - d.z);
            if (dist < 3000) this.sfx('assets/sounds/door.mp3', 0.5);
        }
    },

    windFx(dt) {
        const fx = /** @type {LoryApp} */ (this.app).fx;
        if (!fx) return;
        this._windT = (this._windT || 0) - dt;
        if (this._windT > 0) return;
        this._windT = 0.25;
        for (const w of GameHazards.windSpots()) {
            if (Math.hypot(w.x - this.hero.x, w.z - this.hero.z) > 3500) continue;
            fx.play('ke-wind', new BABYLON.Vector3(w.x - w.dir[0] * w.hx, w.y + 120 + Math.random() * 200, w.z - w.dir[1] * w.hx + (Math.random() - 0.5) * w.hz),
                { direction: [[w.dir[0], 0, w.dir[1]], [w.dir[0], 0.1, w.dir[1]]] });
        }
    },

    fxAt(name, dx, dh) {
        const fx = /** @type {LoryApp} */ (this.app).fx, h = this.hero;
        if (fx && h) fx.play(name, new BABYLON.Vector3(h.x + (dx || 0), h.y + (dh || 0), h.z));
    },

    sfx(url, volume) {
        try { Sound.play(url, { volume: volume == null ? 0.6 : volume }); } catch (e) { /* без звука игра идёт */ }
    },
};
