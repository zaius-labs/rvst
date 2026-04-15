import { command } from '@rvst/api';

export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export const getTodos = command<{}, Todo[]>();
export const addTodo = command<{ text: string }, Todo>();
export const toggleTodo = command<{ id: number }, Todo>();
