import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { penghargaanAPI, karyawanAPI } from '../services/api';
import type { Penghargaan as PenghargaanType } from '../types/perhargaan';
import type { Karyawan } from '../types/karyawan';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Award,
  X
} from 'lucide-react';
import { AxiosError } from 'axios';

interface AlertState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

interface FormData {
  nama: string;
  tahun: string;
  karyawanIds: string[];
}

export const Penghargaan = () => {
  const [penghargaan, setPenghargaan] = useState<PenghargaanType[]>([]);
  const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPenghargaan, setEditingPenghargaan] = useState<PenghargaanType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ 
    nama: '', 
    tahun: new Date().getFullYear().toString(),
    karyawanIds: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectKey, setSelectKey] = useState(0); // Add this to force re-render
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: 'success',
    message: '',
  });

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: 'success', message: '' });
    }, 5000);
  };

  const fetchPenghargaan = async () => {
    try {
      setLoading(true);
      const response = await penghargaanAPI.getAll();
      console.log('Fetched penghargaan:', response.data);
      setPenghargaan(response.data);
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || 'Gagal memuat data penghargaan'
        : 'Gagal memuat data penghargaan';
      showAlert('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchKaryawan = async () => {
    try {
      const response = await karyawanAPI.getAll();
      setKaryawanList(response.data);
    } catch (error) {
      console.error('Failed to fetch karyawan:', error);
    }
  };

  useEffect(() => {
    fetchPenghargaan();
    fetchKaryawan();
  }, []);

  const handleOpenDialog = (penghargaan?: PenghargaanType) => {
    if (penghargaan) {
      console.log('Editing penghargaan:', penghargaan);
      setEditingPenghargaan(penghargaan);
      setFormData({ 
        nama: penghargaan.nama,
        tahun: new Date(penghargaan.tahun).getFullYear().toString(),
        karyawanIds: penghargaan.karyawan?.map(k => k.id) || []
      });
    } else {
      console.log('Creating new penghargaan');
      setEditingPenghargaan(null);
      setFormData({ 
        nama: '', 
        tahun: new Date().getFullYear().toString(),
        karyawanIds: []
      });
    }
    setSelectKey(prev => prev + 1); // Reset select
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPenghargaan(null);
    setFormData({ 
      nama: '', 
      tahun: new Date().getFullYear().toString(),
      karyawanIds: []
    });
    setSelectKey(prev => prev + 1); // Reset select
  };

  const handleAddKaryawan = (karyawanId: string) => {
    if (!formData.karyawanIds.includes(karyawanId)) {
      setFormData({
        ...formData,
        karyawanIds: [...formData.karyawanIds, karyawanId]
      });
      // Force select to reset to placeholder
      setSelectKey(prev => prev + 1);
    }
  };

  const handleRemoveKaryawan = (karyawanId: string) => {
    setFormData({
      ...formData,
      karyawanIds: formData.karyawanIds.filter(id => id !== karyawanId)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama.trim()) {
      showAlert('error', 'Nama penghargaan wajib diisi');
      return;
    }

    if (!formData.tahun.trim()) {
      showAlert('error', 'Tahun wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      
      // Convert year to ISO date string
      const tahunDate = `${formData.tahun}-01-01T00:00:00.000Z`;
      
      const submitData = {
        nama: formData.nama,
        tahun: tahunDate,
        karyawanIds: formData.karyawanIds.length > 0 ? formData.karyawanIds : undefined
      };

      if (editingPenghargaan) {
        console.log('Submitting update for ID:', editingPenghargaan.id);
        
        if (!editingPenghargaan.id) {
          throw new Error('ID penghargaan tidak ditemukan');
        }
        
        await penghargaanAPI.update(editingPenghargaan.id, submitData);
        showAlert('success', 'Penghargaan berhasil diupdate');
      } else {
        console.log('Submitting new penghargaan');
        await penghargaanAPI.create(submitData);
        showAlert('success', 'Penghargaan berhasil ditambahkan');
      }
      handleCloseDialog();
      fetchPenghargaan();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof AxiosError
        ? error.response?.data?.message || 'Terjadi kesalahan'
        : error instanceof Error
        ? error.message
        : 'Terjadi kesalahan';
      showAlert('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setSubmitting(true);
      console.log('Deleting penghargaan ID:', deletingId);
      await penghargaanAPI.delete(deletingId);
      showAlert('success', 'Penghargaan berhasil dihapus');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      fetchPenghargaan();
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error instanceof AxiosError
        ? error.response?.data?.message || 'Gagal menghapus penghargaan'
        : 'Gagal menghapus penghargaan';
      showAlert('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    console.log('Opening delete dialog for ID:', id);
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const getSelectedKaryawan = () => {
    return karyawanList.filter(k => formData.karyawanIds.includes(k.id));
  };

  const getAvailableKaryawan = () => {
    return karyawanList.filter(k => !formData.karyawanIds.includes(k.id));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Alert Messages */}
          {alert.show && (
            <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
              {alert.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="h-8 w-8" />
                Penghargaan
              </h1>
              <p className="text-gray-500 mt-1">
                Kelola data penghargaan karyawan
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Penghargaan
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Penghargaan</CardTitle>
              <CardDescription>
                Menampilkan semua penghargaan yang terdaftar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : penghargaan.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data penghargaan
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Nama Penghargaan</TableHead>
                      <TableHead>Tahun</TableHead>
                      <TableHead>Penerima</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {penghargaan.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.nama}</TableCell>
                        <TableCell>{new Date(item.tahun).getFullYear()}</TableCell>
                        <TableCell>
                          {item.karyawan && item.karyawan.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.karyawan.map(k => (
                                <Badge key={k.id} variant="secondary">
                                  {k.nama}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">Belum ada penerima</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteDialog(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPenghargaan ? 'Edit Penghargaan' : 'Tambah Penghargaan'}
            </DialogTitle>
            <DialogDescription>
              {editingPenghargaan
                ? `Update informasi penghargaan (ID: ${editingPenghargaan.id})`
                : 'Tambahkan penghargaan baru ke sistem'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {editingPenghargaan && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">ID Penghargaan</Label>
                  <Input
                    value={editingPenghargaan.id}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Penghargaan *</Label>
                <Input
                  id="nama"
                  placeholder="Contoh: Karyawan Terbaik"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tahun">Tahun *</Label>
                <Input
                  id="tahun"
                  type="number"
                  placeholder="2025"
                  min="1900"
                  max="2100"
                  value={formData.tahun}
                  onChange={(e) =>
                    setFormData({ ...formData, tahun: e.target.value })
                  }
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label>Penerima Penghargaan</Label>
                
                {/* Selected Karyawan */}
                {getSelectedKaryawan().length > 0 && (
                  <div className="border rounded-lg p-3 space-y-2 bg-gray-50">
                    <p className="text-sm font-medium">Karyawan Terpilih:</p>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedKaryawan().map(k => (
                        <Badge key={k.id} variant="default" className="flex items-center gap-1">
                          {k.nama}
                          <button
                            type="button"
                            onClick={() => handleRemoveKaryawan(k.id)}
                            className="ml-1 hover:bg-red-500 rounded-full"
                            disabled={submitting}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Karyawan - with key prop to force re-render */}
                {getAvailableKaryawan().length > 0 && (
                  <Select 
                    key={selectKey} 
                    onValueChange={handleAddKaryawan} 
                    disabled={submitting}
                    value="" // Always controlled to empty to show placeholder
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih karyawan untuk ditambahkan" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableKaryawan().map(k => (
                        <SelectItem key={k.id} value={k.id}>
                          {k.nama}
                          {k.jabatan && k.jabatan.length > 0 && (
                            <span className="text-xs text-gray-500 ml-2">
                              - {k.jabatan[0].nama}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {getAvailableKaryawan().length === 0 && getSelectedKaryawan().length > 0 && (
                  <p className="text-sm text-gray-500">Semua karyawan sudah dipilih</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPenghargaan ? 'Update' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus penghargaan ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingId(null);
              }}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};