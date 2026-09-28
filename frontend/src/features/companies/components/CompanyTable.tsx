import { Building2, Pencil, Trash2 } from 'lucide-react'
import {
  functionalUpdate,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Company } from '@/features/companies/api'

type CompanyTableProps = {
  companies: Company[]
  count: number
  page: number
  pageSize: number
  ordering: string
  loading: boolean
  canUpdate: boolean
  canDelete: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onOrderingChange: (ordering: string) => void
  onEdit: (company: Company) => void
  onDelete: (company: Company) => void
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
})

function CompanyLogo({ company }: { company: Company }) {
  const [failed, setFailed] = useState(false)

  if (!company.logo || failed) {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center text-muted-foreground">
        <Building2 aria-hidden="true" className="size-4" />
      </span>
    )
  }

  return (
    <img
      alt=""
      className="size-7 shrink-0 rounded-sm object-cover"
      onError={() => setFailed(true)}
      src={company.logo}
    />
  )
}

export function CompanyTable({
  companies,
  count,
  page,
  pageSize,
  ordering,
  loading,
  canUpdate,
  canDelete,
  onPageChange,
  onPageSizeChange,
  onOrderingChange,
  onEdit,
  onDelete,
}: CompanyTableProps) {
  const navigate = useNavigate()
  const sorting: SortingState = [{
    id: ordering.startsWith('-') ? ordering.slice(1) : ordering,
    desc: ordering.startsWith('-'),
  }]
  const pagination: PaginationState = { pageIndex: page - 1, pageSize }

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: 'name',
      header: 'Company',
      cell: ({ row }) => {
        const company = row.original
        return (
          <div className="flex min-w-48 items-center gap-3">
            <CompanyLogo company={company} />
            <Link
              className="truncate font-medium text-foreground hover:underline"
              onClick={(event) => event.stopPropagation()}
              to={`/companies/${encodeURIComponent(company.id)}`}
            >
              {company.name}
            </Link>
          </div>
        )
      },
    },
    { accessorKey: 'industry', header: 'Industry' },
    { accessorKey: 'country', header: 'Country' },
    {
      accessorKey: 'created_at',
      header: 'Added',
      cell: ({ getValue }) => dateFormatter.format(new Date(getValue<string>())),
    },
    ...((canUpdate || canDelete)
      ? [{
          id: 'actions',
          enableSorting: false,
          header: () => <span className="sr-only">Actions</span>,
          cell: ({ row }: { row: { original: Company } }) => {
            const company = row.original
            return (
              <div className="flex justify-end gap-1">
                {canUpdate && (
                  <Button
                    aria-label={`Edit ${company.name}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit(company)
                    }}
                    size="icon-sm"
                    title={`Edit ${company.name}`}
                    type="button"
                    variant="ghost"
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    aria-label={`Delete ${company.name}`}
                    className="text-destructive hover:text-destructive"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete(company)
                    }}
                    size="icon-sm"
                    title={`Delete ${company.name}`}
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                )}
              </div>
            )
          },
        } as ColumnDef<Company>]
      : []),
  ]

  const table = useReactTable({
    data: companies,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(count / pageSize),
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination)
      onPageChange(next.pageIndex + 1)
      if (next.pageSize !== pageSize) onPageSizeChange(next.pageSize)
    },
    onSortingChange: (updater) => {
      const next = functionalUpdate(updater, sorting)
      const selected = next[0]
      onOrderingChange(selected
        ? `${selected.desc ? '-' : ''}${selected.id}`
        : '-created_at')
    },
    state: { pagination, sorting },
  })

  return (
    <div className="bg-card">
      <Table className="[&_td]:h-14 [&_td]:px-4 [&_th]:px-4 [&_tr]:border-border/20">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="bg-muted/30 hover:bg-muted/30" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const direction = header.column.getIsSorted()
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <Button
                        aria-label={`Sort by ${header.column.id}`}
                        className="-ml-2 h-8 px-2 font-medium"
                        onClick={header.column.getToggleSortingHandler()}
                        type="button"
                        variant="ghost"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {direction === 'asc' ? (
                          <ArrowUp aria-hidden="true" />
                        ) : direction === 'desc' ? (
                          <ArrowDown aria-hidden="true" />
                        ) : (
                          <ArrowUpDown aria-hidden="true" />
                        )}
                      </Button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={columns.length}
              >
                No companies match this search.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                className="cursor-pointer"
                key={row.id}
                onClick={() => navigate(`/companies/${encodeURIComponent(row.original.id)}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/20 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          {loading
            ? 'Loading companies…'
            : `${count} ${count === 1 ? 'company' : 'companies'}`}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Rows per page
            <Select
              onValueChange={(value) => table.setPageSize(Number(value))}
              value={String(pageSize)}
            >
              <SelectTrigger aria-label="Rows per page" className="h-8 w-16 border-border/30 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <span className="min-w-24 text-center text-sm text-muted-foreground">
            Page {page} of {Math.max(table.getPageCount(), 1)}
          </span>
          <Button
            aria-label="Previous page"
            disabled={loading || !table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            aria-label="Next page"
            disabled={loading || !table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  )
}