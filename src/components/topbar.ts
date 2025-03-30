import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';

import { filter } from 'rxjs';

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
    selector: 'als-topbar',
    template: `
        <div class="navbar bg-base-100 shadow-sm">
            <div class="navbar-start">
                <div class="flex-none lg:hidden">
                    <label
                        for="als-topbar-drawer"
                        aria-label="open sidebar"
                        class="btn btn-square btn-ghost"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            class="inline-block h-6 w-6 stroke-current"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            ></path>
                        </svg>
                    </label>
                </div>

                <div class="hidden flex-none lg:block">
                    <ul class="menu menu-horizontal">
                        @let routeState = nextRoutingState();
                        <li>
                            <a [routerLink]="routeState.route">{{ routeState.text }}</a>
                        </li>
                        <li routerLink="/report-missing-livestream"><a>Report missing livestream</a></li>
                    </ul>
                </div>
            </div>
            <div class="navbar-center">
                <a
                    class="btn btn-ghost gap-0 text-xl"
                    href="/"
                >
                    <span class="text-primary">A</span>irports<span class="text-secondary">L</span>ive.net
                </a>
            </div>
            <div class="navbar-end">
                <!--                TODO: notify about new livestreams-->
                <!--                <button class="btn btn-ghost btn-circle mr-3">-->
                <!--                    <div class="indicator">-->
                <!--                        <svg-->
                <!--                            xmlns="http://www.w3.org/2000/svg"-->
                <!--                            class="h-5 w-5"-->
                <!--                            fill="none"-->
                <!--                            viewBox="0 0 24 24"-->
                <!--                            stroke="currentColor"-->
                <!--                        >-->
                <!--                            <path-->
                <!--                                stroke-linecap="round"-->
                <!--                                stroke-linejoin="round"-->
                <!--                                stroke-width="2"-->
                <!--                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"-->
                <!--                            />-->
                <!--                        </svg>-->
                <!--                        <span class="badge badge-xs badge-primary indicator-item"></span>-->
                <!--                    </div>-->
                <!--                </button>-->
                <label class="input">
                    <svg
                        class="h-[1em] opacity-50"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                    >
                        <g
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            stroke-width="2.5"
                            fill="none"
                            stroke="currentColor"
                        >
                            <circle
                                cx="11"
                                cy="11"
                                r="8"
                            ></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </g>
                    </svg>
                    <input
                        type="search"
                        class="grow"
                        placeholder="Search"
                    />
                    <kbd class="kbd kbd-sm">⌘</kbd>
                    <kbd class="kbd kbd-sm">K</kbd>
                </label>
            </div>
        </div>
    `,
    imports: [RouterLink],
})
export class TopbarComponent {
    readonly #destroyRef = inject(DestroyRef);
    readonly #router = inject(Router);

    public readonly nextRoutingState = signal(ROUTE_STATE_MAP);

    public constructor() {
        this.#router.events
            .pipe(
                takeUntilDestroyed(this.#destroyRef),
                filter((e) => e instanceof NavigationEnd),
            )
            .subscribe((e) => this.nextRoutingState.set(ROUTE_STATE_ALTERNATES[e.urlAfterRedirects] ?? ROUTE_STATE_MAP));
    }
}
