import { useState } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';

/**
 * Page layout wrapper with Header and Sidebar
 * Handles mobile sidebar toggle
 */
function PageLayout({
  children,
  user,
  draftsCount = 0,
  onHelpClick,
  className = ''
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-slate-900 ${className}`}>
      <Header
        user={user}
        showMenuButton
        onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onHelpClick={onHelpClick}
      />
      <Sidebar
        user={user}
        draftsCount={draftsCount}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <main className="pt-14 h-screen overflow-hidden flex flex-col ml-0 md:ml-16">
        {children}
      </main>
    </div>
  );
}

export default PageLayout;
