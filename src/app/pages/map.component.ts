import {
    afterNextRender,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    Injector,
    NgZone,
    Renderer2,
    runInInjectionContext,
    signal,
    viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { BehaviorSubject, throttleTime } from 'rxjs';

import { Feature, Map as OlMap, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import { boundingExtent } from 'ol/extent';
import { Point } from 'ol/geom';
import { defaults as defaultInteractions } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import { Cluster, OSM } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { isNil } from 'ramda';

import { AirportsBaseDataService, Livestream, LivestreamsDataService } from '@api/data';

import { LivestreamCardComponent } from '../../components/livestream-card';

const MAX_MAP_ZOOM = 14;

@Component({
    selector: 'als-map',
    imports: [LivestreamCardComponent],
    styles: [
        `
            .map {
                height: 100%;
                width: 100%;
            }
        `,
    ],
    template: `
        <div class="h-full w-auto">
            <div
                #map
                class="map"
            ></div>
        </div>

        @if (selectedLivestream()) {
            <dialog
                class="modal"
                #livestreamModal
            >
                <div class="modal-box max-w-3/5">
                    <als-livestream-card [livestream]="selectedLivestream()!" />
                    <div class="modal-action">
                        <form method="dialog">
                            <button class="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>
        }
    `,
})
export class MapComponent {
    readonly #airportsBaseDataService = inject(AirportsBaseDataService);
    readonly #livestreamsDataService = inject(LivestreamsDataService);
    readonly #zone = inject(NgZone);
    readonly #injector = inject(Injector);
    readonly #renderer = inject(Renderer2);

    readonly #olMap?: OlMap;

    readonly #zoom = new BehaviorSubject<number>(1);
    readonly #zoom$ = this.#zoom.asObservable().pipe(throttleTime(300));

    public readonly map = viewChild<ElementRef<HTMLDivElement>>('map');
    public readonly livestreamModal = viewChild<ElementRef<HTMLDialogElement>>('livestreamModal');

    public readonly airports = toSignal(this.#airportsBaseDataService.getAirports(['large_airport', 'medium_airport']));
    public readonly livestreams = toSignal(this.#livestreamsDataService.getLivestreams());

    public readonly currentZoom = toSignal(this.#zoom$);
    public readonly currentZoomInt = computed(() => Math.floor(this.currentZoom() ?? 1));

    public readonly selectedLivestream = signal<Livestream | null>(null);

    public constructor() {
        const raster = new TileLayer({
            source: new OSM(),
        });

        this.#olMap = new OlMap({
            controls: defaultControls(),
            interactions: defaultInteractions(),
            layers: [raster],
            view: new View({
                center: [0, 0],
                zoom: 2,
                // projection: 'EPSG:4326', // 'EPSG:3857',
            }),
        });

        effect(() => {
            const airports = this.airports();
            if (!airports) {
                // console.log('no airports');
                return;
            }

            const livestreams = this.livestreams() ?? [];
            // console.log(livestreams);

            this.#olMap?.setTarget(this.map()?.nativeElement);

            const source = new VectorSource({
                features: airports.map(
                    (airport) =>
                        new Feature({
                            ...airport,
                            geometry: new Point(fromLonLat([airport.lon, airport.lat])),
                        }),
                ),
            });

            const cluster = new VectorLayer({
                opacity: 1,
                source: new Cluster({
                    source,
                    distance: 100,
                    // minDistance: 20,
                }),
                style: (clusterFeature) => {
                    const features = clusterFeature.get('features') as Feature[];
                    const size = features.length;
                    const hasLivestreams = this.#hasAtLeastOneFeatureALiveAirport(features, livestreams);

                    let radius = 10;
                    let text = String(size);
                    let fontSize = 7;
                    let fontWeight = 'normal';
                    if (size === 1) {
                        text = features[0].get('icao');
                        radius = 15;
                        fontSize = 8;

                        if (hasLivestreams) {
                            fontWeight = 'bold';
                            radius = 25;
                            fontSize = 13;
                        }
                    }

                    return new Style({
                        image: new Circle({
                            radius,
                            stroke: new Stroke({
                                color: hasLivestreams ? '#33691e' : '#616161',
                                width: 2,
                            }),
                            fill: new Fill({
                                color: hasLivestreams ? '#71be16' : '#e0e0e0',
                            }),
                        }),
                        text: new Text({
                            font: `${fontWeight} ${fontSize}px "system-ui"`,
                            text: text,
                            fill: new Fill({
                                color: '#333',
                            }),
                        }),
                    });
                },
            });

            this.#olMap?.addLayer(cluster);
        });

        this.#olMap?.on('click', (evt) => {
            this.#zone.runOutsideAngular(() => {
                const featuresAtPixel = this.#olMap?.getFeaturesAtPixel(evt.pixel);
                if (featuresAtPixel && featuresAtPixel.length > 0) {
                    const features = featuresAtPixel[0].get('features') as Feature<Point>[];
                    const mapView = this.#olMap?.getView();
                    if (!mapView) {
                        return;
                    }

                    if (features.length === 1) {
                        const feature = features[0];
                        const coords = feature.getGeometry()!.getCoordinates();
                        const currentZoom = mapView?.getZoom() ?? 1;
                        // console.log(coords, currentZoom);

                        mapView?.animate({ center: coords, zoom: Math.max(Math.min(currentZoom + 2, MAX_MAP_ZOOM), MAX_MAP_ZOOM), duration: 500 }, (a) => {
                            const livestream = this.#findLivestreamByFeature(feature);
                            if (!isNil(livestream)) {
                                this.selectedLivestream.set(livestream);
                                runInInjectionContext(this.#injector, () =>
                                    afterNextRender(() => {
                                        const el = this.livestreamModal()?.nativeElement;
                                        if (!isNil(el)) {
                                            el.showModal();
                                            this.#renderer.listen(el, 'close', () => {
                                                console.log('close');
                                                this.selectedLivestream.set(null);
                                            });
                                        }
                                    }),
                                );
                            }
                        });
                    } else {
                        const extent = boundingExtent(features.map((r) => r.getGeometry()!.getCoordinates()));

                        mapView?.fit(extent, { duration: 500, padding: [50, 50, 50, 50] });
                    }
                }
            });
        });

        this.#olMap?.on('pointermove', (evt) => {
            const map = this.#olMap!;
            const targetElement = map.getTargetElement();
            if (map.forEachFeatureAtPixel(evt.pixel, (f) => !!f)) {
                targetElement.style.cursor = 'pointer';
            } else {
                targetElement.style.cursor = '';
            }
        });
    }

    #hasAtLeastOneFeatureALiveAirport(features: Feature[], livestreams: Livestream[]): boolean {
        for (const feature of features) {
            if (!isNil(this.#findLivestreamByFeature(feature))) {
                return true;
            }
        }

        return false;
    }

    #findLivestreamByFeature(feature: Feature): Livestream | undefined {
        const livestreams = this.livestreams() ?? [];
        const icao = feature.get('icao');

        return livestreams.find((ls) => ls.icao === icao);
    }
}
