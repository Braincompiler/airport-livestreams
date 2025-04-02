import { afterNextRender, Component, computed, ElementRef, inject, Injector, OnInit, output, Renderer2, runInInjectionContext, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { map, tap } from 'rxjs';

import { AppStore } from '@store';
import { isNil } from 'ramda';

import { LivestreamCardComponent } from '@components';

@Component({
    selector: 'als-livestream-dialog',
    template: `
        <dialog
            class="modal"
            #livestreamModal
        >
            <div class="modal-box max-w-full">
                <als-livestream-card [livestreams]="livestreams()" />
                <div class="modal-action">
                    <form method="dialog">
                        <button class="btn">Close</button>
                    </form>
                </div>
            </div>
        </dialog>
    `,
    imports: [LivestreamCardComponent],
})
export class LivestreamDialogComponent implements OnInit {
    readonly #injector = inject(Injector);
    readonly #renderer = inject(Renderer2);
    readonly #route = inject(ActivatedRoute);
    readonly #appStore = inject(AppStore);

    readonly routeVideoIds = toSignal(
        this.#route.params.pipe(
            map((params) => String(params['videoId'])),
            map((videoIds) => videoIds.split(/,/g)),
            tap((d) => console.log(d)),
            tap(() => {
                runInInjectionContext(this.#injector, () =>
                    afterNextRender(() => {
                        const el = this.livestreamModal()?.nativeElement;
                        if (!isNil(el)) {
                            el.showModal();
                            this.#renderer.listen(el, 'close', () => {
                                // console.log('close');
                                this.close.emit();
                            });
                        }
                    }),
                );
            }),
        ),
        { initialValue: [] },
    );

    // public readonly livestreams = input.required<Livestream[]>();
    public readonly livestreams = computed(() => this.#appStore.livestreams().filter((ls) => this.routeVideoIds().includes(ls.videoId!)));

    public readonly livestreamModal = viewChild<ElementRef<HTMLDialogElement>>('livestreamModal');

    public readonly close = output<void>();

    public ngOnInit(): void {
        // runInInjectionContext(this.#injector, () =>
        //     afterNextRender(() => {
        //         const el = this.livestreamModal()?.nativeElement;
        //         if (!isNil(el)) {
        //             el.showModal();
        //             this.#renderer.listen(el, 'close', () => {
        //                 // console.log('close');
        //                 this.close.emit();
        //             });
        //         }
        //     }),
        // );
    }
}
