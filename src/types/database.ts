export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string;
          text: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          text: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          text?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
    };
  };
}

