import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, LogOut } from 'lucide-react'
import { useAuth } from '../../../auth/hooks/useAuth'
import { useUpdateProfile, useUpdatePassword, useUploadAvatar } from '../../hooks/useSettings'
import { useLogout } from '../../../auth/hooks/useLogout'

const profileSchema = z.object({
  firstname: z.string().min(1, 'Requis'),
  lastname:  z.string().min(1, 'Requis'),
  email:     z.string().email('Email invalide'),
})

const passwordSchema = z.object({
  current_password:      z.string().min(1, 'Requis'),
  password:              z.string().min(8, '8 caractères minimum'),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
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
        <p className="text-sm font-semibold">Photo de profil</p>
        <div className="flex items-center gap-4">
          <div
            className="relative w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden cursor-pointer group"
            onClick={() => fileRef.current?.click()}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
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
              {uploadingAvatar ? 'Upload…' : 'Changer la photo'}
            </button>
            <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG ou WebP · max 2 Mo</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      {/* Profil */}
      <form
        onSubmit={profileForm.handleSubmit(d => updateProfile(d))}
        className="flex flex-col gap-4"
      >
        <p className="text-sm font-semibold">Informations personnelles</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Prénom</label>
            <input {...profileForm.register('firstname')} className={INPUT} />
            {profileForm.formState.errors.firstname && (
              <p className={ERR}>{profileForm.formState.errors.firstname.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nom</label>
            <input {...profileForm.register('lastname')} className={INPUT} />
            {profileForm.formState.errors.lastname && (
              <p className={ERR}>{profileForm.formState.errors.lastname.message}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <input {...profileForm.register('email')} type="email" className={INPUT} />
          {profileForm.formState.errors.email && (
            <p className={ERR}>{profileForm.formState.errors.email.message}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={savingProfile} className={BTN}>
            {savingProfile ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          {savedProfile && <p className="text-xs text-emerald-600 dark:text-emerald-400">Sauvegardé ✓</p>}
        </div>
      </form>

      {/* Mot de passe */}
      <form
        onSubmit={passwordForm.handleSubmit(d => updatePassword(d, { onSuccess: () => passwordForm.reset() }))}
        className="flex flex-col gap-4"
      >
        <p className="text-sm font-semibold">Mot de passe</p>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Mot de passe actuel</label>
          <input {...passwordForm.register('current_password')} type="password" className={INPUT} />
          {passwordForm.formState.errors.current_password && (
            <p className={ERR}>{passwordForm.formState.errors.current_password.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nouveau mot de passe</label>
            <input {...passwordForm.register('password')} type="password" className={INPUT} />
            {passwordForm.formState.errors.password && (
              <p className={ERR}>{passwordForm.formState.errors.password.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Confirmation</label>
            <input {...passwordForm.register('password_confirmation')} type="password" className={INPUT} />
            {passwordForm.formState.errors.password_confirmation && (
              <p className={ERR}>{passwordForm.formState.errors.password_confirmation.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={savingPwd} className={BTN}>
            {savingPwd ? 'Mise à jour…' : 'Changer le mot de passe'}
          </button>
          {savedPwd  && <p className="text-xs text-emerald-600 dark:text-emerald-400">Mot de passe mis à jour ✓</p>}
          {pwdError  && <p className="text-xs text-destructive">Mot de passe actuel incorrect</p>}
        </div>
      </form>

      {/* Déconnexion */}
      <div className="pt-2 border-t border-border">
        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center gap-2 h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <LogOut size={15} />
          Se déconnecter
        </button>
      </div>
    </div>
  )
}

export { ProfileForm }
