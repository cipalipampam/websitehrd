import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { pelatihanAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Plus, Eye, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from '../components/ui/badge';

interface PelatihanItem {
  id: string;
  nama: string;
  tanggal: string;
  lokasi: string;
  pelatihandetail?: Array<{
    id: string;
    skor: number | null;
    catatan: string | null;
    karyawan: {
      id: string;
      nama: string;
      user: {
        username: string;
        email: string;
      };
    };
  }>;
}

export const Pelatihan = () => {
  const { user } = useAuthStore();
  const [available, setAvailable] = useState<PelatihanItem[]>([]);
  const [myTrainings, setMyTrainings] = useState<any[]>([]);
  const [allPel, setAllPel] = useState<PelatihanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nama: '', tanggal: '', lokasi: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedPelatihan, setSelectedPelatihan] = useState<PelatihanItem | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const fetchForHR = async () => {
    try {
      setLoading(true);
      const res = await pelatihanAPI.getAll();
      setAllPel(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat pelatihan');
    } finally {
      setLoading(false);
    }
  };

  const fetchForKaryawan = async () => {
    try {
      setLoading(true);
      const av = await pelatihanAPI.getAvailable();
      setAvailable(av.data || []);
      const my = await pelatihanAPI.getMy();
      setMyTrainings(my.data || []);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat pelatihan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'HR') fetchForHR();
    else fetchForKaryawan();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.nama || !form.tanggal || !form.lokasi) {
      setError('Isi semua field');
      return;
    }
    try {
      setSubmitting(true);
      await pelatihanAPI.create(form);
      setForm({ nama: '', tanggal: '', lokasi: '' });
      await fetchForHR();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (id: string) => {
    try {
      setSubmitting(true);
      await pelatihanAPI.join(id);
      await fetchForKaryawan();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Join failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetail = (pelatihan: PelatihanItem) => {
    setSelectedPelatihan(pelatihan);
    setShowDetailDialog(true);
  };

  const handleCloseDetail = () => {
    setShowDetailDialog(false);
    setSelectedPelatihan(null);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-6 w-full">
        <Card>
          <CardHeader>
            <CardTitle>Pelatihan</CardTitle>
            <CardDescription>
              {user?.role === 'HR' ? 'Buat dan kelola pelatihan' : 'Daftar pelatihan tersedia'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {user?.role === 'HR' && (
              <form onSubmit={handleCreate} className="space-y-4 mb-6">
                <div>
                  <Label>Nama</Label>
                  <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
                </div>
                <div>
                  <Label>Tanggal</Label>
                  <Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
                </div>
                <div>
                  <Label>Lokasi</Label>
                  <Input value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} />
                </div>
                <Button type="submit" disabled={submitting} className="mt-2">
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Membuat...</> : <><Plus className="mr-2"/> Buat Pelatihan</>}
                </Button>
              </form>
            )}

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div>
                {user?.role === 'HR' ? (
                  <div>
                    <h3 className="font-semibold mb-2">Semua Pelatihan</h3>
                    <ul className="space-y-2">
                      {allPel.map((p) => (
                        <li key={p.id} className="p-3 border rounded bg-white">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="font-medium">{p.nama}</div>
                              <div className="text-sm text-gray-500">{new Date(p.tanggal).toLocaleDateString()} — {p.lokasi}</div>
                              {p.pelatihandetail && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Users size={14} className="text-gray-400" />
                                  <span className="text-xs text-gray-600">{p.pelatihandetail.length} Peserta</span>
                                </div>
                              )}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleViewDetail(p)}>
                              <Eye size={16} className="mr-1" /> Detail
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold mb-2">Pelatihan Tersedia</h3>
                    <ul className="space-y-2 mb-6">
                      {available.map((p) => (
                        <li key={p.id} className="p-3 border rounded bg-white flex justify-between items-center">
                          <div>
                            <div className="font-medium">{p.nama}</div>
                            <div className="text-sm text-gray-500">{new Date(p.tanggal).toLocaleDateString()} — {p.lokasi}</div>
                          </div>
                          <div>
                            <Button onClick={() => handleJoin(p.id)} disabled={submitting}>Join</Button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <h3 className="font-semibold mb-2">Pelatihan Saya</h3>
                    <ul className="space-y-2">
                      {myTrainings.map((m) => (
                        <li key={m.id} className="p-3 border rounded bg-white">
                          <div className="font-medium">{m.pelatihan.nama}</div>
                          <div className="text-sm text-gray-500">{new Date(m.pelatihan.tanggal).toLocaleDateString()} — {m.pelatihan.lokasi}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPelatihan?.nama}</DialogTitle>
              <DialogDescription>
                {selectedPelatihan && new Date(selectedPelatihan.tanggal).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} • {selectedPelatihan?.lokasi}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Daftar Peserta</h3>
                <Badge variant="secondary">
                  {selectedPelatihan?.pelatihandetail?.length || 0} Peserta
                </Badge>
              </div>

              {selectedPelatihan?.pelatihandetail && selectedPelatihan.pelatihandetail.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Karyawan</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Skor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPelatihan.pelatihandetail.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell className="font-medium">{detail.karyawan.nama}</TableCell>
                        <TableCell>{detail.karyawan.user.email}</TableCell>
                        <TableCell>
                          {detail.catatan === 'CONFIRMED' ? (
                            <Badge variant="default" className="bg-green-500">Confirmed</Badge>
                          ) : detail.catatan === 'DECLINED' ? (
                            <Badge variant="destructive">Declined</Badge>
                          ) : detail.catatan ? (
                            <Badge variant="outline">{detail.catatan}</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {detail.skor !== null ? (
                            <span className="font-semibold">{detail.skor}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Belum ada peserta yang mendaftar
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={handleCloseDetail}>
                Tutup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Pelatihan;
