import { useAuth } from '@/lib/auth-context';
import { Link } from 'wouter';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Clock,
  DollarSign,
  BarChart3,
  BookOpen,
  Settings,
  LogOut,
  Building2,
  User,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AppSidebarProps {
  currentPath: string;
}

export function AppSidebar({ currentPath }: AppSidebarProps) {
  const { user, logout } = useAuth();

  const hrAdminMenuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Employee Management', url: '/employees', icon: Users },
    { title: 'Attendance Calendar', url: '/attendance', icon: Calendar },
    { title: 'Leave Approvals', url: '/leave-approvals', icon: FileText },
    { title: 'Overtime Management', url: '/overtime', icon: Clock },
    { title: 'Payroll Generator', url: '/payroll', icon: DollarSign },
    { title: 'Reports', url: '/reports', icon: BarChart3 },
    { title: 'Policy Hub', url: '/policies', icon: BookOpen },
  ];

  const employeeMenuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'My Attendance', url: '/my-attendance', icon: Calendar },
    { title: 'Leave Requests', url: '/leave-requests', icon: FileText },
    { title: 'Overtime Tracking', url: '/my-overtime', icon: Clock },
    { title: 'Payroll History', url: '/payroll-history', icon: DollarSign },
    { title: 'Tax Breakdown', url: '/tax-breakdown', icon: BarChart3 },
    { title: 'My Profile', url: '/profile', icon: User },
    { title: 'Policy Reference', url: '/policies', icon: BookOpen },
  ];

  const menuItems = user?.role === 'employee' ? employeeMenuItems : hrAdminMenuItems;

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">Motor PH</h2>
            <p className="text-xs text-muted-foreground">Payroll System</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide px-3">
            {user?.role === 'employee' ? 'Employee Portal' : 'HR & Administration'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url} data-testid={`link-${item.url.substring(1)}`}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role !== 'employee' && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wide px-3">
                System
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={currentPath === '/settings'}>
                      <Link href="/settings">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-3">
          <div className="px-3 py-2 bg-sidebar-accent rounded-md">
            <p className="text-sm font-semibold text-sidebar-accent-foreground">
              {user?.role === 'admin' && 'Administrator'}
              {user?.role === 'payroll_staff' && 'Payroll Staff'}
              {user?.role === 'employee' && 'Employee'}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
