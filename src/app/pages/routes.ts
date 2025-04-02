import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'map',
        pathMatch: 'full',
    },
    {
        path: 'map',
        loadComponent: () => import('./map').then((m) => m.MapPageComponent),
    },
    {
        path: 'list',
        loadComponent: () => import('./list').then((m) => m.ListPageComponent),
    },
    {
        path: 'faq',
        loadComponent: () => import('./faq').then((m) => m.FAQPageComponent),
    },
    // {
    //     path: 'livestream/:videoId',
    //     loadComponent: () => import('./auxiliary/livestream-dialog').then((m) => m.LivestreamDialogComponent),
    //     outlet: 'dialog',
    // },
];
