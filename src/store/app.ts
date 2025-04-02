import { computed, inject } from '@angular/core';

import { pipe, switchMap, tap } from 'rxjs';

import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

import { Airport, AirportsBaseDataService, Livestream, LivestreamsDataService } from '@api/data';

export interface IAppState {
    airports: Airport[];
    livestreams: Livestream[];
    airportTypes: string[];
}

const initialState: IAppState = {
    airports: [],
    livestreams: [],
    airportTypes: [],
};

const AirportTypeTranslations = {
    large_airport: 'large',
    medium_airport: 'medium',
    small_airport: 'small',
    closed: 'closed',
    // heliport: 'heliport',
    seaplane_base: 'seaplane',
    // balloonport: 'balloon',
};

export const AppStore = signalStore(
    { providedIn: 'root' }, //

    withState(initialState),

    withComputed(({ livestreams, airports }) => ({
        livestreamsCount: computed(() => livestreams().length),
        airportsCount: computed(() => airports().length),
    })),

    withMethods(
        (
            state, //
            airportsBaseDataService = inject(AirportsBaseDataService),
            livestreamsDataService = inject(LivestreamsDataService),
        ) => {
            return {
                loadAirports: rxMethod<string[]>(
                    pipe(
                        tap((airportTypes) => patchState(state, { airportTypes })), //
                        switchMap((airportTypes) => airportsBaseDataService.getAirports(airportTypes)), //
                        tapResponse({
                            next: async (airports) => {
                                patchState(state, { airports });
                            },
                            error: (err) => {
                                console.error(err);
                                patchState(state, { airports: [] });
                            },
                        }),
                    ),
                ),

                loadLivestreams: rxMethod<void>(
                    pipe(
                        pipe(
                            switchMap(() => livestreamsDataService.getLivestreams()), //
                            tapResponse({
                                next: async (livestreams) => {
                                    patchState(state, { livestreams });
                                },
                                error: (err) => {
                                    console.error(err);
                                    patchState(state, { livestreams: [] });
                                },
                            }),
                        ),
                    ),
                ),
            };
        },
    ),
);
