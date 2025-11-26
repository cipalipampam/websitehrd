import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { jabatanAPI, departemenAPI } from '../services/api';
import type { Jabatan as JabatanType } from '../types/jabatan';
import type { Departemen } from '../types/departemen';
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
import { Textarea } from '../components/ui/textarea';
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
  const [departemen, setDepartemen] = useState<Departemen[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingJabatan, setEditingJabatan] = useState<JabatanType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    nama: '', 
    departemenId: '', 
    level: '', 
    deskripsi: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterDepartemen, setFilterDepartemen] = useState<string>('');
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

  const fetchDepartemen = async () => {
    try {
      const response = await departemenAPI.getAll();
      setDepartemen(response.data);
    } catch (error) {
      console.error('Error fetching departemen:', error);
    }
  };

  const fetchJabatan = async () => {
    try {
      setLoading(true);
      const params = filterDepartemen ? { departemenId: filterDepartemen } : undefined;
      const response = await jabatanAPI.getAll(params);
      console.log('Fetched jabatan:', response.data);
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
    fetchDepartemen();
    fetchJabatan();
  }, []);

  useEffect(() => {
    fetchJabatan();
  }, [filterDepartemen]);

  const handleOpenDialog = (jabatan?: JabatanType) => {
    if (jabatan) {
      console.log('Editing jabatan:', jabatan);
      setEditingJabatan(jabatan);
      setFormData({ 
        nama: jabatan.nama,
        departemenId: jabatan.departemenId,
        level: jabatan.level || '',
        deskripsi: jabatan.deskripsi || ''
      });
    } else {
      console.log('Creating new jabatan');
      setEditingJabatan(null);
      setFormData({ nama: '', departemenId: '', level: '', deskripsi: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingJabatan(null);
    setFormData({ nama: '', departemenId: '', level: '', deskripsi: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama.trim()) {
      showAlert('error', 'Nama jabatan wajib diisi');
      return;
    }

    if (!formData.departemenId) {
      showAlert('error', 'Departemen wajib dipilih');
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare data - only send non-empty fields
      const submitData: any = {
        nama: formData.nama,
        departemenId: formData.departemenId,
      };
      
      if (formData.level) submitData.level = formData.level;
      if (formData.deskripsi) submitData.deskripsi = formData.deskripsi;
      
      if (editingJabatan) {
        console.log('Submitting update for ID:', editingJabatan.id);
        
        if (!editingJabatan.id) {
          throw new Error('ID jabatan tidak ditemukan');
        }
        
        await jabatanAPI.update(editingJabatan.id, submitData);
        showAlert('success', 'Jabatan berhasil diupdate');
      } else {
        console.log('Submitting new jabatan');
        await jabatanAPI.create(submitData);
        showAlert('success', 'Jabatan berhasil ditambahkan');
      }
      handleCloseDialog();
      fetchJabatan();
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
                Kelola data jabatan per departemen
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jabatan
            </Button>
          </div>

          {/* Filter by Department */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Label htmlFor="filter-dept" className="whitespace-nowrap">Filter Departemen:</Label>
                <select
                  id="filter-dept"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={filterDepartemen}
                  onChange={(e) => setFilterDepartemen(e.target.value)}
                >
                  <option value="">Semua Departemen</option>
                  {departemen.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nama}
                    </option>
                  ))}
                </select>
                {filterDepartemen && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterDepartemen('')}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

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
                      <TableHead>Level</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jabatan.map((jab, index) => (
                      <TableRow key={jab.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{jab.nama}</TableCell>
                        <TableCell>
                          {jab.level && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              {jab.level}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            {jab.departemen.nama}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-gray-500">
                          {jab.deskripsi || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(jab)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteDialog(jab.id)}
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
                <Label htmlFor="departemenId">
                  Departemen <span className="text-red-500">*</span>
                </Label>
                <select
                  id="departemenId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.departemenId}
                  onChange={(e) =>
                    setFormData({ ...formData, departemenId: e.target.value })
                  }
                  disabled={submitting}
                  required
                >
                  <option value="">Pilih Departemen</option>
                  {departemen.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama">
                  Nama Jabatan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama"
                  placeholder="Masukkan nama jabatan"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level (Opsional)</Label>
                <select
                  id="level"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                  disabled={submitting}
                >
                  <option value="">Pilih Level</option>
                  <option value="Junior">Junior</option>
                  <option value="Staff">Staff</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                  <option value="Manager">Manager</option>
                  <option value="Director">Director</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
                <Textarea
                  id="deskripsi"
                  placeholder="Masukkan deskripsi jabatan"
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  disabled={submitting}
                  rows={3}
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