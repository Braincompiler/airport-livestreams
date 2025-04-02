import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AppStore } from '@store';

import { Livestream } from '@api/data';

@Component({
    selector: 'als-list',
    template: `
        <div class="h-full w-auto p-5">
            <!-- @TODO: Add search -->
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
                        @for (livestream of livestreamWithAirportNames(); track livestream.videoId) {
                            <tr
                                class="row-hover cursor-pointer"
                                (click)="openLivestream(livestream)"
                            >
                                <th>{{ livestream.icao }} / {{ livestream.iata }}</th>
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
    imports: [],
})
export class ListPageComponent {
    readonly #appStore = inject(AppStore);
    readonly #router = inject(Router);

    public readonly livestreams = this.#appStore.livestreams;
    public readonly airports = this.#appStore.airports;
    public readonly livestreamWithAirportNames = computed(() => {
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

    public async openLivestream(livestream: Livestream) {
        await this.#router.navigate(['map'], { queryParams: { videoId: [livestream.videoId] } });
    }
}
