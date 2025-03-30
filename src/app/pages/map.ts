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
import { FeatureLike } from 'ol/Feature';
import { Point } from 'ol/geom';
import { defaults as defaultInteractions } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import BaseObject from 'ol/Object';
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

        @if (hasSelectedLivestreams()) {
            <dialog
                class="modal"
                #livestreamModal
            >
                <div class="modal-box max-w-full">
                    <als-livestream-card [livestreams]="selectedLivestreams()" />
                    <div class="modal-action">
                        <form method="dialog">
                            <button class="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>
        }
    `,
    imports: [LivestreamCardComponent],
})
export class MapPageComponent {
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

    // public readonly currentZoom = toSignal(this.#zoom$);
    // public readonly currentZoomInt = computed(() => Math.floor(this.currentZoom() ?? 1));

    public readonly selectedLivestreams = signal<Livestream[]>([]);
    public readonly hasSelectedLivestreams = computed(() => this.selectedLivestreams().length > 0);

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

            const normalStyle = new Style({
                image: new Circle({
                    radius: 12,
                    stroke: new Stroke({
                        color: '#616161',
                        width: 2,
                    }),
                    fill: new Fill({
                        color: '#e0e0e0',
                    }),
                }),
                text: new Text({
                    font: `normal 7px "system-ui"`,
                    // text: text,
                    fill: new Fill({
                        color: '#333',
                    }),
                }),
            });
            const hasLivestreamsStyle = new Style({
                image: new Circle({
                    radius: 15,
                    stroke: new Stroke({
                        color: '#33691e',
                        width: 2,
                    }),
                    fill: new Fill({
                        color: '#71be16',
                    }),
                }),
                text: new Text({
                    font: `normal 9px "system-ui"`,
                    // text: text,
                    fill: new Fill({
                        color: '#333',
                    }),
                }),
            });
            const hasLivestreamsAndIsAirportStyle = new Style({
                image: new Circle({
                    radius: 23,
                    stroke: new Stroke({
                        color: '#33691e',
                        width: 2,
                    }),
                    fill: new Fill({
                        color: '#71be16',
                    }),
                }),
                text: new Text({
                    font: `bold 12px "system-ui"`,
                    // text: text,
                    fill: new Fill({
                        color: '#333',
                    }),
                }),
            });

            const cluster = new VectorLayer({
                opacity: 1,
                source: new Cluster({
                    source,
                    distance: 100,
                    // minDistance: 20,
                }),
                style: (clusterFeature: FeatureLike) => {
                    const features = clusterFeature.get('features') as Feature[];
                    const size = features.length;
                    const foundLivestreams = this.#findLivestreamsByFeatures(features, livestreams);
                    const hasLivestreams = foundLivestreams.length > 0;
                    let text = hasLivestreams ? `${foundLivestreams.length}/${size}` : String(size);

                    (clusterFeature as BaseObject).set('hasLivestreams', hasLivestreams);

                    let style = normalStyle;
                    if (hasLivestreams) {
                        if (size === 1) {
                            text = features[0].get('icao');
                            style = hasLivestreamsAndIsAirportStyle;
                        } else {
                            style = hasLivestreamsStyle;
                        }
                    }

                    style.getText()?.setText(text);

                    return style;
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

                        mapView?.animate({ center: coords, zoom: Math.max(Math.min(currentZoom + 2, MAX_MAP_ZOOM), MAX_MAP_ZOOM), duration: 500 }, () => {
                            const livestreams = this.#findLivestreamsByFeature(feature);
                            if (livestreams.length > 0) {
                                // @TODO: What if multiple livestreams?
                                this.selectedLivestreams.set(livestreams);
                                runInInjectionContext(this.#injector, () =>
                                    afterNextRender(() => {
                                        const el = this.livestreamModal()?.nativeElement;
                                        if (!isNil(el)) {
                                            el.showModal();
                                            this.#renderer.listen(el, 'close', () => {
                                                // console.log('close');
                                                this.selectedLivestreams.set([]);
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
            const featureAtPixel = map.forEachFeatureAtPixel(evt.pixel, (f: any) => f);

            // if (!isNil(featureAtPixel)) {
            //     console.log((featureAtPixel as any).get('hasLivestreams'));
            // }

            if (!isNil(featureAtPixel)) {
                targetElement.style.cursor = 'pointer';
            } else {
                targetElement.style.cursor = '';
            }

            // map.on('pointermove', function (e) {
            //     if (selected !== null) {
            //         selected.setStyle(undefined);
            //         selected = null;
            //     }
            //
            //     map.forEachFeatureAtPixel(e.pixel, function (f) {
            //         selected = f;
            //         selectStyle.getFill().setColor(f.get('COLOR') || '#eeeeee');
            //         f.setStyle(selectStyle);
            //         return true;
            //     });
            //
            //     if (selected) {
            //         status.innerHTML = selected.get('ECO_NAME');
            //     } else {
            //         status.innerHTML = '&nbsp;';
            //     }
            // });
        });
    }

    #hasAtLeastOneFeatureALiveAirport(features: Feature[], livestreams: Livestream[]): boolean {
        for (const feature of features) {
            if (this.#findLivestreamsByFeature(feature).length > 0) {
                return true;
            }
        }

        return false;
    }

    #findLivestreamsByFeature(feature: Feature, livestreams = this.livestreams() ?? []): Livestream[] {
        const icao = feature.get('icao');

        return livestreams.filter((ls) => ls.icao === icao);
    }

    #findLivestreamsByFeatures(features: Feature[], livestreams = this.livestreams() ?? []): Livestream[] {
        let foundLivestreams: Livestream[] = [];

        features.forEach((feature) => (foundLivestreams = [...foundLivestreams, ...this.#findLivestreamsByFeature(feature, livestreams)]));

        return foundLivestreams;
    }
}
