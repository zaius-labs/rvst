import type { Todo, TodoStore } from '$types';

/**
 * Creates a todo list state
 *
 * @returns {Object} - the todo list state
 */
export const createTodo = (): TodoStore => {
	let todos = $state<Todo[]>([]);

	/**
	 * Adds a todo item to the list
	 *
	 * @param {Todo} item - the item to add
	 */
	const add = (item: Todo): void => {
		todos = [...todos, item];
	};

	/**
	 * Removes a todo item from the list
	 *
	 * @param {string} id - the id of the item to remove
	 */
	const remove = (id: string): void => {
		todos = todos.filter((todo) => todo.id !== id);
	};

	/**
	 * Toggles the completion status of a todo item
	 *
	 * @param {string} id - the id of the item to toggle
	 */
	const toggle = (id: string): void => {
		todos = todos.map((todo) => {
			if (todo.id === id) {
				return { ...todo, completed: !todo.completed };
			}

			return todo;
		});
	};

	/**
	 * Computes the number of pending todos
	 */
	const pending = $derived(todos.filter((todo) => !todo.completed).length);

	/**
	 * Computes the number of completed todos
	 */
	const completed = $derived(todos.length - pending);

	return {
		get todos() {
			return todos;
		},
		get pending() {
			return pending;
		},
		get completed() {
			return completed;
		},
		add,
		toggle,
		remove
	};
};

export const todoStore = createTodo();
