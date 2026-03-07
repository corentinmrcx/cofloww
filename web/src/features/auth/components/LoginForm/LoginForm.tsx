import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import Form from '../../../../components/Form'
import { Button } from '../../../../components/Button'
import T, { useT } from '../../../../components/T'
import { type LoginSchema } from '../../schemas/auth.schemas'
import { useAuthSchemas } from '../../schemas/useAuthSchemas'
import { useLogin } from '../../hooks/useLogin'

const LoginForm = () => {
  const t = useT(import.meta.url)
  const { loginSchema } = useAuthSchemas()
  const { mutate: login, isPending, error } = useLogin()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginSchema) => login(data)

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Header>
        <h1 className="text-2xl font-semibold tracking-tight">
          <T url={import.meta.url}>title</T>
        </h1>
      </Form.Header>

      <Form.Body>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            <T url={import.meta.url}>email</T>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('email_placeholder')}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              <T url={import.meta.url}>password</T>
            </label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              <T url={import.meta.url}>forgot_password</T>
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder={t('password_placeholder')}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
      </Form.Body>

      <Form.Error message={error ? t('error_credentials') : null} />

      <Form.Footer>
        <Button type="submit" disabled={isPending} fullWidth>
          <T url={import.meta.url}>{isPending ? 'submitting' : 'submit'}</T>
        </Button>
        <p className="text-xs text-muted-foreground">
          <T url={import.meta.url}>no_account</T>{' '}
          <Link to="/register" className="text-foreground hover:underline">
            <T url={import.meta.url}>register</T>
          </Link>
        </p>
      </Form.Footer>
    </Form>
  )
}

export { LoginForm }
