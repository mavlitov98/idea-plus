/* =========================================================
   ИДЕЯ ПЛЮС: interactions
   меню · шапка · появление при прокрутке · галерея · просмотр фото
   Без обработчиков scroll: всё на IntersectionObserver.
   ========================================================= */
(() => {
  'use strict';

  /* ---- Работы. Один объект = один проект (одна или несколько фотографий).

     Как добавить работу:
       1. Создайте папку assets/work-examples/<название-латиницей>/ и положите туда фото.
          Первое фото в списке станет обложкой.
       2. Запустите  python3 tools/prepare-photos.py  (уменьшит тяжёлые фото
          и сделает превью в подпапке thumbs/). Без превью сайт тоже работает,
          просто грузит полные фото.
       3. Добавьте объект в массив ниже. Новые работы ставьте наверх:
          первые 6 видны сразу, остальные открываются кнопкой «Показать ещё».

     hero: true = работа попадает в слайдшоу на первом экране (лучше 4-6 штук,
     горизонтальные фото хорошего качества; без пометок берутся первые 5).
     large: большая версия первого фото (~2800 px по ширине) для слайдшоу на больших и Retina-экранах,
     называйте её <имя>-large.jpg; основное фото при этом должно быть ~1800 px.
     focus: какую часть фото держать в кадре, когда он обрезается (в hero на телефоне),
     в формате CSS object-position, например '20% 50%' = ближе к левому краю.
     Поля: title и category обязательны; alt = описание фото для незрячих и поиска;
     note = необязательная подпись под названием.
     Категории фильтров собираются из поля category сами, пишите их одинаково. ---- */
  const WORKS = [
    {
      id: 'vanity-green',
      title: 'Тумба и пеналы в ванную',
      category: 'Мебель для ванной',
      photos: ['temp/photo_1_2026-09-06_21-29-52.jpg'],
      alt: 'Ванная комната: высокие пеналы и тумба с зелёными матовыми фасадами, рейчатая панель из шпона над раковиной',
      note: 'Матовые фасады, рейчатая панель из шпона и скрытые ручки-профили.',
    },
    {
      id: 'hallway-blue',
      title: 'Прихожая с гардеробной',
      category: 'Гардеробные',
      photos: ['temp/photo_2_2026-09-06_21-29-52.jpg'],
      alt: 'Прихожая со встроенным синим шкафом от пола до потолка и мягкой скамьёй с крючками',
      note: 'Шкаф от пола до потолка, мягкие панели с крючками и скамья для обуви в одной системе.',
    },
    {
      id: 'bedroom-arch',
      title: 'Спальня с нишей-аркой',
      category: 'Спальни',
      photos: ['temp/photo_3_2026-09-06_21-29-52.jpg'],
      alt: 'Спальня с арочной нишей, встроенным синим шкафом и подвесными прикроватными тумбами',
      note: 'Встроенный шкаф в тон стен, арочная ниша и подвесные тумбы вместо привычных ножек.',
    },
  ];
  /* ---- ДЕМО: 10 фото с Unsplash, чтобы посмотреть, как сайт выглядит с хорошими снимками.
     Это НЕ наши работы, публиковать их как свои нельзя. Перед публикацией удалите
     этот блок целиком и папку assets/work-examples/demo-unsplash/ (авторы в ИСТОЧНИКИ.txt). ---- */
  const DEMO = 'demo-unsplash/';
  const DEMO_WORKS = [
    { id: 'demo-wardrobe', hero: true, focus: '22% 50%', title: 'Гардеробная с туалетным столиком', category: 'Гардеробные', photos: [DEMO + 'wardrobe-vanity.jpg'], large: DEMO + 'wardrobe-vanity-large.jpg',
      alt: 'Гардеробная: стеклянные фасады с подсветкой, открытые полки и туалетный столик с круглым зеркалом',
      note: 'Стеклянные фасады, подсветка полок и столик с зеркалом в одной системе.' },
    { id: 'demo-kitchen-island', hero: true, title: 'Кухня с островом', category: 'Кухни', photos: [DEMO + 'kitchen-walnut-island.jpg'], large: DEMO + 'kitchen-walnut-island-large.jpg',
      alt: 'Кухня с деревянными фасадами, высокой колонной и островом со светлой столешницей' },
    { id: 'demo-tv', title: 'ТВ-зона с колонной из шпона', category: 'Гостиные', photos: [DEMO + 'living-tv-veneer.jpg'],
      alt: 'Гостиная: подвесная тумба под телевизор и высокая колонна, отделанная шпоном',
      note: 'Подвесная тумба и колонна до потолка, фасады без ручек.' },
    { id: 'demo-bath-twin', hero: true, title: 'Две тумбы под раковины', category: 'Мебель для ванной', photos: [DEMO + 'bath-twin-vanities.jpg'], large: DEMO + 'bath-twin-vanities-large.jpg',
      alt: 'Ванная с двумя деревянными тумбами под раковины и овальными зеркалами' },
    { id: 'demo-shelves-door', title: 'Стеллаж вокруг дверного проёма', category: 'Гостиные', photos: [DEMO + 'living-builtin-shelves.jpg'],
      alt: 'Белый встроенный стеллаж с книгами, обрамляющий дверной проём, с закрытыми ящиками внизу' },
    { id: 'demo-kitchen-walnut', title: 'Кухня из ореха', category: 'Кухни', photos: [DEMO + 'kitchen-walnut.jpg'],
      alt: 'Небольшая кухня с ореховыми фасадами и открытыми полками над мойкой' },
    { id: 'demo-kitchen-white', hero: true, title: 'Белая кухня с мраморным островом', category: 'Кухни', photos: [DEMO + 'kitchen-white-marble.jpg'], large: DEMO + 'kitchen-white-marble-large.jpg',
      alt: 'Белая кухня с филёнчатыми фасадами, шестигранной плиткой и мраморным островом' },
    { id: 'demo-bath-long', title: 'Ванная с длинной тумбой', category: 'Мебель для ванной', photos: [DEMO + 'bath-vanity-dark.jpg'],
      alt: 'Ванная с длинной тёмной тумбой под две раковины и большим зеркалом в деревянной раме' },
    { id: 'demo-shelves-wall', hero: true, title: 'Стеллаж во всю стену', category: 'Гостиные', photos: [DEMO + 'living-wall-shelves.jpg'], large: DEMO + 'living-wall-shelves-large.jpg',
      alt: 'Гостиная со стеллажом во всю стену и бирюзовыми дверцами в нижнем ряду' },
    { id: 'demo-bedroom', title: 'Спальня с мягким изголовьем', category: 'Спальни', photos: [DEMO + 'bedroom-headboard.jpg'],
      alt: 'Спальня с высоким мягким изголовьем и тёмной прикроватной тумбой' },
  ];
  WORKS.unshift(...DEMO_WORKS);
  /* ---- конец ДЕМО ---- */

  const PHOTO_DIR = 'assets/work-examples/';
  const FIRST_BATCH = 6;     // сколько работ видно сразу
  const BATCH = 6;           // сколько добавляет «Показать ещё»
  const FILTERS_FROM = 6;    // фильтры появляются, когда работ столько или больше

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const hasIO = 'IntersectionObserver' in window;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // текущий раздел страницы: обновляется наблюдателем ниже, читается меню
  let currentSection = 'hero';

  /* ---------- мобильное меню ---------- */
  (() => {
    const burger = $('#burger');
    const menu = $('#menu');
    if (!burger || !menu) return;
    const links = $$('a', menu);
    let lastFocus = null;
    const isOpen = () => document.body.classList.contains('menu-open');

    function open() {
      lastFocus = document.activeElement;
      links.forEach((a) => a.classList.toggle('is-current', a.dataset.section === currentSection));
      document.body.classList.add('menu-open');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Закрыть меню');
      menu.setAttribute('aria-hidden', 'false');
      menu.removeAttribute('inert');
      document.addEventListener('keydown', onKey);
    }
    function close(restore = true) {
      document.body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Открыть меню');
      menu.setAttribute('aria-hidden', 'true');
      menu.setAttribute('inert', '');
      document.removeEventListener('keydown', onKey);
      if (restore && lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') return close();
      if (e.key !== 'Tab') return;
      const f = [burger, ...links];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    burger.addEventListener('click', () => (isOpen() ? close() : open()));
    links.forEach((a) => a.addEventListener('click', () => close(false)));
    // меню только для мобильной ширины: при развороте на десктоп закрываем
    window.matchMedia('(min-width: 961px)').addEventListener('change', (m) => { if (m.matches && isOpen()) close(false); });
  })();

  /* ---------- шапка получает фон, как только страница сдвинулась ---------- */
  const nav = $('#nav');
  const sentinel = $('#top-sentinel');
  if (nav && sentinel && hasIO) {
    new IntersectionObserver(([e]) => nav.classList.toggle('is-scrolled', !e.isIntersecting)).observe(sentinel);
  }

  /* ---------- кнопка звонка: скрыта в hero и у подвала ---------- */
  (() => {
    const fab = $('.fab');
    if (!fab) return;
    if (!hasIO) { fab.classList.add('is-visible'); return; }
    const state = { hero: true, footer: false };
    const update = () => fab.classList.toggle('is-visible', !state.hero && !state.footer);
    const watch = (el, key) => el && new IntersectionObserver(([e]) => { state[key] = e.isIntersecting; update(); }).observe(el);
    watch($('#hero'), 'hero');
    watch($('.footer'), 'footer');
  })();

  /* ---------- появление при прокрутке ---------- */
  const revealIO = hasIO
    ? new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' })
    : null;
  const observeReveal = (el) => (revealIO ? revealIO.observe(el) : el.classList.add('is-in'));
  $$('.reveal').forEach(observeReveal);

  // шаги процесса: заливка едет по желобку, ручки загораются по очереди
  const steps = $('#steps');
  if (steps) {
    $$('.step', steps).forEach((st, i) => st.style.setProperty('--i', i));
    if (hasIO) {
      const stepsIO = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { steps.classList.add('is-in'); stepsIO.disconnect(); }
      }, { threshold: 0.35 });
      stepsIO.observe(steps);
    } else steps.classList.add('is-in');
  }

  /* ---------- циферблаты: цифры считаются вверх, пока заполняется кольцо (1.8 с, как в CSS) ---------- */
  const counters = $$('[data-count]');
  if (counters.length && hasIO && !reduceMotion) {
    counters.forEach((el) => { el.textContent = '0'; });
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        countIO.unobserve(e.target);
        const el = e.target, to = +el.dataset.count, t0 = performance.now() + 200;
        const tick = (now) => {
          const p = Math.min(1, Math.max(0, (now - t0) / 1800));
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countIO.observe(el));
  }

  /* ---------- текущий раздел: подсветка пункта в шапке ---------- */
  if (hasIO) {
    const navLinks = $$('.nav__links a');
    const byId = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const secIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        currentSection = e.target.id;
        navLinks.forEach((a) => a.classList.toggle('is-current', a === byId.get(e.target.id)));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((sec) => secIO.observe(sec));
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  // смена раскладки с плавным переездом карточек (View Transitions), если браузер умеет
  const canMorph = !!document.startViewTransition && !reduceMotion;
  const morph = (fn) => (canMorph ? document.startViewTransition(fn) : fn());

  /* ========================================================
     ГАЛЕРЕЯ: группы «большая + две поменьше», стороны чередуются;
     первые FIRST_BATCH работ сразу, остальные по кнопке
     ======================================================== */
  const photoUrl = (p) => PHOTO_DIR + p;
  // превью: <папка>/thumbs/<имя>.webp (делает tools/prepare-photos.py); если его нет, берём оригинал
  const thumbUrl = (p) => PHOTO_DIR + p.replace(/([^/]+)\.\w+$/, 'thumbs/$1.webp');

  const grid = $('#works-grid');
  const filtersEl = $('#works-filters');
  const moreWrap = $('#works-more');
  const moreBtn = $('#works-more-btn');
  const moreNote = $('#works-more-note');
  let activeCategory = 'Все';
  let shownCount = FIRST_BATCH;
  const cardsById = new Map();

  // фото проявляется, когда карточка в экране и снимок загружен
  const showIO = hasIO && !reduceMotion
    ? new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const card = e.target;
        showIO.unobserve(card);
        const img = $('img', card);
        const show = () => card.classList.add('is-shown');
        if (img.complete && img.naturalWidth) show();
        else {
          img.addEventListener('load', show, { once: true });
          img.addEventListener('error', show, { once: true });
        }
      });
    }, { threshold: 0.15 })
    : null;

  WORKS.forEach((w) => {
    const count = w.photos.length;
    const card = document.createElement('article');
    card.className = 'work';
    card.hidden = true;
    card.style.viewTransitionName = 'work-' + w.id;
    card.innerHTML = `
      <button class="work__frame" type="button" aria-label="Открыть фото: ${escapeHtml(w.title)}">
        <img src="${thumbUrl(w.photos[0])}" alt="${escapeHtml(w.alt || w.title)}" loading="lazy" decoding="async">
      </button>
      <div class="work__cap">
        <h3 class="work__title">${escapeHtml(w.title)}</h3>
        <span class="work__cat">${escapeHtml(w.category)}${count > 1 ? `, ${count} фото` : ''}</span>
      </div>
      ${w.note ? `<p class="work__note">${escapeHtml(w.note)}</p>` : ''}`;
    const img = $('img', card);
    // превью ещё не сделано: один раз переключаемся на оригинал
    img.addEventListener('error', () => { if (img.src.includes('/thumbs/')) img.src = photoUrl(w.photos[0]); }, { once: true });
    $('.work__frame', card).addEventListener('click', () => {
      const list = filtered();
      Lightbox.open(list, list.indexOf(w));
    });
    grid.appendChild(card);
    cardsById.set(w.id, card);
  });

  const filtered = () => (activeCategory === 'Все' ? WORKS : WORKS.filter((w) => w.category === activeCategory));

  if (WORKS.length >= FILTERS_FROM) {
    const counts = new Map();
    WORKS.forEach((w) => counts.set(w.category, (counts.get(w.category) || 0) + 1));
    [['Все', WORKS.length], ...counts].forEach(([cat, n]) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'pill';
      chip.dataset.category = cat;
      chip.setAttribute('aria-pressed', String(cat === activeCategory));
      chip.innerHTML = `${escapeHtml(cat)}<span class="pill__count">${n}</span>`;
      chip.addEventListener('click', () => {
        if (cat === activeCategory) return;
        morph(() => {
          activeCategory = cat;
          shownCount = FIRST_BATCH;
          $$('.pill', filtersEl).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.category === cat)));
          renderWorks();
        });
      });
      filtersEl.appendChild(chip);
    });
    filtersEl.hidden = false;
  }

  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      const from = shownCount;
      shownCount += BATCH;
      renderWorks(from);
      // фокус на первую новую работу, чтобы с клавиатуры не возвращаться к началу
      const first = filtered()[from];
      if (first) $('.work__frame', cardsById.get(first.id)).focus({ preventScroll: true });
    });
  }

  // раскладка по показанным работам: полные тройки = большая + две малые,
  // хвост из одной работы = во всю ширину, из двух = пополам.
  // newFrom: индекс, с которого работы только что добавлены (для анимации появления)
  function renderWorks(newFrom = -1) {
    const list = filtered();
    const shown = list.slice(0, shownCount);
    const fullGroups = Math.floor(shown.length / 3);
    const tail = shown.length - fullGroups * 3;

    WORKS.forEach((w) => { cardsById.get(w.id).hidden = !shown.includes(w); });
    shown.forEach((w, i) => {
      const card = cardsById.get(w.id);
      const group = Math.floor(i / 3);
      card.classList.remove('work--big', 'work--small', 'work--wide', 'work--half', 'is-flip', 'is-new');
      if (group < fullGroups) {
        card.classList.add(i % 3 === 0 ? 'work--big' : 'work--small');
        card.classList.toggle('is-flip', group % 2 === 1);
      } else {
        card.classList.add(tail === 1 ? 'work--wide' : 'work--half');
      }
      if (newFrom > -1 && i >= newFrom && !reduceMotion) {
        card.style.setProperty('--d', (i - newFrom) * 70 + 'ms');
        void card.offsetWidth;
        card.classList.add('is-new');
      }
      if (!card.dataset.watched) {
        card.dataset.watched = '1';
        if (showIO) showIO.observe(card); else card.classList.add('is-shown');
      }
    });

    if (moreWrap) {
      const left = list.length - shown.length;
      moreWrap.hidden = left <= 0;
      if (left > 0) {
        const next = Math.min(BATCH, left);
        moreBtn.textContent = `Показать ещё ${next}`;
        moreNote.textContent = `Показано ${shown.length} из ${list.length}`;
      }
    }
  }
  renderWorks();

  /* ========================================================
     LIGHTBOX: все фото всех работ подряд, свайп и стрелки
     ======================================================== */
  const Lightbox = (() => {
    const el = $('#lightbox');
    const track = $('#lb-track');
    const viewport = $('.lightbox__viewport', el);
    const titleEl = $('#lb-title');
    const typeEl = $('#lb-type');
    const counterEl = $('#lb-counter');
    const prevBtn = $('.lightbox__nav--prev', el);
    const nextBtn = $('.lightbox__nav--next', el);
    const closeBtn = $('.lightbox__bar [data-close]', el);

    let slides = [];   // { work, workIndex, photo, photoIndex }
    let works = [];
    let index = 0;
    let lastFocus = null;

    // в каждом слайде два слоя: превью (уже в кэше после сетки, видно сразу)
    // и полное фото, которое проявляется поверх, как только загрузится
    function buildSlides() {
      track.innerHTML = '';
      slides.forEach((s) => {
        const slide = document.createElement('div');
        slide.className = 'lightbox__slide';
        const n = s.work.photos.length;
        slide.innerHTML = `
          <div class="lightbox__pic">
            <img class="lightbox__thumb" alt="" draggable="false" decoding="async">
            <img class="lightbox__full" alt="${escapeHtml((s.work.alt || s.work.title) + (n > 1 ? `, фото ${s.photoIndex + 1} из ${n}` : ''))}" draggable="false" decoding="async">
          </div>`;
        const thumb = $('.lightbox__thumb', slide);
        const full = $('.lightbox__full', slide);
        thumb.dataset.src = thumbUrl(s.photo);
        full.dataset.src = photoUrl(s.photo);
        thumb.addEventListener('error', () => { thumb.hidden = true; }, { once: true });
        full.addEventListener('load', () => full.classList.add('is-loaded'), { once: true });
        track.appendChild(slide);
      });
    }

    function loadAround(i) {
      [i - 1, i, i + 1, i + 2].forEach((n) => {
        if (n < 0 || n >= slides.length) return;
        $$('img', track.children[n]).forEach((img) => { if (!img.src && img.dataset.src) img.src = img.dataset.src; });
      });
    }

    function render(animate) {
      const s = slides[index];
      const n = s.work.photos.length;
      track.classList.toggle('is-animating', !!animate);
      track.style.transform = `translateX(${-index * 100}%)`;
      titleEl.textContent = s.work.title;
      typeEl.textContent = s.work.category + (n > 1 ? `, фото ${s.photoIndex + 1} из ${n}` : '');
      counterEl.textContent = works.length > 1 ? `Работа ${s.workIndex + 1} из ${works.length}` : '';
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === slides.length - 1;
      loadAround(index);
    }

    const go = (i) => { index = Math.max(0, Math.min(slides.length - 1, i)); render(true); };
    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    function open(list, workIndex) {
      works = list;
      slides = list.flatMap((work, wi) => work.photos.map((photo, pi) => ({ work, workIndex: wi, photo, photoIndex: pi })));
      index = Math.max(0, slides.findIndex((s) => s.workIndex === workIndex));
      lastFocus = document.activeElement;
      buildSlides();
      render(false);
      el.hidden = false;
      document.body.classList.add('is-locked');
      void el.offsetWidth;
      el.classList.add('is-open');
      requestAnimationFrame(() => closeBtn.focus());
      document.addEventListener('keydown', onKey);
    }

    function finishClose() {
      if (el.hidden) return;
      el.hidden = true;
      document.body.classList.remove('is-locked');
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }

    function close() {
      if (!el.classList.contains('is-open')) return;
      document.removeEventListener('keydown', onKey);
      el.classList.remove('is-open');
      setTimeout(finishClose, reduceMotion ? 0 : 280);
    }

    function onKey(e) {
      if (e.key === 'Escape') return close();
      if (e.key === 'ArrowRight') return next();
      if (e.key === 'ArrowLeft') return prev();
      if (e.key === 'Tab') {
        const f = $$('button:not([disabled])', el).filter((b) => b.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    /* ----- свайп ----- */
    let dragging = false, startX = 0, startY = 0, dx = 0, locked = null, pid = null;
    viewport.addEventListener('pointerdown', (e) => {
      if (slides.length < 2) return;
      dragging = true; locked = null; dx = 0;
      startX = e.clientX; startY = e.clientY; pid = e.pointerId;
      track.classList.remove('is-animating');
    });
    viewport.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const mx = e.clientX - startX;
      const my = e.clientY - startY;
      if (locked === null) {
        if (Math.abs(mx) < 6 && Math.abs(my) < 6) return;
        locked = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
        if (locked === 'x') { try { viewport.setPointerCapture(pid); } catch (_) {} }
      }
      if (locked !== 'x') return;
      e.preventDefault();
      dx = mx;
      if ((index === 0 && dx > 0) || (index === slides.length - 1 && dx < 0)) dx *= 0.32;
      track.style.transform = `translateX(${-index * 100 + (dx / viewport.clientWidth) * 100}%)`;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      if (locked === 'x') {
        const threshold = viewport.clientWidth * 0.18;
        if (dx <= -threshold) index = Math.min(slides.length - 1, index + 1);
        else if (dx >= threshold) index = Math.max(0, index - 1);
        render(true);
      }
      locked = null; dx = 0;
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);
    $$('[data-close]', el).forEach((b) => b.addEventListener('click', close));

    return { open };
  })();

  /* ========================================================
     HERO: слайдшоу работ. Время показа задаёт CSS-анимация полоски
     прогресса (её конец переключает слайд), поэтому пауза = пауза анимации.
     ======================================================== */
  (() => {
    const hero = $('#hero');
    const slidesEl = $('#hero-slides');
    if (!hero || !slidesEl) return;
    const SLIDE_MS = 5000;
    // ширина фото на экране: на телефоне квадрат (фото 4:3 шире блока), на десктопе во всю ширину
    const HERO_SIZES = '(max-width: 860px) 70vw, 100vw';
    const list = WORKS.some((w) => w.hero) ? WORKS.filter((w) => w.hero) : WORKS.slice(0, 5);
    if (list.length < 2) return;

    const bar = $('.hero__bar', hero);
    const progress = $('#hero-progress');
    const capTitle = $('#hero-caption-title');
    const capCat = $('#hero-caption-cat');
    const count = $('#hero-count');
    const pauseBtn = $('#hero-pause');
    hero.style.setProperty('--slide-ms', SLIDE_MS + 'ms');

    // слайды: первый уже есть в HTML (если совпадает), остальные создаём, фото грузим по мере надобности
    const first = $('.hero__slide', slidesEl);
    const slides = list.map((w, i) => {
      if (i === 0 && first && first.dataset.id === w.id) return first;
      const fig = document.createElement('figure');
      fig.className = 'hero__slide';
      fig.dataset.id = w.id;
      const img = document.createElement('img');
      img.alt = w.alt || w.title;
      img.decoding = 'async';
      // только полное фото (превью 900 px на весь экран мылятся); большая версия для больших экранов
      img.dataset.src = photoUrl(w.photos[0]);
      if (w.large) img.dataset.srcset = `${photoUrl(w.photos[0])} 1800w, ${photoUrl(w.large)} 2800w`;
      if (w.focus) img.style.objectPosition = w.focus;
      fig.appendChild(img);
      return fig;
    });
    if (first && !slides.includes(first)) first.remove();
    slides.forEach((sl) => { if (!sl.isConnected) slidesEl.appendChild(sl); });
    const load = (i) => {
      const img = $('img', slides[i]);
      if (img.dataset.src && !img.getAttribute('src')) {
        if (img.dataset.srcset) { img.sizes = HERO_SIZES; img.srcset = img.dataset.srcset; }
        img.src = img.dataset.src;
      }
    };

    const segs = list.map((w, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hero__seg';
      b.setAttribute('aria-label', `Фото ${i + 1}: ${w.title}`);
      b.innerHTML = '<span></span>';
      b.addEventListener('click', () => go(i));
      progress.appendChild(b);
      return b;
    });

    let index = 0;
    let stopped = reduceMotion;   // пользователь нажал паузу (или просит меньше движения)
    // временная пауза, незаметная пользователю: вкладка в фоне или hero ушёл с экрана.
    // Курсор и фокус паузу не ставят: иначе после нажатия «плей» показ тут же снова вставал
    const away = { tab: false, screen: false };
    let held = false;

    function go(i) {
      index = (i + list.length) % list.length;
      load(index);
      load((index + 1) % list.length);   // следующее фото заранее
      slides.forEach((sl, k) => {
        sl.classList.toggle('is-current', k === index);
        sl.setAttribute('aria-hidden', String(k !== index));
      });
      segs.forEach((b, k) => {
        b.classList.toggle('is-done', k < index);
        b.classList.remove('is-current');
        b.setAttribute('aria-current', String(k === index));
      });
      void segs[index].offsetWidth;   // перезапуск анимации полоски
      segs[index].classList.add('is-current');
      if (stopped) segs[index].classList.add('is-done');
      capTitle.textContent = list[index].title;
      capCat.textContent = list[index].category;
      count.textContent = `${index + 1} / ${list.length}`;
    }

    const sync = () => { held = away.tab || away.screen; hero.classList.toggle('is-paused', stopped || held); };
    progress.addEventListener('animationend', () => { if (!stopped && !held) go(index + 1); });

    pauseBtn.addEventListener('click', () => {
      stopped = !stopped;
      hero.classList.toggle('is-stopped', stopped);
      pauseBtn.setAttribute('aria-label', stopped ? 'Запустить смену фото' : 'Остановить смену фото');
      $('#hero-caption').setAttribute('aria-live', stopped ? 'polite' : 'off');
      go(index);
      sync();
    });
    hero.classList.toggle('is-stopped', stopped);
    if (stopped) pauseBtn.setAttribute('aria-label', 'Запустить смену фото');

    const stage = $('#hero-stage');
    document.addEventListener('visibilitychange', () => { away.tab = document.hidden; sync(); });
    if (hasIO) new IntersectionObserver(([e]) => { away.screen = !e.isIntersecting; sync(); }, { threshold: 0.2 }).observe(hero);

    // свайп по фото на телефоне
    let sx = 0, sy = 0, swiping = false;
    stage.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' || e.target.closest('a, button')) return;
      swiping = true; sx = e.clientX; sy = e.clientY;
    });
    stage.addEventListener('pointerup', (e) => {
      if (!swiping) return;
      swiping = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
    });
    stage.addEventListener('pointercancel', () => { swiping = false; });

    // подпись открывает работу в просмотре
    $('#hero-caption').addEventListener('click', () => Lightbox.open(WORKS, WORKS.indexOf(list[index])));

    bar.hidden = false;
    go(0);
    sync();
  })();
})();
