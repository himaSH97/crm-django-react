import { useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Contact, NewContact } from '@/features/contacts/api'
import { contactFormSchema } from '@/lib/validation'

type ContactFormDialogProps = {
  open: boolean
  companyName?: string
  contact?: Contact | null
  onOpenChange: (open: boolean) => void
  onSave: (contact: NewContact) => Promise<void>
}

export function ContactFormDialog({
  open,
  companyName,
  contact,
  onOpenChange,
  onSave,
}: ContactFormDialogProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function handleOpenChange(nextOpen: boolean, force = false) {
    if (busy && !nextOpen && !force) return
    if (!nextOpen) {
      formRef.current?.reset()
      setError('')
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)

    const values = new FormData(event.currentTarget)
    const parsed = contactFormSchema.safeParse({
      full_name: values.get('full_name'),
      email: values.get('email'),
      phone: values.get('phone'),
      role: values.get('role'),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the contact details.')
      setBusy(false)
      return
    }

    try {
      await onSave(parsed.data as NewContact)
      handleOpenChange(false, true)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'The contact could not be added. Try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{contact ? 'Edit contact' : 'Add contact'}</DialogTitle>
          <DialogDescription>
            {contact
              ? `Update ${contact.full_name}’s contact details.`
              : `Add a person associated with ${companyName}.`}
          </DialogDescription>
        </DialogHeader>

        <form
          key={`${contact?.id ?? 'new'}:${open ? 'open' : 'closed'}`}
          ref={formRef}
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label htmlFor="contact-full-name">Full name</Label>
            <Input
              autoComplete="name"
              defaultValue={contact?.full_name ?? ''}
              id="contact-full-name"
              maxLength={255}
              name="full_name"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-role">Role</Label>
              <Input
                id="contact-role"
                defaultValue={contact?.role ?? ''}
                maxLength={100}
                name="role"
                placeholder="Procurement manager"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                autoComplete="email"
                id="contact-email"
                defaultValue={contact?.email ?? ''}
                name="email"
                required
                type="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              autoComplete="tel"
              defaultValue={contact?.phone ?? ''}
              id="contact-phone"
              maxLength={32}
              name="phone"
              type="tel"
            />
          </div>

          {error && (
            <p aria-live="polite" className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              disabled={busy}
              onClick={() => handleOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={busy} type="submit">
              {busy
                ? contact
                  ? 'Saving changes…'
                  : 'Adding contact…'
                : contact
                  ? 'Save changes'
                  : 'Add contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}