/* =========================================================
   Wedding Invitation — script.js
   윤호진 ♡ 박선영 (2027.03.06)
   Vanilla JS only. Implements motion-spec.md Must/Should items.
   ========================================================= */
(function () {
  'use strict';

  // ---------------------------------------------------------
  // PLACEHOLDERS — 실제 운영 시 아래 값을 채워주세요.
  // ---------------------------------------------------------
  const KAKAO_JS_KEY     = '0a9b30e3ac311ebc75af75fb3290f2cd'; // 카카오 JavaScript 키
  const GUESTBOOK_URL    = ''; // placeholder: 외부 방명록 폼 URL
  const MYBOX_UPLOAD_URL  = ''; // placeholder: 하객 업로드 허용 MYBOX 폴더 공유 링크
  const BGM_SRC          = ''; // placeholder: 사용 허가된 음원 파일 경로 (예: 'audio/bgm.mp3')
  // Supabase publishable/anon key is designed for browser use; RLS limits the table to public minimi IDs.
  const SUPABASE_URL      = 'https://lcukpufzpijhwqdpejyx.supabase.co';
  const SUPABASE_KEY      = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdWtwdWZ6cGlqaHdxZHBlanl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTE4MjAsImV4cCI6MjA3NzMyNzgyMH0.s1qRdFzgS8SPBYcA419eEwrBV6fXslHxoaZIrYZNovg';
  const SHARE_TITLE      = '윤호진 ♡ 박선영 결혼합니다';
  const SHARE_DESC       = '2027년 3월 6일 토요일 오후 1시 40분\n창원컨벤션센터(CECO) 3층 단독홀';
  const SHARE_IMAGE      = location.origin + location.pathname.replace(/\/[^/]*$/, '/') + 'images/og-thumbnail.png';
  const TARGET_DATE_STR  = '2027-03-06';
  const TARGET_HOUR      = 13;

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isReduced     = () => reducedMotion.matches;
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const haptic = (n) => { try { navigator.vibrate && navigator.vibrate(n); } catch (e) {} };

  // ---------------------------------------------------------
  // 1. HERO entrance step-in
  // ---------------------------------------------------------
  function setupHero() {
    const hero = $('.hero');
    if (!hero) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => hero.classList.add('is-loaded'));
    });
  }

  // ---------------------------------------------------------
  // 2. IntersectionObserver fade reveal
  // ---------------------------------------------------------
  function setupReveal() {
    const targets = $$('.reveal');
    if (!targets.length) return;
    if (isReduced()) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(el => io.observe(el));

    // 갤러리 첫 슬라이드 blur reveal
    const firstSlide = $('.gallery-slide:first-child');
    if (firstSlide) firstSlide.classList.add('first-reveal');
  }

  // ---------------------------------------------------------
  // 3. Petals background canvas (motion §1-A)
  // ---------------------------------------------------------
  function setupPetals() {
    if (isReduced()) return;
    const canvas = $('.bg-petals');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0, H = 0;
    let petals = [];
    let count = 24;
    let running = true;
    let frameCount = 0;
    let measureStart = 0;
    let rafId = null;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class Petal {
      constructor(init) { this.reset(init); }
      reset(init) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : -30;
        this.size = 8 + Math.random() * 8;             // 8 ~ 16
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.03;
        this.dur = 14000 + Math.random() * 8000;       // 14~22s
        this.start = performance.now() - (init ? Math.random() * this.dur : 0);
        this.swayAmp = 20 + Math.random() * 20;
        this.swayPhase = Math.random() * Math.PI * 2;
        this.opacity = 0.18 + Math.random() * 0.14;    // 0.18 ~ 0.32
        this.color = Math.random() < 0.7 ? '#C9A2A2' : '#A8B59C';
        this.baseX = this.x;
      }
      step(now) {
        const t = (now - this.start) / this.dur;
        if (t > 1) { this.reset(false); return; }
        this.y = -30 + (H + 60) * t;
        this.x = this.baseX + Math.sin(now / 1000 + this.swayPhase) * this.swayAmp;
        this.rot += this.rotSpeed;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.4, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function spawn() {
      petals = Array.from({ length: count }, () => new Petal(true));
    }

    function loop(now) {
      if (running) {
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < petals.length; i++) {
          petals[i].step(now);
          petals[i].draw();
        }
        // 5초 후 fps 측정 → 50fps 미만 시 count 절반
        frameCount++;
        if (!measureStart) measureStart = now;
        if (now - measureStart > 5000 && frameCount > 0) {
          const fps = (frameCount / (now - measureStart)) * 1000;
          if (fps < 50 && count > 12) {
            count = 12;
            spawn();
          }
          measureStart = 0;
          frameCount = 0;
        }
      }
      rafId = requestAnimationFrame(loop);
    }

    resize();
    spawn();
    rafId = requestAnimationFrame(loop);
    window.addEventListener('resize', resize, { passive: true });

    // 페이지가 가려지면 일시정지 (배터리/CPU 절약)
    document.addEventListener('visibilitychange', () => {
      running = document.visibilityState !== 'hidden';
    });
  }

  // ---------------------------------------------------------
  // 4. Calendar render + D-day count-up (motion §3-1)
  // ---------------------------------------------------------
  function setupCalendar() {
    const tbl = $('.cal');
    if (!tbl) return;
    const target = new Date(TARGET_DATE_STR + 'T00:00:00');
    const y = target.getFullYear();
    const m = target.getMonth();
    const first = new Date(y, m, 1).getDay();
    const last  = new Date(y, m + 1, 0).getDate();
    const tbody = tbl.querySelector('tbody');

    let html = '<tr>';
    for (let i = 0; i < first; i++) html += '<td></td>';
    for (let d = 1; d <= last; d++) {
      const dow = (first + d - 1) % 7;
      const cls = [];
      if (d === target.getDate()) cls.push('today');
      if (dow === 0) cls.push('sun');
      if (dow === 6) cls.push('sat');
      html += `<td${cls.length ? ` class="${cls.join(' ')}"` : ''}><span>${d}</span></td>`;
      if ((first + d) % 7 === 0 && d !== last) html += '</tr><tr>';
    }
    html += '</tr>';
    tbody.innerHTML = html;

    // D-day 계산: 자정 → 자정 기준으로 정수 일수만 비교 (시각 무관)
    const ddayNum = $('#dday-num');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDay = new Date(y, m, target.getDate(), 0, 0, 0);
    const diff = Math.round((targetDay - today) / (1000 * 60 * 60 * 24));
    const ddayLabel = $('.dday-label');
    const ddayBlock = $('.dday');

    if (diff > 0) {
      ddayNum.dataset.target = String(diff);
      ddayNum.textContent = isReduced() ? String(diff) : '0';
    } else if (diff === 0) {
      ddayBlock.innerHTML = '<span class="script" style="font-size:24px;color:var(--color-primary)">오늘</span><br><span style="font-size:14px;color:var(--color-muted)">두 사람이 부부가 됩니다</span>';
      if (ddayLabel) ddayLabel.style.display = 'none';
    } else {
      ddayNum.dataset.target = String(-diff);
      ddayNum.textContent = isReduced() ? String(-diff) : '0';
      if (ddayLabel) ddayLabel.textContent = '결혼한 지';
      ddayBlock.firstChild.textContent = 'D + ';
    }

    // count-up 애니메이션
    if (!isReduced() && diff !== 0) {
      const onIntersect = (entries, obs) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          countUp(ddayNum, parseInt(ddayNum.dataset.target, 10), 1400);
          obs.disconnect();
        });
      };
      new IntersectionObserver(onIntersect, { threshold: 0.4 })
        .observe($('#calendar'));
    }
  }

  function countUp(el, target, dur) {
    const start = performance.now();
    function tick(now) {
      const t = clamp((now - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------------------------------------------------------
  // 5. Gallery: swipe + nav + dots + auto-play (motion §3-2)
  // ---------------------------------------------------------
  let galleryAPI = null;
  function setupGallery() {
    const stage = $('.gallery-stage');
    const track = $('#gallery-track');
    if (!stage || !track) return;
    const slides = $$('.gallery-slide', track);
    const dots   = $$('#gallery-dots li');
    const prev   = $('.gallery-prev');
    const next   = $('.gallery-next');
    const N = slides.length;
    let idx = 0;
    let auto = null;
    let dragX = 0;
    let dragStartX = 0;
    let dragging = false;
    let inViewport = false;
    let userPaused = false;

    function show(i, withTransition = true) {
      idx = ((i % N) + N) % N;
      track.style.transition = withTransition ? '' : 'none';
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle('active', k === idx));
      slides.forEach((s, k) => {
        s.setAttribute('aria-hidden', k === idx ? 'false' : 'true');
      });
    }
    function startAuto() {
      if (isReduced() || userPaused || !inViewport) return;
      stopAuto();
      auto = setInterval(() => show(idx + 1), 5000);
    }
    function stopAuto() {
      if (auto) { clearInterval(auto); auto = null; }
    }
    function pauseUser(durationMs = 10000) {
      userPaused = true;
      stopAuto();
      clearTimeout(pauseUser._t);
      pauseUser._t = setTimeout(() => { userPaused = false; startAuto(); }, durationMs);
    }

    // Touch events
    track.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      dragging = true;
      dragStartX = e.touches[0].clientX;
      dragX = 0;
      track.style.transition = 'none';
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      dragX = e.touches[0].clientX - dragStartX;
      const w = stage.clientWidth || 1;
      track.style.transform = `translateX(calc(-${idx * 100}% + ${dragX}px))`;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      track.style.transition = '';
      const threshold = 50;
      if (dragX > threshold) { show(idx - 1); haptic(8); }
      else if (dragX < -threshold) { show(idx + 1); haptic(8); }
      else { show(idx); }
      pauseUser(10000);
    });

    // Click navigation
    prev?.addEventListener('click', () => { show(idx - 1); haptic(8); pauseUser(10000); });
    next?.addEventListener('click', () => { show(idx + 1); haptic(8); pauseUser(10000); });

    // Click slide → lightbox
    slides.forEach((slide, i) => {
      const img = $('img', slide);
      img?.addEventListener('click', () => {
        if (Math.abs(dragX) > 5) return; // 스와이프 후 클릭 무시
        openLightbox(i);
      });
    });

    // Keyboard
    stage.tabIndex = 0;
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { show(idx - 1); haptic(8); pauseUser(10000); }
      if (e.key === 'ArrowRight') { show(idx + 1); haptic(8); pauseUser(10000); }
    });

    // Auto-play viewport gating
    new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      if (inViewport) startAuto(); else stopAuto();
    }, { threshold: 0.4 }).observe(stage);

    show(0);
    galleryAPI = { show, count: N };
  }

  // ---------------------------------------------------------
  // 6. Lightbox + pinch zoom + double-tap (motion §3-5)
  // ---------------------------------------------------------
  let lightboxAPI = null;
  function setupLightbox() {
    const lb = $('#lightbox');
    const img = $('#lightbox-img');
    const close = $('#lightbox-close');
    if (!lb || !img || !close) return;

    const slides = $$('.gallery-slide img');
    let scale = 1;
    let originX = 0, originY = 0;
    let lastDist = 0;
    let lastTap = 0;
    let panStart = null;
    let prevFocus = null;
    let currentIdx = 0;

    function setTransform() {
      img.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
    }
    function reset() {
      scale = 1; originX = 0; originY = 0;
      img.style.transform = '';
    }

    function open(i) {
      currentIdx = i;
      img.src = slides[i].src;
      img.alt = slides[i].alt || '';
      lb.hidden = false;
      requestAnimationFrame(() => lb.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      prevFocus = document.activeElement;
      close.focus();
      haptic(15);
    }
    function closeFn() {
      lb.classList.remove('is-open');
      setTimeout(() => {
        lb.hidden = true;
        reset();
        document.body.style.overflow = '';
        if (prevFocus && prevFocus.focus) prevFocus.focus();
      }, isReduced() ? 0 : 220);
    }

    close.addEventListener('click', closeFn);
    lb.addEventListener('click', (e) => { if (e.target === lb) closeFn(); });
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeFn();
      if (e.key === 'ArrowLeft' && galleryAPI) {
        currentIdx = (currentIdx - 1 + galleryAPI.count) % galleryAPI.count;
        img.src = slides[currentIdx].src; reset();
        galleryAPI.show(currentIdx);
      }
      if (e.key === 'ArrowRight' && galleryAPI) {
        currentIdx = (currentIdx + 1) % galleryAPI.count;
        img.src = slides[currentIdx].src; reset();
        galleryAPI.show(currentIdx);
      }
    });

    // Pinch / double-tap zoom
    img.addEventListener('touchstart', (e) => {
      lb.classList.add('is-zooming');
      if (e.touches.length === 2) {
        const [a, b] = e.touches;
        lastDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      } else if (e.touches.length === 1) {
        const now = Date.now();
        if (now - lastTap < 300) {
          scale = scale > 1.05 ? 1 : 2.4;
          originX = 0; originY = 0;
          lb.classList.remove('is-zooming'); // smooth transition
          setTransform();
          haptic(10);
        } else {
          if (scale > 1) {
            panStart = { x: e.touches[0].clientX - originX, y: e.touches[0].clientY - originY };
          }
        }
        lastTap = now;
      }
    }, { passive: true });

    img.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const [a, b] = e.touches;
        const d = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        if (lastDist > 0) {
          scale = clamp(scale * (d / lastDist), 1, 3);
          setTransform();
        }
        lastDist = d;
      } else if (e.touches.length === 1 && panStart && scale > 1) {
        originX = e.touches[0].clientX - panStart.x;
        originY = e.touches[0].clientY - panStart.y;
        setTransform();
      }
    }, { passive: true });

    img.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        lastDist = 0;
        panStart = null;
        if (scale < 1.05) reset();
        lb.classList.remove('is-zooming');
      }
    });

    lightboxAPI = { open };
    window.openLightbox = open; // 갤러리에서 호출
  }

  // local helper bridge
  function openLightbox(i) {
    if (lightboxAPI) lightboxAPI.open(i);
  }

  // ---------------------------------------------------------
  // 7. Copy account number + toast (motion §3-3)
  // ---------------------------------------------------------
  function setupCopy() {
    $$('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const txt = btn.dataset.copy || '';
        let ok = false;
        try {
          await navigator.clipboard.writeText(txt);
          ok = true;
        } catch (e) {
          try {
            const ta = document.createElement('textarea');
            ta.value = txt;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            ok = document.execCommand('copy');
            document.body.removeChild(ta);
          } catch (e2) { ok = false; }
        }
        if (ok) {
          btn.classList.add('is-copied');
          haptic(15);
          showToast('계좌번호가 복사되었습니다');
          setTimeout(() => btn.classList.remove('is-copied'), 1400);
        } else {
          showToast('복사에 실패했습니다. 직접 선택해주세요');
        }
      });
    });
  }

  // ---------------------------------------------------------
  // 8. Toast
  // ---------------------------------------------------------
  let toastTimer = null;
  function showToast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(() => t.classList.add('is-visible'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove('is-visible');
      setTimeout(() => { t.hidden = true; }, 320);
    }, 1700);
  }

  // ---------------------------------------------------------
  // 9. Music toggle (motion §3-6)
  // ---------------------------------------------------------
  function setupMusic() {
    const btn = $('#music-toggle');
    const audio = $('#bgm');
    if (!btn || !audio) return;
    if (!BGM_SRC) {
      btn.hidden = true;
      return;
    }
    btn.hidden = false;
    audio.volume = 0;

    function fadeVolume(target, dur) {
      const start = audio.volume;
      const t0 = performance.now();
      function tick(now) {
        const t = clamp((now - t0) / dur, 0, 1);
        audio.volume = start + (target - start) * t;
        if (t < 1) requestAnimationFrame(tick);
        else if (target === 0) audio.pause();
      }
      requestAnimationFrame(tick);
    }

    btn.addEventListener('click', async () => {
      btn.classList.remove('is-rippling');
      void btn.offsetWidth;
      btn.classList.add('is-rippling');
      haptic(10);
      try {
        if (audio.paused) {
          if (!audio.src) audio.src = BGM_SRC;
          await audio.play();
          btn.setAttribute('aria-pressed', 'true');
          fadeVolume(0.4, 1500);
        } else {
          fadeVolume(0, 600);
          btn.setAttribute('aria-pressed', 'false');
        }
      } catch (e) {
        btn.setAttribute('aria-pressed', 'false');
        showToast('음원을 재생할 수 없습니다.');
      }
    });
  }

  // ---------------------------------------------------------
  // Miniroom: shared guest minimi board
  // ---------------------------------------------------------
  function setupMiniroom() {
    const picker = $('.minimi-picker');
    const stage = $('#guest-minimi-stage');
    const addButton = $('#add-minimi');
    const count = $('#minimi-count');
    const note = $('#minimi-save-note');
    const speech = $('#miniroom-speech');
    if (!picker || !stage || !addButton || !count || !note) return;

    let selected = 1;
    let entries = [];
    addButton.disabled = true;
    const render = () => {
      stage.replaceChildren();
      entries.forEach((entry, index) => {
        const minimiId = Math.min(6, Math.max(1, Number(entry.minimi_id) || 1));
        const avatar = document.createElement('img');
        avatar.src = `images/minimi-${minimiId}.svg`;
        avatar.alt = `하객 미니미 ${index + 1}`;
        avatar.setAttribute('class', 'guest-minimi-avatar');
        avatar.setAttribute('role', 'listitem');
        avatar.draggable = false;
        avatar.style.left = `${8 + ((index * 13) % 84)}%`;
        avatar.style.animationDelay = `${(index % 5) * 80}ms`;
        stage.append(avatar);
      });
      count.textContent = `${entries.length}${entries.length >= 36 ? '+' : ''} / 36`;
      addButton.disabled = entries.length >= 36;
    };
    const request = async (method, body) => {
      if (!SUPABASE_KEY) throw new Error('미니미 기능을 이용할 수 없습니다.');
      const response = await fetch(`${SUPABASE_URL}/rest/v1/wedding_guest_minimis${method === 'GET' ? '?select=minimi_id,created_at&order=created_at.asc&limit=36' : ''}`, {
        method,
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        ...(body ? { body: JSON.stringify(body) } : {})
      });
      if (!response.ok) throw new Error('미니미를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return method === 'GET' ? response.json() : undefined;
    };
    const load = async () => {
      try {
        entries = await request('GET');
        render();
        note.textContent = '미니미가 정원에 모였어요.';
      } catch (error) {
        note.textContent = '미니미를 불러오지 못했어요.';
        addButton.disabled = false;
      }
    };

    picker.addEventListener('click', (event) => {
      const button = event.target.closest('[data-minimi-choice]');
      if (!button) return;
      selected = Number(button.dataset.minimiChoice);
      $$('[data-minimi-choice]', picker).forEach((choice) => {
        const active = choice === button;
        choice.classList.toggle('is-selected', active);
        choice.setAttribute('aria-pressed', String(active));
      });
      haptic(8);
    });
    addButton.addEventListener('click', async () => {
      addButton.disabled = true;
      try {
        await request('POST', { minimi_id: selected });
        await load();
        speech.textContent = '정원에서 만나요!';
        haptic(12);
      } catch (error) {
        showToast(error.message || '미니미를 저장하지 못했어요.');
      } finally {
        addButton.disabled = entries.length >= 36;
      }
    });
    load();
    window.setInterval(load, 30000);
  }

  // ---------------------------------------------------------
  // 10. Share (Kakao / link copy) (motion §3-7)
  // ---------------------------------------------------------
  function setupShare() {
    const btnLink  = $('#share-link');
    const btnKakao = $('#share-kakao');

    btnLink?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        haptic(15);
        showToast('청첩장 링크가 복사되었습니다');
      } catch (e) {
        showToast('복사에 실패했습니다');
      }
    });

    btnKakao?.addEventListener('click', () => {
      haptic(15);
      // Kakao SDK 사용 가능 시
      if (window.Kakao && KAKAO_JS_KEY) {
        try {
          if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY);
          window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: SHARE_TITLE,
              description: SHARE_DESC,
              imageUrl: SHARE_IMAGE,
              link: { mobileWebUrl: location.href, webUrl: location.href }
            },
            buttons: [
              { title: '청첩장 보기', link: { mobileWebUrl: location.href, webUrl: location.href } }
            ]
          });
          return;
        } catch (e) { /* fallthrough */ }
      }
      // Web Share API 폴백
      if (navigator.share) {
        navigator.share({ title: SHARE_TITLE, text: SHARE_DESC, url: location.href }).catch(() => {});
        return;
      }
      // 최종 폴백: 링크 복사
      navigator.clipboard?.writeText(location.href);
      showToast('청첩장 링크가 복사되었습니다');
    });
  }

  // ---------------------------------------------------------
  // Venue directions: accessible transport tabs + Kakao Map
  // ---------------------------------------------------------
  function setupVenueDirections() {
    const tabs = $$('[data-route-tab]');
    const panels = $$('[data-route-panel]');
    if (!tabs.length || !panels.length) return;

    function selectTab(tab, moveFocus = false) {
      const route = tab.dataset.routeTab;
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel) => { panel.hidden = panel.dataset.routePanel !== route; });
      if (moveFocus) tab.focus();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', (event) => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        selectTab(tabs[next], true);
      });
    });
  }

  function setupKakaoMap() {
    const mapElement = $('#map');
    const fallback = $('#map-fallback');
    if (!mapElement || !fallback || !KAKAO_JS_KEY) return;

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(KAKAO_JS_KEY)}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      if (!window.kakao?.maps) return;
      window.kakao.maps.load(() => {
        const maps = window.kakao.maps;
        const showMap = (lat, lng, placeName) => {
          const position = new maps.LatLng(lat, lng);
          const map = new maps.Map(mapElement, {
            center: position,
            level: 3,
            draggable: true,
            scrollwheel: false
          });
          const marker = new maps.Marker({ map, position });
          const info = new maps.InfoWindow({
            content: `<div class="kakao-map-label">${placeName}</div>`,
            removable: false
          });
          info.open(map, marker);
          fallback.hidden = true;
          mapElement.classList.add('is-ready');
        };

        const geocoder = new maps.services.Geocoder();
        geocoder.addressSearch('경상남도 창원시 성산구 원이대로 362', (result, status) => {
          if (status === maps.services.Status.OK && result[0]) {
            showMap(Number(result[0].y), Number(result[0].x), '창원컨벤션센터(CECO) 3층 단독홀');
          }
        });
      });
    };
    // SDK/key/domain 오류 시 정적 위치와 카카오맵 링크를 계속 보여줍니다.
    script.onerror = () => {};
    document.head.appendChild(script);
  }

  // ---------------------------------------------------------
  // 11. RSVP / Guestbook placeholder URL handling
  // ---------------------------------------------------------
  function setupExternalLinks() {
    const gb   = $('#guestbook-link');
    const mybox = $('#mybox-upload');
    if (mybox) {
      if (MYBOX_UPLOAD_URL) {
        mybox.href = MYBOX_UPLOAD_URL;
        mybox.target = '_blank';
        mybox.rel = 'noopener';
        mybox.hidden = false;
        mybox.removeAttribute('data-placeholder-url');
        mybox.textContent = '하객 사진 더하기';
      }
    }
    if (gb) {
      if (GUESTBOOK_URL) {
        gb.href = GUESTBOOK_URL;
        gb.hidden = false;
        gb.target = '_blank';
        gb.rel = 'noopener';
        gb.removeAttribute('data-placeholder-url');
      }
    }
  }

  // ---------------------------------------------------------
  // INIT
  // ---------------------------------------------------------
  function init() {
    setupHero();
    setupReveal();
    setupPetals();
    setupCalendar();
    setupGallery();
    setupLightbox();
    setupCopy();
    setupMusic();
    setupMiniroom();
    setupShare();
    setupVenueDirections();
    setupKakaoMap();
    setupExternalLinks();

    // reduced-motion 변경 시 단순 reload (모션 일관성 보장)
    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener('change', () => location.reload());
    } else if (reducedMotion.addListener) {
      reducedMotion.addListener(() => location.reload());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

