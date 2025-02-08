let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Saving tasks to localStorage
function savingTasksInLocalStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// function to add a new task
function addTasks() {
  const input1 = document.getElementById('input1');
  const input2 = document.getElementById('input2');
  const input3 = document.getElementById('input3');
  const level_selection = document.getElementById('level_selection');

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

  if (confirm('Click on OK,to add new task')) {
    tasks.push(task);
    savingTasksInLocalStorage();
    displayTask(task);
  } else {
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
    <div class="task_content">
      <div><strong>Title:</strong> <span class="task_title">${task.title}</span></div>
      <div><strong>Description:</strong> <span class="desc">${task.description}</span></div>
      <div><strong>Due Date:</strong> <span class="date">${task.dueDate}</span></div>
      <div><strong>Priority:</strong> <span class="priority">${task.priority}</span></div>
    </div><br>
    <div class="task_actions">
      ${task.status === 'pending'? `<button onclick="completedTask('${task.title}')">Completed</button>`: ''}
      ${task.status === 'pending'? `<button onclick="editTask('${task.title}')">Edit</button>`: ''}
      <button onclick="deleteTask('${task.title}')">Delete</button>
    </div>
    <form class="edit_form" style="display: none;">
      <input type="text" class="edit_title" value="${task.title}" required>
      <input type="text" class="edit_desc" value="${task.description}" required>
      <input type="date" class="edit_date" value="${task.dueDate}" required>
      <select class="edit_priority">
        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
      </select>
      <button type="button" onclick="saveTask('${task.title}')">Save</button>
    </form>
  `;

  // appending tasks to the respective containers
  if (task.status === 'pending') {
    document.getElementById('pending_tasks_container').appendChild(taskDiv);
    document.getElementById('pending_para').style.display = 'none';
  } else {
    document.getElementById('completed_tasks_container').appendChild(taskDiv);
    document.getElementById('completed_para').style.display = 'none';
  }
}

//Function to filter tasks
function applyFilter() {
  const priorityFilter = document.getElementById('priority_filter').value;
  const dateFilter = document.getElementById('date_filter').value;
  const statusFilter = document.getElementById('status_filter').value;

  const today = new Date();
  const next7Days = new Date(today);
  next7Days.setDate(today.getDate() + 7);

  const filteredTasks = tasks.filter(function (task) {
    //Priority filtering
    let conditionforPriority;
    if (priorityFilter === 'all') {
      conditionforPriority = true;
    } else {
      conditionforPriority = task.priority === priorityFilter;
    }

    //Status filtering
    let conditionforStatus;
    if (statusFilter === 'all'){
      conditionforStatus  = true;
    } else {
      conditionforStatus = task.status === statusFilter;
    }

    //Date filtering
    let conditionforDate = true;
    if (dateFilter === 'today') {
      conditionforDate = new Date(task.dueDate).toDateString() === today.toDateString();
    } else if (dateFilter === 'next_7_days') {
      const taskDate = new Date(task.dueDate);
      conditionforDate = taskDate >= today && taskDate <= next7Days;
    }

    return conditionforPriority && conditionforStatus && conditionforDate;
  });

  refreshTasks(filteredTasks);
}

// function for editing tasks
function editTask(title) {
  const taskDivs = document.querySelectorAll('.newtask');

  taskDivs.forEach((taskDiv) => {
    const taskTitle = taskDiv.querySelector('.task_title').textContent;
    if (taskTitle === title) {
      const editForm = taskDiv.querySelector('.edit_form');
      const taskContent = taskDiv.querySelector('.task_content');
      const taskActions = taskDiv.querySelector('.task_actions');

      if (editForm && taskContent && taskActions) {
        taskContent.style.display = 'none';
        editForm.style.display = 'block';
        taskActions.style.display = 'none';
      }
    }
  });
}

//function for saving tasks after editing
function saveTask(title) {
  const taskDivs = document.querySelectorAll('.newtask');
  let taskDiv = null;
  let task = null;

  tasks.forEach((t, index) => {
    if (t.title === title) {
      task = t;
      taskDiv = taskDivs[index];
    }
  });

  if (task && taskDiv) {
    const newTitle = taskDiv.querySelector('.edit_title').value;
    const newDescription = taskDiv.querySelector('.edit_desc').value;
    const newDueDate = taskDiv.querySelector('.edit_date').value;
    const newPriority = taskDiv.querySelector('.edit_priority').value;

    if (!newTitle || !newDescription || !newDueDate || !newPriority) {
      alert('All fields must be filled out.');
      return;
    }

    // Changing the task object with updated data
    task.title = newTitle;
    task.description = newDescription;
    task.dueDate = newDueDate;
    task.priority = newPriority;

    savingTasksInLocalStorage();
    refreshTasks();
    alert('Task updated successfully.');
  }
}

function completedTask(title) {
  tasks.forEach((task) => {
    if (task.title === title) {
      task.status = 'completed';
    }
  });
  savingTasksInLocalStorage();
  refreshTasks();
}

// function to delete task
function deleteTask(title) {
  let remainingTasks = [];
  tasks.forEach((task) => {
    if (task.title !== title) {
      remainingTasks.push(task);
    }
  });
  tasks = remainingTasks;
  savingTasksInLocalStorage();
  refreshTasks();
}

// function to refresh the previously displayed tasks
function refreshTasks(filteredTasks = tasks) {

  document.getElementById('pending_tasks_container').innerHTML = '';
  document.getElementById('completed_tasks_container').innerHTML = '';

  let pendingTasks = false;
  let completedTasks = false;

  // Check for pending and completed tasks using forEach
  filteredTasks.forEach((task) => {
    if (task.status === 'pending') {
      pendingTasks = true;
    }
    if (task.status === 'completed') {
      completedTasks = true;
    }
  });

  if (pendingTasks) {
    document.getElementById('pending_para').style.display = 'none';
  } else {
    document.getElementById('pending_para').style.display = 'block';
  }
  
  if (completedTasks) {
    document.getElementById('completed_para').style.display = 'none';
  } else {
    document.getElementById('completed_para').style.display = 'block';
  }  

  filteredTasks.forEach((task) => {
    displayTask(task);
  });
}

// for loading localstorage and display the tasks
function loadingTasks() {
  tasks.forEach((task) => {
    displayTask(task);
  });
}

window.addEventListener('load', loadingTasks);
