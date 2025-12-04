import { useEffect, useState } from 'react';
import { izinAPI, kehadiranAPI, departemenAPI, karyawanAPI } from '@/services/api';
import type { IzinRequest } from '@/types/izin';
import type { Kehadiran } from '@/types/kehadiran';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

export default function ManajemenKehadiran() {
  // Izin requests state
  const [requests, setRequests] = useState<IzinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Attendance data state
  const [departments, setDepartments] = useState<string[]>([]);
  const [karyawan, setKaryawan] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Kehadiran[]>([]);
  const [selectedAttendanceDepartment, setSelectedAttendanceDepartment] = useState('Analytics');
  const [selectedAttendanceMonth, setSelectedAttendanceMonth] = useState(new Date().getMonth());
  const [selectedAttendanceYear, setSelectedAttendanceYear] = useState(new Date().getFullYear());
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [errorAttendance, setErrorAttendance] = useState<string | null>(null);

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

  // Load departments and karyawan on mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await departemenAPI.getAll();
        const names = (res.data || []).map((d: any) => d.nama);
        setDepartments(names);
        if (names.length > 0) {
          setSelectedAttendanceDepartment(names[0]);
        }
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    };

    const loadKaryawan = async () => {
      try {
        const res = await karyawanAPI.getAll();
        setKaryawan(res.data || []);
      } catch (err) {
        console.error("Failed to load karyawan", err);
      }
    };

    loadDepartments();
    loadKaryawan();
  }, []);

  // Fetch attendance data when filters change
  useEffect(() => {
    const loadAttendanceData = async () => {
      setLoadingAttendance(true);
      setErrorAttendance(null);
      
      try {
        const params = {
          month: selectedAttendanceMonth + 1, // backend expects 1-based month
          year: selectedAttendanceYear,
        };
        
        const response = await kehadiranAPI.getAll(params);
        setAttendanceRecords(response.data || []);
      } catch (err: any) {
        console.error('Failed to load attendance data:', err);
        setErrorAttendance(err.response?.data?.message || err.message || 'Failed to load attendance data');
        setAttendanceRecords([]);
      } finally {
        setLoadingAttendance(false);
      }
    };

    loadAttendanceData();
  }, [selectedAttendanceMonth, selectedAttendanceYear]);

  // Helper functions for attendance table
  const getMonthName = (monthIndex: number) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[monthIndex];
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  const getMonthOptions = () => {
    return [
      { value: 0, label: 'January' },
      { value: 1, label: 'February' },
      { value: 2, label: 'March' },
      { value: 3, label: 'April' },
      { value: 4, label: 'May' },
      { value: 5, label: 'June' },
      { value: 6, label: 'July' },
      { value: 7, label: 'August' },
      { value: 8, label: 'September' },
      { value: 9, label: 'October' },
      { value: 10, label: 'November' },
      { value: 11, label: 'December' }
    ];
  };

  const getSelectedMonthDays = () => {
    const daysInMonth = new Date(selectedAttendanceYear, selectedAttendanceMonth + 1, 0).getDate();
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedAttendanceYear, selectedAttendanceMonth, day);
      const dayOfWeek = date.getDay();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      days.push({
        day,
        dayName: dayNames[dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      });
    }
    
    return days;
  };

  const getAttendanceData = () => {
  const year = selectedAttendanceYear;
  const month = selectedAttendanceMonth;
  const daysInMonth = new Date(year, month + 1, 0). getDate();

  // Filter records berdasarkan departemen (sama seperti dashboard)
  const filteredRecords = attendanceRecords.filter(record => {
    const karyawanDept = record. karyawan?.departemen?.[0]?.nama;
    return karyawanDept === selectedAttendanceDepartment;
  });

  // Buat Map untuk grouping by karyawan
  const karyawanMap = new Map<string, {
    id: string;
    name: string;
    position: string;
    records: Map<number, Kehadiran>;
  }>();

  filteredRecords.forEach(record => {
    const karyawanId = record.karyawanId;
    const recordDate = new Date(record.tanggal);
    const day = recordDate.getDate();

    if (!karyawanMap.has(karyawanId)) {
      karyawanMap.set(karyawanId, {
        id: karyawanId,
        name: record.karyawan?.nama || 'Unknown',
        position: record.karyawan?.jabatan?.[0]?.nama || '-',
        records: new Map(),
      });
    }

    karyawanMap.get(karyawanId)!.records.set(day, record);
  });

  // Convert Map to Array dan hitung statistik
  const attendanceData = Array.from(karyawanMap.values()).map(employeeData => {
    const dailyAttendance: { [key: string]: string } = {};
    let presentDays = 0;
    let lateDays = 0;
    let absentDays = 0;
    let workingDaysCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isWeekend = date.getDay() === 0 || date. getDay() === 6;

      if (isWeekend) {
        dailyAttendance[`day${day}`] = '-';
      } else {
        workingDaysCount++;
        const record = employeeData.records.get(day);

        if (! record) {
          dailyAttendance[`day${day}`] = 'X';
          absentDays++;
        } else {
          const status = record.status;
          if (status === 'HADIR') {
            dailyAttendance[`day${day}`] = '✓';
            presentDays++;
          } else if (status === 'TERLAMBAT') {
            dailyAttendance[`day${day}`] = 'L';
            lateDays++;
          } else if (status === 'IZIN' || status === 'SAKIT') {
            dailyAttendance[`day${day}`] = 'I';
            presentDays++; // PENTING: Izin/Sakit dihitung sebagai present
          } else if (status === 'ALPA' || status === 'BELUM_ABSEN') {
            dailyAttendance[`day${day}`] = 'X';
            absentDays++;
          } else {
            dailyAttendance[`day${day}`] = 'X';
            absentDays++;
          }
        }
      }
    }

    const totalAttended = presentDays + lateDays;
    const attendanceRate = workingDaysCount > 0 
      ? Math.round((totalAttended / workingDaysCount) * 100) 
      : 0;

    return {
      id: employeeData.id,
      name: employeeData.name,
      position: employeeData.position,
      ... dailyAttendance,
      presentDays,
      lateDays,
      absentDays,
      attendanceRate,
      totalWorkingDays: workingDaysCount
    };
  });

  return attendanceData;
};

  const getAttendanceSummary = () => {
    const data = getAttendanceData();
    if (data.length === 0) return {
      averageAttendance: 0,
      totalPresent: 0,
      totalLate: 0,
      totalAbsent: 0,
      totalEmployees: 0
    };

    const totalPresent = data.reduce((sum, emp) => sum + emp.presentDays, 0);
    const totalLate = data.reduce((sum, emp) => sum + emp.lateDays, 0);
    const totalAbsent = data.reduce((sum, emp) => sum + emp.absentDays, 0);
    const averageAttendance = Math.round(
      data.reduce((sum, emp) => sum + emp.attendanceRate, 0) / data.length
    );

    return {
      averageAttendance,
      totalPresent,
      totalLate,
      totalAbsent,
      totalEmployees: data.length
    };
  };

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

      {/* Attendance Table Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Tabel Kehadiran</CardTitle>
              <CardDescription>
                Data kehadiran karyawan per departemen
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedAttendanceDepartment} onValueChange={setSelectedAttendanceDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedAttendanceMonth.toString()} onValueChange={(value) => setSelectedAttendanceMonth(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedAttendanceYear.toString()} onValueChange={(value) => setSelectedAttendanceYear(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {getYearOptions().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingAttendance ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading attendance data...</p>
              </div>
            </div>
          ) : errorAttendance ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                  <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-foreground">Failed to load attendance data</p>
                <p className="text-sm text-muted-foreground max-w-md">{errorAttendance}</p>
              </div>
            </div>
          ) : getAttendanceData().length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-foreground">No attendance data</p>
                <p className="text-sm text-muted-foreground">
                  No employees found for {selectedAttendanceDepartment} department in {getMonthName(selectedAttendanceMonth)} {selectedAttendanceYear}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto relative">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background z-20 border-r font-semibold min-w-[120px] shadow-sm">
                        Employee
                      </TableHead>
                      {getSelectedMonthDays().map((dayInfo) => (
                        <TableHead 
                          key={dayInfo.day} 
                          className={`text-center min-w-[40px] text-xs ${dayInfo.isWeekend ? 'bg-muted/50 text-muted-foreground' : ''}`}
                        >
                          <div className="flex flex-col">
                            <span>{dayInfo.day}</span>
                            <span className="text-xs">{dayInfo.dayName}</span>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="sticky right-[200px] bg-background z-20 text-center font-semibold border-l shadow-sm min-w-[60px]">
                        Present
                      </TableHead>
                      <TableHead className="sticky right-[140px] bg-background z-20 text-center font-semibold shadow-sm min-w-[60px]">
                        Late
                      </TableHead>
                      <TableHead className="sticky right-[80px] bg-background z-20 text-center font-semibold shadow-sm min-w-[60px]">
                        Absent
                      </TableHead>
                      <TableHead className="sticky right-0 bg-background z-20 text-center font-semibold shadow-sm min-w-[80px]">
                        Rate %
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getAttendanceData().map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="sticky left-0 bg-background z-20 border-r font-medium shadow-sm">
                          {employee.name}
                        </TableCell>
                        {getSelectedMonthDays().map((dayInfo) => {
                          const status = employee[`day${dayInfo.day}` as keyof typeof employee] as string;
                          return (
                            <TableCell 
                              key={dayInfo.day} 
                              className={`text-center text-sm ${dayInfo.isWeekend ? 'bg-muted/30' : ''}`}
                            >
                              <span className={`
                                inline-block w-6 h-6 rounded text-xs leading-6 font-medium
                                ${status === '✓' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 
                                  status === 'L' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' : 
                                  status === 'X' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' : 
                                  status === 'I' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' :
                                  'text-muted-foreground'}
                              `}>
                                {status}
                              </span>
                            </TableCell>
                          );
                        })}
                        <TableCell className="sticky right-[200px] bg-background z-20 text-center font-medium border-l text-green-700 dark:text-green-400 shadow-sm">
                          {employee.presentDays}
                        </TableCell>
                        <TableCell className="sticky right-[140px] bg-background z-20 text-center font-medium text-yellow-700 dark:text-yellow-400 shadow-sm">
                          {employee.lateDays}
                        </TableCell>
                        <TableCell className="sticky right-[80px] bg-background z-20 text-center font-medium text-red-700 dark:text-red-400 shadow-sm">
                          {employee.absentDays}
                        </TableCell>
                        <TableCell className="sticky right-0 bg-background z-20 text-center font-medium shadow-sm">
                          <Badge 
                            variant="outline" 
                            className={
                              employee.attendanceRate >= 95 
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' 
                                : employee.attendanceRate >= 85 
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' 
                                : employee.attendanceRate >= 75 
                                ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' 
                                : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                            }
                          >
                            {employee.attendanceRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-foreground">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded text-xs leading-6 font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-center">✓</span>
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded text-xs leading-6 font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 text-center">L</span>
                  <span>Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded text-xs leading-6 font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 text-center">X</span>
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded text-xs leading-6 font-medium text-muted-foreground text-center">-</span>
                  <span>Weekend/Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded text-xs leading-6 font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-center">I</span>
                  <span>Izin/Sakit</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Attendance Summary - {getMonthName(selectedAttendanceMonth)} {selectedAttendanceYear}</CardTitle>
          <CardDescription>{selectedAttendanceDepartment} Department Statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{getAttendanceSummary().averageAttendance}%</p>
              <p className="text-sm text-green-700 dark:text-green-300">Average Attendance</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{getAttendanceSummary().totalEmployees}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Total Employees</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{getAttendanceSummary().totalPresent}</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">Total Present Days</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{getAttendanceSummary().totalLate}</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Total Late Days</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{getAttendanceSummary().totalAbsent}</p>
              <p className="text-sm text-red-700 dark:text-red-300">Total Absent Days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Izin Requests Section */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-4">Permohonan Izin/Sakit</h2>
        
        <div className="mb-4 flex gap-4 items-center">
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
