/**
 * Header Component
 * Top navigation bar
 */

import { Link } from 'react-router-dom';
import './Header.css';

export const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <h1>🎯 Job Hunt AI</h1>
        </div>
        <nav className="header-nav">
          <span className="badge badge-primary">Beta</span>
        </nav>
      </div>
    </header>
  );
}
