import { booleanAttribute, Component, input } from '@angular/core';
import { YouTubePlayer } from '@angular/youtube-player';

import { Livestream } from '@api/data';

@Component({
    selector: 'als-livestream-player',
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
        @let ls = livestream();
        <div class="card bg-base-100 shadow-sm">
            <figure class="flex-col">
                <youtube-player
                    disablePlaceholder
                    class="w-full"
                    suggestedQuality="highres"
                    [videoId]="ls.videoId"
                    [playerVars]="{
                        autoplay: autoplay() ? 1 : 0,
                    }"
                />
            </figure>
            <div class="card-body">
                @if (!hideCardTitle()) {
                    <h2 class="card-title">{{ ls?.title }}</h2>
                }
                <p>{{ ls?.description }}</p>
            </div>
        </div>
    `,
    imports: [YouTubePlayer],
})
export class LivestreamPlayerComponent {
    public readonly livestream = input.required<Livestream>();
    public readonly autoplay = input<boolean>(true);
    public readonly hideCardTitle = input(false, { transform: booleanAttribute });
}
