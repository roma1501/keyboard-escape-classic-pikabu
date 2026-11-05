// GameHud.js — интерфейс «ASMR Keyboard Escape: Candy & Chocolate»: меню-лобби, HUD забега, окна, тосты, чат ботов, всплывающие «+N».
// Образ — «кондитерская клавиатура»: вафельные плитки шоколада, кнопки-колпачки клавиш, розовая глазурь (стили — js/GameUiCss.js,
// иконки — assets/ui/UI-SOURCES.md, шрифт Nunito/Fredoka — @font-face в index.html). Раскладка — HudLayout (блоки gh-*).
// Порядок скриптов: GameShopData, GameUiLang, GameUiCss, GameUiKit, GameUiWindows, GameUiShop, GameHud (все перед Game.js).
//
// ---------------------------------------------------------------------------------------------------------------------------
// API (вызывает Game.js)
//   GameHud.init({ onPlay, onHowTo, onPause, onResume, onSound, onTeleport(stage), onRebirth(), onBuyTrail(id), onEquipTrail(id),
//                  onBuyAura(id), onEquipAura(id), onBuyTreadmill(tier), onMaxSpeed(v), onQuality(choice), onBoost(),
//                  onWindow(name, open) })
//     Колбэки покупок могут вернуть { ok, reason } (или Promise): при ok:false окно покажет тост. Нет колбэка — окно само вызовет
//     GameProgress (buyTrail / equipTrail / buyAura / equipAura / buyTreadmill / rebirth), Teleport без onTeleport ничего не делает.
//     onMaxSpeed(v): v — число 0..cap (значение ползунка; v >= speed — без лимита). onQuality(choice): 'auto'|'low'|'medium'|'high'
//     (Quality.set зовёт сам GameHud). onWindow(name, open) — окно открылось/закрылось (для 'top' игра отвечает GameHud.setLeaderboard).
//   GameHud.menu(show) / GameHud.run(show)        режим экрана: меню-лобби (HUD скрыт) / забег (HUD виден)
//   GameHud.setStats({ speed, maxSpeed, cap, wins, level, levelCur, levelNext, levelK, rebirths, mult, perStep, canRebirth })
//   GameHud.setStage(n, total, nameText, reqSpeed)        табличка этапа «Этап 3 · Зефирный обвал» и «⚡120»
//   GameHud.zoneBanner(text, kind)                        kind: 'safe' | 'warn' | 'stage'
//   GameHud.popPlus(text, sx, sy, color?)                 «+N» у героя, экранные px
//   GameHud.toast(text, ms?)   GameHud.chat(name, text, color?)   GameHud.prompt(textOrNull)   «[E] Trails»
//   GameHud.open(name) / close() / isOpen(name?) / hasWindow()   name: trails | auras | rebirth | teleport | treadmills | shop | daily |
//                                                                wheel | top | pause | settings (| result — только через GameHud.result)
//   GameHud.setLeaderboard([{ rank, name, score, me }])   GameHud.setSound(on)   GameHud.pause(on)   GameHud.refresh()
//   GameHud.result({ wins, stage, stageName, total }, { onContinue, onDouble })   награда Wins-пада; GameHud.resultDoubled(newWins)
//   GameHud.setBoost(secondsLeft)      кнопка «x2 Speed» за рекламу: 0 — доступна, >0 — таймер активного буста
//   GameHud.setLevelUp(level)          праздничный баннер «Уровень N!»
//   GameHud.tutorialOpts()             { css } для Tutorial.init({ ..., ...GameHud.tutorialOpts() }) — карточка в стиле игры
//
// ПАУЗА. Любое окно, открытое в режиме забега (после GameHud.menu(false) / run(true)), ставит Pause.set('manual', true) и снимает её при
// закрытии (если паузу до этого не держала игра). В меню-лобби окна паузу не ставят, а само меню прячется под окном. Окно 'pause'
// паузу НЕ трогает: её ставит игра (togglePause: Pause.set('manual', on); GameHud.pause(on)). Esc и P при открытом окне закрывают его
// (GameHud гасит событие первым — игра свою паузу не включает); если игра слушает Esc сама — спрашивай !GameHud.hasWindow().
//
// ВАЛЮТА. Wins читаются из GameProgress (state.wins). Магазин, подарок дня и колесо — GameUiShop.init (см. шапку js/GameUiShop.js).

/** @satisfies {Record<string, any>} */
const GameHud = {
    /** @type {Record<string, any>} */ cb: {},
    /** @type {Record<string, any>} */ defs: {},
    /** @type {Record<string, HTMLElement>} */ el: {},
    /** Имя открытого окна ('' — нет). */
    current: '',
    /** @type {any} */ _ctx: null,
    _mode: 'none',
    _sound: true,
    _board: [],
    _result: null, _resultCb: null,
    _promptText: '', _canLogin: false, _ownPause: false, _toastOn: false, _zoneOn: false, _promptOn: false, _boostBusy: false,
    _boost: 0, _lastMode: '', _inited: false, _dragMax: false, _lvT: 0,
    /** @type {any} */ _stage: null,
    /** @type {HTMLElement | null} */ root: null,
    /** @type {Record<string, any>} */ stats: {},
    /** @type {any} */ _toastT: 0, /** @type {any} */ _zoneT: 0, _back: '', _opts: {},

    // =============================================================================================== запуск
    init(cb) {
        this.cb = cb || {};
        if (typeof document === 'undefined' || this._inited) return this;
        this._inited = true;
        GameUi.install();
        GameUi.sfxInit();
        for (const k of Object.keys(GAME_UI_WINDOWS)) if (k[0] !== '_') this.defs[k] = GAME_UI_WINDOWS[k];
        for (const k of Object.keys(GAME_UI_SHOP_WINDOWS)) if (k[0] !== '_') this.defs[k] = GAME_UI_SHOP_WINDOWS[k];
        const btns = [['rebirth', 'rebirth', 'k-blue'], ['trails', 'trails', 'k-pink'], ['auras', 'auras', 'k-mint'], ['shop', 'shop', 'k-lemon'],
            ['teleport', 'portal', 'k-blue'], ['daily', 'gift', 'k-pink'], ['wheel', 'wheel', 'k-mint']];
        const hud = GameUi.el('div', 'gk-ui');
        hud.id = 'gh-hud';
        hud.innerHTML =
            '<div id="gh-speed" class="gh-blk gk-wafer">' + GameUi.ic('speed', 'gh-ic') + '<div class="col"><span class="lab gk-os" data-t="ke.speed"></span><b class="val gk-o" data-k="speed">0</b></div></div>' +
            '<div id="gh-level" class="gh-blk gk-wafer"><div class="row gk-os"><span data-k="lvl"></span><span class="gk-num" data-k="lvlnum"></span></div><div class="gk-bar" data-k="lvlbar"><i></i></div></div>' +
            '<div id="gh-wins" class="gh-blk gk-wafer">' + GameUi.ic('wins', 'gh-ic') + '<div class="col"><span class="lab gk-os" data-t="ke.wins"></span><b class="val gk-o" data-k="wins">0</b></div></div>' +
            '<div id="gh-mult" class="gh-blk"><span class="gk-chip mx" data-k="mult">x1</span><span class="gk-chip pink" data-k="step"></span><span class="gk-chip gold" data-k="rb" style="display:none"></span></div>' +
            '<div id="gh-btns" class="gh-blk">' + btns.map((b) => '<button type="button" class="gk-key ' + b[2] + '" data-w="' + b[0] + '">' + GameUi.ic(b[1]) + '<span class="lb gk-os" data-t="ke.btn.' + b[0] + '"></span></button>').join('') + '</div>' +
            '<div id="gh-sys" class="gh-blk"><button type="button" class="gk-key k-lemon sq" data-k="sound" aria-label="sound">' + GameUi.ic('sound') + '</button><button type="button" class="gk-key k-pink sq" data-k="pause" aria-label="pause">' + GameUi.ic('pause') + '</button></div>' +
            '<div id="gh-max" class="gh-blk gk-wafer"><div class="row gk-os"><span data-t="ke.max"></span><b data-k="maxv">0</b></div><input class="gk-range" type="range" min="0" max="100" step="1" value="100" data-k="max" aria-label="Max Speed"></div>' +
            '<div id="gh-boost" class="gh-blk"><button type="button" class="gk-key k-lemon" data-k="boost">' + GameUi.ic('ad') + '<span class="t"><span data-k="boostl"></span><small data-k="boosts"></small></span></button></div>' +
            '<div id="gh-stage" class="gh-blk gk-wafer"><b class="gk-o" data-k="stage"></b><span class="req" data-k="req">' + GameUi.ic('speed') + '<span data-k="reqv">0</span></span></div>' +
            '<div id="gh-toast" class="gh-blk gk-wafer"><span class="gk-o" data-k="toast"></span></div>' +
            '<div id="gh-zone" class="gh-blk"><div class="zb safe" data-z="safe">' + GameUi.ic('shield') + '<span class="gk-o" data-k="zsafe"></span></div><div class="zb warn" data-z="warn">' + GameUi.ic('lock') + '<span class="gk-o" data-k="zwarn"></span></div><div class="zb stage" data-z="stage">' + GameUi.ic('star') + '<span class="gk-o" data-k="zstage"></span></div></div>' +
            '<div id="gh-chat" class="gh-blk" aria-live="polite"></div>' +
            '<div id="gh-prompt" class="gh-blk"><span class="gk-o" data-k="prompt"></span></div>';
        document.body.appendChild(hud);
        const fx = GameUi.el('div', 'gk-ui'); fx.id = 'gk-fx';
        const lvl = GameUi.el('div', 'gk-ui', '<div class="lv gk-o" data-k="lvlt"></div>'); lvl.id = 'gk-level';
        const modal = GameUi.el('div', 'gk-ui'); modal.id = 'gk-modal';
        const menu = GameUi.el('div', 'gk-ui');
        menu.id = 'gk-menu';
        menu.innerHTML = '<div class="gk-logo"><div class="keys r1" data-k="logo1"></div><div class="keys r2" data-k="logo2"></div><div class="sub gk-o" data-t="ke.logo.sub"></div></div>' +
            '<div class="gk-mstats">' +
            '<div class="st gk-wafer">' + GameUi.ic('speed') + '<div class="c"><small data-t="ke.speed"></small><b data-k="mspeed">0</b></div></div>' +
            '<div class="st gk-wafer">' + GameUi.ic('wins') + '<div class="c"><small data-t="ke.wins"></small><b data-k="mwins">0</b></div></div>' +
            '<div class="st gk-wafer">' + GameUi.ic('rebirth') + '<div class="c"><small data-t="ke.rebirth"></small><b data-k="mrb">0</b></div></div></div>' +
            '<button type="button" class="gk-key k-pink big play" data-k="play">' + GameUi.ic('play') + '<span data-t="ke.play"></span></button>' +
            '<div class="row"><button type="button" class="gk-key k-blue" data-k="howto">' + GameUi.ic('help') + '<span data-t="tut.howto"></span></button>' +
            '<button type="button" class="gk-key k-lemon sq" data-k="msound" aria-label="sound">' + GameUi.ic('sound') + '</button>' +
            '<button type="button" class="gk-key k-mint sq" data-k="mset" aria-label="settings">' + GameUi.ic('settings') + '</button>' +
            '<button type="button" class="gk-key k-choc sq" data-k="mtop" aria-label="top">' + GameUi.ic('top') + '</button></div>' +
            '<div class="gk-mhint gk-os" data-t="ke.menu.hint"></div>';
        document.body.appendChild(fx); document.body.appendChild(lvl); document.body.appendChild(menu); document.body.appendChild(modal);
        this.root = hud;
        for (const e of Array.from(document.querySelectorAll('#gh-hud [data-k], #gk-menu [data-k], #gk-level [data-k]'))) this.el[/** @type {HTMLElement} */ (e).dataset.k] = /** @type {HTMLElement} */ (e);
        this.el.hud = hud; this.el.menu = menu; this.el.modal = modal; this.el.fx = fx; this.el.level = lvl; this.el.chat = GameUi.q(hud, '#gh-chat'); this.el.toastBox = GameUi.q(hud, '#gh-toast');
        this.el.zone = GameUi.q(hud, '#gh-zone'); this.el.promptBox = GameUi.q(hud, '#gh-prompt');
        // подсказка у киоска — кнопка: клик или касание = взаимодействие (как клавиша E)
        this.el.promptBox.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (this.cb.onInteract) this.cb.onInteract(); }); this.el.boostBox = GameUi.q(hud, '#gh-boost');
        this._logo();
        Lang.apply(document.body);
        // --- кнопки ---
        const click = (el, fn) => el.addEventListener('click', (e) => { e.stopPropagation(); GameUi.sfx('ui_click'); fn(); });
        for (const b of GameUi.qa(hud, '#gh-btns [data-w]')) click(b, () => this.open(b.dataset.w));
        click(this.el.pause, () => { if (this.cb.onPause) this.cb.onPause(); else this.pause(true); });
        click(this.el.sound, () => { if (this.cb.onSound) this.cb.onSound(); });
        click(this.el.msound, () => { if (this.cb.onSound) this.cb.onSound(); });
        click(this.el.play, () => { if (this.cb.onPlay) this.cb.onPlay(); });
        click(this.el.howto, () => { if (this.cb.onHowTo) this.cb.onHowTo(); });
        click(this.el.mset, () => this.open('settings'));
        click(this.el.mtop, () => this.open('top'));
        this.el.boost.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this._boostBusy || this._boost > 0 || this.el.boost.classList.contains('off')) return;
            GameUi.sfx('ui_click'); this._boostBusy = true;
            setTimeout(() => { this._boostBusy = false; this._updateBoost(); }, 900);
            if (this.cb.onBoost) this.cb.onBoost();
        });
        const range = /** @type {HTMLInputElement} */ (this.el.max);
        range.addEventListener('input', () => { this._dragMax = true; this._maxLabel(Number(range.value)); if (this.cb.onMaxSpeed) this.cb.onMaxSpeed(Number(range.value)); });
        const endDrag = () => { this._dragMax = false; };
        range.addEventListener('change', endDrag); range.addEventListener('pointerup', endDrag); range.addEventListener('pointercancel', endDrag);
        // модальный слой: тап по фону закрывает окно
        modal.addEventListener('click', (e) => { if (e.target === modal && this.current && !this.defs[this.current].noClose) this.close(); });
        window.addEventListener('keydown', (e) => {
            if (!this.current || this.current === 'pause') return;
            if (e.code !== 'Escape' && e.code !== 'KeyP') return;
            e.stopImmediatePropagation();   // Esc закрывает окно; preventDefault на Esc запрещён требованиями Playables
            if (!this.defs[this.current].noClose) this.close();
        }, true);
        window.addEventListener('lory-language', () => this.relang());
        if (typeof Platform !== 'undefined' && Platform.onRewardedCooldown) Platform.onRewardedCooldown(() => this._tick());
        setInterval(() => this._tick(), 1000);
        // --- раскладка ---
        this._blocks();
        if (typeof HudLayout !== 'undefined') HudLayout.onChange(() => { if (HudLayout.mode !== this._lastMode) this._blocks(); });
        this.setStats({ speed: 0, wins: GameUi.wins() });
        this.setSound(!(typeof Sound !== 'undefined' && Sound.muted));
        this.menu(true);
        return this;
    },

    /** Блоки HudLayout: размеры зависят от режима окна (в низком — кнопки в два столбца, в портрете — уже). */
    _blocks() {
        if (typeof HudLayout === 'undefined') return;
        const m = HudLayout.mode || 'wide';
        this._lastMode = m;
        const tall = m === 'tall', low = m === 'low';
        const wL = tall ? 214 : 272, wR = tall ? 200 : 236;
        const L = (id, def) => HudLayout.block(id, def);
        L('gh-speed', { dock: 'tl', w: wL, h: 60, el: '#gh-speed', order: 0 });
        L('gh-level', { dock: 'tl', w: wL, h: 40, el: '#gh-level', order: 1 });
        L('gh-wins', { dock: 'tl', w: wL, h: 46, el: '#gh-wins', order: 2 });
        L('gh-mult', { dock: 'tl', w: wL, h: 34, el: '#gh-mult', order: 3 });
        L('gh-btns', { dock: 'ml', w: low ? 112 : 62, h: low ? 236 : 462, el: '#gh-btns', order: 4, min: 40 });
        L('gh-sys', { dock: 'tr', w: 124, h: 52, el: '#gh-sys', order: 0, min: 40 });
        L('gh-max', { dock: 'tr', w: wR, h: 56, el: '#gh-max', order: 1, min: 40 });
        L('gh-boost', { dock: 'tr', w: wR, h: 48, el: '#gh-boost', order: 2, min: 40, visible: () => this._boostVisible() });
        L('gh-stage', { dock: 'tc', w: 360, h: 44, el: '#gh-stage', fill: true, maxW: 520, minW: tall ? 300 : 200, order: 0 });
        L('gh-toast', { dock: 'tc', w: 340, h: 40, el: '#gh-toast', fill: true, maxW: 520, minW: 160, order: 1, visible: () => this._toastOn });
        L('gh-zone', { dock: 'tc', w: 340, h: 54, el: '#gh-zone', fill: true, maxW: 560, minW: 200, order: 2, visible: () => this._zoneOn });
        L('gh-chat', { dock: 'mr', w: 250, h: 130, el: '#gh-chat', order: 6, modes: ['wide', 'land', 'tall'] });
        L('gh-prompt', { dock: 'bc', w: 280, h: 40, el: '#gh-prompt', fill: true, maxW: 420, minW: 120, order: 0, visible: () => this._promptOn });
    },

    // =============================================================================================== режимы экрана
    /** Меню-лобби (show) поверх живого хаба; menu(false) — начинается забег (HUD виден). */
    menu(show) {
        if (!this.root) return;
        this._mode = show ? 'menu' : 'run';
        this.root.classList.toggle('run', !show);
        this.el.menu.classList.toggle('on', !!show);
        if (show) { this.el.menu.classList.toggle('under', !!this.current); this._syncMenuStats(); }
        this._modalClass();
        if (typeof HudLayout !== 'undefined') HudLayout.schedule();
    },
    /** run(true) — HUD забега виден, run(false) — спрятан без меню (финиш, экран награды). */
    run(show) {
        if (!this.root) return;
        if (show) { this.menu(false); return; }
        this._mode = 'none';
        this.root.classList.remove('run');
        this.el.menu.classList.remove('on');
        this._modalClass();
    },

    // =============================================================================================== окна
    /** Открыть окно name (opts.back — окно, в которое вернуться при закрытии). true — открыто. */
    open(name, opts) {
        const def = this.defs[name];
        if (!def || !this.root) return false;
        const o = opts || {};
        const prev = this.current;
        if (prev) { this._destroyWin(); if (this.cb.onWindow) this.cb.onWindow(prev, false); }
        else if (name !== 'pause' && this._mode === 'run' && typeof Pause !== 'undefined' && !Pause.has('manual')) { Pause.set('manual', true); this._ownPause = true; }
        this.current = name; this._back = o.back || ''; this._opts = o;
        const win = GameUi.el('div', 'gk-win gk-wafer' + (def.cls ? ' ' + def.cls : ''));
        win.innerHTML = '<div class="gk-head gk-glaze-bar"><h2 class="gk-title gk-o">' + GameUi.ic(def.icon) + '<span></span></h2><div class="gk-wallet" style="display:none"></div>' +
            (def.noClose ? '' : '<button type="button" class="gk-key k-red sq" data-k="x" aria-label="close">' + GameUi.ic('close') + '</button>') + '</div>' +
            '<div class="gk-tabs" style="display:none"></div><div class="gk-body' + (def.noscroll ? ' ns' : '') + '"></div><div class="gk-foot"></div>';
        const ctx = this._ctx = {
            hud: this, win, head: GameUi.q(win, '.gk-head'), title: GameUi.q(win, '.gk-title span'), wallet: GameUi.q(win, '.gk-wallet'),
            tabs: GameUi.q(win, '.gk-tabs'), body: GameUi.q(win, '.gk-body'), foot: GameUi.q(win, '.gk-foot'), opts: o, data: {},
            refresh: () => this._render(), close: () => this.close(),
        };
        if (def.tabs) ctx.tabs.style.display = '';
        if (def.wallet) ctx.wallet.style.display = '';
        const x = win.querySelector('[data-k="x"]');
        if (x) x.addEventListener('click', (e) => { e.stopPropagation(); GameUi.sfx('ui_click'); this.close(); });
        this.el.modal.innerHTML = '';
        this.el.modal.appendChild(win);
        this.el.modal.classList.add('on');
        this.el.menu.classList.add('under');
        this._modalClass();
        try { def.build(ctx); } catch (e) { console.error('GameHud window ' + name + ' build:', e); }
        this._render();
        GameUi.sfx('ui_open', 0.5);
        if (this.cb.onWindow) this.cb.onWindow(name, true);
        return true;
    },
    /** Закрыть окно (если оно было открыто из другого — вернуться в него). */
    close() {
        if (!this.current) return false;
        const name = this.current, back = this._back;
        this._destroyWin();
        this.current = '';
        if (this.cb.onWindow) this.cb.onWindow(name, false);
        if (back && this.defs[back] && !this.current) { this.open(back); return true; }
        this.el.modal.classList.remove('on');
        this.el.modal.innerHTML = '';
        this.el.menu.classList.remove('under');
        if (this._ownPause) { this._ownPause = false; if (typeof Pause !== 'undefined') Pause.set('manual', false); }
        this._modalClass();
        if (typeof HudLayout !== 'undefined') HudLayout.schedule();
        return true;
    },
    _destroyWin() {
        const def = this.defs[this.current], ctx = this._ctx;
        try { if (def && def.onClose && ctx) def.onClose(ctx); } catch (e) { console.warn('GameHud onClose:', e); }
        this._ctx = null;
        this.current = '';
    },
    isOpen(name) { return name ? this.current === name : !!this.current; },
    /** Открыто ли окно, кроме паузы (игре: не включать свою паузу по Esc). */
    hasWindow() { return !!this.current && this.current !== 'pause'; },
    overlayOpen() { return !!(this.current || (this.el.menu && this.el.menu.classList.contains('on'))); },
    _modalClass() {
        document.body.classList.toggle('gk-modal', !!this.current);
        document.body.classList.toggle('ob-modal', !!this.current);
    },
    /** Перерисовать открытое окно по данным GameProgress / Shop. */
    refresh() { if (this.current) this._render(); this._syncMenuStats(); this.updateBadges(); },
    _render() {
        const ctx = this._ctx, def = this.defs[this.current];
        if (!ctx || !def) return;
        ctx.title.textContent = Lang.t(def.title);
        if (def.wallet) ctx.wallet.innerHTML = GameUi.ic('wins') + '<span>' + GameUi.fmt(GameUi.wins()) + '</span>';
        try { def.render(ctx); } catch (e) { console.error('GameHud window ' + this.current + ' render:', e); }
    },
    pause(on) {
        if (on) this.open('pause');
        else if (this.current === 'pause') this.close();
    },

    // =============================================================================================== данные HUD
    /** Числа HUD. Можно вызывать каждый кадр: DOM трогается только при изменении. */
    setStats(s) {
        const st = Object.assign(this.stats, s || {});
        const set = (k, v) => { const e = this.el[k]; if (e && e.dataset.v !== String(v)) { e.dataset.v = String(v); e.textContent = String(v); } };
        set('speed', GameUi.fmt(st.speed)); set('wins', GameUi.fmt(st.wins));
        const lv = Math.max(1, Math.floor(st.level || 1));
        set('lvl', Lang.t('ke.level', { n: lv }));
        const cur = Math.floor(st.levelCur || 0), next = Math.floor(st.levelNext || 0);
        set('lvlnum', next > 0 ? GameUi.fmt(cur) + ' / ' + GameUi.fmt(next) : '');
        const k = st.levelK != null && isFinite(st.levelK) ? st.levelK : (next > 0 ? cur / next : 0);
        const bar = /** @type {HTMLElement} */ (this.el.lvlbar.firstElementChild);
        const w = Math.round(100 * Math.max(0, Math.min(1, k))) + '%';
        if (bar.style.width !== w) bar.style.width = w;
        set('mult', GameUi.mult(st.mult != null ? st.mult : 1));
        set('step', Lang.t('ke.perstep', { n: GameUi.fmt(st.perStep || 0) }));
        const rb = Math.floor(st.rebirths || 0);
        this.el.rb.style.display = rb > 0 ? '' : 'none';
        set('rb', '↻ ' + rb);
        const rbtn = this.root.querySelector('[data-w="rebirth"]');
        if (rbtn) rbtn.classList.toggle('glow', !!st.canRebirth);
        // Max Speed
        const range = /** @type {HTMLInputElement} */ (this.el.max);
        const top = Math.max(1, Math.floor(st.cap > 0 ? st.cap : st.speed || 1));
        if (!this._dragMax) {
            if (range.max !== String(top)) range.max = String(top);
            const v = st.maxSpeed == null || !(st.maxSpeed > 0) ? top : Math.min(top, Math.floor(st.maxSpeed));
            if (range.value !== String(v)) range.value = String(v);
            this._maxLabel(v);
        }
        this._syncMenuStats();
        this._reqState();
    },
    _maxLabel(v) {
        const range = /** @type {HTMLInputElement} */ (this.el.max);
        const full = Number(v) >= Number(range.max);
        const t = full ? Lang.t('ke.max.off') : GameUi.fmt(v);
        if (this.el.maxv.textContent !== t) this.el.maxv.textContent = t;
    },
    _syncMenuStats() {
        const st = this.stats;
        const set = (k, v) => { const e = this.el[k]; if (e && e.textContent !== String(v)) e.textContent = String(v); };
        set('mspeed', GameUi.fmt(st.speed)); set('mwins', GameUi.fmt(st.wins)); set('mrb', GameUi.fmt(st.rebirths));
    },
    /** Табличка этапа: «Этап 3 · Зефирный обвал» и требуемая скорость. */
    setStage(n, total, nameText, reqSpeed) {
        this._stage = { n, total, name: nameText, req: reqSpeed };
        const nm = nameText ? GameUi.text(nameText) : '';
        const t = (total ? Lang.t('ke.stage.of', { n, total }) : Lang.t('ke.stage', { n })) + (nm ? ' · ' + nm : '');
        if (this.el.stage.textContent !== t) this.el.stage.textContent = t;
        this.el.req.style.display = reqSpeed > 0 ? '' : 'none';
        this.el.reqv.textContent = GameUi.fmt(reqSpeed);
        this._reqState();
    },
    _reqState() {
        const s = this._stage;
        if (s && s.req > 0) this.el.req.classList.toggle('bad', (this.stats.speed || 0) < s.req);
    },
    /** Баннер: 'safe' Safe Zone, 'warn' предупреждение («Нужно ⚡500»), 'stage' этап. */
    zoneBanner(text, kind) {
        const k = kind === 'warn' || kind === 'stage' ? kind : 'safe';
        const zb = GameUi.qa(this.el.zone, '.zb');
        for (const z of zb) z.classList.toggle('on', z.dataset.z === k);
        const span = this.el['z' + k];
        span.textContent = text || (k === 'safe' ? Lang.t('ke.zone.safe') : '');
        this._zoneOn = true;
        if (typeof HudLayout !== 'undefined') HudLayout.schedule();
        clearTimeout(this._zoneT);
        this._zoneT = setTimeout(() => { this._zoneOn = false; for (const z of zb) z.classList.remove('on'); if (typeof HudLayout !== 'undefined') HudLayout.schedule(); }, k === 'warn' ? 2600 : 3000);
        if (k === 'safe') GameUi.sfx('ui_win', 0.35);
    },
    toast(text, ms) {
        if (!this.el.toast) return;
        this.el.toast.textContent = text;
        this._toastOn = true;
        this.el.toastBox.classList.add('show');
        if (typeof HudLayout !== 'undefined') HudLayout.schedule();
        clearTimeout(this._toastT);
        this._toastT = setTimeout(() => {
            this.el.toastBox.classList.remove('show');
            setTimeout(() => { if (!this.el.toastBox.classList.contains('show')) { this._toastOn = false; if (typeof HudLayout !== 'undefined') HudLayout.schedule(); } }, 260);
        }, ms || 2200);
    },
    /** Строка чата: имя (цветом) и текст; имя '' — системное сообщение. Хранится 6 последних. */
    chat(name, text, color) {
        const box = this.el.chat;
        if (!box) return;
        const row = document.createElement('div');
        if (name) { const b = document.createElement('b'); b.style.color = color || '#ffd84a'; b.textContent = name + ':'; row.appendChild(b); }
        const t = document.createElement('span');
        t.textContent = text; if (!name) t.style.color = color || '#ffdfb3';
        row.appendChild(t);
        box.appendChild(row);
        while (box.children.length > 6) box.removeChild(/** @type {Node} */ (box.firstChild));
    },
    /** «+N» у героя: sx, sy — экранные px (центр ввода). */
    popPlus(text, sx, sy, color) {
        const box = this.el.fx;
        if (!box || !(this._mode === 'run')) return;
        while (box.children.length > 22) box.removeChild(/** @type {Node} */ (box.firstChild));
        const p = document.createElement('span');
        p.className = 'gk-plus';
        p.textContent = String(text);
        p.style.setProperty('--px', Math.round(sx) + 'px'); p.style.setProperty('--py', Math.round(sy) + 'px');
        if (color) p.style.color = color;
        p.addEventListener('animationend', () => p.remove());
        box.appendChild(p);
    },
    /** Подсказка у стойки: «[E] Trails» (null — убрать). */
    prompt(text) {
        const on = !!text;
        if (on && text !== this._promptText) {
            this._promptText = text;
            const m = /^\[(.+?)\]\s*(.*)$/.exec(String(text));
            this.el.prompt.innerHTML = m ? '<kbd>' + GameUi.esc(m[1]) + '</kbd>' + GameUi.esc(m[2]) : GameUi.esc(String(text));
        }
        if (!on) this._promptText = '';
        if (on === this._promptOn) { this.el.promptBox.classList.toggle('show', on); return; }
        this._promptOn = on;
        this.el.promptBox.classList.toggle('show', on);
        if (typeof HudLayout !== 'undefined') HudLayout.schedule();
    },
    /** Кнопка «Войдите в аккаунт» под рекордами (площадка с аккаунтами, игрок не вошёл). */
    setLogin(on) { this._canLogin = !!on; if (this.current === 'top') this.refresh(); },
    setLeaderboard(rows) {
        this._board = Array.isArray(rows) ? rows : [];
        if (this.current === 'top') this._render();
    },
    setSound(on) {
        this._sound = !!on;
        const ic = GameUi.ic(on ? 'sound' : 'sound-off');
        this.el.sound.innerHTML = ic; this.el.msound.innerHTML = ic;
        if (this.current === 'pause' || this.current === 'settings') this._render();
    },
    setLevelUp(level) {
        const b = this.el.level;
        this.el.lvlt.textContent = Lang.t('ke.levelup', { n: level });
        b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
        GameUi.sfx('ui_win', 0.5); GameUi.confetti(26);
        clearTimeout(this._lvT);
        this._lvT = setTimeout(() => b.classList.remove('on'), 2100);
    },

    // =============================================================================================== награда Wins-пада
    /** Окно награды: info { wins, stage, stageName, total }, cbs { onContinue, onDouble }. */
    result(info, cbs) {
        this._result = info || { wins: 0 }; this._resultCb = cbs || {};
        this.open('result');
        GameUi.confetti(40); GameUi.sfx('ui_win', 0.7);
    },
    /** После удачного x2: окно показывает «+2N». */
    resultDoubled(newWins) {
        if (this.current !== 'result' || !this._ctx) return;
        this._ctx.data.doubled = true; this._ctx.data.newWins = newWins;
        this._render(); GameUi.confetti(40); GameUi.sfx('ui_buy');
    },

    // =============================================================================================== Boost (x2 Speed за рекламу)
    setBoost(secondsLeft) { this._boost = Math.max(0, Math.ceil(Number(secondsLeft) || 0)); this._updateBoost(); },
    _boostVisible() { return this._mode === 'run' && !!this.cb.onBoost && (typeof Platform === 'undefined' || Platform.rewardedSupported() || this._boost > 0); },
    _updateBoost() {
        const b = this.el.boost;
        if (!b) return;
        const wait = typeof Platform !== 'undefined' ? Platform.rewardedCooldownLeft() : 0;
        const act = this._boost > 0;
        b.classList.toggle('act', act);
        b.classList.toggle('off', !act && (wait > 0 || this._boostBusy));
        this.el.boostl.textContent = Lang.t('ke.boost');
        this.el.boosts.textContent = act ? Lang.t('ke.boost.sec', { s: this._boost }) : (wait > 0 ? Platform.rewardedCooldownLabel() : '+60 ' + Lang.t('ke.boost.sec', { s: '' }).trim());
        this.el.boostBox.style.display = this._boostVisible() && this._mode === 'run' ? '' : 'none';
    },

    // =============================================================================================== служебное
    /** Раз в секунду: таймеры рекламы, бейджи, тики окон. */
    _tick() {
        if (!this.root) return;
        this._updateBoost();
        this.updateBadges();
        const ctx = this._ctx, def = this.defs[this.current];
        if (ctx && def && def.tick) { try { def.tick(ctx); } catch (e) { console.warn('GameHud tick:', e); } }
        if (ctx && def && def.wallet) ctx.wallet.innerHTML = GameUi.ic('wins') + '<span>' + GameUi.fmt(GameUi.wins()) + '</span>';
    },
    /** Красные точки: подарок можно забрать, бесплатное вращение готово. */
    updateBadges() {
        if (!this.root || typeof GameUiShop === 'undefined' || !GameUiShop.ready) return;
        const dot = (w, n) => {
            const b = this.root.querySelector('[data-w="' + w + '"]');
            if (!b) return;
            let d = b.querySelector('.gk-dot');
            if (n > 0 && !d) { d = document.createElement('span'); d.className = 'gk-dot'; b.appendChild(d); }
            else if (!(n > 0) && d) d.remove();
        };
        dot('daily', DailyGift.badge()); dot('wheel', Wheel.badge());
    },
    /** Логотип из клавиш-букв (две строки). */
    _logo() {
        const fill = (el, text) => { el.innerHTML = ''; for (const ch of String(text)) { const s = document.createElement('span'); if (ch === ' ') s.className = 'sp'; else s.textContent = ch; el.appendChild(s); } el.style.setProperty('--n', String(Math.max(1, String(text).length))); };
        fill(this.el.logo1, Lang.t('ke.logo1')); fill(this.el.logo2, Lang.t('ke.logo2'));
    },
    /** Язык сменили (Platform.setLanguage): перерисовать статические тексты. */
    relang() {
        if (!this.root) return;
        Lang.apply(document.body);
        this._logo();
        this.stats = Object.assign({}, this.stats); for (const k of Object.keys(this.el)) if (this.el[k].dataset && this.el[k].dataset.v) delete this.el[k].dataset.v;
        this.setStats({});
        if (this._stage) this.setStage(this._stage.n, this._stage.total, this._stage.name, this._stage.req);
        this._updateBoost();
        if (this.current) this._render();
    },
    /** Для Tutorial.init({ ...GameHud.tutorialOpts() }): оформление карточки обучения. */
    tutorialOpts() { return { css: GAME_TUT_CSS }; },
};
