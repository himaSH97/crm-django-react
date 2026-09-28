import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Company } from '@/features/companies/api'

type CompanyDeleteDialogProps = {
  company: Company | null
  busy: boolean
  error: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function CompanyDeleteDialog({
  company,
  busy,
  error,
  onOpenChange,
  onConfirm,
}: CompanyDeleteDialogProps) {
  return (
    <Dialog
      open={company !== null}
      onOpenChange={(open) => {
        if (!busy) onOpenChange(open)
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>Delete company?</DialogTitle>
          <DialogDescription>
            {company
              ? `${company.name} will be removed from your active company list.`
              : 'This company will be removed from your active company list.'}
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
          <Button disabled={busy || !company} onClick={onConfirm} variant="destructive">
            {busy ? 'Deleting…' : 'Delete company'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}