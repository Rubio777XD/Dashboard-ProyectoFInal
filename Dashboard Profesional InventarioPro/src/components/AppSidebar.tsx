import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'movimientos', label: 'Movimientos', icon: ArrowLeftRight },
    { id: 'reportes', label: 'Reportes', icon: FileText },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <div 
      className="h-screen w-64 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #1C2541 0%, #0F1729 100%)' }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)',
              boxShadow: '0 0 20px rgba(58, 134, 255, 0.4)'
            }}
          >
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <div 
              className="tracking-tight"
              style={{ 
                color: '#E0E0E0',
                fontSize: '1.25rem',
                fontWeight: 600
              }}
            >
              InventarioPro
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
              style={{
                background: isActive 
                  ? 'linear-gradient(90deg, rgba(58, 134, 255, 0.2) 0%, rgba(76, 201, 240, 0.1) 100%)'
                  : 'transparent',
                borderLeft: isActive ? '3px solid #3A86FF' : '3px solid transparent',
                color: isActive ? '#4CC9F0' : '#A8A8A8',
                boxShadow: isActive ? '0 4px 12px rgba(58, 134, 255, 0.2)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(58, 134, 255, 0.05)';
                  e.currentTarget.style.color = '#E0E0E0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#A8A8A8';
                }
              }}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div 
          className="px-4 py-2 rounded-lg text-center"
          style={{ 
            background: 'rgba(58, 134, 255, 0.1)',
            color: '#A8A8A8',
            fontSize: '0.75rem'
          }}
        >
          Versión 1.0
        </div>
        
        <button 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
          style={{ color: '#F87171' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}