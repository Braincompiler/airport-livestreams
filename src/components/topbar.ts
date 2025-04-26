import { KeyValuePipe } from '@angular/common';
import { Component, computed, DestroyRef, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { debounceTime, map, tap } from 'rxjs';

import { AppStore, IS_MAC, ShortcutsStore } from '@store';
import { isEmpty } from '@utils';
import { groupBy, isNil } from 'ramda';

import { Livestream } from '@api/data';
import { BrandComponent } from '@components/brand';
import { MenuLinksComponent } from '@components/menu-links';

import { IRouteState } from '../app/app.component';
import { TooltipComponent } from './tooltip';

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
                    <als-menu-links
                        ulCssClasses="menu menu-horizontal"
                        [routeState]="routeState()"
                    />
                </div>
            </div>
            <div class="navbar-center">
                <a
                    class="btn btn-ghost gap-0 text-xl"
                    href="/"
                >
                    <als-brand />
                </a>
            </div>
            <div class="navbar-end">
                <span class="mr-3 text-xs">
                    <als-tooltip
                        [text]="livestreamStatsTitle()"
                        placement="bottom"
                    >
                        {{ livestreamStats() }}
                    </als-tooltip>
                </span>
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
                <div class="dropdown dropdown-center">
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
                            #search
                            type="search"
                            class="grow"
                            placeholder="Search"
                            [formControl]="searchFormControl"
                            (focusin)="onSearchFocusIn()"
                            (focusout)="onSearchFocusOut()"
                        />
                        <kbd class="kbd kbd-sm">
                            @if (isMac) {
                                ⌘
                            } @else {
                                Ctrl
                            }
                        </kbd>
                        <kbd class="kbd kbd-sm">K</kbd>
                    </label>
                    @if (isSearchOpen()) {
                        <ul class="dropdown-content menu bg-base-300 rounded-box z-1 w-full p-3 shadow-sm">
                            @for (resultKV of searchResultGroupedByIcao() | keyvalue; track resultKV.key) {
                                <li>{{ resultKV.key }}</li>
                                @for (livestream of resultKV.value; track livestream.videoId) {
                                    <!-- @TODO: on click zoom to airport, open modal and show the stream  -->
                                    <li
                                        class="hover:bg-base-100 mb-1 cursor-pointer pl-3 text-xs"
                                        (mousedown)="onSelectSearchResult(livestream)"
                                    >
                                        &middot; {{ livestream.title }}
                                    </li>
                                }
                            }
                        </ul>
                    }
                </div>
            </div>
        </div>
    `,
    imports: [ReactiveFormsModule, TooltipComponent, KeyValuePipe, MenuLinksComponent, BrandComponent],
})
export class TopbarComponent {
    public readonly routeState = input.required<IRouteState>();

    readonly #destroyRef = inject(DestroyRef);
    readonly #shortcutsStore = inject(ShortcutsStore);
    readonly #appStore = inject(AppStore);
    readonly #router = inject(Router);

    public readonly isSearchOpen = this.#shortcutsStore.isSearchOpen;
    public readonly searchFormControl = new FormControl<string>('', { nonNullable: true });

    public readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('search');

    public readonly livestreamStats = computed(() => `${this.#appStore.livestreamsCount()} / ${this.#appStore.airportsCount()}`);
    public readonly livestreamStatsTitle = computed(
        () =>
            `Currently we have ${this.#appStore.airportsCount()} large and medium airports in our database and found ${this.#appStore.livestreamsCount()} livestreams.`,
    );

    public readonly searchResult = toSignal(
        this.searchFormControl.valueChanges.pipe(
            takeUntilDestroyed(this.#destroyRef), //
            tap(() => {
                if (!this.isSearchOpen()) {
                    this.#shortcutsStore.openSearch();
                }
            }),
            debounceTime(100),
            map((searchValue) => (isEmpty(searchValue) ? [] : this.#appStore.livestreams().filter((ls) => this.#matchLivestream(ls, searchValue)))),
        ),
        { initialValue: [] },
    );

    public readonly searchResultGroupedByIcao = computed(() => {
        console.log('1');
        return groupBy((ls) => ls.icao!, this.searchResult());
    });

    public get isMac(): boolean {
        return IS_MAC;
    }

    public constructor() {
        effect(() => {
            const inputElement = this.searchInput()?.nativeElement;
            if (!isNil(inputElement)) {
                this.#shortcutsStore.setFocusInputElement(inputElement);
            }
        });
    }

    public onSearchFocusIn() {
        this.#shortcutsStore.openSearch();
    }

    public onSearchFocusOut() {
        console.log('out');
        this.#shortcutsStore.closeSearch();
        this.searchFormControl.setValue('');
    }

    #matchLivestream(livestream: Livestream, searchValue: string): boolean {
        const s = searchValue.toLowerCase();

        return (
            (livestream.icao ?? '').toLowerCase().includes(s) || //
            (livestream.iata ?? '').toLowerCase().includes(s) ||
            (livestream.title ?? '').toLowerCase().includes(s) ||
            (livestream.description ?? '').toLowerCase().includes(s) ||
            (livestream.channelTitle ?? '').toLowerCase().includes(s)
        );
    }

    public async onSelectSearchResult(livestream: Livestream) {
        await this.#router.navigate(['map'], { queryParams: { videoId: [livestream.videoId] } });
    }
}
