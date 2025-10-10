import { supabase } from '../lib/supabase';
import type { Todo } from '../types/todo';

interface SupabaseTodo {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

class SupabaseStorageService {
  /**
   * 모든 할 일 가져오기
   */
  async getTodos(): Promise<Todo[]> {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching todos:', error);
        return [];
      }

      // Supabase 데이터를 앱의 Todo 타입으로 변환
      return ((data as SupabaseTodo[]) || []).map((item) => ({
        id: item.id,
        text: item.text,
        completed: item.completed,
        createdAt: new Date(item.created_at).getTime(),
        updatedAt: new Date(item.updated_at).getTime(),
      }));
    } catch (error) {
      console.error('Error in getTodos:', error);
      return [];
    }
  }

  /**
   * 새로운 할 일 추가
   */
  async addTodo(text: string): Promise<Todo | null> {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          text: text.trim(),
          completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding todo:', error);
        return null;
      }

      const todo = data as SupabaseTodo;
      return {
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        createdAt: new Date(todo.created_at).getTime(),
        updatedAt: new Date(todo.updated_at).getTime(),
      };
    } catch (error) {
      console.error('Error in addTodo:', error);
      return null;
    }
  }

  /**
   * 할 일 수정
   */
  async updateTodo(
    id: string,
    updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Todo | null> {
    try {
      const updateData: any = {};
      if (updates.text !== undefined) updateData.text = updates.text;
      if (updates.completed !== undefined) updateData.completed = updates.completed;

      const { data, error } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating todo:', error);
        return null;
      }

      const todo = data as SupabaseTodo;
      return {
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        createdAt: new Date(todo.created_at).getTime(),
        updatedAt: new Date(todo.updated_at).getTime(),
      };
    } catch (error) {
      console.error('Error in updateTodo:', error);
      return null;
    }
  }

  /**
   * 할 일 삭제
   */
  async deleteTodo(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);

      if (error) {
        console.error('Error deleting todo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteTodo:', error);
      return false;
    }
  }

  /**
   * 완료 상태 토글
   */
  async toggleTodo(id: string): Promise<Todo | null> {
    try {
      // 먼저 현재 상태를 가져옴
      const { data: current, error: fetchError } = await supabase
        .from('todos')
        .select('completed')
        .eq('id', id)
        .single();

      if (fetchError || !current) {
        console.error('Error fetching todo:', fetchError);
        return null;
      }

      const todo = current as SupabaseTodo;
      // 상태를 토글
      return await this.updateTodo(id, { completed: !todo.completed });
    } catch (error) {
      console.error('Error in toggleTodo:', error);
      return null;
    }
  }

  /**
   * 모든 할 일 삭제
   */
  async clearTodos(): Promise<boolean> {
    try {
      const { error } = await supabase.from('todos').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.error('Error clearing todos:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearTodos:', error);
      return false;
    }
  }

  /**
   * 완료된 할 일만 삭제
   */
  async clearCompleted(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('completed', true);

      if (error) {
        console.error('Error clearing completed todos:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearCompleted:', error);
      return false;
    }
  }
}

export const supabaseStorageService = new SupabaseStorageService();

