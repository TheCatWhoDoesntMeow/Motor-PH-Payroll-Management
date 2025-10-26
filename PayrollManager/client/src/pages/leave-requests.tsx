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
import { formatDate } from '@/lib/utils';
import { Plus, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { LeaveRequest, Employee } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth-context';

export default function LeaveRequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const { data: employee } = useQuery<Employee>({
    queryKey: ['/api/employees/me'],
  });

  const { data: leaveRequests, isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ['/api/leave-requests/me'],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest('POST', '/api/leave-requests', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leave-requests/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employees/me'] });
      toast({
        title: 'Leave Request Submitted',
        description: 'Your leave request has been submitted for approval.',
      });
      setIsDialogOpen(false);
      setFormData({ leaveType: 'vacation', startDate: '', endDate: '', reason: '' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit leave request.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 hover:bg-red-100 dark:hover:bg-red-900"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-900"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const usedLeaves = leaveRequests?.filter(l => l.status === 'approved').length || 0;
  const availableLeaves = (employee?.leaveBalance || 0) - usedLeaves;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>
          <p className="text-muted-foreground mt-1">
            Available Leaves: <span className="font-semibold">{availableLeaves}</span> / {employee?.leaveBalance || 0}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-leave">
              <Plus className="h-4 w-4 mr-2" />
              New Leave Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
              <DialogDescription>
                Submit a new leave request for approval
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select
                  value={formData.leaveType}
                  onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
                >
                  <SelectTrigger data-testid="select-leave-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="maternity">Maternity Leave</SelectItem>
                    <SelectItem value="paternity">Paternity Leave</SelectItem>
                    <SelectItem value="bereavement">Bereavement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    data-testid="input-end-date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please provide a reason for your leave request"
                  required
                  rows={4}
                  data-testid="textarea-reason"
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
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-leave">
                  {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : leaveRequests && leaveRequests.length > 0 ? (
            <div className="space-y-3">
              {leaveRequests.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-md border hover-elevate"
                  data-testid={`leave-${leave.id}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold capitalize">{leave.leaveType.replace('_', ' ')}</h4>
                        {getStatusBadge(leave.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </p>
                      <p className="text-sm mt-1">{leave.reason}</p>
                      {leave.rejectionReason && (
                        <p className="text-sm text-destructive mt-1">
                          Rejection reason: {leave.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(leave.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No leave requests yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "New Leave Request" to submit your first request
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
