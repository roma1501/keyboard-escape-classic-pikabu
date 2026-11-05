// GameOffers.js — предложения помощи после серии падений: упал на одном этапе 4–7 раз подряд (порог случайный) — после
// возрождения карточка с двумя вариантами на выбор и «Нет, спасибо». Варианты: щит на 30 с (монстры, шары и волна не трогают),
// пропуск этапа (в следующую Safe Zone), супер-прыжок на 45 с, x2 скорость на 60 с — за рекламу; косметика со скидкой —
// случайный закрытый предмет магазина за полцены в Wins или сразу за один просмотр. Всё добровольно: награда только после
// Platform.rewarded(...) === true, отказ ничего не отнимает; не чаще раза в KE_OFFER_COOLDOWN с, не в туториале, не без рекламы.
//
//   GameOffers.init({ onShield, onSkip, onJump, onBoost, canSkip });
//   GameOffers.fail(stage);          // смерть героя на этапе stage
//   GameOffers.pass();               // этап пройден / телепорт — серия сначала
//   GameOffers.afterRespawn();       // герой возродился — пора ли показать карточку

Object.assign(LANG_STRINGS.ru, {
    'of.title': 'Нужна помощь?', 'of.lead': 'Упал {n} раз подряд. Выбери бонус — или беги дальше сам!',
    'of.shield': 'Щит 30 с', 'of.shield.h': 'Монстры, шары и волна не трогают', 'of.skip': 'Пропуск этапа', 'of.skip.h': 'Сразу в следующую Safe Zone',
    'of.jump': 'Супер-прыжок 45 с', 'of.jump.h': 'Прыгаешь выше и дальше', 'of.boost': 'x2 скорость 60 с', 'of.boost.h': 'Двойная прибавка за шаг',
    'of.deal': 'Скидка −50%', 'of.deal.h': '{name}', 'of.deal.wins': '−50%: {p} 🏆', 'of.deal.ad': 'За 1 рекламу',
    'of.ad': 'За рекламу', 'of.no': 'Нет, спасибо', 'of.got': 'Получено: {name}!', 'of.shieldOn': 'Щит на 30 с!', 'of.jumpOn': 'Супер-прыжок на 45 с!',
    'of.skipOn': 'Пропуск: Safe Zone {n}', 'of.noWins': 'Не хватает побед',
});
Object.assign(LANG_STRINGS.en, {
    'of.title': 'Need a hand?', 'of.lead': 'You fell {n} times in a row. Pick a bonus, or keep going on your own!',
    'of.shield': '30 s Shield', 'of.shield.h': 'Monsters, balls and the wave can’t hit you', 'of.skip': 'Skip stage', 'of.skip.h': 'Straight to the next Safe Zone',
    'of.jump': '45 s Super jump', 'of.jump.h': 'Jump higher and farther', 'of.boost': '60 s x2 Speed', 'of.boost.h': 'Double speed per step',
    'of.deal': '50% off', 'of.deal.h': '{name}', 'of.deal.wins': '50% off: {p} 🏆', 'of.deal.ad': 'Watch 1 ad',
    'of.ad': 'Watch ad', 'of.no': 'No, thanks', 'of.got': 'Unlocked: {name}!', 'of.shieldOn': 'Shield for 30 s!', 'of.jumpOn': 'Super jump for 45 s!',
    'of.skipOn': 'Skip: Safe Zone {n}', 'of.noWins': 'Not enough Wins',
});

const GAME_OFFERS_CSS = `
#ke-offer { position: fixed; inset: 0; z-index: 45; display: none; align-items: center; justify-content: center; padding: 12px; box-sizing: border-box;
  background: radial-gradient(ellipse at 50% 45%, rgba(255,180,220,.25), rgba(42,19,10,.55)); font-family: var(--ke-font, "Nunito", system-ui, sans-serif); }
#ke-offer.on { display: flex; }
#ke-offer .of-box { width: min(560px, 94%); max-height: 94%; overflow: auto; padding: 16px 16px 14px; border-radius: 22px; color: #fff; text-align: center;
  background: linear-gradient(180deg, #7b4529, #4a2314); border: 4px solid #ffb8e0; box-shadow: 0 8px 0 rgba(0,0,0,.4), inset 0 3px 0 rgba(255,225,180,.35);
  animation: of-in .35s cubic-bezier(.2,1.3,.4,1) both; }
@keyframes of-in { from { transform: translateY(30px) scale(.9); opacity: 0; } to { transform: none; opacity: 1; } }
#ke-offer h2 { margin: 0 0 4px; font-size: clamp(22px, 5vw, 32px); font-weight: 900; -webkit-text-stroke: 3px #2a160c; paint-order: stroke fill; }
#ke-offer p { margin: 0 0 12px; font-size: clamp(13px, 2.6vw, 16px); font-weight: 800; opacity: .95; }
#ke-offer .of-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
#ke-offer .of-card { flex: 1 1 200px; max-width: 250px; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 10px 12px; border-radius: 16px;
  background: rgba(255,255,255,.1); border: 3px solid rgba(255,255,255,.35); }
#ke-offer .of-ic { width: 58px; height: 58px; object-fit: contain; filter: drop-shadow(0 3px 0 rgba(0,0,0,.35)); }
#ke-offer .of-name { font-size: 18px; font-weight: 900; -webkit-text-stroke: 2px #2a160c; paint-order: stroke fill; }
#ke-offer .of-hint { font-size: 13px; font-weight: 700; opacity: .9; min-height: 2.4em; }
#ke-offer button { min-height: 46px; min-width: 150px; padding: 8px 16px; border: 0; border-radius: 14px; cursor: pointer; font: 900 16px var(--ke-font, "Nunito", sans-serif); color: #fff;
  -webkit-text-stroke: 2px rgba(0,0,0,.35); paint-order: stroke fill; box-shadow: 0 5px 0 rgba(0,0,0,.35); -webkit-tap-highlight-color: transparent; }
#ke-offer button:active { transform: translateY(3px); box-shadow: 0 2px 0 rgba(0,0,0,.35); }
#ke-offer button.ad { background: linear-gradient(180deg, #ff8fc8, #e0408c); }
#ke-offer button.wins { background: linear-gradient(180deg, #ffe27a, #e8b21c); color: #4a2414; -webkit-text-stroke: 0; }
#ke-offer button.no { margin-top: 12px; background: linear-gradient(180deg, #8a6a5a, #5a3e30); min-width: 180px; }
#ke-offer button:disabled { opacity: .55; cursor: default; }
@media (max-height: 420px) { #ke-offer .of-ic { width: 40px; height: 40px; } #ke-offer .of-hint { display: none; } #ke-offer p { margin-bottom: 6px; } }
`;

/** @satisfies {Record<string, any>} */
const GameOffers = {
    /** @type {any} */ cb: {},
    /** @type {HTMLElement | null} */ root: null,
    streak: 0, stage: -1, need: 5, lastAt: -1e9, pending: false, busy: false, open: false,

    cfg() { return { cooldown: (typeof KE_OFFER_COOLDOWN !== 'undefined' ? KE_OFFER_COOLDOWN : 180) * 1000, min: 4, max: 7 }; },

    init(cb) {
        this.cb = cb || {};
        this._roll();
        if (typeof document === 'undefined') return this;
        const st = document.createElement('style'); st.textContent = GAME_OFFERS_CSS; document.head.appendChild(st);
        const root = this.root = document.createElement('div');
        root.id = 'ke-offer';
        document.body.appendChild(root);
        window.addEventListener('keydown', (e) => { if (this.open && e.code === 'Escape') { e.stopImmediatePropagation(); this.close(); } }, true);
        return this;
    },

    _roll() { const c = this.cfg(); this.need = c.min + Math.floor(Math.random() * (c.max - c.min + 1)); },

    fail(stage) {
        if (stage !== this.stage) { this.stage = stage; this.streak = 0; }
        this.streak++;
        if (this.streak >= this.need && Date.now() - this.lastAt > this.cfg().cooldown) this.pending = true;
    },

    pass() { this.streak = 0; this.pending = false; this._roll(); },

    afterRespawn() {
        if (!this.pending || this.open) return;
        this.pending = false;
        if (typeof Tutorial !== 'undefined' && Tutorial.active) return;
        if (!Platform.rewardedSupported()) return;
        this.show();
    },

    /** Два варианта: помощь в прохождении + (иногда) косметика со скидкой. */
    _choices() {
        const help = ['shield', 'jump', 'boost'];
        if (this.cb.canSkip && this.cb.canSkip()) help.push('skip', 'skip');      // пропуск — чаще, когда он возможен
        const pick = (list) => list.splice(Math.floor(Math.random() * list.length), 1)[0];
        const a = pick(help);
        const deal = this._deal();
        const b = deal && Math.random() < 0.6 ? 'deal' : pick(help.filter(x => x !== a));
        return { list: [a, b], deal };
    },

    /** Случайный закрытый предмет магазина (не эксклюзив). */
    _deal() {
        if (typeof Shop === 'undefined' || !Shop.state || typeof SHOP_ITEMS === 'undefined') return null;
        const pool = SHOP_ITEMS.filter(it => !it.exclusive && !it.default && !Shop.owns(it.id) && it.price && (it.price.coins || it.price.ads));
        if (!pool.length) return null;
        const it = pool[Math.floor(Math.random() * pool.length)];
        const full = it.price.coins || Math.max(40, (it.price.ads || 1) * 60);
        return { id: it.id, name: Shop.name(it.id), price: Math.max(1, Math.round(full * 0.5)), icon: it.icon || '' };
    },

    show() {
        if (!this.root) return;
        const { list, deal } = this._choices();
        const ICON = { shield: 'shield', skip: 'portal', jump: 'jump', boost: 'speed', deal: 'skin' };
        const ic = (k) => (typeof GAME_UI_ICONS !== 'undefined' && GAME_UI_ICONS[ICON[k]]) ? '<img class="of-ic" alt="" draggable="false" src="' + GAME_UI_ICONS[ICON[k]] + '">' : '';
        const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
        const cards = list.map((k) => {
            if (k === 'deal' && deal) {
                const url = deal.icon || (typeof SKIN_PICS !== 'undefined' && SKIN_PICS[deal.id]) || '';
                const pic = url ? '<img class="of-ic" alt="" draggable="false" src="' + esc(url) + '">' : ic('deal');
                return '<div class="of-card">' + pic + '<div class="of-name">' + esc(deal.name) + '</div><div class="of-hint">' + esc(Lang.t('of.deal')) + '</div>' +
                    '<button class="wins" data-a="deal-wins">' + esc(Lang.t('of.deal.wins', { p: GameProgress.fmt(deal.price) })) + '</button>' +
                    '<button class="ad" data-a="deal-ad">' + esc(Lang.t('of.deal.ad')) + '</button></div>';
            }
            return '<div class="of-card">' + ic(k) + '<div class="of-name">' + esc(Lang.t('of.' + k)) + '</div><div class="of-hint">' + esc(Lang.t('of.' + k + '.h')) + '</div>' +
                '<button class="ad" data-a="' + k + '">' + esc(Lang.t('of.ad')) + '</button></div>';
        }).join('');
        this.root.innerHTML = '<div class="of-box"><h2>' + esc(Lang.t('of.title')) + '</h2><p>' + esc(Lang.t('of.lead', { n: this.streak })) + '</p><div class="of-row">' + cards +
            '</div><button class="no" data-a="no">' + esc(Lang.t('of.no')) + '</button></div>';
        this._deal_ = deal;
        for (const b of this.root.querySelectorAll('button')) b.addEventListener('click', (e) => { e.stopPropagation(); this._act(/** @type {HTMLElement} */ (b).dataset.a || 'no'); });
        this._cooldownLabels();
        this.root.classList.add('on');
        this.open = true;
        this.lastAt = Date.now();
        this.streak = 0; this._roll();
        if (typeof Pause !== 'undefined') Pause.set('manual', true);
        if (this.cb.onOpen) this.cb.onOpen(true);
    },

    /** Пауза между rewarded: кнопки «за рекламу» неактивны с «Через N с». */
    _cooldownLabels() {
        if (!this.root) return;
        const wait = Platform.rewardedCooldownLeft ? Platform.rewardedCooldownLeft() : 0;
        for (const b of /** @type {HTMLButtonElement[]} */ (/** @type {any} */ (this.root.querySelectorAll('button.ad')))) {
            if (!b.dataset.t) b.dataset.t = b.textContent || '';
            b.disabled = wait > 0 || this.busy;
            b.textContent = wait > 0 ? Platform.rewardedCooldownLabel() : b.dataset.t;
        }
        if (this.open && wait > 0) setTimeout(() => this._cooldownLabels(), 1000);
    },

    close() {
        if (!this.root) return;
        this.root.classList.remove('on');
        this.open = false;
        if (typeof Pause !== 'undefined') Pause.set('manual', false);
        if (this.cb.onOpen) this.cb.onOpen(false);
    },

    async _act(a) {
        if (this.busy) return;
        if (a === 'no') { this.close(); return; }
        const deal = this._deal_;
        if (a === 'deal-wins') {
            if (!deal) return;
            if (!GameProgress.spendWins(deal.price)) { GameHud.toast(Lang.t('of.noWins'), 1300); return; }
            Shop.grant(deal.id, { reason: 'offer' });
            GameHud.toast(Lang.t('of.got', { name: deal.name }), 1800);
            this.close();
            return;
        }
        this.busy = true; this._cooldownLabels();
        let ok = false;
        try { ok = await Platform.rewarded(a === 'deal-ad' ? 'offer-cosmetic' : 'offer-' + a); } catch (e) { ok = false; }
        this.busy = false;
        if (!ok) { this._cooldownLabels(); return; }       // отказ или ошибка — ничего не выдаём, карточка остаётся
        this.close();
        if (a === 'deal-ad' && deal) { Shop.grant(deal.id, { reason: 'offer' }); GameHud.toast(Lang.t('of.got', { name: deal.name }), 1800); }
        else if (a === 'shield' && this.cb.onShield) this.cb.onShield(30);
        else if (a === 'jump' && this.cb.onJump) this.cb.onJump(45);
        else if (a === 'boost' && this.cb.onBoost) this.cb.onBoost(60);
        else if (a === 'skip' && this.cb.onSkip) this.cb.onSkip();
    },
};
