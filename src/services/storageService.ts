import type { Todo } from '../types/todo';
import { generateId } from '../utils/generateId';

const STORAGE_KEY = 'todolist_data';
const STORAGE_VERSION = 'v1';

interface StorageData {
  version: string;
  lastModified: number;
  todos: Todo[];
}

class StorageService {
  /**
   * 로컬 스토리지에서 모든 할 일 가져오기
   */
  getTodos(): Todo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }

      const parsed: StorageData = JSON.parse(data);
      
      // 버전 확인 및 데이터 검증
      if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.todos)) {
        console.warn('Invalid storage data, resetting...');
        return [];
      }

      return parsed.todos;
    } catch (error) {
      console.error('Error loading todos from storage:', error);
      return [];
    }
  }

  /**
   * 로컬 스토리지에 할 일 저장
   */
  private saveTodos(todos: Todo[]): void {
    try {
      const data: StorageData = {
        version: STORAGE_VERSION,
        lastModified: Date.now(),
        todos,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving todos to storage:', error);
      // 용량 초과 에러 처리
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        alert('저장 공간이 부족합니다. 일부 할 일을 삭제해주세요.');
      }
    }
  }

  /**
   * 새로운 할 일 추가
   */
  addTodo(text: string): Todo {
    const todos = this.getTodos();
    const newTodo: Todo = {
      id: generateId(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedTodos = [newTodo, ...todos];
    this.saveTodos(updatedTodos);
    return newTodo;
  }

  /**
   * 할 일 수정
   */
  updateTodo(id: string, updates: Partial<Todo>): Todo | null {
    const todos = this.getTodos();
    const index = todos.findIndex((todo) => todo.id === id);

    if (index === -1) {
      return null;
    }

    const updatedTodo: Todo = {
      ...todos[index],
      ...updates,
      updatedAt: Date.now(),
    };

    todos[index] = updatedTodo;
    this.saveTodos(todos);
    return updatedTodo;
  }

  /**
   * 할 일 삭제
   */
  deleteTodo(id: string): void {
    const todos = this.getTodos();
    const filteredTodos = todos.filter((todo) => todo.id !== id);
    this.saveTodos(filteredTodos);
  }

  /**
   * 완료 상태 토글
   */
  toggleTodo(id: string): Todo | null {
    const todos = this.getTodos();
    const todo = todos.find((t) => t.id === id);

    if (!todo) {
      return null;
    }

    return this.updateTodo(id, { completed: !todo.completed });
  }

  /**
   * 모든 할 일 삭제
   */
  clearTodos(): void {
    this.saveTodos([]);
  }

  /**
   * 완료된 할 일만 삭제
   */
  clearCompleted(): void {
    const todos = this.getTodos();
    const activeTodos = todos.filter((todo) => !todo.completed);
    this.saveTodos(activeTodos);
  }
}

export const storageService = new StorageService();

