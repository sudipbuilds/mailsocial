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

export const profileFormSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  bio: z.string().max(160, { message: 'Bio must be less than 160 characters' }).optional(),
  image: z.string().optional(),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;

export const secretKeyFormSchema = z.object({
  secretKey: z
    .string({ required_error: 'Key is required' })
    .min(3, { message: 'Key must be at least 3 characters' })
    .max(16, { message: 'Key must be 16 characters or less' })
    .refine(value => /^[a-zA-Z0-9]+$/.test(value), {
      message: 'Key can only contain letters and numbers',
    }),
});

export type SecretKeyFormInput = z.infer<typeof secretKeyFormSchema>;

export const generateKeySchema = z.object({
  generate: z.literal(true),
});

export const onboardingRequestSchema = z.union([
  generateKeySchema,
  profileFormSchema,
  secretKeyFormSchema,
]);

export type OnboardingRequestInput = z.infer<typeof onboardingRequestSchema>;
