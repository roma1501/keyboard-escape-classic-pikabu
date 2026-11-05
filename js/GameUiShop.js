// GameUiShop.js — магазин косметики, подарок дня и колесо фортуны: подключение модулей движка (Shop / DailyGift / Wheel),
// синхронизация валюты (Shop.coins = Wins игрока) и окна в стиле игры.
//
// ПОДКЛЮЧЕНИЕ в Game.init (после GameProgress: Wins уже загружены; save — единый объект сохранения игры):
//   const save = (await Platform.load()) || {};
//   GameUiShop.init(save, () => this.persist());      // Shop.init → DailyGift.init → Wheel.init, save.shop / save.daily / save.wheel
//   GameUiShop.onLook((look) => this.applyLook(look)); // look = { skin: {skin,shirt,pants,hair,hairColor,cap} | null, hat: item | null,
//                                                      //   pet: item | null, glow: { color, fx } | null, emote: 'wave' | null }
//   this.applyLook(GameUiShop.look());                 // применить надетое сразу (и каждый раз, когда сработал onLook)
//   GameHud.init({...});                               // GameHud сам открывает окна shop / daily / wheel
//   Tutorial.whenIdle(() => GameUiShop.offerDaily());  // автопоказ подарка дня (после обучения), один раз в день
// Валюта: GameUiShop.init по умолчанию читает и меняет GameProgress (state.wins / addWins / spendWins); свои функции —
//   GameUiShop.init(save, persist, { getWins: () => n, addWins: (n) => …, spendWins: (n) => … }).
// Покупка в Shop списывает Wins в GameProgress, награды подарка и колеса добавляют Wins в GameProgress; когда Wins меняются
// иначе (шаг, Wins-пад), приёмник узнаёт об этом через GameProgress.on('change') — ничего вызывать не нужно.
// Событие Shop 'preview' (примерка в магазине) тоже приходит в onLook — игра показывает примерку на герое.
// Эмоцию на Wins-паде и финише играет игра: GameUiShop.look().emote — ключ анимации (список ключей — шапка js/GameShopData.js).

/** @satisfies {Record<string, any>} */
const GameUiShop = {
    ready: false,
    /** @type {any} */ econ: null,
    /** @type {Array<(look: any) => void>} */ _looks: [],
    _lock: false,

    init(save, persist, econ) {
        const s = save || {};
        const P = GameUi.progress();
        this.econ = econ || (P ? { getWins: () => P.state.wins, addWins: (n) => P.addWins(n), spendWins: (n) => P.spendWins(n) } : null);
        Shop.init({ tabs: SHOP_TABS, items: SHOP_ITEMS, state: s.shop, persist });
        s.shop = Shop.state;
        this.syncIn();
        DailyGift.init({ rewards: DAILY_REWARDS, rewardsSink: Shop, state: s.daily, persist });
        s.daily = DailyGift.state;
        Wheel.init({ sectors: WHEEL_SECTORS, rewardsSink: Shop, state: s.wheel, persist });
        s.wheel = Wheel.state;
        Shop.on((e) => {
            if (e.type === 'coins') {
                if (this._lock || !this.econ) return;
                this._lock = true;
                try {
                    if (e.delta > 0) this.econ.addWins(e.delta); else if (e.delta < 0) this.econ.spendWins(-e.delta);
                } finally { this._lock = false; }
                this.syncIn();
            } else if (e.type === 'equip' || e.type === 'unequip' || e.type === 'preview') {
                const l = this.look();
                for (const fn of this._looks.slice()) { try { fn(l); } catch (err) { console.warn('GameUiShop.onLook:', err); } }
            }
        });
        if (P && typeof P.on === 'function') P.on(() => this.syncIn());
        this.ready = true;
        return this;
    },

    /** Wins игрока -> Shop.coins (без событий). */
    syncIn() {
        if (!this.econ || this._lock) return;
        const w = Math.max(0, Math.floor(Number(this.econ.getWins()) || 0));
        if (Shop.state.coins !== w) Shop.state.coins = w;
    },

    /** Подписка на смену внешнего вида (надеть / снять / примерка). Возвращает отписку. */
    onLook(fn) {
        this._looks.push(fn);
        return () => { const i = this._looks.indexOf(fn); if (i >= 0) this._looks.splice(i, 1); };
    },

    /** Что показывать на герое: записи предметов по слотам (с примеркой). */
    look() {
        const ids = Shop.look();
        const it = (id) => (id ? Shop.item(id) || null : null);
        const skin = it(ids.skin), glow = it(ids.glow), emote = it(ids.emote);
        return { skin: skin && skin.look ? skin.look : null, hat: it(ids.hat), pet: it(ids.pet), glow: glow && glow.glow ? glow.glow : null, emote: emote && emote.emote ? emote.emote : null };
    },

    /** Автопоказ подарка дня: true, если окно открыто (Tutorial.active и «уже предлагали сегодня» учитывает DailyGift). */
    offerDaily() {
        if (!this.ready || !DailyGift.shouldOffer()) return false;
        GameHud.open('daily');
        DailyGift.markOffered();
        return true;
    },

    // =================================================================== общие куски окон
    _imgCache: /** @type {Record<string, HTMLImageElement>} */ ({}),
    img(src, done) {
        let im = this._imgCache[src];
        if (!im) { im = this._imgCache[src] = new Image(); im.src = src; }
        if (done) { if (im.complete) done(im); else im.addEventListener('load', () => done(im)); }
        return im;
    },

    /** Картинка предмета (HTML внутри .pic). */
    pic(it, opts) {
        const o = opts || {};
        if (it.tab === 'skins') return GameUi.skinPic(it);
        if (it.tab === 'hats' || it.tab === 'pets') {
            const ph = it.tab === 'hats' ? '🎩' : '🐾';
            return '<img class="pimg" data-fb="' + ph + '" src="' + it.icon + '" alt="" draggable="false">';
        }
        if (it.tab === 'glow') {
            const g = it.glow || {};
            const fx = GAME_UI_FX[g.fx];
            return '<div class="gk-gl" style="--gc:' + GameUi._hex(g.color) + '">' + (fx ? '<img src="' + fx + '" alt="" draggable="false">' : '') + '</div>';
        }
        if (it.tab === 'emotes') return GameUi.avatar(GameUi.defaultLook(), { emote: o.animate ? it.emote : '' });
        return '';
    },
    /** Заглушка для иконок, которых нет (шапки и питомцы рендерит Blender-агент): сначала .png рядом, потом эмодзи. */
    fixImgs(root) {
        for (const img of /** @type {HTMLImageElement[]} */ (/** @type {any} */ (GameUi.qa(root, 'img[data-fb]')))) {
            if (img.dataset.fbBound) continue;
            img.dataset.fbBound = '1';
            img.addEventListener('error', () => {
                if (!img.dataset.tried && /\.webp$/.test(img.src)) { img.dataset.tried = '1'; img.src = img.src.replace(/\.webp$/, '.png'); return; }
                const ph = GameUi.el('div', 'ph', img.dataset.fb || '?');
                if (img.parentNode) img.parentNode.replaceChild(ph, img);
            });
        }
    },
};

/** Текстовое описание того, что выдали (для окна-награды): { pic, big, sub }. */
function gameUiGotView(got) {
    let big = '', pic = '', sub = '';
    for (const g of got || []) {
        if (g.type === 'coins') big += (big ? ' ' : '') + '+' + GameUi.fmt(g.amount) + GameUi.ic('wins');
        else if (g.id) {
            const it = Shop.item(g.id);
            if (it && !pic) pic = GameUiShop.pic(it);
            sub += (sub ? ' · ' : '') + Shop.name(g.id) + (g.type === 'exclusive' ? ' (' + Lang.t('ke.daily.exclusive') + ')' : '');
        }
    }
    if (!pic && big) pic = GameUi.ic('wins');
    return { pic, big, sub };
}

const GAME_UI_SHOP_WINDOWS = {
    // ============================================================ Shop
    shop: {
        title: 'ke.w.shop', icon: 'shop', cls: 'wide', wallet: true, tabs: true, noscroll: true,
        build(ctx) {
            const d = ctx.data;
            d.tab = d.tab || SHOP_TABS[0].id; d.sel = ''; d.cards = {};
            ctx.tabs.innerHTML = '';
            for (const t of SHOP_TABS) {
                const b = GameUi.el('button', 'gk-key k-choc', GameUi.ic(t.icon) + '<span></span>');
                b.type = 'button'; b.dataset.tab = t.id;
                b.addEventListener('click', (e) => { e.stopPropagation(); GameUi.sfx('ui_click'); d.tab = t.id; d.sel = ''; Shop.clearPreview(); ctx.refresh(); });
                ctx.tabs.appendChild(b);
            }
            ctx.body.innerHTML = '<div class="gk-shop"><div class="gk-pv"><div class="gk-stage"><div class="keyplate"></div><div class="figure"></div><div class="fxlayer"></div></div>' +
                '<div class="pv-info"><div class="nm gk-o" data-k="nm"></div><div class="rr" data-k="rr"></div><div class="hint gk-os" data-k="hint"></div></div></div>' +
                '<div class="list"><div class="gk-grid"></div></div></div>';
            d.off = Shop.on((e) => { if (e.type === 'preview') GAME_UI_SHOP_WINDOWS.shop._preview(ctx); });
        },
        onClose(ctx) { if (ctx.data.off) ctx.data.off(); Shop.clearPreview(); },
        render(ctx) {
            const d = ctx.data;
            GameUiShop.syncIn();
            if (!d.sel || !Shop.item(d.sel) || Shop.item(d.sel).tab !== d.tab) { const first = Shop.items(d.tab)[0]; d.sel = (first && Shop.equippedId(Shop.slotOf(first))) || ''; }
            for (const b of GameUi.qa(ctx.tabs, 'button')) {
                const t = SHOP_TABS.find((x) => x.id === b.dataset.tab);
                GameUi.q(b, 'span').textContent = GameUi.text(t.name);
                const on = b.dataset.tab === d.tab;
                b.classList.toggle('k-pink', on); b.classList.toggle('k-choc', !on); b.classList.toggle('on', on);
            }
            const grid = GameUi.q(ctx.body, '.gk-grid'), list = GameUi.q(ctx.body, '.list'), keep = d.keepScroll != null ? d.keepScroll : 0;
            const sameTab = d.builtTab === d.tab;
            if (!sameTab) { grid.innerHTML = ''; d.cards = {}; d.builtTab = d.tab; }
            for (const c of Shop.cards(d.tab)) {
                let rec = d.cards[c.id];
                if (!rec) {
                    rec = d.cards[c.id] = GAME_UI_SHOP_WINDOWS.shop._card(ctx, c);
                    grid.appendChild(rec.el);
                    GameUiShop.fixImgs(rec.el);
                }
                GAME_UI_SHOP_WINDOWS.shop._cardState(rec, c);
            }
            if (!sameTab) list.scrollTop = keep;
            GAME_UI_SHOP_WINDOWS.shop._preview(ctx);
        },
        tick(ctx) {
            for (const id of Object.keys(ctx.data.cards || {})) {
                const c = Shop.card(id);
                if (c && c.kind === 'ads' && !c.owned) GAME_UI_SHOP_WINDOWS.shop._cardState(ctx.data.cards[id], c);
            }
        },
        _card(ctx, c) {
            const d = ctx.data, it = c.item;
            const el = GameUi.el('div', 'gk-card');
            el.dataset.r = GameUi.rarityOf(it.rarity);
            el.dataset.id = c.id;
            el.innerHTML = '<span class="badge" style="display:none"></span><div class="pic">' + GameUiShop.pic(it) + '</div>' +
                '<div class="nm">' + GameUi.esc(c.name) + '</div><div class="rr">' + GameUi.esc(c.rarityLabel) + '</div><div class="pr"></div><button type="button" class="gk-key sm"></button>';
            if (it.fx && it.fx !== 'none' && it.rarity !== 'common' && GAME_UI_FX[it.fx]) {
                const fx = GameUi.el('img', 'fxdot'); fx.setAttribute('src', GAME_UI_FX[it.fx]); fx.setAttribute('alt', '');
                GameUi.q(el, '.pic').appendChild(fx);
            }
            const rec = { el, btn: GameUi.q(el, 'button'), pr: GameUi.q(el, '.pr'), badge: GameUi.q(el, '.badge'), action: 'none', busy: false };
            el.addEventListener('click', () => { d.sel = c.id; Shop.preview(c.id); for (const o of GameUi.qa(ctx.body, '.gk-card.sel')) o.classList.remove('sel'); el.classList.add('sel'); GameUi.sfx('ui_tick', 0.5); });
            if (it.tab === 'emotes') {
                const pic = GameUi.q(el, '.pic');
                el.addEventListener('mouseenter', () => { pic.innerHTML = GameUiShop.pic(it, { animate: true }); });
                el.addEventListener('mouseleave', () => { pic.innerHTML = GameUiShop.pic(it); });
            }
            rec.btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (rec.busy) return;
                const cur = Shop.card(c.id);
                if (!cur || cur.action === 'none') return;
                if (!cur.enabled && cur.action !== 'buy') { GameUi.sfx('ui_deny'); if (cur.hint) ctx.hud.toast(cur.hint, 1600); return; }
                if (!cur.enabled && cur.action === 'buy') { GameUi.sfx('ui_deny'); ctx.hud.toast(cur.hint || Lang.t('ke.err.wins'), 1600); return; }
                rec.busy = true; GAME_UI_SHOP_WINDOWS.shop._cardState(rec, cur);
                let r;
                try { r = await Shop.act(c.id); } catch (err) { console.warn('Shop.act:', err); r = { ok: false }; }
                rec.busy = false;
                if (r && r.ok) {
                    GameUi.sfx(cur.action === 'equip' || cur.action === 'unequip' ? 'ui_click' : 'ui_buy');
                    if (r.unlocked || cur.action === 'buy') { ctx.hud.toast(Lang.t('ke.shop.unlocked') + ' ' + c.name, 1800); GameUi.confetti(24); }
                    d.sel = c.id;
                } else if (r && r.reason && r.reason !== 'cooldown' && r.reason !== 'busy') {
                    GameUi.sfx('ui_deny');
                    ctx.hud.toast(r.reason === 'noCoins' ? Lang.t('ke.err.wins') : (r.reason === 'adUnavailable' || r.reason === 'adFailed') ? Lang.t('ke.err.ads') : Lang.t('ke.err.generic'), 1600);
                }
                ctx.refresh();
            });
            return rec;
        },
        _cardState(rec, c) {
            const el = rec.el;
            el.classList.toggle('locked', !c.owned);
            rec.badge.style.display = c.equipped ? '' : 'none';
            if (c.equipped) rec.badge.textContent = Lang.t('ke.equipped');
            let pr = '';
            if (c.owned) pr = '<span>&nbsp;</span>';
            else if (c.kind === 'coins') pr = GameUi.ic('wins') + '<span>' + GameUi.fmt(c.price) + '</span>';
            else if (c.kind === 'ads') pr = GameUi.ic('ad') + '<span>' + c.progress + '/' + c.need + '</span>';
            else if (c.kind === 'exclusive') pr = GameUi.ic('gift') + '<span>' + Lang.t('ke.daily.exclusive') + '</span>';
            rec.pr.className = 'pr' + (c.owned ? ' mut' : c.kind === 'coins' && !c.affordable ? ' bad' : '');
            if (rec.pr.dataset.h !== pr) { rec.pr.innerHTML = pr; rec.pr.dataset.h = pr; }
            const b = rec.btn;
            b.className = 'gk-key sm';
            b.style.display = c.action === 'none' && !c.equipped ? 'none' : '';
            let label = c.actionLabel;
            if (c.action === 'equip') b.classList.add('k-mint');
            else if (c.action === 'unequip') b.classList.add('k-cream');
            else if (c.action === 'buy') { b.classList.add('k-lemon'); if (!c.enabled) b.classList.add('nope'); }
            else if (c.action === 'watch') { b.classList.add('k-pink'); if (!c.enabled) b.classList.add('nope'); if (c.enabled) label = Lang.t('shop.watch'); }
            else { b.classList.add('k-cream', 'off'); label = c.equipped ? Lang.t('ke.equipped') : ''; }
            if (rec.busy || c.busy) b.classList.add('off');
            const html = (c.action === 'watch' ? GameUi.ic('ad') : '') + '<span>' + GameUi.esc(label) + '</span>';
            if (b.dataset.h !== html) { b.innerHTML = html; b.dataset.h = html; }
        },
        /** Превью слева: герой в надетом / примеряемом. */
        _preview(ctx) {
            const root = ctx.body;
            if (!GameUi.q(root, '.gk-pv')) return;
            const ids = Shop.look();
            const skin = ids.skin ? Shop.item(ids.skin) : null, hat = ids.hat ? Shop.item(ids.hat) : null, pet = ids.pet ? Shop.item(ids.pet) : null;
            const glow = ids.glow ? Shop.item(ids.glow) : null, emote = ids.emote ? Shop.item(ids.emote) : null;
            const fig = GameUi.q(root, '.figure');
            const key = [ids.skin, ids.hat, ids.pet, ids.emote].join('|');
            if (fig.dataset.k !== key) {
                fig.dataset.k = key;
                fig.innerHTML = (skin ? GameUi.skinPic(skin, true) : GameUi.skinPic({ id: 'skin_default', look: GameUi.defaultLook() }, true)) +
                    (hat && hat.icon ? '<img class="hat" data-fb="" src="' + hat.icon + '" alt="">' : '') + (pet && pet.icon ? '<img class="pet" data-fb="" src="' + pet.icon + '" alt="">' : '');
                for (const im of /** @type {HTMLImageElement[]} */ (/** @type {any} */ (GameUi.qa(fig, 'img')))) im.addEventListener('error', () => { if (!im.dataset.t && /\.webp$/.test(im.src)) { im.dataset.t = '1'; im.src = im.src.replace(/\.webp$/, '.png'); } else im.style.display = 'none'; });
                // эмоция по hover-замене: при emote у фигуры анимация сразу
                if (emote) fig.classList.add('emo-' + emote.emote); else fig.className = 'figure';
            }
            const g = glow && glow.glow ? glow.glow : { color: 0xff6fb5, fx: 'none' };
            const stage = GameUi.q(root, '.gk-stage');
            stage.style.setProperty('--gc', GameUi._hex(g.color));
            const fxl = GameUi.q(root, '.fxlayer');
            if (fxl.dataset.fx !== g.fx) {
                fxl.dataset.fx = g.fx; fxl.innerHTML = '';
                const ch = { hearts: '♥', stars: '★', sparkle: '✦', bubbles: '○', fire: '▲', rainbow: '●' }[g.fx];
                const cols = g.fx === 'rainbow' ? ['#ff5fa8', '#ffd84a', '#43e0b6', '#6f86ff'] : g.fx === 'fire' ? ['#ff9f1c', '#ff5a1c', '#ffd84a'] : [GameUi._hex(g.color), '#fff'];
                if (ch) for (let i = 0; i < 10; i++) {
                    const p = GameUi.el('span', 'gk-fxp', ch);
                    p.style.left = (12 + Math.random() * 76).toFixed(0) + '%'; p.style.color = cols[i % cols.length]; p.style.background = 'none'; p.style.fontSize = '1.1em';
                    p.style.animationDelay = (i * 0.16).toFixed(2) + 's'; p.style.setProperty('--dx', ((Math.random() - 0.5) * 3).toFixed(1) + 'em');
                    fxl.appendChild(p);
                }
            }
            const sel = ctx.data.sel ? Shop.item(ctx.data.sel) : null;
            const nm = GameUi.q(root, '[data-k="nm"]'), rr = GameUi.q(root, '[data-k="rr"]'), hint = GameUi.q(root, '[data-k="hint"]');
            if (sel) {
                nm.textContent = Shop.name(sel.id);
                rr.textContent = Shop.rarityLabel(sel.rarity); rr.className = 'rr' + (sel.rarity === 'mythic' ? ' gk-mythic' : '');
                rr.style.color = sel.rarity === 'mythic' ? '' : ({ common: '#e8c9a0', rare: '#6fcaff', epic: '#d39bff', legendary: '#ffc83d' }[sel.rarity] || '#fff');
                hint.textContent = Shop.owns(sel.id) ? '' : Lang.t('ke.shop.tryon');
            } else { nm.textContent = ''; rr.textContent = ''; hint.textContent = ''; }
        },
    },

    // ============================================================ Daily Gift
    daily: {
        title: 'ke.w.daily', icon: 'gift', cls: 'narrow', wallet: true,
        build(ctx) {
            ctx.body.innerHTML = '<p class="gk-note" style="margin:0 0 .9em">' + GameUi.esc(Lang.t('ke.daily.lead')) + '</p><div class="gk-days"></div>';
            ctx.foot.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:.7em;justify-content:center;width:100%">' +
                '<button type="button" class="gk-key k-mint big" data-k="claim"></button><button type="button" class="gk-key k-lemon" data-k="x2"></button></div><p class="gk-note" data-k="next" style="width:100%"></p>';
            const busyRun = async (fn) => { if (ctx.data.busy) return; ctx.data.busy = true; try { await fn(); } finally { ctx.data.busy = false; ctx.refresh(); ctx.hud.updateBadges(); } };
            GameUi.q(ctx.foot, '[data-k="claim"]').addEventListener('click', (e) => {
                e.stopPropagation();
                busyRun(async () => {
                    const r = DailyGift.claim();
                    if (r.ok) GAME_UI_SHOP_WINDOWS.daily._gotPopup(ctx, r); else GameUi.sfx('ui_deny');
                });
            });
            GameUi.q(ctx.foot, '[data-k="x2"]').addEventListener('click', (e) => {
                e.stopPropagation();
                busyRun(async () => {
                    GameUi.sfx('ui_click');
                    const r = await DailyGift.claimX2();
                    if (r.ok) GAME_UI_SHOP_WINDOWS.daily._gotPopup(ctx, r);
                    else if (r.reason !== 'cooldown' && r.reason !== 'busy') { GameUi.sfx('ui_deny'); ctx.hud.toast(Lang.t(r.reason === 'adFailed' || r.reason === 'adUnavailable' ? 'ke.err.ads' : 'ke.err.generic'), 1700); }
                });
            });
        },
        _gotPopup(ctx, r) {
            const v = gameUiGotView(r.got);
            GameUiShop.syncIn();
            GameUi.reward({ title: Lang.t('ke.daily.got') + (r.mult === 2 ? ' x2' : ''), big: v.big, pic: v.pic, sub: v.sub });
        },
        render(ctx) {
            GameUiShop.syncIn();
            const v = DailyGift.view();
            const grid = GameUi.q(ctx.body, '.gk-days');
            grid.innerHTML = '';
            for (const d of v.days) {
                const el = GameUi.el('div', 'gk-day ' + d.state + (d.exclusive ? ' d7' : ''));
                let pic = '', lab = '';
                const r = d.reward;
                if (r.exclusive) {
                    const it = Shop.item(r.exclusive);
                    pic = it ? GameUi.skinPic(it) : GameUi.ic('gift');
                    lab = Shop.name(r.exclusive);
                } else if (r.big) { pic = GameUi.ic('chest'); lab = '+' + GameUi.fmt(r.coins) + GameUi.ic('wins'); }
                else {
                    pic = GameUi.ic(r.randomItems ? 'chest' : 'wins');
                    lab = (r.coins ? '+' + GameUi.fmt(r.coins) + GameUi.ic('wins') : '') + (r.randomItems ? (r.coins ? ' ' : '') + '+<span style="font-size:1.2em">?</span>' : '');
                }
                el.innerHTML = (d.exclusive ? '<span class="xl">' + GameUi.esc(Lang.t('ke.daily.exclusive')) + '</span>' : '') +
                    '<div class="dn">' + GameUi.esc(d.dayLabel) + '</div><div class="di">' + pic + '</div><div class="dl">' + lab + '</div><div class="ds">' + GameUi.esc(d.stateLabel) + '</div>';
                grid.appendChild(el);
            }
            const claim = GameUi.q(ctx.foot, '[data-k="claim"]'), x2 = GameUi.q(ctx.foot, '[data-k="x2"]'), next = GameUi.q(ctx.foot, '[data-k="next"]');
            claim.innerHTML = GameUi.ic('gift') + '<span>' + GameUi.esc(v.claim.label) + '</span>';
            claim.classList.toggle('off', !!(!v.claim.enabled || ctx.data.busy));
            const showX2 = v.x2.available && !(typeof Platform !== 'undefined' && !Platform.rewardedSupported());
            x2.style.display = showX2 ? '' : 'none';
            x2.innerHTML = GameUi.ic('ad') + '<span>' + GameUi.esc(v.x2.label) + '</span>';
            x2.classList.toggle('off', !!(!v.x2.enabled || ctx.data.busy));
            next.textContent = v.canClaim ? (v.x2.hint && showX2 && !v.x2.enabled ? v.x2.hint : '') : v.nextLabel;
        },
        tick(ctx) { GAME_UI_SHOP_WINDOWS.daily.render(ctx); },
    },

    // ============================================================ Wheel
    wheel: {
        title: 'ke.w.wheel', icon: 'wheel', cls: 'narrow', wallet: true,
        build(ctx) {
            const d = ctx.data;
            d.angle = 0; d.spinning = false;
            const lights = Array.from({ length: 16 }, (_, i) => {
                const a = (i / 16) * Math.PI * 2;
                return '<i style="left:' + (50 + 50 * Math.sin(a)).toFixed(2) + '%;top:' + (50 - 50 * Math.cos(a)).toFixed(2) + '%"></i>';
            }).join('');
            ctx.body.innerHTML = '<div class="gk-wheelbox"><div class="gk-wheelwrap"><canvas width="560" height="560"></canvas><div class="rim"></div><div class="gk-lights">' + lights + '</div>' +
                '<svg class="ptr" viewBox="0 0 40 52"><path d="M20 50 L3 14 Q2 4 12 3 L28 3 Q38 4 37 14 Z" fill="#ff3d6e" stroke="#2a130a" stroke-width="4" stroke-linejoin="round"/><circle cx="20" cy="15" r="5" fill="#fff3df"/></svg><div class="hub"></div></div>' +
                '<div class="gk-wheelbtns"><button type="button" class="gk-key k-mint" data-k="free"></button><button type="button" class="gk-key k-lemon" data-k="ad"></button></div></div>';
            ctx.foot.innerHTML = '<p class="gk-note" data-k="hint"></p>';
            ctx.body.style.setProperty('--wh', '100vh');
            const spin = async (kind) => {
                if (d.spinning || Wheel.state.pending) return;
                GameUi.sfx('ui_click');
                d.spinning = true; ctx.refresh();
                let res;
                try { res = kind === 'free' ? Wheel.spinFree() : await Wheel.spinAd(); } catch (err) { console.warn('Wheel spin:', err); res = { ok: false }; }
                if (!res || !res.ok) {
                    d.spinning = false;
                    if (res && res.reason && res.reason !== 'cooldown' && res.reason !== 'busy' && res.reason !== 'pending') {
                        GameUi.sfx('ui_deny'); ctx.hud.toast(Lang.t(res.reason === 'adFailed' || res.reason === 'adUnavailable' ? 'ke.err.ads' : 'ke.err.generic'), 1700);
                    }
                    ctx.refresh(); return;
                }
                GAME_UI_SHOP_WINDOWS.wheel._animate(ctx, res);
            };
            GameUi.q(ctx.body, '[data-k="free"]').addEventListener('click', (e) => { e.stopPropagation(); spin('free'); });
            GameUi.q(ctx.body, '[data-k="ad"]').addEventListener('click', (e) => { e.stopPropagation(); spin('ad'); });
        },
        render(ctx) {
            GameUiShop.syncIn();
            const d = ctx.data, st = Wheel.status();
            if (!d.drawn || d.sig !== Wheel.sectors().map((s) => s.label).join('|')) GAME_UI_SHOP_WINDOWS.wheel._draw(ctx);
            const free = GameUi.q(ctx.body, '[data-k="free"]'), ad = GameUi.q(ctx.body, '[data-k="ad"]');
            free.innerHTML = '<span>' + GameUi.esc(st.freeLabel) + '</span>';
            free.classList.toggle('off', !!(!st.canSpinFree || d.spinning));
            const adLeft = st.adLeft + st.banked;
            ad.innerHTML = GameUi.ic('ad') + (st.adWait > 0 || adLeft <= 0 ? '<span>' + GameUi.esc(st.adLabel) + '</span>' :
                '<span>' + GameUi.esc(Lang.t('ke.wheel.adspin')) + '<br><small>' + GameUi.esc(Lang.t('ke.wheel.left', { a: adLeft, b: st.adLimit })) + '</small></span>');
            ad.classList.toggle('off', !!(!st.canSpinAd || d.spinning));
            const sup = typeof Platform === 'undefined' || Platform.rewardedSupported();
            ad.style.display = sup ? '' : 'none';
            GameUi.q(ctx.foot, '[data-k="hint"]').textContent = d.spinning ? Lang.t('wheel.spinning') : (st.hint || Lang.t('ke.wheel.lead'));
        },
        tick(ctx) { if (!ctx.data.spinning) GAME_UI_SHOP_WINDOWS.wheel.render(ctx); },
        /** Рисует диск: секторы с призами по Wheel.sectors(). Сектор 0 — под стрелкой сверху, дальше по часовой. */
        _draw(ctx) {
            const d = ctx.data, cv = /** @type {HTMLCanvasElement} */ (GameUi.q(ctx.body, 'canvas')), g = cv.getContext('2d');
            const secs = Wheel.sectors();
            d.sig = secs.map((s) => s.label).join('|'); d.drawn = true;
            const W = cv.width, R = W / 2, n = secs.length, step = (Math.PI * 2) / n;
            const colors = ['#ff5fa8', '#fff3df', '#43e0b6', '#ffd84a', '#6f86ff', '#ffb9d9', '#ff9f1c', '#b388ff'];
            g.clearRect(0, 0, W, W);
            g.save(); g.translate(R, R);
            secs.forEach((s, i) => {
                const c = -Math.PI / 2 + i * step, a0 = c - step / 2, a1 = c + step / 2;
                const col = colors[i % colors.length];
                g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R * 0.97, a0, a1); g.closePath();
                const gr = g.createRadialGradient(0, 0, R * 0.1, 0, 0, R);
                gr.addColorStop(0, '#fff6'); gr.addColorStop(0.35, col); gr.addColorStop(1, col);
                g.fillStyle = gr; g.fill();
                g.lineWidth = 5; g.strokeStyle = '#2a130a'; g.stroke();
                // подпись и иконка вдоль радиуса
                g.save(); g.rotate(c);
                g.font = '700 ' + Math.round(R * 0.15) + 'px "Fredoka","Nunito",sans-serif'; g.textAlign = 'right'; g.textBaseline = 'middle';
                const txt = s.kind === 'coins' ? (s.coins >= 1000 ? +(s.coins / 1000).toFixed(1) + 'K' : String(s.coins)) : '?';
                g.lineWidth = 7; g.strokeStyle = '#2a130a'; g.lineJoin = 'round';
                g.strokeText(txt, R * 0.86, 0); g.fillStyle = '#fff'; g.fillText(txt, R * 0.86, 0);
                g.restore();
                const iconSrc = s.kind === 'coins' ? GameUi.src('wins') : (() => {
                    const it = Shop.item(s.itemId);
                    return it && it.tab === 'hats' ? GameUi.src('hat') : it && it.tab === 'pets' ? GameUi.src('pet') : it && it.tab === 'glow' ? GameUi.src('glow') : it && it.tab === 'emotes' ? GameUi.src('hand') : GameUi.src('skin');
                })();
                GameUiShop.img(iconSrc, (im) => {
                    g.save(); g.rotate(c); g.translate(R * 0.5, 0);
                    const sz = R * 0.3; g.drawImage(im, -sz / 2, -sz / 2, sz, sz); g.restore();
                });
            });
            g.restore();
        },
        /** Анимация вращения до res.angle; приз выдаётся по окончании (и если окно закрыли — тоже). */
        _animate(ctx, res) {
            const d = ctx.data, cv = GameUi.q(ctx.body, 'canvas');
            const target = Wheel.angleFrom(d.angle, res);
            const ms = Math.max(1200, res.durationMs || 4200);
            cv.style.transition = 'transform ' + ms + 'ms cubic-bezier(.12,.62,.1,1)';
            // перерисовка стиля до смены transform
            void cv.offsetWidth;
            cv.style.transform = 'rotate(' + target + 'deg)';
            d.angle = target;
            let ticks = 0;
            const tickT = setInterval(() => { if (++ticks % 2 === 0) GameUi.sfx('ui_tick', 0.3); }, Math.max(90, ms / 36));
            setTimeout(() => {
                clearInterval(tickT);
                const r = Wheel.finish();
                GameUiShop.syncIn();
                d.spinning = false;
                if (cv.isConnected) {
                    cv.style.transition = 'none';
                    d.angle = ((target % 360) + 360) % 360;
                    cv.style.transform = 'rotate(' + d.angle + 'deg)';
                }
                if (r && r.ok) {
                    const v = gameUiGotView(r.got);
                    GameUi.reward({ title: Lang.t('ke.wheel.won'), big: v.big, pic: v.pic, sub: v.sub });
                }
                d.drawn = false;
                if (ctx.hud.current === 'wheel') ctx.refresh();
                ctx.hud.updateBadges();
            }, ms + 120);
        },
    },
};
