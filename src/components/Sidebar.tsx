import { Home, LogOut, Settings, User, Building2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50">
      {/* Header */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      </div>

      <Separator />

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
          <Avatar>
            <AvatarFallback className="bg-blue-500 text-white">
              {user ? getInitials(user.username) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate font-semibold text-sm">{user?.username}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <Button
          variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-3"
          onClick={() => navigate('/dashboard')}
        >
          <Home size={20} />
          Dashboard
        </Button>
        {user?.role === 'HR' && (
          <Button
            variant={isActive('/departemen') ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3"
            onClick={() => navigate('/departemen')}
          >
            <Building2 size={20} />
            Departemen
          </Button>
        )}
        <Button
          variant={isActive('/profile') ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-3"
          onClick={() => navigate('/profile')}
        >
          <User size={20} />
          Profile
        </Button>
        <Button
          variant={isActive('/settings') ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-3"
          onClick={() => navigate('/settings')}
        >
          <Settings size={20} />
          Settings
        </Button>
      </nav>

      <Separator />

      {/* Logout */}
      <div className="p-4">
        <Button
          variant="destructive"
          className="w-full gap-3"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Logout
        </Button>
      </div>
    </div>
  );
};