import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatPeso } from '@/lib/utils';
import { Download, DollarSign, Calendar } from 'lucide-react';
import type { PayrollRecord, Employee } from '@shared/schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PayrollHistoryPage() {
  const { data: employee, isLoading: employeeLoading } = useQuery<Employee>({
    queryKey: ['/api/employees/me'],
  });

  const { data: payrollRecords, isLoading } = useQuery<PayrollRecord[]>({
    queryKey: ['/api/payroll/me'],
  });

  const currentYearRecords = payrollRecords?.filter(
    (record) => new Date(record.periodStart).getFullYear() === new Date().getFullYear()
  ) || [];

  const ytdGrossPay = currentYearRecords.reduce(
    (sum, record) => sum + parseFloat(record.baseSalary) + parseFloat(record.overtimePay || '0') + parseFloat(record.allowances || '0'),
    0
  );

  const ytdDeductions = currentYearRecords.reduce(
    (sum, record) => sum + parseFloat(record.totalDeductions),
    0
  );

  const ytdNetPay = currentYearRecords.reduce(
    (sum, record) => sum + parseFloat(record.netPay),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll History</h1>
        <p className="text-muted-foreground mt-1">View your salary records and download payslips</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              YTD Gross Pay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{formatPeso(ytdGrossPay)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              YTD Deductions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{formatPeso(ytdDeductions)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              YTD Net Pay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{formatPeso(ytdNetPay)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : payrollRecords && payrollRecords.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead className="text-right">Net Pay</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((record) => (
                    <TableRow key={record.id} data-testid={`payroll-${record.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{formatDate(record.periodStart)}</div>
                            <div className="text-xs text-muted-foreground">
                              to {formatDate(record.periodEnd)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">{formatPeso(parseFloat(record.baseSalary))}</TableCell>
                      <TableCell className="tabular-nums">{formatPeso(parseFloat(record.overtimePay || '0'))}</TableCell>
                      <TableCell className="tabular-nums">{formatPeso(parseFloat(record.totalDeductions))}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold tabular-nums">{formatPeso(parseFloat(record.netPay))}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" data-testid={`button-download-${record.id}`}>
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payroll records yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
