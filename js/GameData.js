// GameData.js — данные игры «ASMR Keyboard Escape»: этапы, трейлы, ауры, беговые дорожки. Только таблицы, без логики:
// правила считает GameProgress.js, числа кривых — KE_* в Constants.js. Точки этапов на карте — маркеры Maps.js
// (stage-N, checkpoint-N, winpad-N), здесь только их свойства по номеру.

/** Этапы 1…10: тема, рекомендованная Speed, Wins на паде Safe Zone после этапа, палитра неба/тумана. */
const GAME_STAGES = [
    { n: 1, id: 'candy', name: { ru: 'Конфетные ступени', en: 'Candy Steps' }, req: 0, wins: 1, color: '#ff8fc8' },
    { n: 2, id: 'gummy', name: { ru: 'Арена мишки', en: 'Gummy Arena' }, req: 105, wins: 3, color: '#ff6b6b' },
    { n: 3, id: 'marsh', name: { ru: 'Зефирный обвал', en: 'Marshmallow Roll' }, req: 215, wins: 6, color: '#ffe3f1' },
    { n: 4, id: 'wafer', name: { ru: 'Вафельный паркур', en: 'Wafer Parkour' }, req: 390, wins: 10, color: '#f7c27a' },
    { n: 5, id: 'caramel', name: { ru: 'Карамельный мост', en: 'Caramel Bridge' }, req: 620, wins: 16, color: '#e0904a' },
    { n: 6, id: 'tsunami', name: { ru: 'Шоколадное цунами', en: 'Choco Tsunami' }, req: 890, wins: 25, color: '#7a4a2a' },
    { n: 7, id: 'lolli', name: { ru: 'Леденцовые ворота', en: 'Lollipop Gates' }, req: 1250, wins: 40, color: '#a77bff' },
    { n: 8, id: 'cotton', name: { ru: 'Сахарная вата', en: 'Cotton Winds' }, req: 1690, wins: 60, color: '#9fd8ff' },
    { n: 9, id: 'licorice', name: { ru: 'Лакричный лабиринт', en: 'Licorice Maze' }, req: 2220, wins: 90, color: '#4a4560' },
    { n: 10, id: 'rainbow', name: { ru: 'Радужное небо', en: 'Rainbow Sky' }, req: 2850, wins: 140, color: '#7ef0c8' },
];

/** Wins на финише (winpad-11) — после всех этапов. */
const GAME_FINISH_WINS = 250;

/** Wins на вершине паркур-башни хаба (winpad-12): башня проходится без разгона — награда скромная. */
const GAME_TOWER_WINS = 15;

/** Трейлы: множитель Speed за шаг, цена в Wins, цвета ленты следа (2 тона), редкость — для рамки в окне. */
const GAME_TRAILS = [
    { id: 'mint', name: { ru: 'Мятный', en: 'Mint' }, mult: 1.5, price: 10, colors: [0x7ef0c8, 0x4fd6a8], rarity: 'common' },
    { id: 'berry', name: { ru: 'Черничный', en: 'Blueberry' }, mult: 2, price: 35, colors: [0x5ab8ff, 0x8a5cf0], rarity: 'common' },
    { id: 'grape', name: { ru: 'Виноградный', en: 'Grape' }, mult: 3, price: 120, colors: [0xa77bff, 0xff9ad5], rarity: 'rare' },
    { id: 'cherry', name: { ru: 'Вишнёвый', en: 'Cherry' }, mult: 4, price: 400, colors: [0xff4f6a, 0xffb0c0], rarity: 'rare' },
    { id: 'rainbow', name: { ru: 'Радужный', en: 'Rainbow' }, mult: 5, price: 1200, colors: [0xff6b6b, 0x7ef0c8], rarity: 'epic', rainbow: true },
    { id: 'galaxy', name: { ru: 'Галактика', en: 'Galaxy' }, mult: 10, price: 4000, colors: [0x3d2a8a, 0xff7ae0], rarity: 'legendary', sparkle: true },
    { id: 'choco', name: { ru: 'Шоколадный', en: 'Chocolate' }, mult: 20, price: 12000, colors: [0x6b3a1e, 0xf7c27a], rarity: 'mythic', sparkle: true },
];

/** Ауры: прибавка к множителю (+%), цена в Wins, цвет свечения у героя. */
const GAME_AURAS = [
    { id: 'sugar', name: { ru: 'Сахарная', en: 'Sugar' }, bonus: 0.25, price: 20, color: 0xffffff, rarity: 'common' },
    { id: 'strawberry', name: { ru: 'Клубничная', en: 'Strawberry' }, bonus: 0.5, price: 80, color: 0xff6fae, rarity: 'rare' },
    { id: 'caramel', name: { ru: 'Карамельная', en: 'Caramel' }, bonus: 1, price: 300, color: 0xf7b267, rarity: 'epic' },
    { id: 'star', name: { ru: 'Звёздная', en: 'Starlight' }, bonus: 2, price: 1000, color: 0xfbe86a, rarity: 'legendary' },
    { id: 'cosmic', name: { ru: 'Космическая', en: 'Cosmic' }, bonus: 4, price: 3500, color: 0xa77bff, rarity: 'mythic' },
];

/** Беговые дорожки по уровню (маркер treadmill-N, scale[1] = уровень): множитель шагов, цена открытия в Wins. */
const GAME_TREADMILLS = [
    { tier: 1, name: { ru: 'Шоколадная', en: 'Chocolate' }, mult: 1, price: 0, color: 0x7a4a2a },
    { tier: 2, name: { ru: 'Золотая', en: 'Golden' }, mult: 3, price: 50, color: 0xffd23f },
    { tier: 3, name: { ru: 'Алмазная', en: 'Diamond' }, mult: 10, price: 400, color: 0x8ff0ff },
    { tier: 4, name: { ru: 'Радужная', en: 'Rainbow' }, mult: 30, price: 3000, color: 0xff7ae0 },
];

/** «Акции» Safe Zone: дорожка зоны — уровень tier (чем дальше этап, тем лучше), открыть её здесь — со скидкой off,
 *  если уровень ещё не открыт. В хабе дорожки — по полной цене. Зона — номер Safe Zone (checkpoint-N). */
const GAME_TREADMILL_DEALS = [
    { from: 1, to: 3, tier: 2, off: 0.15 },
    { from: 4, to: 6, tier: 3, off: 0.25 },
    { from: 7, to: 10, tier: 4, off: 0.5 },
];
