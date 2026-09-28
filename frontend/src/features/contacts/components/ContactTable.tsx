import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from 'lucide-react'
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
import type { Contact } from '@/features/contacts/api'

type ContactTableProps = {
  contacts: Contact[]
  count: number
  page: number
  pageSize: number
  ordering: string
  canUpdate: boolean
  canDelete: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onOrderingChange: (ordering: string) => void
  onEdit: (contact: Contact) => void
  onDelete: (contact: Contact) => void
}

export function ContactTable({
  contacts,
  count,
  page,
  pageSize,
  ordering,
  canUpdate,
  canDelete,
  onPageChange,
  onPageSizeChange,
  onOrderingChange,
  onEdit,
  onDelete,
}: ContactTableProps) {
  const navigate = useNavigate()
  const sorting: SortingState = ordering.startsWith('-')
    ? [{ id: ordering.slice(1), desc: true }]
    : [{ id: ordering, desc: false }]
  const pagination = { pageIndex: page - 1, pageSize }

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: 'full_name',
      header: 'Name',
      cell: ({ row }) => {
        const contact = row.original
        return (
          <Link
            className="font-medium text-foreground hover:underline"
            onClick={(event) => event.stopPropagation()}
            to={`/contacts/${encodeURIComponent(contact.id)}`}
          >
            {contact.full_name}
          </Link>
        )
      },
    },
    { accessorKey: 'role', header: 'Role' },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <a
          className="text-foreground hover:underline"
          href={`mailto:${row.original.email}`}
          onClick={(event) => event.stopPropagation()}
        >
          {row.original.email}
        </a>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone ? (
        <a
          className="text-muted-foreground hover:text-foreground"
          href={`tel:${row.original.phone}`}
          onClick={(event) => event.stopPropagation()}
        >
          {row.original.phone}
        </a>
      ) : '—',
    },
    ...((canUpdate || canDelete)
      ? [{
          id: 'actions',
          enableSorting: false,
          header: () => <span className="sr-only">Actions</span>,
          cell: ({ row }: { row: { original: Contact } }) => {
            const contact = row.original
            return (
              <div className="flex justify-end gap-1">
                {canUpdate && (
                  <Button
                    aria-label={`Edit ${contact.full_name}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit(contact)
                    }}
                    size="icon-sm"
                    title={`Edit ${contact.full_name}`}
                    type="button"
                    variant="ghost"
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    aria-label={`Delete ${contact.full_name}`}
                    className="text-destructive hover:text-destructive"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete(contact)
                    }}
                    size="icon-sm"
                    title={`Delete ${contact.full_name}`}
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                )}
              </div>
            )
          },
        } as ColumnDef<Contact>]
      : []),
  ]

  const table = useReactTable({
    data: contacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(count / pageSize),
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      const nextPage = next.pageSize === pageSize ? next.pageIndex + 1 : 1
      if (next.pageSize !== pageSize) onPageSizeChange(next.pageSize)
      if (nextPage !== page) onPageChange(nextPage)
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      const sort = next[0]
      onOrderingChange(sort ? `${sort.desc ? '-' : ''}${sort.id}` : 'full_name')
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
          {table.getRowModel().rows.map((row) => (
            <TableRow
              className="cursor-pointer"
              key={row.id}
              onClick={() => navigate(`/contacts/${encodeURIComponent(row.original.id)}`)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/20 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          {count} {count === 1 ? 'contact' : 'contacts'}
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
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            aria-label="Next page"
            disabled={!table.getCanNextPage()}
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