import { z } from 'zod';

export const usernameFormSchema = z.object({
  username: z.string({ required_error: 'Username is required' }).refine(
    value => {
      return /^[a-zA-Z0-9]+$/.test(value);
    },
    { message: 'Username not allowed. Try again.' }
  ),
});

export type UsernameFormInput = z.infer<typeof usernameFormSchema>;

export const loginFormSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  otp: z
    .string({ required_error: 'OTP is required' })
    .length(6, { message: 'OTP must be 6 digits' }),
});

export type LoginFormInput = z.infer<typeof loginFormSchema>;

export const emailFormSchema = loginFormSchema.pick({ email: true });
export type EmailFormInput = z.infer<typeof emailFormSchema>;

export const otpFormSchema = loginFormSchema.pick({ otp: true });
export type OtpFormInput = z.infer<typeof otpFormSchema>;
