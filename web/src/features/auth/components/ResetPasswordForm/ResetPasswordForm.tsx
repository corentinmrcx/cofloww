import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { Form } from '../../../../components/Form'
import { Button } from '../../../../components/Button'
import { T, useT } from '../../../../components/T'
import { type ResetPasswordSchema } from '../../schemas/auth.schemas'
import { useAuthSchemas } from '../../schemas/useAuthSchemas'
import { useResetPassword } from '../../hooks/useResetPassword'
import trad from './trad.json'

const INPUT_CLASS = 'h-9 rounded-md border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full'

const ResetPasswordForm = () => {
  const t = useT(trad)
  const { resetPasswordSchema } = useAuthSchemas()
  const { mutate: reset, isPending, error } = useResetPassword()
  const navigate = useNavigate()
  const { token = '' } = useParams<{ token: string }>()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = (data: ResetPasswordSchema) => {
    reset(
      { token, email, password: data.password, password_confirmation: data.password_confirmation },
      { onSuccess: () => navigate('/login', { state: { passwordReset: true } }) },
    )
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Header>
        <h1 className="text-2xl font-semibold tracking-tight">
          <T dict={trad}>title</T>
        </h1>
        <p className="text-sm text-muted-foreground">
          <T dict={trad}>description</T>
        </p>
      </Form.Header>

      <Form.Body>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            <T dict={trad}>password</T>
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            autoFocus
            placeholder={t('password_placeholder')}
            className={INPUT_CLASS}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password_confirmation" className="text-sm font-medium">
            <T dict={trad}>confirmation</T>
          </label>
          <input
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            placeholder={t('confirmation_placeholder')}
            className={INPUT_CLASS}
            {...register('password_confirmation')}
          />
          {errors.password_confirmation && (
            <p className="text-xs text-destructive">{errors.password_confirmation.message}</p>
          )}
        </div>
      </Form.Body>

      <Form.Error message={error ? t('error_generic') : null} />

      <Form.Footer>
        <Button type="submit" disabled={isPending} fullWidth>
          <T dict={trad}>{isPending ? 'submitting' : 'submit'}</T>
        </Button>
        <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          <T dict={trad}>back_to_login</T>
        </Link>
      </Form.Footer>
    </Form>
  )
}

export { ResetPasswordForm }
