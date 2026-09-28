import { Building2, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
  canUpdate: boolean
  canDelete: boolean
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
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: CompanyTableProps) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[42%]">Company</TableHead>
          <TableHead>Industry</TableHead>
          <TableHead>Country</TableHead>
          <TableHead className="text-right">Added</TableHead>
          {(canUpdate || canDelete) && (
            <TableHead className="w-24 text-right">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => (
          <TableRow
            key={company.id}
            className="cursor-pointer"
            onClick={() => navigate(`/companies/${encodeURIComponent(company.id)}`)}
          >
            <TableCell>
              <div className="flex min-w-48 items-center gap-2">
                <CompanyLogo company={company} />
                <Link
                  className="truncate font-medium text-foreground hover:underline"
                  onClick={(event) => event.stopPropagation()}
                  to={`/companies/${encodeURIComponent(company.id)}`}
                >
                  {company.name}
                </Link>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{company.industry}</TableCell>
            <TableCell className="text-muted-foreground">{company.country}</TableCell>
            <TableCell className="text-right text-muted-foreground">
              {dateFormatter.format(new Date(company.created_at))}
            </TableCell>
            {(canUpdate || canDelete) && (
              <TableCell>
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
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}