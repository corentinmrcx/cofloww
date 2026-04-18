import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { Form } from '../../../../components/Form'
import { Button } from '../../../../components/Button'
import { T, useT } from '../../../../components/T'
import { type ForgotPasswordSchema } from '../../schemas/auth.schemas'
import { useAuthSchemas } from '../../schemas/useAuthSchemas'
import { useForgotPassword } from '../../hooks/useForgotPassword'

const ForgotPasswordForm = () => {
  const t = useT(import.meta.url)
  const { forgotPasswordSchema } = useAuthSchemas()
  const { mutate: sendLink, isPending, error, isSuccess } = useForgotPassword()

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = (data: ForgotPasswordSchema) => sendLink(data.email)

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Header>
        <h1 className="text-2xl font-semibold tracking-tight">
          <T url={import.meta.url}>title</T>
        </h1>
        <p className="text-sm text-muted-foreground">
          <T url={import.meta.url}>description</T>
        </p>
      </Form.Header>

      <Form.Body>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium"><T url={import.meta.url}>email</T></label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('email_placeholder')}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </Form.Body>

      {isSuccess && (
        <p className="text-sm text-muted-foreground mt-4">{t('success')}</p>
      )}
      <Form.Error message={error ? t('error') : null} />

      <Form.Footer>
        <Button type="submit" disabled={isPending || isSuccess} fullWidth>
          <T url={import.meta.url}>{isPending ? 'submitting' : 'submit'}</T>
        </Button>
        <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          <T url={import.meta.url}>back_to_login</T>
        </Link>
      </Form.Footer>
    </Form>
  )
}

export { ForgotPasswordForm }