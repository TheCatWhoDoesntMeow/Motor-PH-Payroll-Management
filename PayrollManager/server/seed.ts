import { db } from "./db";
import { users, employees, policies, payrollRecords, attendance } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Starting database seed...");

  try {
    // Check if database is already seeded
    const existingEmployees = await db.select().from(employees).limit(1);
    if (existingEmployees.length > 0) {
      console.log("Database already seeded. Skipping...");
      return;
    }

    // Create employees first
    const employeeRecords = [
      {
        employeeNumber: "EMP001",
        firstName: "Daniel",
        lastName: "Lee",
        position: "Payroll Staff Manager",
        department: "Human Resources",
        baseSalary: "45000.00",
        tin: "123-456-789-000",
        sssNumber: "34-1234567-8",
        philHealthNumber: "12-345678901-2",
        pagIbigNumber: "1234-5678-9012",
        leaveBalance: 15,
      },
      {
        employeeNumber: "EMP002",
        firstName: "Rachel",
        lastName: "Martinez",
        position: "Payroll Staff",
        department: "Human Resources",
        baseSalary: "35000.00",
        tin: "123-456-789-001",
        sssNumber: "34-1234567-9",
        philHealthNumber: "12-345678901-3",
        pagIbigNumber: "1234-5678-9013",
        leaveBalance: 15,
      },
      {
        employeeNumber: "EMP003",
        firstName: "Melissa",
        lastName: "Cruz",
        position: "Payroll Staff",
        department: "Human Resources",
        baseSalary: "35000.00",
        tin: "123-456-789-002",
        sssNumber: "34-1234568-0",
        philHealthNumber: "12-345678901-4",
        pagIbigNumber: "1234-5678-9014",
        leaveBalance: 15,
      },
      {
        employeeNumber: "EMP004",
        firstName: "Miguel",
        lastName: "Torres",
        position: "Payroll Staff",
        department: "Human Resources",
        baseSalary: "35000.00",
        tin: "123-456-789-003",
        sssNumber: "34-1234568-1",
        philHealthNumber: "12-345678901-5",
        pagIbigNumber: "1234-5678-9015",
        leaveBalance: 15,
      },
      {
        employeeNumber: "EMP005",
        firstName: "John Rafael",
        lastName: "Catro",
        position: "Sales and Marketing Manager",
        department: "Sales & Marketing",
        baseSalary: "50000.00",
        tin: "123-456-789-004",
        sssNumber: "34-1234568-2",
        philHealthNumber: "12-345678901-6",
        pagIbigNumber: "1234-5678-9016",
        leaveBalance: 15,
      },
      {
        employeeNumber: "EMP006",
        firstName: "Beatriz",
        lastName: "Santos",
        position: "Customer Service and Relations Manager",
        department: "Customer Service",
        baseSalary: "48000.00",
        tin: "123-456-789-005",
        sssNumber: "34-1234568-3",
        philHealthNumber: "12-345678901-7",
        pagIbigNumber: "1234-5678-9017",
        leaveBalance: 15,
      },
      {
        employeeNumber: "EMP007",
        firstName: "Frederick",
        lastName: "Romualdez",
        position: "Account Manager",
        department: "Sales & Marketing",
        baseSalary: "42000.00",
        tin: "123-456-789-006",
        sssNumber: "34-1234568-4",
        philHealthNumber: "12-345678901-8",
        pagIbigNumber: "1234-5678-9018",
        leaveBalance: 15,
      },
      {
        employeeNumber: "EMP008",
        firstName: "Carlos Ian",
        lastName: "Martinez",
        position: "Supply Chain & Logistics Manager",
        department: "Operations",
        baseSalary: "46000.00",
        tin: "123-456-789-007",
        sssNumber: "34-1234568-5",
        philHealthNumber: "12-345678901-9",
        pagIbigNumber: "1234-5678-9019",
        leaveBalance: 15,
      },
      {
        employeeNumber: "EMP009",
        firstName: "Maria",
        lastName: "Garcia",
        position: "Software Engineer",
        department: "IT",
        baseSalary: "40000.00",
        tin: "123-456-789-008",
        sssNumber: "34-1234568-6",
        philHealthNumber: "12-345678902-0",
        pagIbigNumber: "1234-5678-9020",
        leaveBalance: 15,
      },
    ];

    const createdEmployees = await db.insert(employees).values(employeeRecords).returning();
    console.log(`Created ${createdEmployees.length} employees`);

    // Hash password
    const hashedAdminPassword = await bcrypt.hash("aph123", 10);
    const hashedEmployeePassword = await bcrypt.hash("emph123", 10);

    // Create users linked to employees
    const userRecords = [
      {
        email: "admin@motorph.com",
        password: hashedAdminPassword,
        role: "admin" as const,
        employeeId: createdEmployees[0].id, // Daniel Lee
      },
      {
        email: "employee@motorph.com",
        password: hashedEmployeePassword,
        role: "employee" as const,
        employeeId: createdEmployees[8].id, // Maria Garcia
      },
      {
        email: "daniel.lee@motorph.com",
        password: hashedEmployeePassword,
        role: "payroll_staff" as const,
        employeeId: createdEmployees[0].id,
      },
      {
        email: "rachel.martinez@motorph.com",
        password: hashedEmployeePassword,
        role: "payroll_staff" as const,
        employeeId: createdEmployees[1].id,
      },
      {
        email: "melissa.cruz@motorph.com",
        password: hashedEmployeePassword,
        role: "payroll_staff" as const,
        employeeId: createdEmployees[2].id,
      },
      {
        email: "miguel.torres@motorph.com",
        password: hashedEmployeePassword,
        role: "payroll_staff" as const,
        employeeId: createdEmployees[3].id,
      },
      {
        email: "john.catro@motorph.com",
        password: hashedEmployeePassword,
        role: "employee" as const,
        employeeId: createdEmployees[4].id,
      },
      {
        email: "beatriz.santos@motorph.com",
        password: hashedEmployeePassword,
        role: "employee" as const,
        employeeId: createdEmployees[5].id,
      },
      {
        email: "frederick.romualdez@motorph.com",
        password: hashedEmployeePassword,
        role: "employee" as const,
        employeeId: createdEmployees[6].id,
      },
      {
        email: "carlos.martinez@motorph.com",
        password: hashedEmployeePassword,
        role: "employee" as const,
        employeeId: createdEmployees[7].id,
      },
    ];

    const createdUsers = await db.insert(users).values(userRecords).returning();
    console.log(`Created ${createdUsers.length} users`);

    // Create sample policies
    const policyRecords = [
      {
        title: "Overtime Policy",
        category: "Payroll",
        content: `Motor PH Overtime Policy\n\nOvertime work must be pre-approved by your direct supervisor. Overtime rates are as follows:\n\n• Regular Overtime (weekdays): 1.25x hourly rate\n• Holiday Overtime: 2.0x hourly rate\n• Night Differential (10 PM - 6 AM): 1.5x hourly rate\n\nAll overtime must be logged in the system within 24 hours of completion. Unapproved overtime will not be compensated.`,
      },
      {
        title: "Leave Policy",
        category: "Leave Management",
        content: `Motor PH Leave Policy\n\nEmployees are entitled to 15 days of paid leave per year. Leave types include:\n\n• Vacation Leave: For personal time off\n• Sick Leave: For medical reasons (may require certificate for 3+ days)\n• Emergency Leave: For unforeseen circumstances\n• Maternity Leave: 105 days (for qualified employees)\n• Paternity Leave: 7 days (for qualified employees)\n• Bereavement Leave: Up to 3 days for immediate family\n\nLeave requests must be submitted at least 3 days in advance (except emergency/sick leave). Approval is subject to business needs and staffing requirements.`,
      },
      {
        title: "Attendance Policy",
        category: "Attendance",
        content: `Motor PH Attendance Policy\n\nWork Schedule: Monday to Friday, 8:00 AM - 5:00 PM (with 1-hour lunch break)\n\n• Late arrivals: Employees late by more than 15 minutes will be marked as late\n• Absences: Unexcused absences may result in salary deductions\n• Time tracking: All employees must clock in/out using the attendance system\n\nExcessive tardiness or absences may result in disciplinary action. For schedule changes or remote work requests, please coordinate with your supervisor.`,
      },
      {
        title: "Tax and Deductions",
        category: "Payroll",
        content: `Motor PH Tax and Deductions Information\n\nMandatory Deductions:\n\n• SSS Contribution: Based on monthly salary bracket (employee share)\n• PhilHealth: 3% monthly premium (1.5% employee share)\n• Pag-IBIG: 2% of monthly salary (capped at ₱100)\n• Withholding Tax: Based on BIR tax tables\n\nAll deductions are computed automatically and reflected in your monthly payslip. For questions about your deductions, please contact the Payroll department.`,
      },
      {
        title: "Code of Conduct",
        category: "Company Policies",
        content: `Motor PH Code of Conduct\n\nAll employees are expected to:\n\n• Maintain professional behavior at all times\n• Respect colleagues and clients\n• Protect company confidential information\n• Report any violations of company policy\n• Follow all safety and security protocols\n\nViolations of the code of conduct may result in disciplinary action, up to and including termination.`,
      },
      {
        title: "Payroll Schedule",
        category: "Payroll",
        content: `Motor PH Payroll Schedule\n\nPayroll is processed on a semi-monthly basis:\n\n• 1st Period: 1st - 15th of the month (paid on the 20th)\n• 2nd Period: 16th - End of month (paid on the 5th of next month)\n\nPayslips are available electronically through the payroll system. For payroll discrepancies, please contact the Payroll department within 5 days of payment date.`,
      },
    ];

    const createdPolicies = await db.insert(policies).values(policyRecords).returning();
    console.log(`Created ${createdPolicies.length} policies`);

    // Create sample attendance records for the current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const attendanceRecords = [];
    for (const employee of createdEmployees) {
      // Create attendance for the first 20 days of the month
      for (let day = 1; day <= Math.min(20, daysInMonth); day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayOfWeek = new Date(dateStr).getDay();
        
        // Skip weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        const isLate = Math.random() < 0.1; // 10% chance of being late
        const hasOvertime = Math.random() < 0.15; // 15% chance of overtime

        attendanceRecords.push({
          employeeId: employee.id,
          date: dateStr,
          status: isLate ? ("late" as const) : ("present" as const),
          timeIn: "08:00",
          timeOut: hasOvertime ? "18:30" : "17:00",
          lateMinutes: isLate ? Math.floor(Math.random() * 30) + 5 : 0,
          overtimeHours: hasOvertime ? "1.5" : "0",
          notes: isLate ? "Traffic delay" : hasOvertime ? "Project deadline" : null,
        });
      }
    }

    const createdAttendance = await db.insert(attendance).values(attendanceRecords).returning();
    console.log(`Created ${createdAttendance.length} attendance records`);

    // Create sample payroll records for last month
    const lastMonth = new Date(currentYear, currentMonth - 1, 1);
    const samplePayrollData = createdEmployees.map((employee) => ({
      employeeId: employee.id,
      periodStart: `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-01`,
      periodEnd: `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-15`,
      baseSalary: employee.baseSalary,
      overtimePay: "2500.00",
      allowances: "1000.00",
      sssContribution: "675.00",
      philHealthContribution: "600.00",
      pagIbigContribution: "100.00",
      withholdingTax: "3200.00",
      totalDeductions: "4575.00",
      netPay: String(parseFloat(employee.baseSalary) + 2500 + 1000 - 4575),
      payDate: `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-20`,
    }));

    const createdPayroll = await db.insert(payrollRecords).values(samplePayrollData).returning();
    console.log(`Created ${createdPayroll.length} payroll records`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error during seeding:", error);
    process.exit(1);
  });
