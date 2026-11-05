// GameUiWindows.js — окна игры, которые читают данные из GameProgress: Trails, Auras, Rebirth, Teleport, Treadmills, Top (рекорды),
// Pause, Settings, Result (награда Wins-пада). Определение окна (def), GameHud.init кладёт их в реестр:
//   { title: ключ Lang, icon: имя иконки, cls?: 'narrow'|'tiny'|'wide', wallet?: true, tabs?: true, noscroll?: true,
//     build(ctx), render(ctx), tick?(ctx), onClose?(ctx) }
//   ctx = { hud, win, head, body, foot, tabs, wallet, opts, data, refresh(), close() }
// GameProgress — по контракту docs/GAME-DESIGN.md; без него (файл ещё не подключён) окна показывают «пусто» и не падают.

/** Ответ колбэка/GameProgress ({ ok, reason }) -> текст ошибки или ''. */
function gameUiReason(r) {
    if (!r || r.ok !== false) return '';
    const s = String(r.reason || '');
    if (/wins|funds|coin|money|afford|price/i.test(s)) return Lang.t('ke.err.wins');
    if (/ad/i.test(s)) return Lang.t('ke.err.ads');
    return Lang.t('ke.err.generic');
}

/** Вызвать колбэк игры (или запасной вариант из GameProgress), показать ошибку, перерисовать окно. */
async function gameUiDo(ctx, cbName, fallback, arg, closeAfter) {
    let r;
    try {
        const f = ctx.hud.cb && ctx.hud.cb[cbName];
        r = f ? await f(arg) : (fallback ? await fallback(arg) : null);
    } catch (e) { console.warn('GameHud ' + cbName + ':', e); r = { ok: false, reason: 'error' }; }
    const bad = gameUiReason(r);
    if (bad) { GameUi.sfx('ui_deny'); ctx.hud.toast(bad, 1600); } else { GameUi.sfx(closeAfter ? 'ui_click' : 'ui_buy'); if (closeAfter) ctx.close(); }
    ctx.refresh();
    return r;
}

/** Карточка трейла/ауры. */
function gameUiPerkCard(kind, it, i, ctx) {
    const wins = GameUi.wins();
    const owned = !!it.owned, equipped = !!it.equipped, price = Math.floor(it.price || 0);
    const rarity = GameUi.rarityOf(it.rarity);
    const card = GameUi.el('div', 'gk-card' + (owned ? '' : ' locked'));
    card.dataset.r = rarity;
    const icon = GameUi.pickIcon(kind, it, i);
    const col = it.color != null ? GameUi._hex(it.color) : '#ff5fa8';
    let state = '', price1 = '';
    if (equipped) state = '<span class="badge">' + Lang.t('ke.equipped') + '</span>';
    if (!owned) price1 = '<div class="pr' + (wins < price ? ' bad' : '') + '">' + GameUi.ic('wins') + '<span>' + GameUi.fmt(price) + '</span></div>';
    else price1 = '<div class="pr mut">' + Lang.t('ke.owned') + '</div>';
    card.innerHTML = state + '<div class="pic" style="--rbg:' + col + '33"><img class="pimg" src="' + icon + '" alt="" draggable="false"></div>' +
        '<div class="nm">' + GameUi.esc(GameUi.text(it.name, it.id)) + '</div>' +
        '<div class="rr">' + GameUi.esc(GameUi.rarityLabel(rarity)) + '</div>' +
        '<div class="pr"><span class="gk-chip">' + GameUi.esc(GameUi.mult(it.mult)) + '</span></div>' + price1 +
        '<button type="button" class="gk-key sm"></button>';
    const btn = GameUi.q(card, 'button');
    let action = 'buy';
    if (equipped) { action = 'none'; btn.textContent = Lang.t('ke.equipped'); btn.classList.add('k-cream', 'off'); }
    else if (owned) { action = 'equip'; btn.textContent = Lang.t('ke.equip'); btn.classList.add('k-mint'); }
    else { btn.textContent = Lang.t('ke.buy'); btn.classList.add('k-lemon'); if (wins < price) btn.classList.add('nope'); }
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (action === 'none') return;
        const P = GameUi.progress();
        const nm = (action === 'buy' ? 'onBuy' : 'onEquip') + (kind === 'trail' ? 'Trail' : 'Aura');
        const fb = P ? (action === 'buy' ? (kind === 'trail' ? P.buyTrail : P.buyAura) : (kind === 'trail' ? P.equipTrail : P.equipAura)) : null;
        gameUiDo(ctx, nm, fb ? (id) => fb.call(P, id) : null, it.id, false);
    });
    return card;
}

const GAME_UI_WINDOWS = {
    // ============================================================ Trails / Auras
    trails: {
        title: 'ke.w.trails', icon: 'trails', wallet: true,
        build(ctx) { ctx.body.innerHTML = '<div class="gk-grid"></div>'; ctx.foot.innerHTML = '<p class="gk-note">' + GameUi.esc(Lang.t('ke.trails.note')) + '</p>'; },
        render(ctx) { GAME_UI_WINDOWS._perks(ctx, 'trail'); },
    },
    auras: {
        title: 'ke.w.auras', icon: 'auras', wallet: true,
        build(ctx) { ctx.body.innerHTML = '<div class="gk-grid"></div>'; ctx.foot.innerHTML = '<p class="gk-note">' + GameUi.esc(Lang.t('ke.auras.note')) + '</p>'; },
        render(ctx) { GAME_UI_WINDOWS._perks(ctx, 'aura'); },
    },
    _perks(ctx, kind) {
        const P = GameUi.progress();
        const list = P ? (kind === 'trail' ? P.trails() : P.auras()) : [];
        const grid = GameUi.q(ctx.body, '.gk-grid'), keep = ctx.body.scrollTop;
        grid.innerHTML = '';
        if (!list.length) grid.innerHTML = '<p class="gk-note">' + GameUi.esc(Lang.t('ke.empty')) + '</p>';
        list.forEach((it, i) => grid.appendChild(gameUiPerkCard(kind, it, i, ctx)));
        ctx.body.scrollTop = keep;
    },

    // ============================================================ Rebirth
    rebirth: {
        title: 'ke.w.rebirth', icon: 'rebirth', cls: 'narrow', wallet: false,
        build(ctx) {
            ctx.body.innerHTML = '<div class="gk-rb"><img class="big" src="' + GameUi.src('rebirth') + '" alt="">' +
                '<p class="gk-note" data-k="lead"></p>' +
                '<div class="mults"><div class="mbox"><small data-k="nowl"></small><b data-k="now">x1</b></div><img class="arrow" src="' + GameUi.src('play') + '" alt=""><div class="mbox next"><small data-k="nextl"></small><b data-k="next">x2</b></div></div>' +
                '<div class="lvl"><div><span data-k="lvl"></span><span data-k="cnt"></span></div><div class="gk-bar mint"><i></i></div></div></div>';
            ctx.foot.innerHTML = '<button type="button" class="gk-key k-mint big" data-k="go"></button>';
            const go = GameUi.q(ctx.foot, '[data-k="go"]');
            go.addEventListener('click', (e) => {
                e.stopPropagation();
                const P = GameUi.progress();
                if (!(P && P.canRebirth())) { GameUi.sfx('ui_deny'); return; }
                if (!ctx.data.confirm) {
                    ctx.data.confirm = true; GameUi.sfx('ui_click');
                    go.textContent = Lang.t('ke.rb.confirm'); go.classList.remove('k-mint'); go.classList.add('k-red');
                    clearTimeout(ctx.data.ct);
                    ctx.data.ct = setTimeout(() => { ctx.data.confirm = false; ctx.refresh(); }, 3200);
                    return;
                }
                clearTimeout(ctx.data.ct); ctx.data.confirm = false;
                GameUi.sfx('ui_buy'); GameUi.confetti(50);
                const f = ctx.hud.cb && ctx.hud.cb.onRebirth;
                try { if (f) f(); else P.rebirth(); } catch (err) { console.warn('GameHud onRebirth:', err); }
                ctx.close();
            });
        },
        render(ctx) {
            const P = GameUi.progress();
            let info = { need: 0, mult: 1, nextMult: 1 }, lv = { level: 0 }, can = false, rb = 0;
            if (P) { try { info = P.rebirthInfo(); lv = P.level(); can = !!P.canRebirth(); rb = (P.state && P.state.rebirths) || 0; } catch (e) { /* GameProgress ещё не готов */ } }
            const q = (k) => GameUi.q(ctx.body, '[data-k="' + k + '"]');
            q('lead').textContent = Lang.t('ke.rb.lead');
            q('nowl').textContent = Lang.t('ke.rb.now'); q('nextl').textContent = Lang.t('ke.rb.next');
            q('now').textContent = GameUi.mult(info.mult); q('next').textContent = GameUi.mult(info.nextMult);
            const lvl = Math.floor(lv.level || 0), need = Math.max(1, Math.floor(info.need || 1));
            q('lvl').textContent = Lang.t('ke.rb.level', { a: lvl, b: need });
            q('cnt').textContent = Lang.t('ke.rb.count', { n: rb });
            GameUi.q(ctx.body, '.gk-bar > i').style.width = Math.round(100 * Math.min(1, lvl / need)) + '%';
            const go = GameUi.q(ctx.foot, '[data-k="go"]');
            go.classList.toggle('off', !can); go.classList.remove('k-red'); go.classList.add('k-mint');
            go.textContent = can ? Lang.t('ke.rb.go') : Lang.t('ke.rb.need', { n: need });
        },
    },

    // ============================================================ Teleport
    teleport: {
        title: 'ke.w.teleport', icon: 'portal', cls: 'narrow', wallet: true,
        build(ctx) { ctx.body.innerHTML = '<div class="gk-list"></div>'; ctx.foot.innerHTML = '<p class="gk-note">' + GameUi.esc(Lang.t('ke.tp.lead')) + '</p>'; },
        render(ctx) {
            const P = GameUi.progress();
            const list = P ? P.teleports() : [];
            const box = GameUi.q(ctx.body, '.gk-list'), keep = ctx.body.scrollTop, wins = GameUi.wins();
            box.innerHTML = '';
            if (!list.length) box.innerHTML = '<p class="gk-note">' + GameUi.esc(Lang.t('ke.empty')) + '</p>';
            for (const z of list) {
                const price = Math.floor(z.price || 0);
                const row = GameUi.el('div', 'gk-row' + (z.unlocked ? '' : ' lockd'));
                const nm = z.name ? GameUi.text(z.name) : '';
                row.innerHTML = '<div class="pic"><img src="' + GameUi.src(z.unlocked ? 'portal' : 'lock') + '" alt="" draggable="false"></div>' +
                    '<div class="mid"><b>' + GameUi.esc(Lang.t(z.stage ? 'ke.tp.zone' : 'ke.tp.hub', { n: z.stage })) + '</b><small>' + GameUi.esc(nm) + '</small></div>' +
                    '<div class="val">' + (price > 0 ? GameUi.ic('wins') + '<span>' + GameUi.fmt(price) + '</span>' : '<span>' + Lang.t('ke.free') + '</span>') + '</div>' +
                    '<button type="button" class="gk-key sm k-mint"></button>';
                const btn = GameUi.q(row, 'button');
                if (!z.unlocked) { btn.textContent = Lang.t('ke.tp.locked'); btn.classList.add('off', 'k-choc'); }
                else {
                    btn.textContent = Lang.t('ke.tp.go');
                    if (wins < price) btn.classList.add('nope');
                    btn.addEventListener('click', (e) => { e.stopPropagation(); gameUiDo(ctx, 'onTeleport', null, z.stage, true); });
                }
                box.appendChild(row);
            }
            ctx.body.scrollTop = keep;
        },
    },

    // ============================================================ Treadmills (стойка дорожек в хабе)
    treadmills: {
        title: 'ke.w.treadmills', icon: 'speed', cls: 'narrow', wallet: true,
        build(ctx) { ctx.body.innerHTML = '<div class="gk-list"></div>'; ctx.foot.innerHTML = '<p class="gk-note">' + GameUi.esc(Lang.t('ke.tm.lead')) + '</p>'; },
        render(ctx) {
            const P = GameUi.progress();
            const list = P ? P.treadmills() : [];
            const box = GameUi.q(ctx.body, '.gk-list'), wins = GameUi.wins();
            box.innerHTML = '';
            if (!list.length) box.innerHTML = '<p class="gk-note">' + GameUi.esc(Lang.t('ke.empty')) + '</p>';
            for (const t of list) {
                const price = Math.floor(t.price || 0);
                const row = GameUi.el('div', 'gk-row');
                row.innerHTML = '<div class="pic"><img src="' + GameUi.src('speed') + '" alt="" draggable="false"></div>' +
                    '<div class="mid"><b>' + GameUi.esc(t.name ? GameUi.text(t.name) : Lang.t('ke.tm.tier', { n: t.tier })) + '</b><small>' + GameUi.esc(GameUi.mult(t.mult)) + '</small></div>' +
                    (t.owned ? '' : '<div class="val">' + (price > 0 ? GameUi.ic('wins') + '<span>' + GameUi.fmt(price) + '</span>' : '<span>' + Lang.t('ke.free') + '</span>') + '</div>') +
                    '<button type="button" class="gk-key sm k-lemon"></button>';
                const btn = GameUi.q(row, 'button');
                if (t.owned) { btn.textContent = Lang.t('ke.tm.owned'); btn.classList.add('off', 'k-cream'); }
                else {
                    btn.textContent = Lang.t('ke.buy');
                    if (wins < price) btn.classList.add('nope');
                    btn.addEventListener('click', (e) => { e.stopPropagation(); gameUiDo(ctx, 'onBuyTreadmill', P ? (n) => P.buyTreadmill(n) : null, t.tier, false); });
                }
                box.appendChild(row);
            }
        },
    },

    // ============================================================ Top (рекорды по Speed)
    top: {
        title: 'ke.w.top', icon: 'top', cls: 'narrow', wallet: false,
        build(ctx) {
            ctx.body.innerHTML = '<div class="gk-list"></div>';
            ctx.foot.innerHTML = '<p class="gk-note">' + GameUi.esc(Lang.t('ke.top.lead')) + '</p>' +
                '<button type="button" class="gk-key k-mint" data-k="login" style="display:none"></button>';
            const b = GameUi.q(ctx.foot, '[data-k="login"]');
            b.textContent = Lang.t('ke.top.login');
            b.addEventListener('click', (e) => { e.stopPropagation(); GameUi.sfx('ui_click'); if (ctx.hud.cb.onLogin) ctx.hud.cb.onLogin(); });
        },
        render(ctx) {
            const rows = ctx.hud._board || [];
            const lb = GameUi.q(ctx.foot, '[data-k="login"]');
            if (lb) lb.style.display = ctx.hud._canLogin ? '' : 'none';
            const box = GameUi.q(ctx.body, '.gk-list');
            box.innerHTML = '';
            if (!rows.length) { box.innerHTML = '<p class="gk-note">' + GameUi.esc(Lang.t('ke.top.empty')) + '</p>'; return; }
            for (const r of rows.slice(0, 10)) {
                const rank = Math.floor(r.rank || 0);
                const row = GameUi.el('div', 'gk-row' + (r.me ? ' me' : '') + (rank >= 1 && rank <= 3 ? ' top' + rank : ''));
                row.innerHTML = '<div class="rk">' + (rank <= 3 && rank >= 1 ? ['', '🥇', '🥈', '🥉'][rank] : rank) + '</div>' +
                    (r.avatar ? '<img class="av" alt="" draggable="false" src="' + GameUi.esc(r.avatar) + '">' : '') +
                    '<div class="mid"><b>' + GameUi.esc(r.name || '') + (r.me ? ' (' + Lang.t('ke.top.you') + ')' : '') + '</b></div>' +
                    '<div class="val">' + GameUi.ic('speed') + '<span>' + GameUi.fmt(r.score) + '</span></div>';
                box.appendChild(row);
            }
        },
    },

    // ============================================================ Pause
    pause: {
        title: 'ke.w.pause', icon: 'pause', cls: 'tiny', wallet: false, noClose: true,
        build(ctx) {
            ctx.body.innerHTML = '<div class="gk-menu-col">' +
                '<button type="button" class="gk-key k-mint big" data-k="resume"></button>' +
                '<button type="button" class="gk-key k-blue" data-k="howto"></button>' +
                '<button type="button" class="gk-key k-lemon" data-k="settings"></button>' +
                '<button type="button" class="gk-key k-pink" data-k="top"></button>' +
                '<button type="button" class="gk-key k-choc" data-k="sound"></button></div>';
            const on = (k, fn) => GameUi.q(ctx.body, '[data-k="' + k + '"]').addEventListener('click', (e) => { e.stopPropagation(); GameUi.sfx('ui_click'); fn(); });
            on('resume', () => { if (ctx.hud.cb.onResume) ctx.hud.cb.onResume(); else ctx.hud.close(); });
            on('howto', () => { if (ctx.hud.cb.onHowTo) ctx.hud.cb.onHowTo(); });
            on('settings', () => ctx.hud.open('settings', { back: 'pause' }));
            on('top', () => ctx.hud.open('top', { back: 'pause' }));
            on('sound', () => { if (ctx.hud.cb.onSound) ctx.hud.cb.onSound(); ctx.refresh(); });
        },
        render(ctx) {
            const q = (k) => GameUi.q(ctx.body, '[data-k="' + k + '"]');
            q('resume').innerHTML = GameUi.ic('play') + '<span>' + GameUi.esc(Lang.t('ke.pause.resume')) + '</span>';
            q('howto').innerHTML = GameUi.ic('help') + '<span>' + GameUi.esc(Lang.t('tut.howto')) + '</span>';
            q('settings').innerHTML = GameUi.ic('settings') + '<span>' + GameUi.esc(Lang.t('ke.w.settings')) + '</span>';
            q('top').innerHTML = GameUi.ic('top') + '<span>' + GameUi.esc(Lang.t('ke.w.top')) + '</span>';
            q('sound').innerHTML = GameUi.ic(ctx.hud._sound ? 'sound' : 'sound-off') + '<span>' + GameUi.esc(Lang.t('ke.sound') + ': ' + Lang.t(ctx.hud._sound ? 'ke.on' : 'ke.off')) + '</span>';
        },
    },

    // ============================================================ Settings
    settings: {
        title: 'ke.w.settings', icon: 'settings', cls: 'narrow', wallet: false,
        build(ctx) {
            ctx.body.innerHTML = '<div class="gk-set">' +
                '<div class="gk-setrow"><b>' + GameUi.ic('sound') + '<span data-k="soundl"></span></b><button type="button" class="gk-key sm" data-k="sound"></button></div>' +
                '<div class="gk-setrow"><b>' + GameUi.ic('star') + '<span data-k="ql"></span></b><div class="gk-seg" data-k="q"></div></div>' +
                '<div class="gk-setrow" data-k="langrow"><b>' + GameUi.ic('help') + '<span data-k="langl"></span></b><div class="gk-seg" data-k="lang"></div></div></div>';
            GameUi.q(ctx.body, '[data-k="sound"]').addEventListener('click', (e) => { e.stopPropagation(); GameUi.sfx('ui_click'); if (ctx.hud.cb.onSound) ctx.hud.cb.onSound(); ctx.refresh(); });
            const qbox = GameUi.q(ctx.body, '[data-k="q"]');
            for (const c of ['auto', 'low', 'medium', 'high']) {
                const b = GameUi.el('button', 'gk-key k-choc'); b.type = 'button'; b.dataset.q = c;
                b.addEventListener('click', (e) => {
                    e.stopPropagation(); GameUi.sfx('ui_click');
                    try { if (typeof Quality !== 'undefined') Quality.set(c); } catch (err) { console.warn('Quality.set:', err); }
                    if (ctx.hud.cb.onQuality) ctx.hud.cb.onQuality(c);
                    ctx.refresh();
                });
                qbox.appendChild(b);
            }
            const lbox = GameUi.q(ctx.body, '[data-k="lang"]');
            for (const c of ['en', 'ru']) {
                const b = GameUi.el('button', 'gk-key k-choc', c === 'ru' ? 'RU' : 'EN'); b.type = 'button'; b.dataset.l = c;
                b.addEventListener('click', (e) => { e.stopPropagation(); GameUi.sfx('ui_click'); try { Platform.setLanguage(c); } catch (err) { console.warn('setLanguage:', err); } });
                lbox.appendChild(b);
            }
        },
        render(ctx) {
            const q = (k) => GameUi.q(ctx.body, '[data-k="' + k + '"]');
            q('soundl').textContent = Lang.t('ke.sound'); q('ql').textContent = Lang.t('ke.set.quality'); q('langl').textContent = Lang.t('ke.set.lang');
            const sb = q('sound');
            sb.textContent = Lang.t(ctx.hud._sound ? 'ke.on' : 'ke.off'); sb.classList.toggle('k-mint', !!ctx.hud._sound); sb.classList.toggle('k-choc', !ctx.hud._sound);
            const cur = typeof Quality !== 'undefined' ? Quality.choice : 'auto';
            for (const b of GameUi.qa(q('q'), 'button')) {
                b.textContent = Lang.t('ke.q.' + b.dataset.q);
                const on = b.dataset.q === cur;
                b.classList.toggle('k-mint', on); b.classList.toggle('k-choc', !on); b.classList.toggle('on', on);
            }
            const sw = typeof Platform !== 'undefined' && !!Platform.langSwitch;
            q('langrow').style.display = sw ? '' : 'none';
            for (const b of GameUi.qa(q('lang'), 'button')) { const on = b.dataset.l === Lang.code; b.classList.toggle('k-mint', on); b.classList.toggle('k-choc', !on); b.classList.toggle('on', on); }
        },
    },

    // ============================================================ Result (после Wins-пада)
    result: {
        title: 'ke.w.result', icon: 'wins', cls: 'tiny', wallet: false, noClose: true,
        build(ctx) {
            ctx.body.innerHTML = '<div class="gk-rw-in" style="display:flex;flex-direction:column;align-items:center;gap:.6em;text-align:center">' +
                '<h3 class="gk-o" style="margin:0;font:900 1.4em/1 var(--gk-font)" data-k="t"></h3>' +
                '<div class="big gk-o" style="font:700 2.8em/1 var(--gk-num);display:flex;align-items:center;gap:.2em"><span data-k="amt">+0</span>' + GameUi.ic('wins') + '</div>' +
                '<div class="gk-note" data-k="st"></div><div class="gk-note" data-k="dbl" style="color:var(--gk-mint-l)"></div></div>';
            ctx.foot.innerHTML = '<button type="button" class="gk-key k-mint big" data-k="cont"></button><button type="button" class="gk-key k-lemon" data-k="x2"></button>';
            const cb = ctx.hud._resultCb || {};
            ctx.data.busy = false; ctx.data.done = false;
            GameUi.q(ctx.foot, '[data-k="cont"]').addEventListener('click', (e) => {
                e.stopPropagation(); if (ctx.data.done) return; ctx.data.done = true; GameUi.sfx('ui_click');
                ctx.close();
                try { if (cb.onContinue) cb.onContinue(); } catch (err) { console.warn('GameHud result.onContinue:', err); }
            });
            GameUi.q(ctx.foot, '[data-k="x2"]').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (ctx.data.busy || ctx.data.done || ctx.data.doubled) return;
                if (typeof Platform !== 'undefined' && Platform.rewardedCooldownLeft() > 0) { GameUi.sfx('ui_deny'); return; }
                ctx.data.busy = true; ctx.refresh(); GameUi.sfx('ui_click');
                try { if (cb.onDouble) await cb.onDouble(); } catch (err) { console.warn('GameHud result.onDouble:', err); }
                ctx.data.busy = false; ctx.refresh();
            });
        },
        render(ctx) {
            const info = ctx.hud._result || { wins: 0 };
            const q = (k, root) => GameUi.q(root || ctx.body, '[data-k="' + k + '"]');
            q('t').textContent = Lang.t('ke.res.title');
            q('amt').textContent = '+' + GameUi.fmt(ctx.data.doubled ? ctx.data.newWins : info.wins);
            q('st').textContent = info.stage ? Lang.t('ke.res.stage', { n: info.stage }) + (info.stageName ? ' · ' + GameUi.text(info.stageName) : '') : '';
            q('dbl').textContent = ctx.data.doubled ? Lang.t('ke.res.doubled') : '';
            q('cont', ctx.foot).textContent = Lang.t('ke.res.cont');
            const x2 = q('x2', ctx.foot);
            const sup = typeof Platform === 'undefined' || Platform.rewardedSupported();
            const wait = typeof Platform !== 'undefined' ? Platform.rewardedCooldownLeft() : 0;
            x2.style.display = sup && !ctx.data.doubled && (ctx.hud._resultCb || {}).onDouble ? '' : 'none';
            x2.innerHTML = GameUi.ic('ad') + '<span>' + GameUi.esc(wait > 0 ? Platform.rewardedCooldownLabel() : Lang.t('ke.res.x2')) + '</span>';
            x2.classList.toggle('off', !!(ctx.data.busy || wait > 0));
        },
        tick(ctx) { GAME_UI_WINDOWS.result.render(ctx); },
    },
};
