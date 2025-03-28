import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TopbarComponent } from '../components/topbar.component';

@Component({
    selector: 'als-root',
    imports: [TopbarComponent, RouterOutlet],
    template: `
        <div class="h-screen">
            <als-topbar />
            <router-outlet />
        </div>
    `,
})
export class AppComponent {}
