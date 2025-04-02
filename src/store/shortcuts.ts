import { fromEvent, pipe, switchMap } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

export const IS_MAC = navigator.platform.startsWith('Mac');

export const ShortcutsStore = signalStore(
    { providedIn: 'root' },

    withState({
        isSearchOpen: false,
    }),

    withMethods((state) => {
        const openSearch = () => patchState(state, { isSearchOpen: true });
        const closeSearch = () => patchState(state, { isSearchOpen: false });

        let focusInputElement: HTMLInputElement | undefined;

        return {
            closeSearch,
            openSearch,

            setFocusInputElement: (inputElement: HTMLInputElement) => (focusInputElement = inputElement),

            registerShortcuts: rxMethod<void>(
                pipe(
                    switchMap(() => fromEvent<KeyboardEvent>(document, 'keydown')),
                    filter((event) => {
                        // Filter for Cmd+K on Mac or Ctrl+K on other platforms
                        const modifierKey = IS_MAC ? event.metaKey : event.ctrlKey;

                        return modifierKey && event.key === 'k';
                    }),
                    tap((event) => event.preventDefault()), // prevent default browser behavior (prevent it here to not prevent all other browser shortcuts)
                    tap(() => focusInputElement?.focus({ preventScroll: true })),
                    // tap(() => openSearch()),
                ),
            ),
        };
    }),

    withHooks({
        onInit: ({ registerShortcuts }) => registerShortcuts(),
    }),
);
