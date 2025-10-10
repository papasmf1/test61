import React from 'react';
import { Header } from './components/Header';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { useSupabaseTodos } from './hooks/useSupabaseTodos';
import './App.css';

const App: React.FC = () => {
  const {
    todos,
    filter,
    stats,
    isLoading,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    setFilter,
  } = useSupabaseTodos();

  if (isLoading) {
    return (
      <div className="app">
        <div className="container">
          <Header />
          <div className="loading">
            <p>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <Header />
        <TodoInput onAdd={addTodo} />
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onUpdate={updateTodo}
        />
        {stats.total > 0 && (
          <TodoFilter
            currentFilter={filter}
            onFilterChange={setFilter}
            stats={stats}
            onClearCompleted={clearCompleted}
          />
        )}
      </div>
    </div>
  );
};

export default App;
