import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatPeso, getHourlyRate, calculateOvertimePay } from '@/lib/utils';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { OvertimeRecord, Employee } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth-context';

export default function OvertimePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    hours: '',
    overtimeType: 'regular',
    reason: '',
  });

  const { data: employee } = useQuery<Employee>({
    queryKey: ['/api/employees/me'],
  });

  const { data: overtimeRecords, isLoading } = useQuery<OvertimeRecord[]>({
    queryKey: ['/api/overtime/me'],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('POST', '/api/overtime', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/overtime/me'] });
      toast({
        title: 'Overtime Submitted',
        description: 'Your overtime request has been submitted for approval.',
      });
      setIsDialogOpen(false);
      setFormData({ date: '', hours: '', overtimeType: 'regular', reason: '' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit overtime request.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hourlyRate = getHourlyRate(parseFloat(employee?.baseSalary || '0'));
    const multiplier = formData.overtimeType === 'holiday' ? 2.0 : 
                       formData.overtimeType === 'night_differential' ? 1.5 : 1.25;
    const totalAmount = calculateOvertimePay(hourlyRate, parseFloat(formData.hours), multiplier);

    createMutation.mutate({
      ...formData,
      rateMultiplier: multiplier.toString(),
      totalAmount: totalAmount.toFixed(2),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 hover:bg-red-100 dark:hover:bg-red-900"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-900"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const totalOvertimeHours = overtimeRecords?.reduce((sum, ot) => 
    ot.status === 'approved' ? sum + parseFloat(ot.hours) : sum, 0
  ) || 0;

  const totalOvertimePay = overtimeRecords?.reduce((sum, ot) => 
    ot.status === 'approved' ? sum + parseFloat(ot.totalAmount) : sum, 0
  ) || 0;

  const hourlyRate = getHourlyRate(parseFloat(employee?.baseSalary || '0'));
  const previewMultiplier = formData.overtimeType === 'holiday' ? 2.0 : 
                             formData.overtimeType === 'night_differential' ? 1.5 : 1.25;
  const previewAmount = formData.hours ? 
    calculateOvertimePay(hourlyRate, parseFloat(formData.hours), previewMultiplier) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overtime Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Total Approved Hours: <span className="font-semibold">{totalOvertimeHours.toFixed(2)}</span>
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-overtime">
              <Plus className="h-4 w-4 mr-2" />
              Log Overtime
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Overtime</DialogTitle>
              <DialogDescription>
                Submit overtime hours for approval
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  data-testid="input-overtime-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="e.g., 2.5"
                  required
                  data-testid="input-overtime-hours"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overtimeType">Overtime Type</Label>
                <Select
                  value={formData.overtimeType}
                  onValueChange={(value) => setFormData({ ...formData, overtimeType: value })}
                >
                  <SelectTrigger data-testid="select-overtime-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular (1.25x)</SelectItem>
                    <SelectItem value="holiday">Holiday (2.0x)</SelectItem>
                    <SelectItem value="night_differential">Night Differential (1.5x)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.hours && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Estimated Earnings</p>
                  <p className="text-2xl font-bold tabular-nums mt-1">
                    {formatPeso(previewAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.hours} hours × {formatPeso(hourlyRate)}/hr × {previewMultiplier}x
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Describe the work performed during overtime"
                  required
                  rows={3}
                  data-testid="textarea-overtime-reason"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-overtime">
                  {createMutation.isPending ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Approved Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{totalOvertimeHours.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Overtime Pay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{formatPeso(totalOvertimePay)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overtime Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : overtimeRecords && overtimeRecords.length > 0 ? (
            <div className="space-y-3">
              {overtimeRecords.map((ot) => (
                <div
                  key={ot.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-md border hover-elevate"
                  data-testid={`overtime-${ot.id}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Clock className="h-5 w-5 mt-1 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{formatDate(ot.date)}</h4>
                        {getStatusBadge(ot.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {ot.hours} hours × {ot.rateMultiplier}x multiplier
                      </p>
                      <p className="text-sm mt-1">{ot.reason}</p>
                      <p className="text-sm font-semibold mt-1">{formatPeso(parseFloat(ot.totalAmount))}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No overtime records yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Log Overtime" to submit your first overtime entry
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
