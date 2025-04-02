import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IRouteState } from '../app/app.component';

@Component({
    selector: 'als-menu-links',
    template: `
        @let rs = routeState();
        <ul [class]="ulCssClasses()">
            <li>
                <a [routerLink]="rs.route">{{ rs.text }}</a>
            </li>
            <li routerLink="/faq"><a>FAQ</a></li>
        </ul>
    `,
    imports: [RouterLink],
})
export class MenuLinksComponent {
    public readonly ulCssClasses = input.required<string>();
    public readonly routeState = input.required<IRouteState>();
}
