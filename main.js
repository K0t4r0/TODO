document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector("#todo");
  if (!list) return;

  const TODO_STATUSES = {
    TODO: 'todo',
    PROGRESS: 'in_progress',
    DONE: 'done',
  }
  const TODOS_STORAGE_KEY = 'todos';
  const API_URL = 'https://dummyjson.com/todos';
  let draggedTodoId = null; 

  const addToDo = (data) => {
    const newItem = document.createElement("p");
    newItem.textContent = data.text;
    newItem.draggable = true;

    // Drag events
    newItem.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", newItem.textContent);
      e.dataTransfer.effectAllowed = "move";
      newItem.classList.add("dragging");
      draggedTodoId = data.id;
    });
    newItem.addEventListener("dragend", () => {
      newItem.classList.remove("dragging");
    });

    // Append to the correct column
    const column = document.getElementById(data.status);
    if (column) column.appendChild(newItem);
  }

  const updateTodoStatus = (id, status) => {
    const savedTodos = localStorage.getItem(TODOS_STORAGE_KEY);

    if (savedTodos) {
      const todos = JSON.parse(savedTodos);
      const updatedTodos = todos.map(todo => {
        if (todo.id === id) {
          return { ...todo, status: status }
        } else {
          return todo;
        }
      });

      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updatedTodos));
    }
  }

  const makeColumnDroppable = (id) => {
    const col = document.getElementById(id);
    if (col) {
      col.addEventListener("dragover", (e) => {
        e.preventDefault();
      });
      col.addEventListener("drop", (e) => {
        e.preventDefault();
        const text = e.dataTransfer.getData("text/plain");
        const newItem = document.createElement("p");
        newItem.textContent = text;
        newItem.draggable = true;

        updateTodoStatus(draggedTodoId, id)

        // Add drag events again
        newItem.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", newItem.textContent);
          e.dataTransfer.effectAllowed = "move";
          newItem.classList.add("dragging");
        });
        newItem.addEventListener("dragend", () => {
          newItem.classList.remove("dragging");
        });

        col.appendChild(newItem);

        // Remove the original item from its old column
        const dragging = document.querySelector(".dragging");
        if (dragging) dragging.remove();
      });
    }
  }

  const saved = localStorage.getItem(TODOS_STORAGE_KEY);
  if (saved) {
    const todos = JSON.parse(saved);
    todos.forEach(todo => addToDo(todo));
  } else {
    fetch(API_URL)
      .then(response => {
        if (!response.ok) throw new Error("Could not fetch resource");
        return response.json();
      })
      .then(data => {
        const todos = data.todos.map(todo => ({ id: todo.id, text: todo.todo, status: TODO_STATUSES.TODO }));

        localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
        todos.forEach(todo => addToDo(todo));
      })
      .catch(error => console.error(error));
  }

  Object.values(TODO_STATUSES).forEach(id => {
    makeColumnDroppable(id);
  });
});