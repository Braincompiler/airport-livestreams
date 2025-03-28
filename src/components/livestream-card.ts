import { Component, computed, input } from '@angular/core';
import { YouTubePlayer } from '@angular/youtube-player';

import { Livestream } from '@api/data';

@Component({
    selector: 'als-livestream-card',
    template: `
        @let ls = livestream();
        <div class="card bg-base-100 shadow-sm">
            <figure class="flex-col">
                <youtube-player [videoId]="livestreamVideoId()" />
                <figcaption class="mt-2 px-10">{{ ls?.title }}</figcaption>
            </figure>
            <div class="card-body">
                <h2 class="card-title">
                    <div class="badge badge-primary">{{ ls?.icao }} / {{ ls?.iata }}</div>
                </h2>
                <!--                <div class="card-actions justify-end">-->
                <!--                    <div class="badge badge-outline">Fashion</div>-->
                <!--                    <div class="badge badge-outline">Products</div>-->
                <!--                </div>-->
            </div>
        </div>
    `,
    imports: [YouTubePlayer],
})
export class LivestreamCardComponent {
    public readonly livestream = input<Livestream>();
    public readonly livestreamVideoId = computed(() => this.livestream()?.youtubeURL?.split('=')[1]);
}
