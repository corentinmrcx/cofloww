import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import Form from '../../../../components/Form'
import { Button } from '../../../../components/Button'
import T, { useT } from '../../../../components/T'
import { type RegisterSchema } from '../../schemas/auth.schemas'
import { useAuthSchemas } from '../../schemas/useAuthSchemas'
import { useRegister } from '../../hooks/useRegister'

const inputClass = 'h-9 rounded-md border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

const RegisterForm = () => {
  const t = useT(import.meta.url)
  const { registerSchema } = useAuthSchemas()
  const { mutate: register, isPending, error } = useRegister()

  const { register: field, handleSubmit, formState: { errors } } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterSchema) => register(data)

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Header>
        <h1 className="text-2xl font-semibold tracking-tight">
          <T url={import.meta.url}>title</T>
        </h1>
      </Form.Header>

      <Form.Body>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastname" className="text-sm font-medium"><T url={import.meta.url}>lastname</T></label>
          <input id="lastname" type="text" autoComplete="family-name" placeholder={t('lastname_placeholder')} className={inputClass} {...field('lastname')} />
          {errors.lastname && <p className="text-xs text-destructive">{errors.lastname.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="firstname" className="text-sm font-medium"><T url={import.meta.url}>firstname</T></label>
          <input id="firstname" type="text" autoComplete="given-name" placeholder={t('firstname_placeholder')} className={inputClass} {...field('firstname')} />
          {errors.firstname && <p className="text-xs text-destructive">{errors.firstname.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium"><T url={import.meta.url}>email</T></label>
          <input id="email" type="email" autoComplete="email" placeholder={t('email_placeholder')} className={inputClass} {...field('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium"><T url={import.meta.url}>password</T></label>
          <input id="password" type="password" autoComplete="new-password" placeholder={t('password_placeholder')} className={inputClass} {...field('password')} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password_confirmation" className="text-sm font-medium"><T url={import.meta.url}>password_confirmation</T></label>
          <input id="password_confirmation" type="password" autoComplete="new-password" placeholder={t('password_placeholder')} className={inputClass} {...field('password_confirmation')} />
          {errors.password_confirmation && <p className="text-xs text-destructive">{errors.password_confirmation.message}</p>}
        </div>
      </Form.Body>

      <Form.Error message={
        error
          // @ts-expect-error - AxiosError
          ? (error?.response?.status === 422 && error?.response?.data?.errors?.email
              ? t('error_email_taken')
              : t('error'))
          : null
      } />

      <Form.Footer>
        <Button type="submit" disabled={isPending} fullWidth>
          <T url={import.meta.url}>{isPending ? 'submitting' : 'submit'}</T>
        </Button>
        <p className="text-xs text-muted-foreground">
          <T url={import.meta.url}>already_account</T>{' '}
          <Link to="/login" className="text-foreground hover:underline">
            <T url={import.meta.url}>login</T>
          </Link>
        </p>
      </Form.Footer>
    </Form>
  )
}

export { RegisterForm }