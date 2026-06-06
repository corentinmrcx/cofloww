import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { CheckCircle } from 'lucide-react'
import { Form } from '../../../../components/Form'
import { Button } from '../../../../components/Button'
import { T, useT } from '../../../../components/T'
import { type ForgotPasswordSchema } from '../../schemas/auth.schemas'
import { useAuthSchemas } from '../../schemas/useAuthSchemas'
import { useForgotPassword } from '../../hooks/useForgotPassword'
import trad from './trad.json'

const INPUT_CLASS = 'h-9 rounded-md border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full'

const ForgotPasswordForm = () => {
  const t = useT(trad)
  const { forgotPasswordSchema } = useAuthSchemas()
  const { mutate: sendLink, isPending } = useForgotPassword()
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = (data: ForgotPasswordSchema) => {
    sendLink(data.email, {
      onSuccess: () => setSent(true),
      onError:   () => setSent(true),
    })
  }

  if (sent) {
    return (
      <Form onSubmit={e => e.preventDefault()}>
        <Form.Header>
          <div className="flex items-center gap-2 text-income">
            <CheckCircle size={22} />
            <h1 className="text-2xl font-semibold tracking-tight">{t('success_title')}</h1>
          </div>
        </Form.Header>
        <Form.Body>
          <p className="text-sm text-muted-foreground">{t('success_message')}</p>
        </Form.Body>
        <Form.Footer>
          <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            <T dict={trad}>back_to_login</T>
          </Link>
        </Form.Footer>
      </Form>
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
          <label htmlFor="email" className="text-sm font-medium">
            <T dict={trad}>email</T>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder={t('email_placeholder')}
            className={INPUT_CLASS}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </Form.Body>

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

export { ForgotPasswordForm }
