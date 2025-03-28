import { Component } from '@angular/core';

@Component({
    selector: 'als-topbar',
    template: `
        <div class="navbar bg-base-100 shadow-sm">
            <div class="flex-1">
                <a class="btn btn-ghost text-xl">Airports Live</a>
            </div>
            <div class="flex gap-4">
                <input
                    type="text"
                    placeholder="Search"
                    class="input input-bordered w-24 md:w-auto"
                />
            </div>
        </div>
    `,
})
export class TopbarComponent {}
