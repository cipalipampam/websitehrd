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
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
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

// Sample KPI data - Updated dengan 8 departemen
const kpiData = [
  { month: 'Jan', Analytics: 85, Finance: 92, HR: 78, Operations: 88, Procurement: 82, 'R&D': 90, 'Sales & Marketing': 84, Technology: 95 },
  { month: 'Feb', Analytics: 88, Finance: 89, HR: 82, Operations: 85, Procurement: 86, 'R&D': 92, 'Sales & Marketing': 87, Technology: 93 },
  { month: 'Mar', Analytics: 92, Finance: 94, HR: 85, Operations: 90, Procurement: 89, 'R&D': 94, 'Sales & Marketing': 91, Technology: 97 },
  { month: 'Apr', Analytics: 89, Finance: 91, HR: 88, Operations: 87, Procurement: 91, 'R&D': 89, 'Sales & Marketing': 93, Technology: 94 },
  { month: 'May', Analytics: 94, Finance: 96, HR: 90, Operations: 93, Procurement: 87, 'R&D': 95, 'Sales & Marketing': 89, Technology: 98 },
  { month: 'Jun', Analytics: 91, Finance: 93, HR: 87, Operations: 89, Procurement: 94, 'R&D': 93, 'Sales & Marketing': 92, Technology: 96 },
  { month: 'Jul', Analytics: 96, Finance: 97, HR: 92, Operations: 95, Procurement: 90, 'R&D': 97, 'Sales & Marketing': 94, Technology: 99 },
  { month: 'Aug', Analytics: 93, Finance: 95, HR: 89, Operations: 91, Procurement: 93, 'R&D': 95, 'Sales & Marketing': 91, Technology: 97 },
  { month: 'Sep', Analytics: 97, Finance: 98, HR: 94, Operations: 96, Procurement: 95, 'R&D': 98, 'Sales & Marketing': 96, Technology: 100 },
  { month: 'Oct', Analytics: 95, Finance: 96, HR: 91, Operations: 93, Procurement: 97, 'R&D': 96, 'Sales & Marketing': 94, Technology: 98 },
  { month: 'Nov', Analytics: 98, Finance: 99, HR: 95, Operations: 97, Procurement: 94, 'R&D': 99, 'Sales & Marketing': 97, Technology: 99 },
  { month: 'Dec', Analytics: 96, Finance: 97, HR: 93, Operations: 95, Procurement: 96, 'R&D': 97, 'Sales & Marketing': 95, Technology: 98 },
];

// Sample Employee Performance Data - Updated dengan 8 departemen
const employeeData = {
  Analytics: [
    { id: 1, name: 'Alice Johnson', position: 'Data Analyst', performance: 95, productivity: 88, attendance: 98, rating: 'Excellent' },
    { id: 2, name: 'Bob Smith', position: 'Business Intelligence Specialist', performance: 87, productivity: 85, attendance: 92, rating: 'Good' },
    { id: 3, name: 'Carol Davis', position: 'Data Scientist', performance: 91, productivity: 89, attendance: 96, rating: 'Excellent' },
    { id: 4, name: 'David Wilson', position: 'Analytics Manager', performance: 93, productivity: 91, attendance: 97, rating: 'Excellent' },
    { id: 33, name: 'Emma Thompson', position: 'Statistician', performance: 89, productivity: 86, attendance: 94, rating: 'Good' },
  ],
  Finance: [
    { id: 5, name: 'Frank Brown', position: 'Finance Manager', performance: 98, productivity: 95, attendance: 99, rating: 'Excellent' },
    { id: 6, name: 'Grace Miller', position: 'Accountant', performance: 89, productivity: 87, attendance: 94, rating: 'Good' },
    { id: 7, name: 'Henry Taylor', position: 'Financial Analyst', performance: 93, productivity: 91, attendance: 97, rating: 'Excellent' },
    { id: 8, name: 'Isabella Clark', position: 'Budget Specialist', performance: 85, productivity: 83, attendance: 90, rating: 'Good' },
    { id: 34, name: 'Jack Wilson', position: 'Investment Analyst', performance: 92, productivity: 89, attendance: 95, rating: 'Excellent' },
  ],
  HR: [
    { id: 9, name: 'Karen Rodriguez', position: 'HR Manager', performance: 94, productivity: 92, attendance: 96, rating: 'Excellent' },
    { id: 10, name: 'Leo Martinez', position: 'Recruitment Specialist', performance: 88, productivity: 90, attendance: 89, rating: 'Good' },
    { id: 11, name: 'Maya Lee', position: 'Training Coordinator', performance: 86, productivity: 84, attendance: 91, rating: 'Good' },
    { id: 12, name: 'Noah Anderson', position: 'HR Assistant', performance: 82, productivity: 78, attendance: 88, rating: 'Average' },
    { id: 35, name: 'Olivia Garcia', position: 'Employee Relations Specialist', performance: 90, productivity: 87, attendance: 93, rating: 'Good' },
  ],
  Operations: [
    { id: 13, name: 'Paul Thompson', position: 'Operations Manager', performance: 96, productivity: 94, attendance: 98, rating: 'Excellent' },
    { id: 14, name: 'Quinn White', position: 'Process Coordinator', performance: 89, productivity: 86, attendance: 92, rating: 'Good' },
    { id: 15, name: 'Ryan Garcia', position: 'Quality Analyst', performance: 87, productivity: 85, attendance: 90, rating: 'Good' },
    { id: 16, name: 'Sophia Lopez', position: 'Operations Assistant', performance: 83, productivity: 80, attendance: 87, rating: 'Average' },
    { id: 36, name: 'Tyler Johnson', position: 'Supply Chain Coordinator', performance: 91, productivity: 88, attendance: 94, rating: 'Good' },
  ],
  Procurement: [
    { id: 17, name: 'Uma Harris', position: 'Procurement Manager', performance: 92, productivity: 88, attendance: 95, rating: 'Excellent' },
    { id: 18, name: 'Victor Green', position: 'Sourcing Specialist', performance: 86, productivity: 84, attendance: 91, rating: 'Good' },
    { id: 19, name: 'Wendy Young', position: 'Vendor Relations Manager', performance: 89, productivity: 87, attendance: 93, rating: 'Good' },
    { id: 20, name: 'Xavier King', position: 'Procurement Assistant', performance: 80, productivity: 78, attendance: 85, rating: 'Average' },
    { id: 37, name: 'Yara Scott', position: 'Contract Specialist', performance: 88, productivity: 85, attendance: 92, rating: 'Good' },
  ],
  'R&D': [
    { id: 21, name: 'Zoe Patel', position: 'Research Manager', performance: 97, productivity: 95, attendance: 99, rating: 'Excellent' },
    { id: 22, name: 'Adam Chen', position: 'Product Developer', performance: 91, productivity: 89, attendance: 94, rating: 'Good' },
    { id: 23, name: 'Blake Kumar', position: 'Research Scientist', performance: 93, productivity: 91, attendance: 96, rating: 'Excellent' },
    { id: 24, name: 'Chloe Lopez', position: 'Innovation Specialist', performance: 88, productivity: 86, attendance: 92, rating: 'Good' },
    { id: 38, name: 'Derek Miller', position: 'Lab Technician', performance: 85, productivity: 83, attendance: 89, rating: 'Good' },
  ],
  'Sales & Marketing': [
    { id: 25, name: 'Eva Tanaka', position: 'Sales Manager', performance: 94, productivity: 92, attendance: 97, rating: 'Excellent' },
    { id: 26, name: 'Felix Williams', position: 'Marketing Specialist', performance: 87, productivity: 85, attendance: 90, rating: 'Good' },
    { id: 27, name: 'Gina Johnson', position: 'Digital Marketing Manager', performance: 90, productivity: 88, attendance: 93, rating: 'Good' },
    { id: 28, name: 'Hugo Rodriguez', position: 'Sales Representative', performance: 84, productivity: 82, attendance: 88, rating: 'Average' },
    { id: 39, name: 'Iris Davis', position: 'Brand Manager', performance: 92, productivity: 89, attendance: 95, rating: 'Excellent' },
  ],
  Technology: [
    { id: 29, name: 'Jake Brown', position: 'Tech Lead', performance: 98, productivity: 96, attendance: 99, rating: 'Excellent' },
    { id: 30, name: 'Kate Smith', position: 'Software Engineer', performance: 92, productivity: 90, attendance: 95, rating: 'Excellent' },
    { id: 31, name: 'Liam Davis', position: 'DevOps Engineer', performance: 94, productivity: 92, attendance: 97, rating: 'Excellent' },
    { id: 32, name: 'Mia Wilson', position: 'System Administrator', performance: 88, productivity: 86, attendance: 91, rating: 'Good' },
    { id: 40, name: 'Nathan Clark', position: 'Full Stack Developer', performance: 95, productivity: 93, attendance: 98, rating: 'Excellent' },
  ],
};

// Updated departments array
const departments = ['Analytics', 'Finance', 'HR', 'Operations', 'Procurement', 'R&D', 'Sales & Marketing', 'Technology'];

const departmentColors = {
  Analytics: '#8884d8',
  Finance: '#82ca9d',
  HR: '#ffc658',
  Operations: '#ff7300',
  Procurement: '#8dd1e1',
  'R&D': '#d084d8',
  'Sales & Marketing': '#82d982',
  Technology: '#ff8042',
};

const ratingColors = {
  'Excellent': 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
  'Good': 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'Average': 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  'Poor': 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
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
        <span className="text-xs font-medium text-green-600 dark:text-green-400">UP</span>
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
        <span className="text-xs font-medium text-red-600 dark:text-red-400">DOWN</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1">
      <svg 
        className="w-4 h-4 text-gray-500 dark:text-gray-400" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" 
          clipRule="evenodd" 
        />
      </svg>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">STABLE</span>
    </div>
  );
};

export const Dashboard = () => {
  const { user, fetchUser } = useAuthStore();
  // Updated to use multi-selection for chart departments
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(['Analytics', 'Finance', 'Technology']);
  const [selectedEmployeeDepartment, setSelectedEmployeeDepartment] = useState('Analytics');
  const [selectedAttendanceDepartment, setSelectedAttendanceDepartment] = useState('Analytics');
  const [selectedAttendanceMonth, setSelectedAttendanceMonth] = useState(new Date().getMonth());
  const [selectedAttendanceYear, setSelectedAttendanceYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchUser().catch((error: Error) => {
      console.error('Failed to fetch user:', error.message);
    });
  }, [fetchUser]);

  // Helper Functions
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

  // Multi-selection handlers
  const handleDepartmentToggle = (department: string) => {
    setSelectedDepartments(prev => {
      if (prev.includes(department)) {
        // Don't allow removing if it's the last selected department
        if (prev.length === 1) return prev;
        return prev.filter(d => d !== department);
      } else {
        return [...prev, department];
      }
    });
  };

  const handleSelectAllDepartments = () => {
    setSelectedDepartments(departments);
  };

  const handleClearAllDepartments = () => {
    setSelectedDepartments(['Analytics']); // Keep at least one selected
  };

  // Generate attendance data for selected month and year
  const getAttendanceData = () => {
    const year = selectedAttendanceYear;
    const month = selectedAttendanceMonth;
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
          // Simulate attendance status with consistent seed
          const seed = employee.id + day + month * 31 + year * 365;
          const rand = Math.sin(seed) * 10000 % 1;
          const normalizedRand = Math.abs(rand);
          const baseAttendanceRate = employee.attendance / 100;
          
          if (normalizedRand < baseAttendanceRate * 0.85) {
            dailyAttendance[`day${day}`] = '✓'; // Present
          } else if (normalizedRand < baseAttendanceRate * 0.95) {
            dailyAttendance[`day${day}`] = 'L'; // Late
          } else {
            dailyAttendance[`day${day}`] = 'X'; // Absent
          }
        }
      }
      
      // Calculate monthly statistics
      const workingDays = Object.values(dailyAttendance).filter(status => status !== '-');
      const presentDays = workingDays.filter(status => status === '✓').length;
      const lateDays = workingDays.filter(status => status === 'L').length;
      const absentDays = workingDays.filter(status => status === 'X').length;
      const totalAttended = presentDays + lateDays;
      const attendanceRate = workingDays.length > 0 ? Math.round((totalAttended / workingDays.length) * 100) : 0;
      
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

  // Get days array for selected month and year
  const getSelectedMonthDays = () => {
    const year = selectedAttendanceYear;
    const month = selectedAttendanceMonth;
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

  // Updated filter function to show multiple selected departments
  const getFilteredData = () => {
    const last12MonthsData = getLast12MonthsData();
    
    return last12MonthsData.map(item => {
      const filteredItem: any = {
        month: item.month,
        monthIndex: item.monthIndex,
        year: item.year,
      };
      
      // Add only selected departments to the data
      selectedDepartments.forEach(dept => {
        filteredItem[dept] = item[dept as keyof typeof item];
      });
      
      return filteredItem;
    });
  };

  // Updated to return selected departments
  const getDepartmentsToRender = () => {
    return selectedDepartments;
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
      const monthTotal = departments.reduce((sum, dept) => {
        return sum + (month[dept as keyof typeof month] as number);
      }, 0);
      return acc + monthTotal / 8; // Updated untuk 8 departemen
    }, 0);
    return Math.round(total / last12MonthsData.length);
  };

  const getCurrentMonthKPI = () => {
    const last12MonthsData = getLast12MonthsData();
    const currentMonth = last12MonthsData[last12MonthsData.length - 1]; // Last item is current month
    if (!currentMonth) return 0;
    
    const total = departments.reduce((sum, dept) => {
      return sum + (currentMonth[dept as keyof typeof currentMonth] as number);
    }, 0);
    return Math.round(total / 8); // Updated untuk 8 departemen
  };

  const getTotalEmployees = () => {
    return Object.values(employeeData).flat().length;
  };

  const getDepartmentStats = (dept: string) => {
    const employees = employeeData[dept as keyof typeof employeeData] || [];
    if (employees.length === 0) return { count: 0, avgPerformance: 0 };
    
    const avgPerformance = employees.reduce((sum, emp) => sum + emp.performance, 0) / employees.length;
    return {
      count: employees.length,
      avgPerformance: Math.round(avgPerformance),
    };
  };

  // Get monthly attendance summary
  const getAttendanceSummary = () => {
    const attendanceData = getAttendanceData();
    
    if (attendanceData.length === 0) return {
      averageAttendance: 0,
      totalPresent: 0,
      totalLate: 0,
      totalAbsent: 0,
      workingDays: 0
    };

    const totalPresent = attendanceData.reduce((sum, emp) => sum + emp.presentDays, 0);
    const totalLate = attendanceData.reduce((sum, emp) => sum + emp.lateDays, 0);
    const totalAbsent = attendanceData.reduce((sum, emp) => sum + emp.absentDays, 0);
    const workingDays = attendanceData[0]?.totalWorkingDays || 0;
    const totalPossible = attendanceData.length * workingDays;
    const averageAttendance = totalPossible > 0 ? Math.round(((totalPresent + totalLate) / totalPossible) * 100) : 0;

    return {
      averageAttendance,
      totalPresent,
      totalLate,
      totalAbsent,
      workingDays
    };
  };

  const days = getSelectedMonthDays();
  const attendanceData = getAttendanceData();
  const attendanceSummary = getAttendanceSummary();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Average KPI (Last 12 Months)</CardTitle>
                <CardDescription>Overall performance trend</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{calculateAverageKPI()}%</p>
                <p className="text-sm text-muted-foreground">12-Month Average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Month KPI</CardTitle>
                <CardDescription>This month's performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{getCurrentMonthKPI()}%</p>
                <p className="text-sm text-muted-foreground">Monthly Average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Employees</CardTitle>
                <CardDescription>Active employees</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{getTotalEmployees()}</p>
                <p className="text-sm text-muted-foreground">Across 8 departments</p>
              </CardContent>
            </Card>
          </div>

          {/* Department Performance Summary */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {departments.map((dept) => {
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
                      <p className="text-sm text-muted-foreground">
                        {trend === 'up' ? '+' : trend === 'down' ? '' : ''}{(latestKPI - previousKPI).toFixed(1)}% from last month
                      </p>
                    </div>
                    <div className="pt-2 border-t space-y-1">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{stats.count}</span> employees
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Avg Performance: <span className="font-medium text-foreground">{stats.avgPerformance}%</span>
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
                  <CardTitle>Employee Attendance - {getMonthName(selectedAttendanceMonth)} {selectedAttendanceYear}</CardTitle>
                  <CardDescription>Daily attendance tracking for {selectedAttendanceDepartment} department</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background z-10 border-r font-semibold min-w-[120px]">Employee</TableHead>
                      {days.map((dayInfo) => (
                        <TableHead key={dayInfo.day} className={`text-center min-w-[40px] text-xs ${dayInfo.isWeekend ? 'bg-muted/50 text-muted-foreground' : ''}`}>
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
                        <TableCell className="sticky left-0 bg-background z-10 border-r font-medium">
                          {employee.name}
                        </TableCell>
                        {days.map((dayInfo) => {
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
                                  'text-muted-foreground'}
                              `}>
                                {status}
                              </span>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center font-medium border-l text-green-700 dark:text-green-400">
                          {employee.presentDays}
                        </TableCell>
                        <TableCell className="text-center font-medium text-yellow-700 dark:text-yellow-400">
                          {employee.lateDays}
                        </TableCell>
                        <TableCell className="text-center font-medium text-red-700 dark:text-red-400">
                          {employee.absentDays}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          <Badge 
                            variant="outline" 
                            className={`
                              ${employee.attendanceRate >= 95 ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' : 
                                employee.attendanceRate >= 85 ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 
                                employee.attendanceRate >= 75 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' : 
                                'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'}
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
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary - {getMonthName(selectedAttendanceMonth)} {selectedAttendanceYear}</CardTitle>
              <CardDescription>{selectedAttendanceDepartment} Department Statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceSummary.averageAttendance}%</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Average Attendance</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{attendanceSummary.totalPresent}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Total Present</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{attendanceSummary.totalLate}</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Total Late</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceSummary.totalAbsent}</p>
                  <p className="text-sm text-red-700 dark:text-red-300">Total Absent</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{attendanceSummary.workingDays}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Working Days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department KPI Chart - Updated with multi-selection */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Department KPI Performance (Last 12 Months)</CardTitle>
                  <CardDescription>
                    Monthly KPI trends for selected departments ({selectedDepartments.length} selected)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-48">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                        Filter Departments ({selectedDepartments.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm" onClick={handleSelectAllDepartments}>
                            Select All
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleClearAllDepartments}>
                            Clear All
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {departments.map((dept) => (
                            <div key={dept} className="flex items-center space-x-2">
                              <Checkbox
                                id={dept}
                                checked={selectedDepartments.includes(dept)}
                                onCheckedChange={() => handleDepartmentToggle(dept)}
                              />
                              <label
                                htmlFor={dept}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                              >
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: departmentColors[dept as keyof typeof departmentColors] }}
                                />
                                {dept}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
                            ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' : 
                              index === 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' : 
                              index === 2 ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300' : 
                              'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'}
                          `}>
                            #{index + 1}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${employee.performance}%` }}
                            />
                          </div>
                          <span className="text-sm min-w-[35px]">{employee.performance}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${employee.productivity}%` }}
                            />
                          </div>
                          <span className="text-sm min-w-[35px]">{employee.productivity}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-yellow-500 dark:bg-yellow-400 h-2 rounded-full transition-all duration-300" 
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