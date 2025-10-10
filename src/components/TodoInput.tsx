import React, { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import '../styles/TodoInput.css';

interface TodoInputProps {
  onAdd: (text: string) => Promise<boolean>;
}

export const TodoInput: React.FC<TodoInputProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (text.trim() && !isSubmitting) {
      setIsSubmitting(true);
      const success = await onAdd(text);
      if (success) {
        setText('');
      }
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form className="todo-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="todo-input"
        placeholder="새로운 할 일을 입력하세요..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={500}
        autoFocus
      />
      <button type="submit" className="todo-add-button" disabled={isSubmitting}>
        {isSubmitting ? '추가 중...' : '추가'}
      </button>
    </form>
  );
};

