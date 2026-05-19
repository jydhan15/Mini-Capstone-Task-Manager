let tasks = [];
let filter = "all";
let search = "";

// ===== ADD TASK =====
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!taskInput.value.trim()) return;

  tasks.push({
    id: Date.now(),
    text: taskInput.value,
    completed: false,
    category: categorySelect.value
  });

  taskInput.value = "";
  render();
  updateCount();
  notify("Task added!");
});

// ===== RENDER TASKS =====
function render() {
  taskList.innerHTML = "";

  tasks
    .filter(t =>
      (filter === "all" ||
        (filter === "completed" && t.completed) ||
        (filter === "active" && !t.completed)) &&
      t.text.toLowerCase().includes(search.toLowerCase())
    )
    .forEach(t => {
      taskList.innerHTML += `
        <li>
          <span class="${t.completed ? "done" : ""}" data-id="${t.id}">
            ${t.text} (${t.category})
          </span>

          <button data-id="${t.id}" class="doneBtn">
            ${t.completed ? "Undo" : "Done"}
          </button>

          <button data-id="${t.id}" class="delBtn">Delete</button>
        </li>
      `;
    });
}

// ===== CLICK ACTIONS =====
taskList.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);

  if (e.target.classList.contains("delBtn")) {
    tasks = tasks.filter(t => t.id !== id);
    notify("Deleted");
  }

  if (e.target.classList.contains("doneBtn")) {
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    notify("Updated");
  }

  render();
  updateCount();
});

// ===== COUNTER =====
function updateCount() {
  const done = tasks.filter(t => t.completed).length;

  totalCount.textContent = tasks.length;
  completedCount.textContent = done;
  pendingCount.textContent = tasks.length - done;
}

// ===== SEARCH =====
searchInput.oninput = (e) => {
  search = e.target.value;
  render();
};

// ===== FILTER =====
filterButtons.forEach(btn => {
  btn.onclick = () => {
    filter = btn.dataset.filter;
    render();
  };
});

// ===== NOTIFICATION =====
function notify(msg) {
  notification.textContent = msg;
  notification.classList.remove("hidden");

  setTimeout(() => {
    notification.classList.add("hidden");
  }, 1500);
}

// ===== START =====
render();
updateCount();