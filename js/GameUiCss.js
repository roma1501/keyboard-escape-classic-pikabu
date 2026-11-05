// GameUiCss.js — оформление интерфейса «ASMR Keyboard Escape: Candy & Chocolate» (строки CSS, вставляются GameUi.install()).
// Образ: «кондитерская клавиатура». Панели — вафельные плитки шоколада с розовой глазурью, кнопки — толстые конфетные
// колпачки клавиш (глубина, блик, подсветка при нажатии), карточки предметов — сливочные «печенья» с рамкой редкости.
// Шрифт — Nunito (900) с обводкой, цифры — Fredoka; @font-face лежат в index.html (assets/fonts/nunito.ttf, fredoka.ttf).
// Единицы везде em: размер окна и HUD задаёт font-size корня (окна — по размеру экрана, блоки HUD — --hl-k от HudLayout).
//
// Переменная --ke-font (на :root) читает табличка мира в canvas (основная сессия) — менять её нельзя без согласования.

const GAME_UI_CSS = `
:root {
  --ke-font: "Nunito", system-ui, sans-serif;
  --gk-font: var(--ke-font);
  --gk-num: "Fredoka", "Nunito", system-ui, sans-serif;
  --gk-c9: #2a130a; --gk-c8: #3b1c10; --gk-c7: #4f2716; --gk-c6: #6b3a22; --gk-c5: #8c5434;
  --gk-cream: #fff3df; --gk-cream2: #ffdfb3; --gk-ink: #4a2314;
  --gk-pink: #ff5fa8; --gk-pink-l: #ff8fc4; --gk-pink-d: #b32a73; --gk-glaze: #ffb9d9;
  --gk-mint: #43e0b6; --gk-mint-l: #86f2d4; --gk-mint-d: #14876a;
  --gk-lemon: #ffd84a; --gk-lemon-l: #ffe98a; --gk-lemon-d: #b6820d;
  --gk-blue: #6f86ff; --gk-blue-l: #a1b1ff; --gk-blue-d: #3446b4;
  --gk-red: #ff5a5a; --gk-red-l: #ff8f8f; --gk-red-d: #a82424;
  --tut-bg: #4a2314; --tut-fg: #fff3df; --tut-accent: #43e0b6; --tut-border: #ffb9d9; --tut-font: var(--ke-font); --tut-radius: 18px; --tut-accent-bg: rgba(255,185,217,.22);
}
.gk-ui, .gk-ui * { box-sizing: border-box; }
.gk-ui { font-family: var(--gk-font); font-weight: 800; color: #fff; -webkit-tap-highlight-color: transparent; -webkit-font-smoothing: antialiased; }
.gk-ui img { -webkit-user-drag: none; user-select: none; }
.gk-ui button { font-family: inherit; }
.gk-o { -webkit-text-stroke: .17em var(--gk-c9); paint-order: stroke fill; text-shadow: 0 .09em 0 rgba(0,0,0,.4); letter-spacing: .01em; }
.gk-os { text-shadow: 0 .07em 0 var(--gk-c9), 0 -.05em 0 var(--gk-c9), .06em 0 0 var(--gk-c9), -.06em 0 0 var(--gk-c9), 0 .12em .12em rgba(0,0,0,.45); }
.gk-num { font-family: var(--gk-num); font-weight: 700; font-variant-numeric: tabular-nums; }
.gk-ic { display: inline-block; width: 1.5em; height: 1.5em; object-fit: contain; vertical-align: middle; pointer-events: none; filter: drop-shadow(0 .06em 0 rgba(0,0,0,.35)); }

/* ---- клавиша-колпачок ---- */
.gk-key {
  --k: var(--gk-pink); --kl: var(--gk-pink-l); --kd: var(--gk-pink-d); --kg: rgba(255,95,168,.85); --kt: #fff;
  position: relative; display: inline-flex; align-items: center; justify-content: center; gap: .4em;
  min-height: 2.6em; padding: .4em 1.1em .5em; margin: 0; border: 0; border-radius: .75em; cursor: pointer; color: var(--kt);
  font: 900 1em/1.05 var(--gk-font); text-align: center; white-space: nowrap;
  -webkit-tap-highlight-color: transparent; touch-action: manipulation; user-select: none; -webkit-user-select: none; outline: none;
  background: linear-gradient(180deg, var(--kl) 0, var(--k) 58%, var(--kd) 150%);
  box-shadow: 0 .3em 0 var(--kd), 0 .4em 0 var(--gk-c9), 0 .65em .55em rgba(0,0,0,.38), inset 0 .13em 0 rgba(255,255,255,.6), inset 0 -.1em 0 rgba(0,0,0,.16);
  transform: translateY(0); transition: transform .05s, box-shadow .05s, filter .12s;
  -webkit-text-stroke: .15em var(--gk-c9); paint-order: stroke fill; text-shadow: 0 .08em 0 rgba(0,0,0,.35);
}
.gk-key::before { content: ''; position: absolute; inset: .2em .25em .34em; border-radius: .55em; pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,.34), rgba(255,255,255,0) 58%); box-shadow: inset 0 .1em .3em rgba(0,0,0,.16); }
.gk-key > * { position: relative; }
.gk-key:hover { filter: brightness(1.07); }
.gk-key:active, .gk-key.on, .gk-key.lit {
  transform: translateY(.24em); filter: brightness(1.13) saturate(1.12);
  box-shadow: 0 .06em 0 var(--kd), 0 .14em 0 var(--gk-c9), 0 0 1.2em var(--kg), 0 0 .5em var(--kg), inset 0 .1em 0 rgba(255,255,255,.75);
}
.gk-key:focus-visible { box-shadow: 0 .3em 0 var(--kd), 0 .4em 0 var(--gk-c9), 0 0 0 .22em #fff, 0 0 0 .4em var(--gk-pink); }
.gk-key:disabled, .gk-key.off { filter: grayscale(.8) brightness(.78); cursor: default; transform: none; pointer-events: none; }
.gk-key.k-mint { --k: var(--gk-mint); --kl: var(--gk-mint-l); --kd: var(--gk-mint-d); --kg: rgba(67,224,182,.9); }
.gk-key.k-lemon { --k: var(--gk-lemon); --kl: var(--gk-lemon-l); --kd: var(--gk-lemon-d); --kg: rgba(255,216,74,.9); }
.gk-key.k-blue { --k: var(--gk-blue); --kl: var(--gk-blue-l); --kd: var(--gk-blue-d); --kg: rgba(111,134,255,.9); }
.gk-key.k-red { --k: var(--gk-red); --kl: var(--gk-red-l); --kd: var(--gk-red-d); --kg: rgba(255,90,90,.9); }
.gk-key.k-choc { --k: var(--gk-c6); --kl: var(--gk-c5); --kd: var(--gk-c8); --kg: rgba(255,185,217,.7); }
.gk-key.k-cream { --k: var(--gk-cream2); --kl: var(--gk-cream); --kd: #c99a62; --kg: rgba(255,243,223,.9); --kt: var(--gk-ink); -webkit-text-stroke: 0; text-shadow: 0 .06em 0 rgba(255,255,255,.7); }
.gk-key.big { min-height: 3.2em; font-size: 1.35em; padding: .45em 1.6em .6em; border-radius: .8em; }
.gk-key.sm { min-height: 2.15em; font-size: .88em; padding: .3em .8em .42em; }
.gk-key.sq { padding: 0; width: 2.9em; min-width: 0; height: 2.9em; min-height: 0; }
.gk-key.sq .gk-ic { width: 72%; height: 72%; }
.gk-key .gk-ic { width: 1.35em; height: 1.35em; }
.gk-key.wide { width: 100%; }
.gk-key.nope { filter: grayscale(.65) brightness(.85); }
body.gk-modal #obby-tags { display: none; }
.gk-dot { position: absolute; right: -.25em; top: -.3em; min-width: 1.35em; height: 1.35em; padding: 0 .3em; border-radius: 99em; background: var(--gk-red); color: #fff; font: 900 .75em/1.35em var(--gk-font); text-align: center;
  border: .15em solid #fff; box-shadow: 0 .1em 0 rgba(0,0,0,.4); -webkit-text-stroke: 0; text-shadow: none; pointer-events: none; animation: gk-dotpulse 1.2s ease-in-out infinite; z-index: 2; }
.gk-dot:empty { padding: 0; width: 1.2em; min-width: 0; }
@keyframes gk-dotpulse { 50% { transform: scale(1.18); } }

/* ---- вафельная панель ---- */
.gk-wafer {
  position: relative; color: #fff; border: .2em solid var(--gk-c9); border-radius: .95em;
  background:
    linear-gradient(180deg, rgba(255,230,190,.16), rgba(255,230,190,0) 38%),
    repeating-linear-gradient(0deg, rgba(0,0,0,.24) 0 .14em, rgba(0,0,0,0) .14em 1.15em),
    repeating-linear-gradient(90deg, rgba(0,0,0,.24) 0 .14em, rgba(0,0,0,0) .14em 1.15em),
    linear-gradient(135deg, #7b4529, #4a2314);
  box-shadow: 0 .26em 0 #1a0b05, 0 .5em .7em rgba(0,0,0,.35), inset 0 .14em 0 rgba(255,225,180,.4), inset 0 -.2em 0 rgba(0,0,0,.28);
}
.gk-glaze-bar { position: relative; background: linear-gradient(180deg, #ffd2e8, var(--gk-glaze) 55%, #ff9fcb); border-radius: .75em .75em 0 0; }
.gk-glaze-bar::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.55em; height: .6em; pointer-events: none;
  background: radial-gradient(circle at .6em 0, #ff9fcb 0 .52em, rgba(255,159,203,0) .56em) 0 0 / 1.3em .6em repeat-x; }

/* ---- окна ---- */
#gk-modal { position: fixed; inset: 0; z-index: 45; display: none; align-items: center; justify-content: center; pointer-events: auto;
  padding: max(env(safe-area-inset-top), 5px) max(env(safe-area-inset-right), 5px) max(env(safe-area-inset-bottom), 5px) max(env(safe-area-inset-left), 5px);
  background: radial-gradient(ellipse at 50% 40%, rgba(60,24,12,.5), rgba(18,7,3,.82)); }
#gk-modal.on { display: flex; }
.gk-win { position: relative; display: flex; flex-direction: column; width: min(100%, 62em); max-height: 100%; min-height: 0;
  font-size: clamp(10px, calc(min(3.2vw, 2.6vh) + 3px), 19px); animation: gk-winin .24s cubic-bezier(.2,1.35,.4,1) both; }
.gk-win.narrow { width: min(100%, 40em); }
.gk-win.tiny { width: min(100%, 30em); }
.gk-win.wide { width: min(100%, 70em); }
@keyframes gk-winin { from { transform: scale(.82) translateY(1.5em); opacity: 0; } to { transform: none; opacity: 1; } }
.gk-win > .gk-wafer-fill { display: contents; }
.gk-win-in { display: flex; flex-direction: column; min-height: 0; max-height: 100%; flex: 1; }
.gk-head { display: flex; align-items: center; gap: .6em; padding: .55em .7em .5em 1em; margin: -.2em -.2em 0; border-radius: .8em .8em 0 0; z-index: 2; flex: 0 0 auto; }
.gk-title { flex: 1; margin: 0; font: 900 1.7em/1 var(--gk-font); color: #fff; display: flex; align-items: center; gap: .35em; min-width: 0; }
.gk-title .gk-ic { width: 1.25em; height: 1.25em; flex: 0 0 auto; }
.gk-title span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gk-wallet { display: inline-flex; align-items: center; gap: .3em; padding: .25em .7em .25em .4em; border-radius: 99em; font: 700 1.15em/1 var(--gk-num); color: #fff;
  background: linear-gradient(180deg, #3a1a0e, #55291a); border: .14em solid var(--gk-c9); box-shadow: inset 0 .12em 0 rgba(255,225,180,.3), 0 .12em 0 rgba(0,0,0,.3); -webkit-text-stroke: .12em var(--gk-c9); paint-order: stroke fill; }
.gk-wallet .gk-ic { width: 1.4em; height: 1.4em; }
.gk-body { flex: 1 1 auto; min-height: 0; overflow: auto; padding: 1em .9em .9em; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: var(--gk-pink) rgba(0,0,0,.25); }
.gk-body::-webkit-scrollbar { width: .75em; }
.gk-body::-webkit-scrollbar-thumb { background: var(--gk-pink); border-radius: 99em; border: .15em solid var(--gk-c8); }
.gk-body::-webkit-scrollbar-track { background: rgba(0,0,0,.25); border-radius: 99em; }
.gk-foot { flex: 0 0 auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: .6em; padding: .3em .9em .9em; }
.gk-foot:empty { display: none; }
.gk-note { margin: 0; font-size: .9em; font-weight: 800; text-align: center; color: var(--gk-cream); opacity: .95; text-shadow: 0 .08em 0 rgba(0,0,0,.5); }
.gk-note.warn { color: var(--gk-lemon); }
.gk-tabs { display: flex; gap: .45em; padding: .85em .9em .2em; overflow-x: auto; flex: 0 0 auto; scrollbar-width: none; }
.gk-tabs::-webkit-scrollbar { display: none; }
.gk-tabs .gk-key { flex: 1 0 auto; min-height: 2.5em; }
.gk-tabs .gk-key .gk-ic { width: 1.5em; height: 1.5em; }

/* ---- сетка карточек ---- */
.gk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(9.6em, 1fr)); gap: .8em .7em; align-content: start; }
.gk-card {
  --rc: #c9a273; --rg: rgba(0,0,0,0); --rbg: rgba(255,255,255,.35);
  position: relative; display: flex; flex-direction: column; gap: .3em; padding: .5em .5em .6em; border-radius: .85em; color: var(--gk-ink); text-align: center; cursor: pointer;
  background: linear-gradient(180deg, #fff8ec, #ffe4c0); border: .22em solid var(--rc);
  box-shadow: 0 .24em 0 rgba(26,11,5,.8), 0 0 .9em var(--rg), inset 0 .1em 0 #fff; font-weight: 900; transition: transform .1s;
}
.gk-card:hover { transform: translateY(-.1em); }
.gk-card.sel { outline: .22em solid #fff; outline-offset: .08em; }
.gk-card[data-r="common"] { --rc: #c9a273; }
.gk-card[data-r="rare"] { --rc: #3fb6ff; --rg: rgba(63,182,255,.55); --rbg: rgba(63,182,255,.2); }
.gk-card[data-r="epic"] { --rc: #b259ff; --rg: rgba(178,89,255,.7); --rbg: rgba(178,89,255,.22); }
.gk-card[data-r="legendary"] { --rc: #ffae00; --rg: rgba(255,174,0,.85); --rbg: rgba(255,200,60,.3); }
.gk-card[data-r="mythic"] { --rc: #ff4fa3; --rg: rgba(255,79,163,.85); --rbg: rgba(255,120,200,.28); animation: gk-myth 3.2s linear infinite; }
@keyframes gk-myth { 0% { border-color: #ff4fa3; } 25% { border-color: #ffd84a; } 50% { border-color: #43e0b6; } 75% { border-color: #6f86ff; } 100% { border-color: #ff4fa3; } }
.gk-card .pic { position: relative; height: 5.3em; display: flex; align-items: center; justify-content: center; border-radius: .6em; overflow: hidden;
  background: radial-gradient(circle at 50% 38%, rgba(255,255,255,.9), rgba(255,255,255,0) 72%), var(--rbg); }
.gk-card .pic img.pimg { width: 4.7em; height: 4.7em; object-fit: contain; pointer-events: none; filter: drop-shadow(0 .1em .05em rgba(60,25,10,.4)); }
.gk-card .pic svg { height: 100%; width: auto; max-width: 100%; }
.gk-card .ph { font-size: 3em; line-height: 1; filter: drop-shadow(0 .05em 0 rgba(0,0,0,.25)); }
.gk-card .nm { font-size: .95em; line-height: 1.05; min-height: 2.1em; display: flex; align-items: center; justify-content: center; word-break: break-word; }
.gk-card .rr { font-size: .66em; letter-spacing: .06em; text-transform: uppercase; color: var(--rc); text-shadow: 0 .05em 0 rgba(0,0,0,.18); line-height: 1; }
.gk-card[data-r="common"] .rr { color: #9a7449; }
.gk-card .pr { display: flex; align-items: center; justify-content: center; gap: .25em; font: 700 1em/1.1 var(--gk-num); color: #8b3d12; min-height: 1.3em; }
.gk-card .pr .gk-ic { width: 1.25em; height: 1.25em; }
.gk-card .pr.mut { color: #7b5a3c; font-size: .85em; }
.gk-card .pr.bad { color: #c0392b; }
.gk-card .gk-key { width: 100%; min-height: 2.15em; font-size: .86em; }
.gk-card .fxdot { position: absolute; right: .35em; top: .35em; width: 1.8em; height: 1.8em; z-index: 2; }
.gk-card .badge { position: absolute; left: .3em; top: .3em; z-index: 2; padding: .15em .5em .2em; border-radius: 99em; font-size: .68em; line-height: 1.1; color: #fff; background: var(--gk-mint-d); border: .15em solid #fff; text-shadow: 0 .06em 0 rgba(0,0,0,.4); }
.gk-card.locked .pic { filter: saturate(.8); }
.gk-chip { display: inline-flex; align-items: center; gap: .25em; padding: .12em .55em .18em; border-radius: 99em; font: 700 .95em/1.1 var(--gk-num); color: #fff; background: var(--gk-mint-d); border: .13em solid var(--gk-c9); text-shadow: 0 .06em 0 rgba(0,0,0,.4); }
.gk-chip.pink { background: var(--gk-pink-d); }
.gk-chip.gold { background: var(--gk-lemon-d); }

/* ---- полоса ---- */
.gk-bar { position: relative; height: 1em; border-radius: 99em; overflow: hidden; background: #2a130a; border: .14em solid var(--gk-c9); box-shadow: inset 0 .14em .2em rgba(0,0,0,.6), 0 .08em 0 rgba(255,225,180,.25); }
.gk-bar > i { position: absolute; left: 0; top: 0; bottom: 0; width: 0; border-radius: 99em; transition: width .25s;
  background: repeating-linear-gradient(115deg, rgba(255,255,255,.28) 0 .5em, rgba(255,255,255,0) .5em 1em), linear-gradient(180deg, #ffd0e6, var(--gk-pink) 55%, var(--gk-pink-d)); box-shadow: inset 0 .12em 0 rgba(255,255,255,.55); }
.gk-bar.mint > i { background: repeating-linear-gradient(115deg, rgba(255,255,255,.28) 0 .5em, rgba(255,255,255,0) .5em 1em), linear-gradient(180deg, var(--gk-mint-l), var(--gk-mint) 55%, var(--gk-mint-d)); }

/* ---- списки (телепорт, рекорды, дорожки) ---- */
.gk-list { display: flex; flex-direction: column; gap: .6em; }
.gk-row { display: flex; align-items: center; gap: .7em; padding: .5em .7em; border-radius: .8em; color: var(--gk-ink); background: linear-gradient(180deg, #fff8ec, #ffe4c0); border: .2em solid #c9a273; box-shadow: 0 .2em 0 rgba(26,11,5,.8), inset 0 .1em 0 #fff; font-weight: 900; }
.gk-row .rk { flex: 0 0 2.2em; text-align: center; font: 700 1.35em/1 var(--gk-num); color: #8b3d12; }
.gk-row .av { flex: 0 0 2em; width: 2em; height: 2em; border-radius: 50%; object-fit: cover; border: .12em solid #fff; }
.gk-row .mid { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .1em; }
.gk-row .mid b { font-size: 1.05em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gk-row .mid small { font-size: .78em; color: #8a6544; font-weight: 800; }
.gk-row .val { display: inline-flex; align-items: center; gap: .3em; font: 700 1.15em/1 var(--gk-num); color: #8b3d12; }
.gk-row .val .gk-ic { width: 1.3em; height: 1.3em; }
.gk-row.me { background: linear-gradient(180deg, #d4fff0, #9ff0d6); border-color: var(--gk-mint-d); }
.gk-row.top1 { border-color: #ffae00; box-shadow: 0 .2em 0 rgba(26,11,5,.8), 0 0 .9em rgba(255,174,0,.7), inset 0 .1em 0 #fff; }
.gk-row.top2 { border-color: #b8c4d0; }
.gk-row.top3 { border-color: #d08a4a; }
.gk-row .gk-key { min-height: 2.2em; font-size: .88em; }
.gk-row.lockd { filter: saturate(.7); }
.gk-row .pic { width: 3em; height: 3em; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; }
.gk-row .pic img { width: 100%; height: 100%; object-fit: contain; }

/* ---- магазин: превью и сетка ---- */
.gk-body.ns { overflow: hidden; display: flex; padding: .2em .9em .6em; }
.gk-shop { display: grid; grid-template-columns: minmax(10em, 25%) 1fr; gap: .8em; min-height: 0; flex: 1 1 auto; width: 100%; overflow: hidden; }
.gk-shop .list { overflow: auto; min-height: 0; padding: .9em .3em .6em; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: var(--gk-pink) rgba(0,0,0,.25); }
.gk-shop .list::-webkit-scrollbar { width: .75em; }
.gk-shop .list::-webkit-scrollbar-thumb { background: var(--gk-pink); border-radius: 99em; border: .15em solid var(--gk-c8); }
.gk-pv { position: relative; display: flex; flex-direction: column; align-items: center; gap: .35em; padding: .5em .5em .7em; min-height: 0; overflow: hidden; border-radius: .9em; text-align: center;
  background: radial-gradient(ellipse at 50% 80%, rgba(255,185,217,.4), rgba(255,185,217,0) 65%), linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.18)); border: .17em solid var(--gk-c9); box-shadow: inset 0 .15em .4em rgba(0,0,0,.55); }
.gk-stage { position: relative; flex: 1 1 auto; width: 100%; min-height: 8em; display: flex; align-items: flex-end; justify-content: center; perspective: 40em; }
.gk-stage .figure { position: relative; height: 92%; aspect-ratio: 100 / 150; z-index: 2; }
.gk-stage .figure svg { width: 100%; height: 100%; overflow: visible; }
.gk-stage .hat { position: absolute; left: 50%; top: -3%; width: 62%; height: auto; transform: translate(-50%, 0); z-index: 3; pointer-events: none; filter: drop-shadow(0 .1em .1em rgba(0,0,0,.4)); }
.gk-stage .pet { position: absolute; right: -42%; bottom: 4%; width: 46%; z-index: 3; animation: gk-float 1.6s ease-in-out infinite; filter: drop-shadow(0 .15em .1em rgba(0,0,0,.4)); }
.gk-stage .keyplate { position: absolute; left: 50%; bottom: -.4em; width: 78%; height: 2.2em; transform: translateX(-50%); border-radius: .6em; z-index: 1;
  background: linear-gradient(180deg, var(--gc, #ff6fb5), color-mix(in srgb, var(--gc, #ff6fb5) 60%, #000)); box-shadow: 0 .3em 0 rgba(0,0,0,.5), 0 0 1.6em var(--gc, #ff6fb5), inset 0 .15em 0 rgba(255,255,255,.55); }
.gk-stage .fxlayer { position: absolute; inset: 0; pointer-events: none; z-index: 4; overflow: hidden; }
.gk-fxp { position: absolute; bottom: 8%; width: 1.1em; height: 1.1em; border-radius: 50%; opacity: 0; animation: gk-fxup 1.6s ease-out infinite; }
@keyframes gk-fxup { 0% { transform: translate(0, 0) scale(.5); opacity: 0; } 15% { opacity: 1; } 100% { transform: translate(var(--dx, 0), -6em) scale(1.1); opacity: 0; } }
@keyframes gk-float { 50% { transform: translateY(-.5em); } }
.gk-pv .nm { font: 900 1.1em/1.05 var(--gk-font); }
.gk-pv .rr { font-size: .72em; letter-spacing: .06em; text-transform: uppercase; }
.gk-pv .hint { font-size: .78em; opacity: .9; line-height: 1.15; }
.gk-mythic { background: linear-gradient(90deg, #ff4fa3, #ffd84a, #43e0b6, #6f86ff, #ff4fa3); background-size: 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-stroke: 0; animation: gk-rainbow 3s linear infinite; text-shadow: none; }
@keyframes gk-rainbow { to { background-position: 300% 0; } }
.gk-gl { position: relative; width: 4.4em; height: 4.4em; border-radius: .8em; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(180deg, var(--gc), color-mix(in srgb, var(--gc) 55%, #000)); box-shadow: 0 .25em 0 rgba(26,11,5,.75), 0 0 1.1em var(--gc), inset 0 .14em 0 rgba(255,255,255,.6); }
.gk-gl::before { content: ''; position: absolute; inset: .35em; border-radius: .55em; background: linear-gradient(180deg, rgba(255,255,255,.45), rgba(255,255,255,0) 70%); }
.gk-gl img { position: relative; width: 70%; height: 70%; object-fit: contain; }

/* ---- аватар и эмоции ---- */
.gk-av { overflow: visible; }
.gk-av g, .gk-av rect, .gk-av path, .gk-av polygon { transform-box: fill-box; }
.gk-av .av-armL, .gk-av .av-armR, .gk-av .av-legL, .gk-av .av-legR { transform-origin: 50% 0; }
.gk-av .av-all { transform-origin: 50% 100%; transform-box: view-box; }
.emo-wave .av-armR { animation: em-wave .55s ease-in-out infinite alternate; }
.emo-clap .av-armL { animation: em-clapL .35s ease-in-out infinite alternate; } .emo-clap .av-armR { animation: em-clapR .35s ease-in-out infinite alternate; }
.emo-jump .av-all, .emo-cheer .av-all, .emo-victory .av-all { animation: em-jump .6s ease-in-out infinite; }
.emo-cheer .av-armL, .emo-victory .av-armL { animation: em-upL .3s ease-in-out infinite alternate; } .emo-cheer .av-armR, .emo-victory .av-armR { animation: em-upR .3s ease-in-out infinite alternate; }
.emo-bow .av-all { animation: em-bow 1.1s ease-in-out infinite; }
.emo-shimmy .av-all, .emo-twist .av-all { animation: em-shim .32s ease-in-out infinite alternate; }
.emo-dance .av-all { animation: em-dance .5s ease-in-out infinite alternate; } .emo-dance .av-armL { animation: em-upL .25s ease-in-out infinite alternate; } .emo-dance .av-armR { animation: em-upR .25s .12s ease-in-out infinite alternate; }
.emo-floss .av-all { animation: em-shim .22s ease-in-out infinite alternate; } .emo-floss .av-armL, .emo-floss .av-armR { animation: em-floss .22s ease-in-out infinite alternate; }
.emo-spin .figure, .emo-headspin .figure { animation: em-spin 1.1s linear infinite; }
.emo-flip .av-all, .emo-backflip .av-all { transform-origin: 50% 55%; animation: em-flip 1.2s ease-in-out infinite; }
.emo-robot .av-all, .emo-moonwalk .av-all, .emo-zombie .av-all { animation: em-step .8s steps(4) infinite alternate; }
.emo-robot .av-armL, .emo-robot .av-armR, .emo-zombie .av-armL, .emo-zombie .av-armR { transform: rotate(-90deg); }
.emo-salute .av-armR { transform: rotate(-150deg) translateY(.2em); animation: em-salute .6s ease-in-out infinite alternate; }
.emo-kick .av-legR { animation: em-kick .5s ease-in-out infinite alternate; }
.emo-pose .av-all { animation: em-pose 1.4s ease-in-out infinite alternate; } .emo-pose .av-armL, .emo-pose .av-armR { transform: rotate(32deg); } .emo-pose .av-armL { transform: rotate(-32deg); }
@keyframes em-wave { from { transform: rotate(-150deg); } to { transform: rotate(-105deg); } }
@keyframes em-clapL { from { transform: rotate(-70deg); } to { transform: rotate(-35deg); } }
@keyframes em-clapR { from { transform: rotate(70deg); } to { transform: rotate(35deg); } }
@keyframes em-upL { from { transform: rotate(150deg); } to { transform: rotate(175deg); } }
@keyframes em-upR { from { transform: rotate(-150deg); } to { transform: rotate(-175deg); } }
@keyframes em-jump { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8%); } }
@keyframes em-bow { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(22deg); } }
@keyframes em-shim { from { transform: translateX(-4%) rotate(-4deg); } to { transform: translateX(4%) rotate(4deg); } }
@keyframes em-dance { from { transform: translateY(0) rotate(-6deg); } to { transform: translateY(-5%) rotate(6deg); } }
@keyframes em-floss { from { transform: rotate(-70deg); } to { transform: rotate(70deg); } }
@keyframes em-spin { to { transform: rotateY(360deg); } }
@keyframes em-flip { 0% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-14%) rotate(180deg); } 100% { transform: translateY(0) rotate(360deg); } }
@keyframes em-step { from { transform: translateX(-5%); } to { transform: translateX(5%); } }
@keyframes em-salute { from { transform: rotate(-150deg); } to { transform: rotate(-158deg); } }
@keyframes em-kick { from { transform: rotate(0); } to { transform: rotate(-65deg); } }
@keyframes em-pose { from { transform: translateY(0) scale(1); } to { transform: translateY(-2%) scale(1.04); } }

/* ---- подарок дня ---- */
.gk-days { display: grid; grid-template-columns: repeat(4, 1fr); gap: .7em; }
.gk-day { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: .25em; padding: .5em .3em .55em; border-radius: .85em; text-align: center; min-height: 8.6em;
  color: var(--gk-ink); background: linear-gradient(180deg, #fff8ec, #ffe4c0); border: .22em solid #c9a273; box-shadow: 0 .22em 0 rgba(26,11,5,.8), inset 0 .1em 0 #fff; font-weight: 900; }
.gk-day .dn { font-size: .85em; text-transform: uppercase; letter-spacing: .04em; color: #8a6544; }
.gk-day .di { height: 3.6em; display: flex; align-items: center; justify-content: center; }
.gk-day .di img { height: 100%; width: auto; max-width: 4.2em; object-fit: contain; filter: drop-shadow(0 .1em .05em rgba(60,25,10,.4)); }
.gk-day .di svg { height: 100%; width: auto; }
.gk-day .dl { font-size: .82em; line-height: 1.1; min-height: 2.2em; display: flex; align-items: center; justify-content: center; }
.gk-day .ds { font-size: .7em; text-transform: uppercase; color: var(--gk-mint-d); letter-spacing: .05em; min-height: 1em; }
.gk-day.today { border-color: var(--gk-mint-d); background: linear-gradient(180deg, #e9fff7, #b6f5df); animation: gk-todayglow 1.1s ease-in-out infinite alternate; }
@keyframes gk-todayglow { from { box-shadow: 0 .22em 0 rgba(26,11,5,.8), 0 0 .3em rgba(67,224,182,.5); } to { box-shadow: 0 .22em 0 rgba(26,11,5,.8), 0 0 1.4em rgba(67,224,182,1); } }
.gk-day.claimed { filter: saturate(.55) brightness(.92); }
.gk-day.claimed::after { content: ''; position: absolute; inset: 0; border-radius: .6em; background: url('assets/ui/icons/check.webp') center 42% / 3em no-repeat; }
.gk-day.d7 { grid-column: span 2; border-color: #ffae00; background: linear-gradient(180deg, #fff6d4, #ffe08a); box-shadow: 0 .22em 0 rgba(26,11,5,.8), 0 0 1.1em rgba(255,174,0,.8), inset 0 .1em 0 #fff; }
.gk-day.d7 .di { height: 5.2em; }
.gk-day .xl { position: absolute; right: .5em; top: -.5em; z-index: 3; padding: .12em .55em .18em; border-radius: 99em; font-size: .72em; color: #fff; background: linear-gradient(90deg, #ff4fa3, #ff9f1c); border: .15em solid #fff; text-shadow: 0 .06em 0 rgba(0,0,0,.4); }

/* ---- колесо ---- */
.gk-wheelbox { display: flex; flex-direction: column; align-items: center; gap: .8em; }
.gk-wheelwrap { position: relative; width: min(26em, 100%, calc(var(--wh, 70vh) - 14em)); aspect-ratio: 1; margin: .3em auto 0; }
.gk-wheelwrap canvas { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 50%; transform: rotate(0deg); will-change: transform; }
.gk-wheelwrap .rim { position: absolute; inset: -4%; border-radius: 50%; pointer-events: none; border: .5em solid var(--gk-c9);
  background: radial-gradient(circle, rgba(0,0,0,0) 62%, rgba(0,0,0,0) 100%); box-shadow: 0 .3em 0 #1a0b05, 0 0 0 .22em var(--gk-pink), inset 0 0 0 .22em var(--gk-glaze), 0 .8em 1.2em rgba(0,0,0,.45); }
.gk-wheelwrap .ptr { position: absolute; left: 50%; top: -9%; width: 14%; transform: translateX(-50%); z-index: 3; filter: drop-shadow(0 .15em 0 rgba(0,0,0,.5)); }
.gk-wheelwrap .hub { position: absolute; left: 50%; top: 50%; width: 17%; aspect-ratio: 1; transform: translate(-50%, -50%); z-index: 2; border-radius: 50%; border: .2em solid var(--gk-c9);
  background: radial-gradient(circle at 35% 30%, #fff, var(--gk-pink) 55%, var(--gk-pink-d)); box-shadow: 0 .15em 0 #1a0b05, inset 0 .1em .2em rgba(255,255,255,.8); }
.gk-lights { position: absolute; inset: -4%; pointer-events: none; z-index: 2; }
.gk-lights i { position: absolute; width: 3.4%; aspect-ratio: 1; border-radius: 50%; background: #fff7c2; box-shadow: 0 0 .5em #ffe36a; margin: -1.7%; animation: gk-blink 1s steps(1) infinite; }
.gk-lights i:nth-child(odd) { animation-delay: .5s; }
@keyframes gk-blink { 50% { background: #ff8fc4; box-shadow: 0 0 .5em #ff5fa8; } }
.gk-wheelbtns { display: flex; flex-wrap: wrap; justify-content: center; gap: .7em; }
.gk-wheelbtns .gk-key { min-width: 11em; flex-direction: column; gap: .1em; line-height: 1.05; padding-top: .45em; }
.gk-wheelbtns .gk-key small { font-size: .72em; opacity: .95; -webkit-text-stroke: .1em var(--gk-c9); }

/* ---- награда-попап ---- */
#gk-reward { position: fixed; inset: 0; z-index: 52; display: none; align-items: center; justify-content: center; pointer-events: auto; background: rgba(20,8,4,.6); font-size: clamp(11px, calc(min(3.2vw, 2.6vh) + 3px), 19px); }
#gk-reward.on { display: flex; }
.gk-rw { position: relative; min-width: min(20em, 92%); max-width: 92%; padding: 1.2em 1.6em 1.4em; text-align: center; display: flex; flex-direction: column; align-items: center; gap: .6em; animation: gk-winin .3s cubic-bezier(.2,1.5,.4,1) both; }
.gk-rw h3 { margin: 0; font: 900 1.8em/1 var(--gk-font); }
.gk-rw .big { font: 700 2.4em/1 var(--gk-num); display: flex; align-items: center; gap: .25em; }
.gk-rw .big .gk-ic { width: 1.3em; height: 1.3em; }
.gk-rw .sub { font-size: 1em; opacity: .95; }
.gk-rw .pic { width: 6em; height: 6em; display: flex; align-items: center; justify-content: center; animation: gk-float 1.6s ease-in-out infinite; }
.gk-rw .pic img, .gk-rw .pic svg { max-width: 100%; max-height: 100%; height: 100%; width: auto; }
.gk-rw .rays { position: absolute; left: 50%; top: 0; width: 22em; height: 22em; margin: -9em 0 0 -11em; z-index: -1; pointer-events: none; border-radius: 50%;
  background: repeating-conic-gradient(rgba(255,226,120,.4) 0 10deg, rgba(255,226,120,0) 10deg 20deg); -webkit-mask: radial-gradient(circle, #000 20%, transparent 70%); mask: radial-gradient(circle, #000 20%, transparent 70%); animation: gk-rot 14s linear infinite; }
@keyframes gk-rot { to { transform: rotate(360deg); } }
.gk-confetti { position: fixed; inset: 0; pointer-events: none; z-index: 53; overflow: hidden; }
.gk-confetti i { position: absolute; top: -5%; width: .7em; height: 1.2em; border-radius: .15em; animation: gk-conf 1.8s ease-in forwards; }
@keyframes gk-conf { to { transform: translate(var(--dx), 110vh) rotate(var(--r)); opacity: .9; } }

/* ---- настройки, пауза ---- */
.gk-set { display: flex; flex-direction: column; gap: .9em; }
.gk-setrow { display: flex; align-items: center; gap: .8em; padding: .6em .8em; border-radius: .8em; background: rgba(0,0,0,.28); border: .15em solid var(--gk-c9); box-shadow: inset 0 .12em .3em rgba(0,0,0,.4); flex-wrap: wrap; }
.gk-setrow > b { flex: 1 1 8em; font-size: 1.05em; display: flex; align-items: center; gap: .4em; }
.gk-seg { display: flex; gap: .4em; flex-wrap: wrap; }
.gk-seg .gk-key { min-height: 2.3em; font-size: .92em; }
.gk-menu-col { display: flex; flex-direction: column; align-items: center; gap: .9em; padding: .4em 0; }
.gk-menu-col .gk-key { min-width: min(17em, 80%); }

/* ---- Rebirth ---- */
.gk-rb { display: flex; flex-direction: column; align-items: center; gap: .9em; text-align: center; }
.gk-rb .mults { display: flex; align-items: center; justify-content: center; gap: .6em; flex-wrap: wrap; }
.gk-rb .mbox { display: flex; flex-direction: column; align-items: center; gap: .1em; padding: .5em 1.2em .6em; border-radius: .9em; background: rgba(0,0,0,.3); border: .15em solid var(--gk-c9); box-shadow: inset 0 .12em .3em rgba(0,0,0,.45); }
.gk-rb .mbox small { font-size: .78em; opacity: .9; }
.gk-rb .mbox b { font: 700 2.1em/1 var(--gk-num); }
.gk-rb .mbox.next b { color: var(--gk-mint-l); }
.gk-rb .arrow { width: 2.6em; height: 2.6em; }
.gk-rb .lvl { width: min(24em, 100%); display: flex; flex-direction: column; gap: .3em; }
.gk-rb .lvl > div { display: flex; justify-content: space-between; font-size: .95em; }
.gk-rb img.big { width: 6em; height: 6em; object-fit: contain; animation: gk-float 2s ease-in-out infinite; }

/* ---- Max Speed (ползунок-клавиша) ---- */
.gk-range { -webkit-appearance: none; appearance: none; width: 100%; height: 1.5em; margin: 0; background: transparent; touch-action: none; cursor: pointer; }
.gk-range::-webkit-slider-runnable-track { height: .85em; border-radius: 99em; background: linear-gradient(180deg, #1c0b05, #3a1a0e); border: .13em solid var(--gk-c9); box-shadow: inset 0 .12em .2em rgba(0,0,0,.7); }
.gk-range::-moz-range-track { height: .85em; border-radius: 99em; background: linear-gradient(180deg, #1c0b05, #3a1a0e); border: .13em solid var(--gk-c9); }
.gk-range::-webkit-slider-thumb { -webkit-appearance: none; width: 1.9em; height: 1.6em; margin-top: -.5em; border-radius: .5em; border: 0; background: linear-gradient(180deg, var(--gk-pink-l), var(--gk-pink) 60%, var(--gk-pink-d) 150%); box-shadow: 0 .22em 0 var(--gk-pink-d), 0 .3em 0 var(--gk-c9), inset 0 .1em 0 rgba(255,255,255,.65); }
.gk-range::-moz-range-thumb { width: 1.9em; height: 1.6em; border-radius: .5em; border: 0; background: var(--gk-pink); box-shadow: 0 .22em 0 var(--gk-pink-d), 0 .3em 0 var(--gk-c9); }
.gk-range:active::-webkit-slider-thumb { background: var(--gk-pink-l); box-shadow: 0 .06em 0 var(--gk-pink-d), 0 0 1em var(--gk-pink); transform: translateY(.18em); }

/* =================================================================== HUD */
#gh-hud { position: fixed; inset: 0; z-index: 20; pointer-events: none; display: none; }
#gh-hud.run { display: block; }
#gh-hud .gh-blk { position: fixed; font-size: calc(16px * var(--hl-k, 1)); pointer-events: none; display: none; }
#gh-hud.run .gh-blk { display: flex; }
#gh-hud .gh-blk.gk-wafer { padding: 0 .7em; align-items: center; gap: .55em; }
#gh-speed .gh-ic, #gh-wins .gh-ic { width: 2.5em; height: 2.5em; flex: 0 0 auto; margin: -.2em 0 -.2em -.2em; }
#gh-speed .col, #gh-wins .col { display: flex; flex-direction: column; min-width: 0; flex: 1; line-height: 1; }
#gh-speed .lab, #gh-wins .lab { font-size: .72em; letter-spacing: .12em; text-transform: uppercase; color: var(--gk-glaze); opacity: .98; }
#gh-speed .val { font: 700 2em/1 var(--gk-num); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#gh-wins .val { font: 700 1.55em/1 var(--gk-num); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#gh-speed .sub { font-size: .7em; opacity: .9; margin-left: auto; text-align: right; line-height: 1.1; }
#gh-level { flex-direction: column; justify-content: center; gap: .2em; padding: .25em .7em .3em !important; align-items: stretch !important; }
#gh-level .row { display: flex; align-items: center; justify-content: space-between; font-size: .85em; line-height: 1; gap: .5em; }
#gh-level .row b { color: var(--gk-lemon); }
#gh-level .gk-bar { height: .85em; flex: 0 0 auto; }
#gh-mult { gap: .45em; align-items: center; justify-content: flex-start; flex-wrap: nowrap; }
#gh-mult { overflow: hidden; }
#gh-mult .gk-chip { font-size: .95em; flex: 0 1 auto; white-space: nowrap; min-width: 0; }
#gh-mult .gk-chip.mx { background: var(--gk-mint-d); font-size: 1.25em; flex: 0 0 auto; }
#gh-btns { display: none; flex-direction: column; justify-content: space-between; gap: .5em; pointer-events: none; }
#gh-hud.run #gh-btns { display: grid; grid-template-columns: 1fr; grid-auto-rows: 1fr; }
.hl-low #gh-hud.run #gh-btns { grid-template-columns: 1fr 1fr; }
#gh-btns .gk-key { pointer-events: auto; flex-direction: column; justify-content: center; gap: .05em; min-height: 0; width: 100%; height: 100%; padding: .1em .1em .25em; font-size: .7em; border-radius: .9em; line-height: 1; }
#gh-btns .gk-key .gk-ic { width: 3em; height: 3em; flex: 0 0 auto; }
#gh-btns .gk-key span.lb { font-size: 1em; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.hl-low #gh-btns .gk-key span.lb { display: none; }
.hl-low #gh-btns .gk-key .gk-ic { width: 3.4em; height: 3.4em; }
#gh-btns .gk-key.glow { animation: gk-keyglow .9s ease-in-out infinite alternate; }
@keyframes gk-keyglow { from { box-shadow: 0 .3em 0 var(--kd), 0 .4em 0 var(--gk-c9), 0 0 .2em var(--kg); } to { box-shadow: 0 .3em 0 var(--kd), 0 .4em 0 var(--gk-c9), 0 0 1.4em var(--kg), 0 0 .6em var(--kg); } }
#gh-sys { gap: .6em; justify-content: flex-end; pointer-events: none; }
#gh-sys .gk-key { pointer-events: auto; flex: 0 0 auto; width: 3.1em; height: 3.1em; min-height: 0; padding: 0; font-size: 1em; }
#gh-sys .gk-key .gk-ic { width: 72%; height: 72%; }
#gh-max { flex-direction: column; justify-content: center; gap: .1em; padding: .3em .8em .35em !important; align-items: stretch !important; pointer-events: auto !important; }
#gh-max .row { display: flex; justify-content: space-between; align-items: center; gap: .5em; font-size: .78em; line-height: 1; white-space: nowrap; }
#gh-max .row > span { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
#gh-max .row b { font: 700 1.15em/1 var(--gk-num); color: var(--gk-lemon); }
#gh-max .gk-range { height: 1.6em; }
#gh-boost { pointer-events: none; align-items: stretch !important; padding: 0 !important; background: none !important; border: 0 !important; box-shadow: none !important; }
#gh-boost .gk-key { pointer-events: auto; width: 100%; height: 100%; min-height: 0; flex-direction: row; gap: .35em; font-size: .86em; line-height: 1; padding: .2em .5em .3em; }
#gh-boost .gk-key small { display: block; font-size: .74em; opacity: .95; }
#gh-boost .gk-key .t { display: flex; flex-direction: column; align-items: flex-start; }
#gh-boost .gk-key.act { animation: gk-keyglow .7s ease-in-out infinite alternate; }
#gh-stage { gap: .5em; justify-content: center; padding: 0 .8em !important; }
#gh-stage b { font: 900 1.25em/1 var(--gk-font); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
#gh-stage .req { flex: 0 0 auto; display: inline-flex; align-items: center; gap: .2em; font: 700 1em/1 var(--gk-num); padding: .15em .6em .2em .3em; border-radius: 99em; background: var(--gk-mint-d); border: .13em solid var(--gk-c9); }
#gh-stage .req.bad { background: var(--gk-red-d); }
#gh-stage .req .gk-ic { width: 1.3em; height: 1.3em; }
#gh-toast { justify-content: center; align-items: center; text-align: center; padding: 0 1em !important; opacity: 0; transition: opacity .2s, transform .2s; transform: translateY(-.4em); font-size: calc(16px * var(--hl-k, 1)); }
#gh-toast.show { opacity: 1; transform: none; }
#gh-toast span { font: 900 1.1em/1.1 var(--gk-font); }
#gh-zone { justify-content: center; align-items: center; background: none !important; border: 0 !important; box-shadow: none !important; padding: 0 !important; }
#gh-zone .zb { display: none; align-items: center; gap: .5em; padding: .35em 1.3em .45em; border-radius: 99em; font: 900 1.5em/1 var(--gk-font); border: .17em solid var(--gk-c9); box-shadow: 0 .22em 0 rgba(0,0,0,.45), inset 0 .12em 0 rgba(255,255,255,.5); animation: gk-zonein .35s cubic-bezier(.2,1.6,.4,1) both; white-space: nowrap; }
#gh-zone .zb.on { display: inline-flex; }
#gh-zone .zb.safe { background: linear-gradient(180deg, var(--gk-mint-l), var(--gk-mint) 60%, var(--gk-mint-d)); }
#gh-zone .zb.warn { background: linear-gradient(180deg, var(--gk-red-l), var(--gk-red) 60%, var(--gk-red-d)); }
#gh-zone .zb.stage { background: linear-gradient(180deg, var(--gk-pink-l), var(--gk-pink) 60%, var(--gk-pink-d)); }
#gh-zone .zb .gk-ic { width: 1.4em; height: 1.4em; }
@keyframes gk-zonein { from { transform: scale(.5); opacity: 0; } to { transform: none; opacity: 1; } }
#gh-chat { flex-direction: column; justify-content: flex-end; gap: .15em; overflow: hidden; padding: .4em .6em; font-size: calc(13px * var(--hl-k, 1)); font-weight: 800; background: rgba(42,19,10,.55); border-radius: .8em; border: .12em solid rgba(255,185,217,.35); }
#gh-chat:empty { display: none !important; }
#gh-chat div { text-shadow: 0 .08em .12em #000; line-height: 1.15; overflow-wrap: anywhere; }
#gh-chat b { margin-right: .4em; }
.hl-low #gh-chat { display: none !important; }
#gh-prompt { justify-content: center; align-items: center; display: none; }
#gh-hud.run #gh-prompt.show { display: flex; }
#gh-prompt { pointer-events: auto; cursor: pointer; }
#gh-hud #gh-prompt:not(.show) { display: none !important; }
.gk-skinpic { width: 100%; height: 100%; object-fit: contain; pointer-events: none; filter: drop-shadow(0 .2em .25em rgba(42,19,10,.35)); }
.gk-skinpic.big { height: 92%; }
/* кнопки окон — под палец: не ниже 40 px (в низком альбоме 36 px) */
.gk-ui .gk-win button.gk-key, .gk-ui .gk-win button { min-height: 46px !important; }
.hl-low .gk-ui .gk-win button.gk-key, .hl-low .gk-ui .gk-win button { min-height: 40px !important; }
/* узкий экран: вкладки магазина в две строки — все пять видны сразу */
@media (max-width: 560px) { .gk-tabs { flex-wrap: wrap !important; overflow: visible !important; justify-content: center; row-gap: .35em; } }
#gh-prompt:active span { transform: translateY(.12em); box-shadow: 0 .08em 0 rgba(0,0,0,.4); }
#gh-prompt span { padding: .3em 1.1em .4em; border-radius: .8em; font: 900 1.1em/1 var(--gk-font); background: rgba(42,19,10,.8); border: .15em solid var(--gk-glaze); box-shadow: 0 .2em 0 rgba(0,0,0,.4); white-space: nowrap; }
#gh-prompt kbd { font: inherit; padding: .05em .45em .12em; margin-right: .3em; border-radius: .35em; color: var(--gk-ink); background: var(--gk-cream); box-shadow: 0 .12em 0 #c99a62; -webkit-text-stroke: 0; text-shadow: none; }

/* всплывающее +N и баннеры */
#gk-fx { position: fixed; inset: 0; z-index: 25; pointer-events: none; overflow: hidden; font-size: 20px; }
.gk-plus { position: absolute; left: 0; top: 0; font: 900 1em/1 var(--gk-num); color: #fff; white-space: nowrap; will-change: transform, opacity; opacity: 0; -webkit-text-stroke: .2em var(--gk-c9); paint-order: stroke fill; text-shadow: 0 .1em 0 rgba(0,0,0,.4); animation: gk-plus .85s ease-out forwards; margin: -.5em 0 0 -1em; }
@keyframes gk-plus { 0% { opacity: 0; transform: translate(var(--px), var(--py)) scale(.5); } 15% { opacity: 1; transform: translate(var(--px), calc(var(--py) - 12px)) scale(1.15); } 100% { opacity: 0; transform: translate(var(--px), calc(var(--py) - 64px)) scale(1); } }
#gk-level { position: fixed; left: 0; right: 0; top: 22%; z-index: 26; display: none; justify-content: center; pointer-events: none; font-size: clamp(22px, calc(min(8vw, 9vh)), 70px); }
#gk-level.on { display: flex; }
#gk-level .lv { position: relative; padding: .15em .8em .25em; border-radius: .5em; font: 900 1em/1 var(--gk-font); background: linear-gradient(180deg, #ffe98a, #ffd84a 55%, #e89c10); border: .09em solid var(--gk-c9); box-shadow: 0 .1em 0 rgba(0,0,0,.45), 0 0 .6em rgba(255,216,74,.9); animation: gk-lvl 2s cubic-bezier(.2,1.5,.4,1) both; }
@keyframes gk-lvl { 0% { transform: scale(.3) rotate(-8deg); opacity: 0; } 18% { transform: scale(1.1) rotate(2deg); opacity: 1; } 28% { transform: scale(1) rotate(0); } 80% { transform: scale(1); opacity: 1; } 100% { transform: translateY(-.6em) scale(.95); opacity: 0; } }

/* =================================================================== меню-лобби */
#gk-menu { position: fixed; inset: 0; z-index: 35; display: none; flex-direction: column; align-items: center; justify-content: center; gap: 1em; padding: 1em; text-align: center; pointer-events: none;
  font-size: clamp(11px, calc(min(2.6vw, 3.6vh) + 3px), 22px);
  background: radial-gradient(ellipse at 50% 45%, rgba(40,15,8,.0) 0, rgba(40,15,8,.18) 55%, rgba(30,10,5,.62) 100%); }
#gk-menu.on { display: flex; }
#gk-menu.under { display: none; }
#gk-menu > * { pointer-events: none; }
#gk-menu .gk-key, #gk-menu .gk-mstats { pointer-events: auto; }
.gk-logo { display: flex; flex-direction: column; align-items: center; gap: .35em; animation: gk-logoin .7s cubic-bezier(.2,1.3,.4,1) both; }
.gk-logo .tag { padding: .12em .9em .2em; border-radius: 99em; font: 900 1.05em/1 var(--gk-font); background: var(--gk-mint); border: .14em solid var(--gk-c9); box-shadow: 0 .15em 0 rgba(0,0,0,.4); letter-spacing: .2em; }
.gk-logo .keys { display: flex; flex-wrap: nowrap; justify-content: center; gap: .18em; max-width: 100%; }
.gk-logo .keys span { --k: var(--gk-pink); --kd: var(--gk-pink-d); --kl: var(--gk-pink-l); width: 1.25em; height: 1.3em; display: inline-flex; align-items: center; justify-content: center; border-radius: .22em; font: 900 2.6em/1 var(--gk-font);
  background: linear-gradient(180deg, var(--kl), var(--k) 60%, var(--kd) 150%); box-shadow: 0 .06em 0 var(--kd), 0 .09em 0 var(--gk-c9), 0 .16em .12em rgba(0,0,0,.4), inset 0 .035em 0 rgba(255,255,255,.65); -webkit-text-stroke: .06em var(--gk-c9); paint-order: stroke fill; transform: rotate(var(--rot, 0deg)); }
.gk-logo .keys span:nth-child(3n+1) { --k: var(--gk-pink); --kl: var(--gk-pink-l); --kd: var(--gk-pink-d); --rot: -3deg; }
.gk-logo .keys span:nth-child(3n+2) { --k: var(--gk-mint); --kl: var(--gk-mint-l); --kd: var(--gk-mint-d); --rot: 2deg; }
.gk-logo .keys span:nth-child(3n) { --k: var(--gk-lemon); --kl: var(--gk-lemon-l); --kd: var(--gk-lemon-d); --rot: -1deg; }
.gk-logo .keys span.sp { width: .5em; height: .1em; background: none; box-shadow: none; -webkit-text-stroke: 0; }
.gk-logo .keys.r2 span { font-size: 2.1em; }
/* строка клавиш всегда в одну линию: на узком экране клавиши мельче (по числу букв --n) */
.gk-logo .keys span { font-size: min(2.6em, calc(88vw / (var(--n, 8) * 1.5))); }
.gk-logo .keys.r2 span { font-size: min(2.1em, calc(88vw / (var(--n, 8) * 1.5))); }
.gk-logo .sub { margin-top: .2em; padding: .2em 1.1em .3em; border-radius: .7em; font: 900 1.25em/1 var(--gk-font); color: #fff; background: linear-gradient(180deg, #7b4529, #4a2314); border: .15em solid var(--gk-c9); box-shadow: 0 .2em 0 rgba(0,0,0,.45), inset 0 .1em 0 rgba(255,225,180,.4); }
@keyframes gk-logoin { from { transform: translateY(-1.5em) scale(.8); opacity: 0; } to { transform: none; opacity: 1; } }
.gk-mstats { display: flex; gap: .6em; flex-wrap: wrap; justify-content: center; }
.gk-mstats .st { display: flex; align-items: center; gap: .4em; padding: .3em .9em .35em .4em; font-size: 1.05em; }
.gk-mstats .st .gk-ic { width: 1.9em; height: 1.9em; margin: -.3em 0; }
.gk-mstats .st .c { display: flex; flex-direction: column; line-height: 1; text-align: left; }
.gk-mstats .st .c small { font-size: .62em; letter-spacing: .1em; color: var(--gk-glaze); text-transform: uppercase; }
.gk-mstats .st .c b { font: 700 1.35em/1.05 var(--gk-num); }
#gk-menu .play { min-width: min(9.5em, 86vw); min-height: 2.4em; font-size: 1.9em; border-radius: .7em; animation: gk-playpulse 1.6s ease-in-out infinite; }
@keyframes gk-playpulse { 50% { transform: scale(1.04); } }
#gk-menu .play:active { animation: none; }
#gk-menu .row { display: flex; gap: .7em; flex-wrap: wrap; justify-content: center; }
#gk-menu .row .gk-key { min-width: 0; }
.gk-mhint { font-size: .8em; opacity: .9; max-width: 26em; line-height: 1.15; }
.hl-low #gk-menu .gk-mhint, .gk-short .gk-mhint { display: none; }
@media (max-height: 420px) {
  #gk-menu { gap: .45em; padding: .4em; }
  .gk-logo .tag { display: none; }
  .gk-logo .keys span { font-size: 1.9em; } .gk-logo .keys.r2 span { font-size: 1.5em; }
  .gk-logo .sub { font-size: .95em; margin-top: 0; }
  #gk-menu .play { font-size: 1.4em; min-height: 2.5em; }
  .gk-mstats .st { padding: .15em .7em .2em .3em; }
}
@media (max-height: 340px) { .gk-logo .sub { display: none; } }

/* ---- адаптация окон ---- */
@media (max-aspect-ratio: 1/1) {
  .gk-title { font-size: 1.35em; }
  .gk-wallet { font-size: 1em; }
  .gk-shop { grid-template-columns: 1fr; grid-template-rows: 9.2em 1fr; }
  .gk-shop .gk-pv { flex-direction: row; align-items: center; justify-content: flex-start; padding: .4em .7em; gap: .8em; text-align: left; }
  .gk-shop .gk-pv .gk-stage { flex: 0 0 8em; width: 8em; min-height: 0; height: 100%; }
  .gk-shop .gk-pv .pv-info { flex: 1; display: flex; flex-direction: column; gap: .25em; }
  .gk-days { grid-template-columns: repeat(3, 1fr); }
  .gk-day.d7 { grid-column: span 3; }
}
@media (max-height: 420px) and (min-aspect-ratio: 1/1) {
  .gk-win { font-size: clamp(10px, calc(min(2.2vw, 3.1vh) + 1px), 15px); }
  .gk-head { padding-top: .35em; padding-bottom: .3em; }
  .gk-title { font-size: 1.45em; }
  .gk-shop { grid-template-columns: minmax(8em, 22%) 1fr; }
  .gk-tabs { padding: .5em .7em .1em; gap: .35em; }
  .gk-tabs .gk-key { min-height: 2em; font-size: .85em; padding-top: .2em; padding-bottom: .3em; }
  .gk-tabs .gk-key .gk-ic { width: 1.3em; height: 1.3em; }
  .gk-card .pic { height: 3.4em; }
  .gk-card .pic img.pimg { width: 3.1em; height: 3.1em; }
  .gk-card { padding: .35em .4em .45em; gap: .15em; }
  .gk-card .nm { min-height: 1.5em; font-size: .85em; }
  .gk-card .rr { display: none; }
  .gk-card .gk-key { min-height: 1.9em; }
  .gk-body { padding: .8em .7em .6em; }
  .gk-body.ns { padding: .1em .7em .4em; }
  .gk-stage { min-height: 5em; }
  .gk-pv .rr, .gk-pv .hint { display: none; }
  .gk-wallet { font-size: 1em; }
  .gk-head .gk-key.sq { width: 2.4em; height: 2.4em; }
  .gk-days { grid-template-columns: repeat(7, 1fr); gap: .35em; }
  .gk-day.d7 { grid-column: span 1; }
  .gk-day { min-height: 6.5em; padding: .3em .15em .35em; }
  .gk-day .dl { font-size: .72em; }
  .gk-day .di { height: 2.6em; }
  .gk-wheelwrap { width: min(18em, 46vh); }
  .gk-wheelbox { flex-direction: row; align-items: center; justify-content: center; gap: 1.5em; }
  .gk-wheelbtns { flex-direction: column; }
}
@media (max-height: 540px) and (min-aspect-ratio: 1/1) {
  .gk-days { grid-template-columns: repeat(7, 1fr); gap: .4em; }
  .gk-day.d7 { grid-column: span 1; }
  .gk-day { min-height: 7em; padding: .35em .15em .4em; }
  .gk-day .dl { font-size: .74em; min-height: 1.8em; }
  .gk-day .di { height: 2.8em; }
  .gk-day.d7 .di { height: 2.8em; }
  .gk-day .xl { font-size: .6em; }
  .gk-card .pic { height: 4.2em; }
  .gk-card .pic img.pimg { width: 3.8em; height: 3.8em; }
  .gk-card .nm { min-height: 1.7em; font-size: .9em; }
  .gk-grid { grid-template-columns: repeat(auto-fill, minmax(8.4em, 1fr)); gap: .6em .5em; }
  .gk-foot { padding-bottom: .6em; gap: .4em; }
  .gk-foot .gk-key.big { font-size: 1.1em; }
  .gk-tabs { padding-top: .6em; }
}
@media (prefers-reduced-motion: reduce) { .gk-key, .gk-card, .gk-win, #gk-menu .play { animation: none !important; transition: none !important; } }
`;

// Карточка обучения (Tutorial.js) в стиле игры: вафельная плитка с розовой глазурью. Селекторы с html — перебивают CSS модуля (он вставляется позже).
const GAME_TUT_CSS = `
html .lory-tut-card { border: .2em solid var(--gk-c9, #2a130a); border-radius: 16px; padding: 10px 16px;
  background: linear-gradient(180deg, rgba(255,230,190,.16), rgba(255,230,190,0) 38%), repeating-linear-gradient(0deg, rgba(0,0,0,.24) 0 2px, rgba(0,0,0,0) 2px 18px), repeating-linear-gradient(90deg, rgba(0,0,0,.24) 0 2px, rgba(0,0,0,0) 2px 18px), linear-gradient(135deg, #7b4529, #4a2314);
  box-shadow: 0 5px 0 #1a0b05, 0 0 0 3px #ffb9d9, 0 10px 18px rgba(0,0,0,.4), inset 0 2px 0 rgba(255,225,180,.4); }
html .lory-tut-card.lory-tut-ok { border-color: #1a0b05; box-shadow: 0 5px 0 #1a0b05, 0 0 0 3px #43e0b6, 0 0 16px rgba(67,224,182,.8), inset 0 2px 0 rgba(255,225,180,.4); }
html .lory-tut-title { font-weight: 900; color: #fff; -webkit-text-stroke: 3px #2a130a; paint-order: stroke fill; text-shadow: 0 2px 0 rgba(0,0,0,.4); }
html .lory-tut-hint { font-weight: 800; color: #fff3df; text-shadow: 0 2px 0 #2a130a, 0 0 3px #2a130a; }
html .lory-tut-key { color: #4a2314; background: #fff3df; box-shadow: 0 3px 0 #c99a62, 0 4px 0 #2a130a; border-radius: .45em; }
html .lory-tut-bar { background: rgba(0,0,0,.4); border: 2px solid #2a130a; height: 10px; }
html .lory-tut-skip { color: #fff; border: 3px solid #2a130a; border-radius: 12px; background: linear-gradient(180deg, #ff8fc4, #ff5fa8 60%, #b32a73 150%); box-shadow: 0 4px 0 #b32a73, 0 5px 0 #2a130a, inset 0 2px 0 rgba(255,255,255,.55);
  -webkit-text-stroke: 2px #2a130a; paint-order: stroke fill; font-weight: 900; }
html .lory-tut-skip:active { transform: translateY(3px); box-shadow: 0 1px 0 #b32a73, 0 2px 0 #2a130a, 0 0 14px #ff5fa8; }
html .lory-tut-skip kbd { -webkit-text-stroke: 0; color: #4a2314; background: #fff3df; }
html .lory-tut-final { border: 3px solid #2a130a; background: linear-gradient(135deg, #7b4529, #4a2314); box-shadow: 0 4px 0 #1a0b05, 0 0 0 3px #43e0b6; -webkit-text-stroke: 2px #2a130a; paint-order: stroke fill; }
`;
