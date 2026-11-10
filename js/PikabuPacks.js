// @ts-nocheck
// PikabuPacks.js — наборы за рубли в сборке Пикабу Игр (js/PikabuShop.js). Цены и названия товаров — в Студии
// (каталог CSV: coins_s 19 ₽, coins_m 49 ₽, coins_l 99 ₽, starter 29 ₽, no_ads 59 ₽), здесь — что игрок получает.
// Валюта — победы: Shop.addCoins (GameUiShop пересылает их в GameProgress.addWins), предметы — легендарки «за рекламу».
PikabuShop.setup({
    colors: ['#ff5fa2', '#8e5cff'],
    ready: () => !!(typeof GameUiShop !== 'undefined' && GameUiShop.ready && typeof Shop !== 'undefined' && Shop.state),
    visible: () => Game.state === 'menu',
    persist: () => Game.persist(),
    button: { corner: 'tr', x: 12, y: 74 },
    packs: [
        { id: 'coins_s', type: 'consumable', icon: '🍬', name: 'Горсть побед', desc: '300 побед на облики, шапки и питомцев', grant: () => Shop.addCoins(300) },
        { id: 'coins_m', type: 'consumable', icon: '🍭', name: 'Мешок побед', desc: '1 000 побед', grant: () => Shop.addCoins(1000) },
        { id: 'coins_l', type: 'consumable', icon: '🏆', name: 'Гора побед', desc: '3 000 побед — хватит на самые дорогие предметы', best: true, grant: () => Shop.addCoins(3000) },
        {
            id: 'starter', type: 'non_consumable', icon: '🍰', name: 'Сладкое королевство', best: 'Один раз',
            desc: '500 побед, облик «Лава-кейк», конфетная корона и шоколадный зайка',
            grant: () => Shop.addCoins(500),
            apply: () => ['skin_lavacake', 'hat_candy_crown', 'pet_choco_bunny'].forEach((id) => { if (!Shop.owns(id)) Shop.grant(id); }),
        },
        { id: 'no_ads', type: 'non_consumable', icon: '🚫', name: 'Без рекламы', desc: 'Убирает рекламу между забегами навсегда. Награды за рекламу остаются', noAds: true },
    ],
});
