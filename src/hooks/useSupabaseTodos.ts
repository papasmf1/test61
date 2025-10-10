import { useState, useEffect } from 'react';
import type { Todo, FilterType } from '../types/todo';
import { supabaseStorageService } from '../services/supabaseStorageService';
import { isValidTodoText } from '../utils/validation';

export const useSupabaseTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 Supabase에서 데이터 로드
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setIsLoading(true);
    const loadedTodos = await supabaseStorageService.getTodos();
    setTodos(loadedTodos);
    setIsLoading(false);
  };

  // 할 일 추가
  const addTodo = async (text: string): Promise<boolean> => {
    if (!isValidTodoText(text)) {
      return false;
    }

    const newTodo = await supabaseStorageService.addTodo(text);
    if (newTodo) {
      setTodos((prev) => [newTodo, ...prev]);
      return true;
    }
    return false;
  };

  // 할 일 수정
  const updateTodo = async (id: string, text: string): Promise<boolean> => {
    if (!isValidTodoText(text)) {
      return false;
    }

    const updatedTodo = await supabaseStorageService.updateTodo(id, {
      text: text.trim(),
    });
    
    if (updatedTodo) {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
      return true;
    }
    return false;
  };

  // 할 일 삭제
  const deleteTodo = async (id: string): Promise<void> => {
    const success = await supabaseStorageService.deleteTodo(id);
    if (success) {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }
  };

  // 완료 상태 토글
  const toggleTodo = async (id: string): Promise<void> => {
    const updatedTodo = await supabaseStorageService.toggleTodo(id);
    if (updatedTodo) {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
    }
  };

  // 완료된 항목 일괄 삭제
  const clearCompleted = async (): Promise<void> => {
    const success = await supabaseStorageService.clearCompleted();
    if (success) {
      setTodos((prev) => prev.filter((todo) => !todo.completed));
    }
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
    isLoading,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    setFilter,
    reload: loadTodos,
  };
};

