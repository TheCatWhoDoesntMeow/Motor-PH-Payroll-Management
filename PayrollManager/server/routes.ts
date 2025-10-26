import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import type { InsertUser, InsertEmployee, InsertAttendance, InsertLeaveRequest, InsertOvertimeRecord, InsertPayrollRecord, InsertNotification } from "@shared/schema";

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// Role-based authorization middleware
function requireRole(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: "Forbidden - insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;
      
      res.json({ user: { id: user.id, email: user.email, role: user.role, employeeId: user.employeeId } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Employee routes
  app.get("/api/employees", requireRole("admin", "payroll_staff"), async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Get employees error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/employees/me", requireAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeByUserId(req.session.userId!);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      console.error("Get employee error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      // Verify user has permission to view this employee
      const user = await storage.getUser(req.session.userId!);
      const currentEmployee = await storage.getEmployeeByUserId(req.session.userId!);
      
      // Allow if user is admin/payroll_staff OR viewing their own profile
      const isAuthorized = user?.role === "admin" || user?.role === "payroll_staff" || currentEmployee?.id === req.params.id;
      
      if (!isAuthorized) {
        return res.status(403).json({ error: "Forbidden - cannot view other employee's data" });
      }

      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Get employee error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Attendance routes
  app.get("/api/attendance/me", requireAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeByUserId(req.session.userId!);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const attendance = await storage.getAttendance(employee.id);
      res.json(attendance);
    } catch (error) {
      console.error("Get attendance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/attendance/:employeeId", requireAuth, async (req, res) => {
    try {
      // Verify user has permission to view this employee's attendance
      const user = await storage.getUser(req.session.userId!);
      const employee = await storage.getEmployeeByUserId(req.session.userId!);
      
      // Allow if user is admin/payroll_staff OR viewing their own attendance
      const isAuthorized = user?.role === "admin" || user?.role === "payroll_staff" || employee?.id === req.params.employeeId;
      
      if (!isAuthorized) {
        return res.status(403).json({ error: "Forbidden - cannot view other employee's attendance" });
      }

      const month = parseInt(req.query.month as string);
      const year = parseInt(req.query.year as string);

      if (!isNaN(month) && !isNaN(year)) {
        const attendance = await storage.getAttendanceByMonth(req.params.employeeId, month, year);
        return res.json(attendance);
      }

      const attendance = await storage.getAttendance(req.params.employeeId);
      res.json(attendance);
    } catch (error) {
      console.error("Get attendance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/attendance", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      const employee = await storage.getEmployeeByUserId(req.session.userId!);
      
      // Only admin/payroll staff can create attendance for any employee
      // Regular employees can only create their own attendance
      let employeeId = req.body.employeeId;
      
      if (user?.role !== "admin" && user?.role !== "payroll_staff") {
        // Force employee to use their own ID
        if (!employee) {
          return res.status(404).json({ error: "Employee profile not found" });
        }
        employeeId = employee.id;
      }
      
      const attendance = await storage.createAttendance({
        ...req.body,
        employeeId,
      } as InsertAttendance);
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Create attendance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Leave request routes
  app.get("/api/leave-requests/me", requireAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeByUserId(req.session.userId!);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const requests = await storage.getLeaveRequests(employee.id);
      res.json(requests);
    } catch (error) {
      console.error("Get leave requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/leave-requests", requireRole("admin", "payroll_staff"), async (req, res) => {
    try {
      const requests = await storage.getAllLeaveRequests();
      res.json(requests);
    } catch (error) {
      console.error("Get all leave requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/leave-requests", requireAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeByUserId(req.session.userId!);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const request = await storage.createLeaveRequest({
        ...req.body,
        employeeId: employee.id,
      } as InsertLeaveRequest);

      // Create notification for HR
      await storage.createNotification({
        userId: req.session.userId!,
        type: 'leave',
        title: 'New Leave Request',
        message: `${employee.firstName} ${employee.lastName} submitted a ${req.body.leaveType} leave request`,
      } as InsertNotification);

      res.status(201).json(request);
    } catch (error) {
      console.error("Create leave request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/leave-requests/:id", requireRole("admin", "payroll_staff"), async (req, res) => {
    try {
      const updated = await storage.updateLeaveRequest(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Update leave request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Overtime routes
  app.get("/api/overtime/me", requireAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeByUserId(req.session.userId!);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const records = await storage.getOvertimeRecords(employee.id);
      res.json(records);
    } catch (error) {
      console.error("Get overtime records error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/overtime", requireRole("admin", "payroll_staff"), async (req, res) => {
    try {
      const records = await storage.getAllOvertimeRecords();
      res.json(records);
    } catch (error) {
      console.error("Get all overtime records error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/overtime", requireAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeByUserId(req.session.userId!);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const record = await storage.createOvertimeRecord({
        ...req.body,
        employeeId: employee.id,
      } as InsertOvertimeRecord);

      // Create notification for HR
      await storage.createNotification({
        userId: req.session.userId!,
        type: 'overtime',
        title: 'New Overtime Request',
        message: `${employee.firstName} ${employee.lastName} submitted overtime hours for approval`,
      } as InsertNotification);

      res.status(201).json(record);
    } catch (error) {
      console.error("Create overtime record error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/overtime/:id", requireRole("admin", "payroll_staff"), async (req, res) => {
    try {
      const updated = await storage.updateOvertimeRecord(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Update overtime record error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Payroll routes
  app.get("/api/payroll/me", requireAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeByUserId(req.session.userId!);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const records = await storage.getPayrollRecords(employee.id);
      res.json(records);
    } catch (error) {
      console.error("Get payroll records error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/payroll/latest", requireAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeByUserId(req.session.userId!);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const record = await storage.getLatestPayroll(employee.id);
      res.json(record || null);
    } catch (error) {
      console.error("Get latest payroll error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/payroll", requireRole("admin", "payroll_staff"), async (req, res) => {
    try {
      const record = await storage.createPayrollRecord(req.body as InsertPayrollRecord);
      
      // Create notification for employee
      await storage.createNotification({
        userId: req.body.userId,
        type: 'payroll',
        title: 'Payroll Processed',
        message: 'Your payroll has been processed and is ready for review',
      } as InsertNotification);

      res.status(201).json(record);
    } catch (error) {
      console.error("Create payroll record error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Policy routes
  app.get("/api/policies", async (req, res) => {
    try {
      const policies = await storage.getAllPolicies();
      res.json(policies);
    } catch (error) {
      console.error("Get policies error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/policies", requireRole("admin"), async (req, res) => {
    try {
      const policy = await storage.createPolicy(req.body);
      res.status(201).json(policy);
    } catch (error) {
      console.error("Create policy error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotifications(req.session.userId!);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const notification = await storage.markNotificationRead(req.params.id);
      res.json(notification);
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
