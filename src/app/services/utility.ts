import { ViewRef, ChangeDetectorRef } from "@angular/core";

export function detectViewChanges(cdr: ChangeDetectorRef) {
  if ((cdr as ViewRef).destroyed) {
    return;
  }
  cdr.detectChanges();
}
