import React from 'react';
import type { Todo } from '../types/todo';
import { TodoItem } from './TodoItem';
import '../styles/TodoList.css';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, text: string) => Promise<boolean>;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggle,
  onDelete,
  onUpdate,
}) => {
  if (todos.length === 0) {
    return (
      <div className="todo-list-empty">
        <p className="empty-message">할 일이 없습니다</p>
        <p className="empty-hint">위에서 새로운 할 일을 추가해보세요!</p>
      </div>
    );
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
};

