import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'als-brand',
    template: `<span class="text-primary">A</span>irports<span class="text-secondary">L</span>ive.net`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandComponent {}
