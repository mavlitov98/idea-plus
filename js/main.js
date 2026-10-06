/* =========================================================
   ИДЕЯ ПЛЮС — interactions
   data-driven gallery · filters · swipe lightbox · reveals
   ========================================================= */
(() => {
  'use strict';

  /* ---- Работы. Каждый объект = одно фото готовой мебели.
     Чтобы добавить работу — положите фото в assets/work-examples/<...>/
     и добавьте новый элемент в массив ниже (можно переиспользовать
     существующую категорию или завести новую — фильтры соберутся сами). ---- */
  const TEMP = 'assets/work-examples/temp/';
  const WORKS = [
    {
      id: 'vanity-khaki',
      title: 'Тумба и пенал в ванную',
      category: 'Мебель для ванной',
      src: TEMP + 'photo_1_2026-09-06_21-29-52.jpg',
      alt: 'Ванная комната с тумбой и пеналом цвета хаки, подсветкой и рейчатой панелью',
    },
    {
      id: 'hallway-blue',
      title: 'Прихожая с гардеробной',
      category: 'Гардеробные',
      src: TEMP + 'photo_2_2026-09-06_21-29-52.jpg',
      alt: 'Прихожая со встроенным синим шкафом-купе и мягкой скамьёй для обуви',
    },
    {
      id: 'bedroom-arch',
      title: 'Спальня с нишей-аркой',
      category: 'Спальни',
      src: TEMP + 'photo_3_2026-09-06_21-29-52.jpg',
      alt: 'Спальня с арочной нишей, встроенным синим шкафом и прикроватными тумбами',
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
    const svg = $('.brand-mark__svg', root);
    const q = (sel) => $(sel, root);
    const guides = q('.bm-guides');
    const guideLines = $$('.bm-guides .bm-draw', root);
    const dims = $$('.bm-dim', root);
    const pencil = q('.bm-pencil');
    const beams = $$('.bm-beam', root);
    const notch = q('.bm-notch');
    const slide = q('.bm-slide');
    const obj = q('.bm-obj');
    const solid = q('.bm-solid');
    const sheen = q('#bm-sheen');
    const led = q('.bm-led');
    const halo = q('.bm-halo');
    const flash = q('.bm-flash');
    const chips = $$('.bm-chips circle', root);
    const cutters = $$('.bm-cutter', root);
    const word = q('.brand-mark__word');
    const touched = [guides, ...guideLines, ...dims, pencil, ...beams, notch, slide, obj,
      solid, led, halo, flash, ...chips, ...cutters, word];

    const draw = (el, p) => { el.style.strokeDashoffset = 100 * (1 - p); };
    const beamLen = beams.map((b) => b.getTotalLength());
    const SLIDE = 14; // вынос второго бруска «на зрителя» по оси глубины
    let slideOffset = SLIDE;

    // «резец» идёт по кончику рисуемой линии (второй брусок ещё вынесен вперёд)
    const cut = (i, p) => {
      const pt = beams[i].getPointAtLength(beamLen[i] * p);
      const off = i === 1 ? slideOffset : 0;
      cutters[i].setAttribute('cx', pt.x - off);
      cutters[i].setAttribute('cy', pt.y + off);
      cutters[i].style.opacity = p < 1 ? 1 : 0;
    };

    // стружка разлетается от стыков паза
    const chipDir = chips.map((c) => {
      const x = +c.getAttribute('cx') - 50, y = +c.getAttribute('cy') - 50;
      const len = Math.hypot(x, y) || 1;
      return [x / len, y / len, 7 + Math.random() * 7];
    });

    const tracks = [
      // 1. разметка: оси, лучи глубины 45° и размеры
      ...guideLines.map((el, i) => ({ at: i * 45, dur: 600, ease: ease.inOut, fn: (p) => draw(el, p) })),
      { at: 480, dur: 360, fn: (p) => dims.forEach((d) => { d.style.opacity = p; }) },

      // 2. карандаш: горизонтальный брусок с пазом, вертикальный — вынесен вперёд
      { at: 350, dur: 900, ease: ease.inOut, fn: (p) => { draw(beams[0], p); cut(0, p); } },
      { at: 650, dur: 900, ease: ease.inOut, fn: (p) => { draw(beams[1], p); cut(1, p); } },
      { at: 1050, dur: 400, fn: (p) => draw(notch, p) },

      // 3. сборка: брусок уходит в паз по оси глубины, щелчок
      { at: 1600, dur: 300, ease: (t) => t * t * t, fn: (p) => {
        slideOffset = SLIDE * (1 - p);
        slide.style.transform = `translate(${-slideOffset}px, ${slideOffset}px)`;
      } },
      { at: 1900, dur: 260, ease: ease.linear, fn: (p) => {
        const a = 1.1 * (1 - p) * Math.sin(p * Math.PI * 5);
        obj.style.transform = `translate(${a}px, ${-a * 0.6}px)`;
      } },
      { at: 1900, dur: 450, fn: (p) => {
        flash.setAttribute('r', 2 + 14 * p);
        flash.style.opacity = 1 - p;
        chips.forEach((c, i) => {
          const [dx, dy, dist] = chipDir[i];
          c.style.transform = `translate(${dx * dist * p}px, ${dy * dist * p + 4 * p * p}px)`;
          c.style.opacity = 1 - p;
        });
      } },

      // 4. материал: дерево с латунной кромкой проявляется, разметка гаснет
      { at: 1950, dur: 550, fn: (p) => {
        solid.style.opacity = p;
        pencil.style.opacity = 1 - p;
        guides.style.opacity = 0.6 * (1 - p);
      } },
      { at: 2200, dur: 850, ease: ease.inOut, fn: (p) => {
        const x = -30 + 160 * p;
        sheen.setAttribute('x1', x - 15); sheen.setAttribute('x2', x + 15);
      } },

      // 5. контурная подсветка включается с дребезгом
      { at: 2400, dur: 560, ease: ease.linear, fn: (p) => {
        const o = flicker(p);
        led.style.opacity = o;
        halo.style.opacity = o;
      } },

      // 6. слово раскрывается от центра
      { at: 2550, dur: 800, fn: (p) => {
        const c = 50 * (1 - p);
        word.style.opacity = p;
        word.style.clipPath = `inset(-20% ${c}% -20% ${c}%)`;
        word.style.transform = `scaleX(${1.1 - 0.1 * p})`;
      } },
      { at: 2600, dur: 0, fn: onReveal },
    ];

    playTimeline(tracks, () => {
      root.classList.add('is-done');
      touched.forEach((el) => el.removeAttribute('style'));
      sheen.setAttribute('x1', -80); sheen.setAttribute('x2', -50);
    });

    // лёгкий наклон знака за курсором (только мышь)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const hero = $('#hero');
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      const tick = () => {
        cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
        svg.style.transform = `perspective(500px) rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
        raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.01 ? requestAnimationFrame(tick) : 0;
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
      hero.addEventListener('pointermove', (e) => {
        const r = svg.getBoundingClientRect();
        tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2))) * 4;
        ty = -Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2))) * 4;
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

  /* ---------- pointer-fine detection (для тилта карточек) ---------- */
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ========================================================
     WORKS GRID + FILTERS
     ======================================================== */
  const grid = $('#works-grid');
  const filtersEl = $('#works-filters');
  const categories = ['Все', ...Array.from(new Set(WORKS.map((w) => w.category)))];
  let activeCategory = 'Все';

  const cardsById = new Map();

  categories.forEach((cat, i) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'filter-chip' + (cat === activeCategory ? ' is-active' : '');
    chip.dataset.category = cat;
    chip.setAttribute('aria-pressed', cat === activeCategory ? 'true' : 'false');
    chip.textContent = cat;
    chip.addEventListener('click', () => applyFilter(cat));
    filtersEl.appendChild(chip);
  });

  WORKS.forEach((w, i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'project-card reveal';
    card.style.transitionDelay = (0.06 * i) + 's';
    card.dataset.category = w.category;
    card.dataset.id = w.id;
    card.setAttribute('aria-label', `Открыть работу: ${w.title}`);
    card.innerHTML = `
      <div class="project-card__frame">
        <span class="project-card__badge">${escapeHtml(w.category)}</span>
        <img class="project-card__img" src="${w.src}" alt="${escapeHtml(w.alt)}" loading="lazy" decoding="async">
      </div>
      <div class="project-card__meta">
        <span class="project-card__title">${escapeHtml(w.title)}</span>
<!--        <span class="project-card__type">${escapeHtml(w.category)}</span>-->
      </div>`;
    card.addEventListener('click', () => {
      const visible = getVisibleWorks();
      const idx = visible.findIndex((v) => v.id === w.id);
      if (idx > -1) Lightbox.open(visible, idx);
    });

    const frame = $('.project-card__frame', card);
    if (isFinePointer) {
      frame.addEventListener('pointermove', (e) => {
        const r = frame.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        frame.style.transform = `rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg)`;
      });
      frame.addEventListener('pointerleave', () => { frame.style.transform = ''; });
    }

    grid.appendChild(card);
    observeReveal(card);
    cardsById.set(w.id, card);
  });

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
