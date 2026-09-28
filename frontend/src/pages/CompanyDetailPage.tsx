import { useEffect, useState } from 'react'
import { ArrowLeft, Building2, LogOut, Plus } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { getCompany, type Company } from '@/features/companies/api'
import { getCompanyContacts, type Contact } from '@/features/contacts/api'
import {
  createContact,
  deleteContact,
  updateContact,
  type NewContact,
} from '@/features/contacts/api'
import { ContactDeleteDialog } from '@/features/contacts/components/ContactDeleteDialog'
import { ContactFormDialog } from '@/features/contacts/components/ContactFormDialog'
import { ContactTable } from '@/features/contacts/components/ContactTable'

type ContactsState = {
  companyId: string
  status: 'loading' | 'loaded' | 'error'
  contacts: Contact[]
  error: string
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
})

export function CompanyDetailPage() {
  const { companyId = '' } = useParams()
  const { profile, signOut } = useAuth()
  const canUpdateContact = profile?.permissions.includes('contact:update') ?? false
  const canDeleteContact = profile?.permissions.includes('contact:delete') ?? false
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [contactsState, setContactsState] = useState<ContactsState>({
    companyId: '',
    status: 'loading',
    contacts: [],
    error: '',
  })
  const [contactsReloadKey, setContactsReloadKey] = useState(0)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    let active = true
    void getCompany(companyId)
      .then((result) => {
        if (active) setCompany(result)
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Company details could not be loaded.',
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [companyId, reloadKey])

  useEffect(() => {
    let active = true
    void getCompanyContacts(companyId)
      .then((contacts) => {
        if (active) {
          setContactsState({ companyId, status: 'loaded', contacts, error: '' })
        }
      })
      .catch((contactsError: unknown) => {
        if (active) {
          setContactsState({
            companyId,
            status: 'error',
            contacts: [],
            error:
              contactsError instanceof Error
                ? contactsError.message
                : 'Contacts could not be loaded.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [companyId, contactsReloadKey])

  function retry() {
    setError('')
    setLoading(true)
    setReloadKey((key) => key + 1)
  }

  function retryContacts() {
    setContactsState({ companyId, status: 'loading', contacts: [], error: '' })
    setContactsReloadKey((key) => key + 1)
  }

  async function handleSaveContact(contact: NewContact) {
    if (editingContact) {
      const updatedContact = await updateContact(editingContact.id, contact)
      setContactsState((current) => ({
        companyId,
        status: 'loaded',
        contacts:
          current.companyId === companyId && current.status === 'loaded'
            ? current.contacts.map((item) =>
                item.id === updatedContact.id ? updatedContact : item,
              )
            : [updatedContact],
        error: '',
      }))
      return
    }

    await createContact(companyId, contact)
    setContactsState({ companyId, status: 'loading', contacts: [], error: '' })
    setContactsReloadKey((key) => key + 1)
  }

  async function handleDeleteContact() {
    if (!deletingContact) return
    setDeleteBusy(true)
    setDeleteError('')

    try {
      await deleteContact(deletingContact.id)
      setContactsState((current) => ({
        ...current,
        contacts: current.contacts.filter((item) => item.id !== deletingContact.id),
      }))
      setDeletingContact(null)
    } catch (deleteRequestError) {
      setDeleteError(
        deleteRequestError instanceof Error
          ? deleteRequestError.message
          : 'The contact could not be deleted.',
      )
    } finally {
      setDeleteBusy(false)
    }
  }

  function handleContactDialogOpenChange(open: boolean) {
    setContactDialogOpen(open)
    if (!open) setEditingContact(null)
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b border-border px-6 sm:px-10">
        <Link className="inline-flex items-center gap-3" to="/companies">
          <span className="flex size-9 items-center justify-center text-emerald-900">
            <Building2 aria-hidden="true" className="size-5" />
          </span>
          <span className="text-sm font-bold tracking-[0.12em]">SBLM</span>
        </Link>
        <Button onClick={signOut} type="button" variant="outline">
          <LogOut aria-hidden="true" />
          Sign out
        </Button>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-6 sm:px-10">
        <Link
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          to="/companies"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Companies
        </Link>

        {loading ? (
          <p className="py-16 text-sm text-muted-foreground" role="status">
            Loading company…
          </p>
        ) : error ? (
          <div className="py-16" role="alert">
            <p className="text-sm text-destructive">{error}</p>
            <Button className="mt-4" onClick={retry} variant="outline">
              Try again
            </Button>
          </div>
        ) : company ? (
          <div className="mt-6">
            <div className="flex items-center gap-4 border-b border-border pb-6">
              {company.logo ? (
                <img
                  alt=""
                  className="size-14 rounded-sm object-cover"
                  onError={(event) => {
                    event.currentTarget.hidden = true
                  }}
                  src={company.logo}
                />
              ) : (
                <Building2 aria-hidden="true" className="size-8 text-muted-foreground" />
              )}
              <div>
                <p className="text-xs font-medium text-muted-foreground">COMPANY</p>
                <h1 className="mt-1 text-2xl font-semibold">{company.name}</h1>
              </div>
            </div>

            <dl className="grid gap-4 py-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Industry</dt>
                <dd className="mt-1 text-sm font-medium">{company.industry}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Country</dt>
                <dd className="mt-1 text-sm font-medium">{company.country}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Added</dt>
                <dd className="mt-1 text-sm font-medium">
                  {dateFormatter.format(new Date(company.created_at))}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Company ID</dt>
                <dd className="mt-1 break-all font-mono text-xs text-muted-foreground">
                  {company.id}
                </dd>
              </div>
            </dl>

            <section className="border-t border-border pt-5" aria-labelledby="contacts-heading">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold" id="contacts-heading">
                    Contacts
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    People associated with {company.name}.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {contactsState.companyId === companyId &&
                    contactsState.status === 'loaded' && (
                      <span className="text-sm text-muted-foreground">
                        {contactsState.contacts.length}
                      </span>
                    )}
                  <Button
                    onClick={() => {
                      setEditingContact(null)
                      setContactDialogOpen(true)
                    }}
                    type="button"
                  >
                    <Plus aria-hidden="true" />
                    Add contact
                  </Button>
                </div>
              </div>

              {contactsState.companyId !== companyId || contactsState.status === 'loading' ? (
                <p className="py-6 text-sm text-muted-foreground" role="status">
                  Loading contacts…
                </p>
              ) : contactsState.status === 'error' ? (
                <div className="py-6" role="alert">
                  <p className="text-sm text-destructive">{contactsState.error}</p>
                  <Button className="mt-3" onClick={retryContacts} variant="outline">
                    Try again
                  </Button>
                </div>
              ) : contactsState.contacts.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">
                  No contacts are linked to this company.
                </p>
              ) : (
                <ContactTable
                  canDelete={canDeleteContact}
                  canUpdate={canUpdateContact}
                  contacts={contactsState.contacts}
                  onDelete={(contact) => {
                    setDeleteError('')
                    setDeletingContact(contact)
                  }}
                  onEdit={(contact) => {
                    setEditingContact(contact)
                    setContactDialogOpen(true)
                  }}
                />
              )}
            </section>
          </div>
        ) : null}
      </section>

      {company && (
          <ContactFormDialog
            companyName={company.name}
          contact={editingContact}
          onSave={handleSaveContact}
          onOpenChange={handleContactDialogOpenChange}
          open={contactDialogOpen}
        />
      )}
      {canDeleteContact && (
        <ContactDeleteDialog
          busy={deleteBusy}
          contact={deletingContact}
          error={deleteError}
          onConfirm={handleDeleteContact}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingContact(null)
              setDeleteError('')
            }
          }}
          open={deletingContact !== null}
        />
      )}
    </main>
  )
}