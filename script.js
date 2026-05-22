const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("categorySelect");

const taskList = document.getElementById("taskList");

const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");

const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");

const notification = document.getElementById("notification");
const loading = document.getElementById("loading");
const darkToggle = document.getElementById("darkToggle");

let tasks = [];
let filter = "all";
let search = "";
let apiCategories = [];

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  darkToggle.textContent =
    document.body.classList.contains("dark")
      ? "Light Mode"
      : "Dark Mode";
});

function setLoading(state) {
  loading.classList.toggle("hidden", !state);
}

async function fetchCategories() {
  try {
    setLoading(true);

    const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    await res.json();

    apiCategories = ["Work", "Personal", "School", "Shopping", "Health"];

    categorySelect.innerHTML = apiCategories
      .map(c => `<option value="${c}">${c}</option>`)
      .join("");
  } catch (err) {
    notify("API Error");
  } finally {
    setLoading(false);
  }
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!taskInput.value.trim()) return;

  tasks.push({
    id: Date.now(),
    text: taskInput.value.trim(),
    completed: false,
    category: categorySelect.value,
    timeLeft: 60,
    timer: null
  });

  taskInput.value = "";

  render();
  updateCount();
  notify("Task added!");
});

function render() {
  taskList.innerHTML = "";

  const filtered = tasks.filter(t =>
    (filter === "all" ||
      (filter === "active" && !t.completed) ||
      (filter === "completed" && t.completed)) &&
    t.text.toLowerCase().includes(search.toLowerCase())
  );

  filtered.forEach(t => {
    taskList.innerHTML += `
      <li>
        <div>
          <span class="${t.completed ? "done" : ""}" data-id="${t.id}">
            ${t.text} <small>[${t.category}]</small>
          </span>

          <p>⏱ ${t.timeLeft}s</p>
        </div>

        <div>
          <button class="doneBtn" data-id="${t.id}">Done</button>
          <button class="delBtn" data-id="${t.id}">Delete</button>
          <button class="timerBtn" data-id="${t.id}">${t.timer ? "Pause" : "Start"}</button>
        </div>
      </li>
    `;
  });
}

taskList.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);
  const task = tasks.find(t => t.id === id);

  if (!task) return;

  if (e.target.classList.contains("delBtn")) {
    tasks = tasks.filter(t => t.id !== id);
    notify("Deleted");
  }

  if (e.target.classList.contains("doneBtn")) {
    task.completed = !task.completed;
    notify("Updated");
  }

  if (e.target.classList.contains("timerBtn")) {
    if (task.timer) {
      clearInterval(task.timer);
      task.timer = null;
      notify("Timer paused");
      render();
      return;
    }

    task.timer = setInterval(() => {
      if (task.timeLeft > 0) {
        task.timeLeft--;
        render();
      } else {
        clearInterval(task.timer);
        task.timer = null;
        notify("Timer finished!");
      }
    }, 1000);
  }

  render();
  updateCount();
});

taskList.addEventListener("click", (e) => {
  const span = e.target.closest("span");
  if (!span) return;

  const id = Number(span.dataset.id);
  const task = tasks.find(t => t.id === id);

  if (!task) return;

  task.completed = !task.completed;
  render();
  updateCount();
});

taskList.addEventListener("dblclick", (e) => {
  const id = Number(e.target.dataset.id);
  const task = tasks.find(t => t.id === id);

  if (!task) return;

  const newText = prompt("Edit task:", task.text);

  if (newText && newText.trim()) {
    task.text = newText.trim();
    render();
  }
});

searchInput.addEventListener("input", debounce((e) => {
  search = e.target.value;
  render();
}, 300));

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;

    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    render();
  });
});

function updateCount() {
  const done = tasks.filter(t => t.completed).length;

  totalCount.textContent = tasks.length;
  completedCount.textContent = done;
  pendingCount.textContent = tasks.length - done;
}

function notify(msg) {
  notification.textContent = msg;
  notification.classList.remove("hidden");

  setTimeout(() => {
    notification.classList.add("hidden");
  }, 1500);
}

async function init() {
  await fetchCategories();
  render();
  updateCount();
}

init();
