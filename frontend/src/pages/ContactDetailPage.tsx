import { useEffect, useState } from 'react'
import { ArrowLeft, Building2, Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import {
  deleteContact,
  getContact,
  updateContact,
  type Contact,
  type NewContact,
} from '@/features/contacts/api'
import { ContactDeleteDialog } from '@/features/contacts/components/ContactDeleteDialog'
import { ContactFormDialog } from '@/features/contacts/components/ContactFormDialog'

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
})

export function ContactDetailPage() {
  const { contactId = '' } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const canUpdateContact = profile?.permissions.includes('contact:update') ?? false
  const canDeleteContact = profile?.permissions.includes('contact:delete') ?? false
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    let active = true
    void getContact(contactId)
      .then((result) => {
        if (active) setContact(result)
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Contact details could not be loaded.',
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [contactId, reloadKey])

  function retry() {
    setError('')
    setLoading(true)
    setReloadKey((key) => key + 1)
  }

  async function handleSave(values: NewContact) {
    const updatedContact = await updateContact(contactId, values)
    setContact(updatedContact)
  }

  async function handleDelete() {
    setDeleteBusy(true)
    setDeleteError('')

    try {
      await deleteContact(contactId)
      if (contact) {
        navigate(`/companies/${encodeURIComponent(contact.company)}`, { replace: true })
      }
    } catch (deleteRequestError) {
      setDeleteBusy(false)
      setDeleteError(
        deleteRequestError instanceof Error
          ? deleteRequestError.message
          : 'The contact could not be deleted.',
      )
    }
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
        <Link
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          to={contact ? `/companies/${encodeURIComponent(contact.company)}` : '/companies'}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to company
        </Link>

        {loading ? (
          <p className="py-16 text-sm text-muted-foreground" role="status">
            Loading contact…
          </p>
        ) : error ? (
          <div className="py-16" role="alert">
            <p className="text-sm text-destructive">{error}</p>
            <Button className="mt-4" onClick={retry} variant="outline">
              Try again
            </Button>
          </div>
        ) : contact ? (
          <div className="mt-8">
            <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">CONTACT</p>
                <h1 className="mt-1 text-2xl font-semibold">{contact.full_name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{contact.role}</p>
              </div>
              {(canUpdateContact || canDeleteContact) && (
                <div className="flex flex-wrap gap-2">
                  {canUpdateContact && (
                    <Button onClick={() => setEditOpen(true)} type="button" variant="outline">
                      <Pencil aria-hidden="true" />
                      Edit contact
                    </Button>
                  )}
                  {canDeleteContact && (
                    <Button
                      onClick={() => setDeleteOpen(true)}
                      type="button"
                      variant="destructive"
                    >
                      <Trash2 aria-hidden="true" />
                      Delete contact
                    </Button>
                  )}
                </div>
              )}
            </div>

            <dl className="grid gap-6 py-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="mt-1 text-sm font-medium">
                  <a className="hover:underline" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Phone</dt>
                <dd className="mt-1 text-sm font-medium">
                  {contact.phone ? (
                    <a className="hover:underline" href={`tel:${contact.phone}`}>
                      {contact.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Company</dt>
                <dd className="mt-1 text-sm font-medium">
                  <Link className="hover:underline" to={`/companies/${encodeURIComponent(contact.company)}`}>
                    View company
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Added</dt>
                <dd className="mt-1 text-sm font-medium">
                  {dateFormatter.format(new Date(contact.created_at))}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Contact ID</dt>
                <dd className="mt-1 break-all font-mono text-xs text-muted-foreground">
                  {contact.id}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </section>

      {contact && canUpdateContact && (
        <ContactFormDialog
          companyName="this company"
          contact={contact}
          onOpenChange={setEditOpen}
          onSave={handleSave}
          open={editOpen}
        />
      )}
      {canDeleteContact && (
        <ContactDeleteDialog
          busy={deleteBusy}
          contact={contact}
          error={deleteError}
          onConfirm={handleDelete}
          onOpenChange={(open) => {
            setDeleteOpen(open)
            if (!open) setDeleteError('')
          }}
          open={deleteOpen}
        />
      )}
    </div>
  )
}