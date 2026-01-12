/**
 * Main App Component
 * Root component with routing
 */

import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import ResumeManager from './pages/ResumeManager';
import JobSearch from './pages/JobSearch';
import Applications from './pages/Applications';
import Settings from './pages/Settings';

function App() {
  return (
    <div className="app">
      <Header />
      <div className="app-container">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/resumes" element={<ResumeManager />} />
            <Route path="/jobs" element={<JobSearch />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
