'use strict';
window.ShopData = (() => {
  const categories = [
    { id: 'blocks', name: 'Конструкторы', image: 'blocks.svg', material: 'Дерево, безопасное покрытие' },
    { id: 'soft', name: 'Мягкие игрушки', image: 'bear.svg', material: 'Текстиль, полиэфирное волокно' },
    { id: 'games', name: 'Настольные игры', image: 'games.svg', material: 'Картон, дерево' },
    { id: 'transport', name: 'Транспорт', image: 'car.svg', material: 'Дерево, полимер' },
    { id: 'creative', name: 'Творчество', image: 'art.svg', material: 'Бумага, художественные материалы' }
  ];
  const rows = [
    ['city','Маленький город','blocks',2490,3,true,48],
    ['rainbow','Радуга из дерева','blocks',1890,2,true,12],
    ['castle','Замок мечтателя','blocks',3290,5,true,96],
    ['builder','Первый строитель','blocks',1290,1,true,24],
    ['space','Космическая станция','blocks',4590,7,false,180],
    ['bear','Мишка Обнимаш','soft',1790,0,true,1],
    ['bunny','Зайка в облаках','soft',1490,0,true,1],
    ['fox','Лисёнок Рыжик','soft',1990,3,true,1],
    ['whale','Сонный кит','soft',2290,0,false,1],
    ['forest','Лесные истории','games',1190,4,true,42],
    ['memory','Мемо: времена года','games',790,3,true,32],
    ['journey','Большое путешествие','games',2190,6,true,64],
    ['logic','Логика в коробке','games',1590,7,true,54],
    ['race','Красный гонщик','transport',990,3,true,1],
    ['bus','Солнечный автобус','transport',1690,2,true,1],
    ['train','Поезд приключений','transport',2990,3,true,18],
    ['truck','Грузовик помощник','transport',1390,3,false,1],
    ['paint','Моя первая палитра','creative',890,3,true,12],
    ['clay','Мастерская лепки','creative',1190,4,true,8],
    ['artist','Маленький художник','creative',1990,5,true,36],
    ['paper','Бумажные чудеса','creative',690,6,true,24],
    ['mosaic','Мозаика настроения','creative',1490,5,true,120]
  ];
  const descriptions = {
    blocks: 'Строить, разбирать и придумывать заново. Набор для маленьких архитекторов помогает исследовать формы, развивать пространственное мышление и сочинять собственные миры.',
    soft: 'Мягкий друг для тихих вечеров, больших приключений и самых крепких объятий. С ним так приятно придумывать истории и отдыхать после насыщенного дня.',
    games: 'Откладываем экраны и собираемся за одним столом. Простые правила, маленькие открытия и радость совместной игры — для уютного времени всей семьёй.',
    transport: 'Впереди целый мир: дороги из подушек, мосты из книжек и бесконечные маршруты. Игрушечный транспорт вдохновляет на самостоятельные сюжеты и приключения.',
    creative: 'Здесь нет неправильных идей. Набор приглашает пробовать, смешивать, создавать и радоваться собственным открытиям — в своём темпе и без спешки.'
  };
  const products = rows.map(([id,name,category,price,minAge,inStock,pieces]) => {
    const group = categories.find(c => c.id === category);
    return { id,name,category,price,minAge,inStock,pieces,image:group.image,material:group.material,description:descriptions[category] };
  });
  return { categories, products };
})();
