document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector("#todo");
  if (!list) return;

const saved = localStorage.getItem("todos");
let draggedId = null; 

if (saved) {
  const todos = JSON.parse(saved);
  todos.forEach(todo => addToDo(todo));
} else {
  fetch("https://dummyjson.com/todos")
    .then(response => {
      if (!response.ok) throw new Error("Could not fetch resource");
      return response.json();
    })
    .then(data => {
      const todos = data.todos.map(todo => ({ id: todo.id, text: todo.todo, status: 'todo' }));

      localStorage.setItem("todos", JSON.stringify(todos));
      todos.forEach(todo => addToDo(todo));
    })
    .catch(error => console.error(error));
}

function addToDo(data) {
  const newItem = document.createElement("p");
  newItem.textContent = data.text;
  newItem.draggable = true;

  // Drag events
  newItem.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", newItem.textContent);
    e.dataTransfer.effectAllowed = "move";
    newItem.classList.add("dragging");
    draggedId = data.id;
  });
  newItem.addEventListener("dragend", () => {
    newItem.classList.remove("dragging");
  });

  // Append to the correct column
  const column = document.getElementById(data.status);
  if (column) column.appendChild(newItem);
}

const updateTodoStatus = (id, status) => {
  const savedTodos = localStorage.getItem("todos");

  if (savedTodos) {
    const todos = JSON.parse(savedTodos);
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, status: status }
      } else {
        return todo;
      }
    });

    console.log(updatedTodos);

    localStorage.setItem('todos', JSON.stringify(updatedTodos));
  }
}

// Make columns droppable
["todo", "in_progress", "done"].forEach(id => {
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

      // Remove all possible classes
      newItem.classList.remove("to_do", "in_progress", "do_ne");

      console.log(draggedId);
      if (id === "todo") {
        newItem.classList.add("to_do");
        updateTodoStatus(draggedId, 'todo');
      } else if (id === "in_progress") {
        newItem.classList.add("in_progress");
        updateTodoStatus(draggedId, 'in_progress');
      } else if (id === "done") {
        newItem.classList.add("do_ne");
        updateTodoStatus(draggedId, 'done');
      }

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
});

});