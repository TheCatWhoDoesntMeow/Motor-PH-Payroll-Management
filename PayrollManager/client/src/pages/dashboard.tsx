import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPeso, formatDate, calculateNetPay } from '@/lib/utils';
import {
  DollarSign,
  TrendingDown,
  Calendar,
  Clock,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import type { Employee, PayrollRecord, Attendance, LeaveRequest } from '@shared/schema';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: employee, isLoading: employeeLoading } = useQuery<Employee>({
    queryKey: ['/api/employees/me'],
    enabled: !!user,
  });

  const { data: latestPayroll, isLoading: payrollLoading } = useQuery<PayrollRecord>({
    queryKey: ['/api/payroll/latest'],
    enabled: !!user,
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery<Attendance[]>({
    queryKey: ['/api/attendance/me'],
    enabled: !!user,
  });

  const { data: leaves, isLoading: leavesLoading } = useQuery<LeaveRequest[]>({
    queryKey: ['/api/leave-requests/me'],
    enabled: !!user,
  });

  if (employeeLoading || payrollLoading || attendanceLoading || leavesLoading) {
    return <DashboardSkeleton />;
  }

  const baseSalary = parseFloat(employee?.baseSalary || '0');
  const payrollData = latestPayroll ? calculateNetPay(
    parseFloat(latestPayroll.baseSalary),
    parseFloat(latestPayroll.overtimePay || '0'),
    parseFloat(latestPayroll.allowances || '0')
  ) : calculateNetPay(baseSalary);

  const totalAbsences = attendance?.filter(a => a.status === 'absent').length || 0;
  const totalLateMinutes = attendance?.reduce((sum, a) => sum + (a.lateMinutes || 0), 0) || 0;
  const totalOvertimeHours = attendance?.reduce((sum, a) => sum + parseFloat(a.overtimeHours || '0'), 0) || 0;
  const usedLeaves = leaves?.filter(l => l.status === 'approved').length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {employee?.firstName} {employee?.lastName}
        </h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-net-pay">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Net Pay
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums" data-testid="text-net-pay">
              {formatPeso(payrollData.netPay)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Next pay: {formatDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-base-salary">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Base Salary
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums" data-testid="text-base-salary">
              {formatPeso(baseSalary)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{employee?.position}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-deductions">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Deductions
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums" data-testid="text-deductions">
              {formatPeso(payrollData.deductions.total)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Monthly deductions</p>
          </CardContent>
        </Card>

        <Card data-testid="card-leave-balance">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leave Balance
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums" data-testid="text-leave-balance">
              {(employee?.leaveBalance || 0) - usedLeaves}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Days available</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Absences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAbsences}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Late Minutes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLateMinutes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overtime Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOvertimeHours.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Allowances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPeso(parseFloat(latestPayroll?.allowances || '0'))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Tax & Deduction Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sss" data-testid="accordion-sss">
              <AccordionTrigger className="text-base font-medium">
                SSS Contribution
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Employee Share</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatPeso(payrollData.deductions.sss)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on monthly salary bracket
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="philhealth" data-testid="accordion-philhealth">
              <AccordionTrigger className="text-base font-medium">
                PhilHealth Contribution
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Employee Share (1.5%)</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatPeso(payrollData.deductions.philHealth)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    3% monthly premium split with employer
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pagibig" data-testid="accordion-pagibig">
              <AccordionTrigger className="text-base font-medium">
                Pag-IBIG Contribution
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Employee Share</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatPeso(payrollData.deductions.pagIbig)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fixed monthly deduction
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tax" data-testid="accordion-withholding-tax">
              <AccordionTrigger className="text-base font-medium">
                Withholding Tax
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">BIR Withholding Tax</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatPeso(payrollData.deductions.withholdingTax)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on annual tax table
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="text-base font-semibold">Total Deductions</span>
            <span className="text-lg font-bold tabular-nums">
              {formatPeso(payrollData.deductions.total)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
