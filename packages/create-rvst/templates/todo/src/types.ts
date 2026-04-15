export interface Todo {
	text: string;
	id: string;
	completed: boolean;
	created_at: Date;
	updated_at: Date;
}

export interface TodoStore {
	get todos(): Todo[];
	get pending(): number;
	get completed(): number;
	add: (item: Todo) => void;
	toggle: (id: string) => void;
	remove: (id: string) => void;
}
