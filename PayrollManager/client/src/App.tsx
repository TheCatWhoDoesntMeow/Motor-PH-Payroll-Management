import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import AttendancePage from "@/pages/attendance";
import LeaveRequestsPage from "@/pages/leave-requests";
import OvertimePage from "@/pages/overtime";
import PayrollHistoryPage from "@/pages/payroll-history";
import PoliciesPage from "@/pages/policies";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  return <Component />;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  return (
    <div className="flex h-screen w-full">
      <AppSidebar currentPath={location} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between gap-4 p-4 border-b bg-background sticky top-0 z-10">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {user ? (
        <SidebarProvider style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
          <Route path="/dashboard">
            <AppLayout>
              <ProtectedRoute component={Dashboard} />
            </AppLayout>
          </Route>
          
          <Route path="/attendance">
            <AppLayout>
              <ProtectedRoute component={AttendancePage} />
            </AppLayout>
          </Route>
          
          <Route path="/my-attendance">
            <AppLayout>
              <ProtectedRoute component={AttendancePage} />
            </AppLayout>
          </Route>
          
          <Route path="/leave-requests">
            <AppLayout>
              <ProtectedRoute component={LeaveRequestsPage} />
            </AppLayout>
          </Route>
          
          <Route path="/my-overtime">
            <AppLayout>
              <ProtectedRoute component={OvertimePage} />
            </AppLayout>
          </Route>
          
          <Route path="/overtime">
            <AppLayout>
              <ProtectedRoute component={OvertimePage} />
            </AppLayout>
          </Route>
          
          <Route path="/payroll-history">
            <AppLayout>
              <ProtectedRoute component={PayrollHistoryPage} />
            </AppLayout>
          </Route>
          
          <Route path="/policies">
            <AppLayout>
              <ProtectedRoute component={PoliciesPage} />
            </AppLayout>
          </Route>
          
          <Route path="/">
            <Redirect to="/dashboard" />
          </Route>
        </SidebarProvider>
      ) : (
        <Route path="/">
          <Redirect to="/login" />
        </Route>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
