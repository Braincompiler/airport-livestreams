import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { filter } from 'rxjs';

import { AppStore } from '@store';

import { TopbarComponent } from '@components';
import { MenuLinksComponent } from '@components/menu-links';

export interface IRouteState {
    route: string;
    text: string;
}

const ROUTE_STATE_MAP = { route: '/map', text: 'Livestreams map' };
const ROUTE_STATE_LIST = { route: '/list', text: 'Livestreams list' };
const ROUTE_STATE_ALTERNATES: Record<string, IRouteState> = {
    '/list': ROUTE_STATE_MAP,
    '/map': ROUTE_STATE_LIST,
};

@Component({
    selector: 'als-root',
    imports: [TopbarComponent, RouterOutlet, MenuLinksComponent],
    template: `
        @let routeState = nextRoutingState();
        <div class="drawer">
            <input
                id="als-topbar-drawer"
                type="checkbox"
                class="drawer-toggle"
            />
            <div class="drawer-content flex flex-col">
                <als-topbar [routeState]="routeState" />

                <div class="h-screen">
                    <router-outlet />
                    <!--                    <router-outlet name="dialog" />-->
                </div>
            </div>
            <div class="drawer-side">
                <label
                    for="als-topbar-drawer"
                    aria-label="close sidebar"
                    class="drawer-overlay"
                ></label>
                <div class="bg-base-200 min-h-full w-80">
                    <als-menu-links
                        ulCssClasses="menu p-4 w-full"
                        [routeState]="routeState"
                    />
                </div>
            </div>
        </div>
    `,
})
export class AppComponent {
    readonly #destroyRef = inject(DestroyRef);
    readonly #router = inject(Router);
    readonly #appStore = inject(AppStore);

    public readonly nextRoutingState = signal(ROUTE_STATE_MAP);

    public constructor() {
        this.#appStore.loadAirports(['large_airport', 'medium_airport']);
        this.#appStore.loadLivestreams();

        this.#router.events
            .pipe(
                takeUntilDestroyed(this.#destroyRef),
                filter((e) => e instanceof NavigationEnd),
            )
            .subscribe((e) => this.nextRoutingState.set(ROUTE_STATE_ALTERNATES[e.urlAfterRedirects] ?? ROUTE_STATE_MAP));
    }
}
