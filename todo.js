console.log("todo.js loaded");

// (1) / (2) – versión que usa todo-api.php
document.getElementById('todoForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const todoInput = document.getElementById('todoInput').value.trim();
  if (!todoInput) return;

  fetch('todo-api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ todo: todoInput }),
  })
    .then(r => r.json())
    .then((data) => {
      console.log('POST result:', data);
      document.getElementById('todoInput').value = '';
      fetchTodos(); // refrescar lista tras crear
    })
    .catch(err => console.error(err));
});

// (3) – leer todos y pintarlos como <li>
function fetchTodos() {
  fetch('todo-api.php') // GET por defecto
    .then(response => response.json())
    .then(todos => {
      const todoList = document.getElementById('todoList');
      todoList.innerHTML = '';
      todos.forEach((text, index) => {
        const li = document.createElement('li');

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = text;

        const editBtn = document.createElement('button');
        editBtn.className = 'small';
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', () => {
          const neu = prompt('Nuevo texto:', text);
          if (neu !== null) updateTodo(index, neu.trim());
        });

        const delBtn = document.createElement('button');
        delBtn.className = 'small';
        delBtn.textContent = 'Borrar';
        delBtn.addEventListener('click', () => {
          if (confirm('¿Eliminar este TODO?')) deleteTodo(index);
        });

        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(delBtn);
        todoList.appendChild(li);
      });
    })
    .catch(err => console.error(err));
}

// PUT – actualizar un TODO por índice
function updateTodo(index, newText) {
  if (!newText) return;
  fetch('todo-api.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index, todo: newText }),
  })
    .then(r => r.json())
    .then(data => {
      console.log('PUT result:', data);
      fetchTodos();
    })
    .catch(err => console.error(err));
}

// DELETE – borrar un TODO por índice
function deleteTodo(index) {
  fetch('todo-api.php', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index }),
  })
    .then(r => r.json())
    .then(data => {
      console.log('DELETE result:', data);
      fetchTodos();
    })
    .catch(err => console.error(err));
}

// (4) – carga inicial
window.addEventListener('load', () => fetchTodos());
