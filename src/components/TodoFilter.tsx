import React from 'react';
import type { FilterType } from '../types/todo';
import '../styles/TodoFilter.css';

interface TodoFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  stats: {
    total: number;
    active: number;
    completed: number;
  };
  onClearCompleted: () => void;
}

export const TodoFilter: React.FC<TodoFilterProps> = ({
  currentFilter,
  onFilterChange,
  stats,
  onClearCompleted,
}) => {
  return (
    <div className="todo-filter">
      <div className="filter-stats">
        <span className="stats-text">
          남은 할 일: <strong>{stats.active}</strong>개
        </span>
      </div>

      <div className="filter-buttons">
        <button
          className={`filter-button ${currentFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          전체 ({stats.total})
        </button>
        <button
          className={`filter-button ${currentFilter === 'active' ? 'active' : ''}`}
          onClick={() => onFilterChange('active')}
        >
          진행중 ({stats.active})
        </button>
        <button
          className={`filter-button ${currentFilter === 'completed' ? 'active' : ''}`}
          onClick={() => onFilterChange('completed')}
        >
          완료 ({stats.completed})
        </button>
      </div>

      {stats.completed > 0 && (
        <button className="clear-completed-button" onClick={onClearCompleted}>
          완료된 항목 삭제
        </button>
      )}
    </div>
  );
};

