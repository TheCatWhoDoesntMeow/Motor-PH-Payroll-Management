// Based on javascript_database blueprint integration
import {
  users,
  employees,
  attendance,
  leaveRequests,
  overtimeRecords,
  payrollRecords,
  notifications,
  policies,
  type User,
  type InsertUser,
  type Employee,
  type InsertEmployee,
  type Attendance,
  type InsertAttendance,
  type LeaveRequest,
  type InsertLeaveRequest,
  type OvertimeRecord,
  type InsertOvertimeRecord,
  type PayrollRecord,
  type InsertPayrollRecord,
  type Notification,
  type InsertNotification,
  type Policy,
  type InsertPolicy,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Employee operations
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByUserId(userId: string): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee>;
  
  // Attendance operations
  getAttendance(employeeId: string): Promise<Attendance[]>;
  getAttendanceByMonth(employeeId: string, month: number, year: number): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance>;
  
  // Leave request operations
  getLeaveRequests(employeeId: string): Promise<LeaveRequest[]>;
  getAllLeaveRequests(): Promise<LeaveRequest[]>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest>;
  
  // Overtime operations
  getOvertimeRecords(employeeId: string): Promise<OvertimeRecord[]>;
  getAllOvertimeRecords(): Promise<OvertimeRecord[]>;
  createOvertimeRecord(record: InsertOvertimeRecord): Promise<OvertimeRecord>;
  updateOvertimeRecord(id: string, updates: Partial<OvertimeRecord>): Promise<OvertimeRecord>;
  
  // Payroll operations
  getPayrollRecords(employeeId: string): Promise<PayrollRecord[]>;
  getLatestPayroll(employeeId: string): Promise<PayrollRecord | undefined>;
  createPayrollRecord(record: InsertPayrollRecord): Promise<PayrollRecord>;
  
  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<Notification>;
  
  // Policy operations
  getAllPolicies(): Promise<Policy[]>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Employee operations
  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async getEmployeeByUserId(userId: string): Promise<Employee | undefined> {
    const user = await this.getUser(userId);
    if (!user?.employeeId) return undefined;
    return this.getEmployee(user.employeeId);
  }

  async getAllEmployees(): Promise<Employee[]> {
    return db.select().from(employees).orderBy(employees.lastName);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db
      .insert(employees)
      .values(insertEmployee)
      .returning();
    return employee;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const [employee] = await db
      .update(employees)
      .set(updates)
      .where(eq(employees.id, id))
      .returning();
    return employee;
  }

  // Attendance operations
  async getAttendance(employeeId: string): Promise<Attendance[]> {
    return db
      .select()
      .from(attendance)
      .where(eq(attendance.employeeId, employeeId))
      .orderBy(desc(attendance.date));
  }

  async getAttendanceByMonth(employeeId: string, month: number, year: number): Promise<Attendance[]> {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;
    
    return db
      .select()
      .from(attendance)
      .where(eq(attendance.employeeId, employeeId));
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const [record] = await db
      .insert(attendance)
      .values(insertAttendance)
      .returning();
    return record;
  }

  async updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance> {
    const [record] = await db
      .update(attendance)
      .set(updates)
      .where(eq(attendance.id, id))
      .returning();
    return record;
  }

  // Leave request operations
  async getLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
    return db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.employeeId, employeeId))
      .orderBy(desc(leaveRequests.createdAt));
  }

  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    return db
      .select()
      .from(leaveRequests)
      .orderBy(desc(leaveRequests.createdAt));
  }

  async createLeaveRequest(insertRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const [request] = await db
      .insert(leaveRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const [request] = await db
      .update(leaveRequests)
      .set(updates)
      .where(eq(leaveRequests.id, id))
      .returning();
    return request;
  }

  // Overtime operations
  async getOvertimeRecords(employeeId: string): Promise<OvertimeRecord[]> {
    return db
      .select()
      .from(overtimeRecords)
      .where(eq(overtimeRecords.employeeId, employeeId))
      .orderBy(desc(overtimeRecords.createdAt));
  }

  async getAllOvertimeRecords(): Promise<OvertimeRecord[]> {
    return db
      .select()
      .from(overtimeRecords)
      .orderBy(desc(overtimeRecords.createdAt));
  }

  async createOvertimeRecord(insertRecord: InsertOvertimeRecord): Promise<OvertimeRecord> {
    const [record] = await db
      .insert(overtimeRecords)
      .values(insertRecord)
      .returning();
    return record;
  }

  async updateOvertimeRecord(id: string, updates: Partial<OvertimeRecord>): Promise<OvertimeRecord> {
    const [record] = await db
      .update(overtimeRecords)
      .set(updates)
      .where(eq(overtimeRecords.id, id))
      .returning();
    return record;
  }

  // Payroll operations
  async getPayrollRecords(employeeId: string): Promise<PayrollRecord[]> {
    return db
      .select()
      .from(payrollRecords)
      .where(eq(payrollRecords.employeeId, employeeId))
      .orderBy(desc(payrollRecords.periodStart));
  }

  async getLatestPayroll(employeeId: string): Promise<PayrollRecord | undefined> {
    const [record] = await db
      .select()
      .from(payrollRecords)
      .where(eq(payrollRecords.employeeId, employeeId))
      .orderBy(desc(payrollRecords.periodStart))
      .limit(1);
    return record || undefined;
  }

  async createPayrollRecord(insertRecord: InsertPayrollRecord): Promise<PayrollRecord> {
    const [record] = await db
      .insert(payrollRecords)
      .values(insertRecord)
      .returning();
    return record;
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  // Policy operations
  async getAllPolicies(): Promise<Policy[]> {
    return db
      .select()
      .from(policies)
      .orderBy(policies.category, policies.title);
  }

  async createPolicy(insertPolicy: InsertPolicy): Promise<Policy> {
    const [policy] = await db
      .insert(policies)
      .values(insertPolicy)
      .returning();
    return policy;
  }
}

export const storage = new DatabaseStorage();
