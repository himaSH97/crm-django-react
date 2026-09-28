import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Contact } from '@/features/contacts/api'

type ContactDeleteDialogProps = {
  open: boolean
  contact: Contact | null
  busy: boolean
  error: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ContactDeleteDialog({
  open,
  contact,
  busy,
  error,
  onOpenChange,
  onConfirm,
}: ContactDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!busy) onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>Delete contact?</DialogTitle>
          <DialogDescription>
            {contact
              ? `${contact.full_name} will be removed from this company.`
              : 'This contact will be removed from this company.'}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p aria-live="polite" className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button
            disabled={busy}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={busy || !contact} onClick={onConfirm} variant="destructive">
            {busy ? 'Deleting…' : 'Delete contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}