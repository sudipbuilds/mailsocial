import { z } from 'zod';

export const usernameFormSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .min(3, 'Too short.')
    .max(16, 'Too long.')
    .refine(
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

export const settingsFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  bio: z.string().max(500, 'Bio too long').optional(),
  website: z.string().url('Invalid URL').max(200, 'URL too long').or(z.literal('')).optional(),
  isPrivate: z.boolean(),
});

export type SettingsFormInput = z.infer<typeof settingsFormSchema>;

export const postFormSchema = z.object({
  content: z.string().min(1, 'Content is required').max(1000, 'Content too long'),
  secretKey: z.string().min(1, 'Secret key is required'),
});

export type PostFormInput = z.infer<typeof postFormSchema>;

export const deleteAccountSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
