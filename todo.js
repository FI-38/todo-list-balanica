console.log("todo.js loaded");

const apiUrl = 'todo-api.php';
const messageDiv = document.getElementById('message');

const showMessage = (message) => {
    // Show error message
    messageDiv.textContent = message;
    messageDiv.style.visibility = 'visible';

    // Hide message after 3 seconds
    setTimeout(() => {
        messageDiv.style.visibility = 'hidden';
    }, 3000);
};

document.getElementById('todoForm').addEventListener('submit', function (e) {

    e.preventDefault();

    const todoInput = document.getElementById('todoInput').value;

    // Input validation: check if todo is empty or only whitespace
    if (!todoInput || todoInput.trim() === '') {
        showMessage('Bitte geben Sie einen Namen für das TODO an! (Client-Validierung)');

        // Stop execution if validation fails
        return;
    }

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ todo: todoInput }),
    })
    .then(response => response.json())
    .then((data) => {
        // Handle backend validation errors
        if (data.status === 'error') {
            showMessage(data.message);
        } else {
            fetchTodos();
            document.getElementById('todoInput').value = '';
        }
    });
});
const getCompleteButton = (item) => {
    const completeButton = document.createElement('button');
    completeButton.textContent = item.completed ? 'Unvollständig' : 'Abgeschlossen';

    // Handle complete button click
    completeButton.addEventListener('click', function() {
        fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: item.id, completed: !item.completed })
        })
        .then(response => response.json())
        .then(() => {
            fetchTodos(); // Reload todo list
        }); 

    });
    // Return the complete button so it can be appended to the DOM
    return completeButton;
};
const getEditButton = (item) => {
    const editButton = document.createElement('button');
    editButton.textContent = 'Bearbeiten';

    // Cuando se hace clic, mostrar el formulario oculto con los datos del Todo
    editButton.addEventListener('click', () => {
        document.getElementById('todo-update-form').style.display = 'block';
        document.getElementById('todo-id').value = item.id;
        document.getElementById('todo-update-input').value = item.title;
    });

    return editButton;
};

const getDeleteButton = (item) => {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Löschen';
 
    // Handle delete button click
    deleteButton.addEventListener('click', function() {
        fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: item.id })
        })
        .then(response => response.json())
        .then(() => {
            fetchTodos(); // Reload todo list
        });
    });
 
    return deleteButton;
};
// fetch all todos and present it in a HTML list
function fetchTodos() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(todos => {
            const todoList = document.getElementById('todoList');
            todoList.innerHTML = '';
            todos.forEach(todo => {
                const li = document.createElement('li');
                li.textContent = todo.title;
                li.appendChild(getDeleteButton(todo));
                li.appendChild(getCompleteButton(todo));
                li.appendChild(getEditButton(todo));

                todoList.appendChild(li);
            });
        });
}
// Formular für das Bearbeiten von Todos
document.getElementById('todo-update-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const id = document.getElementById('todo-id').value;
    const title = document.getElementById('todo-update-input').value;

    // Validar que el nuevo título no esté vacío
    if (!title || title.trim() === '') {
        showMessage('Bitte geben Sie einen neuen Titel ein!');
        return;
    }

    fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title })
    })
    .then(response => response.json())
    .then(() => {
        fetchTodos(); // recargar lista
        document.getElementById('todo-update-form').style.display = 'none';
    });
});

// initial loading of todo list
window.addEventListener("load", (event) => {
    fetchTodos();
});