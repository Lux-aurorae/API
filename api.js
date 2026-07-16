// =====================================================
// 나의 할일 - UX 개선판 (script.js)
// 로직 뼈대는 기본형과 동일 (배열 → render)
// ★ 표시 = UX를 위해 새로 추가된 부분
// =====================================================

// ---------- 요소 가져오기 ----------
const taskInput = document.getElementById("task-input");
const addButton = document.getElementById("add-button");
const taskBoard = document.getElementById("task-board");
const tabs = document.querySelectorAll(".tab");
const underBar = document.getElementById("under-bar");
const inputWarning = document.getElementById("input-warning");   // ★
const countAll = document.getElementById("count-all");           // ★
const countIng = document.getElementById("count-ing");           // ★
const countDone = document.getElementById("count-done");         // ★

// ---------- 데이터 ----------
let taskList = [];
let currentTab = "all";

// ---------- ① 할일 추가 ----------
function addTask() {
  // ★UX: 빈 값이면 '왜 안 되는지' 알려주고 + 입력창을 살짝 흔들기
  if (taskInput.value.trim() === "") {
    inputWarning.textContent = "할일을 입력해주세요!";
    taskInput.classList.add("shake");
    // 흔들림 애니메이션이 끝나면 클래스 제거 (다음에 또 흔들 수 있게)
    setTimeout(function () { taskInput.classList.remove("shake"); }, 350);
    return;
  }

  inputWarning.textContent = "";   // ★ 경고 지우기

  const task = {
    id: Date.now(),
    content: taskInput.value.trim(),
    isComplete: false
  };

  taskList.push(task);
  taskInput.value = "";
  taskInput.focus();               // ★UX: 연속 입력이 끊기지 않게 커서 유지
  render();
}

// ---------- ② 완료 ↔ 되돌리기 (토글) ----------
function toggleComplete(id) {
  for (let i = 0; i < taskList.length; i++) {
    if (taskList[i].id === id) {
      taskList[i].isComplete = !taskList[i].isComplete;
      break;
    }
  }
  render();
}

// ---------- ③ 삭제 ----------
function deleteTask(id) {
  taskList = taskList.filter(function (task) {
    return task.id !== id;
  });
  render();
}

// ---------- ★ 탭 개수 뱃지 갱신 ----------
function renderCounts() {
  countAll.textContent = taskList.length;
  countIng.textContent = taskList.filter(function (t) { return !t.isComplete; }).length;
  countDone.textContent = taskList.filter(function (t) { return t.isComplete; }).length;
}

// ---------- ④ 화면 그리기 ----------
function render() {
  // 1) 탭에 맞는 목록 고르기
  let list = [];
  if (currentTab === "all") {
    list = taskList;
  } else if (currentTab === "ing") {
    list = taskList.filter(function (t) { return t.isComplete === false; });
  } else if (currentTab === "done") {
    list = taskList.filter(function (t) { return t.isComplete === true; });
  }

  // ★UX: 보여줄 게 없으면 '빈 상태 안내' 표시 (빈 화면은 고장처럼 보임!)
  if (list.length === 0) {
    let emptyMessage = "";
    if (currentTab === "all") emptyMessage = "아직 할일이 없어요.<br>첫 할일을 추가해보세요!";
    if (currentTab === "ing") emptyMessage = "진행중인 할일이 없어요.<br>모두 끝내셨네요! 👏";
    if (currentTab === "done") emptyMessage = "완료된 할일이 아직 없어요.";

    taskBoard.innerHTML = `
      <div class="empty-state">
        <span class="big">🗒️</span>
        ${emptyMessage}
      </div>
    `;
    renderCounts();
    return;   // 빈 상태를 그렸으니 여기서 종료
  }

  // 2) HTML 조립
  let resultHTML = "";
  for (let i = 0; i < list.length; i++) {
    resultHTML += `
      <div class="task-row ${list[i].isComplete ? "done" : ""}">
        <button class="check-btn"
                onclick="toggleComplete(${list[i].id})"
                title="${list[i].isComplete ? "되돌리기" : "완료하기"}">✔</button>
        <span class="task-text">${list[i].content}</span>
        <button class="delete-btn"
                onclick="deleteTask(${list[i].id})"
                title="삭제">🗑️</button>
      </div>
    `;
  }

  taskBoard.innerHTML = resultHTML;
  renderCounts();   // ★ 그릴 때마다 개수 뱃지도 함께 갱신
}

// ---------- ⑤ 탭 전환 + 언더바 ----------
function switchTab(event) {
  // ★ 뱃지(span)를 클릭해도 탭이 눌리게: 실제 버튼을 찾아 올라감
  const clickedTab = event.target.closest(".tab");
  if (!clickedTab) return;

  if (clickedTab.id === "tab-all") currentTab = "all";
  if (clickedTab.id === "tab-ing") currentTab = "ing";
  if (clickedTab.id === "tab-done") currentTab = "done";

  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }
  clickedTab.classList.add("active");

  underBar.style.left = clickedTab.offsetLeft + "px";
  underBar.style.width = clickedTab.offsetWidth + "px";

  render();
}

// ---------- 이벤트 연결 ----------
addButton.addEventListener("click", addTask);

// ★UX: Enter 키로도 추가 (마우스로 + 누르러 가는 수고 절약)
taskInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") addTask();
});

// ★UX: 입력을 다시 시작하면 경고 문구 자동으로 지움
taskInput.addEventListener("input", function () {
  inputWarning.textContent = "";
});

for (let i = 0; i < tabs.length; i++) {
  tabs[i].addEventListener("click", switchTab);
}

// ---------- 시작 ----------
tabs[0].classList.add("active");
underBar.style.left = tabs[0].offsetLeft + "px";
underBar.style.width = tabs[0].offsetWidth + "px";
taskInput.focus();    // ★UX: 페이지 열리자마자 바로 입력 가능
render();