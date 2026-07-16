// =====================================================
// NOONA TIMES (api.js)
// ★ 표시 = 원래 코드에서 틀렸던 부분의 수정
// =====================================================

let newsList = [];
const PAGE_SIZE = 10;

// 사진이 없는 기사(urlToImage가 null)를 위한 대체 이미지
const NO_IMAGE_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqEWgS0uxxEYJ0PsOb2OgwyWvC0Gjp8NUdPw&usqp=CAU";

// ---------- 뉴스 가져오기 ----------
const getLatestNews = async () => {
  let url = new URL(
    `https://noona-times-be-5ca9402f90d9.herokuapp.com/top-headlines?q=아이유&pageSize=${PAGE_SIZE}`
  );

  const response = await fetch(url);
  const data = await response.json();

  newsList = data.articles;
  render();                        // 데이터가 도착한 '뒤에' 그리기!
  console.log("뉴스 데이터:", newsList);
};

// ---------- 화면 그리기 ----------
// ★ 수정⑦: map은 따옴표 '밖'(코드), HTML 조각만 백틱 안!
//   ❌ const newsHTML = 'newsList.map(news=>'<div...
//   ✅ const newsHTML = newsList.map(news => `<div...`).join('');
const render = () => {
  const newsHTML = newsList.map(news => `
    <div class="row news">
      <div class="col-lg-4">   <!-- ★ 수정⑧: 닫는 > 누락돼 있었음 -->
        <div class="news-img-frame">
          <img class="news-img-size"
               src="${news.urlToImage || NO_IMAGE_URL}" />
          <!-- ★ 수정⑨: src=${} 에 따옴표가 없었음 → src="${}"
               || : 이미지가 null이면 대체 이미지 사용 (실제로 null인 기사 있음!) -->
        </div>
      </div>
      <div class="col-lg-8">   <!-- ★ 수정⑩: class=""col-lg-8" 따옴표 2개였음 -->
        <h2>${news.title}</h2>
        <p>${news.description || "내용없음"}</p>
        <div class="news-meta">
          <b>${news.source.name || "no source"}</b> · ${news.publishedAt}
        </div>
      </div>
    </div>
  `).join('');
  // join(''): map이 만든 HTML 조각 배열을 한 덩어리 문자열로 붙이기

  console.log("html", newsHTML);

  document.getElementById("news-board").innerHTML = newsHTML;
};

// ---------- 시작 ----------
getLatestNews();