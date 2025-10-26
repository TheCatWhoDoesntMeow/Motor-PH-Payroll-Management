import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, date, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "payroll_staff", "employee"]);
export const leaveTypeEnum = pgEnum("leave_type", ["vacation", "sick", "emergency", "maternity", "paternity", "bereavement"]);
export const leaveStatusEnum = pgEnum("leave_status", ["pending", "approved", "rejected"]);
export const overtimeTypeEnum = pgEnum("overtime_type", ["regular", "holiday", "night_differential"]);
export const overtimeStatusEnum = pgEnum("overtime_status", ["pending", "approved", "rejected"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "late", "overtime"]);
export const notificationTypeEnum = pgEnum("notification_type", ["payroll", "leave", "overtime", "policy", "system"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("employee"),
  employeeId: varchar("employee_id").references(() => employees.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Employees table
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeNumber: text("employee_number").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  position: text("position").notNull(),
  department: text("department").notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  tin: text("tin"),
  sssNumber: text("sss_number"),
  philHealthNumber: text("phil_health_number"),
  pagIbigNumber: text("pag_ibig_number"),
  leaveBalance: integer("leave_balance").notNull().default(15),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Attendance records
export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull().default("present"),
  timeIn: text("time_in"),
  timeOut: text("time_out"),
  lateMinutes: integer("late_minutes").default(0),
  overtimeHours: decimal("overtime_hours", { precision: 4, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Leave requests
export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  leaveType: leaveTypeEnum("leave_type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason").notNull(),
  status: leaveStatusEnum("status").notNull().default("pending"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Overtime records
export const overtimeRecords = pgTable("overtime_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  hours: decimal("hours", { precision: 4, scale: 2 }).notNull(),
  overtimeType: overtimeTypeEnum("overtime_type").notNull().default("regular"),
  rateMultiplier: decimal("rate_multiplier", { precision: 3, scale: 2 }).notNull().default("1.25"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  status: overtimeStatusEnum("status").notNull().default("pending"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Payroll records
export const payrollRecords = pgTable("payroll_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  overtimePay: decimal("overtime_pay", { precision: 10, scale: 2 }).default("0"),
  allowances: decimal("allowances", { precision: 10, scale: 2 }).default("0"),
  sssContribution: decimal("sss_contribution", { precision: 10, scale: 2 }).notNull(),
  philHealthContribution: decimal("phil_health_contribution", { precision: 10, scale: 2 }).notNull(),
  pagIbigContribution: decimal("pag_ibig_contribution", { precision: 10, scale: 2 }).notNull(),
  withholdingTax: decimal("withholding_tax", { precision: 10, scale: 2 }).notNull(),
  totalDeductions: decimal("total_deductions", { precision: 10, scale: 2 }).notNull(),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  payDate: date("pay_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Policies
export const policies = pgTable("policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  employee: one(employees, {
    fields: [users.employeeId],
    references: [employees.id],
  }),
  notifications: many(notifications),
}));

export const employeesRelations = relations(employees, ({ many }) => ({
  attendance: many(attendance),
  leaveRequests: many(leaveRequests),
  overtimeRecords: many(overtimeRecords),
  payrollRecords: many(payrollRecords),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  employee: one(employees, {
    fields: [attendance.employeeId],
    references: [employees.id],
  }),
}));

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveRequests.employeeId],
    references: [employees.id],
  }),
  approver: one(users, {
    fields: [leaveRequests.approvedBy],
    references: [users.id],
  }),
}));

export const overtimeRecordsRelations = relations(overtimeRecords, ({ one }) => ({
  employee: one(employees, {
    fields: [overtimeRecords.employeeId],
    references: [employees.id],
  }),
  approver: one(users, {
    fields: [overtimeRecords.approvedBy],
    references: [users.id],
  }),
}));

export const payrollRecordsRelations = relations(payrollRecords, ({ one }) => ({
  employee: one(employees, {
    fields: [payrollRecords.employeeId],
    references: [employees.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, createdAt: true });
export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({ id: true, createdAt: true, approvedBy: true, approvedAt: true, rejectionReason: true });
export const insertOvertimeRecordSchema = createInsertSchema(overtimeRecords).omit({ id: true, createdAt: true, approvedBy: true, approvedAt: true });
export const insertPayrollRecordSchema = createInsertSchema(payrollRecords).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertPolicySchema = createInsertSchema(policies).omit({ id: true, createdAt: true, lastUpdated: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type OvertimeRecord = typeof overtimeRecords.$inferSelect;
export type InsertOvertimeRecord = z.infer<typeof insertOvertimeRecordSchema>;
export type PayrollRecord = typeof payrollRecords.$inferSelect;
export type InsertPayrollRecord = z.infer<typeof insertPayrollRecordSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
