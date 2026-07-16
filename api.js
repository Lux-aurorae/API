let newsList = [];
const PAGE_SIZE = 10;

// ---------- 뉴스 가져오기 ----------
const getLatestNews = async () => {
  let url = new URL(
    `https://noona-times-be-5ca9402f90d9.herokuapp.com/top-headlines?q=아이유&pageSize=${PAGE_SIZE}`
  );

  const response = await fetch(url);
  const data = await response.json();

  newsList = data.articles;
  render();                       // 데이터가 온 '뒤에' 그리기!
  console.log("뉴스 데이터:", newsList);
};

// ---------- 화면 그리기 ----------
// ★ 수정: map은 따옴표 '밖'(코드), HTML 조각은 '백틱 안'!
const render = () => {
  const newsHTML = newsList.map(news => `
    <div class="row news">
      <div class="col-lg-4">
        <img class="news-img-size" src="${news.urlToImage}" />
      </div>
      <div class="col-lg-8">
        <h2>${news.title}</h2>
        <p>${news.description}</p>
        <div>${news.source.name} * ${news.publishedAt}</div>
      </div>
    </div>
  `).join('');

  document.getElementById("news-board").innerHTML = newsHTML;
};

// ---------- ★ 사이드 메뉴 열고 닫기 ----------
const openNav = () => {
  document.getElementById("mySidenav").style.width = "250px";
};

const closeNav = () => {
  document.getElementById("mySidenav").style.width = "0";
};

// ---------- ★ 검색창 보이기/숨기기 (토글) ----------
const openSearchBox = () => {
  let inputArea = document.getElementById("input-area");
  if (inputArea.style.display === "inline") {
    inputArea.style.display = "none";
  } else {
    inputArea.style.display = "inline";
  }
};

// ---------- ★ 검색 버튼 (다음 강의에서 채울 자리) ----------
const searchNews = () => {
  console.log("검색어:", document.getElementById("search-input").value);
  // 다음 단계: 이 검색어로 url의 q=를 바꿔서 getLatestNews를 다시 부르게 됩니다!
};

getLatestNews();