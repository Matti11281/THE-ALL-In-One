let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
let editingId = null;

/* INIT */
window.onload = () => {
  renderTasks();
  generateAI();
  updateNotiBadge();
  
  // Set current date in header
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  document.getElementById("dateDisplay").innerText = new Date().toLocaleDateString('en-US', options);

  // Apply saved theme
  if(localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('themeIcon').classList.replace('fa-moon', 'fa-sun');
  }
};

/* MODAL LOGIC */
const modal = document.getElementById("modal");
const taskTitleInput = document.getElementById("taskTitle");
const taskDateInput = document.getElementById("taskDate");
const taskPriorityInput = document.getElementById("taskPriority");
const modalTitle = document.getElementById("modalTitle");

document.getElementById("addBtn").addEventListener("click", () => {
  editingId = null;
  modalTitle.innerHTML = "✨ Create New Task";
  taskTitleInput.value = "";
  taskDateInput.value = "";
  taskPriorityInput.value = "low";
  modal.classList.add("active");
});

function closeModal() {
  modal.classList.remove("active");
}

/* ADD & UPDATE TASK */
function saveTask() {
  const title = taskTitleInput.value.trim();
  const priority = taskPriorityInput.value;
  const dueDate = taskDateInput.value;

  if (!title) return alert("Task title cannot be empty!");

  if (editingId) {
    // Update existing
    const task = tasks.find(t => t.id === editingId);
    task.title = title;
    task.priority = priority;
    task.dueDate = dueDate;
    addNotification("✏️ Updated: " + title);
  } else {
    // Create new
    tasks.unshift({ id: Date.now(), title, priority, dueDate, completed: false });
    addNotification("📌 Added: " + title);
  }

  saveData();
  renderTasks();
  generateAI();
  closeModal();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingId = id;
  modalTitle.innerHTML = "✏️ Edit Task";
  taskTitleInput.value = task.title;
  taskDateInput.value = task.dueDate || "";
  taskPriorityInput.value = task.priority;
  
  modal.classList.add("active");
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;

  t.completed = !t.completed;
  addNotification(t.completed ? "✅ Completed: " + t.title : "🔄 Reopened: " + t.title);

  saveData();
  renderTasks();
  generateAI();
}

function deleteTask(id) {
  const t = tasks.find(t => t.id === id);
  tasks = tasks.filter(task => task.id !== id);
  addNotification("🗑️ Deleted: " + t.title);
  
  saveData();
  renderTasks();
  generateAI();
}

function clearCompleted() {
  const originalLength = tasks.length;
  tasks = tasks.filter(t => !t.completed);
  if(originalLength !== tasks.length) {
    addNotification("🧹 Cleared completed tasks");
    saveData();
    renderTasks();
    generateAI();
  }
}

/* RENDER TASKS */
function renderTasks() {
  const list = document.getElementById("taskList");

  if(tasks.length === 0) {
    list.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:20px;">No tasks yet. Add one to get started! 🚀</p>`;
  } else {
    list.innerHTML = tasks.map(t => {
      const dateText = t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : "No Date";
      return `
      <div class="task ${t.priority} ${t.completed ? 'completed' : ''}">
        <div class="task-left">
          <div class="check ${t.completed ? "done" : ""}" onclick="toggleTask(${t.id})"></div>
          <div class="task-info">
            <span class="task-title">${t.title}</span>
            <span class="task-date"><i class="far fa-calendar-alt"></i> ${dateText}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="edit-btn" onclick="editTask(${t.id})"><i class="fas fa-pen"></i></button>
          <button class="del-btn" onclick="deleteTask(${t.id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `}).join("");
  }
  updateStats();
}

/* STATS */
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  document.getElementById("taskCount").innerText = total;
  document.getElementById("totalTasks").innerText = total;
  document.getElementById("completedTasks").innerText = completed;
  
  // Animate progress number
  document.getElementById("progressValue").innerText = percent + "%";
  document.getElementById("progressCircle").style.background = `conic-gradient(var(--primary) ${percent * 3.6}deg, transparent 0deg)`;
}

/* SEARCH */
document.getElementById("searchInput").addEventListener("input", function () {
  const value = this.value.toLowerCase();
  const tasksDOM = document.querySelectorAll("#taskList .task");
  
  tasksDOM.forEach(task => {
    const text = task.querySelector('.task-title').innerText.toLowerCase();
    task.style.display = text.includes(value) ? "flex" : "none";
  });
});

/* AI SUGGESTIONS */
function generateAI() {
  const list = document.getElementById("aiSuggestions");
  let suggestions = [];
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  if (total === 0) suggestions.push("🚀 Start your day by adding a task.");
  else if (pending > 5) suggestions.push("⚠️ You have a lot on your plate. Focus on high priority!");
  else if (tasks.some(t => t.priority === "high" && !t.completed)) suggestions.push("🔥 Knock out your HIGH priority tasks first.");
  else if (pending === 0) suggestions.push("🎉 Amazing! You've finished all your tasks.");
  else if (completed > 0) suggestions.push("✅ Great momentum! Keep checking things off.");
  else suggestions.push("📌 You're on track, keep going!");

  list.innerHTML = suggestions.map(s => `<li>${s}</li>`).join("");
}

/* LOCAL STORAGE */
function saveData() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('notifications', JSON.stringify(notifications));
}

/* DARK MODE */
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  const icon = document.getElementById('themeIcon');
  if(isDark) icon.classList.replace('fa-moon', 'fa-sun');
  else icon.classList.replace('fa-sun', 'fa-moon');
}

/* DROPDOWNS & NOTIFICATIONS */
function toggleNotifications(e) {
  e.stopPropagation();
  closeAllDropdowns();
  document.getElementById("notificationPanel").classList.toggle("show");
  renderNotifications();
  // Clear badge
  notifications = notifications.slice(0, 10); // Keep max 10
  updateNotiBadge(true);
}

function toggleProfile(e) {
  e.stopPropagation();
  closeAllDropdowns();
  document.getElementById("profileMenu").classList.toggle("show");
}

function renderNotifications() {
  const panel = document.getElementById("notificationPanel");
  panel.innerHTML = notifications.length
    ? notifications.slice().reverse().map(n => `<p>${n}</p>`).join("")
    : "<p style='text-align:center'>No new notifications</p>";
}

function addNotification(msg) {
  notifications.push(msg);
  updateNotiBadge();
  saveData();
}

function updateNotiBadge(clear = false) {
  const badge = document.getElementById("notiBadge");
  if(clear) { badge.style.display = 'none'; badge.innerText = '0'; return; }
  
  let count = parseInt(badge.innerText) || 0;
  count++;
  badge.innerText = count;
  badge.style.display = 'block';
}

function clearTasks() {
  if(confirm("Are you sure you want to delete ALL tasks?")) {
    tasks = [];
    addNotification("🚨 All tasks cleared");
    saveData();
    renderTasks();
    generateAI();
  }
}

function logout() { alert("Logout successful! (Demo)"); }

// Close dropdowns when clicking outside
window.onclick = function(event) {
  if (!event.target.closest('.dropdown')) {
    closeAllDropdowns();
  }
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
}