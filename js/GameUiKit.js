// GameUiKit.js — общий набор интерфейса игры: иконки (литералы путей), текст/числа, аватар-SVG, звуки кликов, конфетти,
// окно-награда. Стили — GAME_UI_CSS (js/GameUiCss.js). Дальше в порядке подключения: GameUiWindows.js (Trails/Auras/Rebirth/
// Teleport/Treadmills/Top/Pause/Settings), GameUiShop.js (Shop/Daily/Wheel + синхронизация Wins), GameHud.js (HUD, меню, окна).

// ---- Иконки. Происхождение — assets/ui/UI-SOURCES.md. Пути только литералами (сканер сборки). ----
const GAME_UI_ICONS = {
    speed: 'assets/ui/icons/speed.webp', wins: 'assets/ui/icons/wins.webp', gift: 'assets/ui/icons/gift.webp', pause: 'assets/ui/icons/pause.webp',
    sound: 'assets/ui/icons/sound.webp', 'sound-off': 'assets/ui/icons/sound-off.webp', close: 'assets/ui/icons/close.webp', candy: 'assets/ui/icons/candy.webp',
    heart: 'assets/ui/icons/heart.webp', skin: 'assets/ui/icons/skin.webp', pet: 'assets/ui/icons/pet.webp', portal: 'assets/ui/icons/portal.webp',
    jump: 'assets/ui/icons/jump.webp', wheel: 'assets/ui/icons/wheel.webp', shop: 'assets/ui/icons/shop.webp', lock: 'assets/ui/icons/lock.webp',
    ad: 'assets/ui/icons/ad.webp', chest: 'assets/ui/icons/chest.webp', hat: 'assets/ui/icons/hat.webp', glow: 'assets/ui/icons/glow.webp',
    help: 'assets/ui/icons/help.webp', timer: 'assets/ui/icons/timer.webp', settings: 'assets/ui/icons/settings.webp', star: 'assets/ui/icons/star.webp',
    top: 'assets/ui/icons/top.webp', hand: 'assets/ui/icons/hand.webp', rebirth: 'assets/ui/icons/rebirth.webp', rainbow: 'assets/ui/icons/rainbow.webp',
    shield: 'assets/ui/icons/shield.webp', check: 'assets/ui/icons/check.webp', play: 'assets/ui/icons/play.webp',
    trails: 'assets/ui/trails/rainbow.webp', auras: 'assets/ui/auras/star.webp',
};
const GAME_UI_TRAILS = {
    candy: 'assets/ui/trails/candy.webp', rainbow: 'assets/ui/trails/rainbow.webp', hearts: 'assets/ui/trails/hearts.webp', stars: 'assets/ui/trails/stars.webp',
    bubbles: 'assets/ui/trails/bubbles.webp', confetti: 'assets/ui/trails/confetti.webp', magic: 'assets/ui/trails/magic.webp', lightning: 'assets/ui/trails/lightning.webp',
    fire: 'assets/ui/trails/fire.webp', ice: 'assets/ui/trails/ice.webp', neon: 'assets/ui/trails/neon.webp', galaxy: 'assets/ui/trails/galaxy.webp',
    notes: 'assets/ui/trails/notes.webp', sparks: 'assets/ui/trails/sparks.webp', coins: 'assets/ui/trails/coins.webp', flowers: 'assets/ui/trails/flowers.webp',
};
const GAME_UI_AURAS = {
    basic: 'assets/ui/auras/basic.webp', pink: 'assets/ui/auras/pink.webp', green: 'assets/ui/auras/green.webp', candy: 'assets/ui/auras/candy.webp',
    heart: 'assets/ui/auras/heart.webp', star: 'assets/ui/auras/star.webp', bubbles: 'assets/ui/auras/bubbles.webp', rainbow: 'assets/ui/auras/rainbow.webp',
    crown: 'assets/ui/auras/crown.webp', frost: 'assets/ui/auras/frost.webp', flame: 'assets/ui/auras/flame.webp', galaxy: 'assets/ui/auras/galaxy.webp',
    electric: 'assets/ui/auras/electric.webp', gold: 'assets/ui/auras/gold.webp', angel: 'assets/ui/auras/angel.webp', petals: 'assets/ui/auras/petals.webp',
};
/** Иконки эффектов glow.fx (карточки вкладки «Свечение»). */
const GAME_UI_FX = {
    hearts: 'assets/ui/fx/hearts.webp', stars: 'assets/ui/fx/stars.webp', rainbow: 'assets/ui/fx/rainbow.webp', bubbles: 'assets/ui/fx/bubbles.webp',
    fire: 'assets/ui/fx/flames.webp', sparkle: 'assets/ui/fx/magic.webp', confetti: 'assets/ui/fx/confetti.webp', candy: 'assets/ui/fx/candy.webp',
};
/** Слова в id трейла/ауры -> иконка (если у записи нет поля icon). */
const GAME_UI_TRAIL_HINTS = [
    ['candy|sugar|lolli|gummy|jelly', 'candy'], ['rainbow', 'rainbow'], ['heart|love|strawb', 'hearts'], ['star', 'stars'], ['bubble|cloud|marsh|cotton|foam', 'bubbles'],
    ['confetti|sprinkle|party', 'confetti'], ['magic|unicorn|violet|wiz', 'magic'], ['lightning|electric|zap|thunder|volt', 'lightning'], ['fire|flame|lava|caramel|hot|burn', 'fire'],
    ['ice|frost|snow|mint|cool', 'ice'], ['neon|glow', 'neon'], ['galaxy|cosmic|space|moon', 'galaxy'], ['note|music|melod', 'notes'], ['spark', 'sparks'],
    ['gold|coin|money|honey|butter', 'coins'], ['flower|petal|blossom|rose', 'flowers'],
];
const GAME_UI_AURA_HINTS = [
    ['basic|default|white|plain', 'basic'], ['pink|rose|strawb', 'pink'], ['green|lime|mint', 'green'], ['candy|sugar|lolli|gummy', 'candy'], ['heart|love', 'heart'], ['star', 'star'],
    ['bubble|cloud|marsh|cotton', 'bubbles'], ['rainbow', 'rainbow'], ['crown|king|royal|choco', 'crown'], ['frost|ice|snow', 'frost'], ['flame|fire|lava|caramel|hot', 'flame'],
    ['galaxy|cosmic|space', 'galaxy'], ['electric|lightning|zap|volt', 'electric'], ['gold', 'gold'], ['angel|halo|holy', 'angel'], ['petal|flower|blossom', 'petals'],
];

/** @satisfies {Record<string, any>} */
const GameUi = {
    /** Превью скина: рендер героя из Blender (ui/shop/skins/<id>.webp в assets); нет файла — html-аватар по look. */
    skinPic(it, big) {
        const url = typeof SKIN_PICS !== 'undefined' && it ? SKIN_PICS[it.id] : '';
        if (!url) return GameUi.avatar(it && it.look);
        const fb = GameUi.avatar(it && it.look).replace(/"/g, '&quot;');
        return '<img class="gk-skinpic' + (big ? ' big' : '') + '" draggable="false" alt="" src="' + url + '" onerror="this.outerHTML=this.dataset.fb" data-fb="' + fb + '">';
    },
    _installed: false,
    _sfx: false,

    /** Строка из { ru, en } / ключа Lang / строки. */
    text(v, fb) {
        if (v == null) return fb || '';
        if (typeof v === 'object') return String(v[Lang.code] || v.en || v.ru || fb || '');
        const s = String(v);
        return Lang.has(s) ? Lang.t(s) : s;
    },
    t(key, params) { return Lang.t(key, params); },
    /** Элемент: класс и содержимое (HTML-строка). */
    el(tag, cls, html) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html != null) e.innerHTML = html;
        return e;
    },
    /** querySelector с типом HTMLElement (tsc). */
    q(root, sel) { return /** @type {HTMLElement} */ (root.querySelector(sel)); },
    qa(root, sel) { return /** @type {HTMLElement[]} */ (Array.from(root.querySelectorAll(sel))); },
    esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); },
    src(name) { return GAME_UI_ICONS[name] || ''; },
    /** <img> иконки интерфейса (HTML-строка). */
    ic(name, cls) { return '<img class="gk-ic' + (cls ? ' ' + cls : '') + '" src="' + (GAME_UI_ICONS[name] || '') + '" alt="" draggable="false">'; },
    /** 12345 -> «12 345»; от 1e6 — «1.2M». */
    fmt(n) {
        n = Math.floor(Number(n) || 0);
        if (n >= 1e12) return +(n / 1e12).toFixed(2) + 'T';
        if (n >= 1e9) return +(n / 1e9).toFixed(2) + 'B';
        if (n >= 1e6) return +(n / 1e6).toFixed(2) + 'M';
        return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    },
    /** 12.5 -> «x12.5». */
    mult(x) {
        x = Number(x) || 0;
        return 'x' + (x >= 100 ? GameUi.fmt(x) : +x.toFixed(x < 10 ? 2 : 1));
    },
    /** @returns {any} GameProgress, если файл уже подключён основной сессией. */
    progress() {
        // @ts-ignore — js/GameProgress.js пишет основная сессия
        return typeof GameProgress !== 'undefined' ? GameProgress : null;
    },
    wins() {
        const p = GameUi.progress();
        return p && p.state ? Math.floor(p.state.wins || 0) : (typeof Shop !== 'undefined' ? Shop.coins : 0);
    },
    rarityOf(r) { return Shop.RARITIES.indexOf(r) >= 0 ? r : 'common'; },
    rarityLabel(r) { return r ? Shop.rarityLabel(r) : ''; },

    // ---------------------------------------------------------------- иконки трейлов и аур
    /** Путь иконки трейла/ауры: поле icon записи (ключ), слово в id, иначе по номеру. */
    pickIcon(kind, it, index) {
        const map = kind === 'trail' ? GAME_UI_TRAILS : GAME_UI_AURAS, hints = kind === 'trail' ? GAME_UI_TRAIL_HINTS : GAME_UI_AURA_HINTS;
        if (it && it.icon && map[it.icon]) return map[it.icon];
        const id = String((it && (it.id || (it.name && (it.name.en || it.name.ru)))) || '').toLowerCase();
        for (const h of hints) if (new RegExp(h[0]).test(id)) return map[h[1]];
        const keys = Object.keys(map);
        return map[keys[(index || 0) % keys.length]];
    },

    // ---------------------------------------------------------------- аватар
    _hex(n) { return '#' + ((Number(n) >>> 0) & 0xffffff).toString(16).padStart(6, '0'); },
    _shade(n, k) {
        const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        const f = (c) => Math.max(0, Math.min(255, Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k))));
        return (f(r) << 16) | (f(g) << 8) | f(b);
    },
    /** Блочный человечек-превью (SVG-строка) по look из предмета-скина. opts.emote — класс анимации (em-*). */
    avatar(look, opts) {
        const L = Object.assign({ skin: 0xffd9bf, shirt: 0xff5fa8, pants: 0x5b3a29, hair: 'short', hairColor: 0x4a2c1a, cap: -1 }, look || {});
        const h = GameUi._hex, s = GameUi._shade;
        const ink = '#2a130a';
        let back = '', front = '';
        if (L.hair === 'long') back = '<rect x="27" y="6" width="46" height="44" rx="9" fill="' + h(L.hairColor) + '"/>';
        if (L.hair === 'short' || L.hair === 'long') front = '<path d="M31 18 Q31 4 50 4 Q69 4 69 18 L69 14 Q50 8 31 14 Z" fill="' + h(L.hairColor) + '"/><rect x="31" y="4" width="38" height="11" rx="7" fill="' + h(L.hairColor) + '"/>';
        else if (L.hair === 'spiky') front = '<polygon points="31,16 31,6 38,12 43,0 50,11 57,-1 62,11 69,5 69,16" fill="' + h(L.hairColor) + '"/><rect x="31" y="6" width="38" height="9" rx="4" fill="' + h(L.hairColor) + '"/>';
        let cap = '';
        if (L.cap >= 0) cap = '<rect x="30" y="1" width="40" height="15" rx="8" fill="' + h(L.cap) + '"/><rect x="42" y="12" width="36" height="5" rx="2.5" fill="' + h(s(L.cap, -0.25)) + '"/><circle cx="50" cy="1.5" r="3" fill="' + h(s(L.cap, 0.3)) + '"/>';
        const arm = (cls, x) => '<g class="' + cls + '"><rect x="' + x + '" y="44" width="14" height="38" rx="5" fill="' + h(L.skin) + '"/><rect x="' + x + '" y="44" width="14" height="15" rx="5" fill="' + h(L.shirt) + '"/></g>';
        const leg = (cls, x) => '<g class="' + cls + '"><rect x="' + x + '" y="88" width="18" height="40" rx="4" fill="' + h(L.pants) + '"/><rect x="' + (x - 1) + '" y="121" width="20" height="9" rx="4" fill="' + h(s(L.pants, -0.45)) + '"/></g>';
        const svg =
            '<svg class="gk-av' + (opts && opts.emote ? ' emo-' + opts.emote : '') + '" viewBox="-6 -6 112 146" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="av-all">' +
            leg('av-legL', 31) + leg('av-legR', 51) +
            '<rect x="29" y="42" width="42" height="48" rx="6" fill="' + h(L.shirt) + '"/><rect x="29" y="42" width="42" height="10" rx="5" fill="' + h(s(L.shirt, 0.22)) + '"/>' +
            '<circle cx="50" cy="68" r="7" fill="rgba(255,255,255,.6)"/><circle cx="50" cy="68" r="3" fill="' + h(s(L.shirt, -0.2)) + '"/>' +
            '<rect x="29" y="82" width="42" height="9" fill="' + h(L.pants) + '"/>' +
            arm('av-armL', 14) + arm('av-armR', 72) + back +
            '<rect x="32" y="4" width="36" height="36" rx="9" fill="' + h(L.skin) + '"/>' + front + cap +
            '<rect x="41" y="20" width="4.5" height="8" rx="2.2" fill="' + ink + '"/><rect x="54.5" y="20" width="4.5" height="8" rx="2.2" fill="' + ink + '"/>' +
            '<circle cx="38.5" cy="31" r="3" fill="#ff8fa8" opacity=".55"/><circle cx="61.5" cy="31" r="3" fill="#ff8fa8" opacity=".55"/>' +
            '<path d="M44 31.5 Q50 37 56 31.5" stroke="' + ink + '" stroke-width="2.3" fill="none" stroke-linecap="round"/></g></svg>';
        return svg;
    },
    /** Первый скин из SHOP_ITEMS (по умолчанию) — look для превью эмоций и шапок. */
    defaultLook() {
        const it = typeof Shop !== 'undefined' ? Shop.item(Shop.equippedId('skin') || '') : null;
        return it && it.look ? it.look : undefined;
    },

    // ---------------------------------------------------------------- звуки интерфейса (синтез, файлов нет)
    sfxInit() {
        if (GameUi._sfx) return;
        try {
            const make = (name, dur, fn) => {
                const n = Math.floor(44100 * dur), a = new Float32Array(n);
                for (let i = 0; i < n; i++) a[i] = fn(i / 44100, i / n);
                const b = Sound.makeBuffer(a, 44100);
                if (b) Sound.putBuffer(name, b);
            };
            const tone = (f, t) => Math.sin(2 * Math.PI * f * t);
            // клик «клавиши»: сухой щелчок + короткий тон — ASMR
            make('ui_click', 0.075, (t, k) => ((Math.random() * 2 - 1) * Math.exp(-t * 170) * 0.55 + tone(310 - 520 * t, t) * Math.exp(-t * 62) * 0.6) * (1 - k * 0.2));
            make('ui_open', 0.16, (t, k) => (tone(420 + 520 * k, t) * 0.35 + (Math.random() * 2 - 1) * Math.exp(-t * 60) * 0.12) * (1 - k));
            make('ui_buy', 0.34, (t, k) => (k < 0.4 ? tone(740, t) : tone(1110, t)) * (1 - k) * 0.42);
            make('ui_deny', 0.2, (t, k) => tone(190 - 40 * k, t) * (1 - k) * 0.5);
            make('ui_tick', 0.03, (t, k) => (Math.random() * 2 - 1) * Math.exp(-t * 250) * 0.5 + tone(900, t) * Math.exp(-t * 200) * 0.3);
            make('ui_win', 0.8, (t, k) => tone([523, 659, 784, 1046, 1318][Math.min(4, Math.floor(k * 5))], t) * (1 - k * 0.55) * 0.4);
            GameUi._sfx = true;
        } catch (e) { console.warn('GameUi.sfxInit:', e); }
    },
    sfx(name, volume) {
        try { Sound.play('synth:' + name, { volume: volume == null ? 0.55 : volume }); } catch (e) { /* без звука интерфейс работает */ }
    },

    // ---------------------------------------------------------------- стили
    install() {
        if (GameUi._installed || typeof document === 'undefined') return;
        GameUi._installed = true;
        const st = document.createElement('style');
        st.id = 'gk-css';
        st.textContent = GAME_UI_CSS;
        document.head.appendChild(st);
    },

    // ---------------------------------------------------------------- конфетти и окно-награда
    confetti(n) {
        if (typeof document === 'undefined') return;
        const box = GameUi.el('div', 'gk-confetti gk-ui');
        const colors = ['#ff5fa8', '#43e0b6', '#ffd84a', '#6f86ff', '#ff9f1c', '#fff3df'];
        const count = Math.min(60, n || 36);
        for (let i = 0; i < count; i++) {
            const p = document.createElement('i');
            p.style.left = (Math.random() * 100).toFixed(1) + '%';
            p.style.background = colors[i % colors.length];
            p.style.setProperty('--dx', ((Math.random() - 0.5) * 120).toFixed(0) + 'px');
            p.style.setProperty('--r', ((Math.random() - 0.5) * 900).toFixed(0) + 'deg');
            p.style.animationDelay = (Math.random() * 0.5).toFixed(2) + 's';
            p.style.animationDuration = (1.4 + Math.random() * 0.9).toFixed(2) + 's';
            box.appendChild(p);
        }
        document.body.appendChild(box);
        setTimeout(() => box.remove(), 3200);
    },
    /** Окно-награда посреди экрана. info: { title, big (HTML), pic (HTML), sub, ok }. Закрывается кнопкой или тапом. */
    reward(info, done) {
        let root = document.getElementById('gk-reward');
        if (!root) { root = GameUi.el('div', 'gk-ui'); root.id = 'gk-reward'; document.body.appendChild(root); }
        const close = () => { root.classList.remove('on'); root.innerHTML = ''; if (done) done(); };
        root.innerHTML = '<div class="gk-rw gk-wafer"><div class="rays"></div><h3 class="gk-o">' + GameUi.esc(info.title || '') + '</h3>' +
            (info.pic ? '<div class="pic">' + info.pic + '</div>' : '') + (info.big ? '<div class="big gk-o">' + info.big + '</div>' : '') +
            (info.sub ? '<div class="sub gk-os">' + GameUi.esc(info.sub) + '</div>' : '') +
            '<button type="button" class="gk-key k-mint big" data-k="ok">' + GameUi.esc(info.ok || Lang.t('ke.ok')) + '</button></div>';
        root.classList.add('on');
        const ok = /** @type {HTMLElement} */ (root.querySelector('[data-k="ok"]'));
        ok.addEventListener('click', (e) => { e.stopPropagation(); GameUi.sfx('ui_click'); close(); });
        GameUi.sfx('ui_win', 0.6);
        GameUi.confetti(40);
        return close;
    },
};
