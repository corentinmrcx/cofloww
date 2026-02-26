import { ThemeToggle } from './components/ThemeToggle'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">CoFloww</h1>
      <ThemeToggle />
    </div>
  )
}

export default App
