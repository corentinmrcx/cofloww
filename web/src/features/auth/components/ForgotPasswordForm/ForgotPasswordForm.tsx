import { Link } from 'react-router'
import { Form } from '../../../../components/Form'
import { T, useT } from '../../../../components/T'
import trad from './trad.json'

const ForgotPasswordForm = () => {
  const t = useT(trad)

  return (
    <Form onSubmit={e => e.preventDefault()}>
      <Form.Header>
        <h1 className="text-2xl font-semibold tracking-tight">
          <T dict={trad}>title</T>
        </h1>
        <p className="text-sm text-muted-foreground">
          <T dict={trad}>description</T>
        </p>
      </Form.Header>

      <Form.Body>
        <p className="text-sm text-muted-foreground">
          {t('contact_message')}{' '}
          <a
            href="mailto:contact@codepp.fr"
            className="text-foreground underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            contact@codepp.fr
          </a>
        </p>
      </Form.Body>

      <Form.Footer>
        <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          <T dict={trad}>back_to_login</T>
        </Link>
      </Form.Footer>
    </Form>
  )
}

export { ForgotPasswordForm }