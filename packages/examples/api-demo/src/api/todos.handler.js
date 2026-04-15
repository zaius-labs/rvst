// In-memory todo store — JS handler, runs in QuickJS
const todos = [];
let nextId = 1;

export function getTodos() {
  return [...todos];
}

export function addTodo({ text }) {
  const todo = { id: nextId++, text, done: false };
  todos.push(todo);
  return todo;
}

export function toggleTodo({ id }) {
  const todo = todos.find(t => t.id === id);
  if (todo) todo.done = !todo.done;
  return todo;
}
