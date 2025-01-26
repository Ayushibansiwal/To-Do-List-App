// Select DOM elements
const taskInput = document.querySelector(".taskInput input");
const dateInput = document.querySelector('input[type="datetime-local"]');
const urgentButton = document.querySelector("#Urgent");
const mediumButton = document.querySelector("#Medium");
const lowButton = document.querySelector("#Low");
const addTaskButton = document.querySelector("#addTask");
const taskLists = document.querySelector(".taskLists");
const progressBar = document.querySelector(".progress");
const body = document.querySelector('body');

// Priority tracking
let selectedPriority = "";

// Load tasks and progress from localStorage
function loadTasks() {
  const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const storedProgress = JSON.parse(localStorage.getItem('progress')) || 0;
  storedTasks.forEach((taskData) => {
    addStoredTask(taskData);
  });
  progressBar.style.width = `${storedProgress}%`; // Set saved progress
}

// Save tasks to localStorage
function saveTasks() {
  const tasks = [];
  document.querySelectorAll('.task').forEach(task => {
    const taskData = {
      text: task.querySelector('h3').innerText,
      priority: task.querySelector('.circle').style.backgroundColor,
      completed: task.querySelector('.taskCheckbox').checked,
      subtasks: Array.from(task.querySelectorAll('.subTasks input[type="checkbox"]')).map(subtask => subtask.checked)
    };
    tasks.push(taskData);
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Calculate progress and save to localStorage
  updateProgress();
}

// Add stored task
function addStoredTask(taskData) {
  const task = document.createElement("div");
  task.className = "task";

  task.innerHTML = `
    <div class="taskHead">
      <div class="circle" style="background-color: ${taskData.priority}"></div>
      <h3>${taskData.text}</h3>
      <input type="checkbox" class="taskCheckbox" ${taskData.completed ? "checked" : ""}>
    </div>
    <div class="taskMain">
      <input type="text" placeholder="Add Subtask...">
      <button class="addSubtask"><i class="fa-solid fa-plus"></i></button>
    </div>
    <div class="subTasks">
      <ul>
        ${taskData.subtasks.map(subtaskChecked => 
          `<li><input type="checkbox" ${subtaskChecked ? 'checked' : ''}> Subtask</li>`
        ).join('')}
      </ul>
    </div>
  `;
  taskLists.appendChild(task);
  setupTaskEvents(task); // Setup events for the loaded task
}

// Handle priority selection
[urgentButton, mediumButton, lowButton].forEach((button) => {
  button.addEventListener("click", () => {
    selectedPriority = button.id;
    [urgentButton, mediumButton, lowButton].forEach((btn) => {
      btn.style.backgroundColor = btn.id === selectedPriority ? "#fff" : "transparent";
      btn.style.color = btn.id === selectedPriority ? "#000" : "#fff";
    });
  });
});

// Add task function
function addTask() {
  const taskText = taskInput.value.trim();
  const deadline = dateInput.value;

  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  if (!selectedPriority) {
    alert("Please select a priority!");
    return;
  }

  // Create a new task element
  const task = document.createElement("div");
  task.className = "task";

  task.innerHTML = `
    <div class="taskHead">
      <div class="circle" style="background-color: ${
        selectedPriority === "Urgent"
          ? "red"
          : selectedPriority === "Medium"
          ? "orange"
          : "green"
      }"></div>
      <h3>${taskText}</h3>
      <input type="checkbox" class="taskCheckbox">
    </div>
    <div class="taskMain">
      <input type="text" placeholder="Add Subtask...">
      <button class="addSubtask"><i class="fa-solid fa-plus"></i></button>
    </div>
    <div class="subTasks">
      <ul></ul>
    </div>
    <div class="time">
      <h5>${deadline ? new Date(deadline).toLocaleString() : "No Deadline"}</h5>
    </div>
  `;

  taskLists.appendChild(task);
  saveTasks(); // Save tasks to localStorage
  taskInput.value = "";
  dateInput.value = "";
  [urgentButton, mediumButton, lowButton].forEach((btn) => {
    btn.style.backgroundColor = "transparent";
    btn.style.color = "#fff";
  });
  selectedPriority = "";
  setupTaskEvents(task);
  updateProgress();
}

// Handle task events
function setupTaskEvents(task) {
  const checkbox = task.querySelector(".taskCheckbox");
  const subtaskInput = task.querySelector(".taskMain input");
  const addSubtaskButton = task.querySelector(".addSubtask");
  const subtaskList = task.querySelector(".subTasks ul");

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      task.classList.add("completed");
      showFirecracker(); // Show firecracker animation
      setTimeout(() => {
        task.remove(); // Remove the task after completion
        saveTasks(); // Save the updated tasks
        updateProgress(); // Update progress
      }, 500); // After pop animation ends
    }
    updateProgress();
  });

  addSubtaskButton.addEventListener("click", () => {
    const subtaskText = subtaskInput.value.trim();
    if (subtaskText === "") {
      alert("Please enter a subtask!");
      return;
    }

    const subtask = document.createElement("li");
    subtask.textContent = subtaskText;
    const subtaskCheckbox = document.createElement("input");
    subtaskCheckbox.type = "checkbox";
    subtaskCheckbox.style.marginLeft = "10px";
    subtaskCheckbox.addEventListener("change", () => {
      if (subtaskCheckbox.checked) {
        subtask.style.textDecoration = "line-through";
      } else {
        subtask.style.textDecoration = "none";
      }
      saveTasks(); // Save the updated task with subtasks
    });

    subtask.appendChild(subtaskCheckbox);
    subtaskList.appendChild(subtask);
    subtaskInput.value = "";
  });
}

// Update progress bar
function updateProgress() {
  const tasks = taskLists.querySelectorAll(".task");
  const totalTasks = tasks.length;

  if (totalTasks === 0) {
    progressBar.style.width = "100%";
    return;
  }

  let completedTasks = 0;

  tasks.forEach((task) => {
    const checkbox = task.querySelector(".taskCheckbox");
    const subtasks = task.querySelectorAll(".subTasks input[type='checkbox']");
    const completedSubtasks = Array.from(subtasks).filter((subtask) => subtask.checked);

    if (checkbox.checked && completedSubtasks.length === subtasks.length) {
      completedTasks++;
    }
  });

  const progressPercentage = (completedTasks / totalTasks) * 100;
  progressBar.style.width = `${progressPercentage}%`;

  // Save progress to localStorage
  localStorage.setItem('progress', progressPercentage);
}

// Show firecracker animation when all tasks are completed
function showFirecracker() {
  const tasks = taskLists.querySelectorAll(".task");
  const totalTasks = tasks.length;

  const completedTasks = Array.from(tasks).filter(task => task.querySelector(".taskCheckbox").checked).length;

  if (completedTasks === totalTasks) {
    const firecracker = document.createElement("div");
    firecracker.className = "firecracker";
    body.appendChild(firecracker);

    setTimeout(() => {
      firecracker.remove();
    }, 1500);
  }
}

// Add task on button click
addTaskButton.addEventListener("click", addTask);

// Load tasks when the page is loaded
window.addEventListener('load', loadTasks);




