import { type ReactNode } from 'react'

type FormProps = {
  onSubmit: React.ComponentProps<'form'>['onSubmit']
  children: ReactNode
}

const FormHeader = ({ children }: { children: ReactNode }) => (
  <div className="mb-8 flex flex-col gap-1">
    {children}
  </div>
)

const FormBody = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-4">
    {children}
  </div>
)

const FormFooter = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col items-center gap-3 mt-6">
    {children}
  </div>
)

const FormError = ({ message }: { message?: string | null }) => {
  if (!message) return null
  return (
    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2 mt-4">
      {message}
    </p>
  )
}

const Form = Object.assign(
  ({ onSubmit, children }: FormProps) => (
    <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-sm p-8">
      <form onSubmit={onSubmit} noValidate>
        {children}
      </form>
    </div>
  ),
  {
    Header: FormHeader,
    Body:   FormBody,
    Footer: FormFooter,
    Error:  FormError,
  },
)

export { Form }