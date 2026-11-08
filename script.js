
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskCategory = document.getElementById("taskCategory");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");

const taskList = document.getElementById("taskList");
const addTaskBtn = document.getElementById("addTaskBtn");
const closeFormBtn = document.getElementById("closeFormBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const formTitle = document.getElementById("formTitle");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const themeToggle = document.getElementById("themeToggle");

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];
let currentView = "all";
let editingTaskId = null;

// DATE
document.getElementById("dateLabel").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

// DARK / LIGHT MODE
function applyTheme(theme) {
    document.body.classList.toggle("dark-mode", theme === "dark");

    themeToggle.textContent =
        theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

    localStorage.setItem("taskflowTheme", theme);
}

const savedTheme = localStorage.getItem("taskflowTheme") || "light";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-mode");
    applyTheme(isDark ? "light" : "dark");
});

// SAVE TASKS
function saveTasks() {
    localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
}

// OPEN FORM
addTaskBtn.addEventListener("click", () => {
    editingTaskId = null;
    taskForm.reset();
    formTitle.textContent = "Create a New Task";
    saveTaskBtn.textContent = "Save Task";
    taskForm.classList.remove("hidden");
    taskInput.focus();
});

// CLOSE FORM
closeFormBtn.addEventListener("click", () => {
    taskForm.classList.add("hidden");
    editingTaskId = null;
});

// ADD OR UPDATE TASK
taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) return;

    if (editingTaskId !== null) {
        const task = tasks.find(t => t.id === editingTaskId);

        if (task) {
            task.title = title;
            task.category = taskCategory.value;
            task.priority = taskPriority.value;
            task.dueDate = taskDate.value;
        }
    } else {
        tasks.push({
            id: Date.now(),
            title,
            category: taskCategory.value,
            priority: taskPriority.value,
            dueDate: taskDate.value,
            completed: false
        });
    }

    saveTasks();
    taskForm.reset();
    taskForm.classList.add("hidden");
    editingTaskId = null;

    renderTasks();
});

// EDIT TASK
function editTask(id) {
    const task = tasks.find(t => t.id === id);

    if (!task) return;

    editingTaskId = id;

    taskInput.value = task.title;
    taskCategory.value = task.category || "Personal";
    taskPriority.value = task.priority || "Medium";
    taskDate.value = task.dueDate || "";

    formTitle.textContent = "Edit Task";
    saveTaskBtn.textContent = "Update Task";

    taskForm.classList.remove("hidden");
    taskInput.focus();
}

// DELETE TASK
function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

// COMPLETE TASK
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);

    if (!task) return;

    task.completed = !task.completed;

    saveTasks();
    renderTasks();
}

// FILTERS
document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        currentView = button.dataset.view;

        document.querySelectorAll(".nav-item").forEach(item =>
            item.classList.remove("active")
        );

        button.classList.add("active");
        renderTasks();
    });
});

// WORKSPACE FILTER
document.querySelectorAll(".workspace-item").forEach(button => {
    button.addEventListener("click", () => {
        categoryFilter.value = button.dataset.category;
        renderTasks();
    });
});

// SEARCH
searchInput.addEventListener("input", renderTasks);

// CATEGORY FILTER
categoryFilter.addEventListener("change", renderTasks);

// UPDATE DASHBOARD
function updateDashboard() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("progressText").textContent =
        percentage + "%";

    document.getElementById("progressFill").style.width =
        percentage + "%";

    document.getElementById("progressCaption").textContent =
        total === 0
            ? "Start adding tasks to track your progress."
            : `${completed} of ${total} tasks completed. Keep going!`;
}

// DISPLAY TASKS
function renderTasks() {
    taskList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    let filteredTasks = tasks.filter(task => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            task.category === selectedCategory;

        let matchesView = true;

        if (currentView === "pending") {
            matchesView = !task.completed;
        }

        if (currentView === "completed") {
            matchesView = task.completed;
        }

        return matchesSearch && matchesCategory && matchesView;
    });

    document.getElementById("taskCount").textContent =
        `${filteredTasks.length} tasks`;

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <h3>Nothing here yet ✨</h3>
                <p>Add a task and start being productive!</p>
            </div>
        `;
    }

    filteredTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () => toggleTask(task.id));

        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("p");
        title.className = "task-title";
        title.textContent = task.title;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const category = document.createElement("span");
        category.textContent = task.category || "Personal";

        const priority = document.createElement("span");
        const priorityValue = task.priority || "Medium";

        priority.className =
            "priority priority-" + priorityValue.toLowerCase();

        priority.textContent = priorityValue + " Priority";

        meta.append(category, priority);

        if (task.dueDate) {
            const dueDate = document.createElement("span");
            dueDate.textContent = "Due: " + task.dueDate;
            meta.appendChild(dueDate);
        }

        details.append(title, meta);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.textContent = "✎";
        editBtn.title = "Edit task";
        editBtn.addEventListener("click", () => editTask(task.id));

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "✕";
        deleteBtn.title = "Delete task";
        deleteBtn.addEventListener("click", () => deleteTask(task.id));

        actions.append(editBtn, deleteBtn);

        item.append(checkbox, details, actions);
        taskList.appendChild(item);
    });

    updateDashboard();
}

// INITIAL DISPLAY
renderTasks();
