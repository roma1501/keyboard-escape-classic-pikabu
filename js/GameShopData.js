// GameShopData.js — данные косметики «ASMR Keyboard Escape: Candy & Chocolate»: вкладки магазина, предметы, награды Daily Gift,
// секторы колеса. Валюта везде — Wins (Shop.coins синхронизирует GameUiShop). Поля предметов — контракт docs/GAME-DESIGN.md:
//   skin:  look { skin, shirt, pants, hair: 'short'|'spiky'|'long'|'none', hairColor, cap (−1 — нет) }
//   hat:   модель hats/<id>.glb (папка моделей), иконка ui/shop/hats/<id>.webp   (id предмета = 'hat_<id>')
//   pet:   модель pets/<id>.glb (папка моделей), иконка ui/shop/pets/<id>.webp   (id предмета = 'pet_<id>')
//   glow:  glow { color, fx: 'none'|'sparkle'|'hearts'|'stars'|'rainbow'|'fire'|'bubbles' }  — цвет и эффект нажатой клавиши
//   emote: emote — ключ анимации блочного героя (20 ключей): wave clap jump bow cheer shimmy spin dance robot moonwalk salute
//          twist kick flip floss zombie backflip headspin pose victory (неизвестный ключ игра может заменить на 'cheer')
//   rarity: common | rare | epic | legendary | mythic;  у rare+ есть fx: 'sparkle'|'stars'|'hearts'|'rainbow'|'fire'|'bubbles'
// Эксклюзивы Daily Gift (день 7): skin_daily_* с exclusive: 'daily' — не продаются и не выпадают на колесе.
// Правило каталога (Shop.validate): 5 вкладок, 20+ предметов, ≈35% за Wins и ≈65% за рекламу (default и exclusive не считаются).

// 'mythic' нет в Shop.RARITIES движка: добавляем (порядок = ценность, вес выпадения на колесе малый, подпись ru/en).
if (typeof Shop !== 'undefined') {
    if (Shop.RARITIES.indexOf('mythic') < 0) Shop.RARITIES.push('mythic');
    /** @type {any} */ (Shop.RARITY_WEIGHT).mythic = 0.25;
}
Object.assign(LANG_STRINGS.ru, { 'shop.rarity.mythic': 'Мифический', 'shop.tab.skins': 'Скины', 'shop.tab.hats': 'Шапки', 'shop.tab.pets': 'Питомцы', 'shop.tab.glow': 'Свечение', 'shop.tab.emotes': 'Эмоции' });
Object.assign(LANG_STRINGS.en, { 'shop.rarity.mythic': 'Mythic', 'shop.tab.skins': 'Skins', 'shop.tab.hats': 'Hats', 'shop.tab.pets': 'Pets', 'shop.tab.glow': 'Glow', 'shop.tab.emotes': 'Emotes' });

/** Вкладки магазина: id совпадает со слотом (skin / hat / pet / glow / emote — через slot у предметов). */
const SHOP_TABS = [
    { id: 'skins', name: { ru: 'Скины', en: 'Skins' }, icon: 'skin' },
    { id: 'hats', name: { ru: 'Шапки', en: 'Hats' }, icon: 'hat' },
    { id: 'pets', name: { ru: 'Питомцы', en: 'Pets' }, icon: 'pet' },
    { id: 'glow', name: { ru: 'Свечение', en: 'Glow' }, icon: 'glow' },
    { id: 'emotes', name: { ru: 'Эмоции', en: 'Emotes' }, icon: 'hand' },
];

/** @type {any[]} */
const SHOP_ITEMS_SKINS = [
    { id: 'skin_default', tab: 'skins', slot: 'skin', name: { ru: 'Конфетчик', en: 'Candy Kid' }, rarity: 'common', look: { skin: 0xffd9bf, shirt: 0xff5fa8, pants: 0x5b3a29, hair: 'short', hairColor: 0x4a2c1a, cap: -1 }, default: true },
    { id: 'skin_mintchip', tab: 'skins', slot: 'skin', name: { ru: 'Мятная крошка', en: 'Mint Chip' }, rarity: 'common', price: { coins: 30 }, look: { skin: 0xffe0c8, shirt: 0x6fe3c1, pants: 0xf2f2f2, hair: 'spiky', hairColor: 0x2b2f3a, cap: -1 } },
    { id: 'skin_berry', tab: 'skins', slot: 'skin', name: { ru: 'Ягодка', en: 'Berry' }, rarity: 'common', price: { ads: 1 }, look: { skin: 0xf1c9a5, shirt: 0xb04fd6, pants: 0x3b2a5a, hair: 'long', hairColor: 0x2a1740, cap: -1 } },
    { id: 'skin_lemonade', tab: 'skins', slot: 'skin', name: { ru: 'Лимонад', en: 'Lemonade' }, rarity: 'common', price: { coins: 40 }, look: { skin: 0xffe3c9, shirt: 0xfff176, pants: 0xffffff, hair: 'short', hairColor: 0xc9a24a, cap: 0xff7043 } },
    { id: 'skin_cocoa', tab: 'skins', slot: 'skin', name: { ru: 'Какао', en: 'Cocoa' }, rarity: 'common', price: { ads: 1 }, look: { skin: 0xc68e65, shirt: 0x7b4a2d, pants: 0xefe2cf, hair: 'short', hairColor: 0x20140c, cap: -1 } },
    { id: 'skin_peach', tab: 'skins', slot: 'skin', name: { ru: 'Персик', en: 'Peach' }, rarity: 'common', price: { coins: 50 }, look: { skin: 0xffd0b0, shirt: 0xffa97a, pants: 0xffffff, hair: 'long', hairColor: 0x7a3b1c, cap: -1 } },
    { id: 'skin_blueberry', tab: 'skins', slot: 'skin', name: { ru: 'Черничный маффин', en: 'Blueberry Muffin' }, rarity: 'common', price: { ads: 1 }, look: { skin: 0xe9bf9b, shirt: 0x4f6bd8, pants: 0x3a3f5c, hair: 'spiky', hairColor: 0x1a1a40, cap: 0xf2e6d0 } },
    { id: 'skin_cherrychef', tab: 'skins', slot: 'skin', name: { ru: 'Вишнёвый повар', en: 'Cherry Chef' }, rarity: 'rare', price: { ads: 2 }, look: { skin: 0xffe0c8, shirt: 0xffffff, pants: 0x37474f, hair: 'none', hairColor: 0x000000, cap: 0xffffff }, fx: 'sparkle' },
    { id: 'skin_waferranger', tab: 'skins', slot: 'skin', name: { ru: 'Вафельный рейнджер', en: 'Wafer Ranger' }, rarity: 'rare', price: { coins: 120 }, look: { skin: 0xd9a574, shirt: 0xe0b15c, pants: 0x8a5a2b, hair: 'short', hairColor: 0x3a2410, cap: 0xb8793b }, fx: 'sparkle' },
    { id: 'skin_jellypop', tab: 'skins', slot: 'skin', name: { ru: 'Джелли-поп', en: 'Jelly Pop' }, rarity: 'rare', price: { ads: 2 }, look: { skin: 0xb8f2e6, shirt: 0xff6f91, pants: 0x845ec2, hair: 'spiky', hairColor: 0xffc75f, cap: -1 }, fx: 'sparkle' },
    { id: 'skin_liquorice', tab: 'skins', slot: 'skin', name: { ru: 'Лакричный ниндзя', en: 'Liquorice Ninja' }, rarity: 'rare', price: { coins: 150 }, look: { skin: 0xf0c8a0, shirt: 0x1c1c1c, pants: 0x2a2a2a, hair: 'none', hairColor: 0x000000, cap: 0x111111 }, fx: 'sparkle' },
    { id: 'skin_marshmallow', tab: 'skins', slot: 'skin', name: { ru: 'Зефирка', en: 'Marshmallow' }, rarity: 'rare', price: { ads: 3 }, look: { skin: 0xfff1f5, shirt: 0xffffff, pants: 0xffc2d9, hair: 'long', hairColor: 0xffffff, cap: -1 }, fx: 'sparkle' },
    { id: 'skin_caramelracer', tab: 'skins', slot: 'skin', name: { ru: 'Карамельный гонщик', en: 'Caramel Racer' }, rarity: 'rare', price: { ads: 3 }, look: { skin: 0xe8b58a, shirt: 0xd9822b, pants: 0x4a2f1b, hair: 'short', hairColor: 0x1b1b1b, cap: 0xff9f1c }, fx: 'sparkle' },
    { id: 'skin_rainbowpop', tab: 'skins', slot: 'skin', name: { ru: 'Радужный поп', en: 'Rainbow Pop' }, rarity: 'epic', price: { ads: 4 }, look: { skin: 0xffe0c8, shirt: 0xff4d6d, pants: 0x4cc9f0, hair: 'spiky', hairColor: 0xf9c74f, cap: -1 }, fx: 'rainbow' },
    { id: 'skin_chocoking', tab: 'skins', slot: 'skin', name: { ru: 'Шоколадный король', en: 'Choco King' }, rarity: 'epic', price: { coins: 450 }, look: { skin: 0xf3d2b3, shirt: 0x4a2a18, pants: 0x2b190e, hair: 'short', hairColor: 0x2b190e, cap: 0xffc933 }, fx: 'sparkle' },
    { id: 'skin_cottoncloud', tab: 'skins', slot: 'skin', name: { ru: 'Облако из ваты', en: 'Cotton Cloud' }, rarity: 'epic', price: { ads: 4 }, look: { skin: 0xffe8ef, shirt: 0xbde0fe, pants: 0xffc8dd, hair: 'long', hairColor: 0xa2d2ff, cap: -1 }, fx: 'bubbles' },
    { id: 'skin_gingerbread', tab: 'skins', slot: 'skin', name: { ru: 'Пряничный человечек', en: 'Gingerbread' }, rarity: 'epic', price: { coins: 600 }, look: { skin: 0xc47a3d, shirt: 0xb9692a, pants: 0xfff3d6, hair: 'none', hairColor: 0x000000, cap: -1 }, fx: 'sparkle' },
    { id: 'skin_mintfrost', tab: 'skins', slot: 'skin', name: { ru: 'Мятный лёд', en: 'Mint Frost' }, rarity: 'epic', price: { ads: 4 }, look: { skin: 0xdaf6ff, shirt: 0x7ee8d0, pants: 0xffffff, hair: 'spiky', hairColor: 0xe0fbff, cap: -1 }, fx: 'stars' },
    { id: 'skin_sprinklequeen', tab: 'skins', slot: 'skin', name: { ru: 'Принцесса посыпка', en: 'Sprinkle Princess' }, rarity: 'legendary', price: { ads: 5 }, look: { skin: 0xffe1d6, shirt: 0xff8fd0, pants: 0xfff0a8, hair: 'long', hairColor: 0xff5fa8, cap: 0xffd54f }, fx: 'hearts' },
    { id: 'skin_lavacake', tab: 'skins', slot: 'skin', name: { ru: 'Лава-кейк', en: 'Lava Cake' }, rarity: 'legendary', price: { ads: 5 }, look: { skin: 0xf0b896, shirt: 0xff4d1c, pants: 0x3b1d12, hair: 'spiky', hairColor: 0xffb703, cap: -1 }, fx: 'fire' },
    { id: 'skin_galaxycandy', tab: 'skins', slot: 'skin', name: { ru: 'Галактическая конфета', en: 'Galaxy Candy' }, rarity: 'legendary', price: { ads: 5 }, look: { skin: 0xcdb4ff, shirt: 0x3a0ca3, pants: 0x7209b7, hair: 'long', hairColor: 0xf72585, cap: -1 }, fx: 'stars' },
    { id: 'skin_goldwrapper', tab: 'skins', slot: 'skin', name: { ru: 'Золотая обёртка', en: 'Golden Wrapper' }, rarity: 'legendary', price: { coins: 2500 }, look: { skin: 0xfff0c2, shirt: 0xffc800, pants: 0xd99100, hair: 'short', hairColor: 0xfff3b0, cap: 0xffe066 }, fx: 'sparkle' },
    { id: 'skin_sugardragon', tab: 'skins', slot: 'skin', name: { ru: 'Сахарный дракон', en: 'Sugar Dragon' }, rarity: 'mythic', price: { ads: 5 }, look: { skin: 0xb7f5c8, shirt: 0xff6bd6, pants: 0x6a4cff, hair: 'spiky', hairColor: 0x2ee6a6, cap: 0xffffff }, fx: 'rainbow' },
    { id: 'skin_daily_royal', tab: 'skins', slot: 'skin', name: { ru: 'Королевский подарок', en: 'Royal Gift' }, rarity: 'legendary', look: { skin: 0xfff0d8, shirt: 0x8e24aa, pants: 0xffd54f, hair: 'long', hairColor: 0x4a148c, cap: 0xffd54f }, fx: 'sparkle', exclusive: 'daily' },
    { id: 'skin_daily_cosmo', tab: 'skins', slot: 'skin', name: { ru: 'Космо-кондитер', en: 'Cosmo Baker' }, rarity: 'legendary', look: { skin: 0xd7c9ff, shirt: 0x1a237e, pants: 0x00e5ff, hair: 'spiky', hairColor: 0xff4081, cap: 0xffffff }, fx: 'stars', exclusive: 'daily' },
    { id: 'skin_daily_sweet', tab: 'skins', slot: 'skin', name: { ru: 'Сладкая мечта', en: 'Sweet Dream' }, rarity: 'mythic', look: { skin: 0xffe6ee, shirt: 0xff80ab, pants: 0xb2ebf2, hair: 'long', hairColor: 0xfff59d, cap: 0xff80ab }, fx: 'rainbow', exclusive: 'daily' },
];

/** @type {any[]} */
const SHOP_ITEMS_HATS = [
    { id: 'hat_headphones', tab: 'hats', slot: 'hat', name: { ru: 'Наушники', en: 'Headphones' }, rarity: 'common', price: { ads: 1 }, model: 'assets/models/hats/headphones.glb', icon: 'assets/ui/shop/hats/headphones.webp' },
    { id: 'hat_cupcake', tab: 'hats', slot: 'hat', name: { ru: 'Капкейк', en: 'Cupcake' }, rarity: 'common', price: { coins: 30 }, model: 'assets/models/hats/cupcake.glb', icon: 'assets/ui/shop/hats/cupcake.webp' },
    { id: 'hat_lollipop_beanie', tab: 'hats', slot: 'hat', name: { ru: 'Шапка-леденец', en: 'Lollipop Beanie' }, rarity: 'common', price: { ads: 1 }, model: 'assets/models/hats/lollipop_beanie.glb', icon: 'assets/ui/shop/hats/lollipop_beanie.webp' },
    { id: 'hat_chef_hat', tab: 'hats', slot: 'hat', name: { ru: 'Поварской колпак', en: 'Chef Hat' }, rarity: 'common', price: { coins: 40 }, model: 'assets/models/hats/chef_hat.glb', icon: 'assets/ui/shop/hats/chef_hat.webp' },
    { id: 'hat_cookie_cap', tab: 'hats', slot: 'hat', name: { ru: 'Печенье-кепка', en: 'Cookie Cap' }, rarity: 'common', price: { coins: 60 }, model: 'assets/models/hats/cookie_cap.glb', icon: 'assets/ui/shop/hats/cookie_cap.webp' },
    { id: 'hat_party_hat', tab: 'hats', slot: 'hat', name: { ru: 'Праздничный колпак', en: 'Party Hat' }, rarity: 'common', price: { ads: 1 }, model: 'assets/models/hats/party_hat.glb', icon: 'assets/ui/shop/hats/party_hat.webp' },
    { id: 'hat_bow', tab: 'hats', slot: 'hat', name: { ru: 'Сладкий бант', en: 'Sweet Bow' }, rarity: 'rare', price: { coins: 90 }, model: 'assets/models/hats/bow.glb', icon: 'assets/ui/shop/hats/bow.webp', fx: 'sparkle' },
    { id: 'hat_cherry', tab: 'hats', slot: 'hat', name: { ru: 'Вишенка', en: 'Cherry' }, rarity: 'rare', price: { coins: 150 }, model: 'assets/models/hats/cherry.glb', icon: 'assets/ui/shop/hats/cherry.webp', fx: 'sparkle' },
    { id: 'hat_gummy_ears', tab: 'hats', slot: 'hat', name: { ru: 'Мармеладные ушки', en: 'Gummy Ears' }, rarity: 'rare', price: { ads: 2 }, model: 'assets/models/hats/gummy_ears.glb', icon: 'assets/ui/shop/hats/gummy_ears.webp', fx: 'sparkle' },
    { id: 'hat_cat_ears', tab: 'hats', slot: 'hat', name: { ru: 'Кошачьи ушки', en: 'Kitty Ears' }, rarity: 'rare', price: { ads: 2 }, model: 'assets/models/hats/cat_ears.glb', icon: 'assets/ui/shop/hats/cat_ears.webp', fx: 'sparkle' },
    { id: 'hat_bunny_ears', tab: 'hats', slot: 'hat', name: { ru: 'Ушки зайки', en: 'Bunny Ears' }, rarity: 'rare', price: { ads: 2 }, model: 'assets/models/hats/bunny_ears.glb', icon: 'assets/ui/shop/hats/bunny_ears.webp', fx: 'sparkle' },
    { id: 'hat_cone_hat', tab: 'hats', slot: 'hat', name: { ru: 'Вафельный рожок', en: 'Wafer Cone' }, rarity: 'rare', price: { ads: 3 }, model: 'assets/models/hats/cone_hat.glb', icon: 'assets/ui/shop/hats/cone_hat.webp', fx: 'sparkle' },
    { id: 'hat_choco_horns', tab: 'hats', slot: 'hat', name: { ru: 'Шоколадные рожки', en: 'Choco Horns' }, rarity: 'rare', price: { ads: 3 }, model: 'assets/models/hats/choco_horns.glb', icon: 'assets/ui/shop/hats/choco_horns.webp', fx: 'sparkle' },
    { id: 'hat_propeller', tab: 'hats', slot: 'hat', name: { ru: 'Пропеллер', en: 'Propeller Cap' }, rarity: 'epic', price: { coins: 350 }, model: 'assets/models/hats/propeller.glb', icon: 'assets/ui/shop/hats/propeller.webp', fx: 'stars' },
    { id: 'hat_top_hat', tab: 'hats', slot: 'hat', name: { ru: 'Цилиндр', en: 'Top Hat' }, rarity: 'epic', price: { coins: 800 }, model: 'assets/models/hats/top_hat.glb', icon: 'assets/ui/shop/hats/top_hat.webp', fx: 'stars' },
    { id: 'hat_choco_helmet', tab: 'hats', slot: 'hat', name: { ru: 'Шоколадный шлем', en: 'Choco Helmet' }, rarity: 'epic', price: { ads: 4 }, model: 'assets/models/hats/choco_helmet.glb', icon: 'assets/ui/shop/hats/choco_helmet.webp', fx: 'stars' },
    { id: 'hat_wizard_hat', tab: 'hats', slot: 'hat', name: { ru: 'Шляпа волшебника', en: 'Wizard Hat' }, rarity: 'epic', price: { ads: 4 }, model: 'assets/models/hats/wizard_hat.glb', icon: 'assets/ui/shop/hats/wizard_hat.webp', fx: 'stars' },
    { id: 'hat_candy_crown', tab: 'hats', slot: 'hat', name: { ru: 'Конфетная корона', en: 'Candy Crown' }, rarity: 'legendary', price: { ads: 5 }, model: 'assets/models/hats/candy_crown.glb', icon: 'assets/ui/shop/hats/candy_crown.webp', fx: 'hearts' },
    { id: 'hat_donut_halo', tab: 'hats', slot: 'hat', name: { ru: 'Нимб-пончик', en: 'Donut Halo' }, rarity: 'legendary', price: { ads: 5 }, model: 'assets/models/hats/donut_halo.glb', icon: 'assets/ui/shop/hats/donut_halo.webp', fx: 'hearts' },
    { id: 'hat_star_halo', tab: 'hats', slot: 'hat', name: { ru: 'Звёздный нимб', en: 'Star Halo' }, rarity: 'mythic', price: { ads: 5 }, model: 'assets/models/hats/star_halo.glb', icon: 'assets/ui/shop/hats/star_halo.webp', fx: 'rainbow' },
];

/** @type {any[]} */
const SHOP_ITEMS_PETS = [
    { id: 'pet_marshmallow', tab: 'pets', slot: 'pet', name: { ru: 'Зефирка', en: 'Marshmallow' }, rarity: 'common', price: { coins: 40 }, model: 'assets/models/pets/marshmallow.glb', icon: 'assets/ui/shop/pets/marshmallow.webp' },
    { id: 'pet_cookie', tab: 'pets', slot: 'pet', name: { ru: 'Печенька', en: 'Cookie' }, rarity: 'common', price: { coins: 50 }, model: 'assets/models/pets/cookie.glb', icon: 'assets/ui/shop/pets/cookie.webp' },
    { id: 'pet_gumball', tab: 'pets', slot: 'pet', name: { ru: 'Жвачка-шарик', en: 'Gumball' }, rarity: 'common', price: { coins: 60 }, model: 'assets/models/pets/gumball.glb', icon: 'assets/ui/shop/pets/gumball.webp' },
    { id: 'pet_gummy_bear', tab: 'pets', slot: 'pet', name: { ru: 'Мармеладный мишка', en: 'Gummy Bear' }, rarity: 'common', price: { ads: 1 }, model: 'assets/models/pets/gummy_bear.glb', icon: 'assets/ui/shop/pets/gummy_bear.webp' },
    { id: 'pet_jelly', tab: 'pets', slot: 'pet', name: { ru: 'Желейка', en: 'Jelly' }, rarity: 'common', price: { ads: 1 }, model: 'assets/models/pets/jelly.glb', icon: 'assets/ui/shop/pets/jelly.webp' },
    { id: 'pet_lollipop', tab: 'pets', slot: 'pet', name: { ru: 'Леденец', en: 'Lollipop' }, rarity: 'common', price: { ads: 1 }, model: 'assets/models/pets/lollipop.glb', icon: 'assets/ui/shop/pets/lollipop.webp' },
    { id: 'pet_cherry', tab: 'pets', slot: 'pet', name: { ru: 'Вишенка', en: 'Cherry' }, rarity: 'rare', price: { coins: 120 }, model: 'assets/models/pets/cherry.glb', icon: 'assets/ui/shop/pets/cherry.webp', fx: 'sparkle' },
    { id: 'pet_pretzel', tab: 'pets', slot: 'pet', name: { ru: 'Крендель', en: 'Pretzel' }, rarity: 'rare', price: { coins: 140 }, model: 'assets/models/pets/pretzel.glb', icon: 'assets/ui/shop/pets/pretzel.webp', fx: 'sparkle' },
    { id: 'pet_candy_corn', tab: 'pets', slot: 'pet', name: { ru: 'Кэнди-корн', en: 'Candy Corn' }, rarity: 'rare', price: { ads: 2 }, model: 'assets/models/pets/candy_corn.glb', icon: 'assets/ui/shop/pets/candy_corn.webp', fx: 'sparkle' },
    { id: 'pet_waffle', tab: 'pets', slot: 'pet', name: { ru: 'Вафелька', en: 'Waffle' }, rarity: 'rare', price: { ads: 2 }, model: 'assets/models/pets/waffle.glb', icon: 'assets/ui/shop/pets/waffle.webp', fx: 'sparkle' },
    { id: 'pet_popsicle', tab: 'pets', slot: 'pet', name: { ru: 'Эскимо', en: 'Popsicle' }, rarity: 'rare', price: { ads: 2 }, model: 'assets/models/pets/popsicle.glb', icon: 'assets/ui/shop/pets/popsicle.webp', fx: 'sparkle' },
    { id: 'pet_donut', tab: 'pets', slot: 'pet', name: { ru: 'Пончик', en: 'Donut' }, rarity: 'rare', price: { ads: 3 }, model: 'assets/models/pets/donut.glb', icon: 'assets/ui/shop/pets/donut.webp', fx: 'sparkle' },
    { id: 'pet_cupcake', tab: 'pets', slot: 'pet', name: { ru: 'Капкейк', en: 'Cupcake' }, rarity: 'rare', price: { ads: 3 }, model: 'assets/models/pets/cupcake.glb', icon: 'assets/ui/shop/pets/cupcake.webp', fx: 'sparkle' },
    { id: 'pet_pudding', tab: 'pets', slot: 'pet', name: { ru: 'Пудинг', en: 'Pudding' }, rarity: 'epic', price: { coins: 400 }, model: 'assets/models/pets/pudding.glb', icon: 'assets/ui/shop/pets/pudding.webp', fx: 'stars' },
    { id: 'pet_macaron', tab: 'pets', slot: 'pet', name: { ru: 'Макарон', en: 'Macaron' }, rarity: 'epic', price: { coins: 900 }, model: 'assets/models/pets/macaron.glb', icon: 'assets/ui/shop/pets/macaron.webp', fx: 'stars' },
    { id: 'pet_ice_cream', tab: 'pets', slot: 'pet', name: { ru: 'Мороженко', en: 'Ice Cream' }, rarity: 'epic', price: { ads: 4 }, model: 'assets/models/pets/ice_cream.glb', icon: 'assets/ui/shop/pets/ice_cream.webp', fx: 'stars' },
    { id: 'pet_cake_slice', tab: 'pets', slot: 'pet', name: { ru: 'Кусочек торта', en: 'Cake Slice' }, rarity: 'epic', price: { ads: 4 }, model: 'assets/models/pets/cake_slice.glb', icon: 'assets/ui/shop/pets/cake_slice.webp', fx: 'stars' },
    { id: 'pet_choco_bunny', tab: 'pets', slot: 'pet', name: { ru: 'Шоколадный зайка', en: 'Choco Bunny' }, rarity: 'legendary', price: { ads: 5 }, model: 'assets/models/pets/choco_bunny.glb', icon: 'assets/ui/shop/pets/choco_bunny.webp', fx: 'hearts' },
    { id: 'pet_cotton_cloud', tab: 'pets', slot: 'pet', name: { ru: 'Облачко-вата', en: 'Cotton Cloud' }, rarity: 'legendary', price: { ads: 5 }, model: 'assets/models/pets/cotton_cloud.glb', icon: 'assets/ui/shop/pets/cotton_cloud.webp', fx: 'hearts' },
    { id: 'pet_mochi', tab: 'pets', slot: 'pet', name: { ru: 'Моти', en: 'Mochi' }, rarity: 'mythic', price: { ads: 5 }, model: 'assets/models/pets/mochi.glb', icon: 'assets/ui/shop/pets/mochi.webp', fx: 'rainbow' },
];

/** @type {any[]} */
const SHOP_ITEMS_GLOW = [
    { id: 'glow_sugar', tab: 'glow', slot: 'glow', name: { ru: 'Сахарный розовый', en: 'Sugar Pink' }, rarity: 'common', glow: { color: 0xff6fb5, fx: 'none' }, default: true },
    { id: 'glow_mint', tab: 'glow', slot: 'glow', name: { ru: 'Мята', en: 'Mint' }, rarity: 'common', price: { coins: 30 }, glow: { color: 0x5ff0c0, fx: 'none' } },
    { id: 'glow_lemon', tab: 'glow', slot: 'glow', name: { ru: 'Лимон', en: 'Lemon' }, rarity: 'common', price: { coins: 40 }, glow: { color: 0xffe14d, fx: 'none' } },
    { id: 'glow_tangerine', tab: 'glow', slot: 'glow', name: { ru: 'Мандарин', en: 'Tangerine' }, rarity: 'common', price: { coins: 60 }, glow: { color: 0xff9f40, fx: 'none' } },
    { id: 'glow_berry', tab: 'glow', slot: 'glow', name: { ru: 'Ягода', en: 'Berry' }, rarity: 'common', price: { ads: 1 }, glow: { color: 0xc15bff, fx: 'none' } },
    { id: 'glow_lime', tab: 'glow', slot: 'glow', name: { ru: 'Лайм', en: 'Lime' }, rarity: 'common', price: { ads: 1 }, glow: { color: 0xa3f23f, fx: 'none' } },
    { id: 'glow_sky', tab: 'glow', slot: 'glow', name: { ru: 'Небо', en: 'Sky' }, rarity: 'common', price: { ads: 1 }, glow: { color: 0x5cc8ff, fx: 'none' } },
    { id: 'glow_hearts', tab: 'glow', slot: 'glow', name: { ru: 'Сердечки', en: 'Hearts' }, rarity: 'rare', price: { coins: 100 }, glow: { color: 0xff4d88, fx: 'hearts' }, fx: 'hearts' },
    { id: 'glow_bubbles', tab: 'glow', slot: 'glow', name: { ru: 'Пузырьки', en: 'Bubbles' }, rarity: 'rare', price: { coins: 150 }, glow: { color: 0x7fd8ff, fx: 'bubbles' }, fx: 'bubbles' },
    { id: 'glow_candyspark', tab: 'glow', slot: 'glow', name: { ru: 'Леденцовые искры', en: 'Candy Sparks' }, rarity: 'rare', price: { ads: 2 }, glow: { color: 0xff8ad8, fx: 'sparkle' }, fx: 'sparkle' },
    { id: 'glow_starfall', tab: 'glow', slot: 'glow', name: { ru: 'Звёздный дождь', en: 'Starfall' }, rarity: 'rare', price: { ads: 2 }, glow: { color: 0xffd84a, fx: 'stars' }, fx: 'stars' },
    { id: 'glow_mintbubbles', tab: 'glow', slot: 'glow', name: { ru: 'Мятные пузыри', en: 'Mint Bubbles' }, rarity: 'rare', price: { ads: 3 }, glow: { color: 0x7ff5d9, fx: 'bubbles' }, fx: 'bubbles' },
    { id: 'glow_cherryhearts', tab: 'glow', slot: 'glow', name: { ru: 'Вишнёвые сердца', en: 'Cherry Hearts' }, rarity: 'rare', price: { ads: 3 }, glow: { color: 0xff3b6b, fx: 'hearts' }, fx: 'hearts' },
    { id: 'glow_lemonspark', tab: 'glow', slot: 'glow', name: { ru: 'Лимонные искры', en: 'Lemon Sparks' }, rarity: 'rare', price: { ads: 3 }, glow: { color: 0xfff06a, fx: 'sparkle' }, fx: 'sparkle' },
    { id: 'glow_caramelfire', tab: 'glow', slot: 'glow', name: { ru: 'Карамельный огонь', en: 'Caramel Fire' }, rarity: 'epic', price: { coins: 400 }, glow: { color: 0xff9f1c, fx: 'fire' }, fx: 'fire' },
    { id: 'glow_icesparkle', tab: 'glow', slot: 'glow', name: { ru: 'Ледяной блеск', en: 'Ice Sparkle' }, rarity: 'epic', price: { coins: 700 }, glow: { color: 0xaee9ff, fx: 'sparkle' }, fx: 'sparkle' },
    { id: 'glow_rainbowburst', tab: 'glow', slot: 'glow', name: { ru: 'Радужный взрыв', en: 'Rainbow Burst' }, rarity: 'epic', price: { ads: 4 }, glow: { color: 0xff5fa8, fx: 'rainbow' }, fx: 'rainbow' },
    { id: 'glow_cosmicstars', tab: 'glow', slot: 'glow', name: { ru: 'Космозвёзды', en: 'Cosmic Stars' }, rarity: 'epic', price: { ads: 4 }, glow: { color: 0xb388ff, fx: 'stars' }, fx: 'stars' },
    { id: 'glow_lavacake', tab: 'glow', slot: 'glow', name: { ru: 'Лавовый кекс', en: 'Lava Cake' }, rarity: 'legendary', price: { ads: 5 }, glow: { color: 0xff4d1c, fx: 'fire' }, fx: 'fire' },
    { id: 'glow_cottonrainbow', tab: 'glow', slot: 'glow', name: { ru: 'Радужная вата', en: 'Cotton Rainbow' }, rarity: 'legendary', price: { ads: 5 }, glow: { color: 0xffb3f0, fx: 'rainbow' }, fx: 'rainbow' },
    { id: 'glow_candycosmos', tab: 'glow', slot: 'glow', name: { ru: 'Космо-конфета', en: 'Candy Cosmos' }, rarity: 'mythic', price: { ads: 5 }, glow: { color: 0x8a5cff, fx: 'rainbow' }, fx: 'rainbow' },
];

/** @type {any[]} */
const SHOP_ITEMS_EMOTES = [
    { id: 'emote_wave', tab: 'emotes', slot: 'emote', name: { ru: 'Привет', en: 'Wave' }, rarity: 'common', price: { coins: 30 }, emote: 'wave' },
    { id: 'emote_clap', tab: 'emotes', slot: 'emote', name: { ru: 'Аплодисменты', en: 'Clap' }, rarity: 'common', price: { coins: 40 }, emote: 'clap' },
    { id: 'emote_jump', tab: 'emotes', slot: 'emote', name: { ru: 'Прыжок радости', en: 'Jump for Joy' }, rarity: 'common', price: { coins: 60 }, emote: 'jump' },
    { id: 'emote_bow', tab: 'emotes', slot: 'emote', name: { ru: 'Поклон', en: 'Bow' }, rarity: 'common', price: { ads: 1 }, emote: 'bow' },
    { id: 'emote_cheer', tab: 'emotes', slot: 'emote', name: { ru: 'Ура!', en: 'Cheer' }, rarity: 'common', price: { ads: 1 }, emote: 'cheer' },
    { id: 'emote_shimmy', tab: 'emotes', slot: 'emote', name: { ru: 'Шимми', en: 'Shimmy' }, rarity: 'common', price: { ads: 1 }, emote: 'shimmy' },
    { id: 'emote_spin', tab: 'emotes', slot: 'emote', name: { ru: 'Вертушка', en: 'Spin' }, rarity: 'rare', price: { coins: 100 }, emote: 'spin', fx: 'sparkle' },
    { id: 'emote_dance', tab: 'emotes', slot: 'emote', name: { ru: 'Танец', en: 'Dance' }, rarity: 'rare', price: { coins: 150 }, emote: 'dance', fx: 'sparkle' },
    { id: 'emote_robot', tab: 'emotes', slot: 'emote', name: { ru: 'Робот', en: 'Robot' }, rarity: 'rare', price: { ads: 2 }, emote: 'robot', fx: 'sparkle' },
    { id: 'emote_moonwalk', tab: 'emotes', slot: 'emote', name: { ru: 'Лунная походка', en: 'Moonwalk' }, rarity: 'rare', price: { ads: 2 }, emote: 'moonwalk', fx: 'sparkle' },
    { id: 'emote_salute', tab: 'emotes', slot: 'emote', name: { ru: 'Салют', en: 'Salute' }, rarity: 'rare', price: { ads: 2 }, emote: 'salute', fx: 'sparkle' },
    { id: 'emote_twist', tab: 'emotes', slot: 'emote', name: { ru: 'Твист', en: 'Twist' }, rarity: 'rare', price: { ads: 3 }, emote: 'twist', fx: 'sparkle' },
    { id: 'emote_kick', tab: 'emotes', slot: 'emote', name: { ru: 'Удар ногой', en: 'Kick' }, rarity: 'rare', price: { ads: 3 }, emote: 'kick', fx: 'sparkle' },
    { id: 'emote_flip', tab: 'emotes', slot: 'emote', name: { ru: 'Сальто', en: 'Flip' }, rarity: 'epic', price: { coins: 400 }, emote: 'flip', fx: 'stars' },
    { id: 'emote_floss', tab: 'emotes', slot: 'emote', name: { ru: 'Флосс', en: 'Floss' }, rarity: 'epic', price: { coins: 900 }, emote: 'floss', fx: 'stars' },
    { id: 'emote_zombie', tab: 'emotes', slot: 'emote', name: { ru: 'Зомби-шаг', en: 'Zombie Walk' }, rarity: 'epic', price: { ads: 4 }, emote: 'zombie', fx: 'stars' },
    { id: 'emote_backflip', tab: 'emotes', slot: 'emote', name: { ru: 'Заднее сальто', en: 'Backflip' }, rarity: 'epic', price: { ads: 4 }, emote: 'backflip', fx: 'stars' },
    { id: 'emote_headspin', tab: 'emotes', slot: 'emote', name: { ru: 'Брейк-данс', en: 'Headspin' }, rarity: 'legendary', price: { ads: 5 }, emote: 'headspin', fx: 'hearts' },
    { id: 'emote_pose', tab: 'emotes', slot: 'emote', name: { ru: 'Королевская поза', en: 'Royal Pose' }, rarity: 'legendary', price: { ads: 5 }, emote: 'pose', fx: 'hearts' },
    { id: 'emote_victory', tab: 'emotes', slot: 'emote', name: { ru: 'Танец победы', en: 'Victory Dance' }, rarity: 'mythic', price: { ads: 5 }, emote: 'victory', fx: 'rainbow' },
];
/** Все предметы магазина (скины, шапки, питомцы, свечение, эмоции). */
const SHOP_ITEMS = [].concat(SHOP_ITEMS_SKINS, SHOP_ITEMS_HATS, SHOP_ITEMS_PETS, SHOP_ITEMS_GLOW, SHOP_ITEMS_EMOTES);

/** Daily Gift, дни 1–6 (валюта — Wins, по нарастающей); день 7 — эксклюзивный скин из очереди Shop.exclusiveIds('daily') (3 скина = 3 цикла,
 *  потом DailyGift отдаёт крупную награду Wins). */
const DAILY_REWARDS = [
    { coins: 40 },
    { coins: 70 },
    { coins: 110 },
    { coins: 160, randomItems: 1, maxRarity: 'rare' },
    { coins: 240 },
    { coins: 350, randomItems: 1, maxRarity: 'epic' },
];

/** Колесо фортуны: 8 равных секторов; в основном Wins, реже косметика (randomItem — предмет магазина, которого ещё нет у игрока). */
const WHEEL_SECTORS = [
    { coins: 25, weight: 22 },
    { coins: 100, weight: 14 },
    { randomItem: true, maxRarity: 'rare', weight: 8 },
    { coins: 50, weight: 20 },
    { coins: 250, weight: 8 },
    { coins: 75, weight: 17 },
    { randomItem: true, maxRarity: 'epic', weight: 3 },
    { coins: 1000, weight: 2 },
];

/** Превью скинов — рендеры героя из Blender (пути литералами: их видит сборщик). */
const SKIN_PICS = {
    skin_berry: 'assets/ui/shop/skins/skin_berry.webp',
    skin_blueberry: 'assets/ui/shop/skins/skin_blueberry.webp',
    skin_caramelracer: 'assets/ui/shop/skins/skin_caramelracer.webp',
    skin_cherrychef: 'assets/ui/shop/skins/skin_cherrychef.webp',
    skin_chocoking: 'assets/ui/shop/skins/skin_chocoking.webp',
    skin_cocoa: 'assets/ui/shop/skins/skin_cocoa.webp',
    skin_cottoncloud: 'assets/ui/shop/skins/skin_cottoncloud.webp',
    skin_daily_cosmo: 'assets/ui/shop/skins/skin_daily_cosmo.webp',
    skin_daily_royal: 'assets/ui/shop/skins/skin_daily_royal.webp',
    skin_daily_sweet: 'assets/ui/shop/skins/skin_daily_sweet.webp',
    skin_default: 'assets/ui/shop/skins/skin_default.webp',
    skin_galaxycandy: 'assets/ui/shop/skins/skin_galaxycandy.webp',
    skin_gingerbread: 'assets/ui/shop/skins/skin_gingerbread.webp',
    skin_goldwrapper: 'assets/ui/shop/skins/skin_goldwrapper.webp',
    skin_jellypop: 'assets/ui/shop/skins/skin_jellypop.webp',
    skin_lavacake: 'assets/ui/shop/skins/skin_lavacake.webp',
    skin_lemonade: 'assets/ui/shop/skins/skin_lemonade.webp',
    skin_liquorice: 'assets/ui/shop/skins/skin_liquorice.webp',
    skin_marshmallow: 'assets/ui/shop/skins/skin_marshmallow.webp',
    skin_mintchip: 'assets/ui/shop/skins/skin_mintchip.webp',
    skin_mintfrost: 'assets/ui/shop/skins/skin_mintfrost.webp',
    skin_peach: 'assets/ui/shop/skins/skin_peach.webp',
    skin_rainbowpop: 'assets/ui/shop/skins/skin_rainbowpop.webp',
    skin_sprinklequeen: 'assets/ui/shop/skins/skin_sprinklequeen.webp',
    skin_sugardragon: 'assets/ui/shop/skins/skin_sugardragon.webp',
    skin_waferranger: 'assets/ui/shop/skins/skin_waferranger.webp',
};
