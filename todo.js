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
}
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
                todoList.appendChild(li);
            });
        });
}

// initial loading of todo list
window.addEventListener("load", (event) => {
    fetchTodos();
});