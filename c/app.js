/* Direction C · Sanctuary: page behaviour. */
(function () {
  const K = window.KKC;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desk = () => matchMedia('(min-width: 900px)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const span = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  /* menu */
  const mb = $('.menu'), sheet = $('#sheet');
  const setMenu = (open) => { mb.setAttribute('aria-expanded', String(open)); sheet.hidden = !open; mb.firstElementChild.textContent = open ? 'Close' : 'Menu'; document.body.style.overflow = open ? 'hidden' : ''; };
  mb.addEventListener('click', () => setMenu(mb.getAttribute('aria-expanded') !== 'true'));
  sheet.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) { setMenu(false); mb.focus(); } });

  /* coming up */
  const seen = new Set();
  const list = K.upcoming(K.today).filter((e) => {
    // one line per event series in the list, so the next eight are varied; holy days always shown
    const key = e.kind === 'holyday' ? e.id : e.title.replace(/ \(day two\)$/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
  $('#dates').innerHTML = list.map((e) => {
    const t = K.d(e.date);
    return `<li class="date${e.kind === 'holyday' ? ' holy' : ''}">
      <p class="dn">${t.getDate()}<span class="dm">${K.MON[t.getMonth()]} · ${K.DAY[t.getDay()].slice(0, 3)}</span></p>
      <div><h3>${esc(e.title)}</h3><p class="dmeta">${[K.timeRange(e), e.who].filter(Boolean).map(esc).join(' · ')}</p></div>
      <span class="fmt">${e.kind === 'holyday' ? 'Holy day' : K.formatLabel[e.format]}</span>
    </li>`;
  }).join('');

  /* membership */
  $('#members').innerHTML = K.membership.map((m) => `<li>${m.name}<span>${m.month ? '$' + m.month + ' a month' : '$' + m.year + ' a year'}</span></li>`).join('');

  /* newsletter (demo) */
  const nl = $('.nl');
  nl.addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = $('input', nl), msg = $('.nl-msg', nl);
    if (!inp.checkValidity()) { msg.textContent = 'Please enter an email address.'; inp.focus(); return; }
    msg.textContent = 'Thank you. In the finished site this subscribes you to the weekly email.';
    nl.reset();
  });

  /* words light up as they are read */
  const words = $('#words');
  words.innerHTML = words.textContent.trim().split(/\s+/).map((w) => `<span class="w">${esc(w)}</span> `).join('');
  const ws = $$('.w', words);

  /* teacher steps */
  const imgs = $$('.t-img'), steps = $$('.t-step');
  const tio = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    const s = en.target.dataset.step;
    imgs.forEach((im) => im.classList.toggle('on', im.dataset.step === s));
  }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach((s) => tio.observe(s));

  /* reveals */
  document.documentElement.classList.add('motion');
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  $$('[data-reveal]').forEach((el) => io.observe(el));

  const top = $('.top');
  if (reduce) {
    ws.forEach((w) => w.classList.add('lit'));
    addEventListener('scroll', () => top.classList.toggle('solid', scrollY > 40), { passive: true });
    return;
  }

  /* scroll-driven scenes */
  const track = $('.arrive-track'), frame = $('#frame'), title = $('.arrive-title');
  const win = $('.layer-window'), garden = $('.layer-garden'), gimg = $('.layer-garden img'), cap = $('.arrive-cap');
  const panTrack = $('#panTrack'), pan = $('#pan'), panRail = $('#panRail');
  const rise = $('#stupaRise'), stupa = $('#stupa');
  const vimg = $('.visit-media img');
  let panDist = 0;
  const layoutPan = () => {
    const on = desk();
    panTrack.classList.toggle('pinned', on);
    if (!on) { panTrack.style.height = ''; pan.style.transform = ''; return; }
    panDist = Math.max(0, pan.scrollWidth - panRail.clientWidth + parseFloat(getComputedStyle(panRail).paddingLeft) * 2);
    panTrack.style.height = (innerHeight + panDist) + 'px';
  };

  const frameFn = () => {
    ticking = false;
    const vh = innerHeight;
    top.classList.toggle('solid', scrollY > vh * 0.25);

    // 1 · arrival: the frame opens to full bleed, the camera moves through the window, the garden settles
    const r = track.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - vh));
    if (r.bottom > 0) {
      const o = ease(span(p, 0, 0.32));
      const g = getComputedStyle(document.documentElement).getPropertyValue('--gutter');
      const side = `calc(${g} * ${(1 - o).toFixed(3)})`;
      const topIn = (innerWidth > 760 ? 50 : 52) * (1 - o);
      frame.style.clipPath = `inset(${topIn.toFixed(2)}vh ${side} ${(4 * (1 - o)).toFixed(2)}vh ${side} round ${(28 * (1 - o)).toFixed(1)}px)`;
      const tt = span(p, 0.02, 0.26);
      title.style.opacity = (1 - tt).toFixed(3);
      title.style.transform = `translate3d(0, ${(-tt * 60).toFixed(1)}px, 0)`;
      title.style.visibility = tt >= 1 ? 'hidden' : '';
      const z = ease(span(p, 0.22, 0.82));
      // on a portrait phone the opening frame sits low, so the photo starts lifted into it
      const lift = innerWidth <= 760 ? 22 * (1 - o) : 0;
      win.style.transform = `translate3d(0, ${lift.toFixed(2)}vh, 0) scale(${(1 + z * 1.5).toFixed(4)})`;
      const f = span(p, 0.6, 0.84);
      win.style.opacity = (1 - f).toFixed(3);
      garden.style.opacity = f.toFixed(3);
      gimg.style.transform = `scale(${(1.14 - 0.14 * ease(span(p, 0.6, 1))).toFixed(4)})`;
      cap.style.opacity = span(p, 0.86, 0.96).toFixed(3);
    }

    // 2 · words
    const wr = words.getBoundingClientRect();
    if (wr.top < vh && wr.bottom > 0) {
      const wp = clamp((vh * 0.82 - wr.top) / (wr.height + vh * 0.22));
      const n = Math.round(wp * ws.length);
      ws.forEach((w, i) => w.classList.toggle('lit', i < n));
    }

    // 3 · practice pan
    if (panDist) {
      const pr = panTrack.getBoundingClientRect();
      const pp = clamp(-pr.top / (pr.height - vh));
      pan.style.transform = `translate3d(${(-pp * panDist).toFixed(1)}px, 0, 0)`;
    }

    // 4 · stupa rises from its base to the spire
    const sr = stupa.getBoundingClientRect();
    if (sr.top < vh && sr.bottom > 0) {
      const sp = ease(clamp((vh * 0.95 - sr.top) / (vh * 0.75)));
      rise.style.clipPath = `inset(${((1 - sp) * 100).toFixed(2)}% 0 0 0)`;
    }

    // 5 · house drifts behind the visit card
    const vr = vimg.parentElement.getBoundingClientRect();
    if (vr.top < vh && vr.bottom > 0) {
      const vp = clamp((vh - vr.top) / (vh + vr.height));
      vimg.style.transform = `translate3d(0, ${(-vp * (vimg.offsetHeight - vr.height)).toFixed(1)}px, 0)`;
    }
  };
  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frameFn); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { layoutPan(); onScroll(); });
  addEventListener('load', () => { layoutPan(); onScroll(); });
  layoutPan();
  frameFn();
})();
