import { useEffect, useState } from 'react'
import { Building2, Filter, Plus, RefreshCw, Search } from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createCompany,
  deleteCompany,
  getCompanies,
  updateCompany,
  type Company,
  type CompanyFormValues,
} from '@/features/companies/api'
import { CompanyDeleteDialog } from '@/features/companies/components/CompanyDeleteDialog'
import { CompanyFormDialog } from '@/features/companies/components/CompanyFormDialog'
import { CompanyTable } from '@/features/companies/components/CompanyTable'
import { companyFiltersSchema } from '@/lib/validation'

export function CompaniesPage() {
  const { profile } = useAuth()
  const canUpdateCompany = profile?.permissions.includes('company:update') ?? false
  const canDeleteCompany = profile?.permissions.includes('company:delete') ?? false
  const [companies, setCompanies] = useState<Company[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [ordering, setOrdering] = useState('-created_at')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({ industry: '', country: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterError, setFilterError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1)
      setDebouncedQuery(query.trim())
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [query])

  useEffect(() => {
    let active = true

    void getCompanies({
      page,
      page_size: pageSize,
      search: debouncedQuery,
      ordering,
      industry: appliedFilters.industry,
      country: appliedFilters.country,
    })
      .then((result) => {
        if (!active) return
        setCount(result.count)
        if (page > 1 && result.results.length === 0) {
          setPage(Math.max(1, Math.ceil(result.count / pageSize)))
          return
        }
        setCompanies(result.results)
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Companies could not be loaded. Try again.',
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [ordering, page, pageSize, debouncedQuery, appliedFilters, reloadKey])

  function reloadCompanies() {
    setError('')
    setLoading(true)
    setReloadKey((key) => key + 1)
  }

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = companyFiltersSchema.safeParse({
      search: query,
      industry: industryFilter,
      country: countryFilter,
    })
    if (!parsed.success) {
      setFilterError(parsed.error.issues[0]?.message ?? 'Check the company filters.')
      return
    }

    setFilterError('')
    setPage(1)
    setAppliedFilters({
      industry: parsed.data.industry,
      country: parsed.data.country,
    })
    setDebouncedQuery(parsed.data.search)
  }

  function clearFilters() {
    setPage(1)
    setIndustryFilter('')
    setCountryFilter('')
    setAppliedFilters({ industry: '', country: '' })
    setFilterError('')
  }

  const hasActiveFilters = Boolean(
    query.trim() || appliedFilters.industry || appliedFilters.country,
  )

  function openAddDialog() {
    setEditingCompany(null)
    setDialogOpen(true)
  }

  function handleCompanyDialogOpenChange(open: boolean) {
    setDialogOpen(open)
    if (!open) setEditingCompany(null)
  }

  async function handleSave(company: CompanyFormValues) {
    if (editingCompany) {
      await updateCompany(editingCompany.id, company)
      setReloadKey((key) => key + 1)
      return
    }

    if (!company.logo) throw new Error('Choose a company logo to continue.')
    await createCompany({
      name: company.name,
      industry: company.industry,
      country: company.country,
      logo: company.logo,
    })
    setQuery('')
    setDebouncedQuery('')
    setPage(1)
    setReloadKey((key) => key + 1)
  }

  async function handleDelete() {
    if (!deletingCompany) return
    setDeleteBusy(true)
    setDeleteError('')

    try {
      await deleteCompany(deletingCompany.id)
      setDeletingCompany(null)
      setReloadKey((key) => key + 1)
    } catch (deleteRequestError) {
      setDeleteError(
        deleteRequestError instanceof Error
          ? deleteRequestError.message
          : 'The company could not be deleted.',
      )
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-6 py-7 sm:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-800">DIRECTORY</p>
            <h1 className="mt-1 text-2xl font-semibold">Companies</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the companies in your organization.
            </p>
          </div>
          <Button className="w-full sm:w-auto" onClick={openAddDialog}>
            <Plus aria-hidden="true" />
            Add company
          </Button>
        </div>

        <div className="mt-6">
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {loading
                ? 'Loading companies…'
                : `${count} ${count === 1 ? 'company' : 'companies'}`}
            </p>
            <form className="flex flex-wrap items-center gap-2" onSubmit={applyFilters}>
              <Input
                aria-label="Filter by industry"
                className="h-10 w-full border-border/30 shadow-none sm:w-36"
                maxLength={100}
                onChange={(event) => setIndustryFilter(event.target.value)}
                placeholder="Industry"
                value={industryFilter}
              />
              <Input
                aria-label="Filter by country"
                className="h-10 w-full border-border/30 shadow-none sm:w-36"
                maxLength={100}
                onChange={(event) => setCountryFilter(event.target.value)}
                placeholder="Country"
                value={countryFilter}
              />
              <Button type="submit" variant="outline">
                <Filter aria-hidden="true" />
                Filter
              </Button>
              {(appliedFilters.industry || appliedFilters.country) && (
                <Button onClick={clearFilters} type="button" variant="ghost">
                  Clear filters
                </Button>
              )}
              <div className="relative w-full sm:w-72">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  aria-label="Search companies"
                  className="h-10 border-border/30 pl-9 shadow-none"
                maxLength={200}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search companies"
                  value={query}
                />
              </div>
              <Button
                aria-label="Refresh companies"
                onClick={reloadCompanies}
                size="icon"
                title="Refresh companies"
                type="button"
                variant="ghost"
              >
                <RefreshCw aria-hidden="true" />
              </Button>
            </form>
          </div>
          {filterError && (
            <p className="pb-3 text-sm text-destructive" role="alert">
              {filterError}
            </p>
          )}

          {error ? (
            <div className="flex flex-col items-start gap-3 py-12" role="alert">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={reloadCompanies} variant="outline">
                <RefreshCw aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground" role="status">
              Loading companies…
            </p>
          ) : count === 0 && !hasActiveFilters ? (
            <div className="py-10 text-center">
              <Building2 aria-hidden="true" className="mx-auto size-6 text-muted-foreground" />
              <h2 className="mt-3 text-base font-semibold">No companies yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first company to start building your directory.
              </p>
              <Button className="mt-5" onClick={openAddDialog}>
                <Plus aria-hidden="true" />
                Add company
              </Button>
            </div>
          ) : count === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No companies match the current search and filters.
            </p>
          ) : (
            <CompanyTable
              canDelete={canDeleteCompany}
              canUpdate={canUpdateCompany}
              companies={companies}
              count={count}
              loading={loading}
              onOrderingChange={(nextOrdering) => {
                setPage(1)
                setOrdering(nextOrdering)
              }}
              onPageChange={setPage}
              onPageSizeChange={(nextPageSize) => {
                setPage(1)
                setPageSize(nextPageSize)
              }}
              onDelete={(company) => {
                setDeleteError('')
                setDeletingCompany(company)
              }}
              onEdit={(company) => {
                setEditingCompany(company)
                setDialogOpen(true)
              }}
              ordering={ordering}
              page={page}
              pageSize={pageSize}
            />
          )}
        </div>
      </section>

      <CompanyFormDialog
        company={editingCompany}
        onOpenChange={handleCompanyDialogOpenChange}
        onSave={handleSave}
        open={dialogOpen}
      />
      {canDeleteCompany && (
        <CompanyDeleteDialog
          busy={deleteBusy}
          company={deletingCompany}
          error={deleteError}
          onConfirm={handleDelete}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingCompany(null)
              setDeleteError('')
            }
          }}
        />
      )}
    </div>
  )
}