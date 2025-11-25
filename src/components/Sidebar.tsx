import { Home, LogOut, Settings, User, Building2, Brain, Award } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-muted/30">
      {/* Header */}
      <div className="flex-shrink-0 p-6">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
      </div>

      <Separator />

      {/* User Info */}
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-sm border">
          <Avatar>
            <AvatarFallback className="bg-blue-500 text-white">
              {user ? getInitials(user.username) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate font-semibold text-sm">{user?.username}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            <span className="inline-block mt-1 rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-300">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto space-y-1 p-4">
        <Button
          variant={isActive("/dashboard") ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => navigate("/dashboard")}
        >
          <Home size={20} />
          Dashboard
        </Button>
        {user?.role === "HR" && (
          <>
            <Button
              variant={isActive("/departemen") ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => navigate("/departemen")}
            >
              <Building2 size={20} />
              Departemen
            </Button>

            <Button
              variant={isActive("/jabatan") ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => navigate("/jabatan")}
            >
              <Building2 size={20} />
              Jabatan
            </Button>

            <Button
              variant={isActive("/karyawan") ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => navigate("/karyawan")}
            >
              <User size={20} />
              Karyawan
            </Button>

            <Button
              variant={isActive("/kpi") ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => navigate("/kpi")}
            >
              <Building2 size={20} />
              KPI
            </Button>

            <Button
              variant={isActive("/kpi-indicators") ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => navigate("/kpi-indicators")}
            >
              <Building2 size={20} />
              KPI Indicators
            </Button>
            
            <Button
              variant={isActive("/penghargaan") ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => navigate("/penghargaan")}
            >
              <Award size={20} />
              Penghargaan
            </Button>
            <Button
              variant={isActive("/pelatihan") ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => navigate("/pelatihan")}
            >
              <Award size={20} />
              Pelatihan
            </Button>
            
            <Button
              variant={isActive("/predict") ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => navigate("/predict")}
            >
              <Brain size={20} />
              Prediksi Promosi
            </Button>
          </>
        )}
        <Button
          variant={isActive("/profile") ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => navigate("/profile")}
        >
          <User size={20} />
          Profile
        </Button>
        <Button
          variant={isActive("/settings") ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => navigate("/settings")}
        >
          <Settings size={20} />
          Settings
        </Button>
      </nav>

      <Separator />

      {/* Logout */}
      <div className="flex-shrink-0 p-4">
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