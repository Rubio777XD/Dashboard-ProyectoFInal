import { User, Settings, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ChevronDown } from 'lucide-react';

interface UserMenuProps {
  onNavigate: (section: string, options?: any) => void;
  onLogout: () => void;
}

export function UserMenu({ onNavigate, onLogout }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 transition-all duration-200 rounded-lg px-3 py-2 hover:bg-white/5">
          <Avatar className="w-9 h-9">
            <AvatarFallback 
              style={{ 
                background: 'linear-gradient(135deg, #3A86FF 0%, #4CC9F0 100%)',
                color: '#FFFFFF'
              }}
            >
              IR
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col text-left">
            <span style={{ color: '#E0E0E0', fontSize: '0.875rem' }}>
              Isaac Rubio
            </span>
            <span style={{ color: '#A8A8A8', fontSize: '0.75rem' }}>
              Administrador
            </span>
          </div>
          
          <ChevronDown className="w-4 h-4" style={{ color: '#A8A8A8' }} />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end"
        className="w-56"
        style={{
          background: '#1C2541',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#E0E0E0',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
        }}
      >
        <DropdownMenuItem
          onClick={() => onNavigate('dashboard')}
          className="cursor-pointer"
          style={{
            color: '#E0E0E0',
            padding: '0.75rem 1rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(58, 134, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <User className="w-4 h-4 mr-2" style={{ color: '#3A86FF' }} />
          Ver dashboard
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onNavigate('reportes')}
          className="cursor-pointer"
          style={{
            color: '#E0E0E0',
            padding: '0.75rem 1rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(58, 134, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Settings className="w-4 h-4 mr-2" style={{ color: '#4CC9F0' }} />
          Reportes
        </DropdownMenuItem>

        <DropdownMenuSeparator style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
        
        <DropdownMenuItem 
          onClick={onLogout}
          className="cursor-pointer"
          style={{
            color: '#F87171',
            padding: '0.75rem 1rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
