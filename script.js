let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Saving tasks to localStorage
function saveTasksToLocalStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// for loading localstorage and display the tasks
function loadTasks() {
  tasks.forEach((task) => {
    displayTask(task);
  });
}

// function to add a new task
function addTasks() {
  const input1 = document.getElementById('input1');
  const input2 = document.getElementById('input2');
  const input3 = document.getElementById('input3');
  const level_selection = document.getElementById('level_selection')

  const task = {
    title: input1.value,
    description: input2.value,
    dueDate: input3.value,
    priority: level_selection.value,
    status: 'pending',
  };

  if (!task.title || !task.description || !task.dueDate || !task.priority) {
    alert('Please fill out all fields before adding a task.');
    return;
  }

  if(confirm('Click on OK,to add new task')){
    tasks.push(task);
    saveTasksToLocalStorage();
    displayTask(task);
  }
  else{
    return;
  }
  
  //To Clear input fields
  input1.value = '';
  input2.value = '';
  input3.value = '';
  level_selection.value = 'low';
  
}

// Function to display tasks
function displayTask(task) {
  const taskDiv = document.createElement('div');
  taskDiv.classList.add('newtask');

  taskDiv.innerHTML = `
    <div class="task-content">
      <div><strong>Title:</strong> <span class="task-title">${task.title}</span></div>
      <div><strong>Description:</strong> <span class="task-desc">${task.description}</span></div>
      <div><strong>Due Date:</strong> <span class="task-date">${task.dueDate}</span></div>
      <div><strong>Priority:</strong> <span class="task-priority">${task.priority}</span></div>
    </div><br>
    <div class="task-actions">
      ${task.status === 'pending' ? `<button onclick="completedTask('${task.title}')">Completed</button>` : ''}
      ${task.status === 'pending' ? `<button onclick="editTask('${task.title}')">Edit</button>` : ''}
      <button onclick="deleteTask('${task.title}')">Delete</button>
    </div>
    <form class="edit-form" style="display: none;">
      <input type="text" class="edit-title" value="${task.title}" required>
      <input type="text" class="edit-desc" value="${task.description}" required>
      <input type="date" class="edit-date" value="${task.dueDate}" required>
      <select class="edit-priority">
        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
      </select>
      <button type="button" onclick="saveTask('${task.title}')">Save</button>
    </form>
  `;

  // appending tasks to the correct container
  const container = task.status === 'pending' ? 'pending_tasks_container' : 'completed_tasks_container';
  document.getElementById(container).appendChild(taskDiv);
  document.getElementById(container === 'pending_tasks_container' ? 'pending_para' : 'completed_para').style.display = 'none';
}

//Function to filter tasks
function applyFilter(){
  const priorityFilter = document.getElementById('priority_filter').value;
  const dateFilter = document.getElementById('date_filter').value;
  const statusFilter = document.getElementById('status_filter').value;

  const today = new Date();
  const next7Days = new Date(today);
  next7Days.setDate(today.getDate() + 7);

  const filteredTasks = tasks.filter(task => {

    //Priority filtering
    const priorityCondition = priorityFilter === 'all' || task.priority === priorityFilter;

    //Status filtering 
    const statusCondition = statusFilter === 'all' || task.status === statusFilter;

    //Date filtering
    let dateCondition = true;
    if(dateFilter === 'today'){
      dateCondition = new Date(task.dueDate).toDateString() === today.toDateString();
    } else if(dateFilter === 'next_7_days'){
      const taskDate = new Date(task.dueDate);
      dateCondition = taskDate >= today && taskDate <= next7Days;
    }

    return priorityCondition && statusCondition && dateCondition;
  });
  
  refreshTasks(filteredTasks);
  
  }

// function for editing tasks
function editTask(title) {
  const taskDiv = Array.from(document.querySelectorAll('.newtask')).find((task) => {
    return task.querySelector('.task-title').textContent === title;
  });

  if (taskDiv) {
    const editForm = taskDiv.querySelector('.edit-form');
    const taskContent = taskDiv.querySelector('.task-content');
    const taskActions = taskDiv.querySelector('.task-actions');

    taskContent.style.display = 'none';
    editForm.style.display = 'block';
    taskActions.style.display = 'none';
  }
}

//function for saving tasks after editing
function saveTask(title) {
  const taskIndex = tasks.findIndex((t) => t.title === title);
  if (taskIndex !== -1) {
    const taskDiv = Array.from(document.querySelectorAll('.newtask')).find((task) => {
      return task.querySelector('.task-title').textContent === title;
    });

    const newTitle = taskDiv.querySelector('.edit-title').value;
    const newDescription = taskDiv.querySelector('.edit-desc').value;
    const newDueDate = taskDiv.querySelector('.edit-date').value;
    const newPriority = taskDiv.querySelector('.edit-priority').value;

    if (!newTitle || !newDescription || !newDueDate || !newPriority) {
      alert('All fields must be filled out.');
      return;
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      title: newTitle,
      description: newDescription,
      dueDate: newDueDate,
      priority: newPriority,
    };

    saveTasksToLocalStorage();
    refreshTasks();
    const taskActions = taskDiv.querySelector('.task-actions');
    taskActions.style.display = 'none';
    
    alert('Task updated successfully.');
  }
}

// function for completed tasks
function completedTask(title) {
  const task = tasks.find(t => t.title === title);
  if (task) {
    task.status = 'completed';
    saveTasksToLocalStorage();
    refreshTasks();
  }
}

// function to delete task
function deleteTask(title) {
  tasks = tasks.filter(t => t.title !== title);
  saveTasksToLocalStorage();
  refreshTasks();
}

// function to refresh the previously displayed tasks
function refreshTasks(filteredTasks = tasks) {
  if (!Array.isArray(filteredTasks)) {
    console.error("Filtered tasks is not an array", filteredTasks);
    return; 
  }

  document.getElementById('pending_tasks_container').innerHTML = '';
  document.getElementById('completed_tasks_container').innerHTML = '';

  const hasPendingTasks = filteredTasks.some((t) => t.status === 'pending');
  const hasCompletedTasks = filteredTasks.some((t) => t.status === 'completed');

  document.getElementById('pending_para').style.display = hasPendingTasks ? 'none' : 'block';
  document.getElementById('completed_para').style.display = hasCompletedTasks ? 'none' : 'block';

  filteredTasks.forEach((task) => {
    displayTask(task);
  });
}

window.onload = loadTasks;
