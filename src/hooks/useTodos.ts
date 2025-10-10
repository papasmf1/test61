import { useState, useEffect } from 'react';
import type { Todo, FilterType } from '../types/todo';
import { storageService } from '../services/storageService';
import { isValidTodoText } from '../utils/validation';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const loadedTodos = storageService.getTodos();
    setTodos(loadedTodos);
  }, []);

  // 할 일 추가
  const addTodo = (text: string): boolean => {
    if (!isValidTodoText(text)) {
      return false;
    }

    const newTodo = storageService.addTodo(text);
    setTodos((prev) => [newTodo, ...prev]);
    return true;
  };

  // 할 일 수정
  const updateTodo = (id: string, text: string): boolean => {
    if (!isValidTodoText(text)) {
      return false;
    }

    const updatedTodo = storageService.updateTodo(id, { text: text.trim() });
    if (updatedTodo) {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
      return true;
    }
    return false;
  };

  // 할 일 삭제
  const deleteTodo = (id: string): void => {
    storageService.deleteTodo(id);
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // 완료 상태 토글
  const toggleTodo = (id: string): void => {
    const updatedTodo = storageService.toggleTodo(id);
    if (updatedTodo) {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
    }
  };

  // 완료된 항목 일괄 삭제
  const clearCompleted = (): void => {
    storageService.clearCompleted();
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  // 필터링된 할 일 목록
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; // 'all'
  });

  // 통계
  const stats = {
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  return {
    todos: filteredTodos,
    filter,
    stats,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    setFilter,
  };
};

