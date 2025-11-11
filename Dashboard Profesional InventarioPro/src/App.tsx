import { useState } from 'react';
import { Toaster, toast } from 'sonner@2.0.3';
import { AppSidebar } from './components/AppSidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './components/Dashboard';
import { Productos } from './components/Productos';
import { Movimientos } from './components/Movimientos';
import { Reportes } from './components/Reportes';
import { Configuracion } from './components/Configuracion';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [navigationFilter, setNavigationFilter] = useState<any>(null);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setNavigationFilter(null);
  };

  const handleNavigate = (section: string, filter?: any) => {
    setActiveSection(section);
    setNavigationFilter(filter || null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveSection('dashboard');
    toast.success('Sesión cerrada correctamente');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    toast.success('Bienvenido a InventarioPro');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'productos':
        return <Productos filter={navigationFilter} onNavigate={handleNavigate} />;
      case 'movimientos':
        return <Movimientos filter={navigationFilter} />;
      case 'reportes':
        return <Reportes filter={navigationFilter} />;
      case 'configuracion':
        return <Configuracion section={navigationFilter?.section} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <>
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: '#0B132B' }}
      >
        {/* Sidebar */}
        <AppSidebar 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <Topbar
            onOpenNotifications={() => setShowNotifications(true)}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            {renderContent()}
          </div>
        </div>

        {/* Notifications Drawer */}
        <NotificationDrawer
          open={showNotifications}
          onClose={() => setShowNotifications(false)}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1C2541',
            border: '1px solid rgba(58, 134, 255, 0.3)',
            color: '#E0E0E0'
          }
        }}
      />
    </>
  );
}
