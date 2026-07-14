const API_KEY='9053e19d896a443fa62e864f6ad707f7';
const getLatestNews = () =>{
const url= new URL('https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}');
console.log("uuu",url);
};
//URL 호출 : 인터넷세상에서 데이터(자료를)불러오는 것
const response = fetch(url)
// 자바스크립트는 개발자가 필요로 하는 많은 함수들을 제공해줌
// url 인스턴스라 하는데 URL에 필요한 함수와 변수들을 제공함
getLatestNews();
// fetch(url)을 호출해서 어떻게 하겠다는 건지는 자바스크립트 기본원리에 대해서 알아야한다.