import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { ProjectInfo } from './pages/ProjectInfo';
import { Dashboard } from './pages/Dashboard';
import { Database } from './pages/Database';
import { Charts } from './pages/Charts';

function App() {
  const [currentPage, setCurrentPage] = useState(1);

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <ProjectInfo />;
      case 2:
        return <Dashboard />;
      case 3:
        return <Database />;
      case 4:
        return <Charts />;
      default:
        return <ProjectInfo />;
    }
  };

  // Sửa màu nền thành sáng để đồng bộ với Dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;