// Elemente aus dem DOM holen
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('task-list');

// Prioritäts-Button und Dropdown
const prioritySelectButton = document.getElementById('prioritySelectButton');
const priorityDropdown = document.getElementById('priorityDropdown');
let selectedPriority = 'low'; // Standardwert

const saveTasks = JSON.parse(localStorage.getItem('tasks')) || []; // Holen der gespeicherten Aufgaben

const clearTasksButton = document.getElementById('clearTasksButton');
const confirmDeleteOverlay = document.getElementById('confirmDeleteOverlay');
const confirmYesButton = document.getElementById('confirmYesButton');
const confirmNoButton = document.getElementById('confirmNoButton');

// Hilfsfunktion, um Aufgaben aus dem localStorage zu laden
function loadTasks() {
    if (saveTasks) {
        saveTasks.forEach(task => {
            const newTask = document.createElement('li');
            newTask.setAttribute('draggable', true); // Ermöglicht das Ziehen
            const taskSpan = document.createElement('span');
            taskSpan.textContent = task.text;

            if (task.completed) {
                taskSpan.classList.add('completed');
            }

            /* Priorität setzen */
            newTask.classList.add(`priority-${task.priority}-task`);
            newTask.appendChild(taskSpan);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.classList.add('delete-btn');
            newTask.appendChild(deleteButton);

            // Aufgabe als erledigt markieren oder zurücksetzen
            newTask.addEventListener('click', function (e) {
                if (e.target !== deleteButton) {
                    taskSpan.classList.toggle('completed');
                    updateLocalStorage(); // Lokale Speicherung nach Änderung
                }
            });

            // Löschen der Aufgabe
            deleteButton.addEventListener('click', function (e) {
                e.stopPropagation();
                newTask.remove();
                updateLocalStorage(); // Lokale Speicherung nach Aufgabe Löschen
            });

            // Drag-and-Drop Events
            newTask.addEventListener('dragstart', function (e) {
                e.target.classList.add('dragging');
            });

            newTask.addEventListener('dragend', function (e) {
                e.target.classList.remove('dragging');
                updateLocalStorage(); // Lokale Speicherung nach Änderung der Reihenfolge
            });

            taskList.appendChild(newTask);
        });
    }
}

// Hilfsfunktion, um Aufgaben im localStorage zu speichern
function updateLocalStorage() {
    const tasks = [];
    taskList.querySelectorAll('li').forEach(task => {
        tasks.push({
            text: task.querySelector('span').textContent,
            completed: task.querySelector('span').classList.contains('completed'),
            priority: Array.from(task.classList).find(cls => cls.startsWith('priority-')).split('-')[1]
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Event-Listener für den Hinzufüge-Button
addTaskButton.addEventListener('click', function () {
    const taskText = taskInput.value.trim();

    // Wenn das Eingabefeld nicht leer ist
    if (taskText) {
        const newTask = document.createElement('li');
        newTask.setAttribute('draggable', true); // Ermöglicht das Ziehen
        const taskSpan = document.createElement('span');
        taskSpan.textContent = taskText;

        /* Priorität hinzuzufügen */
        newTask.classList.add(`priority-${selectedPriority}-task`);

        newTask.appendChild(taskSpan);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Löschen';
        deleteButton.classList.add('delete-btn');
        newTask.appendChild(deleteButton);

        newTask.addEventListener('click', function (e) {
            if (e.target !== deleteButton) {
                taskSpan.classList.toggle('completed');
                updateLocalStorage();
            }
        });

        // Löschen der Aufgabe
        deleteButton.addEventListener('click', function (e) {
            e.stopPropagation();
            newTask.remove();
            updateLocalStorage();
        });

        taskList.appendChild(newTask);
        taskInput.value = '';
        updateLocalStorage();
    }
});

/* Prioritätauswahl über das Dropdown */
const priorityOptions = document.querySelectorAll('#priorityDropdown a');

/* Event-Listener für das Klicken auf eine Dropdown-Option */
priorityOptions.forEach(option => {
    option.addEventListener('click', function(e) {
        e.preventDefault(); 
        selectedPriority = option.getAttribute('data-priority'); /* Setzte die Priorität */
        prioritySelectButton.textContent = option.textContent; /* Aktuallisiere den Button-Text */

        /* Button-Farbe dynamisch anpassen */
        prioritySelectButton.classList.remove('priority-low', 'priority-medium', 'priority-high'); /* Entfernt alle Farben */
        prioritySelectButton.classList.add(`priority-${selectedPriority}`); /* Füge die neuen Farben hinzu */

        priorityDropdown.classList.add('hidden'); /* Verberge das Dropdown */
    });
});

/* Event-Listener für den 'Alles löschen Button' */
clearTasksButton.addEventListener('click', function() {
    confirmDeleteOverlay.classList.remove('hidden');
});

/* Wenn 'Ja' gedrückt wurde */
confirmYesButton.addEventListener('click', function() {
    taskList.innerHTML = ''; /* Alles löschen */
    updateLocalStorage();
    confirmDeleteOverlay.classList.add('hidden');
});

/* Wenn 'Nein' gedrückt wurde */
confirmNoButton.addEventListener('click', function() {
    confirmDeleteOverlay.classList.add('hidden');
});

/* Eingabe per Enter-Taste */
taskInput.addEventListener('keypress', function(e) {
    if(e.key === 'Enter') {
        addTaskButton.click(); /* Simuliere Klick auf den Hinzufüge-Button */
    }
});

// Initiale Aufgaben aus dem localStorage laden
window.addEventListener('load', loadTasks);

// Drag-and-Drop Logik
taskList.addEventListener('dragover', function (e) {
    e.preventDefault(); // Verhindert das Standardverhalten (z. B. ein Element wird nur hervorgehoben)
    const draggingTask = document.querySelector('.dragging');
    const closestTask = getClosestTask(e.clientY);
    
    if (closestTask && closestTask !== draggingTask) {
        taskList.insertBefore(draggingTask, closestTask);
    }
});

function getClosestTask(y) {
    const tasks = [...taskList.querySelectorAll('li:not(.dragging)')];
    return tasks.reduce((closest, task) => {
        const box = task.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: task };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
