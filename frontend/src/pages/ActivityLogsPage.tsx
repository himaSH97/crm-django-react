import { useState, type FormEvent } from 'react'
import { Activity, Building2, LogOut, RotateCcw, Search } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ActivityLogTable, type ActivityLogFilters } from '@/features/activity-logs/components/ActivityLogTable'
import { activityFiltersSchema } from '@/lib/validation'

const initialFilters: ActivityLogFilters = {
  action: '',
  model_name: '',
  username: '',
  search: '',
}

export function ActivityLogsPage() {
  const { profile, signOut } = useAuth()
  const canReadActivity = profile?.role === 'admin' || profile?.role === 'manager'
  const [draftFilters, setDraftFilters] = useState(initialFilters)
  const [filters, setFilters] = useState(initialFilters)
  const [filterError, setFilterError] = useState('')

  if (!canReadActivity) return <Navigate replace to="/companies" />

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = activityFiltersSchema.safeParse(draftFilters)
    if (!parsed.success) {
      setFilterError(parsed.error.issues[0]?.message ?? 'Check the activity filters.')
      return
    }
    setFilterError('')
    setFilters({
      ...parsed.data,
    })
  }

  function resetFilters() {
    setDraftFilters(initialFilters)
    setFilters(initialFilters)
    setFilterError('')
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="flex min-h-16 items-center justify-between gap-4 border-b border-border px-6 sm:px-10">
        <div className="flex items-center gap-6">
          <Link className="inline-flex shrink-0 items-center gap-3" to="/companies">
            <span className="flex size-9 items-center justify-center rounded-md bg-emerald-950 text-lime-300">
              <Building2 aria-hidden="true" className="size-5" />
            </span>
            <span className="text-sm font-bold tracking-[0.12em]">SBLM</span>
          </Link>
          <Link
            aria-current="page"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
            to="/activity-logs"
          >
            <Activity aria-hidden="true" className="size-4" />
            Activity
          </Link>
        </div>
        <Button onClick={signOut} type="button" variant="ghost">
          <LogOut aria-hidden="true" />
          Sign out
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-7 sm:px-10">
        <div>
          <p className="text-xs font-semibold text-emerald-800">ORGANIZATION</p>
          <h1 className="mt-1 text-2xl font-semibold">Activity log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent company and contact changes in your organization.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg bg-card">
          <form
            className="grid gap-4 border-b border-border/20 p-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.2fr_auto]"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="activity-search">Search</Label>
              <Input
                className="h-10 border-border/30 bg-background shadow-none"
                id="activity-search"
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, search: event.target.value }))
                }
                placeholder="Username or object ID"
                value={draftFilters.search}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="activity-action">Action</Label>
              <Select
                onValueChange={(value) =>
                  setDraftFilters((current) => ({
                    ...current,
                    action: value === 'all' ? '' : value,
                  }))
                }
                value={draftFilters.action || 'all'}
              >
                <SelectTrigger className="h-10 w-full border-border/30 bg-background shadow-none" id="activity-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="activity-resource">Resource</Label>
              <Select
                onValueChange={(value) =>
                  setDraftFilters((current) => ({
                    ...current,
                    model_name: value === 'all' ? '' : value,
                  }))
                }
                value={draftFilters.model_name || 'all'}
              >
                <SelectTrigger className="h-10 w-full border-border/30 bg-background shadow-none" id="activity-resource">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All resources</SelectItem>
                  <SelectItem value="Company">Companies</SelectItem>
                  <SelectItem value="Contact">Contacts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="activity-username">Username</Label>
              <Input
                className="h-10 border-border/30 bg-background shadow-none"
                id="activity-username"
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, username: event.target.value }))
                }
                placeholder="Filter by username"
                value={draftFilters.username}
              />
            </div>

            <div className="flex items-end gap-2 lg:flex-col lg:justify-end xl:flex-row">
              <Button aria-label="Apply filters" className="h-10" size="icon" type="submit">
                <Search aria-hidden="true" />
              </Button>
              <Button
                aria-label="Reset filters"
                className="h-10"
                onClick={resetFilters}
                size="icon"
                title="Reset filters"
                type="button"
                variant="ghost"
              >
                <RotateCcw aria-hidden="true" />
              </Button>
            </div>
          </form>
          {filterError && (
            <p className="px-4 py-3 text-sm text-destructive" role="alert">
              {filterError}
            </p>
          )}

          <ActivityLogTable filters={filters} key={JSON.stringify(filters)} />
        </div>
      </section>
    </main>
  )
}