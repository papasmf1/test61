import React from 'react';
import '../styles/Header.css';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <h1 className="header-title">할 일 목록</h1>
      <p className="header-subtitle">오늘 해야 할 일들을 관리하세요</p>
    </header>
  );
};

