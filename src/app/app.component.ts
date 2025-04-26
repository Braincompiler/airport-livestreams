import { Component, DestroyRef, effect, ElementRef, inject, Renderer2, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { filter, map } from 'rxjs';

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
    imports: [TopbarComponent, RouterOutlet, MenuLinksComponent, ReactiveFormsModule],
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

        @if (isContactVisible()) {
            <dialog
                class="modal"
                #contactModal
            >
                <div class="modal-box max-w-full">
                    <fieldset
                        class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4"
                        [formGroup]="form"
                    >
                        <legend class="fieldset-legend">Contact</legend>

                        <label class="fieldset-label">Email</label>
                        <input
                            type="email"
                            class="input"
                            placeholder="Optional email address, but needed for reply"
                            formControlName="email"
                        />

                        <label class="fieldset-label">Message</label>
                        <textarea
                            class="textarea w-full"
                            placeholder="Write your message here ..."
                            formControlName="message"
                        ></textarea>
                    </fieldset>
                    <div class="modal-action">
                        <form method="dialog">
                            <button
                                class="btn btn-primary"
                                (click)="sendMessage()"
                            >
                                Send
                            </button>
                            <button class="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>
        }
    `,
})
export class AppComponent {
    readonly #destroyRef = inject(DestroyRef);
    readonly #router = inject(Router);
    readonly #appStore = inject(AppStore);
    readonly #renderer = inject(Renderer2);
    readonly #fb = inject(FormBuilder);

    public readonly contactModal = viewChild<ElementRef<HTMLDialogElement>>('contactModal');

    public readonly nextRoutingState = signal(ROUTE_STATE_MAP);
    public readonly isContactVisible = this.#appStore.isContactVisible;

    public readonly form = this.#fb.group({
        email: this.#fb.control('', [Validators.email]),
        message: this.#fb.control('', [Validators.required]),
    });

    public constructor() {
        this.#appStore.loadAirports(['large_airport', 'medium_airport']);
        this.#appStore.loadLivestreams();

        effect(() => {
            if (this.isContactVisible()) {
                const el = this.contactModal()?.nativeElement;
                if (el) {
                    el.showModal();
                    this.#renderer.listen(el, 'close', () => this.#appStore.hideContact());
                }
            }
        });

        this.#router.events
            .pipe(
                takeUntilDestroyed(this.#destroyRef),
                filter((e) => e instanceof NavigationEnd),
                map((e) => e.urlAfterRedirects.split('?')[0]),
                // tap((d) => console.log(d)),
            )
            .subscribe((url) => this.nextRoutingState.set(ROUTE_STATE_ALTERNATES[url] ?? ROUTE_STATE_MAP));
    }

    public sendMessage() {
        console.log(this.form.value, this.form.valid);
    }
}
