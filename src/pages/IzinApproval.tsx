import { useEffect, useState } from 'react';
import { izinAPI } from '@/services/api';
import type { IzinRequest } from '@/types/izin';
import { Sidebar } from '@/components/Sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, FileText, User, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const formatDate = (dateString: string, includeTime = false) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  return date.toLocaleDateString('id-ID', options);
};

export default function IzinApproval() {
  const [requests, setRequests] = useState<IzinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await izinAPI.getAll({ 
        status: statusFilter === 'ALL' ? undefined : statusFilter 
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to load izin requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui permohonan izin ini?')) return;

    try {
      setProcessingId(id);
      await izinAPI.approve(id);
      alert('Permohonan izin berhasil disetujui');
      loadRequests();
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Gagal menyetujui permohonan izin');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menolak permohonan izin ini?')) return;

    try {
      setProcessingId(id);
      await izinAPI.reject(id);
      alert('Permohonan izin ditolak');
      loadRequests();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Gagal menolak permohonan izin');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle2 className="w-3 h-3 mr-1" />Disetujui</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getJenisBadge = (jenis: string) => {
    return jenis === 'SAKIT' 
      ? <Badge variant="destructive">Sakit</Badge>
      : <Badge variant="secondary">Izin</Badge>;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Manajemen Kehadiran</h1>
            <p className="text-gray-600">Kelola permohonan izin, sakit, dan kehadiran karyawan</p>
          </div>

      <div className="mb-6 flex gap-4 items-center">
        <div className="flex-1">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Disetujui</SelectItem>
              <SelectItem value="REJECTED">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={loadRequests} variant="outline">
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Memuat data...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Tidak ada permohonan izin</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {request.karyawan?.nama || 'Unknown'}
                    </CardTitle>
                    <CardDescription>
                      {request.karyawan?.userId}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getJenisBadge(request.jenis)}
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Tanggal:</span>
                      <span>
                        {formatDate(request.tanggal)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Diajukan:</span>
                      <span>
                        {formatDate(request.createdAt, true)}
                      </span>
                    </div>
                  </div>

                  {request.keterangan && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium mb-1">Keterangan:</p>
                      <p className="text-sm text-gray-700">{request.keterangan}</p>
                    </div>
                  )}

                  {request.fileUrl && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <a
                        href={`${API_URL}${request.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Lihat Lampiran
                      </a>
                    </div>
                  )}

                  {request.status === 'APPROVED' && request.approvedBy && (
                    <div className="text-sm text-gray-600">
                      Disetujui oleh: {request.approvedBy} pada{' '}
                      {formatDate(request.approvedAt!, true)}
                    </div>
                  )}

                  {request.status === 'REJECTED' && request.approvedBy && (
                    <div className="text-sm text-gray-600">
                      Ditolak oleh: {request.approvedBy} pada{' '}
                      {formatDate(request.approvedAt!, true)}
                    </div>
                  )}

                  {request.status === 'PENDING' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Setujui
                      </Button>
                      <Button
                        onClick={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Tolak
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
