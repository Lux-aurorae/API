const API_KEY='9053e19d896a443fa62e864f6ad707f7';
let news=[];
const getLatestNews=async()=>{
    let url=new URL('https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}');
const response = await fetch(url);
//URL 호출 : 인터넷세상에서 데이터(자료를)불러오는 것
const data=await response.json();
news = data.articles;
console.log("dddd",news);
//console.log("dddd",data.articles);
//let news=data.articles;
};

getLatestNews();