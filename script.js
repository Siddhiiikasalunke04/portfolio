(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* interactive network background */
  var cv = document.getElementById('net'), cx = cv.getContext('2d');
  var W = 0, H = 0, pts = [], mouse = { x: -999, y: -999 }, dpr = Math.min(window.devicePixelRatio || 1, 2), running = true;
  function size() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(90, Math.floor(W * H / 16000));
    pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
  }
  function draw() {
    cx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (!reduce) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
        if (d < 15000) { cx.strokeStyle = 'rgba(110,130,255,' + (0.22 * (1 - d / 15000)) + ')'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y); cx.stroke(); }
      }
      var mx = p.x - mouse.x, my = p.y - mouse.y, md = mx * mx + my * my;
      if (md < 22000) { cx.strokeStyle = 'rgba(56,189,248,' + (0.5 * (1 - md / 22000)) + ')'; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(mouse.x, mouse.y); cx.stroke(); }
      cx.fillStyle = 'rgba(120,170,255,.75)'; cx.beginPath(); cx.arc(p.x, p.y, 1.8, 0, 6.283); cx.fill();
    }
    if (running && !reduce) requestAnimationFrame(draw);
  }
  size(); draw();
  window.addEventListener('resize', function () { size(); if (reduce) draw(); });
  window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running && !reduce) requestAnimationFrame(draw); });

  /* typed roles */
  var roles = ['Cloud Engineer', 'DevOps Enthusiast', 'Linux Administrator', 'Technical Support Engineer'];
  var el = document.getElementById('typed'), ri = 0, ci = 0, del = false;
  function tick() {
    var w = roles[ri];
    el.textContent = w.slice(0, ci);
    if (!del && ci === w.length) { del = true; return setTimeout(tick, 1500); }
    if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; }
    ci += del ? -1 : 1;
    setTimeout(tick, del ? 35 : 75);
  }
  if (!reduce) { ci = 0; tick(); }

  /* reveal on scroll */
  var items = document.querySelectorAll('section .card, section h2, section .eyebrow, section .sub, .tl > li, .more');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    items.forEach(function (n, i) { n.classList.add('rv'); n.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(n); });
  }

  /* counters */
  var cs = document.querySelectorAll('[data-count]');
  function runCount(n) {
    var to = +n.getAttribute('data-count'), t0 = null;
    if (to > 1000) return;
    function step(t) { if (!t0) t0 = t; var k = Math.min((t - t0) / 1200, 1); n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
    n.textContent = '0'; requestAnimationFrame(step);
  }
  if (!reduce) cs.forEach(runCount);

  /* progress + scroll spy */
  var bar = document.getElementById('bar'), links = document.querySelectorAll('#links a'), secs = [];
  links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) secs.push([a, s]); });
  var ticking = false;
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
    var cur = null, y = window.scrollY + 120;
    secs.forEach(function (p) { if (p[1].offsetTop <= y) cur = p[0]; });
    links.forEach(function (a) { a.classList.toggle('on', a === cur); });
    if (cur && cur.scrollIntoView && window.innerWidth < 640) { var c = document.getElementById('links'); var l = cur.offsetLeft - 16; c.scrollTo({ left: l, behavior: 'auto' }); }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* skill filter */
  var tabs = document.querySelectorAll('.tab'), groups = document.querySelectorAll('#bento .card');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var f = t.getAttribute('data-f');
      tabs.forEach(function (x) { x.setAttribute('aria-pressed', x === t ? 'true' : 'false'); });
      groups.forEach(function (g) { g.classList.toggle('dim', f !== 'all' && g.getAttribute('data-g') !== f); });
    });
  });

  /* card spotlight */
  document.querySelectorAll('.card').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* resume preview */
  var lb = document.getElementById('lb'), lbimg = document.getElementById('lbimg'), lbt = document.getElementById('lbt'), lbo = document.getElementById('lbo'), lbx = document.getElementById('lbx'), lastF = null;
  function openLb(card) {
    lastF = document.activeElement;
    lbimg.src = card.querySelector('.pvsrc').src;
    lbimg.alt = card.getAttribute('data-title') + ' resume';
    lbt.textContent = card.getAttribute('data-title');
    lbo.href = card.getAttribute('data-pdf');
    lb.hidden = false; document.body.style.overflow = 'hidden'; lbx.focus();
    lb.querySelector('.lbscroll').scrollTop = 0;
  }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; if (lastF && lastF.focus) lastF.focus(); }
  document.querySelectorAll('.rc').forEach(function (c) {
    c.querySelector('.pv').addEventListener('click', function () { openLb(c); });
  });
  lbx.addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  /* copy email */
  var b = document.getElementById('copyMail');
  b.addEventListener('click', function () {
    var t = b.getAttribute('data-copy');
    function ok() { b.textContent = 'Copied'; b.classList.add('done'); setTimeout(function () { b.textContent = 'Copy email'; b.classList.remove('done'); }, 1600); }
    function fallback() {
      var r = document.createRange(); r.selectNodeContents(document.getElementById('mail'));
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Selected';
    }
    try { navigator.clipboard.writeText(t).then(ok, fallback); } catch (e) { fallback(); }
  });
})();
