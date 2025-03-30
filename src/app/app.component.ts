import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TopbarComponent } from '../components/topbar';

@Component({
    selector: 'als-root',
    imports: [TopbarComponent, RouterOutlet],
    template: `
        <div class="drawer">
            <input
                id="als-topbar-drawer"
                type="checkbox"
                class="drawer-toggle"
            />
            <div class="drawer-content flex flex-col">
                <als-topbar />

                <div class="h-screen">
                    <router-outlet />
                </div>
            </div>
            <div class="drawer-side">
                <label
                    for="als-topbar-drawer"
                    aria-label="close sidebar"
                    class="drawer-overlay"
                ></label>
                <ul class="menu bg-base-200 min-h-full w-80 p-4">
                    <!-- Sidebar content here -->
                    <li><a>Sidebar Item 1</a></li>
                    <li><a>Sidebar Item 2</a></li>
                </ul>
            </div>
        </div>
    `,
})
export class AppComponent {}
