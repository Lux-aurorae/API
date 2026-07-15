let news=[];
const getLatestNews=async()=>{
    let url=new URL('https://noona-times-be-5ca9402f90d9.herokuapp.com/top-headlines?country=kr&pageSize=${PAGE_SIZE}');
const response = await fetch(url);
//URL 호출 : 인터넷세상에서 데이터(자료를)불러오는 것
const data=await response.json();
news = data.articles;
console.log("dddd",news);
//console.log("dddd",data.articles);
//let news=data.articles;
};

getLatestNews();