import { Component, computed, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Livestream } from '@api/data';

import { LivestreamPlayerComponent } from './livestream-player';

@Component({
    selector: 'als-livestream-card',
    styles: [
        `
            youtube-player >>> iframe {
                aspect-ratio: 16 / 9;
                height: auto;
                width: 100%;
            }
        `,
    ],
    template: `
        @if (numLivestreams() > 1) {
            <div class="join join-vertical bg-base-100 w-full">
                @for (livestream of livestreams(); track livestream.videoId; let first = $first) {
                    <div class="collapse-arrow join-item border-base-content collapse border">
                        <input
                            type="radio"
                            name="livestreams"
                            [checked]="livestream.videoId === selectedLivestream()"
                            (change)="onLivestreamVideoChanged($event)"
                            [value]="livestream.videoId"
                        />
                        <div
                            class="collapse-title font-semibold"
                            [innerHTML]="livestream.title"
                        ></div>
                        <div class="collapse-content text-sm">
                            <als-livestream-player
                                [livestream]="livestream"
                                [autoplay]="livestream.videoId === selectedLivestream()"
                                hideCardTitle
                            />
                        </div>
                    </div>
                }
            </div>
        } @else {
            <als-livestream-player [livestream]="firstLivestream()" />
        }
    `,
    imports: [LivestreamPlayerComponent, FormsModule],
})
export class LivestreamCardComponent implements OnInit {
    public readonly livestreams = input.required<Livestream[]>();
    public readonly numLivestreams = computed(() => this.livestreams()?.length);

    public readonly firstLivestream = computed(() => this.livestreams()[0]);
    public readonly selectedLivestream = signal<string | null>(null);

    public ngOnInit(): void {
        this.selectedLivestream.set(this.firstLivestream().videoId!);
    }

    public onLivestreamVideoChanged($event: Event) {
        this.selectedLivestream.set(($event.target as HTMLInputElement).value);
    }
}
