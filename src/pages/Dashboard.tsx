import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useAuthStore } from '../stores/authStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Sample KPI data
const kpiData = [
  { month: 'Jan', HR: 85, Finance: 92, IT: 78, Operations: 88, Marketing: 82 },
  { month: 'Feb', HR: 88, Finance: 89, IT: 82, Operations: 85, Marketing: 86 },
  { month: 'Mar', HR: 92, Finance: 94, IT: 85, Operations: 90, Marketing: 89 },
  { month: 'Apr', HR: 89, Finance: 91, IT: 88, Operations: 87, Marketing: 91 },
  { month: 'May', HR: 94, Finance: 96, IT: 90, Operations: 93, Marketing: 87 },
  { month: 'Jun', HR: 91, Finance: 93, IT: 87, Operations: 89, Marketing: 94 },
  { month: 'Jul', HR: 96, Finance: 97, IT: 92, Operations: 95, Marketing: 90 },
  { month: 'Aug', HR: 93, Finance: 95, IT: 89, Operations: 91, Marketing: 93 },
  { month: 'Sep', HR: 97, Finance: 98, IT: 94, Operations: 96, Marketing: 95 },
  { month: 'Oct', HR: 95, Finance: 96, IT: 91, Operations: 93, Marketing: 97 },
  { month: 'Nov', HR: 98, Finance: 99, IT: 95, Operations: 97, Marketing: 94 },
  { month: 'Dec', HR: 96, Finance: 97, IT: 93, Operations: 95, Marketing: 96 },
];

// Sample Employee Performance Data
const employeeData = {
  HR: [
    { id: 1, name: 'Alice Johnson', position: 'HR Manager', performance: 95, productivity: 88, attendance: 98, rating: 'Excellent' },
    { id: 2, name: 'Bob Smith', position: 'Recruitment Specialist', performance: 87, productivity: 85, attendance: 92, rating: 'Good' },
    { id: 3, name: 'Carol Davis', position: 'Training Coordinator', performance: 91, productivity: 89, attendance: 96, rating: 'Excellent' },
    { id: 4, name: 'David Wilson', position: 'HR Assistant', performance: 82, productivity: 78, attendance: 88, rating: 'Average' },
    { id: 5, name: 'David Wilson', position: 'HR Assistant', performance: 82, productivity: 78, attendance: 88, rating: 'Average' },
  ],
  Finance: [
    { id: 5, name: 'Emma Brown', position: 'Finance Manager', performance: 98, productivity: 95, attendance: 99, rating: 'Excellent' },
    { id: 6, name: 'Frank Miller', position: 'Accountant', performance: 89, productivity: 87, attendance: 94, rating: 'Good' },
    { id: 7, name: 'Grace Taylor', position: 'Financial Analyst', performance: 93, productivity: 91, attendance: 97, rating: 'Excellent' },
    { id: 8, name: 'Henry Clark', position: 'Payroll Specialist', performance: 85, productivity: 83, attendance: 90, rating: 'Good' },
  ],
  IT: [
    { id: 9, name: 'Ivan Rodriguez', position: 'IT Manager', performance: 94, productivity: 92, attendance: 96, rating: 'Excellent' },
    { id: 10, name: 'Julia Martinez', position: 'Software Developer', performance: 88, productivity: 90, attendance: 89, rating: 'Good' },
    { id: 11, name: 'Kevin Lee', position: 'System Administrator', performance: 86, productivity: 84, attendance: 91, rating: 'Good' },
    { id: 12, name: 'Lisa Anderson', position: 'UI/UX Designer', performance: 91, productivity: 88, attendance: 93, rating: 'Good' },
  ],
  Operations: [
    { id: 13, name: 'Mike Thompson', position: 'Operations Manager', performance: 96, productivity: 94, attendance: 98, rating: 'Excellent' },
    { id: 14, name: 'Nancy White', position: 'Process Coordinator', performance: 89, productivity: 86, attendance: 92, rating: 'Good' },
    { id: 15, name: 'Oscar Garcia', position: 'Quality Analyst', performance: 87, productivity: 85, attendance: 90, rating: 'Good' },
    { id: 16, name: 'Paula Lopez', position: 'Operations Assistant', performance: 83, productivity: 80, attendance: 87, rating: 'Average' },
  ],
  Marketing: [
    { id: 17, name: 'Quinn Harris', position: 'Marketing Manager', performance: 97, productivity: 95, attendance: 99, rating: 'Excellent' },
    { id: 18, name: 'Rachel Green', position: 'Content Creator', performance: 90, productivity: 88, attendance: 94, rating: 'Good' },
    { id: 19, name: 'Steve Young', position: 'Digital Marketing Specialist', performance: 86, productivity: 84, attendance: 89, rating: 'Good' },
    { id: 20, name: 'Tina King', position: 'Social Media Manager', performance: 92, productivity: 90, attendance: 96, rating: 'Excellent' },
  ],
};

const departments = ['All', 'HR', 'Finance', 'IT', 'Operations', 'Marketing'];
const departmentColors = {
  HR: '#8884d8',
  Finance: '#82ca9d',
  IT: '#ffc658',
  Operations: '#ff7300',
  Marketing: '#8dd1e1',
};

const ratingColors = {
  'Excellent': 'bg-green-100 text-green-800 border-green-200',
  'Good': 'bg-blue-100 text-blue-800 border-blue-200',
  'Average': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Poor': 'bg-red-100 text-red-800 border-red-200',
};

// Trend Icon Component
const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') {
    return (
      <div className="flex items-center gap-1">
        <svg 
          className="w-4 h-4 text-green-500" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" 
            clipRule="evenodd" 
          />
        </svg>
        <span className="text-xs font-medium text-green-600">UP</span>
      </div>
    );
  }
  
  if (trend === 'down') {
    return (
      <div className="flex items-center gap-1">
        <svg 
          className="w-4 h-4 text-red-500" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" 
            clipRule="evenodd" 
          />
        </svg>
        <span className="text-xs font-medium text-red-600">DOWN</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1">
      <svg 
        className="w-4 h-4 text-gray-500" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" 
          clipRule="evenodd" 
        />
      </svg>
      <span className="text-xs font-medium text-gray-600">STABLE</span>
    </div>
  );
};

export const Dashboard = () => {
  const { user, fetchUser } = useAuthStore();
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedEmployeeDepartment, setSelectedEmployeeDepartment] = useState('HR');
  const [selectedAttendanceDepartment, setSelectedAttendanceDepartment] = useState('HR');
  const [selectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchUser().catch((error: Error) => {
      console.error('Failed to fetch user:', error.message);
    });
  }, [fetchUser]);

  // Generate attendance data for current month
  const getAttendanceData = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const employees = employeeData[selectedAttendanceDepartment as keyof typeof employeeData] || [];
    
    const attendanceData = employees.map(employee => {
      const dailyAttendance: { [key: string]: string } = {};
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        if (isWeekend) {
          dailyAttendance[`day${day}`] = '-';
        } else {
          // Simulate attendance status based on employee performance
          const rand = Math.random();
          const baseAttendanceRate = employee.attendance / 100;
          
          if (rand < baseAttendanceRate * 0.85) {
            dailyAttendance[`day${day}`] = '✓'; // Present
          } else if (rand < baseAttendanceRate * 0.95) {
            dailyAttendance[`day${day}`] = 'L'; // Late
          } else {
            dailyAttendance[`day${day}`] = 'X'; // Absent
          }
        }
      }
      
      // Calculate monthly statistics
      const workingDays = Object.values(dailyAttendance).filter(status => status !== '-');
      const presentDays = workingDays.filter(status => status === '✓' || status === 'L').length;
      const lateDays = workingDays.filter(status => status === 'L').length;
      const absentDays = workingDays.filter(status => status === 'X').length;
      const attendanceRate = Math.round((presentDays / workingDays.length) * 100);
      
      return {
        ...employee,
        ...dailyAttendance,
        presentDays,
        lateDays,
        absentDays,
        attendanceRate,
        totalWorkingDays: workingDays.length
      };
    });
    
    return attendanceData;
  };

  // Get days array for current month
  const getCurrentMonthDays = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      days.push({
        day,
        dayName,
        isWeekend
      });
    }
    
    return days;
  };

  // Get last 12 months from current month
  const getLast12MonthsData = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-based (0 = January, 11 = December)
    const currentYear = currentDate.getFullYear();
    
    const last12Months = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      
      // Get month data from our sample data
      const monthData = kpiData[monthIndex];
      
      // Format the month display (e.g., "Jan 2024", "Dec 2023")
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const displayMonth = year === currentYear ? monthNames[monthIndex] : `${monthNames[monthIndex]} ${year}`;
      
      last12Months.push({
        ...monthData,
        month: displayMonth,
        monthIndex: monthIndex,
        year: year
      });
    }
    
    return last12Months;
  };

  // Filter KPI data based on selected department for last 12 months
  const getFilteredData = () => {
    const last12MonthsData = getLast12MonthsData();
    
    if (selectedDepartment === 'All') {
      return last12MonthsData;
    }
    
    return last12MonthsData.map(item => ({
      month: item.month,
      monthIndex: item.monthIndex,
      year: item.year,
      [selectedDepartment]: item[selectedDepartment as keyof typeof item],
    }));
  };

  // Get departments to render in chart
  const getDepartmentsToRender = () => {
    if (selectedDepartment === 'All') {
      return departments.slice(1);
    }
    return [selectedDepartment];
  };

  // Get top 5 employees based on performance
  const getTopEmployees = () => {
    const employees = employeeData[selectedEmployeeDepartment as keyof typeof employeeData] || [];
    return employees
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 5);
  };

  // Calculate statistics based on last 12 months
  const calculateAverageKPI = () => {
    const last12MonthsData = getLast12MonthsData();
    const total = last12MonthsData.reduce((acc, month) => {
      const monthTotal = departments.slice(1).reduce((sum, dept) => {
        return sum + (month[dept as keyof typeof month] as number);
      }, 0);
      return acc + monthTotal / 5;
    }, 0);
    return Math.round(total / last12MonthsData.length);
  };

  const getCurrentMonthKPI = () => {
    const last12MonthsData = getLast12MonthsData();
    const currentMonth = last12MonthsData[last12MonthsData.length - 1]; // Last item is current month
    if (!currentMonth) return 0;
    
    const total = departments.slice(1).reduce((sum, dept) => {
      return sum + (currentMonth[dept as keyof typeof currentMonth] as number);
    }, 0);
    return Math.round(total / 5);
  };

  const getTotalEmployees = () => {
    return Object.values(employeeData).flat().length;
  };

  const getDepartmentStats = (dept: string) => {
    const employees = employeeData[dept as keyof typeof employeeData] || [];
    const avgPerformance = employees.reduce((sum, emp) => sum + emp.performance, 0) / employees.length;
    return {
      count: employees.length,
      avgPerformance: Math.round(avgPerformance),
    };
  };

  const days = getCurrentMonthDays();
  const attendanceData = getAttendanceData();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.username || 'User'}! 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Here's what's happening with your organization today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Username</p>
                  <p className="text-lg">{user?.username || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg">{user?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-lg capitalize">{user?.role || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average KPI (Last 12 Months)</CardTitle>
                <CardDescription>Overall performance trend</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{calculateAverageKPI()}%</p>
                <p className="text-sm text-gray-500">12-Month Average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Month KPI</CardTitle>
                <CardDescription>This month's performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{getCurrentMonthKPI()}%</p>
                <p className="text-sm text-gray-500">Monthly Average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Employees</CardTitle>
                <CardDescription>Active employees</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">{getTotalEmployees()}</p>
                <p className="text-sm text-gray-500">Across all departments</p>
              </CardContent>
            </Card>
          </div>

          {/* Department Performance Summary */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {departments.slice(1).map((dept) => {
              const last12MonthsData = getLast12MonthsData();
              const latestKPI = last12MonthsData[last12MonthsData.length - 1][dept as keyof typeof last12MonthsData[0]] as number;
              const previousKPI = last12MonthsData[last12MonthsData.length - 2][dept as keyof typeof last12MonthsData[0]] as number;
              const trend = latestKPI > previousKPI ? 'up' : latestKPI < previousKPI ? 'down' : 'stable';
              const stats = getDepartmentStats(dept);
              
              return (
                <Card key={dept} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{dept}</span>
                      <TrendIcon trend={trend} />
                    </CardTitle>
                    <CardDescription>Department Overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold" style={{ color: departmentColors[dept as keyof typeof departmentColors] }}>
                        {latestKPI}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {trend === 'up' ? '+' : trend === 'down' ? '' : ''}{(latestKPI - previousKPI).toFixed(1)}% from last month
                      </p>
                    </div>
                    <div className="pt-2 border-t space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{stats.count}</span> employees
                      </p>
                      <p className="text-sm text-gray-600">
                        Avg Performance: <span className="font-medium">{stats.avgPerformance}%</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Employee Attendance Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Employee Attendance - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
                  <CardDescription>Daily attendance tracking for {selectedAttendanceDepartment} department</CardDescription>
                </div>
                <Select value={selectedAttendanceDepartment} onValueChange={setSelectedAttendanceDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.slice(1).map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-white z-10 border-r font-semibold">Employee</TableHead>
                      {days.map((dayInfo) => (
                        <TableHead key={dayInfo.day} className={`text-center min-w-[40px] text-xs ${dayInfo.isWeekend ? 'bg-gray-100 text-gray-500' : ''}`}>
                          <div className="flex flex-col">
                            <span>{dayInfo.day}</span>
                            <span className="text-xs">{dayInfo.dayName}</span>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="text-center font-semibold border-l">Present</TableHead>
                      <TableHead className="text-center font-semibold">Late</TableHead>
                      <TableHead className="text-center font-semibold">Absent</TableHead>
                      <TableHead className="text-center font-semibold">Rate %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="sticky left-0 bg-white z-10 border-r font-medium">
                          {employee.name}
                        </TableCell>
                        {days.map((dayInfo) => {
                          const status = employee[`day${dayInfo.day}` as keyof typeof employee] as string;
                          return (
                            <TableCell 
                              key={dayInfo.day} 
                              className={`text-center text-sm ${dayInfo.isWeekend ? 'bg-gray-50' : ''}`}
                            >
                              <span className={`
                                inline-block w-6 h-6 rounded text-xs leading-6 font-medium
                                ${status === '✓' ? 'bg-green-100 text-green-800' : 
                                  status === 'L' ? 'bg-yellow-100 text-yellow-800' : 
                                  status === 'X' ? 'bg-red-100 text-red-800' : 
                                  'text-gray-400'}
                              `}>
                                {status}
                              </span>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center font-medium border-l text-green-700">
                          {employee.presentDays}
                        </TableCell>
                        <TableCell className="text-center font-medium text-yellow-700">
                          {employee.lateDays}
                        </TableCell>
                        <TableCell className="text-center font-medium text-red-700">
                          {employee.absentDays}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          <Badge 
                            variant="outline" 
                            className={`
                              ${employee.attendanceRate >= 95 ? 'bg-green-100 text-green-800 border-green-200' : 
                                employee.attendanceRate >= 85 ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                                employee.attendanceRate >= 75 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                                'bg-red-100 text-red-800 border-red-200'}
                            `}
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
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded text-xs leading-6 font-medium bg-green-100 text-green-800 text-center">✓</span>
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded text-xs leading-6 font-medium bg-yellow-100 text-yellow-800 text-center">L</span>
                  <span>Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded text-xs leading-6 font-medium bg-red-100 text-red-800 text-center">X</span>
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded text-xs leading-6 font-medium text-gray-400 text-center">-</span>
                  <span>Weekend/Holiday</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department KPI Chart */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Department KPI Performance (Last 12 Months)</CardTitle>
                  <CardDescription>Monthly KPI trends across departments</CardDescription>
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getFilteredData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[70, 100]}
                      tick={{ fontSize: 12 }}
                      label={{ value: 'KPI (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    {getDepartmentsToRender().map((dept) => (
                      <Line
                        key={dept}
                        type="monotone"
                        dataKey={dept}
                        stroke={departmentColors[dept as keyof typeof departmentColors]}
                        strokeWidth={3}
                        dot={{ fill: departmentColors[dept as keyof typeof departmentColors], strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top 5 Employee Details Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Top 5 Performers - {selectedEmployeeDepartment} Department</CardTitle>
                  <CardDescription>Top performing employees based on performance metrics</CardDescription>
                </div>
                <Select value={selectedEmployeeDepartment} onValueChange={setSelectedEmployeeDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.slice(1).map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Productivity</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getTopEmployees().map((employee, index) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-bold
                            ${index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                              index === 1 ? 'bg-gray-100 text-gray-800' : 
                              index === 2 ? 'bg-orange-100 text-orange-800' : 
                              'bg-blue-100 text-blue-800'}
                          `}>
                            #{index + 1}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${employee.performance}%` }}
                            />
                          </div>
                          <span className="text-sm min-w-[35px]">{employee.performance}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${employee.productivity}%` }}
                            />
                          </div>
                          <span className="text-sm min-w-[35px]">{employee.productivity}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${employee.attendance}%` }}
                            />
                          </div>
                          <span className="text-sm min-w-[35px]">{employee.attendance}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={ratingColors[employee.rating as keyof typeof ratingColors]}
                        >
                          {employee.rating}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};