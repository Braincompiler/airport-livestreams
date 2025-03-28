import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, makeEnvironmentProviders, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { Configuration as DataApiConfiguration, ConfigurationParameters as DataApiConfigurationParameters } from '@api/data';

import { environment } from '../environments/environment';
import { dataInterceptor } from '../interceptors';
import { routes } from './app.routes';

export function withDataApiConfiguration(configParams: DataApiConfigurationParameters) {
    return new DataApiConfiguration({
        ...configParams,
    });
}

export function provideDataApi(configuration: DataApiConfiguration) {
    return makeEnvironmentProviders([
        {
            provide: DataApiConfiguration,
            useValue: configuration,
        },
    ]);
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(), //
        provideClientHydration(withEventReplay()),
        provideRouter(routes),
        provideHttpClient(
            withFetch(), //
            withInterceptors([dataInterceptor]),
        ),

        provideDataApi(
            withDataApiConfiguration({
                basePath: environment.dataEndpoint,
                // withCredentials: true,
            }),
        ),
    ],
};
