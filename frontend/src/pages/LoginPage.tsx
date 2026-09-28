import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, LayoutGrid, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginPage() {
  const { signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('')
    setBusy(true)

    const values = new FormData(event.currentTarget)
    const username = String(values.get('username') ?? '').trim()
    const password = String(values.get('password') ?? '')

    try {
      await signIn(username, password)
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : 'Authentication failed. Try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-[minmax(360px,0.9fr)_minmax(480px,1.1fr)]">
      <section className="flex min-h-[360px] flex-col justify-between bg-emerald-950 px-7 py-7 text-white sm:px-10 sm:py-9 lg:min-h-svh lg:px-12 lg:py-11">
        <Link className="inline-flex w-fit items-center gap-3" to="/">
          <span className="flex size-10 items-center justify-center rounded-md bg-lime-300 text-emerald-950">
            <LayoutGrid aria-hidden="true" className="size-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-[0.12em]">SBLM</span>
            <span className="mt-1 text-[10px] font-medium tracking-[0.16em] text-white/70">
              WORKSPACE
            </span>
          </span>
        </Link>

        <div className="my-12 max-w-md lg:my-0">
          <p className="text-xs font-semibold tracking-[0.16em] text-lime-200">
            YOUR WORKSPACE, IN VIEW
          </p>
          <h2 className="mt-5 max-w-sm text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Welcome to a clearer way forward.
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/75">
          <LockKeyhole aria-hidden="true" className="size-3.5" />
          <span>Private workspace access</span>
        </div>
      </section>

      <section className="flex min-h-[560px] items-center justify-center px-5 py-12 sm:px-10 lg:min-h-svh lg:px-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-7">
            <p className="text-xs font-semibold tracking-[0.12em] text-emerald-800">
              ACCOUNT ACCESS
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with your username to continue.
            </p>
          </div>

          <Card className="border-border/80 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Sign in</CardTitle>
              <CardDescription>Enter your username and password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    autoComplete="username"
                    id="username"
                    name="username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      autoComplete="current-password"
                      className="pr-12"
                      id="password"
                      name="password"
                      required
                      type={showPassword ? 'text' : 'password'}
                    />
                    <Button
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-1 top-1"
                      onClick={() => setShowPassword((visible) => !visible)}
                      size="icon-lg"
                      type="button"
                      variant="ghost"
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" />
                      ) : (
                        <Eye aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  className="h-11 w-full bg-emerald-800 text-white hover:bg-emerald-900"
                  disabled={busy}
                  type="submit"
                >
                  {busy ? 'Please wait…' : 'Sign in'}
                </Button>
                <p aria-live="polite" className="min-h-5 text-sm text-destructive">
                  {notice}
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}