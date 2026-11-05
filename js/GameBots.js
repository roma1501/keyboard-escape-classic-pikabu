// GameBots.js — боты «Keyboard Escape Classic» умнее ботов шаблона: каждый бежит со скоростью своего этапа (как живой игрок,
// разогнавшийся до рекомендованной Speed), меньше ошибается, у всех свои ники (ru / en) в духе игры. Поведение (маршрут route-N,
// прыжки, ожидание вертушек, чат, заход и выход) — ObbyBots движка; здесь только скорость этапа, умение и имена.
//
//   GameBots.install();                    // до ObbyBots.init: подмена cfg().run на время хода бота
//   ObbyBots.init({ ..., names: GAME_BOT_NAMES, skill: … });

/** Ники ботов: конфеты, клавиатуры, скорость — без ссылок и личных данных. */
const GAME_BOT_NAMES = {
    ru: ['Шустрый_Зефир', 'КлавишаПро', 'ШоколадныйВихрь', 'Мармеладка07', 'ЛеденецТурбо', 'Пломбир_Бег', 'КарамельКот', 'ТаптапГерой',
        'ВафляМолния', 'Ириска2009', 'КексНаСкорости', 'ПробелЧемпион', 'Сгущёнка', 'ТоффиРакета', 'ПончикБыстрый', 'ЖвачкаДжет',
        'ЩёлкЩёлк', 'Нуга_Ниндзя', 'Мятный_Ветер', 'БезеБум', 'КлацКлац', 'ЧупаЧемп', 'КакаоСпринт', 'ПеченькаАс', 'Эклерчик',
        'ЛакрицаЛис', 'ПастилаПилот', 'Драже_Дэш', 'Шербет', 'КлавиатурныйКороль', 'Тянучка', 'ЗефирныйЗаяц', 'Мусс_Макс', 'ВишняВжух',
        'ПралинеПро', 'СкоростнойКруассан', 'Карамбола', 'ЕнтерЕнот', 'Глазурь_Гоу', 'СахарнаяВата'],
    en: ['SpeedyMallow', 'KeyClackPro', 'ChocoVortex', 'GummyRush07', 'LollyTurbo', 'SundaeSprint', 'CaramelKat', 'TapTapHero',
        'WaffleBolt', 'Toffee2009', 'CupcakeZoom', 'SpacebarChamp', 'FudgeFlash', 'ToffeeRocket', 'DonutDash', 'BubbleJet',
        'ClickyClack', 'NougatNinja', 'MintBreeze', 'MeringueBoom', 'ClackAttack', 'LollyChamp', 'CocoaSprint', 'CookieAce', 'EclairEdge',
        'LicoriceFox', 'MarshPilot', 'SprinkleDash', 'SherbetSwift', 'KeyboardKing', 'TaffyTwist', 'MallowHare', 'MousseMax', 'CherryWhoosh',
        'PralinePro', 'TurboCroissant', 'CandyComet', 'EnterRaccoon', 'GlazeGo', 'CottonCandyX'],
};

/** @satisfies {Record<string, any>} */
const GameBots = {
    /** @type {any} */ _bot: null,
    installed: false,

    /** Скорость бота на этапе stage (после stage-го чекпоинта бежит этап stage + 1): бег героя на рекомендованной Speed × 1.02. */
    runFor(stage) {
        const st = GAME_STAGES[Math.min(GAME_STAGES.length - 1, Math.max(0, (stage | 0)))];
        const base = typeof OBBY_RUN_SPEED !== 'undefined' ? OBBY_RUN_SPEED : 620;
        return Math.max(base, st ? GameProgress.speedToRun(st.req) * 1.02 : base);
    },

    install() {
        if (this.installed || typeof ObbyBots === 'undefined') return;
        this.installed = true;
        const self = this, baseCfg = ObbyBots.cfg, baseDrive = ObbyBots._drive, baseHazard = ObbyBots._hazardWait;
        // cfg().run во время хода бота — его скорость этапа: планы прыжков, разбег и полёт считаются под неё
        ObbyBots.cfg = function () {
            const c = baseCfg.call(this);
            if (self._bot) c.run = self.runFor(self._bot.stage);
            c.skillMin = Math.max(c.skillMin, 0.78); c.skillMax = Math.max(c.skillMax, 1);   // меньше глупых промахов
            return c;
        };
        ObbyBots._drive = function (b, dt) { self._bot = b; try { return baseDrive.call(this, b, dt); } finally { self._bot = null; } };
        ObbyBots._hazardWait = function (b) { const prev = self._bot; self._bot = b; try { return baseHazard.call(this, b); } finally { self._bot = prev; } };
    },
};
