import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Lock, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { authAPI } from '@/services/api';
import { useTheme } from '@/hooks/use-theme';

export const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous alerts and errors
    setAlert(null);
    setFieldErrors({});
    
    const errors: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {};
    
    // Client-side validation
    if (!currentPassword) {
      errors.currentPassword = 'Password saat ini harus diisi';
    }

    if (!newPassword) {
      errors.newPassword = 'Password baru harus diisi';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password baru minimal 6 karakter';
    } else if (currentPassword && currentPassword === newPassword) {
      errors.newPassword = 'Password baru tidak boleh sama dengan password saat ini';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (newPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak sesuai dengan password baru';
    }

    // If there are validation errors, show them
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setAlert({ type: 'error', message: 'Mohon perbaiki kesalahan pada form' });
      setTimeout(() => setAlert(null), 5000);
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.changePassword({ currentPassword, newPassword });
      
      setAlert({ type: 'success', message: 'Password berhasil diubah! Silakan login dengan password baru Anda.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setAlert(null), 5000);
    } catch (error: any) {
      console.error('Change password error:', error);
      
      // Handle specific error messages from backend
      let errorMessage = 'Gagal mengubah password';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Password saat ini yang Anda masukkan salah';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Data yang Anda masukkan tidak valid';
      } else if (error.response?.status === 404) {
        errorMessage = 'Akun tidak ditemukan';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Koneksi ke server gagal. Periksa koneksi internet Anda.';
      }
      
      setAlert({ type: 'error', message: errorMessage });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Pengaturan</h1>
            <p className="text-muted-foreground mt-2">Kelola preferensi dan keamanan akun Anda</p>
          </div>

          {/* Alert */}
          {alert && (
            <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6">
              {alert.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{alert.type === 'success' ? 'Berhasil' : 'Error'}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  Tampilan
                </CardTitle>
                <CardDescription>Sesuaikan tema aplikasi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="theme-toggle" className="text-base font-medium">
                      Mode Gelap
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Aktifkan tema gelap untuk pengalaman visual yang lebih nyaman di malam hari
                    </p>
                  </div>
                  <Switch
                    id="theme-toggle"
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings - Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Keamanan
                </CardTitle>
                <CardDescription>Ubah password akun Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Password Saat Ini</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          if (fieldErrors.currentPassword) {
                            setFieldErrors(prev => ({ ...prev, currentPassword: undefined }));
                          }
                        }}
                        placeholder="Masukkan password saat ini"
                        disabled={isLoading}
                        className={fieldErrors.currentPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.currentPassword && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (fieldErrors.newPassword) {
                            setFieldErrors(prev => ({ ...prev, newPassword: undefined }));
                          }
                        }}
                        placeholder="Masukkan password baru"
                        disabled={isLoading}
                        className={fieldErrors.newPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.newPassword ? (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.newPassword}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Minimal 6 karakter</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (fieldErrors.confirmPassword) {
                            setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                          }
                        }}
                        placeholder="Konfirmasi password baru"
                        disabled={isLoading}
                        className={fieldErrors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full mt-4">
                    {isLoading ? 'Mengubah Password...' : 'Ubah Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* App Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Informasi Aplikasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Versi Aplikasi</span>
                  <span className="text-sm font-medium">1.0.0</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Build</span>
                  <span className="text-sm font-medium">2025.11.25</span>
                </div>
                <Separator />
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    © 2025 Mobile HRD System. All rights reserved.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
