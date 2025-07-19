document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector("#todo");
  if (!list) return;

const saved = localStorage.getItem("todos");

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
      localStorage.setItem("todos", JSON.stringify(data.todos));
      data.todos.forEach(todo => addToDo(todo));
    })
    .catch(error => console.error(error));
}



function addToDo(data, columnId = "todo") {
  const newItem = document.createElement("p");
  newItem.textContent = data.todo;
  newItem.draggable = true;

  // Drag events
  newItem.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", newItem.textContent);
    e.dataTransfer.effectAllowed = "move";
    newItem.classList.add("dragging");
  });
  newItem.addEventListener("dragend", () => {
    newItem.classList.remove("dragging");
  });

  // Append to the correct column
  const column = document.getElementById(columnId);
  if (column) column.appendChild(newItem);
}


// Make columns droppable
["todo", "inProgress", "done"].forEach(id => {
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

      // Add the correct class based on the column
      if (id === "todo") {
        newItem.classList.add("to_do");
      } else if (id === "inProcess") {
        newItem.classList.add("in_process");
      } else if (id === "done") {
        newItem.classList.add("do_ne");
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