// Theme tokens shared with the rest of the storefront (index.css) — keeps the auth pages in the
// same brand-primary/brand-accent palette instead of a separately hand-picked hex set.
export const authStyles = {
  button:
    'h-11 w-full rounded-full bg-primary text-[0.9375rem] font-semibold text-primary-foreground shadow-[0_14px_30px_-8px_var(--brand-primary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 disabled:hover:translate-y-0',
  dangerText:
    'flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive',
  input:
    'h-11 rounded-xl border-border bg-background px-4 text-[0.9375rem] text-foreground shadow-none transition-all duration-200 placeholder:text-muted-foreground hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20',
  label: 'grid gap-2.5 text-[0.875rem] font-semibold text-foreground',
  link: 'font-semibold text-primary underline-offset-4 transition-colors hover:underline',
  mutedLink: 'ml-auto w-fit text-sm font-semibold text-primary underline-offset-4 transition-colors hover:underline',
  secondaryText: 'text-center text-sm text-muted-foreground',
  successText:
    'flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl border border-brand-success/20 bg-brand-success-soft px-4 py-2.5 text-sm text-brand-success',
}
