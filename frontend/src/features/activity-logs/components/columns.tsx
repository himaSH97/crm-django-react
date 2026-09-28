import type { ColumnDef } from '@tanstack/react-table'
import type { ActivityLog } from '@/features/activity-logs/api'

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const activityLogColumns: ColumnDef<ActivityLog>[] = [
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ getValue }) => {
      const username = getValue<string>()
      const initials = username.slice(0, 2).toUpperCase()
      return (
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-800"
          >
            {initials}
          </span>
          <span className="font-medium text-foreground">{username}</span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'action',
    header: 'Activity',
    cell: ({ row }) => {
      const { action, model_name: modelName } = row.original
      const tone = action === 'delete'
        ? 'bg-red-50 text-red-700'
        : action === 'create'
          ? 'bg-emerald-50 text-emerald-800'
          : 'bg-sky-50 text-sky-700'
      return (
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </span>
          <span className="text-sm text-muted-foreground">{modelName}</span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'object_id',
    header: 'Record ID',
    cell: ({ getValue }) => {
      const objectId = getValue<string>()
      return (
        <span
          className="rounded bg-muted/70 px-2 py-1 font-mono text-xs text-muted-foreground"
          title={objectId}
        >
          {objectId.slice(0, 8)}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'timestamp',
    header: 'When',
    cell: ({ getValue }) => timestampFormatter.format(new Date(getValue<string>())),
    enableSorting: true,
  },
]