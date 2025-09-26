// --- DOM 元素获取 ---
const taskInput = document.getElementById("todo-input");
const addTaskBtn = document.getElementById("add-task"); // FIX: ID 匹配 HTML
const todosList = document.getElementById("todos-list"); // FIX: ID 匹配 HTML
const itemsLeft = document.getElementById("items-left"); // FIX: ID 匹配 HTML
const clearCompletedBtn = document.getElementById("clear-completed");
const emptyState = document.querySelector(".empty-state");
const dateElement = document.getElementById("date"); // FIX: ID 匹配 HTML
const filters = document.querySelectorAll(".filter");

// --- 数据和状态 ---
let todos = [];
let currentFilter = "all";

// --- 事件监听器 ---
window.addEventListener("DOMContentLoaded", () => {
  loadTodos();
  setDate();
  // 注意：updateItemsCount 和 checkEmptyState 会在 loadTodos -> renderTodos 中被调用，无需在此重复
});

addTaskBtn.addEventListener("click", () => {
  addTodo(taskInput.value);
});

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // 防止表单提交（如果在一个 form 元素内）
    addTodo(taskInput.value);
  }
});

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    setActiveFilter(filter.getAttribute("data-filter"));
  });
});

clearCompletedBtn.addEventListener("click", clearCompleted);

// --- 函数定义 ---

function addTodo(text) {
  if (text.trim() === "") return;
  const todo = {
    id: Date.now(),
    text: text,
    completed: false
  };
  todos.push(todo);
  saveAndRender();
  taskInput.value = "";
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveAndRender();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveAndRender();
}

function clearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  saveAndRender();
}

function filterTodos(filter) {
  switch (filter) {
    case "active":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

function setActiveFilter(filter) {
  currentFilter = filter;
  filters.forEach((item) => {
    if (item.getAttribute("data-filter") === filter) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
  renderTodos(); // 切换筛选器后只需重新渲染
}

// --- 渲染和状态更新 ---

function saveAndRender() {
  saveTodos();
  renderTodos();
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodos() {
  const storedTodos = localStorage.getItem("todos");
  if (storedTodos) {
    todos = JSON.parse(storedTodos);
  }
  renderTodos(); // 加载后渲染一次
}

function renderTodos() {
  todosList.innerHTML = "";
  const filteredTodos = filterTodos(currentFilter);

  filteredTodos.forEach((todo) => {
    const todoItem = document.createElement("li");
    todoItem.classList.add("todo-item");
    if (todo.completed) todoItem.classList.add("completed");

    const checkboxContainer = document.createElement("label");
    checkboxContainer.classList.add("checkbox-container");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("todo-checkbox");
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const checkmark = document.createElement("span");
    checkmark.classList.add("checkmark");

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(checkmark);

    const todoText = document.createElement("span");
    todoText.classList.add("todo-item-text");
    todoText.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    todoItem.appendChild(checkboxContainer);
    todoItem.appendChild(todoText);
    todoItem.appendChild(deleteBtn);

    todosList.appendChild(todoItem);
  });

  // 在渲染后更新计数和空状态
  updateItemsCount();
  checkEmptyState();
}

function updateItemsCount() {
  const uncompletedTodos = todos.filter((todo) => !todo.completed);
  itemsLeft.textContent = `${uncompletedTodos.length} item${uncompletedTodos.length !== 1 ? "s" : ""
    } left`;
}

// FIX: 重写了 checkEmptyState 逻辑
function checkEmptyState() {
  const filteredTodos = filterTodos(currentFilter);
  if (filteredTodos.length === 0) {
    emptyState.classList.remove("hidden");
    todosList.classList.add("hidden");
  } else {
    emptyState.classList.add("hidden");
    todosList.classList.remove("hidden");
  }
}

function setDate() {
  const options = { weekday: "long", month: "short", day: "numeric" };
  const today = new Date();
  dateElement.textContent = today.toLocaleDateString("en-US", options);
}
