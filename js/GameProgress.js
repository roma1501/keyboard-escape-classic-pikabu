// GameProgress.js — прогресс игрока «ASMR Keyboard Escape»: Speed от шагов, уровень, Rebirth, Wins, трейлы, ауры,
// беговые дорожки, телепорт по Safe Zone, ограничение Max Speed. ЧИСТАЯ ЛОГИКА без DOM и Babylon: интерфейс (GameHud)
// читает отсюда данные окон и зовёт покупки, игра (Game.js) — шаги и награды. Состояние — часть общего сохранения
// (Game.save.prog), Platform.save зовёт игра через persist.
//
//   GameProgress.init(save.prog, () => Game.persist());   save.prog = GameProgress.state;
//   GameProgress.step(1);                 // герой наступил на новую клавишу → +perStep() к Speed
//   GameProgress.runSpeed();              // px/с бега для ObbyBody (cmd.speed)
//   GameProgress.on(e => …);              // { type: 'change' | 'level' | 'rebirth' | 'buy' | 'wins', … }
//   GameProgress.fmt(1234567) → '1.23M'

/** @satisfies {Record<string, any>} */
const GameProgress = {
    /** @type {any} */ state: null,
    /** @type {(() => void) | null} */ persistFn: null,
    /** @type {Array<(e: any) => void>} */ subs: [],
    _dirtyT: 0,

    defaults() {
        return {
            speed: 0, wins: 0, winsTotal: 0, rebirths: 0, totalSteps: 0,
            trails: [], trail: '', auras: [], aura: '', treadmills: [1],
            maxSpeed: 0, bestStage: 0, level: 0,
        };
    },

    /** @param {any} state часть сохранения (или undefined — новый игрок) @param {() => void} [persist] */
    init(state, persist) {
        const s = Object.assign(this.defaults(), state || {});
        for (const k of ['trails', 'auras', 'treadmills']) if (!Array.isArray(s[k])) s[k] = k === 'treadmills' ? [1] : [];
        if (!s.treadmills.includes(1)) s.treadmills.unshift(1);
        for (const k of ['speed', 'wins', 'winsTotal', 'rebirths', 'totalSteps', 'maxSpeed', 'bestStage']) s[k] = Math.max(0, Number(s[k]) || 0);
        s.level = this.levelOf(s.speed);
        this.state = s;
        this.persistFn = persist || null;
        return this;
    },

    on(fn) { this.subs.push(fn); return () => { this.subs = this.subs.filter(f => f !== fn); }; },
    emit(e) { for (const f of this.subs.slice()) { try { f(e); } catch (err) { console.warn('GameProgress:', err); } } },
    /** Сохранить сразу (покупка, награда) — или отложенно (шаги: не чаще раза в 2 с, см. tick). */
    persist(now) { if (now) { this._dirtyT = 0; if (this.persistFn) this.persistFn(); } else if (!this._dirtyT) this._dirtyT = 2; },
    /** Кадр: отложенное сохранение после шагов. */
    tick(dt) { if (this._dirtyT > 0) { this._dirtyT -= dt; if (this._dirtyT <= 0) this.persist(true); } },

    // ---------------------------------------------------------------------------------------------
    // Числа
    // ---------------------------------------------------------------------------------------------

    cfg() {
        const U = 'undefined';
        return {
            base: typeof KE_SPEED_BASE !== U ? KE_SPEED_BASE : 330,
            gain: typeof KE_SPEED_GAIN !== U ? KE_SPEED_GAIN : 1900,
            soft: typeof KE_SPEED_SOFT !== U ? KE_SPEED_SOFT : 900,
            levelBase: typeof KE_LEVEL_BASE !== U ? KE_LEVEL_BASE : 25,
            levelPow: typeof KE_LEVEL_POW !== U ? KE_LEVEL_POW : 1.5,
            rbLevel: typeof KE_REBIRTH_LEVEL !== U ? KE_REBIRTH_LEVEL : 10,
            rbStep: typeof KE_REBIRTH_LEVEL_STEP !== U ? KE_REBIRTH_LEVEL_STEP : 5,
            rbMult: typeof KE_REBIRTH_MULT !== U ? KE_REBIRTH_MULT : 0.5,
            treadRate: typeof KE_TREADMILL_RATE !== U ? KE_TREADMILL_RATE : 3,
        };
    },

    /** px/с бега при данной Speed (кривая с насыщением). */
    speedToRun(speed) { const c = this.cfg(); return c.base + c.gain * (1 - Math.exp(-Math.max(0, speed) / c.soft)); },
    /** Speed, с которой бег ограничен (Max Speed игрока; 0 — без ограничения). */
    effSpeed() { const s = this.state; return s.maxSpeed > 0 ? Math.min(s.speed, s.maxSpeed) : s.speed; },
    runSpeed() { return this.speedToRun(this.effSpeed()); },

    trail() { return GAME_TRAILS.find(t => t.id === this.state.trail) || null; },
    aura() { return GAME_AURAS.find(a => a.id === this.state.aura) || null; },
    rebirthMult() { return 1 + this.state.rebirths * this.cfg().rbMult; },
    /** Итоговый множитель шага: трейл × (1 + аура) × Rebirth. */
    mult() {
        const t = this.trail(), a = this.aura();
        return (t ? t.mult : 1) * (1 + (a ? a.bonus : 0)) * this.rebirthMult();
    },
    perStep() { return Math.max(1, Math.round(this.mult() * 10) / 10); },

    /** Шаги героя (клавиши, дорожка): Speed растёт. Возвращает прибавку. @param {number} n шагов @param {number} [k] множитель источника */
    step(n, k) {
        const s = this.state, add = n * this.perStep() * (k || 1);
        s.speed += add;
        s.totalSteps += n;
        const lv = this.levelOf(s.speed);
        if (lv > s.level) { s.level = lv; this.emit({ type: 'level', level: lv }); }
        this.emit({ type: 'change', add });
        this.persist(false);
        return add;
    },

    // ---------------------------------------------------------------------------------------------
    // Уровень и Rebirth
    // ---------------------------------------------------------------------------------------------

    levelNeed(L) { const c = this.cfg(); return L <= 0 ? 0 : Math.round(c.levelBase * Math.pow(L, c.levelPow)); },
    levelOf(speed) { let L = 0; while (L < 999 && this.levelNeed(L + 1) <= speed) L++; return L; },
    level() { return this.state.level; },
    /** { level, cur, next, k } — для полосы уровня. */
    levelInfo() {
        const s = this.state, L = s.level, a = this.levelNeed(L), b = this.levelNeed(L + 1);
        return { level: L, cur: s.speed, next: b, k: b > a ? Math.max(0, Math.min(1, (s.speed - a) / (b - a))) : 1 };
    },
    rebirthNeed() { const c = this.cfg(); return c.rbLevel + this.state.rebirths * c.rbStep; },
    canRebirth() { return this.state.level >= this.rebirthNeed(); },
    rebirthInfo() {
        const c = this.cfg();
        return { need: this.rebirthNeed(), level: this.state.level, mult: this.rebirthMult(), nextMult: this.rebirthMult() + c.rbMult, rebirths: this.state.rebirths, can: this.canRebirth() };
    },
    rebirth() {
        if (!this.canRebirth()) return { ok: false, reason: 'level' };
        const s = this.state;
        s.rebirths++; s.speed = 0; s.level = 0; s.maxSpeed = 0;
        this.emit({ type: 'rebirth', rebirths: s.rebirths });
        this.emit({ type: 'change', add: 0 });
        this.persist(true);
        return { ok: true };
    },

    // ---------------------------------------------------------------------------------------------
    // Wins
    // ---------------------------------------------------------------------------------------------

    addWins(n) {
        n = Math.max(0, Math.round(n));
        if (!n) return 0;
        this.state.wins += n; this.state.winsTotal += n;
        this.emit({ type: 'wins', add: n });
        this.emit({ type: 'change', add: 0 });
        this.persist(true);
        return n;
    },
    spendWins(n) {
        n = Math.max(0, Math.round(n));
        if (this.state.wins < n) return false;
        this.state.wins -= n;
        this.emit({ type: 'wins', add: -n });
        this.emit({ type: 'change', add: 0 });
        this.persist(true);
        return true;
    },
    /** Wins-пад Safe Zone N (11 — финиш): награда × Rebirth-множитель. */
    padWins(n) {
        const st = GAME_STAGES[n - 1];
        const base = n === 12 ? GAME_TOWER_WINS : n > GAME_STAGES.length ? GAME_FINISH_WINS : st ? st.wins : 1;
        return Math.max(1, Math.round(base * (1 + this.state.rebirths * 0.25)));
    },
    reachStage(n) { if (n > this.state.bestStage) { this.state.bestStage = n; this.persist(true); } },

    // ---------------------------------------------------------------------------------------------
    // Трейлы, ауры, дорожки
    // ---------------------------------------------------------------------------------------------

    trails() {
        const s = this.state;
        return GAME_TRAILS.map(t => ({ id: t.id, name: t.name, mult: t.mult, price: t.price, rarity: t.rarity, color: t.colors[0], colors: t.colors,
            owned: s.trails.includes(t.id), equipped: s.trail === t.id, affordable: s.wins >= t.price }));
    },
    auras() {
        const s = this.state;
        return GAME_AURAS.map(a => ({ id: a.id, name: a.name, mult: 1 + a.bonus, bonus: a.bonus, price: a.price, rarity: a.rarity, color: a.color,
            owned: s.auras.includes(a.id), equipped: s.aura === a.id, affordable: s.wins >= a.price }));
    },
    _buy(list, key, eq, id) {
        const item = list.find(x => x.id === id);
        if (!item) return { ok: false, reason: 'unknown' };
        const s = this.state;
        if (s[key].includes(id)) return this._equip(list, key, eq, id);
        if (!this.spendWins(item.price)) return { ok: false, reason: 'wins' };
        s[key].push(id); s[eq] = id;
        this.emit({ type: 'buy', kind: key, id });
        this.emit({ type: 'change', add: 0 });
        this.persist(true);
        return { ok: true };
    },
    _equip(list, key, eq, id) {
        const s = this.state;
        if (!s[key].includes(id)) return { ok: false, reason: 'locked' };
        s[eq] = s[eq] === id ? '' : id;          // повторное нажатие на надетое — снять
        this.emit({ type: 'change', add: 0 });
        this.persist(true);
        return { ok: true };
    },
    buyTrail(id) { return this._buy(GAME_TRAILS, 'trails', 'trail', id); },
    equipTrail(id) { return this._equip(GAME_TRAILS, 'trails', 'trail', id); },
    buyAura(id) { return this._buy(GAME_AURAS, 'auras', 'aura', id); },
    equipAura(id) { return this._equip(GAME_AURAS, 'auras', 'aura', id); },

    treadmills() {
        const s = this.state;
        return GAME_TREADMILLS.map(t => ({ tier: t.tier, name: t.name, mult: t.mult, price: t.price, color: t.color, owned: s.treadmills.includes(t.tier), affordable: s.wins >= t.price }));
    },
    treadmillOwned(tier) { return this.state.treadmills.includes(tier | 0); },
    treadmillMult(tier) { const t = GAME_TREADMILLS.find(x => x.tier === (tier | 0)); return t ? t.mult : 1; },
    /** Цена открытия уровня дорожки со скидкой off (0..1, «акция» Safe Zone). */
    treadmillPrice(tier, off) {
        const t = GAME_TREADMILLS.find(x => x.tier === (tier | 0));
        return t ? Math.max(0, Math.round(t.price * (1 - Math.max(0, Math.min(0.9, off || 0))))) : 0;
    },
    /** Скидка Safe Zone n на дорожку уровня tier (0 — нет акции). */
    treadmillDeal(zone, tier) {
        const d = GAME_TREADMILL_DEALS.find(q => zone >= q.from && zone <= q.to && q.tier === (tier | 0));
        return d ? d.off : 0;
    },
    buyTreadmill(tier, off) {
        const t = GAME_TREADMILLS.find(x => x.tier === (tier | 0));
        if (!t) return { ok: false, reason: 'unknown' };
        if (this.treadmillOwned(t.tier)) return { ok: true };
        if (!this.spendWins(this.treadmillPrice(t.tier, off))) return { ok: false, reason: 'wins' };
        this.state.treadmills.push(t.tier);
        this.emit({ type: 'buy', kind: 'treadmills', id: t.tier });
        this.persist(true);
        return { ok: true };
    },
    /** Шаги на дорожке за dt: доля шага копится в игре; здесь — скорость шагов. */
    treadmillRate(tier) { return this.cfg().treadRate * this.treadmillMult(tier); },

    // ---------------------------------------------------------------------------------------------
    // Телепорт и Max Speed
    // ---------------------------------------------------------------------------------------------

    teleportPrice(n) { return n <= 0 ? 0 : Math.max(1, Math.round(Math.pow(n, 1.6))); },
    /** Safe Zone 1…bestStage открыты, хаб — всегда. */
    teleports() {
        const s = this.state, out = [{ stage: 0, name: { ru: 'Хаб', en: 'Hub' }, price: 0, unlocked: true, affordable: true }];
        for (const st of GAME_STAGES) {
            const p = this.teleportPrice(st.n);
            out.push({ stage: st.n, name: st.name, price: p, unlocked: s.bestStage >= st.n, affordable: s.wins >= p, req: st.req });
        }
        return out;
    },
    /** Списать цену телепорта на Safe Zone n. */
    payTeleport(n) {
        if (n > this.state.bestStage) return { ok: false, reason: 'locked' };
        if (!this.spendWins(this.teleportPrice(n))) return { ok: false, reason: 'wins' };
        return { ok: true };
    },
    setMaxSpeed(v) {
        v = Math.max(0, Math.round(Number(v) || 0));
        this.state.maxSpeed = v >= this.state.speed ? 0 : v;     // не меньше текущей — без ограничения
        this.emit({ type: 'change', add: 0 });
        this.persist(false);
    },

    /** Короткая запись больших чисел: 950, 12.3K, 4.56M, 7.8B, 1.2T, 3.4Qa. */
    fmt(n) {
        n = Number(n) || 0;
        const a = Math.abs(n);
        if (a < 1000) return String(Math.floor(n * 10) / 10).replace(/\.0$/, '');
        const units = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        let i = -1, v = a;
        while (v >= 1000 && i < units.length - 1) { v /= 1000; i++; }
        const digits = v >= 100 ? 0 : v >= 10 ? 1 : 2;
        return (n < 0 ? '-' : '') + v.toFixed(digits).replace(/\.?0+$/, '') + units[i];
    },
};
