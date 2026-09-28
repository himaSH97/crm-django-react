import { useEffect, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
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
import {
  getActivityLogs,
  type ActivityLog,
  type ActivityLogQuery,
} from '@/features/activity-logs/api'
import { activityLogColumns } from '@/features/activity-logs/components/columns'

export type ActivityLogFilters = Pick<
  ActivityLogQuery,
  'action' | 'model_name' | 'username' | 'search'
>

type ActivityLogTableProps = {
  filters: ActivityLogFilters
}

export function ActivityLogTable({ filters }: ActivityLogTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: true },
  ])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [rows, setRows] = useState<ActivityLog[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true
    const sort = sorting[0]
    const ordering = sort
      ? `${sort.desc ? '-' : ''}${sort.id}`
      : undefined

    setLoading(true)
    setError('')

    void getActivityLogs({
      ...filters,
      ordering,
      page: pagination.pageIndex + 1,
      page_size: pagination.pageSize,
    })
      .then((result) => {
        if (!active) return
        setRows(result.results)
        setCount(result.count)
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Activity logs could not be loaded.',
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filters, pagination.pageIndex, pagination.pageSize, retryKey, sorting])

  const table = useReactTable({
    data: rows,
    columns: activityLogColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(count / pagination.pageSize),
    onPaginationChange: setPagination,
    onSortingChange: (updater) => {
      setSorting(updater)
      setPagination((current) => ({ ...current, pageIndex: 0 }))
    },
    state: { pagination, sorting },
  })

  return (
    <section aria-label="Activity records" className="bg-card">
      {error ? (
        <div className="flex items-center justify-between gap-4 px-4 py-8" role="alert">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            onClick={() => setRetryKey((current) => current + 1)}
            type="button"
            variant="outline"
          >
            <RefreshCw aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : (
        <>
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
              {loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell className="h-24 text-center text-muted-foreground" colSpan={activityLogColumns.length}>
                    Loading activity…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell className="h-24 text-center text-muted-foreground" colSpan={activityLogColumns.length}>
                    No activity matches these filters.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
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
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {loading
                ? 'Loading activity…'
                : `${count} ${count === 1 ? 'entry' : 'entries'}`}
            </p>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                Rows per page
                <Select
                  onValueChange={(value) => table.setPageSize(Number(value))}
                  value={String(pagination.pageSize)}
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
                Page {pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
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
        </>
      )}
    </section>
  )
}
