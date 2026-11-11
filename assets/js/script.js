'use strict';
(() => {
  const { products, categories } = window.ShopData;
  const $ = (selector, root = document) => root.querySelector(selector);
  const main = $('#main');
  const page = document.body.dataset.page;
  const money = value => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const find = id => products.find(product => product.id === id);
  const categoryName = id => categories.find(category => category.id === id)?.name || '';
  const image = product => `assets/images/${product.image}`;
  const quantity = value => Math.min(20, Math.max(1, Math.floor(Number(value) || 1)));
  let storageFailed = false;
  function storageWarning() {
    storageFailed = true;
    if (!document.body || $('#storage-warning')) return;
    const warning = document.createElement('div');
    warning.id = 'storage-warning';
    warning.className = 'storage-warning';
    warning.setAttribute('role', 'status');
    warning.textContent = 'Хранилище браузера недоступно. Корзина и тема работают только до перезагрузки страницы.';
    document.body.prepend(warning);
  }
  function readStorage(key) {
    try { return localStorage.getItem(key); } catch { storageWarning(); return null; }
  }
  function writeStorage(key, value) {
    try { localStorage.setItem(key, value); } catch { storageWarning(); }
  }
  function sanitizeCart(raw) {
    const result = [];
    if (!Array.isArray(raw)) return result;
    raw.forEach(item => {
      if (!item || typeof item.id !== 'string' || !find(item.id)?.inStock || !Number.isFinite(item.qty) || item.qty < 1) return;
      const existing = result.find(row => row.id === item.id);
      if (existing) existing.qty = quantity(existing.qty + Math.floor(item.qty));
      else result.push({ id:item.id, qty:quantity(item.qty) });
    });
    return result;
  }
  let cart = [];
  try { cart = sanitizeCart(JSON.parse(readStorage('igrushechnaya-cart-v1') || '[]')); } catch { cart = []; }
  writeStorage('igrushechnaya-cart-v1', JSON.stringify(cart));
  const savedTheme = readStorage('igrushechnaya-theme');
  document.documentElement.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';
  function count() { return cart.reduce((sum, item) => sum + item.qty, 0); }
  function total() { return cart.reduce((sum, item) => sum + find(item.id).price * item.qty, 0); }
  let toastTimer;
  function announce(message) {
    const status = $('#status');
    clearTimeout(toastTimer);
    status.textContent = message;
    toastTimer = setTimeout(() => { status.textContent = ''; }, 4500);
  }
  function saveCart() {
    writeStorage('igrushechnaya-cart-v1', JSON.stringify(cart));
    $('#cart-count').textContent = count();
    $('#cart-count').hidden = count() === 0;
    $('#cart-link').setAttribute('aria-label', `Корзина, товаров: ${count()}`);
  }
  function add(id, amount = 1) {
    const product = find(id);
    if (!product?.inStock) return;
    const existing = cart.find(item => item.id === id);
    const before = existing?.qty || 0;
    if (existing) existing.qty = quantity(before + quantity(amount));
    else cart.push({ id, qty:quantity(amount) });
    saveCart();
    updateCardControls(id);
    announce(before === 20 ? 'В корзине уже 20 штук этого товара — это максимум.' : `${product.name} — добавлено в корзину${before + quantity(amount) > 20 ? ' (не более 20 штук)' : ''}.`);
  }
  const nav = [['index.html','Главная','home'],['catalog.html','Каталог','catalog'],['delivery.html','Доставка','delivery'],['contacts.html','Контакты','contacts']];
  $('#site-header').innerHTML = `<header class="header"><div class="container header-main"><button class="icon-button menu-button" id="menu-toggle" type="button" aria-label="Меню и поиск" aria-expanded="false" aria-controls="navigation header-search">☰</button><a href="index.html" class="brand" aria-label="Игрушечная — главная"><img class="brand-train" src="assets/images/train-logo.svg" alt="" width="52" height="42">игрушечная</a><nav class="nav" id="navigation" aria-label="Основная навигация">${nav.map(([url,title,key]) => `<a href="${url}" ${page === key ? 'aria-current="page"' : ''}>${title}</a>`).join('')}</nav><form class="header-search" action="catalog.html" role="search" id="header-search"><label class="visually-hidden" for="site-search">Поиск игрушек</label><input id="site-search" name="q" type="search" placeholder="Поиск товаров"><button aria-label="Найти" type="submit">⌕</button></form><div class="header-actions"><button class="icon-button" id="theme-toggle" type="button" aria-label="Тёмная тема" aria-pressed="false">◐</button><a class="cart-link" id="cart-link" href="cart.html" aria-label="Корзина, товаров: ${count()}"><svg class="cart-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h3l2.5 12h11l2-8H6"/><path d="M8 15l-1 3h12"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg><span class="count" id="cart-count"${count() ? '' : ' hidden'}>${count()}</span></a></div></div></header>`;
  $('#site-footer').innerHTML = `<footer class="footer"><div class="container"><div class="footer-grid"><div><a class="brand" href="index.html"><img class="brand-train" src="assets/images/train-logo.svg" alt="" width="52" height="42">игрушечная</a><p>Игрушки, с которыми хочется расти.</p></div><div class="footer-links"><h3>Загляните к нам</h3><a href="catalog.html">Каталог игрушек</a><a href="cart.html">Ваша корзина</a><a href="delivery.html">Доставка и оплата</a></div><div class="footer-links"><h3>На связи</h3><a href="contacts.html">Контакты</a><a href="mailto:hello@example.com">hello@example.com</a><a href="tel:+79000000000">+7 900 000-00-00</a><span>г. Москва, ул. Игральная, д. 10</span><span>Пн–Пт: 10:00–20:00<br>Сб–Вс: 10:00–22:00</span></div></div><div class="footer-bottom"><span>© 2026 Игрушечная</span><span>Создано с заботой об игре и воображении</span></div></div></footer>`;
  const hiddenStyle = document.createElement('style');
  hiddenStyle.textContent = '.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}';
  document.head.append(hiddenStyle);
  const status = document.createElement('div');
  status.id = 'status'; status.className = 'toast'; status.setAttribute('role','status'); status.setAttribute('aria-live','polite'); status.setAttribute('aria-atomic','true'); document.body.append(status);
  if (storageFailed) storageWarning();
  function syncThemeButton() {
    const dark = document.documentElement.dataset.theme === 'dark';
    $('#theme-toggle').setAttribute('aria-pressed', String(dark));
    $('#theme-toggle').setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
  }
  syncThemeButton();
  $('#theme-toggle').addEventListener('click', () => {
    document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    writeStorage('igrushechnaya-theme', document.documentElement.dataset.theme); syncThemeButton();
  });
  $('#menu-toggle').addEventListener('click', () => {
    const expanded = $('#menu-toggle').getAttribute('aria-expanded') !== 'true';
    $('#menu-toggle').setAttribute('aria-expanded', String(expanded));
    $('#navigation').classList.toggle('open', expanded); $('#header-search').classList.toggle('open', expanded);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && $('#menu-toggle').getAttribute('aria-expanded') === 'true') {
      $('#menu-toggle').click(); $('#menu-toggle').focus();
    }
  });
  const crumb = title => `<div class="breadcrumb"><a href="index.html">Главная</a> <span aria-hidden="true"> / </span> ${escape(title)}</div>`;
  function renderCardControl(product) {
    const item = cart.find(row => row.id === product.id);
    if (!product.inStock) return `<button class="add-small" disabled aria-label="Нет в наличии: ${product.name}">Нет в наличии</button>`;
    if (!item) return `<button class="add-small" data-add="${product.id}" aria-label="В корзину: ${product.name}">+ В корзину</button>`;
    return `<span class="card-quantity" data-card-control="${product.id}" role="group" aria-label="Количество ${product.name}: ${item.qty}"><button class="card-step" data-card-step="-1" data-id="${product.id}" aria-label="Уменьшить количество: ${product.name}" ${item.qty === 1 ? 'disabled' : ''}>−</button><span aria-live="polite">${item.qty}</span><button class="card-step" data-card-step="1" data-id="${product.id}" aria-label="Увеличить количество: ${product.name}" ${item.qty === 20 ? 'disabled' : ''}>+</button></span>`;
  }
  function updateCardControls(id) {
    document.querySelectorAll(`[data-card-control="${id}"], [data-add="${id}"]`).forEach(node => {
      const item = cart.find(row => row.id === id);
      if (node.matches('[data-card-control]') && item) {
        node.querySelector('span').textContent = item.qty;
        node.setAttribute('aria-label', `Количество ${find(id).name}: ${item.qty}`);
        node.querySelector('[data-card-step="-1"]').disabled = item.qty === 1;
        node.querySelector('[data-card-step="1"]').disabled = item.qty === 20;
      } else {
        const focused = node.contains(document.activeElement) || node === document.activeElement;
        const host = node.closest('.product-bottom');
        node.replaceWith(document.createRange().createContextualFragment(renderCardControl(find(id))));
        if (focused) host.querySelector('[data-card-step="1"], [data-add]')?.focus();
      }
    });
  }
  function card(product) {
    return `<article class="product-card"><a class="product-image" href="product.html?id=${product.id}"><img src="${image(product)}" alt="${product.name}: авторская иллюстрация категории" loading="lazy" width="480" height="400"><span class="age-pill">${product.minAge}+</span></a><div class="product-body"><span class="product-category">${categoryName(product.category)}</span><h3><a href="product.html?id=${product.id}">${product.name}</a></h3><p class="stock ${product.inStock ? '' : 'unavailable'}">${product.inStock ? '● В наличии' : 'Нет в наличии'}</p><div class="product-bottom"><span class="price">${money(product.price)}</span>${renderCardControl(product)}</div></div></article>`;
  }
  function home() {
    main.innerHTML = `<div class="container"><section class="hero"><div class="hero-grid"><div><h1>Большой мир<br>начинается<br>с <em>маленькой игры.</em></h1><p class="hero-copy">Подберём игрушку для любого возраста.</p><div class="buttons"><a class="button" href="catalog.html">Выбрать игрушку <span aria-hidden="true">↗</span></a></div><div class="hero-meta"><span>Для детей от 0 лет</span><span>22 повода для улыбки</span></div></div><div class="hero-art"><img src="assets/images/blocks.svg" alt="Цветной игрушечный город из деревянных кубиков" width="480" height="400"></div></div></section><section class="section" aria-labelledby="categories-title"><div class="section-head"><h2 id="categories-title">Категории</h2></div><div class="category-grid">${categories.map(category => `<a class="category-card" href="catalog.html?category=${category.id}"><img src="assets/images/${category.image}" alt="" width="480" height="400"><h3>${category.name}</h3></a>`).join('')}</div></section><section class="section" aria-labelledby="featured-title"><div class="section-head"><h2 id="featured-title">Маленькие любимчики</h2><a class="text-link" href="catalog.html">Весь каталог ↗</a></div><div class="product-grid">${['city','bear','race','paint'].map(id => card(find(id))).join('')}</div></section></div>`;
  }
  function catalog() {
    const params = new URLSearchParams(location.search);
    main.innerHTML = `<div class="container">${crumb('Каталог')}<h1 class="page-title">Каталог товаров</h1><div class="catalog-layout"><details class="filters" id="filters" open><summary>Подобрать игрушку</summary><form id="filter-form"><div class="field"><label for="filter-q">Поиск по названию</label><input id="filter-q" name="q" type="search" placeholder="Например, мишка"></div><div class="field"><label for="filter-min">Цена, ₽</label><div class="price-fields"><input id="filter-min" name="min" type="number" min="0" max="1000000" placeholder="От" aria-label="Цена от, рублей"><input id="filter-max" name="max" type="number" min="0" max="1000000" placeholder="До" aria-label="Цена до, рублей"></div></div><div class="field"><label for="filter-category">Категория</label><select id="filter-category" name="category"><option value="">Все игрушки</option>${categories.map(category => `<option value="${category.id}">${category.name}</option>`).join('')}</select></div><div class="field"><label for="filter-age">Возраст ребёнка, лет</label><input id="filter-age" name="age" type="number" min="0" max="99" step="1" placeholder="Любой"></div><label class="check-label" for="filter-stock"><input type="checkbox" id="filter-stock" name="stock" value="1">Только в наличии</label><span class="error" id="filter-error" role="alert"></span><button class="button" type="submit">Показать игрушки</button><button class="button secondary" id="reset-filters" type="button">Сбросить всё</button></form></details><div><div class="toolbar"><p id="results-count" role="status" aria-live="polite"></p><div><label class="visually-hidden" for="sort">Сортировка</label><select id="sort"><option value="default">Сначала рекомендуемые</option><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option><option value="name">По названию: А–Я</option></select></div></div><div class="product-grid catalog-products" id="results"></div></div></div></div>`;
    const form = $('#filter-form');
    ['q','category','age','min','max'].forEach(key => {
      let value = params.get(key) || '';
      if (key === 'category' && !categories.some(category => category.id === value)) value = '';
      if (['age','min','max'].includes(key) && (!/^\d+$/.test(value) || Number(value) > (key === 'age' ? 99 : 1000000))) value = '';
      form.elements[key].value = value;
    });
    form.elements.stock.checked = params.get('stock') === '1';
    if (['default','price-asc','price-desc','name'].includes(params.get('sort'))) $('#sort').value = params.get('sort');
    if (matchMedia('(max-width:800px)').matches) $('#filters').open = false;
    function apply(updateUrl) {
      const q = form.elements.q.value.trim().toLocaleLowerCase('ru');
      const category = form.elements.category.value;
      const age = form.elements.age.value;
      const min = form.elements.min.value;
      const max = form.elements.max.value;
      if (min !== '' && max !== '' && Number(min) > Number(max)) { $('#filter-error').textContent = 'Цена «от» не должна превышать цену «до».'; return; }
      $('#filter-error').textContent = '';
      let result = products.filter(product => (!q || product.name.toLocaleLowerCase('ru').includes(q)) && (!category || product.category === category) && (age === '' || product.minAge <= Number(age)) && (min === '' || product.price >= Number(min)) && (max === '' || product.price <= Number(max)) && (!form.elements.stock.checked || product.inStock));
      const sort = $('#sort').value;
      if (sort === 'price-asc') result.sort((a,b) => a.price-b.price);
      if (sort === 'price-desc') result.sort((a,b) => b.price-a.price);
      if (sort === 'name') result.sort((a,b) => a.name.localeCompare(b.name,'ru'));
      $('#results-count').textContent = `Найдено товаров: ${result.length}`;
      $('#results').innerHTML = result.length ? result.map(card).join('') : '<div class="empty" style="grid-column:1/-1"><h2>Пока ничего не нашлось</h2><p>Попробуйте другую цену, категорию или сбросьте фильтры.</p><button class="button secondary" data-reset>Сбросить фильтры</button></div>';
      if (updateUrl) {
        const next = new URLSearchParams();
        ['q','category','age','min','max'].forEach(key => { const value = form.elements[key].value.trim(); if (value) next.set(key,value); });
        if (form.elements.stock.checked) next.set('stock','1');
        if (sort !== 'default') next.set('sort',sort);
        history.replaceState(null,'',`catalog.html${next.size ? `?${next}` : ''}`);
      }
    }
    function reset() { form.reset(); $('#sort').value = 'default'; apply(true); }
    form.addEventListener('submit', event => { event.preventDefault(); apply(true); });
    $('#sort').addEventListener('change', () => { if (form.reportValidity()) apply(true); });
    $('#reset-filters').addEventListener('click',reset);
    $('#results').addEventListener('click',event => { if (event.target.closest('[data-reset]')) reset(); });
    apply(false);
  }
  function productPage() {
    const product = find(new URLSearchParams(location.search).get('id'));
    if (!product) { main.innerHTML = `<div class="container">${crumb('Игрушка не найдена')}<div class="empty"><h1 class="page-title">Эта игрушка потерялась</h1><p>Возможно, ссылка устарела. В каталоге есть ещё много интересного.</p><a class="button" href="catalog.html">Вернуться в каталог</a></div></div>`; return; }
    document.title = `${product.name} — Игрушечная`;
    main.innerHTML = `<div class="container">${crumb(categoryName(product.category))}<div class="product-detail"><div class="detail-image"><img src="${image(product)}" alt="${product.name}: иллюстрация" width="480" height="400"><span class="age-pill">Для детей от ${product.minAge} лет</span></div><div class="product-info"><span class="eyebrow">${categoryName(product.category)}</span><h1>${product.name}</h1><p class="stock ${product.inStock ? '' : 'unavailable'}">${product.inStock ? '● В наличии — готова к приключениям' : 'Нет в наличии'}</p><div class="detail-price">${money(product.price)}</div><p class="lead">${product.description}</p><form id="buy-form" class="detail-buy"><div><label class="visually-hidden" for="product-qty">Количество, от 1 до 20</label><div class="quantity"><button type="button" data-product-step="-1" aria-label="Уменьшить количество">−</button><input id="product-qty" type="number" min="1" max="20" step="1" value="1" required><button type="button" data-product-step="1" aria-label="Увеличить количество">+</button></div></div><button class="button" type="submit" ${product.inStock ? '' : 'disabled'}>${product.inStock ? 'Добавить в корзину ↗' : 'Пока нет в наличии'}</button></form><h2 style="font-size:23px">Поближе познакомимся</h2><dl class="specs"><div><dt>Минимальный возраст</dt><dd>${product.minAge}+</dd></div><div><dt>Материал</dt><dd>${product.material}</dd></div><div><dt>Элементов в наборе</dt><dd>${product.pieces}</dd></div><div><dt>Артикул</dt><dd>TOY-${product.id.toUpperCase()}</dd></div></dl><div class="notice">Для детей младшего возраста — игра под присмотром взрослого.</div></div></div><section class="section" style="padding-bottom:60px"><div class="section-head"><h2>Ещё немного радости</h2><a class="text-link" href="catalog.html?category=${product.category}">Вся категория ↗</a></div><div class="product-grid">${products.filter(item => item.category === product.category && item.id !== product.id).slice(0,4).map(card).join('')}</div></section></div>`;
    $('#buy-form').addEventListener('submit', event => { event.preventDefault(); add(product.id, quantity($('#product-qty').value)); });
    $('#product-qty').addEventListener('change', event => { event.target.value = quantity(event.target.value); });
    document.querySelectorAll('[data-product-step]').forEach(button => button.addEventListener('click', () => { $('#product-qty').value = quantity(Number($('#product-qty').value) + Number(button.dataset.productStep)); }));
  }
  function emptyCart(checkout = false) {
    return `<div class="container">${crumb(checkout ? 'Оформление' : 'Корзина')}<div class="empty"><h1 class="page-title">${checkout ? 'Оформление заказа' : 'Корзина'}</h1><p>В корзине пока нет товаров.</p><a class="button" href="catalog.html">Заглянуть в каталог ↗</a></div></div>`;
  }
  function cartPage(focusKey) {
    if (!cart.length) { main.innerHTML = emptyCart(); if (focusKey) main.focus(); return; }
    main.innerHTML = `<div class="container">${crumb('Корзина')}<h1 class="page-title">Корзина</h1><div class="cart-layout"><div>${cart.map(item => { const product = find(item.id); return `<article class="cart-row"><a href="product.html?id=${product.id}"><img src="${image(product)}" alt="${product.name}" width="100" height="100"></a><div><h3><a href="product.html?id=${product.id}">${product.name}</a></h3><p class="stock">${money(product.price)} за штуку · ${product.minAge}+</p><div class="cart-controls"><div class="quantity"><button data-cart-step="-1" data-id="${item.id}" data-focus="minus-${item.id}" aria-label="Уменьшить: ${product.name}" ${item.qty === 1 ? 'disabled' : ''}>−</button><label class="visually-hidden" for="qty-${item.id}">Количество: ${product.name}</label><input type="number" id="qty-${item.id}" data-cart-qty="${item.id}" data-focus="input-${item.id}" min="1" max="20" step="1" value="${item.qty}"><button data-cart-step="1" data-id="${item.id}" data-focus="plus-${item.id}" aria-label="Увеличить: ${product.name}" ${item.qty === 20 ? 'disabled' : ''}>+</button></div><button class="remove-button" data-remove="${item.id}" aria-label="Удалить: ${product.name}">Убрать</button></div></div><span class="price">${money(product.price * item.qty)}</span></article>`; }).join('')}<button class="clear-cart" id="clear-cart">Очистить корзину</button></div><aside class="summary" aria-label="Итог корзины"><h2>Корзина</h2><div class="summary-line"><span>Товаров</span><span>${count()}</span></div><div class="summary-line summary-total"><span>Товары на сумму</span><span>${money(total())}</span></div><small>Доставка рассчитывается на следующем шаге: самовывоз — бесплатно, доставка — 300 ₽.</small><a class="button" href="checkout.html">Перейти к оформлению ↗</a></aside></div></div>`;
    $('#clear-cart').addEventListener('click', () => { if (confirm('Убрать все игрушки из корзины?')) { cart = []; saveCart(); cartPage('empty'); announce('Корзина очищена.'); } });
    if (focusKey) {
      const control = $(`[data-focus="${focusKey}"]`);
      if (control && !control.disabled) control.focus();
      else if (control) control.closest('.quantity').querySelector('input').focus();
      else main.focus();
    }
  }
  function checkout() {
    if (!cart.length) { main.innerHTML = emptyCart(true); return; }
    main.innerHTML = `<div class="container">${crumb('Оформление')}<h1 class="page-title">Оформление заказа</h1><div class="checkout-layout"><form id="checkout-form" class="checkout-form" novalidate><h2>Контактные данные</h2><div class="form-grid"><div class="field full"><label for="customer-name">Имя *</label><input id="customer-name" name="customerName" autocomplete="off" maxlength="80" required aria-describedby="name-error"><span class="error" id="name-error"></span></div><div class="field"><label for="customer-email">Email *</label><input id="customer-email" name="customerEmail" type="email" autocomplete="off" maxlength="120" placeholder="@example.com" required aria-describedby="email-error"><span class="error" id="email-error"></span></div><div class="field"><label for="customer-phone">Телефон *</label><input id="customer-phone" name="customerPhone" type="tel" autocomplete="off" maxlength="25" placeholder="+7 000 000-00-00" required aria-describedby="phone-error"><span class="error" id="phone-error"></span></div></div><h2 id="delivery-choice-title">Как получить</h2><div class="delivery-options" role="group" aria-labelledby="delivery-choice-title"><label class="delivery-option"><input type="radio" name="delivery" value="pickup" checked>Самовывоз · бесплатно</label><label class="delivery-option"><input type="radio" name="delivery" value="courier">Доставка · 300 ₽</label></div><fieldset id="delivery-address" class="address-fields" hidden disabled><legend>Адрес доставки</legend><div class="form-grid">${[['city','Город',true],['district','Район',false],['street','Улица',true],['house','Дом',true],['apartment','Квартира',true]].map(([key,label,required]) => `<div class="field" id="address-${key}-field"><label for="address-${key}">${label}${required ? ' *' : ''}</label><input id="address-${key}" name="${key}" type="text" maxlength="120" ${required ? 'required' : ''} aria-describedby="${key}-error"><span class="error" id="${key}-error"></span></div>`).join('')}<label class="check-label full" for="private-house"><input type="checkbox" id="private-house" name="privateHouse">Частный дом</label></div></fieldset><button class="button" type="submit">Завершить оформление</button><div id="form-status" role="alert" class="error"></div></form><aside class="summary"><h2>Корзина</h2>${cart.map(item => `<div class="summary-line"><span>${find(item.id).name} × ${item.qty}</span><span>${money(find(item.id).price*item.qty)}</span></div>`).join('')}<div class="summary-line"><span>Товары</span><span>${money(total())}</span></div><div class="summary-line"><span>Доставка</span><span id="delivery-price">Бесплатно</span></div><div class="summary-line summary-total"><span>Итого</span><span id="checkout-total">${money(total())}</span></div></aside></div></div>`;
    const form = $('#checkout-form');
    function syncDelivery() {
      const courier = form.elements.delivery.value === 'courier';
      const address = $('#delivery-address');
      address.hidden = !courier;
      address.disabled = !courier;
      const privateHouse = form.elements.privateHouse.checked;
      form.elements.apartment.disabled = privateHouse;
      form.elements.apartment.required = !privateHouse;
      $('#address-apartment-field').classList.toggle('is-disabled', privateHouse);
      $('#address-apartment-field label').textContent = privateHouse ? 'Квартира' : 'Квартира *';
      ['city','district','street','house','apartment'].forEach(key => {
        if (!courier || (key === 'apartment' && privateHouse)) {
          form.elements[key].removeAttribute('aria-invalid');
          $(`#${key}-error`).textContent = '';
        }
      });
      const fee = courier ? 300 : 0;
      $('#delivery-price').textContent = fee ? money(fee) : 'Бесплатно';
      $('#checkout-total').textContent = money(total()+fee);
    }
    form.addEventListener('change', syncDelivery);
    syncDelivery();
    function validate(input, errorId, message) {
      const error = $(`#${errorId}`);
      input.setAttribute('aria-invalid', String(Boolean(message)));
      error.textContent = message;
      return !message;
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      const name = form.elements.customerName;
      const email = form.elements.customerEmail;
      const phone = form.elements.customerPhone;
      const phoneDigits = phone.value.replace(/\D/g,'');
      const checks = [
        validate(name,'name-error',name.value.trim().length < 2 ? 'Укажите имя: не менее двух символов.' : ''),
        validate(email,'email-error',!email.value.trim() || !email.validity.valid ? 'Укажите email в формате name@example.com.' : ''),
        validate(phone,'phone-error',!/^\+?[\d\s()\-]+$/.test(phone.value.trim()) || phoneDigits.length < 10 || phoneDigits.length > 15 ? 'Укажите телефон: от 10 до 15 цифр.' : '')
      ];
      if (form.elements.delivery.value === 'courier') {
        ['city','street','house','apartment'].forEach(key => {
          const input = form.elements[key];
          const invalid = !input.disabled && input.required && !input.value.trim();
          checks.push(validate(input, `${key}-error`, invalid ? 'Заполните это поле.' : ''));
        });
      }
      if (checks.includes(false)) { $('#form-status').textContent = 'Проверьте отмеченные поля.'; $('[aria-invalid="true"]',form).focus(); return; }
      if (!cart.length) { checkout(); return; }
      const delivery = form.elements.delivery.value;
      const fee = delivery === 'courier' ? 300 : 0;
      const items = cart.map(item => ({ ...item }));
      const itemsTotal = total();
      const id = `IGR-${Date.now().toString(36).toUpperCase()}`;
      form.reset();
      cart = []; saveCart();
      main.innerHTML = `<div class="container"><section class="success"><span class="success-icon" aria-hidden="true">✓</span><span class="eyebrow">Всё получилось</span><h1 tabindex="-1" id="success-title">Оформление завершено!</h1><p>Спасибо, что выбрали «Игрушечную».</p><div class="notice">Номер: <strong>${id}</strong></div><h2 style="font-size:23px">Ваш выбор</h2>${items.map(item => `<div class="summary-line"><span>${find(item.id).name} × ${item.qty}</span><span>${money(find(item.id).price*item.qty)}</span></div>`).join('')}<div class="summary-line"><span>${delivery === 'courier' ? 'Доставка' : 'Самовывоз'}</span><span>${fee ? money(fee) : 'Бесплатно'}</span></div><div class="summary-line summary-total"><span>Итого</span><span>${money(itemsTotal+fee)}</span></div><p class="lead">Корзина очищена. Итог доступен только на этом экране до перезагрузки.</p><a class="button" href="catalog.html">Вернуться в каталог ↗</a></section></div>`;
      $('#success-title').focus();
      announce('Оформление завершено. Корзина очищена.');
    });
  }
  function delivery() {
    main.innerHTML = `<div class="container">${crumb('Доставка и оплата')}<h1 class="page-title">Доставка и оплата</h1><p class="lead">Выберите удобный способ получения. Стоимость сразу появится в итоговом расчёте.</p><div class="content-columns"><section class="info-card"><span class="eyebrow">01 / Забрать самим</span><h2>Самовывоз без спешки</h2><p>Самовывоз не увеличивает стоимость выбранных игрушек.</p><div class="notice">Самовывоз · бесплатно</div></section><section class="info-card"><span class="eyebrow">02 / Привезти к двери</span><h2>Доставка за 300 ₽</h2><p>Фиксированная сумма добавляется к стоимости товаров на странице оформления независимо от размера корзины.</p><div class="notice">Доставка · 300 ₽</div></section><section class="info-card"><h2>Всё в одном расчёте</h2><p>На странице оформления вы увидите выбранные товары, количество, стоимость получения и общую сумму.</p><p>Банковские реквизиты на сайте не запрашиваются.</p></section><section class="info-card"><h2>Остались вопросы?</h2><p>Информация об игрушке, материалах и подходящем возрасте находится в её карточке.</p><a class="text-link" href="contacts.html">Связаться с нами ↗</a></section></div></div>`;
  }
  function contacts() {
    main.innerHTML = `<div class="container">${crumb('Контакты')}<h1 class="page-title">Контакты</h1><div class="content-columns"><section class="info-card"><span class="eyebrow">На связи</span><h2>Напишите нам</h2><p><strong>Email</strong><br><a class="text-link" href="mailto:hello@example.com">hello@example.com</a></p><p>Есть вопрос об игрушках или пожелание? Начните письмо с названия товара — так будет проще разобраться в деталях.</p></section><div class="contact-illustration"><img src="assets/images/bear.svg" alt="Добрый иллюстрированный медвежонок с зелёной бабочкой" width="480" height="400"></div><section class="info-card"><h2>Игра для каждого</h2><p>Подбирайте игрушки по возрасту и интересам: стройте города, сочиняйте истории, творите и играйте всей семьёй.</p><a class="button" href="catalog.html">Посмотреть игрушки ↗</a></section><section class="info-card"><h2>Удобно выбирать</h2><p>Корзина и выбранная тема сохраняются в вашем браузере. Выбранные товары будут доступны при следующем посещении.</p><p>Для удаления товаров воспользуйтесь кнопкой «Очистить корзину».</p></section></div></div>`;
  }
  document.addEventListener('click', event => {
    const addButton = event.target.closest('[data-add]');
    if (addButton) add(addButton.dataset.add);
    const cardStep = event.target.closest('[data-card-step]');
    if (cardStep && !cardStep.disabled) {
      const item = cart.find(row => row.id === cardStep.dataset.id);
      if (!item || !find(item.id)?.inStock) return;
      item.qty = quantity(item.qty + Number(cardStep.dataset.cardStep));
      saveCart(); updateCardControls(item.id);
      if (cardStep.disabled) cardStep.parentElement.querySelector('button:not(:disabled)')?.focus();
      announce('Количество обновлено.');
    }
    const stepButton = event.target.closest('[data-cart-step]');
    if (stepButton) {
      const item = cart.find(row => row.id === stepButton.dataset.id);
      if (!item) return;
      item.qty = quantity(item.qty + Number(stepButton.dataset.cartStep));
      saveCart(); cartPage(stepButton.dataset.focus); announce('Количество обновлено.');
    }
    const removeButton = event.target.closest('[data-remove]');
    if (removeButton) { cart = cart.filter(item => item.id !== removeButton.dataset.remove); saveCart(); cartPage('removed'); announce('Игрушка убрана из корзины.'); }
  });
  document.addEventListener('change', event => {
    const input = event.target.closest('[data-cart-qty]');
    if (!input) return;
    const item = cart.find(row => row.id === input.dataset.cartQty);
    if (item) { item.qty = quantity(input.value); saveCart(); cartPage(input.dataset.focus); announce('Количество обновлено.'); }
  });
  window.addEventListener('storage', event => {
    if (event.key === 'igrushechnaya-cart-v1' || event.key === null) {
      try { cart = sanitizeCart(JSON.parse(readStorage('igrushechnaya-cart-v1') || '[]')); } catch { cart = []; }
      $('#cart-count').textContent = count();
    $('#cart-count').hidden = count() === 0;
      $('#cart-link').setAttribute('aria-label', `Корзина, товаров: ${count()}`);
      products.forEach(product => updateCardControls(product.id));
      if (page === 'cart') cartPage();
      if (page === 'checkout' && $('#checkout-form')) checkout();
      announce('Корзина обновлена в другой вкладке.');
    }
  });
  ({ home, catalog, product:productPage, cart:cartPage, checkout, delivery, contacts }[page] || home)();
})();
