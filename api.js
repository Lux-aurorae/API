// =====================================================
// donghui TIMES (api.js)
// 이번 버전의 핵심 3가지:
//   ① null 방어: 내용없음 / No Image / no source
//   ② moment.js: "3시간 전" + 서울 시간(KST) 표기
//   ③ 첫 기사는 히어로(대형), 나머지는 그리드
// ⚠️ 필드명 주의: 누나 API는 description / urlToImage /
//    source.name / publishedAt 을 사용합니다!
//    (강의 예시의 summary/media/rights는 다른 API 기준)
// =====================================================

let newsList = [];
const PAGE_SIZE = 10;
const BASE_URL = "https://noona-times-be-5ca9402f90d9.herokuapp.com";

// 사진이 없을 때 대신 보여줄 이미지 (상수로 분리 → 나중에 교체도 한 줄)
const NO_IMAGE_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqEWgS0uxxEYJ0PsOb2OgwyWvC0Gjp8NUdPw&usqp=CAU";

// moment 한국어 모드: fromNow()가 "3시간 전"처럼 한국어로 나옴
moment.locale("ko");

// ---------- 상단 바에 오늘 날짜 표시 (신문 느낌은 영문 날짜!) ----------
document.getElementById("today-date").textContent =
  moment().locale("en").format("dddd, MMMM D, YYYY");

// =====================================================
// null 방어 도우미 함수들
// render 안에 삼항연산자를 길게 넣으면 읽기 어려우니
// '이름 있는 함수'로 분리 → render가 깨끗해짐!
// =====================================================

// ① 요약글: 없으면 "내용없음", 200자 넘으면 잘라서 "..." 붙이기
const getDescription = (news) => {
  if (news.description == null || news.description === "") {
    return "내용없음";
  }
  if (news.description.length > 200) {
    return news.description.substring(0, 200) + "...";  // 0~199자까지 자르기
  }
  return news.description;
};

// ② 사진: 없으면 No Image 대체 이미지
//    || 는 "왼쪽이 비어있으면(null/undefined/"") 오른쪽을 써라"
const getImage = (news) => {
  return news.urlToImage || NO_IMAGE_URL;
};

// ③ 출처: 없으면 "no source"
const getSource = (news) => {
  return news.source.name || "no source";
};

// ④ 시간: moment로 "n시간 전" 표기
const getTimeAgo = (news) => {
  return moment(news.publishedAt).fromNow();   // 예: "2년 전", "3시간 전"
};

// ⑤ 정확한 날짜: 서울 시간(KST) 기준으로 풀어서 (히어로 기사용)
const getFullDate = (news) => {
  return moment(news.publishedAt)
    .tz("Asia/Seoul")                          // 시간대를 한국으로 변환
    .format("YYYY년 M월 D일 dddd A h:mm");     // 예: 2024년 2월 17일 토요일 오전 11:34
};

// =====================================================
// 뉴스 가져오기
// =====================================================
const getLatestNews = async () => {
  const url = new URL(`${BASE_URL}/top-headlines?q=아이유&pageSize=${PAGE_SIZE}`);

  const response = await fetch(url);
  const data = await response.json();

  newsList = data.articles;
  render();
  console.log("뉴스 데이터:", newsList);
};

// =====================================================
// 화면 그리기: [0]번 기사는 히어로, 나머지는 그리드
// =====================================================
const render = () => {
  // 기사가 하나도 없을 때의 방어 (검색 결과 0건 대비)
  if (newsList.length === 0) {
    document.getElementById("news-board").innerHTML =
      `<p class="news-meta" style="text-align:center; padding:40px 0;">
        기사가 없습니다.
      </p>`;
    return;
  }

  // ---------- 히어로: 첫 번째 기사만 크게 ----------
  const first = newsList[0];
  const heroHTML = `
    <article class="hero row">
      <div class="col-lg-7">
        <div class="news-img-frame">
          <img class="news-img-size" src="${getImage(first)}" />
        </div>
      </div>
      <div class="col-lg-5">
        <span class="news-category">Top Story</span>
        <h2>${first.title}</h2>
        <p>${getDescription(first)}</p>
        <div class="news-meta">
          <b>${getSource(first)}</b> · ${getFullDate(first)}
        </div>
      </div>
    </article>
  `;

  // ---------- 나머지 기사들: slice(1)로 두 번째부터 ----------
  const restHTML = newsList.slice(1).map(news => `
    <article class="news row">
      <div class="col-lg-4">
        <div class="news-img-frame">
          <img class="news-img-size" src="${getImage(news)}" />
        </div>
      </div>
      <div class="col-lg-8">
        <h2>${news.title}</h2>
        <p>${getDescription(news)}</p>
        <div class="news-meta">
          <b>${getSource(news)}</b> · ${getTimeAgo(news)}
        </div>
      </div>
    </article>
  `).join('');

  document.getElementById("news-board").innerHTML = heroHTML + restHTML;
};

// =====================================================
// 사이드 메뉴 & 검색창
// =====================================================
const openNav = () => {
  document.getElementById("mySidenav").style.width = "260px";
};

const closeNav = () => {
  document.getElementById("mySidenav").style.width = "0";
};

const openSearchBox = () => {
  const inputArea = document.getElementById("input-area");
  if (inputArea.style.display === "inline") {
    inputArea.style.display = "none";
  } else {
    inputArea.style.display = "inline";
    document.getElementById("search-input").focus();  // 열리면 바로 입력 가능
  }
};

const searchNews = () => {
  console.log("검색어:", document.getElementById("search-input").value);
  // 다음 단계: 이 검색어로 q= 를 바꿔 다시 호출하게 됩니다!
};

// ---------- 시작 ----------
getLatestNews();