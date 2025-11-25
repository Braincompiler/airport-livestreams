import { booleanAttribute, Component, computed, input } from '@angular/core';
import { YouTubePlayer } from '@angular/youtube-player';

import { Livestream } from '@api/data';

@Component({
    selector: 'als-livestream-player',
    styles: [
        `
            :host youtube-player ::ng-deep iframe {
                /*aspect-ratio: 16 / 9;*/
                /*height: auto;*/
                /*width: 100%;*/
                margin: 0 auto;
                display: block;
                width: 100%;
                height: 70vh;
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
                    <h2 class="card-title flex justify-between">
                        <span [innerHTML]="ls.title"></span>
                        <!--  cursor-pointer -->
                        <span class="badge">
                            <a
                                [href]="channelLink()"
                                target="_blank"
                            >
                                {{ ls.channelTitle }}
                            </a>
                        </span>
                    </h2>
                }
                <p class="flex justify-between">
                    <span [innerHTML]="ls?.description"></span>
                    @if (hideCardTitle()) {
                        <!--  cursor-pointer -->
                        <span class="badge">
                            <a
                                [href]="channelLink()"
                                target="_blank"
                            >
                                {{ ls.channelTitle }}
                            </a>
                        </span>
                    }
                </p>
            </div>
        </div>
    `,
    imports: [YouTubePlayer],
})
export class LivestreamPlayerComponent {
    public readonly livestream = input.required<Livestream>();
    public readonly autoplay = input<boolean>(true);
    public readonly hideCardTitle = input(false, { transform: booleanAttribute });

    public readonly channelLink = computed(() => `https://www.youtube.com/channel/${this.livestream().channelId}`);
}
