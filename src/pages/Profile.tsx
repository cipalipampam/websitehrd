import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { karyawanAPI } from '@/services/api';
import type { Karyawan } from '@/types/karyawan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User, Briefcase, Calendar, MapPin, Phone, GraduationCap, Users, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Profile = () => {
  const [karyawan, setKaryawan] = useState<Karyawan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Karyawan>>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await karyawanAPI.getMyProfile();
      setKaryawan(response.data);
      setEditData({
        alamat: response.data.alamat || '',
        no_telp: response.data.no_telp || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setAlert({ type: 'error', message: 'Gagal memuat data profil' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await karyawanAPI.updateProfile(editData);
      setKaryawan(response.data);
      setIsEditing(false);
      setAlert({ type: 'success', message: 'Profil berhasil diperbarui' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlert({ type: 'error', message: 'Gagal memperbarui profil' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Profil Saya</h1>
            <p className="text-muted-foreground mt-2">Kelola informasi profil Anda</p>
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

          {/* Profile Header Card */}
          <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <User className="w-12 h-12" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{karyawan?.nama}</h2>
                  <div className="flex items-center gap-2 mt-2 text-white/90">
                    <Briefcase className="w-4 h-4" />
                    <span>{karyawan?.jabatan?.[0]?.nama || 'Tidak ada jabatan'}</span>
                    <span className="mx-2">•</span>
                    <Building2 className="w-4 h-4" />
                    <span>{karyawan?.departemen?.[0]?.nama || 'Tidak ada departemen'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Informasi Pribadi</CardTitle>
                    <CardDescription>Data pribadi karyawan</CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (isEditing) {
                        setEditData({
                          alamat: karyawan?.alamat || '',
                          no_telp: karyawan?.no_telp || '',
                        });
                      }
                      setIsEditing(!isEditing);
                    }}
                  >
                    {isEditing ? 'Batal' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-gray-600">Nama Lengkap</Label>
                    <p className="font-medium">{karyawan?.nama}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-gray-600">Jenis Kelamin</Label>
                    <p className="font-medium">{karyawan?.gender}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-gray-600">Tanggal Lahir</Label>
                    <p className="font-medium">
                      {karyawan?.tanggal_lahir
                        ? `${formatDate(karyawan.tanggal_lahir)} (${calculateAge(karyawan.tanggal_lahir)} tahun)`
                        : 'Tidak tersedia'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-gray-600">Pendidikan</Label>
                    <p className="font-medium">{karyawan?.pendidikan}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-gray-600">Alamat</Label>
                    {isEditing ? (
                      <Input
                        value={editData.alamat}
                        onChange={(e) =>
                          setEditData({ ...editData, alamat: e.target.value })
                        }
                        placeholder="Masukkan alamat"
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">{karyawan?.alamat || 'Tidak tersedia'}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-gray-600">No. Telepon</Label>
                    {isEditing ? (
                      <Input
                        value={editData.no_telp}
                        onChange={(e) =>
                          setEditData({ ...editData, no_telp: e.target.value })
                        }
                        placeholder="Masukkan nomor telepon"
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">{karyawan?.no_telp || 'Tidak tersedia'}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <Button onClick={handleSave} className="w-full mt-4">
                    Simpan Perubahan
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kerja</CardTitle>
                <CardDescription>Data kepegawaian</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-gray-600">Departemen</Label>
                    <p className="font-medium">
                      {karyawan?.departemen?.map((dept) => dept.nama).join(', ') || 'Tidak tersedia'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-gray-600">Jabatan</Label>
                    <p className="font-medium">
                      {karyawan?.jabatan?.map((jabatan) => jabatan.nama).join(', ') || 'Tidak tersedia'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-gray-600">Tanggal Masuk</Label>
                    <p className="font-medium">
                      {karyawan?.tanggal_masuk ? formatDate(karyawan.tanggal_masuk) : 'Tidak tersedia'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-gray-600">Masa Kerja</Label>
                    <p className="font-medium">
                      {karyawan?.masaKerja ? `${karyawan.masaKerja} tahun` : 'Tidak tersedia'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-gray-600">Jalur Rekrutmen</Label>
                    <p className="font-medium">{karyawan?.jalur_rekrut}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
              <CardDescription>Data akun pengguna</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-600">Username</Label>
                  <p className="font-medium">{karyawan?.user?.username || 'Tidak tersedia'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-medium">{karyawan?.user?.email || 'Tidak tersedia'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Role</Label>
                  <p className="font-medium">
                    <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
                      {karyawan?.user?.role || 'Tidak tersedia'}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
