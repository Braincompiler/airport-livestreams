import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { debounceTime } from 'rxjs';

import { AppStore } from '@store';

import { Livestream } from '@api/data';

export interface ILivestreamWithAirportName extends Livestream {
    airportName?: string;
}

@Component({
    selector: 'als-list',
    template: `
        <div class="h-full w-auto p-5">
            <div class="flex justify-center">
                <label class="input w-1/2">
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
                        [formControl]="searchInputControl"
                    />
                </label>
            </div>

            <div class="overflow-x-auto">
                <table class="table-zebra table">
                    <!-- head -->
                    <thead>
                        <tr>
                            <th>ICAO / IATA</th>
                            <th>Airport name</th>
                            <th>Stream title</th>
                            <th>Channel name</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (livestream of filteredLivestreams(); track livestream.videoId) {
                            <tr
                                class="row-hover cursor-pointer"
                                (click)="openLivestream(livestream)"
                            >
                                <th>
                                    {{ livestream.icao }}
                                    @if (livestream.iata) {
                                        / {{ livestream.iata }}
                                    }
                                </th>
                                <td>{{ livestream.airportName }}</td>
                                <td>{{ livestream.title }}</td>
                                <td>{{ livestream.channelTitle }}</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `,
    imports: [ReactiveFormsModule],
})
export class ListPageComponent {
    readonly #appStore = inject(AppStore);
    readonly #router = inject(Router);
    readonly #destroyRef = inject(DestroyRef);

    public readonly searchInputControl = new FormControl<string>('', { nonNullable: true });

    public readonly livestreams = this.#appStore.livestreams;
    public readonly airports = this.#appStore.airports;

    public readonly filteredLivestreams = signal<ILivestreamWithAirportName[]>([]);
    public readonly livestreamWithAirportNames = computed<ILivestreamWithAirportName[]>(() => {
        const airports = this.airports();

        return this.livestreams()
            .map((livestream) => {
                const airport = airports.find((airport) => airport.icao === livestream.icao);
                return {
                    ...livestream,
                    airportName: airport ? airport.name : 'n/a',
                };
            })
            .sort((a, b) => a.airportName!.localeCompare(b.airportName!));
    });

    public constructor() {
        effect(() => this.filteredLivestreams.set(this.livestreamWithAirportNames()));

        this.searchInputControl.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef), debounceTime(100)).subscribe((search) => {
            if (search === '') {
                this.filteredLivestreams.set(this.livestreamWithAirportNames());
            }

            this.filteredLivestreams.update((livestreams) => livestreams.filter((ls) => this.#matchLivestreamWithSearchValue(ls, search)));
        });
    }

    public async openLivestream(livestream: Livestream) {
        await this.#router.navigate(['map'], { queryParams: { videoId: [livestream.videoId] } });
    }

    #matchLivestreamWithSearchValue(ls: ILivestreamWithAirportName, searchValue: string) {
        const searchValueLC = searchValue.toLowerCase();

        return (
            ls.airportName?.toLowerCase().includes(searchValueLC) ||
            ls.icao?.toLowerCase().includes(searchValueLC) ||
            ls.iata?.toLowerCase().includes(searchValueLC) ||
            ls.title?.toLowerCase().includes(searchValueLC) ||
            ls.channelTitle?.toLowerCase().includes(searchValueLC)
        );
    }
}
