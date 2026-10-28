/* Kurukulla Center programme, October to December 2026.
   Taken from the live calendar on kurukulla.org (read 28 October 2026).
   Shared by all three directions. */
(function () {
  const GESHE = 'Geshe Tenley';
  const DAMCHOE = 'Thubten Damchoe';
  const SEAN = 'Seán González';
  const CANAN = 'Canan Ayar';

  // kind: teaching | course | puja | practice | yoga | holyday | workshop
  // format: hybrid (in person and online) | center (in person only) | online
  const weekly = {
    sun: [
      { start: '09:30', end: '10:00', title: 'Prostrations to the Thirty-Five Confession Buddhas', who: 'led by ' + DAMCHOE, kind: 'practice', format: 'center' },
      { start: '10:00', end: '12:00', title: "Chapter 8, A Guide to the Bodhisattva's Way of Life: Meditation", who: GESHE, kind: 'teaching', format: 'hybrid' },
    ],
    tue: [{ start: '19:00', end: '20:15', title: 'Yoga & Meditation', who: CANAN, kind: 'yoga', format: 'hybrid' }],
    wed: [{ start: '19:00', end: '21:00', title: 'The Wheel of Sharp Weapons', who: GESHE, kind: 'teaching', format: 'hybrid' }],
    fri: [{ start: '20:00', end: '', title: 'Chanting the Names of Noble Manjushri', who: DAMCHOE, kind: 'practice', format: 'online' }],
  };

  const intro = (n, name, format) => ({ start: '15:00', end: '17:00', title: 'Introduction to Buddhism, Module ' + n + ': ' + name, who: SEAN, kind: 'course', format });
  const lamaChopa = (lunar, start = '19:00', end = '20:30', title = 'Lama Chopa / Guru Puja') => ({ start, end, title, who: '', kind: 'puja', format: 'hybrid', note: lunar });

  // Specials by date (ISO). Weekly items are added automatically unless `skip` lists them.
  const specials = {
    '2026-10-26': [{ start: '19:00', end: '20:00', title: 'Medicine Buddha Puja', who: '', kind: 'puja', format: 'hybrid', note: '15th day of the Tibetan calendar' }],
    '2026-10-31': [intro(3, 'Everyday Dharma', 'online')],
    '2026-11-01': {
      skip: ['sun'],
      items: [
        { start: '', end: '', title: 'Lhabab Duchen, Descent from Tushita', who: '', kind: 'holyday', format: 'hybrid', note: 'One of the four great Buddhist holy days. Merit-multiplying day.' },
        { start: '06:00', end: '', title: 'Twenty-four Hour Mahayana Precepts Ceremony', who: 'conferred by ' + GESHE, kind: 'practice', format: 'online' },
        lamaChopa('', '13:00', '14:30'),
      ],
    },
    '2026-11-04': { skip: ['wed'], items: [lamaChopa('25th day of the Tibetan calendar')] },
    '2026-11-07': [intro(4, 'The Dharma and AI', 'online')],
    '2026-11-14': [
      { start: '09:00', end: '16:00', title: 'Reiki Plus More, Reiki Level II', who: 'Pat Venter', kind: 'workshop', format: 'center', note: 'Two-day certification. Suggested donation $90.' },
      intro(4, 'The Dharma and AI', 'online'),
    ],
    '2026-11-15': [{ start: '13:00', end: '16:00', title: 'Reiki Plus More, Reiki Level II (day two)', who: 'Pat Venter', kind: 'workshop', format: 'center' }],
    '2026-11-17': { skip: ['tue'], items: [{ start: '19:00', end: '20:30', title: 'Cittamani Tara Puja', who: '', kind: 'puja', format: 'hybrid', note: '8th day of the Tibetan calendar' }] },
    '2026-11-19': [lamaChopa('10th day of the Tibetan calendar')],
    '2026-11-21': [intro(4, 'The Dharma and AI', 'online')],
    '2026-11-24': { skip: ['tue'], items: [{ start: '19:00', end: '20:00', title: 'Medicine Buddha Puja', who: '', kind: 'puja', format: 'hybrid', note: '15th day of the Tibetan calendar' }] },
    '2026-11-27': { skip: ['fri'], items: [{ start: '20:00', end: '', title: 'Chanting the Names of Noble Manjushri', who: DAMCHOE, kind: 'practice', format: 'online' }] },
    '2026-11-28': [intro(4, 'The Dharma and AI', 'online')],
    '2026-12-03': [
      { start: '', end: '', title: 'Lama Tsongkhapa Day', who: '', kind: 'holyday', format: 'hybrid', note: 'Anniversary of the parinirvana of the founder of the Gelug tradition.' },
      lamaChopa('25th day of the Tibetan calendar', '19:00', '20:30', 'Lama Chopa / Guru Puja with Tsog Offering'),
    ],
    '2026-12-05': [intro(4, 'The Dharma and AI', 'online')],
    '2026-12-12': [intro(5, 'Establishing a Daily Practice', 'hybrid')],
    '2026-12-17': [{ start: '19:00', end: '20:30', title: 'Cittamani Tara Puja', who: '', kind: 'puja', format: 'hybrid', note: '8th day of the Tibetan calendar' }],
    '2026-12-19': [lamaChopa('10th day of the Tibetan calendar', '16:00', '17:30'), intro(5, 'Establishing a Daily Practice', 'hybrid')],
    '2026-12-26': [intro(5, 'Establishing a Daily Practice', 'hybrid')],
  };

  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const d = (s) => { const [y, m, dd] = s.split('-').map(Number); return new Date(y, m - 1, dd); };

  const FIRST = '2026-10-25', LAST = '2026-12-31';
  const events = [];
  for (let t = d(FIRST); t <= d(LAST); t.setDate(t.getDate() + 1)) {
    const key = iso(t);
    const sp = specials[key];
    const skip = sp && !Array.isArray(sp) ? sp.skip : [];
    const extra = sp ? (Array.isArray(sp) ? sp : sp.items) : [];
    const dow = days[t.getDay()];
    const list = [...(skip.includes(dow) ? [] : weekly[dow] || []), ...extra];
    list.sort((a, b) => (a.start || '00:00').localeCompare(b.start || '00:00'));
    list.forEach((e, i) => events.push({ id: key + '-' + i, date: key, ...e }));
  }

  // "Today" follows the real clock while the programme is current, so the pages stay sensible later.
  const now = new Date();
  const today = iso(now) >= FIRST && iso(now) <= '2026-12-24' ? iso(now) : '2026-10-28';

  const fmtTime = (hm) => {
    if (!hm) return '';
    let [h, m] = hm.split(':').map(Number);
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + (m ? ':' + pad(m) : '') + ' ' + ap;
  };
  const timeRange = (e) => {
    if (!e.start) return 'All day';
    if (!e.end) return fmtTime(e.start);
    const a = fmtTime(e.start), b = fmtTime(e.end);
    return a.slice(-2) === b.slice(-2) ? a.slice(0, -3) + ' to ' + b : a + ' to ' + b;
  };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const formatLabel = { hybrid: 'In person & online', center: 'In person', online: 'Online' };
  const kindLabel = { teaching: 'Teaching', course: 'Course', puja: 'Puja', practice: 'Practice', yoga: 'Yoga', holyday: 'Holy day', workshop: 'Workshop' };

  const addDays = (s, n) => { const t = d(s); t.setDate(t.getDate() + n); return iso(t); };
  const upcoming = (from = today, n = 99) => events.filter((e) => e.date >= from).slice(0, n);
  const range = (from, to) => events.filter((e) => e.date >= from && e.date <= to);
  const holyDays = events.filter((e) => e.kind === 'holyday' || e.kind === 'puja');

  window.KKC = {
    today, events, weekly, upcoming, range, holyDays, addDays,
    d, iso, fmtTime, timeRange, MON, MONTH, DAY, formatLabel, kindLabel,
    contact: {
      address: ['68 Magoun Avenue', 'Medford, MA 02155'],
      phone: '(617) 624-0177',
      email: 'info@kurukulla.org',
      program: 'program@kurukulla.org',
      membership: 'membership@kurukulla.org',
    },
    membership: [
      { name: 'Friend of Kurukulla', year: 125, month: null, perks: '5% off at the bookstore' },
      { name: 'Student', year: 420, month: 35, perks: 'Mandala publications, 10% off at the bookstore' },
      { name: 'Regular', year: 600, month: 50, perks: 'Mandala publications, 10% off at the bookstore' },
      { name: 'Family', year: 900, month: 75, perks: 'Mandala publications, 10% off at the bookstore' },
      { name: 'Sustaining', year: 1500, month: 125, perks: 'Mandala publications, 20% off at the bookstore' },
    ],
  };
})();
