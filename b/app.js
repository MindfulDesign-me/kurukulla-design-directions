/* Direction B · Clear Light: page behaviour. */
(function () {
  const K = window.KKC;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const chip = (f) => `<span class="chip chip-${f === 'hybrid' ? 'both' : f}">${K.formatLabel[f]}</span>`;
  const realToday = K.today === K.iso(new Date());
  const nowMin = realToday ? new Date().getHours() * 60 + new Date().getMinutes() : 12 * 60;
  const mins = (hm) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
  const dayWord = (date) => {
    const diff = Math.round((K.d(date) - K.d(K.today)) / 864e5);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    const t = K.d(date);
    return K.DAY[t.getDay()] + ' ' + t.getDate() + ' ' + K.MON[t.getMonth()];
  };

  const short = (date) => { const w = dayWord(date); if (w === 'Today' || w === 'Tomorrow') return w; const t = K.d(date); return K.DAY[t.getDay()].slice(0, 3) + ' ' + t.getDate(); };

  /* next at Kurukulla */
  const later = K.upcoming(K.today).filter((e) => e.date > K.today || !e.start || mins(e.end || e.start) > nowMin);
  const next = later.find((e) => e.kind !== 'holyday') || later[0];
  const holyNext = later.find((e) => e.kind === 'holyday');
  let when = dayWord(next.date);
  if (when === 'Today' && next.start && mins(next.start) >= 17 * 60) when = 'Tonight';
  let countdown = '';
  if (realToday && next.date === K.today && next.start) {
    const left = mins(next.start) - nowMin;
    countdown = left > 0 ? `in ${left >= 60 ? Math.floor(left / 60) + ' h ' : ''}${left % 60} min` : 'happening now';
  }
  $('#nowCard').innerHTML = `
    <p class="now-k"><span class="pulse" aria-hidden="true"></span>Next at Kurukulla</p>
    <h2>${esc(next.title)}</h2>
    <p class="now-meta">${esc(next.who || '')}</p>
    <p class="now-time"><span>${when}, ${K.timeRange(next)}${countdown ? ' · ' + countdown : ''}</span>${chip(next.format)}</p>
    <div class="now-actions">
      ${next.format !== 'center' ? '<a class="btn btn-lapis" href="#">Join on Zoom</a>' : ''}
      <a class="btn btn-ghost" href="#">Add to calendar</a>
    </div>
    <div class="now-next">${later.filter((e) => e !== next && e.kind !== 'holyday').slice(0, 1).map((e) => `<p><span>${short(e.date)}</span><span>${esc(e.title)}</span></p>`).join('')}
    ${holyNext ? `<p><span>${short(holyNext.date)}</span><span><b>${esc(holyNext.title)}</b></span></p>` : ''}</div>`;

  /* two-week planner */
  const daysEl = $('#days'), agenda = $('#agenda');
  const keys = Array.from({ length: 14 }, (_, i) => K.addDays(K.today, i));
  let sel = keys[0], filter = 'all';
  daysEl.innerHTML = keys.map((k, i) => {
    const t = K.d(k), evs = K.range(k, k);
    const dots = evs.slice(0, 4).map((e) => `<i class="${e.kind === 'holyday' ? 'holy' : e.format === 'online' ? 'online' : ''}"></i>`).join('');
    return `<button class="day${i === 0 ? ' today' : ''}" role="tab" id="d-${k}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-k="${k}" aria-label="${K.DAY[t.getDay()]} ${t.getDate()} ${K.MONTH[t.getMonth()]}, ${evs.length} events">
      <span class="dw">${i === 0 ? 'Today' : K.DAY[t.getDay()].slice(0, 3)}</span><span class="dn">${t.getDate()}</span><span class="dots">${dots}</span></button>`;
  }).join('');
  const pass = (e) => filter === 'all' || e.format === 'hybrid' || e.format === filter;
  const renderAgenda = () => {
    const evs = K.range(sel, sel).filter(pass);
    agenda.setAttribute('aria-labelledby', 'd-' + sel);
    const t = K.d(sel);
    agenda.innerHTML = `<p class="ag-day">${dayWord(sel) === 'Today' ? 'Today, ' : ''}${K.DAY[t.getDay()]} ${t.getDate()} ${K.MONTH[t.getMonth()]}</p>` + (evs.length ? evs.map((e) => `
      <article class="ag${e.kind === 'holyday' ? ' holy' : ''}">
        <time datetime="${e.date}${e.start ? 'T' + e.start : ''}">${e.start ? K.fmtTime(e.start) : 'All day'}${e.end ? `<small>to ${K.fmtTime(e.end)}</small>` : ''}</time>
        <h3>${esc(e.title)}</h3>
        <p class="who">${[e.who, e.note].filter(Boolean).map(esc).join(' · ')}</p>
        <div class="tags">${e.kind === 'holyday' ? '<span class="chip chip-holy">Holy day</span>' : chip(e.format)}</div>
      </article>`).join('') : `<p class="ag-empty">Nothing ${filter === 'all' ? 'scheduled' : filter === 'online' ? 'online' : 'at the center'} on this day.</p>`);
  };
  const selectDay = (btn, focus) => {
    sel = btn.dataset.k;
    $$('.day', daysEl).forEach((b) => { b.setAttribute('aria-selected', String(b === btn)); b.tabIndex = b === btn ? 0 : -1; });
    if (focus) btn.focus();
    renderAgenda();
  };
  daysEl.addEventListener('click', (e) => { const b = e.target.closest('.day'); if (b) selectDay(b); });
  daysEl.addEventListener('keydown', (e) => {
    const list = $$('.day', daysEl), i = list.findIndex((b) => b.dataset.k === sel);
    const j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : -2;
    if (j === -2) return;
    e.preventDefault();
    selectDay(list[Math.max(0, Math.min(list.length - 1, j))], true);
  });
  $$('.filters button').forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.f;
    $$('.filters button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderAgenda();
  }));
  renderAgenda();

  /* lunar dial */
  const LUNAR = [
    { date: '2026-11-01', ld: 22, name: 'Lhabab Duchen', what: 'Descent from Tushita. Mahayana Precepts online at 6 AM, Guru Puja at 1 PM' },
    { date: '2026-11-04', ld: 25, name: 'Guru Puja', what: 'Lama Chopa, 7 PM, in person and online' },
    { date: '2026-11-17', ld: 8, name: 'Tara Puja', what: 'Cittamani Tara, 7 PM, in person and online' },
    { date: '2026-11-19', ld: 10, name: 'Guru Puja', what: 'Lama Chopa, 7 PM, in person and online' },
    { date: '2026-11-24', ld: 15, name: 'Medicine Buddha Puja', what: 'Full moon. 7 PM, in person and online' },
    { date: '2026-12-03', ld: 25, name: 'Lama Tsongkhapa Day', what: 'Guru Puja with tsog offering, 7 PM' },
    { date: '2026-12-17', ld: 8, name: 'Tara Puja', what: 'Cittamani Tara, 7 PM, in person and online' },
    { date: '2026-12-19', ld: 10, name: 'Guru Puja', what: 'Lama Chopa, 4 PM, in person and online' },
  ].filter((s) => s.date >= K.today).slice(0, 6);
  // cumulative lunar position so the dial always turns forward through the month
  let acc = LUNAR.length ? LUNAR[0].ld : 1;
  LUNAR.forEach((s, i) => { if (i) { let step = s.ld - LUNAR[i - 1].ld; if (step <= 0) step += 30; acc += step; } s.pos = acc; });
  $('#stops').innerHTML = LUNAR.map((s, i) => {
    const t = K.d(s.date);
    return `<li class="stop" data-i="${i}"><span class="ld">Day ${s.ld}</span><span><b>${s.name}</b> · ${K.DAY[t.getDay()].slice(0, 3)} ${t.getDate()} ${K.MON[t.getMonth()]}</span><span>${s.what}</span></li>`;
  }).join('');
  const NS = 'http://www.w3.org/2000/svg';
  const rot = $('#dialRot');
  const PUJA = { 8: 'Tara', 10: 'Guru Puja', 15: 'Medicine Buddha', 25: 'Guru Puja', 22: 'Lhabab Duchen' };
  let svg = '<circle class="ring" r="118"/>';
  const labels = [];
  for (let day = 1; day <= 30; day++) {
    const a = ((day - 1) * 12 - 90) * Math.PI / 180;
    const major = PUJA[day];
    const r1 = 108, r2 = major ? 128 : 122;
    svg += `<line class="tick${major ? ' major' : ''}" x1="${(Math.cos(a) * r1).toFixed(2)}" y1="${(Math.sin(a) * r1).toFixed(2)}" x2="${(Math.cos(a) * r2).toFixed(2)}" y2="${(Math.sin(a) * r2).toFixed(2)}"/>`;
    if (major) svg += `<circle class="mark" data-ld="${day}" cx="${(Math.cos(a) * 118).toFixed(2)}" cy="${(Math.sin(a) * 118).toFixed(2)}" r="6"/>`;
    if (major || day % 5 === 0 || day === 1) {
      const x = Math.cos(a) * 143, y = Math.sin(a) * 143;
      svg += `<text class="num" x="${x.toFixed(2)}" y="${y.toFixed(2)}" data-x="${x.toFixed(2)}" data-y="${y.toFixed(2)}">${day}</text>`;
    }
  }
  rot.innerHTML = svg;
  const pointer = document.createElementNS(NS, 'path');
  pointer.setAttribute('class', 'dial-pointer');
  pointer.setAttribute('d', 'M0 -96 L-7 -84 L7 -84 Z');
  $('#dial').appendChild(pointer);
  const nums = $$('.num', rot), marks = $$('.mark', rot), stops = $$('.stop');
  const read = $('#dialRead');
  let shown = -1;
  const setDial = (pos) => {
    const deg = -(pos - 1) * 12;
    rot.setAttribute('transform', `rotate(${deg.toFixed(2)})`);
    nums.forEach((n) => n.setAttribute('transform', `rotate(${(-deg).toFixed(2)} ${n.dataset.x} ${n.dataset.y})`));
    let i = 0;
    LUNAR.forEach((s, j) => { if (pos >= s.pos - 0.5) i = j; });
    if (i !== shown) {
      shown = i;
      const s = LUNAR[i];
      stops.forEach((el, j) => el.classList.toggle('on', j === i));
      marks.forEach((m) => m.classList.toggle('on', +m.dataset.ld === s.ld));
      const t = K.d(s.date);
      read.innerHTML = `<span class="rd">${t.getDate()} ${K.MON[t.getMonth()]}</span><span class="rl">Day ${s.ld} · ${s.name}</span>`;
    }
  };
  const track = $('.moon-track');
  const pinned = () => matchMedia('(min-width: 900px)').matches && !reduce;
  const dialFrame = () => {
    if (!LUNAR.length) return;
    const r = track.getBoundingClientRect();
    if (reduce || r.bottom < 0 || r.top > innerHeight) return;
    if (!pinned()) {
      // phone: the stop nearest the lower middle of the screen sets the dial (CSS eases the turn)
      let best = 0, dist = Infinity;
      stops.forEach((el, j) => { const b = el.getBoundingClientRect(); const d = Math.abs(b.top + b.height / 2 - innerHeight * 0.62); if (d < dist) { dist = d; best = j; } });
      setDial(LUNAR[best].pos);
      return;
    }
    const p = Math.max(0, Math.min(1, -r.top / (r.height - innerHeight)));
    const f = p * (LUNAR.length - 1), i = Math.floor(f), k = f - i;
    const a = LUNAR[i], b = LUNAR[Math.min(i + 1, LUNAR.length - 1)];
    // ease between stops so each one holds for a moment
    const e = k < 0.35 ? 0 : k > 0.85 ? 1 : (k - 0.35) / 0.5;
    setDial(a.pos + (b.pos - a.pos) * (e * e * (3 - 2 * e)));
  };
  if (LUNAR.length) setDial(LUNAR[0].pos);
  stops.forEach((el) => el.addEventListener('click', () => {
    const i = +el.dataset.i;
    if (pinned()) {
      const top = track.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + (track.offsetHeight - innerHeight) * (i / Math.max(1, LUNAR.length - 1)) + 2, behavior: reduce ? 'auto' : 'smooth' });
    } else setDial(LUNAR[i].pos);
  }));

  /* learning path progress */
  const rail = $('.path-rail'), bar = $('#pathBar');
  const railProgress = () => { bar.style.width = Math.min(100, ((rail.scrollLeft + rail.clientWidth) / rail.scrollWidth) * 100) + '%'; };
  rail.addEventListener('scroll', railProgress, { passive: true });

  /* visit tabs */
  const tabs = $$('.tabs [role="tab"]');
  const pick = (t, focus) => {
    tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
    if (focus) t.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      pick(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
    });
  });
  $('#copyAddr').addEventListener('click', async (e) => {
    const b = e.currentTarget;
    try { await navigator.clipboard.writeText('Kurukulla Center, 68 Magoun Avenue, Medford, MA 02155'); b.textContent = 'Copied'; }
    catch { b.textContent = '68 Magoun Ave, Medford'; }
    setTimeout(() => { b.textContent = 'Copy address'; }, 2200);
  });

  /* giving */
  const gForm = $('.g-card'), gBtn = $('#giveBtn');
  let freq = 'once';
  const label = () => { const v = $('input[name="amt"]:checked', gForm).value; gBtn.textContent = `Give $${v}${freq === 'month' ? ' a month' : ''}`; };
  gForm.addEventListener('change', label);
  $$('.seg button', gForm).forEach((b) => b.addEventListener('click', () => {
    freq = b.dataset.freq;
    $$('.seg button', gForm).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    label();
  }));
  gForm.addEventListener('submit', (e) => { e.preventDefault(); $('.g-msg', gForm).textContent = 'In the finished site this opens a secure PayPal or card checkout.'; });
  $('#memberList').innerHTML = K.membership.map((m) => `<li><b>${m.name}</b><span>${m.perks}</span><em>${m.month ? '$' + m.month + '/mo' : '$' + m.year + '/yr'}</em></li>`).join('');

  /* newsletter */
  const nForm = $('.n-card');
  nForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = $('input', nForm), msg = $('.n-msg', nForm);
    if (!inp.checkValidity()) { msg.textContent = 'Please enter an email address.'; inp.focus(); return; }
    msg.textContent = 'Thank you. In the finished site this adds you to the weekly email.';
    nForm.reset();
  });

  /* tab bar state */
  const tabLinks = $$('.tabbar a');
  const secs = tabLinks.map((a) => $(a.getAttribute('href')));
  const tabIO = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) tabLinks.forEach((a, i) => { const on = secs[i] === en.target; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
  }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach((s) => s && tabIO.observe(s));

  /* reveals */
  document.documentElement.classList.add('motion');
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  $$('[data-reveal]').forEach((el) => io.observe(el));

  /* hero depth: photo and card drift apart a little as the page starts to move */
  const depth = reduce ? [] : $$('[data-depth]');
  let ticking = false;
  const frame = () => {
    ticking = false;
    const y = scrollY;
    if (y < innerHeight * 1.2) depth.forEach((el) => { el.style.transform = `translate3d(0, ${(y * parseFloat(el.dataset.depth) * 2).toFixed(1)}px, 0)`; });
    dialFrame();
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', () => { railProgress(); frame(); });
  railProgress();
  frame();
})();
