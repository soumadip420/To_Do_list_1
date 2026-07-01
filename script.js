
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskNameInput = document.getElementById('task-name');
    const taskDescriptionInput = document.getElementById('task-description');
    const taskObjectiveInput = document.getElementById('task-objective');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn:not(.edit-difficulty-btn)');

    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const taskCount = document.getElementById('task-count');
    const editModal = document.getElementById('edit-modal');
    const editTaskNameInput = document.getElementById('edit-task-name');
    const editTaskDescriptionInput = document.getElementById('edit-task-description');
    const editTaskObjectiveInput = document.getElementById('edit-task-objective');
    const editStartDateInput = document.getElementById('edit-start-date');
    const editEndDateInput = document.getElementById('edit-end-date');
    const editDifficultyBtns = document.querySelectorAll('.edit-difficulty-btn');

    const taskCreationTime = document.getElementById('task-creation-time');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Selected difficulty
    let selectedDifficulty = null;
    let editSelectedDifficulty = null;
    
    // Initialize date pickers
    flatpickr(startDateInput, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: true,
        placeholder: "Start date..."
    });
    
    flatpickr(endDateInput, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: true,
        placeholder: "End date..."
    });
    

    
    flatpickr(editStartDateInput, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: true,
        placeholder: "Start date..."
    });
    
    flatpickr(editEndDateInput, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: true,
        placeholder: "End date..."
    });
    

    
    // State variables
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let editingTaskId = null;
    
    // Initialize the app
    renderTasks();
    updateTaskCount();
    
    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    
    // Add event listeners for Enter key on input fields
    taskNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    taskDescriptionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    taskObjectiveInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    // Add event listeners for difficulty buttons
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove selected class from all buttons
            difficultyBtns.forEach(b => b.classList.remove('selected'));
            // Add selected class to clicked button
            this.classList.add('selected');
            // Update selected difficulty
            selectedDifficulty = this.getAttribute('data-difficulty');
        });
    });
    
    // Add event listeners for edit difficulty buttons
    editDifficultyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove selected class from all buttons
            editDifficultyBtns.forEach(b => b.classList.remove('selected'));
            // Add selected class to clicked button
            this.classList.add('selected');
            // Update selected difficulty
            editSelectedDifficulty = this.getAttribute('data-difficulty');
        });
    });
    
    taskList.addEventListener('click', handleTaskActions);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            setFilter(this.getAttribute('data-filter'));
        });
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    closeModalBtn.addEventListener('click', closeModal);
    saveEditBtn.addEventListener('click', saveEdit);
    
    // Functions
    function addTask() {
        const taskName = taskNameInput.value.trim();
        const taskDescription = taskDescriptionInput.value.trim();
        const taskObjective = taskObjectiveInput.value.trim();
        const startDate = startDateInput.value.trim();
        const endDate = endDateInput.value.trim();

        
        // Validate all fields
        if (!taskName) {
            showNotification('Please enter a task name');
            return;
        }
        
        if (!taskDescription) {
            showNotification('Please enter task description');
            return;
        }
        
        if (!taskObjective) {
            showNotification('Please enter task objective');
            return;
        }
        
        if (!startDate) {
            showNotification('Please enter start date');
            return;
        }
        
        if (!endDate) {
            showNotification('Please enter end date');
            return;
        }
        
        if (!selectedDifficulty) {
            showNotification('Please select task difficulty');
            return;
        }
        

        
        const newTask = {
            id: Date.now(),
            name: taskName,
            description: taskDescription,
            objective: taskObjective,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            difficulty: selectedDifficulty,
            completed: false,
            createdAt: new Date(),

        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        updateTaskCount();
        
        // Clear all input fields
        taskNameInput.value = '';
        taskDescriptionInput.value = '';
        taskObjectiveInput.value = '';
        startDateInput._flatpickr.clear();
        endDateInput._flatpickr.clear();

        
        // Reset difficulty buttons
        difficultyBtns.forEach(btn => btn.classList.remove('selected'));
        selectedDifficulty = null;
        
        // Add animation class to the new task
        setTimeout(() => {
            const newTaskElement = document.querySelector(`.task-item[data-id="${newTask.id}"]`);
            if (newTaskElement) {
                newTaskElement.classList.add('task-added');
            }
        }, 10);
    }
    
    // Function to show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    function handleTaskActions(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = parseInt(taskItem.getAttribute('data-id'));
        
        if (e.target.classList.contains('complete-btn') || e.target.closest('.complete-btn')) {
            toggleTaskStatus(taskId);
        } else if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            openEditModal(taskId);
        } else if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            deleteTask(taskId);
        }
    }
    
    function toggleTaskStatus(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks();
            updateTaskCount();
        }
    }
    
    function openEditModal(taskId) {
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            editingTaskId = taskId;
            
            // Set values for all fields
            editTaskNameInput.value = task.name;
            editTaskDescriptionInput.value = task.description;
            editTaskObjectiveInput.value = task.objective;
            
            // Set start and end dates if they exist
            if (task.startDate) {
                editStartDateInput._flatpickr.setDate(task.startDate);
            } else {
                editStartDateInput._flatpickr.clear();
            }
            
            if (task.endDate) {
                editEndDateInput._flatpickr.setDate(task.endDate);
            } else {
                editEndDateInput._flatpickr.clear();
            }
            
            // Set difficulty button
            editDifficultyBtns.forEach(btn => {
                if (btn.getAttribute('data-difficulty') === task.difficulty) {
                    btn.classList.add('selected');
                    editSelectedDifficulty = task.difficulty;
                } else {
                    btn.classList.remove('selected');
                }
            });
            

            
            // Display creation time
            const creationDate = new Date(task.createdAt);
            taskCreationTime.innerHTML = `<strong>Created:</strong> ${formatDate(creationDate)}`;
            
            editModal.style.display = 'block';
            editTaskNameInput.focus();
        }
    }
    
    function closeModal() {
        editModal.style.display = 'none';
    }
    
    function saveEdit() {
        const newName = editTaskNameInput.value.trim();
        const newDescription = editTaskDescriptionInput.value.trim();
        const newObjective = editTaskObjectiveInput.value.trim();
        const newStartDate = editStartDateInput.value.trim();
        const newEndDate = editEndDateInput.value.trim();

        
        // Validate all fields
        if (!newName) {
            showNotification('Please enter a task name');
            return;
        }
        
        if (!newDescription) {
            showNotification('Please enter task description');
            return;
        }
        
        if (!newObjective) {
            showNotification('Please enter task objective');
            return;
        }
        
        if (!newStartDate) {
            showNotification('Please enter start date');
            return;
        }
        
        if (!newEndDate) {
            showNotification('Please enter end date');
            return;
        }
        
        if (!editSelectedDifficulty) {
            showNotification('Please select task difficulty');
            return;
        }
        

        
        if (editingTaskId) {
            const taskIndex = tasks.findIndex(task => task.id === editingTaskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].name = newName;
                tasks[taskIndex].description = newDescription;
                tasks[taskIndex].objective = newObjective;
                tasks[taskIndex].startDate = new Date(newStartDate);
                tasks[taskIndex].endDate = new Date(newEndDate);
                tasks[taskIndex].difficulty = editSelectedDifficulty;

                saveTasks();
                renderTasks();
                closeModal();
                
                // Reset edit difficulty buttons
                editDifficultyBtns.forEach(btn => btn.classList.remove('selected'));
                editSelectedDifficulty = null;
            }
        }
    }
    
    function deleteTask(taskId) {
        const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('task-removed');
            
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== taskId);
                saveTasks();
                renderTasks();
                updateTaskCount();
            }, 300); // Match this with the CSS animation duration
        }
    }
    
    function clearCompleted() {
        const completedTaskElements = document.querySelectorAll('.task-item .task-text.completed');
        completedTaskElements.forEach(element => {
            const taskItem = element.closest('.task-item');
            if (taskItem) {
                taskItem.classList.add('task-removed');
            }
        });
        
        setTimeout(() => {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
            updateTaskCount();
        }, 300);
    }
    
    function setFilter(filter) {
        currentFilter = filter;
        filterBtns.forEach(btn => {
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        renderTasks();
    }
    
    function renderTasks() {
        taskList.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true; // 'all' filter
        });
        
        // Sort tasks by creation date
        filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            if (task.completed) {
                taskItem.classList.add('completed-task');
            }
            taskItem.setAttribute('data-id', task.id);
            

            
            // Format creation date
            const creationDate = new Date(task.createdAt);
            const formattedCreationDate = formatDate(creationDate);
            

            
            taskItem.innerHTML = `
                <div class="task-content">
                    <div class="task-header">
                        <span class="task-difficulty ${task.difficulty}">${task.difficulty}</span>
                    </div>
                    <div class="task-main-info">
                        <div class="task-name">${task.name}</div>
                        <div class="task-description">${task.description}</div>
                        <div class="task-objective">${task.objective}</div>
                    </div>
                    <div class="task-info">
                        <div class="task-time-remaining"><i class="fas fa-hourglass-half"></i> ${calculateTimeRemaining(task)}</div>
                    </div>
                    <div class="task-details">
                        <div class="task-created-at">
                            <i class="fas fa-clock"></i> ${formattedCreationDate}
                        </div>
                        <div class="task-start-date">
                            <i class="fas fa-play"></i> ${task.startDate ? formatDate(new Date(task.startDate)) : 'Not set'}
                        </div>
                        <div class="task-end-date">
                            <i class="fas fa-stop"></i> ${task.endDate ? formatDate(new Date(task.endDate)) : 'Not set'}
                        </div>

                    </div>
                </div>
                <div class="task-actions">
                    <button class="complete-btn" title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}"><i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i></button>
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            

            
            taskList.appendChild(taskItem);
        });
    }
    
    function updateTaskCount() {
        const activeCount = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Helper function to format dates
    function formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }
    

    
    // Helper function to calculate time remaining based on start and end dates
    function calculateTimeRemaining(task) {
        if (!task.startDate || !task.endDate) {
            return 'Duration not set';
        }
        
        const now = new Date();
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        
        // If task hasn't started yet
        if (now < start) {
            return 'Not started';
        }
        
        // If task is overdue
        if (now > end) {
            return 'Time exceeded';
        }
        
        // Calculate remaining time
        const diffMs = end - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffDays > 0) {
            return `${diffDays}d ${diffHours}h remaining`;
        } else if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m remaining`;
        } else {
            return diffMinutes > 0 ? `${diffMinutes}m remaining` : 'Less than 1m remaining';
        }
    }
});


