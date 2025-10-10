import React, { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { Todo } from '../types/todo';
import '../styles/TodoItem.css';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, text: string) => Promise<boolean>;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditText(todo.text);
  };

  const handleSave = async () => {
    if (editText.trim() && !isUpdating) {
      setIsUpdating(true);
      const success = await onUpdate(todo.id, editText);
      setIsUpdating(false);
      if (success) {
        setIsEditing(false);
      }
    } else {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-item-content">
        <input
          type="checkbox"
          className="todo-checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label={`${todo.text} 완료 표시`}
        />
        
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="todo-edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            maxLength={500}
          />
        ) : (
          <span
            className="todo-text"
            onDoubleClick={handleDoubleClick}
            title="더블클릭하여 수정"
          >
            {todo.text}
          </span>
        )}
      </div>

      <button
        className="todo-delete-button"
        onClick={() => onDelete(todo.id)}
        aria-label={`${todo.text} 삭제`}
      >
        ✕
      </button>
    </li>
  );
};

