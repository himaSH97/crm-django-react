import { Pencil, Trash2 } from 'lucide-react'
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
import type { Contact } from '@/features/contacts/api'

type ContactTableProps = {
  contacts: Contact[]
  canUpdate: boolean
  canDelete: boolean
  onEdit: (contact: Contact) => void
  onDelete: (contact: Contact) => void
}

export function ContactTable({
  contacts,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: ContactTableProps) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          {(canUpdate || canDelete) && (
            <TableHead className="w-24 text-right">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.map((contact) => (
          <TableRow
            className="cursor-pointer"
            key={contact.id}
            onClick={() => navigate(`/contacts/${encodeURIComponent(contact.id)}`)}
          >
            <TableCell className="font-medium text-foreground">
              <Link
                className="hover:underline"
                onClick={(event) => event.stopPropagation()}
                to={`/contacts/${encodeURIComponent(contact.id)}`}
              >
                {contact.full_name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{contact.role}</TableCell>
            <TableCell>
              <a
                className="text-foreground hover:underline"
                href={`mailto:${contact.email}`}
                onClick={(event) => event.stopPropagation()}
              >
                {contact.email}
              </a>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {contact.phone ? (
                <a
                  className="hover:text-foreground"
                  href={`tel:${contact.phone}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  {contact.phone}
                </a>
              ) : (
                '—'
              )}
            </TableCell>
            {(canUpdate || canDelete) && (
              <TableCell>
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
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}