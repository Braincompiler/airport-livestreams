import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

const PLACEMENT_CSS_CLASS_MAPPING = {
    top: 'tooltip-top',
    bottom: 'tooltip-bottom',
    left: 'tooltip-left',
    right: 'tooltip-right',
};

@Component({
    selector: 'als-tooltip',
    template: `
        <div
            class="tooltip"
            [ngClass]="PLACEMENT_CSS_CLASS_MAPPING[placement()]"
            [attr.data-tip]="text()"
        >
            <ng-content />
        </div>
    `,
    imports: [NgClass],
})
export class TooltipComponent {
    public readonly PLACEMENT_CSS_CLASS_MAPPING = PLACEMENT_CSS_CLASS_MAPPING;

    public readonly text = input.required<string>();
    public readonly placement = input<'top' | 'bottom' | 'left' | 'right'>('top');
}
