import { Component, computed, inject } from '@angular/core';

import { AppStore } from '@store';

import { BrandComponent } from '@components';

@Component({
    selector: 'als-faq',
    template: `
        <div class="mx-auto mt-10 h-full w-4/5">
            <div class="join join-vertical bg-base-100">
                <div class="collapse-arrow join-item border-base-300 collapse border">
                    <input
                        type="radio"
                        name="faq"
                    />
                    <div class="collapse-title font-semibold">What is <als-brand />?</div>
                    <div class="collapse-content text-sm">
                        <als-brand /> is a site which gather livestreams from airport on YouTube, match them to an airport and shows them on a map (or list).
                        <br />
                        Me, the creator of <als-brand />, am a planespotter and I love to watch streams from airports. I created this site to make it easier to
                        find streams from airports.
                        <br />
                        If you need any help or have any questions, please contact us via
                        <button
                            class="btn btn-soft"
                            (click)="showContact()"
                        >
                            Contact
                        </button>
                    </div>
                </div>
                <div class="collapse-arrow join-item border-base-300 collapse border">
                    <input
                        type="radio"
                        name="faq"
                    />
                    <div class="collapse-title font-semibold">A livestream is not listed, Why?</div>
                    <div class="collapse-content text-sm">
                        We gather the information from youtube via the
                        <a
                            href="https://developers.google.com/youtube/v3/docs/search"
                            target="_blank"
                        >
                            Youtube Search API </a
                        >. If your stream is not listed, we were not able to find it with the current keywords: <code>airport live</code>,
                        <code>airports live</code>, <code>airportlive</code>, <code>airportslive</code>, <code>flughafen</code>, <code>aeropuerto</code>,
                        <code>공항</code>, <code>机场</code>, <code>空港</code>, <code>planespotter</code>, <code>planespotting</code> or
                        <code>avgeeks</code> or there is no hint to the airport you livestream from (the ICAO code, the IATA code or the official name of the
                        airport). Place at least one of the keywords in your title or as a hashtag in your description, the airport you are livestreaming from
                        as ICAO, IATA or official name and the Youtube Search API should find your livestream. The same API is used by YouTube itself for the
                        search on youtube.com. So this might help you to be more discoverable<br />
                        Currently we support <strong>{{ airportCount() }}</strong> large and medium airports.<br />
                        <br />
                        If you need any help or have any questions, please contact us via
                        <button
                            class="btn btn-soft"
                            (click)="showContact()"
                        >
                            Contact
                        </button>
                    </div>
                </div>
                <div class="collapse-arrow join-item border-base-300 collapse border">
                    <input
                        type="radio"
                        name="faq"
                    />
                    <div class="collapse-title font-semibold">I (know a) stream from a small airport can I/it be listed and shown on the map too?</div>
                    <div class="collapse-content text-sm">
                        Currently we support <strong>{{ airportCount() }}</strong> large and medium airports. We have also a lot of small airports in our
                        database, but to enable the small airports initially would make the map confusing. But if you stream regularly from a small airport and
                        want to be listed, please contact us via
                        <button
                            class="btn btn-soft"
                            (click)="showContact()"
                        >
                            Contact
                        </button>
                        and we enable the small airport manually for you.
                    </div>
                </div>
            </div>
            <p class="p-4">
                You have any other questions or ideas? Please contact us via
                <button
                    class="btn btn-soft"
                    (click)="showContact()"
                >
                    Contact
                </button>
            </p>
        </div>
    `,
    imports: [BrandComponent],
})
export class FAQPageComponent {
    readonly #appStore = inject(AppStore);

    public readonly airportCount = computed(() => this.#appStore.airports().length);

    public showContact() {
        this.#appStore.showContact();
    }
}
