import { Outlet } from 'react-router'
import ThemeToggle from '../ThemeToggle'
import { LangSelector } from '../LangSelector'

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4">
        <Outlet />
      </div>
      <div className="flex items-center justify-center gap-6 p-4 border-t border-border">
        <ThemeToggle />
        <LangSelector />
      </div>
    </div>
  )
}

export default AuthLayout
