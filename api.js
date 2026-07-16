// =====================================================
// Donghui TIMES (api.js) - newsapi 연동 통합 버전
// 기능: ① 최신 뉴스 여러 개  ② 햄버거 메뉴(카테고리별 뉴스)
//       ③ 돋보기 검색(키워드 뉴스)
// =====================================================

let newsList = [];
const PAGE_SIZE = 20;   // 뉴스를 '여러 개' 보이게 20개로!

// ---------- API 설정 (한 곳에 모아두기) ----------
// ⚠️ 주의: newsapi 무료 키는 localhost에서만 작동 + 하루 100회 제한!
//    제출할 때는 아래 BASE_URL을 누나 API 주소로만 바꾸면 됩니다.
const API_KEY = "9053e19d896a443fa62e864f6ad707f7";
const BASE_URL = "https://newsapi.org/v2";
// 제출용: const BASE_URL = "https://noona-times-be-5ca9402f90d9.herokuapp.com";

// 사진/내용이 없는 기사 방어용
const NO_IMAGE_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqEWgS0uxxEYJ0PsOb2OgwyWvC0Gjp8NUdPw&usqp=CAU";

// =====================================================
// 공통 조각: url을 받아 호출하고 그리는 함수
// (최신/카테고리/검색 셋 다 "url만 다르고 과정은 같음" → 하나로 통일!)
// =====================================================
const getNews = async (url) => {
  const response = await fetch(url);
  const data = await response.json();

  newsList = data.articles;
  render();
  console.log("뉴스 데이터:", newsList);
};

// ---------- ① 최신 뉴스 (미국 헤드라인) ----------
const getLatestNews = async () => {
  const url = new URL(
    `${BASE_URL}/top-headlines?country=us&pageSize=${PAGE_SIZE}&apiKey=${API_KEY}`
  );
  getNews(url);
};

// ---------- ② 카테고리별 뉴스 (사이드 메뉴 클릭) ----------
const getNewsByCategory = async (event) => {
  const category = event.target.textContent.toLowerCase();
  // 버튼 글자 "Business" → newsapi가 원하는 소문자 "business"로

  const url = new URL(
    `${BASE_URL}/top-headlines?country=us&category=${category}&pageSize=${PAGE_SIZE}&apiKey=${API_KEY}`
  );
  getNews(url);
  closeNav();   // 뉴스를 불러오면 메뉴 서랍은 닫아주기 (UX!)
};

// 사이드 메뉴의 버튼들에 전부 클릭 이벤트 연결
const menus = document.querySelectorAll("#menu-list button");
menus.forEach((menu) => menu.addEventListener("click", getNewsByCategory));

// ---------- ③ 키워드 검색 (돋보기 → 입력 → Go) ----------
const searchNews = async () => {
  const keyword = document.getElementById("search-input").value;

  if (keyword.trim() === "") return;   // 빈 검색어 검문소

  const url = new URL(
    `${BASE_URL}/top-headlines?q=${keyword}&pageSize=${PAGE_SIZE}&apiKey=${API_KEY}`
  );
  getNews(url);
};

// Enter 키로도 검색되게 (편의 기능)
document.getElementById("search-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchNews();
});

// =====================================================
// 화면 그리기
// =====================================================
const render = () => {
  // 검색 결과가 0건일 때 방어
  if (newsList.length === 0) {
    document.getElementById("news-board").innerHTML =
      `<p class="news-meta" style="text-align:center; padding:40px 0;">
        결과가 없습니다.
      </p>`;
    return;
  }

  const newsHTML = newsList.map(news => `
    <div class="row news">
      <div class="col-lg-4">
        <div class="news-img-frame">
          <img class="news-img-size"
               src="${news.urlToImage || NO_IMAGE_URL}" />
        </div>
      </div>
      <div class="col-lg-8">
        <h2>${news.title}</h2>
        <p>${news.description || "내용없음"}</p>
        <div class="news-meta">
          <b>${news.source.name || "no source"}</b> · ${news.publishedAt}
        </div>
      </div>
    </div>
  `).join('');

  document.getElementById("news-board").innerHTML = newsHTML;
};

// =====================================================
// 사이드 메뉴 & 검색창 열고 닫기
// =====================================================
const openNav = () => {
  document.getElementById("mySidenav").style.width = "250px";
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
    document.getElementById("search-input").focus();   // 열리면 바로 타이핑 가능
  }
};

// ---------- 시작 ----------
getLatestNews();