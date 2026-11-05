// GameUiLang.js — тексты интерфейса игры (ключи ke.*), ru и en. Подключается раньше остальных GameUi*.js.

Object.assign(LANG_STRINGS.ru, {
    'ke.logo1': 'ПОБЕГ', 'ke.logo2': 'С КЛАВИАТУРЫ', 'ke.logo.sub': 'КЛАССИКА', 'title': 'Побег с клавиатуры: Классика',
    'ke.play': 'Играть', 'ke.ok': 'Отлично!', 'ke.close': 'Закрыть', 'ke.back': 'Назад',
    'ke.menu.hint': 'Каждый шаг по клавишам — +1 к скорости. Беги, прыгай и добирайся до пьедестала побед!',
    'ke.speed': 'Скорость', 'ke.wins': 'Победы', 'ke.rebirth': 'Перерождения', 'ke.mult': 'Множитель',
    'ke.level': 'Уровень {n}', 'ke.perstep': '+{n} за шаг', 'ke.max': 'Макс. скорость', 'ke.max.off': '∞',
    'ke.stage': 'Этап {n}', 'ke.stage.of': 'Этап {n}/{total}', 'ke.zone.safe': 'Безопасная зона',
    'ke.btn.rebirth': 'Перерожд.', 'ke.btn.trails': 'Следы', 'ke.btn.auras': 'Ауры', 'ke.btn.shop': 'Магазин', 'ke.btn.teleport': 'Портал', 'ke.btn.daily': 'Подарок', 'ke.btn.wheel': 'Колесо', 'ke.btn.top': 'Топ',
    'ke.w.trails': 'Следы', 'ke.w.auras': 'Ауры', 'ke.w.rebirth': 'Перерождение', 'ke.w.teleport': 'Телепорт', 'ke.w.treadmills': 'Беговые дорожки', 'ke.w.shop': 'Магазин',
    'ke.w.daily': 'Подарок дня', 'ke.w.wheel': 'Колесо фортуны', 'ke.w.top': 'Лучшие бегуны', 'ke.w.pause': 'Пауза', 'ke.w.settings': 'Настройки', 'ke.w.result': 'Пьедестал побед!',
    'ke.buy': 'Купить', 'ke.equip': 'Надеть', 'ke.equipped': 'Надето', 'ke.owned': 'Куплено', 'ke.free': 'Бесплатно', 'ke.locked': 'Закрыто',
    'ke.need': 'Не хватает: {n}', 'ke.err.wins': 'Не хватает побед', 'ke.err.generic': 'Не получилось', 'ke.err.ads': 'Реклама сейчас недоступна',
    'ke.trails.note': 'Следы увеличивают скорость за каждый шаг. Покупаются за победы.', 'ke.auras.note': 'Ауры умножают скорость. Покупаются за победы.',
    'ke.empty': 'Пока пусто',
    'ke.rb.lead': 'Сбрось скорость до 0 и получи вечный множитель!', 'ke.rb.need': 'Нужен уровень {n}', 'ke.rb.now': 'Сейчас', 'ke.rb.next': 'После',
    'ke.rb.go': 'Перерождение!', 'ke.rb.confirm': 'Точно? Нажми ещё раз', 'ke.rb.count': 'Перерождений: {n}', 'ke.rb.level': 'Уровень {a} из {b}',
    'ke.tp.lead': 'Мгновенно в любую открытую безопасную зону. Скорость не теряется.', 'ke.tp.zone': 'Безопасная зона {n}', 'ke.tp.hub': 'Хаб', 'ke.tp.go': 'Телепорт', 'ke.tp.locked': 'Закрыто',
    'ke.tm.lead': 'Встань на дорожку — скорость растёт сама. Чем лучше дорожка, тем быстрее.', 'ke.tm.tier': 'Дорожка {n}', 'ke.tm.owned': 'Есть',
    'ke.top.empty': 'Пока нет лучших игроков', 'ke.top.login': 'Войдите в аккаунт', 'ke.top.you': 'Вы', 'ke.top.lead': 'Лучшие по скорости',
    'ke.pause.resume': 'Продолжить', 'ke.sound': 'Звук', 'ke.on': 'Вкл', 'ke.off': 'Выкл',
    'ke.set.quality': 'Графика', 'ke.q.auto': 'Авто', 'ke.q.low': 'Низкая', 'ke.q.medium': 'Средняя', 'ke.q.high': 'Высокая', 'ke.set.lang': 'Язык',
    'ke.res.title': 'Победы получены!', 'ke.res.stage': 'Самый дальний этап: {n}', 'ke.res.cont': 'Продолжить', 'ke.res.x2': 'x2 побед за рекламу', 'ke.res.doubled': 'Удвоено!',
    'ke.boost': 'x2 Скорость', 'ke.boost.sec': '{s} с', 'ke.levelup': 'Уровень {n}!',
    'ke.daily.got': 'Подарок получен!', 'ke.daily.exclusive': 'Эксклюзив', 'ke.daily.goal': 'Скин 7-го дня', 'ke.daily.lead': 'Заходи каждый день: на 7-й день — эксклюзивный скин!',
    'ke.wheel.won': 'Ты выиграл!', 'ke.wheel.adspin': 'За рекламу', 'ke.wheel.left': 'осталось {a} из {b}', 'ke.wheel.lead': 'Раз в день — бесплатно, ещё вращения — за рекламу.', 'ke.wheel.coins': '{n} 🏆',
    'ke.shop.unlocked': 'Открыто!', 'ke.shop.tryon': 'Примерка', 'ke.shop.noads': 'Реклама недоступна',
    'ke.shop.exclusive': 'Только в подарке дня', 'ke.shop.ads': 'За рекламу {a}/{b}',
});
Object.assign(LANG_STRINGS.en, {
    'ke.logo1': 'KEYBOARD', 'ke.logo2': 'ESCAPE', 'ke.logo.sub': 'CLASSIC', 'title': 'Keyboard Escape Classic',
    'ke.play': 'Play', 'ke.ok': 'Awesome!', 'ke.close': 'Close', 'ke.back': 'Back',
    'ke.menu.hint': 'Every key you step on gives +1 Speed. Run, jump and reach the Wins pad!',
    'ke.speed': 'Speed', 'ke.wins': 'Wins', 'ke.rebirth': 'Rebirths', 'ke.mult': 'Multiplier',
    'ke.level': 'Level {n}', 'ke.perstep': '+{n} per step', 'ke.max': 'Max Speed', 'ke.max.off': '∞',
    'ke.stage': 'Stage {n}', 'ke.stage.of': 'Stage {n}/{total}', 'ke.zone.safe': 'Safe Zone',
    'ke.btn.rebirth': 'Rebirth', 'ke.btn.trails': 'Trails', 'ke.btn.auras': 'Auras', 'ke.btn.shop': 'Shop', 'ke.btn.teleport': 'Teleport', 'ke.btn.daily': 'Daily', 'ke.btn.wheel': 'Wheel', 'ke.btn.top': 'Top',
    'ke.w.trails': 'Trails', 'ke.w.auras': 'Auras', 'ke.w.rebirth': 'Rebirth', 'ke.w.teleport': 'Teleport', 'ke.w.treadmills': 'Treadmills', 'ke.w.shop': 'Shop',
    'ke.w.daily': 'Daily Gift', 'ke.w.wheel': 'Wheel of Fortune', 'ke.w.top': 'Top Runners', 'ke.w.pause': 'Paused', 'ke.w.settings': 'Settings', 'ke.w.result': 'Wins pad!',
    'ke.buy': 'Buy', 'ke.equip': 'Equip', 'ke.equipped': 'Equipped', 'ke.owned': 'Owned', 'ke.free': 'Free', 'ke.locked': 'Locked',
    'ke.need': 'Need {n} more', 'ke.err.wins': 'Not enough Wins', 'ke.err.generic': 'That did not work', 'ke.err.ads': 'No ad right now',
    'ke.trails.note': 'Trails boost the Speed you get per step. Bought with Wins.', 'ke.auras.note': 'Auras multiply your Speed. Bought with Wins.',
    'ke.empty': 'Nothing here yet',
    'ke.rb.lead': 'Reset Speed to 0 and get a permanent multiplier!', 'ke.rb.need': 'Reach level {n}', 'ke.rb.now': 'Now', 'ke.rb.next': 'After',
    'ke.rb.go': 'Rebirth!', 'ke.rb.confirm': 'Sure? Tap again', 'ke.rb.count': 'Rebirths: {n}', 'ke.rb.level': 'Level {a} of {b}',
    'ke.tp.lead': 'Instantly jump to any unlocked Safe Zone. Your Speed is kept.', 'ke.tp.zone': 'Safe Zone {n}', 'ke.tp.hub': 'Hub', 'ke.tp.go': 'Teleport', 'ke.tp.locked': 'Locked',
    'ke.tm.lead': 'Stand on a treadmill and your Speed grows by itself. Better treadmill, faster growth.', 'ke.tm.tier': 'Treadmill {n}', 'ke.tm.owned': 'Owned',
    'ke.top.empty': 'No top players yet', 'ke.top.login': 'Log in to your account', 'ke.top.you': 'You', 'ke.top.lead': 'Best by Speed',
    'ke.pause.resume': 'Resume', 'ke.sound': 'Sound', 'ke.on': 'On', 'ke.off': 'Off',
    'ke.set.quality': 'Graphics', 'ke.q.auto': 'Auto', 'ke.q.low': 'Low', 'ke.q.medium': 'Medium', 'ke.q.high': 'High', 'ke.set.lang': 'Language',
    'ke.res.title': 'Wins earned!', 'ke.res.stage': 'Farthest stage: {n}', 'ke.res.cont': 'Continue', 'ke.res.x2': 'x2 Wins: watch ad', 'ke.res.doubled': 'Doubled!',
    'ke.boost': 'x2 Speed', 'ke.boost.sec': '{s} s', 'ke.levelup': 'Level {n}!',
    'ke.daily.got': 'Gift claimed!', 'ke.daily.exclusive': 'Exclusive', 'ke.daily.goal': 'Day 7 skin', 'ke.daily.lead': 'Come back every day: day 7 gives an exclusive skin!',
    'ke.wheel.won': 'You won!', 'ke.wheel.adspin': 'Watch ad', 'ke.wheel.left': '{a} of {b} left', 'ke.wheel.lead': 'One free spin a day, more spins for watching an ad.', 'ke.wheel.coins': '{n} Wins',
    'ke.shop.unlocked': 'Unlocked!', 'ke.shop.tryon': 'Try on', 'ke.shop.noads': 'No ad right now',
    'ke.shop.exclusive': 'Daily Gift only', 'ke.shop.ads': 'Watch ad {a}/{b}',
});
// Тексты модулей Shop/DailyGift/Wheel, где «монеты» — это Wins игры.
Object.assign(LANG_STRINGS.ru, {
    'shop.noCoins': 'Не хватает побед: {n}', 'reward.coins': '{n} 🏆', 'reward.big': 'Крупная награда: {n} 🏆', 'reward.dup': 'Такой предмет уже есть: {n} 🏆',
    'shop.adUnavailable': 'Реклама сейчас недоступна', 'daily.adUnavailable': 'Реклама сейчас недоступна. Награду можно забрать и без неё.', 'wheel.adUnavailable': 'Реклама сейчас недоступна',
    'daily.claimX2': 'x2 за рекламу', 'shop.watch': 'За рекламу',
});
Object.assign(LANG_STRINGS.en, {
    'shop.noCoins': 'Need {n} more Wins', 'reward.coins': '{n} Wins', 'reward.big': 'Big reward: {n} Wins', 'reward.dup': 'You already have it: {n} Wins',
    'daily.claimX2': 'x2: watch ad', 'shop.watch': 'Watch ad',
});

// Пикабу: название только по-русски — логотип меню на всех языках
if (String(GAME_PLATFORM) === 'pikabu') for (const c of Object.keys(LANG_STRINGS)) Object.assign(LANG_STRINGS[c], { 'ke.logo1': 'ПОБЕГ', 'ke.logo2': 'ПО КЛАВИАТУРЕ', 'ke.logo.sub': 'СЛАДКИЙ МИР' });
