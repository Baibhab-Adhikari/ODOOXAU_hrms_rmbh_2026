import { z } from "zod";

export const signUpSchema = z
  .object({
    companyName: z.string().min(1, "Company Name is required"),
    fullName: z.string().min(1, "Full Name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().min(1, "Please enter your email or ID"),
  password: z.string().min(1, "Password is required"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const profileEditSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[+]?[\d\s-]+$/, "Please enter a valid phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

export type ProfileEditFormData = z.infer<typeof profileEditSchema>;

export const hrProfileEditSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[+]?[\d\s-]+$/, "Please enter a valid phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  jobTitle: z.string().min(2, "Job title is required"),
  department: z.string().min(2, "Department is required"),
});

export type HrProfileEditFormData = z.infer<typeof hrProfileEditSchema>;

export const leaveApplicationSchema = z
  .object({
    leaveType: z.enum(["Paid", "Sick", "Unpaid"], {
      message: "Please select a leave type",
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    remarks: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export type LeaveApplicationFormData = z.infer<typeof leaveApplicationSchema>;

export const salaryEditSchema = z.object({
  wage: z.coerce
    .number()
    .min(0, "Wage must be a positive number"),
  effectiveFrom: z.string().min(1, "Effective date is required"),
});

export type SalaryEditFormData = z.infer<typeof salaryEditSchema>;

export const leaveCommentSchema = z.object({
  comment: z.string().min(1, "Please add a comment"),
});

export type LeaveCommentFormData = z.infer<typeof leaveCommentSchema>;
