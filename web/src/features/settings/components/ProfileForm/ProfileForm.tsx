import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, LogOut } from 'lucide-react'
import { Separator } from '../../../../components/ui/separator'
import { useAuth } from '../../../auth/hooks/useAuth'
import { useUpdateProfile, useUpdatePassword, useUploadAvatar } from '../../hooks/useSettings'
import { useLogout } from '../../../auth/hooks/useLogout'
import { useT } from '../../../../components/T'
import trad from './trad.json'

const profileSchema = z.object({
  firstname: z.string().min(1, 'err_required'),
  lastname:  z.string().min(1, 'err_required'),
  email:     z.string().email('err_email'),
})

const passwordSchema = z.object({
  current_password:      z.string().min(1, 'err_required'),
  password:              z.string().min(8, 'err_min_password'),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, {
  message: 'err_password_match',
  path:    ['password_confirmation'],
})

type ProfileValues  = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

const INPUT = 'h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
const ERR   = 'text-xs text-destructive mt-0.5'
const BTN   = 'h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50'

const ProfileForm = () => {
  const { user }              = useAuth()
  const fileRef               = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const { mutate: updateProfile, isPending: savingProfile, isSuccess: savedProfile } = useUpdateProfile()
  const { mutate: updatePassword, isPending: savingPwd, isSuccess: savedPwd, isError: pwdError } = useUpdatePassword()
  const { mutate: uploadAvatar, isPending: uploadingAvatar } = useUploadAvatar()
  const { mutate: logout } = useLogout()
  const t = useT(trad)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstname: user?.firstname ?? '',
      lastname:  user?.lastname  ?? '',
      email:     user?.email     ?? '',
    },
  })

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstname: user.firstname,
        lastname:  user.lastname,
        email:     user.email,
      })
    }
  }, [user?.id])

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    uploadAvatar(file)
  }

  const avatarSrc = avatarPreview ?? user?.avatar_url ?? null

  return (
    <div className="flex flex-col gap-8">

      {/* Avatar */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">{t('photo_title')}</p>
        <div className="flex items-center gap-4">
          <div
            role="button"
            tabIndex={0}
            aria-label={t('photo_change')}
            className="relative size-16 rounded-full bg-muted flex items-center justify-center overflow-hidden cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click() } }}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-muted-foreground">
                {user?.firstname?.[0]?.toUpperCase() ?? '?'}
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={16} className="text-white" />
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="text-sm text-primary hover:underline disabled:opacity-50"
            >
              {uploadingAvatar ? t('photo_uploading') : t('photo_change')}
            </button>
            <p className="text-xs text-muted-foreground mt-0.5">{t('photo_hint')}</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      {/* Profil */}
      <form
        onSubmit={profileForm.handleSubmit(d => updateProfile(d))}
        className="flex flex-col gap-4"
      >
        <p className="text-sm font-semibold">{t('info_title')}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('firstname')}</label>
            <input {...profileForm.register('firstname')} className={INPUT} />
            {profileForm.formState.errors.firstname && (
              <p className={ERR}>{t(profileForm.formState.errors.firstname.message ?? 'err_required')}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('lastname')}</label>
            <input {...profileForm.register('lastname')} className={INPUT} />
            {profileForm.formState.errors.lastname && (
              <p className={ERR}>{t(profileForm.formState.errors.lastname.message ?? 'err_required')}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t('email')}</label>
          <input {...profileForm.register('email')} type="email" className={INPUT} />
          {profileForm.formState.errors.email && (
            <p className={ERR}>{t(profileForm.formState.errors.email.message ?? 'err_email')}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={savingProfile} className={BTN}>
            {savingProfile ? t('saving') : t('save')}
          </button>
          {savedProfile && <p className="text-xs text-success">{t('saved')}</p>}
        </div>
      </form>

      {/* Mot de passe */}
      <form
        onSubmit={passwordForm.handleSubmit(d => updatePassword(d, { onSuccess: () => passwordForm.reset() }))}
        className="flex flex-col gap-4"
      >
        <p className="text-sm font-semibold">{t('password_title')}</p>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t('current_password')}</label>
          <input {...passwordForm.register('current_password')} type="password" className={INPUT} />
          {passwordForm.formState.errors.current_password && (
            <p className={ERR}>{t(passwordForm.formState.errors.current_password.message ?? 'err_required')}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('new_password')}</label>
            <input {...passwordForm.register('password')} type="password" className={INPUT} />
            {passwordForm.formState.errors.password && (
              <p className={ERR}>{t(passwordForm.formState.errors.password.message ?? 'err_required')}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('confirm_password')}</label>
            <input {...passwordForm.register('password_confirmation')} type="password" className={INPUT} />
            {passwordForm.formState.errors.password_confirmation && (
              <p className={ERR}>{t(passwordForm.formState.errors.password_confirmation.message ?? 'err_required')}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={savingPwd} className={BTN}>
            {savingPwd ? t('updating_password') : t('update_password')}
          </button>
          {savedPwd  && <p className="text-xs text-success">{t('password_updated')}</p>}
          {pwdError  && <p className="text-xs text-destructive">{t('password_error')}</p>}
        </div>
      </form>

      <Separator />
      {/* Déconnexion */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center gap-2 h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <LogOut size={15} />
          {t('logout')}
        </button>
      </div>
    </div>
  )
}

export { ProfileForm }
