import { Bell } from 'lucide-react';
import { UserMenu } from './UserMenu';

interface TopbarProps {
  onOpenNotifications: () => void;
  onNavigate: (section: string, options?: any) => void;
  onLogout: () => void;
}

export function Topbar({ onOpenNotifications, onNavigate, onLogout }: TopbarProps) {
  return (
    <div 
      className="h-16 border-b flex items-center justify-between px-8"
      style={{ 
        background: '#1C2541',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-6">
        <h1 style={{ color: '#E0E0E0', fontSize: '1.25rem' }}>Panel de Control</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button 
          onClick={onOpenNotifications}
          className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
          style={{ 
            background: 'rgba(58, 134, 255, 0.1)',
            color: '#A8A8A8'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(58, 134, 255, 0.2)';
            e.currentTarget.style.color = '#4CC9F0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(58, 134, 255, 0.1)';
            e.currentTarget.style.color = '#A8A8A8';
          }}
        >
          <Bell className="w-5 h-5" />
          <span 
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: '#F87171' }}
          />
        </button>

        {/* User Profile Menu */}
        <UserMenu
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
}
