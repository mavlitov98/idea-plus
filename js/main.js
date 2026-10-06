/* =========================================================
   ИДЕЯ ПЛЮС — interactions
   brand intro · portfolio with LED-scan · manifesto · timeline ·
   counters · filters · swipe lightbox · reveals
   ========================================================= */
(() => {
  'use strict';

  /* ---- Работы. Каждый объект = одно фото готовой мебели.
     Чтобы добавить работу — положите фото в assets/work-examples/<...>/
     и добавьте новый элемент в массив ниже (можно переиспользовать
     существующую категорию или завести новую — фильтры соберутся сами).
     note — необязательная подпись под названием. ---- */
  const TEMP = 'assets/work-examples/temp/';
  const WORKS = [
    {
      id: 'vanity-khaki',
      title: 'Тумба и пенал в ванную',
      category: 'Мебель для ванной',
      src: TEMP + 'photo_1_2026-09-06_21-29-52.jpg',
      alt: 'Ванная комната с тумбой и пеналом цвета хаки, подсветкой и рейчатой панелью',
      note: 'Матовые фасады цвета хаки, рейчатая панель из шпона и встроенная подсветка ниши.',
    },
    {
      id: 'hallway-blue',
      title: 'Прихожая с гардеробной',
      category: 'Гардеробные',
      src: TEMP + 'photo_2_2026-09-06_21-29-52.jpg',
      alt: 'Прихожая со встроенным синим шкафом-купе и мягкой скамьёй для обуви',
      note: 'Шкаф от пола до потолка, мягкие панели с крючками и скамья для обуви — одна система.',
    },
    {
      id: 'bedroom-arch',
      title: 'Спальня с нишей-аркой',
      category: 'Спальни',
      src: TEMP + 'photo_3_2026-09-06_21-29-52.jpg',
      alt: 'Спальня с арочной нишей, встроенным синим шкафом и прикроватными тумбами',
      note: 'Встроенный шкаф в тон стен, арочная ниша и подвесные тумбы вместо привычных ножек.',
    },
  ];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- fullscreen menu ---------- */
  (() => {
    const burger = $('#burger');
    const menu = $('#menu');
    if (!burger || !menu) return;
    const links = menu.querySelectorAll('a');
    let lastFocus = null;

    const isOpen = () => document.body.classList.contains('menu-open');

    function syncOrigin() {
      const r = burger.getBoundingClientRect();
      menu.style.setProperty('--mx', (r.left + r.width / 2) + 'px');
      menu.style.setProperty('--my', (r.top + r.height / 2) + 'px');
    }

    function open() {
      lastFocus = document.activeElement;
      syncOrigin();
      document.body.classList.add('menu-open');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Закрыть меню');
      menu.setAttribute('aria-hidden', 'false');
      menu.removeAttribute('inert');
      document.addEventListener('keydown', onKey);
      requestAnimationFrame(() => { const f = links[0]; if (f) f.focus(); });
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
  })();

  /* ---------- nav scroll state ---------- */
  const nav = $('#nav');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- floating call button: скрыт в hero, прячется у footer ---------- */
  (() => {
    const fab = $('.fab');
    const hero = $('#hero');
    const footer = $('.footer');
    if (!fab || !('IntersectionObserver' in window)) { if (fab) fab.classList.add('is-visible'); return; }
    let heroVisible = true;
    let footerVisible = false;
    const update = () => fab.classList.toggle('is-visible', !heroVisible && !footerVisible);
    if (hero) {
      new IntersectionObserver((entries) => {
        heroVisible = entries[0].isIntersecting;
        update();
      }, { threshold: 0 }).observe(hero);
    }
    if (footer) {
      new IntersectionObserver((entries) => {
        footerVisible = entries[0].isIntersecting;
        update();
      }, { threshold: 0 }).observe(footer);
    }
  })();

  /* ---------- scroll reveal ---------- */
  let revealIO = null;
  function observeReveal(el) {
    if (!('IntersectionObserver' in window)) { el.classList.add('is-in'); return; }
    if (!revealIO) {
      revealIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    }
    revealIO.observe(el);
  }
  /* ---------- brand mark: чертёж → изделие → подсветка ---------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroMark = $('#brand-hero');
  const heroIntro = !!heroMark && !reduceMotion;

  // крошечный таймлайн на rAF: трек = { at, dur, ease, fn(p) }, время в мс
  const ease = {
    linear: (t) => t,
    out: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  };
  function playTimeline(tracks, onEnd) {
    const end = Math.max(...tracks.map((k) => k.at + k.dur));
    let t0 = null;
    function frame(now) {
      if (t0 === null) t0 = now;
      const t = now - t0;
      tracks.forEach((k) => {
        if (k.done || t < k.at) return;
        const p = Math.min(1, (t - k.at) / (k.dur || 1));
        k.fn((k.ease || ease.out)(p));
        if (p === 1) k.done = true;
      });
      if (t < end) requestAnimationFrame(frame); else if (onEnd) onEnd();
    }
    requestAnimationFrame(frame);
  }

  // кусочно-линейная кривая: включение LED с «дребезгом»
  const FLICKER = [[0, 0], [0.08, 0.9], [0.14, 0.1], [0.24, 0.75], [0.3, 0.15], [0.42, 1], [0.5, 0.45], [0.6, 1], [1, 1]];
  function flicker(p) {
    for (let i = 1; i < FLICKER.length; i++) {
      const [x1, y1] = FLICKER[i], [x0, y0] = FLICKER[i - 1];
      if (p <= x1) return y0 + (y1 - y0) * ((p - x0) / (x1 - x0));
    }
    return 1;
  }

  function initBrandMark(onReveal) {
    const root = heroMark;
    const q = (sel) => $(sel, root);
    const tilt = q('.cube-tilt');
    const plan = q('.cube-plan');
    const planLines = $$('.cube-plan .bm-draw', root);
    const outline = q('.cube-plan__outline');
    const folds = q('.cube-plan__fold');
    const labels = q('.cube-plan__labels');
    const cutter = q('.cube-plan__cutter');
    const cube = q('.cube');
    const halo = q('.cube-halo');
    const mono = q('.cube__mono');
    const word = q('.brand-mark__word');
    const face = (n) => q(`.cube__face--${n}`);
    const shade = (n) => q(`.cube__face--${n} > .cube__shade`);

    // шарниры: ось и знак поворота каждой грани; финальная светотень — как в CSS
    const HINGES = {
      front: ['X', 1], back: ['X', -1], lid: ['X', -1], left: ['Y', 1], right: ['Y', -1],
    };
    const SHADE = { front: 0.08, left: 0.45, right: 0.55, back: 0.55, lid: 0.16, base: 0.6 };
    const touched = [plan, ...planLines, folds, labels, cutter, cube, halo, mono, word,
      ...Object.keys(SHADE).flatMap((n) => [face(n), shade(n)])];

    const draw = (el, p) => { el.style.strokeDashoffset = 100 * (1 - p); };
    const outlineLen = outline.getTotalLength();
    const size = () => face('base').offsetWidth;

    // поза короба: развёртка «ложится на стол» и поворачивается в три четверти
    const pose = { ty: 0.5, ax: 0, az: 0, tz: 0, k: 1 };
    const setPose = () => {
      const S = size();
      cube.style.transform = `translateY(${pose.ty * S}px) rotateX(${pose.ax}deg) rotateZ(${pose.az}deg) ` +
        `translateZ(${-pose.tz * S}px) scale3d(${pose.k}, ${pose.k}, ${pose.k})`;
    };
    const fold = (n, p) => {
      const [axis, sign] = HINGES[n];
      face(n).style.transform = `rotate${axis}(${sign * 90 * p}deg)`;
      shade(n).style.opacity = SHADE[n] * p;
    };
    const lerp = (a, b, p) => a + (b - a) * p;

    const tracks = [
      // 1. чертёж развёртки: оси, размеры, контур резцом, линии сгиба, подписи
      ...planLines.filter((el) => el !== outline).map((el, i) => ({
        at: i * 80, dur: 650, ease: ease.inOut, fn: (p) => draw(el, p),
      })),
      { at: 300, dur: 1150, ease: ease.inOut, fn: (p) => {
        draw(outline, p);
        const pt = outline.getPointAtLength(outlineLen * p);
        cutter.setAttribute('cx', pt.x); cutter.setAttribute('cy', pt.y);
        cutter.style.opacity = p < 1 ? 1 : 0;
      } },
      { at: 950, dur: 450, fn: (p) => { folds.style.opacity = p; labels.style.opacity = p; } },

      // 2. панели становятся деревом уже на ходу — плоской деревянной развёртки не видно
      { at: 1620, dur: 420, fn: (p) => { cube.style.opacity = p; } },
      { at: 1640, dur: 420, fn: (p) => { plan.style.opacity = 1 - p; } },

      // 3. развёртка ложится и разворачивается, грани поднимаются, крышка захлопывается
      { at: 1480, dur: 800, ease: ease.inOut, fn: (p) => {
        pose.ty = lerp(0.5, 0, p); pose.ax = 58 * p; setPose();
      } },
      { at: 1650, dur: 1100, ease: ease.inOut, fn: (p) => { pose.az = -42 * p; setPose(); } },
      { at: 1560, dur: 950, ease: ease.inOut, fn: (p) => { pose.tz = 0.5 * p; setPose(); } },
      { at: 1560, dur: 560, ease: ease.inOut, fn: (p) => fold('front', p) },
      { at: 1640, dur: 560, ease: ease.inOut, fn: (p) => fold('left', p) },
      { at: 1700, dur: 560, ease: ease.inOut, fn: (p) => fold('right', p) },
      { at: 1800, dur: 560, ease: ease.inOut, fn: (p) => fold('back', p) },
      { at: 1800, dur: 300, fn: (p) => { shade('base').style.opacity = SHADE.base * p; } },
      { at: 2200, dur: 380, ease: (t) => t * t * t, fn: (p) => fold('lid', p) },

      // 4. щелчок: модуль чуть «приседает», швы вспыхивают
      { at: 2580, dur: 0, fn: () => cube.classList.add('is-sealed') },
      { at: 2580, dur: 320, ease: ease.linear, fn: (p) => {
        pose.k = 1 + 0.035 * Math.sin(p * Math.PI) * (1 - p * 0.4); setPose();
      } },

      // 5. на фасаде загорается «И⁺», вокруг — тёплое пятно
      { at: 2700, dur: 560, ease: ease.linear, fn: (p) => {
        const o = flicker(p);
        mono.style.opacity = o; halo.style.opacity = o;
      } },

      // 6. слово раскрывается от центра
      { at: 2950, dur: 800, fn: (p) => {
        const c = 50 * (1 - p);
        word.style.opacity = p;
        word.style.clipPath = `inset(-20% ${c}% -20% ${c}%)`;
        word.style.transform = `scaleX(${1.1 - 0.1 * p})`;
      } },
      { at: 3000, dur: 0, fn: onReveal },
    ];

    playTimeline(tracks, () => {
      root.classList.add('is-done');
      touched.forEach((el) => el.removeAttribute('style'));
      setTimeout(() => cube.classList.remove('is-sealed'), 1400);
    });

    // модуль поворачивается за курсором в настоящем 3D (только мышь)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const hero = $('#hero');
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      const tick = () => {
        cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
        tilt.style.transform = `rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
        raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.01 ? requestAnimationFrame(tick) : 0;
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
      hero.addEventListener('pointermove', (e) => {
        const r = tilt.getBoundingClientRect();
        tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2))) * 10;
        ty = -Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2))) * 10;
        kick();
      });
      hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
    }
  }

  // в hero остальные элементы ждут, пока знак «изготовится»
  const heroLate = heroIntro ? $$('.hero .reveal:not(.hero__eyebrow)') : [];
  $$('.reveal').forEach((el) => { if (!heroLate.includes(el)) observeReveal(el); });

  if (heroIntro) {
    const start = () => initBrandMark(() => heroLate.forEach((el) => el.classList.add('is-in')));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { io.disconnect(); start(); }
      }, { threshold: 0.3 });
      io.observe(heroMark);
    } else start();
  } else if (heroMark) {
    heroMark.classList.add('is-done');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  /* ========================================================
     WORKS — журнальная вёрстка, фото проявляется из чертежа
     ======================================================== */
  const grid = $('#works-grid');
  const filtersEl = $('#works-filters');
  const categories = ['Все', ...Array.from(new Set(WORKS.map((w) => w.category)))];
  let activeCategory = 'Все';

  const cardsById = new Map();

  // своя ленивая загрузка: нативная не грузит фото, пока оно скрыто clip-path под «шторкой»
  const loadImg = (img) => { if (!img.src && img.dataset.src) img.src = img.dataset.src; };
  const preloadIO = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        preloadIO.unobserve(e.target);
        loadImg($('.work__img', e.target));
      });
    }, { rootMargin: '100% 0px' })
    : null;

  // «LED-скан» запускается, когда кадр заехал в экран
  const scanIO = 'IntersectionObserver' in window && !reduceMotion
    ? new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const card = e.target;
        scanIO.unobserve(card);
        // сканер стартует только когда фото уже загружено — иначе линия пройдёт по пустоте
        const img = $('.work__img', card);
        const start = () => {
          card.classList.add('is-scanning');
          setTimeout(() => card.classList.add('is-scanned'), 1500);
        };
        if (img.complete && img.naturalWidth) start();
        else {
          img.addEventListener('load', start, { once: true });
          img.addEventListener('error', () => card.classList.add('is-scanned'), { once: true });
        }
      });
    }, { threshold: 0.35 })
    : null;

  categories.forEach((cat) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'filter-chip' + (cat === activeCategory ? ' is-active' : '');
    chip.dataset.category = cat;
    chip.setAttribute('aria-pressed', cat === activeCategory ? 'true' : 'false');
    chip.textContent = cat;
    chip.addEventListener('click', () => applyFilter(cat));
    filtersEl.appendChild(chip);
  });

  WORKS.forEach((w) => {
    const card = document.createElement('article');
    card.className = 'work';
    card.dataset.category = w.category;
    card.innerHTML = `
      <button class="work__frame" type="button" aria-label="Открыть фото: ${escapeHtml(w.title)}">
        <span class="work__plan" aria-hidden="true"></span>
        <img class="work__img" data-src="${w.src}" alt="${escapeHtml(w.alt)}" decoding="async">
        <span class="work__scan" aria-hidden="true"></span>
        <span class="work__dim" aria-hidden="true"><span>${escapeHtml(w.category)}</span><span>1:1</span></span>
      </button>
      <div class="work__meta reveal">
        <span class="work__num" aria-hidden="true"></span>
        <span class="work__cat">${escapeHtml(w.category)}</span>
        <h3 class="work__title">${escapeHtml(w.title)}</h3>
        ${w.note ? `<p class="work__note">${escapeHtml(w.note)}</p>` : ''}
        <button class="work__more" type="button">Смотреть фото <span aria-hidden="true">→</span></button>
      </div>`;
    const openThis = () => {
      const visible = getVisibleWorks();
      const idx = visible.findIndex((v) => v.id === w.id);
      if (idx > -1) Lightbox.open(visible, idx);
    };
    $('.work__frame', card).addEventListener('click', openThis);
    $('.work__more', card).addEventListener('click', openThis);

    grid.appendChild(card);
    observeReveal($('.work__meta', card));
    if (preloadIO) preloadIO.observe(card); else loadImg($('.work__img', card));
    if (scanIO) scanIO.observe(card); else card.classList.add('is-scanned');
    cardsById.set(w.id, card);
  });
  layoutWorks();

  // номера и чередование сторон — по видимым работам
  function layoutWorks() {
    getVisibleWorks().forEach((w, i) => {
      const card = cardsById.get(w.id);
      card.classList.toggle('is-flip', i % 2 === 1);
      $('.work__num', card).textContent = String(i + 1).padStart(2, '0');
    });
  }

  function getVisibleWorks() {
    return activeCategory === 'Все' ? WORKS : WORKS.filter((w) => w.category === activeCategory);
  }

  function applyFilter(cat) {
    activeCategory = cat;
    $$('.filter-chip', filtersEl).forEach((chip) => {
      const active = chip.dataset.category === cat;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    WORKS.forEach((w) => {
      const card = cardsById.get(w.id);
      const match = cat === 'Все' || w.category === cat;
      if (match) {
        card.classList.remove('is-hidden');
        requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('is-out')));
      } else {
        card.classList.add('is-out');
        window.setTimeout(() => { if (card.classList.contains('is-out')) card.classList.add('is-hidden'); }, 420);
      }
    });
    layoutWorks();
  }

  /* ---------- манифест: слова загораются по мере прокрутки ---------- */
  const manifesto = $('#manifesto-text');
  const words = [];
  if (manifesto) {
    // оборачиваем каждое слово, сохраняя <em>
    const wrap = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const span = document.createElement('span');
            span.className = 'mw';
            span.textContent = part;
            frag.appendChild(span);
            words.push(span);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrap(n);
      });
    };
    wrap(manifesto);
  }

  /* ---------- таймлайн процесса: свет течёт по рельсу ---------- */
  const timeline = $('#timeline');
  const steps = timeline ? $$('.step', timeline) : [];

  /* ---------- единый обработчик прокрутки для «живых» секций ---------- */
  let scrollRaf = 0;
  function onScrollFx() {
    scrollRaf = 0;
    const vh = window.innerHeight;
    if (words.length) {
      const r = manifesto.getBoundingClientRect();
      // текст «прочитан» целиком, когда его низ поднялся до 45% экрана
      const p = reduceMotion ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.4)));
      const lit = p * words.length;
      words.forEach((w, i) => {
        const v = Math.min(1, Math.max(0, lit - i));
        w.style.setProperty('--lit', v.toFixed(3));
        w.classList.toggle('is-edge', v > 0 && v < 1);
      });
    }
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
      timeline.style.setProperty('--p', p.toFixed(4));
      const fillY = r.top + r.height * p;
      steps.forEach((st) => {
        const dot = st.firstElementChild.getBoundingClientRect();
        st.classList.toggle('is-lit', dot.top + dot.height / 2 <= fillY + 1);
      });
    }
  }
  const requestFx = () => { if (!scrollRaf) scrollRaf = requestAnimationFrame(onScrollFx); };
  window.addEventListener('scroll', requestFx, { passive: true });
  window.addEventListener('resize', requestFx);
  onScrollFx();

  /* ---------- цифры считаются вверх ---------- */
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    counters.forEach((el) => { el.textContent = '0'; });
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        countIO.unobserve(e.target);
        const el = e.target, to = +el.dataset.count;
        playTimeline([{ at: 200, dur: 1400, fn: (p) => { el.textContent = Math.round(to * p); } }]);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countIO.observe(el));
  }

  /* ---------- контакты: на фоне прорисовывается контур модуля ---------- */
  const contacts = $('#contacts');
  if (contacts) {
    if ('IntersectionObserver' in window) {
      const cIO = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { contacts.classList.add('is-in'); cIO.disconnect(); }
      }, { threshold: 0.25 });
      cIO.observe(contacts);
    } else contacts.classList.add('is-in');
  }

  /* ---------- текущий раздел подсвечивается в шапке ---------- */
  const navLinks = $$('.nav__links a');
  if (navLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const secIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const link = byId.get(e.target.id);
        if (link && e.isIntersecting) navLinks.forEach((a) => a.classList.toggle('is-current', a === link));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const sec = document.getElementById(id); if (sec) secIO.observe(sec); });
  }

  /* ---------- hero: CAD-координаты курсора ---------- */
  const coords = $('#coords');
  if (coords && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const hero = $('#hero');
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 1000;
      const y = (1 - (e.clientY - r.top) / r.height) * 1000;
      coords.textContent = `X ${x.toFixed(1).padStart(6, '0')} · Y ${y.toFixed(1).padStart(6, '0')}`;
    });
  }

  /* ========================================================
     LIGHTBOX — fullscreen swipe viewer across visible works
     ======================================================== */
  const Lightbox = (() => {
    const el = $('#lightbox');
    const track = $('#lb-track');
    const viewport = $('.lightbox__viewport', el);
    const titleEl = $('#lb-title');
    const typeEl = $('#lb-type');
    const dotsEl = $('#lb-dots');
    const counterEl = $('#lb-counter');
    const prevBtn = $('.lightbox__nav--prev', el);
    const nextBtn = $('.lightbox__nav--next', el);

    let items = [];
    let index = 0;
    let lastFocus = null;

    function buildSlides() {
      track.innerHTML = '';
      items.forEach((item) => {
        const slide = document.createElement('div');
        slide.className = 'lightbox__slide';
        const img = document.createElement('img');
        img.alt = item.alt;
        img.dataset.src = item.src;
        img.decoding = 'async';
        img.addEventListener('load', () => img.classList.add('is-loaded'));
        slide.appendChild(img);
        track.appendChild(slide);
      });
      dotsEl.innerHTML = '';
      items.forEach((_, i) => {
        const d = document.createElement('button');
        d.type = 'button';
        d.setAttribute('aria-label', `Работа ${i + 1}`);
        d.addEventListener('click', () => go(i));
        dotsEl.appendChild(d);
      });
    }

    function loadAround(i) {
      [i - 1, i, i + 1].forEach((n) => {
        if (n < 0 || n >= items.length) return;
        const img = track.children[n].firstElementChild;
        if (img && !img.src && img.dataset.src) img.src = img.dataset.src;
      });
    }

    function render(animate) {
      track.classList.toggle('is-animating', !!animate);
      track.style.transform = `translateX(${-index * 100}%)`;
      Array.from(dotsEl.children).forEach((d, i) => d.classList.toggle('is-active', i === index));
      counterEl.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      titleEl.textContent = items[index].title;
      typeEl.textContent = items[index].category;
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === items.length - 1;
      loadAround(index);
    }

    function go(i) {
      index = Math.max(0, Math.min(items.length - 1, i));
      render(true);
    }
    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    function open(visibleWorks, startIndex) {
      items = visibleWorks;
      index = startIndex || 0;
      lastFocus = document.activeElement;
      buildSlides();
      el.hidden = false;
      document.body.classList.add('is-locked');
      void el.offsetWidth;
      el.classList.add('is-open');
      render(false);
      requestAnimationFrame(() => $('.lightbox__close', el).focus());
      document.addEventListener('keydown', onKey);
    }

    function close() {
      el.classList.remove('is-open');
      document.removeEventListener('keydown', onKey);
      const done = () => {
        el.hidden = true;
        el.removeEventListener('transitionend', done);
        document.body.classList.remove('is-locked');
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      };
      el.addEventListener('transitionend', done);
      setTimeout(() => { if (!el.hidden) done(); }, 450);
    }

    function onKey(e) {
      if (e.key === 'Escape') return close();
      if (e.key === 'ArrowRight') return next();
      if (e.key === 'ArrowLeft') return prev();
      if (e.key === 'Tab') trapFocus(e);
    }

    function trapFocus(e) {
      const f = el.querySelectorAll('button:not([disabled]), [href]');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    /* ----- pointer / swipe ----- */
    let dragging = false, startX = 0, startY = 0, dx = 0, locked = null, pid = null;
    viewport.addEventListener('pointerdown', (e) => {
      if (items.length < 2) return;
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
      if ((index === 0 && dx > 0) || (index === items.length - 1 && dx < 0)) dx *= 0.32;
      const pct = (dx / viewport.clientWidth) * 100;
      track.style.transform = `translateX(${-index * 100 + pct}%)`;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      if (locked === 'x') {
        const threshold = viewport.clientWidth * 0.18;
        if (dx <= -threshold) index = Math.min(items.length - 1, index + 1);
        else if (dx >= threshold) index = Math.max(0, index - 1);
        render(true);
      }
      locked = null; dx = 0;
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    /* ----- controls ----- */
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);
    el.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));

    return { open };
  })();
})();
