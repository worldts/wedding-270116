/* ============================================================
   청첩장 설정 파일
   이 파일만 수정하면 청첩장 내용이 바뀝니다.

   - 값은 반드시 따옴표 '' 안에 적습니다.
   - 항목 끝의 쉼표(,)를 지우지 마세요.
   - 줄바꿈이 필요하면 <br> 을 넣습니다.
     (단, <br> 이 동작하는 항목은 아래에 [HTML] 로 표시해 두었습니다)

   ※ index.html 맨 위의 <title> 과 og: 태그는 여기서 못 바꿉니다.
     카카오톡 공유 미리보기를 만드는 프로그램이 이 파일을 읽지 못하기 때문에,
     그 세 줄만 index.html 에서 직접 고쳐야 합니다.
   ============================================================ */

var CONFIG = {

  /* ── 신랑 · 신부 ──────────────────────────────────────── */
  groomName: '유태선',
  brideName: '온세상',

  /* ── 예식 일시 · 장소 ───────────────────────────────────
     날짜는 쓰이는 자리마다 모양이 달라서 세 가지로 적어 둡니다.
     날짜를 바꿀 때는 아래 세 줄을 함께 고쳐 주세요. */
  dateText:  '2027년 1월 16일 토요일 오후 1시 30분',   // 공유 미리보기 문구
  dateShort: '2027.01.16 (토) 오후 1시 30분',          // 공유하기 문구
  dateStamp: '2027/01/16 SAT PM 1:30',                 // 맨 위 예식장 이름 아래

  venueHall:    '라브르 에드니아',
  venueAddress: '서울 송파구 백제고분로 95 (잠실동 196-9)',

  // 지도 버튼(구글맵/네이버/카카오)을 눌렀을 때 검색할 말
  venueMapQuery: '라브르에드니아',
  // 페이지 안에 박히는 지도에서 검색할 말 (주소까지 넣어야 정확히 찍힘)
  venueMapEmbed: '서울 송파구 백제고분로 95 라브르 에드니아',

  /* ── 페이지 안에 박히는 실지도 (네이버 지도 방식) ────────
     아래 세 개를 모두 채우면 네이버 실지도(마커 포함)가 나옵니다.
     하나라도 비워 두면 위 venueMapEmbed 를 쓰는 구글 지도가 그대로 나옵니다.

     naverMapKey : 네이버 클라우드 플랫폼(NCP)에서 발급한
                   '웹 지도 API v3' Client ID 값
     venueLat    : 예식장 위도
     venueLng    : 예식장 경도
     venueZoom   : 지도 확대 배율 (기본 16) */
  naverMapKey: 'oj2feszvn2',  // NCP '웹 지도 API v3' Client ID
  venueLat:    37.50835054,     // 라브르에드니아 위도
  venueLng:    127.07957306,     // 라브르에드니아 경도
  venueZoom:   15,

  /* ── 이미지 · 배경음악 ────────────────────────────────── */
  coverImage:  'assets/cover.png',
  inviteImage: 'assets/invite.png',
  calendarImage: 'assets/calendar.png',   // 갤러리 아래 달력
  letterImage:   'assets/letter.png?v=2', // 카카오톡 공유 버튼 위 편지
  // details 안내 이미지 (좌우로 넘기는 캐러셀, 적은 순서대로 · 점 개수도 자동)
  detailImages: [
    'assets/detail1.png',
    'assets/detail2.png'
  ],
  bgm:         'assets/bgm.mp3?v=2',

  /* ── 카카오톡 공유 ──────────────────────────
     kakaoJsKey 를 채우면 '카카오톡으로 청첩장 전하기' 버튼이
     진짜 카카오톡 공유창을 엽니다.
     비워 두면 휴대폰 기본 공유창으로 대신합니다.

     받는 방법 : developers.kakao.com → 내 애플리케이션 추가
                 → 앱 키 의 'JavaScript 키' 를 복사
                 → [플랫폼 > Web] 에 배포 주소 등록 (네이버 지도와 같은 절차)

     shareImage : 공유 카드에 들어갈 사진.
                  'assets/...' 처럼 적으면 배포 주소 기준 전체 주소로 자동 변환됩니다.
                  비워 두면 위의 coverImage 를 자동으로 씁니다.
                  ※ 주소를 붙여넣어 공유할 때의 사진은 index.html 의 og:image 에서 따로 정합니다. */
  kakaoJsKey: '31b1e92da8b68b3655b8111c0acfa0c8',
  shareImage: 'assets/kakao_main.jpg',

  /* ── 갤러리 ───────────────────────────────────────────
     적은 순서대로 화면에 깔립니다. 사진을 빼려면 그 줄을 지우고,
     더하려면 gallery 폴더에 넣은 뒤 같은 형식으로 한 줄 추가하세요. */
  // ?v=2 : 예전 g1~g12 사진을 캐시한 브라우저도 새 사진을 받도록
  gallery: [
    'gallery/g1.jpg?v=2',
    'gallery/g2.jpg?v=2',
    'gallery/g3.jpg?v=2',
    'gallery/g4.jpg?v=2',
    'gallery/g5.jpg?v=2',
    'gallery/g6.jpg?v=2',
    'gallery/g7.jpg?v=2',
    'gallery/g8.jpg?v=2',
    'gallery/g9.jpg?v=2',
    'gallery/g10.jpg?v=2',
    'gallery/g11.jpg?v=2',
    'gallery/g12.jpg?v=2',
    'gallery/g13.jpg?v=2',
    'gallery/g14.jpg?v=2',
    'gallery/g15.jpg?v=2',
    'gallery/g16.jpg?v=2',
    'gallery/g17.jpg?v=2'
  ],

  /* ── 초대 문구 (invite 그림 위에 얹히는 세 줄) ───────────
     '신랑 ○○○  신부 ○○○' 줄은 위에 적은 이름에서 자동으로 만들어집니다.
     얼굴 모양은 마음대로 바꿔도 되고, ♥ 는 자동으로 분홍색이 됩니다. */
  inviteTitle: '결혼식에 초대합니다',
  inviteFaces: '(˶˘ з ˘˶)  ♥  (˶˘ ε ˘˶)',

  /* ── 안내 문구 (01, 02, 03 번호가 자동으로 붙습니다) ──── [HTML]
     항목을 늘리거나 줄이면 번호도 알아서 따라갑니다. */
  notes: [
    '부담 갖지 마시고 편하게 오셔서<br>축하해 주시면 그것만으로 감사합니다.',
    '예쁜 순간을 함께 남길 수 있도록<br>사진 촬영도 많이 부탁드려요.',
    '오시지 못해도<br>마음만으로 감사해요'
  ],

  /* ── 지도 카드 안 안내 멘트 (⊹ information ⊹) ──────── [HTML]
     흰 카드의 information 파트. 참조 템플릿 문구를 그대로 넣어 뒀습니다. */
  venueInfo: '신부 대기실은 7층에 마련되어 있습니다.<br>예식장 건물 발렛 주차 2시간 30분 무료입니다.',

  /* ── 마음 전하실 곳 (계좌) ────────────────────────────
     COPY 버튼이 복사하는 글자는 은행 + 계좌번호 + 예금주 로 자동 조립됩니다.
     따로 적을 필요 없고, 번호를 여기서 고치면 화면과 복사값이 같이 바뀝니다.
     relation 은 예금주 뒤 괄호에 붙는 설명이며, 비워두면 괄호가 안 나옵니다. */
  accountIntro: '참석이 어려우신 분들을 위해 조심스럽게 안내드립니다.<br>전해주시는 따뜻한 마음, 감사히 간직하겠습니다.',   // [HTML]

  groomAccountLabel: '신랑측',
  groomAccounts: [
    { bank: '신한은행', number: '110-406-404951', holder: '유태선', relation: '' }
  ],

  brideAccountLabel: '신부측',
  brideAccounts: [
    { bank: '우리은행', number: '1002-255-063681',  holder: '온세상', relation: '' }
  ],

  /* ── 안내 메시지 (화면 아래 잠깐 떴다 사라지는 말) ────── */
  toastAccountCopied: '계좌번호가 복사되었습니다',
  toastLinkCopied:    '청첩장 링크가 복사되었습니다',
  toastMusicFailed:   '재생할 수 없습니다',
  toastMusicMissing:  '배경음악 파일을 추가해 주세요'

};
