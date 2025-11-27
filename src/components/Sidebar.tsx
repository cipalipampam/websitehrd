import React from "react";
import {
  Home,
  LogOut,
  Settings,
  User,
  Building2,
  Brain,
  Award,
  Layers,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Safely derive a display name from available user fields
  const getDisplayName = (): string => {
    if (!user) return "User";
    if (user.username && user.username.trim().length > 0) return user.username;
    if (user.email && user.email.includes("@")) return user.email.split("@")[0];
    return "User";
  };

  const getInitials = (name?: string) => {
    const value = (name ?? "User").trim();
    if (!value) return "U";
    return value
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path ||
      location.pathname.startsWith(path + "/") ||
      location.pathname.startsWith(path)
    );
  };

  const displayName = getDisplayName();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-muted/30">
      {/* Header with lucide-react icon as logo */}
      <div className="flex-shrink-0 p-6">
        <button
          onClick={() => navigate("/dashboard")}
          aria-label="Go to dashboard"
          className="flex items-center gap-3"
        >
          <Layers className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-foreground">HR Dashboard</span>
        </button>
      </div>

      <Separator />

      {/* User Info */}
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-sm border">
          <Avatar>
            <AvatarFallback className="bg-blue-500 text-white">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate font-semibold text-sm">{displayName}</p>
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
            {/* Master Data */}
            <div className="px-3 pt-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Master Data</p>
            </div>
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

            <Separator className="my-2" />

            {/* Performance */}
            <div className="px-3 pt-1">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Performance</p>
            </div>
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

            <Separator className="my-2" />

            {/* Machine Learning */}
            <div className="px-3 pt-1">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Machine Learning</p>
            </div>
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

        {/* Account Group */}
        <div className="px-3 pt-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Account</p>
        </div>
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

export default Sidebar;