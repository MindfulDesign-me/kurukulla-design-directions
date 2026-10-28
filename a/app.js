/* Direction A · Hearth: page behaviour. */
(function () {
  const K = window.KKC;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* mobile menu */
  const mb = $('.menu-btn'), mn = $('#mnav');
  mb.addEventListener('click', () => {
    const open = mb.getAttribute('aria-expanded') === 'true';
    mb.setAttribute('aria-expanded', String(!open));
    mn.hidden = open;
  });
  mn.addEventListener('click', (e) => { if (e.target.closest('a')) { mn.hidden = true; mb.setAttribute('aria-expanded', 'false'); } });

  /* this week */
  const list = $('#weekList');
  let html = '';
  for (let i = 0; i < 7; i++) {
    const key = K.addDays(K.today, i);
    const dt = K.d(key);
    const evs = K.range(key, key);
    html += `<article class="day${i === 0 ? ' today' : ''}${evs.length ? '' : ' empty'}">
      <h3 class="day-label">${K.DAY[dt.getDay()]}<small>${dt.getDate()} ${K.MONTH[dt.getMonth()]}</small></h3>
      <ul class="day-events">${evs.length ? evs.map((e) => `
        <li class="ev${e.kind === 'holyday' ? ' holy' : ''}">
          <time datetime="${e.date}${e.start ? 'T' + e.start : ''}">${K.timeRange(e)}</time>
          <h3>${esc(e.title)}</h3>
          <p class="meta">${[e.who, e.note].filter(Boolean).map(esc).join(' · ')}${e.who || e.note ? ' · ' : ''}<span class="fmt">${K.formatLabel[e.format]}</span></p>
        </li>`).join('') : '<li>Nothing scheduled.</li>'}</ul>
    </article>`;
  }
  list.innerHTML = html;

  /* membership */
  const tiers = $('#tierList');
  let per = 'month';
  const renderTiers = () => {
    tiers.innerHTML = K.membership.map((t) => {
      const v = per === 'month' && t.month ? t.month : t.year;
      const unit = per === 'month' && t.month ? 'a month' : 'a year';
      return `<li><b>${t.name}</b><span>${t.perks}</span><p class="price">$${v.toLocaleString('en-US')} <small>${unit}</small></p></li>`;
    }).join('');
  };
  $$('.seg button').forEach((b) => b.addEventListener('click', () => {
    per = b.dataset.per;
    $$('.seg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderTiers();
  }));
  renderTiers();

  /* newsletter (demo only, nothing is sent) */
  const form = $('.inline-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('input', form), msg = $('.form-msg', form);
    if (!input.checkValidity()) { msg.textContent = 'Please enter an email address.'; input.focus(); return; }
    msg.textContent = 'Thank you. In the finished site this subscribes you to the weekly email.';
    form.reset();
  });

  /* prayer-flag chapter line */
  const COLORS = ['blue', 'white', 'red', 'green', 'yellow'];
  const chapters = $$('[data-chapter]');
  const line = $('#flagLine'), now = $('#flagNow');
  // each chapter hangs one traditional set of five: blue, white, red, green, yellow
  line.innerHTML = chapters.map((c, i) => `<li><button class="flag" type="button" data-i="${i}" aria-label="${esc(c.dataset.chapter)}">${
    COLORS.map((col, j) => `<i class="${col}" style="--c:var(--flag-${col});--d:${j * 55}ms;--tilt:${(((i * 5 + j) * 37) % 7 - 3) * 0.7}deg"></i>`).join('')
  }</button></li>`).join('');
  const flags = $$('.flag', line);
  flags.forEach((f, i) => f.addEventListener('click', () => chapters[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })));
  let current = -1;
  const setChapter = () => {
    const mid = innerHeight * 0.4;
    let idx = 0;
    chapters.forEach((c, i) => { if (c.getBoundingClientRect().top < mid) idx = i; });
    if (idx === current) return;
    current = idx;
    flags.forEach((f, i) => {
      f.classList.toggle('up', i <= idx);
      f.classList.toggle('current', i === idx);
      if (i === idx) f.setAttribute('aria-current', 'step'); else f.removeAttribute('aria-current');
    });
    now.textContent = idx < 0 ? 'Welcome' : chapters[idx].dataset.chapter;
  };

  /* reveals */
  document.documentElement.classList.add('motion');
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('[data-reveal]').forEach((el) => io.observe(el));

  /* parallax inside image frames */
  const px = reduce ? [] : $$('[data-parallax]');
  let ticking = false;
  const frame = () => {
    ticking = false;
    setChapter();
    const vh = innerHeight;
    px.forEach((img) => {
      const box = img.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) return;
      // p runs 1 (frame entering at the bottom) to -1 (leaving at the top); the image drifts through its own overflow
      const p = Math.max(-1, Math.min(1, (box.top + box.height / 2 - vh / 2) / (vh / 2 + box.height / 2)));
      const extra = img.offsetHeight - box.height;
      img.style.transform = `translate3d(0, ${(-(1 - p) / 2 * extra).toFixed(1)}px, 0)`;
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  frame();
})();
