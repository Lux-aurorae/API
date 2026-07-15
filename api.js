let news = [];
const PAGE_SIZE = 10;  

const getLatestNews = async () => {
  let url = new URL(
    `https://noona-times-be-5ca9402f90d9.herokuapp.com/top-headlines?q=아이유&pageSize=${PAGE_SIZE}`
  );

  const response = await fetch(url); 
  const data = await response.json();  

  news = data.articles;             
  console.log("뉴스 데이터:", news);
};

getLatestNews();