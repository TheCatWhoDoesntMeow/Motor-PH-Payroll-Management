import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { formatDate } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Attendance, Employee } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function AttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('me');

  const isHR = user?.role === 'admin' || user?.role === 'payroll_staff';

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
    enabled: isHR,
  });

  const { data: attendanceRecords, isLoading } = useQuery<Attendance[]>({
    queryKey: ['/api/attendance', selectedEmployee, currentMonth.getMonth(), currentMonth.getFullYear()],
    enabled: !!user,
  });

  const attendanceMap = new Map(
    attendanceRecords?.map(record => [record.date, record]) || []
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900';
      case 'absent': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 hover:bg-red-100 dark:hover:bg-red-900';
      case 'late': return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 hover:bg-orange-100 dark:hover:bg-orange-900';
      case 'overtime': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Calendar</h1>
          <p className="text-muted-foreground mt-1">Track daily attendance records</p>
        </div>
        
        {isHR && employees && (
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-64" data-testid="select-employee">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="me">All Employees</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-xl">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth} data-testid="button-prev-month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} data-testid="button-next-month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-muted-foreground">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-muted-foreground">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500"></div>
              <span className="text-sm text-muted-foreground">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-muted-foreground">Overtime</span>
            </div>
          </div>

          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">Loading attendance...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2"></div>
              ))}
              
              {Array.from({ 
                length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() 
              }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const record = attendanceMap.get(dateStr);
                
                return (
                  <div
                    key={day}
                    className={`p-2 rounded-md border min-h-20 ${record ? getStatusColor(record.status) : 'border-border'}`}
                    data-testid={`cell-${dateStr}`}
                  >
                    <div className="text-sm font-medium">{day}</div>
                    {record && (
                      <div className="mt-1 space-y-1">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {record.status}
                        </Badge>
                        {record.lateMinutes && record.lateMinutes > 0 && (
                          <div className="text-xs">+{record.lateMinutes}min</div>
                        )}
                        {record.overtimeHours && parseFloat(record.overtimeHours) > 0 && (
                          <div className="text-xs">OT: {record.overtimeHours}h</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
