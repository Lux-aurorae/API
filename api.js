// =====================================================
// Lux TIMES (api.js) - 누나 API 최종 배포판
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
  const url = new URL(
    `${BASE_URL}/top-headlines?page=${page}&pageSize=${PAGE_SIZE}${currentFilter}`
  );

  const response = await fetch(url);
  const data = await response.json();

  newsList = data.articles;
  totalResults = data.totalResults;   // 페이지네이션 계산의 재료!

  render();
  paginationRender();
  statusRender();
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
  if (newsList.length === 0) {
    document.getElementById("news-board").innerHTML =
      `<p class="empty-note">결과가 없습니다. 다른 검색어를 시도해보세요.</p>`;
    return;
  }

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
  // Math.ceil = 올림. 196개 ÷ 10 = 19.6 → 20페이지 필요!

  const pageGroup = Math.ceil(page / GROUP_SIZE);      // 현재 몇 번째 묶음?
  let lastPage = pageGroup * GROUP_SIZE;               // 이 묶음의 마지막 번호
  if (lastPage > totalPages) lastPage = totalPages;    // 전체를 넘으면 잘라내기
  const firstPage = Math.max(1, lastPage - (GROUP_SIZE - 1));

  let paginationHTML = `
    <li class="page-item ${page === 1 ? "disabled" : ""}">
      <a class="page-link" onclick="moveToPage(${page - 1})">&lsaquo;</a>
    </li>
  `;

  for (let i = firstPage; i <= lastPage; i++) {
    paginationHTML += `
      <li class="page-item ${i === page ? "active" : ""}">
        <a class="page-link" onclick="moveToPage(${i})">${i}</a>
      </li>
    `;
  }

  paginationHTML += `
    <li class="page-item ${page === totalPages ? "disabled" : ""}">
      <a class="page-link" onclick="moveToPage(${page + 1})">&rsaquo;</a>
    </li>
  `;

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

// ---------- 시작 ----------
getLatestNews();