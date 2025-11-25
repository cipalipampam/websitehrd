import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { jabatanAPI } from '../services/api';
import type { Jabatan as JabatanType } from '../types/jabatan';
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
import { Alert, AlertDescription } from '../components/ui/alert';
import { Plus, Pencil, Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AxiosError } from 'axios';

interface AlertState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

export const Jabatan = () => {
  const [jabatan, setJabatan] = useState<JabatanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingJabatan, setEditingJabatan] = useState<JabatanType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nama: '' });
  const [submitting, setSubmitting] = useState(false);
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

  const fetchJabatan = async () => {
    try {
      setLoading(true);
      const response = await jabatanAPI.getAll();
      console.log('Fetched jabatan:', response.data); // Debug log
      setJabatan(response.data);
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || 'Gagal memuat data jabatan'
        : 'Gagal memuat data jabatan';
      showAlert('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJabatan();
  }, []);

  const handleOpenDialog = (jabatan?: JabatanType) => {
    if (jabatan) {
      console.log('Editing jabatan:', jabatan); // Debug log
      setEditingJabatan(jabatan);
      setFormData({ nama: jabatan.nama });
    } else {
      console.log('Creating new jabatan'); // Debug log
      setEditingJabatan(null);
      setFormData({ nama: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingJabatan(null);
    setFormData({ nama: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama.trim()) {
      showAlert('error', 'Nama jabatan wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      if (editingJabatan) {
        console.log('Submitting update for ID:', editingJabatan.id); // Debug log
        
        // Validasi ID ada
        if (!editingJabatan.id) {
          throw new Error('ID jabatan tidak ditemukan');
        }
        
        await jabatanAPI.update(editingJabatan.id, formData);
        showAlert('success', 'Jabatan berhasil diupdate');
      } else {
        console.log('Submitting new jabatan'); // Debug log
        await jabatanAPI.create(formData);
        showAlert('success', 'Jabatan berhasil ditambahkan');
      }
      handleCloseDialog();
      fetchJabatan();
    } catch (error) {
      console.error('Submit error:', error); // Debug log
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
      console.log('Deleting jabatan ID:', deletingId); // Debug log
      await jabatanAPI.delete(deletingId);
      showAlert('success', 'Jabatan berhasil dihapus');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      fetchJabatan();
    } catch (error) {
      console.error('Delete error:', error); // Debug log
      const errorMessage = error instanceof AxiosError
        ? error.response?.data?.message || 'Gagal menghapus jabatan'
        : 'Gagal menghapus jabatan';
      showAlert('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    console.log('Opening delete dialog for ID:', id); // Debug log
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
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
              <h1 className="text-3xl font-bold text-gray-900">Jabatan</h1>
              <p className="text-gray-500 mt-1">
                Kelola data jabatan perusahaan
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jabatan
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Jabatan</CardTitle>
              <CardDescription>
                Menampilkan semua jabatan yang terdaftar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : jabatan.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data jabatan
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Nama Jabatan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jabatan.map((dept, index) => (
                      <TableRow key={dept.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{dept.nama}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Edit button clicked for:', dept); // Debug log
                                handleOpenDialog(dept);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteDialog(dept.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingJabatan ? 'Edit Jabatan' : 'Tambah Jabatan'}
            </DialogTitle>
            <DialogDescription>
              {editingJabatan
                ? `Update informasi jabatan (ID: ${editingJabatan.id})`
                : 'Tambahkan jabatan baru ke sistem'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {editingJabatan && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">ID Jabatan</Label>
                  <Input
                    value={editingJabatan.id}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Jabatan</Label>
                <Input
                  id="nama"
                  placeholder="Masukkan nama jabatan"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  disabled={submitting}
                />
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
                {editingJabatan ? 'Update' : 'Simpan'}
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
              Apakah Anda yakin ingin menghapus jabatan ini? Tindakan ini tidak
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