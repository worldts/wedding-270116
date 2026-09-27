/* 이 파일은 config.js 의 값을 화면에 그려 넣는 코드입니다.
   내용을 바꾸려면 config.js 만 수정하면 됩니다. */

/* config.js 를 고치다 쉼표나 따옴표를 빠뜨리면 아래에서 걸립니다. */
if (typeof CONFIG === 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    document.body.innerHTML =
      '<div style="padding:40px;font-family:sans-serif;line-height:1.8;color:#c00">' +
      '<b>config.js 를 읽지 못했습니다.</b><br>' +
      '따옴표나 쉼표가 빠지지 않았는지 확인해 주세요.<br>' +
      '브라우저에서 F12 를 누르면 몇 번째 줄이 잘못됐는지 볼 수 있습니다.</div>';
  });
  throw new Error('config.js not loaded');
}

/* ---- 설정값 준비 (config.js 값 + 조합해서 만드는 값) ---- */
var V = {};
for (var k in CONFIG) V[k] = CONFIG[k];
V.coupleNames = CONFIG.groomName + ' · ' + CONFIG.brideName;
V.groomLine = '신랑 ' + CONFIG.groomName;
V.brideLine = '신부 ' + CONFIG.brideName;

// 날짜 스탬프의 요일(SUN 등)만 동그라미 안에 넣습니다.
V.dateStampHtml = CONFIG.dateStamp.replace(
  /\b(MON|TUE|WED|THU|FRI|SAT|SUN)\b/,
  '<span class="dow">$1</span>'
);

/* ---- data-cfg 속성이 붙은 자리에 값 채우기 ---- */
function applyConfig() {
  var map = [
    ['data-cfg', function (el, v) { el.textContent = v; }],
    ['data-cfg-html', function (el, v) { el.innerHTML = v; }],
    ['data-cfg-src', function (el, v) { el.setAttribute('src', v); }],
    ['data-cfg-alt', function (el, v) { el.setAttribute('alt', v); }]
  ];
  map.forEach(function (pair) {
    var attr = pair[0], set = pair[1];
    Array.prototype.forEach.call(document.querySelectorAll('[' + attr + ']'), function (el) {
      var key = el.getAttribute(attr);
      if (V[key] === undefined) { console.warn('config.js 에 없는 항목: ' + key); return; }
      set(el, V[key]);
    });
  });
}
applyConfig();

/* ---- 안내 문구 (01, 02, 03 …) ---- */
(function () {
  var el = document.getElementById('noteList');
  if (!el) return;
  el.innerHTML = CONFIG.notes.map(function (text, i) {
    var num = ('0' + (i + 1)).slice(-2);
    return '<div class="note-item"><div class="num-badge">' + num + '</div>' +
           '<p class="note-text">' + text + '</p></div>';
  }).join('');
})();

/* ---- 초대 문구의 얼굴 두 개 ----
   config 의 inviteFaces 를 ♥ 기준으로 갈라 좌우에 넣고,
   각 얼굴을 바로 아래 신랑·신부 이름의 한가운데로 옮깁니다.
   이름 길이가 바뀌어도 알아서 다시 맞춰집니다. */
function alignInviteFaces() {
  var wrap = document.querySelector('.invite-faces');
  var names = document.querySelectorAll('.invite-names span');
  if (!wrap || names.length < 2) return;
  var faces = wrap.querySelectorAll('.face');
  var base = wrap.getBoundingClientRect().left;
  for (var i = 0; i < 2; i++) {
    var r = names[i].getBoundingClientRect();
    faces[i].style.left = (r.left + r.width / 2 - base) + 'px';
  }
}
(function () {
  var wrap = document.querySelector('.invite-faces');
  if (!wrap) return;
  var parts = CONFIG.inviteFaces.split('♥');
  var faces = wrap.querySelectorAll('.face');
  faces[0].textContent = (parts[0] || '').trim();
  faces[1].textContent = (parts[1] || '').trim();
  alignInviteFaces();
  window.addEventListener('resize', alignInviteFaces);
  // 웹폰트가 늦게 도착하면 이름 폭이 달라지므로 그때 다시 맞춥니다.
  window.addEventListener('load', alignInviteFaces);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignInviteFaces);
})();

/* ---- 계좌 목록 ----
   COPY 버튼이 복사하는 글자는 은행 + 계좌번호 + 예금주 로 여기서 조립됩니다. */
function renderAccounts(containerId, list) {
  var el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  list.forEach(function (a) {
    var copyText = a.bank + ' ' + a.number + ' ' + a.holder;
    var holderLine = '예금주 ' + a.holder + (a.relation ? ' (' + a.relation + ')' : '');

    var item = document.createElement('div');
    item.className = 'acc-item';

    var info = document.createElement('div');
    info.innerHTML = '<div class="bank"></div><div class="no"></div><div class="ho"></div>';
    info.querySelector('.bank').textContent = a.bank;
    info.querySelector('.no').textContent = a.number;
    info.querySelector('.ho').textContent = holderLine;

    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = '복사';
    btn.addEventListener('click', function () { copyAccount(copyText, btn); });

    item.appendChild(info);
    item.appendChild(btn);
    el.appendChild(item);
  });
}
renderAccounts('acc1Body', CONFIG.groomAccounts);
renderAccounts('acc2Body', CONFIG.brideAccounts);

/* ---- 갤러리 ---- */
var galleryItems = CONFIG.gallery.map(function (u) { return { src: u }; });
// 사진 스택 하나를 만듦 (stackEl 안에 카드를 쌓고, countEl 에 '1 / 12' 표시)
function makeStack(stackEl, countEl) {
  var stackCards = [], stackCur = 0, stackBusy = false;

  // 사진마다 무작위로 놓인 자리 (기울기 ±2~9°, 위치 ±10px) — 페이지를 열 때마다 새로 정해짐
  var stackSpots = [];
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function stackAngle(i) { return stackSpots[i].r; }
  function stackPose(card, x, y, rot, s) {
    var sp = stackSpots[stackCards.indexOf(card)] || { x: 0, y: 0 };
    card.style.transform = 'translate(-50%,-50%) translate(' + (x + sp.x) + 'px,' + (y + sp.y) + 'px) rotate(' + rot + 'deg) scale(' + (s || 1) + ')';
  }
  // 지금 보이는 사진(stackCur)이 맨 위, 그다음 사진들이 차례로 아래에 깔리도록
  function stackLayout() {
    var n = stackCards.length;
    stackCards.forEach(function (c, i) { c.style.zIndex = n - (i - stackCur + n) % n; });
    countEl.textContent = n ? (stackCur + 1) + ' / ' + n : '';
  }
  function renderStack() {
    galleryItems.forEach(function (it, i) {
      stackSpots[i] = { r: (Math.random() < .5 ? -1 : 1) * rnd(2, 9), x: rnd(-10, 10), y: rnd(-10, 10) };
      var c = document.createElement('div');
      c.className = 'stack-card';
      var img = document.createElement('img');
      img.src = it.src; img.alt = ''; img.draggable = false;
      c.appendChild(img);
      stackEl.appendChild(c);
      stackCards.push(c);
      // 처음부터 쌓인 자리에 놓임 (첫 사진이 맨 위)
      stackPose(c, 0, 0, stackAngle(i));
    });
    stackLayout();
    stackEl.classList.add('ready');
  }

  /* 드래그: 왼쪽으로 끌면 맨 위 사진이 날아가고 다음 사진,
             오른쪽으로 끌면 이전 사진이 왼쪽에서 다시 들어와 맨 위로.
     살짝 누르기만 하면 크게 보기(lightbox) */
  var sx = 0, dx = 0, W = 0, mode = null;   // mode: 'pending' | 'next' | 'prev'
  function n() { return stackCards.length; }
  function prevIdx() { return (stackCur - 1 + n()) % n(); }
  function settle(card, ms, fn) { card.style.transition = 'transform ' + ms + 'ms ease'; stackBusy = true; setTimeout(function () { stackBusy = false; if (fn) fn(); }, ms); }

  stackEl.addEventListener('pointerdown', function (e) {
    if (stackBusy || !n()) return;
    sx = e.clientX; dx = 0; W = stackEl.clientWidth; mode = 'pending';
    stackEl.setPointerCapture(e.pointerId);
  });
  stackEl.addEventListener('pointermove', function (e) {
    if (!mode) return;
    dx = e.clientX - sx;
    if (mode === 'pending') {
      if (Math.abs(dx) < 6 || n() < 2) return;
      mode = dx < 0 ? 'next' : 'prev';
      var c = mode === 'next' ? stackCards[stackCur] : stackCards[prevIdx()];
      c.style.transition = 'none';
      if (mode === 'prev') c.style.zIndex = n() + 1;
    }
    if (mode === 'next') {
      var x = Math.min(dx, 0);
      stackPose(stackCards[stackCur], x, 0, stackAngle(stackCur) + x / 12);
    } else {
      var j = prevIdx(), px = Math.min(Math.max(dx, 0) - W * 1.3, 0);
      stackPose(stackCards[j], px, 0, stackAngle(j) + px / 12);
    }
  });
  function end(e) {
    if (!mode) return;
    var m = mode, TH = W * 0.22; mode = null;
    if (m === 'pending') { if (e.type === 'pointerup') openLB(stackCur); return; }
    if (m === 'next') {
      var i = stackCur, c = stackCards[i];
      if (dx < -TH) {
        stackPose(c, -W * 1.3, 0, stackAngle(i) - 18);
        stackCur = (stackCur + 1) % n();
        countEl.textContent = (stackCur + 1) + ' / ' + n();
        // 날아간 사진은 화면 밖에서 조용히 맨 아래로 돌아감
        settle(c, 320, function () { c.style.transition = 'none'; stackPose(c, 0, 0, stackAngle(i)); stackLayout(); });
      } else { settle(c, 250); stackPose(c, 0, 0, stackAngle(i)); }
    } else {
      var j = prevIdx(), p = stackCards[j];
      if (dx > TH) { settle(p, 320); stackPose(p, 0, 0, stackAngle(j)); stackCur = j; stackLayout(); }
      else {
        settle(p, 250, function () { p.style.transition = 'none'; stackPose(p, 0, 0, stackAngle(j)); stackLayout(); });
        stackPose(p, -W * 1.3, 0, stackAngle(j) - 18);
      }
    }
  }
  stackEl.addEventListener('pointerup', end);
  stackEl.addEventListener('pointercancel', end);

  renderStack();
}
var lbIndex = 0, lbEl = document.getElementById('lightbox'), lbImg = document.getElementById('lb-img'), lbCount = document.getElementById('lb-count');
function renderLB() {
  var it = galleryItems[lbIndex] || {};
  lbImg.src = it.src || '';
  lbCount.textContent = (lbIndex + 1) + ' / ' + galleryItems.length;
}
function openLB(i) { if (!galleryItems.length) return; lbIndex = i; renderLB(); lbEl.classList.add('show'); }
function closeLB() { lbEl.classList.remove('show'); }
function moveLB(n) { lbIndex = (lbIndex + n + galleryItems.length) % galleryItems.length; renderLB(); }
lbEl.addEventListener('click', function (e) { if (e.target === lbEl) closeLB(); });
makeStack(document.getElementById('stack'), document.getElementById('stackCount'));

/* ---- details 안내 캐러셀 ----
   스와이프 한 번 / 좌우 버튼 한 번 = 정확히 한 장 이동.
   끝과 처음이 이어짐 (첫 장에서 ‹ 는 마지막 장, 마지막 장에서 › 는 첫 장).
   자연스럽게 이어지도록 양 끝에 복제 슬라이드를 두고, 복제본에 도착하면 진짜 장으로 몰래 점프 */
(function () {
  var view = document.getElementById('dcarView');
  if (!view) return;
  var track = document.getElementById('dcarTrack'), dotsEl = document.getElementById('dcarDots');
  var prevBtn = document.getElementById('dcarPrev'), nextBtn = document.getElementById('dcarNext');
  var list = CONFIG.detailImages || [], n = list.length;
  var pos = n > 1 ? 1 : 0;   // 트랙 위 위치 (복제 포함). 진짜 첫 장 = 1
  var busy = false;

  function slide(src, i) {
    var el = document.createElement('div');
    el.className = 'dcar-slide';
    var img = document.createElement('img');
    img.src = src; img.alt = '안내사항 ' + (i + 1); img.draggable = false;
    el.appendChild(img);
    return el;
  }
  if (n > 1) track.appendChild(slide(list[n - 1], n - 1));   // 맨 앞: 마지막 장 복제
  list.forEach(function (src, i) {
    track.appendChild(slide(src, i));
    var dot = document.createElement('button');
    dot.className = 'dcar-dot';
    dot.setAttribute('aria-label', (i + 1) + '번째 안내 보기');
    dot.addEventListener('click', function () { if (!busy) move(i + 1); });
    dotsEl.appendChild(dot);
  });
  if (n > 1) track.appendChild(slide(list[0], 0));           // 맨 뒤: 첫 장 복제
  else { prevBtn.style.display = nextBtn.style.display = dotsEl.style.display = 'none'; }

  function place(animate, extraPx) {
    track.style.transition = animate ? 'transform .4s ease' : 'none';
    track.style.transform = 'translateX(calc(' + (-pos * 100) + '% + ' + (extraPx || 0) + 'px))';
  }
  function realIdx() { return n > 1 ? (pos - 1 + n) % n : 0; }
  function paintDots() {
    var r = realIdx();
    [].forEach.call(dotsEl.children, function (d, k) { d.classList.toggle('on', k === r); });
  }
  // 움직이는 동안(0.4초)은 다음 입력을 막고, 끝나면 복제본 위치 정리
  var doneT;
  function animate() {
    busy = true; place(true);
    clearTimeout(doneT); doneT = setTimeout(done, 450);   // transitionend 가 안 올 때 대비
  }
  function done() {
    clearTimeout(doneT);
    busy = false;
    if (pos === 0) { pos = n; place(false); }            // 앞쪽 복제 → 진짜 마지막 장
    else if (pos === n + 1) { pos = 1; place(false); }   // 뒤쪽 복제 → 진짜 첫 장
  }
  function move(to) {
    pos = to; animate(); paintDots();
  }
  track.addEventListener('transitionend', done);
  prevBtn.addEventListener('click', function () { if (!busy) move(pos - 1); });
  nextBtn.addEventListener('click', function () { if (!busy) move(pos + 1); });

  var sx = 0, dx = 0, W = 0, dragging = false;
  view.addEventListener('pointerdown', function (e) {
    if (n < 2 || busy) return;
    dragging = true; sx = e.clientX; dx = 0; W = view.clientWidth;
    view.setPointerCapture(e.pointerId);
  });
  view.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    dx = Math.max(-W, Math.min(W, e.clientX - sx));
    place(false, dx);
  });
  function end() {
    if (!dragging) return;
    dragging = false;
    // 거리와 상관없이 한 번에 한 장만
    if (Math.abs(dx) > W * 0.15) move(pos + (dx < 0 ? 1 : -1));
    else if (dx !== 0) animate();
  }
  view.addEventListener('pointerup', end);
  view.addEventListener('pointercancel', end);

  place(false); paintDots();
})();

/* ---- 계좌 펼치기 ---- */
function toggleAcc(id) { document.getElementById(id).classList.toggle('open'); }

/* ---- 화면 아래 안내 메시지 ---- */
var toast = document.getElementById('toast'), tT;
function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(tT); tT = setTimeout(function () { toast.classList.remove('show'); }, 1700); }
window.showToast = showToast;

/* ---- 복사 ---- */
function fallbackCopy(t) { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); }
function copyAccount(txt, btn) {
  (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () {
    showToast(CONFIG.toastAccountCopied);
    if (btn) { var o = btn.textContent; btn.textContent = '완료'; setTimeout(function () { btn.textContent = o; }, 1200); }
  }).catch(function () { fallbackCopy(txt); showToast(CONFIG.toastAccountCopied); });
}
function copyLink() {
  var url = shareUrl();
  (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { showToast(CONFIG.toastLinkCopied); })
  .catch(function () { fallbackCopy(url); showToast(CONFIG.toastLinkCopied); });
}

/* ---- 공유하기 (toourguest 방식) ----
   config.js 의 kakaoJsKey 를 채우면 카카오톡 공유창이 뜹니다.
   비워 두면 휴대폰 기본 공유창(그것도 없으면 링크 복사)으로 대신합니다. */

/* 공유할 주소 — #뒤에 붙는 찌꺼기를 떼어 냅니다 */
function shareUrl() { return location.href.split('#')[0]; }

/* 카카오 카드에 들어갈 사진 주소 (반드시 http/https 로 시작하는 전체 주소) */
function shareImageUrl() {
  if (CONFIG.shareImage) return CONFIG.shareImage;
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    return location.origin + location.pathname.replace(/[^/]*$/, '') + CONFIG.coverImage;
  }
  return '';
}

/* 카카오 SDK 초기화 — SDK 자체는 index.html <head> 에서 미리 받아 둡니다 */
(function () {
  if (!CONFIG.kakaoJsKey) return;
  try {
    if (window.Kakao && !Kakao.isInitialized()) Kakao.init(CONFIG.kakaoJsKey);
  } catch (e) {}
})();

function shareKakao(btn) {
  var url = shareUrl();
  var title = CONFIG.groomName + ' ♥ ' + CONFIG.brideName + ' 결혼합니다';
  var desc = CONFIG.dateShort + '\n' + CONFIG.venueHall;

  var K = null;
  try {
    if (window.Kakao && Kakao.isInitialized()) K = Kakao.Share || Kakao.Link;
  } catch (e) {}

  if (K) {
    if (btn) btn.disabled = true;
    try {
      K.sendDefault({
        objectType: 'feed',
        content: {
          title: title,
          description: desc,
          imageUrl: shareImageUrl(),
          link: { mobileWebUrl: url, webUrl: url }
        },
        buttons: [
          { title: '모바일 청첩장 확인하기', link: { mobileWebUrl: url, webUrl: url } }
        ]
      });
    } catch (e) {
      showToast('인앱 브라우저가 아닌 일반 브라우저(크롬/사파리 등)에서 시도해주세요.');
    }
    if (btn) btn.disabled = false;
    return;
  }

  // 카카오 키가 없거나 SDK 가 안 뜬 경우 — 휴대폰 기본 공유창
  if (navigator.share) {
    navigator.share({ title: title, text: desc, url: url }).catch(function () {});
  } else {
    copyLink();
  }
}

/* ---- 배경음악 ---- */
var playing = false, musicPausedByUser = false;
function toggleMusic() {
  var a = document.getElementById('bgm'), b = document.getElementById('musicBtn');
  if (!a.getAttribute('src')) { showToast(CONFIG.toastMusicMissing); return; }
  if (playing) { a.pause(); b.textContent = '♪'; playing = false; musicPausedByUser = true; }
  else { a.play().then(function () { b.textContent = '♫'; playing = true; musicPausedByUser = false; }).catch(function () { showToast(CONFIG.toastMusicFailed); }); }
}

/* 배경음악 자동재생 (<audio loop> 라서 끝나면 처음부터 무한 반복)
   대부분의 모바일 브라우저는 화면을 한 번 건드리기 전 소리 재생을 막으므로,
   막히면 첫 터치·클릭·키 입력 때 재생. 음악 버튼으로 끈 뒤에는 다시 켜지 않음. */
document.addEventListener('DOMContentLoaded', function () {
  var a = document.getElementById('bgm'), b = document.getElementById('musicBtn');
  if (!a || !a.getAttribute('src')) return;
  var evs = ['pointerdown', 'touchend', 'click', 'keydown'];
  function stopWaiting() { evs.forEach(function (t) { document.removeEventListener(t, onGesture, true); }); }
  function tryPlay() {
    if (playing || musicPausedByUser) { stopWaiting(); return; }
    a.play().then(function () { b.textContent = '♫'; playing = true; stopWaiting(); }).catch(function () {});
  }
  function onGesture(e) {
    // 첫 터치가 음악 버튼이면 버튼(toggleMusic)이 알아서 켜도록 맡김
    if (e.target && e.target.closest && e.target.closest('#musicBtn')) { stopWaiting(); return; }
    tryPlay();
  }
  evs.forEach(function (t) { document.addEventListener(t, onGesture, true); });
  tryPlay();
});

/* ---- 페이지 안에 박히는 지도 ---- */
/*
   config.js 에 naverMapKey / venueLat / venueLng 를 모두 적으면
   네이버 실지도(마커 포함)가 뜨고, 하나라도 비어 있으면
   기존 구글 지도(iframe)가 그대로 뜹니다.
   (네이버 지도는 http/https 로 서버를 띄운 주소에서만 동작합니다.
    접속 주소를 NCP '도메인 관리'에 등록해 두어야 인증이 됩니다.
    localhost:3000, 192.168.x.x:3000 등 — file:// 로 열면 구글 지도로 대체)
*/
(function () {
  var el = document.getElementById('venueMap');
  if (!el) return;
  // 네이버 지도는 http/https 서버에서만 동작하므로,
  // 그 외 환경(file:// 등)에서는 구글 지도로 대체합니다.
  // (NCP 도메인 관리에 등록된 주소여야 인증이 됩니다)
  var onHttpLike = location.protocol === 'http:' || location.protocol === 'https:';
  var useNaver = onHttpLike && !!(CONFIG.naverMapKey && CONFIG.venueLat && CONFIG.venueLng);
  if (!useNaver) { embedGoogleMap(el); return; }

  var s = document.createElement('script');
  s.src = 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=' + CONFIG.naverMapKey;
  s.async = true;
  s.onload = function () {
    // 키가 잘못됐거나 차단된 경우 네이버 지도 객체가 없을 수 있습니다.
    if (window.naver && naver.maps) embedNaverMap(el);
    else embedGoogleMap(el);
  };
  s.onerror = function () { embedGoogleMap(el); };
  document.head.appendChild(s);
})();

/* 구글 지도(키 없이 동작하는 iframe 임베드) */
function embedGoogleMap(el) {
  el.innerHTML = '<iframe title="' + CONFIG.venueHall + ' 지도" width="100%" height="100%" style="border:0;" loading="lazy" '
    + 'src="https://www.google.com/maps?q=' + encodeURIComponent(CONFIG.venueMapEmbed) + '&z=17&output=embed"></iframe>';
}

/* 네이버 지도 (toourguest 가 쓰는 것과 같은 방식: 좌표 + 마커) */
function embedNaverMap(el) {
  var lat = Number(CONFIG.venueLat), lng = Number(CONFIG.venueLng);
  if (!isFinite(lat) || !isFinite(lng)) { embedGoogleMap(el); return; }
  el.innerHTML = '';
  var map = new naver.maps.Map(el, {
    center: new naver.maps.LatLng(lat, lng),
    zoom: Number(CONFIG.venueZoom) || 16,
    // 지도 오른쪽 아래 '©NAVER Corp. 더보기' 표시를 숨깁니다.
    mapDataControl: false
  });
  var pos = new naver.maps.LatLng(lat, lng);
  new naver.maps.Marker({ position: pos, map: map });
  // 핀 위에 예식장 이름표 말풍선 (크기와 상관없이 가운데 정렬되도록 CSS 로 위치 잡음)
  var label = document.createElement('div');
  label.className = 'map-label';
  label.textContent = CONFIG.venueHall;
  var wrap = document.createElement('div');
  wrap.className = 'map-label-anchor';
  wrap.appendChild(label);
  new naver.maps.Marker({
    position: pos, map: map, clickable: false, zIndex: 200,
    icon: { content: wrap, anchor: new naver.maps.Point(0, 0) }
  });
}

/* ---- 지도 카드 밑 네이버·카카오·티맵 링크 (참조 템플릿 방식) ---- */
(function () {
  var el = document.getElementById('mapLinks');
  if (!el) return;
  var q = encodeURIComponent(CONFIG.venueMapQuery || CONFIG.venueMapEmbed);
  el.innerHTML =
    '<a href="https://map.naver.com/p/search/' + q + '" onclick="return ytsOpenNaver(this.href,\'' + q + '\')" rel="noopener">네이버지도↗</a>' +
    '<a href="https://map.kakao.com/?q=' + q + '" onclick="return ytsOpenKakao(this.href,\'' + q + '\')" rel="noopener">카카오맵↗</a>' +
    '<a href="tmap://search?name=' + q + '" onclick="return ytsOpenTmap(this.href)" rel="noopener">티맵↗</a>';
})();

/* 네이버지도: 모바일은 앱 딥링크(nmap://), 그 외는 웹으로 열기
   appname 은 네이버 지도 URL Scheme 필수 값 (호출한 쪽 식별용) */
function ytsOpenNaver(webHref, encQ) {
  var ua = navigator.userAgent,
    mobile = /Android|iPhone|iPad|iPod/i.test(ua);
  if (!mobile) {
    window.open(webHref, '_blank', 'noopener');
    return false;
  }
  location.href = 'nmap://search?query=' + encQ + '&appname=' + encodeURIComponent(location.hostname || 'wedding.invitation');
  var store = /Android/i.test(ua)
    ? 'https://play.google.com/store/apps/details?id=com.nhn.android.nmap'
    : 'https://apps.apple.com/kr/app/id311867728';
  var t = Date.now();
  setTimeout(function () {
    if (Date.now() - t < 2200 && !document.hidden) {
      if (confirm('네이버지도 앱이 열리지 않았어요. 설치 페이지로 이동할까요?'))
        location.href = store;
    }
  }, 1800);
  return false;
}

/* 카카오맵: 모바일은 앱 딥링크, 그 외는 웹으로 열기 */
function ytsOpenKakao(webHref, encQ) {
  var ua = navigator.userAgent,
    mobile = /Android|iPhone|iPad|iPod/i.test(ua);
  if (!mobile) {
    window.open(webHref, '_blank', 'noopener');
    return false;
  }
  location.href = 'kakaomap://search?q=' + encQ;
  var store = /Android/i.test(ua)
    ? 'https://play.google.com/store/apps/details?id=net.daum.android.map'
    : 'https://apps.apple.com/kr/app/id304608425';
  var t = Date.now();
  setTimeout(function () {
    if (Date.now() - t < 2200 && !document.hidden) {
      if (confirm('카카오맵 앱이 열리지 않았어요. 설치 페이지로 이동할까요?'))
        location.href = store;
    }
  }, 1800);
  return false;
}

/* 티맵: 모바일만 앱 딥링크, 데스크톱은 안내 */
function ytsOpenTmap(href) {
  var mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!mobile) {
    alert('티맵은 모바일에서 티맵 앱으로 연결됩니다.');
    return false;
  }
  location.href = href;
  var t = Date.now();
  setTimeout(function () {
    if (Date.now() - t < 2200 && !document.hidden) {
      if (confirm('티맵 앱이 열리지 않았어요. 설치 페이지로 이동할까요?'))
        location.href = 'https://www.tmap.co.kr';
    }
  }, 1800);
  return false;
}
