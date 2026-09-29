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
import type { Company, CompanyFormValues } from '@/features/companies/api'

type CompanyFormDialogProps = {
  open: boolean
  company: Company | null
  onOpenChange: (open: boolean) => void
  onSave: (company: CompanyFormValues) => Promise<void>
}

export function CompanyFormDialog({
  open,
  company,
  onOpenChange,
  onSave,
}: CompanyFormDialogProps) {
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
    const selectedLogo = values.get('logo')
    const logo = selectedLogo instanceof File && selectedLogo.size > 0
      ? selectedLogo
      : undefined

    if (!company && !logo) {
      setError('Choose a company logo to continue.')
      setBusy(false)
      return
    }

    try {
      await onSave({
        name: String(values.get('name') ?? '').trim(),
        industry: String(values.get('industry') ?? '').trim(),
        country: String(values.get('country') ?? '').trim(),
        ...(logo ? { logo } : {}),
      })
      handleOpenChange(false, true)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'The company could not be created. Try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{company ? 'Edit company' : 'Add company'}</DialogTitle>
          <DialogDescription>
            {company
              ? 'Update this company’s details.'
              : 'Add a company to your organization directory.'}
          </DialogDescription>
        </DialogHeader>

        <form
          key={`${company?.id ?? 'new'}:${open ? 'open' : 'closed'}`}
          ref={formRef}
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label htmlFor="company-name">Company name</Label>
            <Input
              autoComplete="organization"
              defaultValue={company?.name ?? ''}
              id="company-name"
              maxLength={255}
              name="name"
              placeholder="Acme Inc."
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-industry">Industry</Label>
              <Input
                id="company-industry"
                defaultValue={company?.industry ?? ''}
                maxLength={100}
                name="industry"
                placeholder="Technology"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-country">Country</Label>
              <Input
                autoComplete="country-name"
                defaultValue={company?.country ?? ''}
                id="company-country"
                maxLength={100}
                name="country"
                placeholder="United States"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-logo">Company logo</Label>
            <Input
              accept="image/jpeg,image/png,image/webp"
              id="company-logo"
              name="logo"
              required={!company}
              type="file"
            />
            <p className="text-xs text-muted-foreground">
              {company
                ? 'Choose a new image to replace the current logo, or leave blank to keep it.'
                : 'Select an image file for the company logo.'}
            </p>
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
                ? company
                  ? 'Saving changes…'
                  : 'Adding company…'
                : company
                  ? 'Save changes'
                  : 'Add company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}