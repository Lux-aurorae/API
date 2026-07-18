// =====================================================
// NOONA TIMES (api.js) - 누나 API 최종 배포판
// API 문서의 3기능 완전 구현:
//   ① q= 키워드 검색  ② page/pageSize 페이지네이션  ③ category
// 설계: '현재 상태'(page, filter)를 변수로 기억하고
//       모든 호출은 getNews() 하나를 통해서만! (중복 제거 유지)
// =====================================================

// ---------- 상태 변수 ----------
let newsList = [];
let page = 1;              // 현재 페이지
let totalResults = 0;      // 전체 기사 수 (API가 알려줌)
let currentFilter = "";    // 지금 적용된 조건: "" | "&category=..." | "&q=..."

// ---------- 설정 상수 ----------
const PAGE_SIZE = 10;      // 문서 기본값
const GROUP_SIZE = 5;      // 페이지 버튼을 5개씩 묶어서 표시
const BASE_URL = "https://noona-times-be-5ca9402f90d9.herokuapp.com";

const NO_IMAGE_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqEWgS0uxxEYJ0PsOb2OgwyWvC0Gjp8NUdPw&usqp=CAU";

// =====================================================
// 공통 호출부: 상태(page + currentFilter)로 URL을 조립
// =====================================================
const getNews = async () => {
  try {
    // ---------- try: 평소의 정상 흐름을 '시도' ----------
    const url = new URL(
      `${BASE_URL}/top-headlines?page=${page}&pageSize=${PAGE_SIZE}${currentFilter}`
    );

    const response = await fetch(url);
    const data = await response.json();

    if (response.status === 200) {
      // ★ 과제 1: 응답은 성공(200)인데 데이터가 0개인 경우
      if (data.articles.length === 0) {
        throw new Error("No matches for your search");
        // throw = "지금 사고 발생! catch 그물로 던져!" 라고 직접 선언
      }
      newsList = data.articles;
      totalResults = data.totalResults;
      render();
      paginationRender();
      statusRender();
    } else {
      // ★ 과제 2: 상태코드가 200이 아닌 경우 (400, 401, 500 ...)
      //   서버가 보내준 에러 메시지(data.message)를 그대로 던짐
      throw new Error(data.message);
    }

  } catch (error) {
    // ---------- catch: 어떤 사고든 전부 여기로 모임 ----------
    // (인터넷 끊김, 0건, 서버 거절 → 처리 창구는 하나!)
    errorRender(error.message);
  }
};

// 에러를 '사용자 화면에' 보여주는 함수 (부트스트랩 alert 빨간 박스)
const errorRender = (errorMessage) => {
  document.getElementById("news-board").innerHTML = `
    <div class="alert alert-danger" role="alert">
      ${errorMessage}
    </div>
  `;
  document.getElementById("pagination").innerHTML = "";     // 페이지 버튼 정리
  document.getElementById("status-line").textContent = "";  // 상태줄도 정리
};

// ---------- ① 최신 뉴스 ----------
const getLatestNews = () => {
  currentFilter = "";
  page = 1;                 // 조건이 바뀌면 1페이지부터! (안 하면 유령버그)
  getNews();
};

// ---------- ② 카테고리 ----------
const getNewsByCategory = (event) => {
  currentFilter = `&category=${event.target.textContent}`;
  page = 1;
  getNews();
};

// 카테고리 버튼 전부에 클릭 이벤트 연결
document.querySelectorAll("#menu-list button").forEach((menu) => {
  menu.addEventListener("click", getNewsByCategory);
});

// ---------- ③ 키워드 검색 ----------
const searchNews = () => {
  const keyword = document.getElementById("search-input").value.trim();
  if (keyword === "") return;               // 빈 검색어 검문소

  currentFilter = `&q=${keyword}`;
  page = 1;
  getNews();
};

// Enter 키로도 검색
document.getElementById("search-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchNews();
});

// =====================================================
// 뉴스 그리기 (null 방어 포함)
// =====================================================
const render = () => {
  const newsHTML = newsList.map(news => `
    <article class="row news">
      <div class="col-lg-4">
        <div class="news-img-frame">
          <img class="news-img-size"
               src="${news.urlToImage || NO_IMAGE_URL}"
               onerror="this.src='${NO_IMAGE_URL}'" />
          <!-- onerror: 주소는 있는데 이미지가 깨진 경우까지 방어! -->
        </div>
      </div>
      <div class="col-lg-8">
        <h2>${news.title}</h2>
        <p>${
          news.description == null || news.description === ""
            ? "내용없음"
            : news.description.length > 200
            ? news.description.substring(0, 200) + "..."
            : news.description
        }</p>
        <div class="news-meta">
          <b>${news.source.name || "no source"}</b> · ${news.publishedAt.substring(0, 10)}
        </div>
      </div>
    </article>
  `).join('');

  document.getElementById("news-board").innerHTML = newsHTML;
};

// =====================================================
// ★ 페이지네이션 그리기
// 계산 재료: totalResults ÷ PAGE_SIZE = 전체 페이지 수
// 표시 방식: 현재 페이지가 속한 '5개 묶음'만 보여주기
// =====================================================
const paginationRender = () => {
  const totalPages = Math.ceil(totalResults / PAGE_SIZE);
  // 질문1의 답: 전체 결과 ÷ 페이지당 개수를 '올림' = 필요한 페이지 수
  // (196 ÷ 10 = 19.6 → 나머지 6개를 위해 20페이지 필요!)

  const pageGroup = Math.ceil(page / GROUP_SIZE);
  // 질문2의 답: 현재 페이지 ÷ 그룹 크기를 '올림' = 몇 번째 묶음인지
  // (7페이지 ÷ 5 = 1.4 → 올림 → 2번째 묶음)

  let lastPage = pageGroup * GROUP_SIZE;
  if (lastPage > totalPages) lastPage = totalPages;   // 전체를 넘으면 잘라내기
  const firstPage = Math.max(1, lastPage - (GROUP_SIZE - 1));
  // 질문3의 답: 묶음번호 × 그룹크기 = 그 묶음의 '끝' 번호,
  //             끝 번호 - (그룹크기-1) = 그 묶음의 '첫' 번호

  let paginationHTML = "";

  // ---------- ≪ ‹ : 1페이지가 아닐 때만 표시 (첫 구간에선 숨김) ----------
  if (page > 1) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" onclick="moveToPage(1)">&laquo;</a>
      </li>
      <li class="page-item">
        <a class="page-link" onclick="moveToPage(${page - 1})">&lsaquo;</a>
      </li>
    `;
  }

  // ---------- 페이지 번호 5개 묶음 ----------
  for (let i = firstPage; i <= lastPage; i++) {
    paginationHTML += `
      <li class="page-item ${i === page ? "active" : ""}">
        <a class="page-link" onclick="moveToPage(${i})">${i}</a>
      </li>
    `;
  }

  // ---------- › ≫ : 마지막 페이지가 아닐 때만 표시 (끝 구간에선 숨김) ----------
  if (page < totalPages) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" onclick="moveToPage(${page + 1})">&rsaquo;</a>
      </li>
      <li class="page-item">
        <a class="page-link" onclick="moveToPage(${totalPages})">&raquo;</a>
      </li>
    `;
    // ★ moveToPage(totalPages) ← 이게 '맨끝 페이지 도달'의 핵심!
  }

  document.getElementById("pagination").innerHTML = paginationHTML;
};

// 페이지 이동: 조건(currentFilter)은 유지한 채 page만 바꿔 재호출
const moveToPage = (pageNum) => {
  const totalPages = Math.ceil(totalResults / PAGE_SIZE);
  if (pageNum < 1 || pageNum > totalPages) return;   // 범위 밖 검문소

  page = pageNum;
  getNews();
  window.scrollTo({ top: 0, behavior: "smooth" });   // 페이지 넘기면 맨 위로 (UX!)
};

// =====================================================
// 상태 표시줄: 지금 뭘 보고 있는지 + 총 몇 건인지
// =====================================================
const statusRender = () => {
  let label = "Latest Headlines";
  if (currentFilter.includes("category")) {
    label = `Category: ${currentFilter.split("=")[1]}`;
  } else if (currentFilter.includes("q=")) {
    label = `Search: "${decodeURIComponent(currentFilter.split("=")[1])}"`;
  }
  document.getElementById("status-line").textContent =
    `${label} — ${totalResults} articles`;
};

// ---------- 유틸 바에 오늘 날짜 (브라우저 내장 기능으로!) ----------
document.getElementById("today-date").textContent =
  new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
// 예: "Saturday, July 18, 2026" — moment 없이도 이 정도는 가능!

// ---------- 시작 ----------
getLatestNews();