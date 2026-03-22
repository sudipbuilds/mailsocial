'use client';

import axios from 'axios';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useRef, useState, useTransition } from 'react';

import {
  profileFormSchema,
  secretKeyFormSchema,
  type ProfileFormInput,
  type SecretKeyFormInput,
} from '@/lib/validations';
import { cn } from '@/lib/utils';
import config from '@/lib/config';
import type { User } from '@/lib/auth/config';

type Step = 'profile' | 'key';

export function OnboardingForm({ user }: { user: User }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('profile');
  const [imagePreview, setImagePreview] = useState<string | null>(user.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || '',
      bio: user.bio || '',
      image: user.image || '',
    },
  });

  const keyForm = useForm<SecretKeyFormInput>({
    resolver: zodResolver(secretKeyFormSchema),
    defaultValues: {
      secretKey: '',
    },
  });

  const isProfileFormLoading = profileForm.formState.isSubmitting;
  const profileFormErrors = profileForm.formState.errors;
  const isKeyFormLoading = keyForm.formState.isSubmitting;
  const keyFormErrors = keyForm.formState.errors;

  const [isGenerating, startGenerating] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post('/api/upload', formData);
      const imageUrl = res.data.url;

      setImagePreview(imageUrl);
      profileForm.setValue('image', imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        profileForm.setError('image', { message: error.response.data.error });
      }
    } finally {
      setIsUploading(false);
    }
  }

  async function handleProfileSubmit(data: ProfileFormInput) {
    try {
      await axios.post('/api/onboarding', data);
      setStep('key');
    } catch (error) {
      console.error('Profile update error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        profileForm.setError('name', { message: error.response.data.error });
      }
    }
  }

  function handleGenerateKey() {
    startGenerating(async () => {
      try {
        const res = await axios.post('/api/onboarding', { generate: true });
        keyForm.setValue('secretKey', res.data.secretKey);
      } catch (error) {
        console.error('Generate key error:', error);
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          keyForm.setError('secretKey', { message: error.response.data.error });
        }
      }
    });
  }

  async function handleKeySubmit(data: SecretKeyFormInput) {
    try {
      await axios.post('/api/onboarding', { secretKey: data.secretKey });
      router.push('/app');
    } catch (error) {
      console.error('Key submit error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        keyForm.setError('secretKey', { message: error.response.data.error });
      }
    }
  }

  const renderForm = useMemo(() => {
    switch (step) {
      case 'profile':
        return (
          <div className="space-y-6">
            <p>Set up your profile.</p>

            <form className="space-y-6" onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
              {profileFormErrors.image && (
                <p className="text-muted-foreground/75">{profileFormErrors.image.message}</p>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={cn(
                    'relative w-16 h-16 rounded-full bg-neutral-200/75 flex items-center justify-center overflow-hidden shrink-0',
                    isUploading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Profile" fill className="object-cover" />
                  ) : (
                    <span className="text-muted-foreground text-xl">+</span>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-muted-foreground">
                  {isUploading ? 'Uploading...' : 'Add photo'}
                </p>
              </div>

              {profileFormErrors.name && (
                <p className="text-muted-foreground/75">{profileFormErrors.name.message}</p>
              )}
              <div
                className={cn('flex items-center', isProfileFormLoading && 'text-muted-foreground')}
              >
                <input
                  {...profileForm.register('name')}
                  type="text"
                  placeholder="Name"
                  className={cn(
                    'outline-none flex-1 bg-transparent placeholder:text-muted-foreground/75',
                    isProfileFormLoading && 'cursor-not-allowed'
                  )}
                  disabled={isProfileFormLoading}
                />
              </div>

              {profileFormErrors.bio && (
                <p className="text-muted-foreground/75">{profileFormErrors.bio.message}</p>
              )}
              <div
                className={cn('flex items-center', isProfileFormLoading && 'text-muted-foreground')}
              >
                <textarea
                  {...profileForm.register('bio')}
                  placeholder="Bio (optional)"
                  rows={2}
                  className={cn(
                    'outline-none flex-1 bg-transparent placeholder:text-muted-foreground/75 resize-none',
                    isProfileFormLoading && 'cursor-not-allowed'
                  )}
                  disabled={isProfileFormLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isProfileFormLoading || isUploading}
                className={cn(
                  'px-4 py-2 rounded-full bg-neutral-200/75 text-sm text-secondary-foreground outline-none inline-flex items-center justify-center',
                  (isProfileFormLoading || isUploading) &&
                    'text-muted-foreground bg-neutral-200/50 cursor-not-allowed'
                )}
              >
                Continue
              </button>
            </form>
          </div>
        );

      case 'key':
        return (
          <div className="space-y-6">
            <p>Create your posting email. Enter a key or generate one.</p>

            <form className="space-y-6" onSubmit={keyForm.handleSubmit(handleKeySubmit)}>
              {keyFormErrors.secretKey && (
                <p className="text-muted-foreground/75">{keyFormErrors.secretKey.message}</p>
              )}

              <div
                className={cn(
                  'flex items-center',
                  (isKeyFormLoading || isGenerating) && 'text-muted-foreground'
                )}
              >
                <input
                  {...keyForm.register('secretKey')}
                  type="text"
                  placeholder="yourkey"
                  maxLength={16}
                  size={16}
                  className={cn(
                    'outline-none bg-transparent placeholder:text-muted-foreground/75',
                    (isKeyFormLoading || isGenerating) && 'cursor-not-allowed'
                  )}
                  disabled={isKeyFormLoading || isGenerating}
                />
                <span>@{config.domain}</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isKeyFormLoading || isGenerating}
                  className={cn(
                    'px-4 py-2 rounded-full bg-neutral-200/75 text-sm text-secondary-foreground outline-none inline-flex items-center justify-center',
                    (isKeyFormLoading || isGenerating) &&
                      'text-muted-foreground bg-neutral-200/50 cursor-not-allowed'
                  )}
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={handleGenerateKey}
                  disabled={isKeyFormLoading || isGenerating}
                  className={cn(
                    'text-sm text-muted-foreground/75 hover:text-muted-foreground',
                    (isKeyFormLoading || isGenerating) && 'cursor-not-allowed'
                  )}
                >
                  Generate random
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  }, [
    step,
    isProfileFormLoading,
    isKeyFormLoading,
    isGenerating,
    isUploading,
    profileFormErrors,
    keyFormErrors,
    imagePreview,
  ]);

  return <>{renderForm}</>;
}
