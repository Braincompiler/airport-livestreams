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
        path: 'report-missing-livestream',
        loadComponent: () => import('./report-missing-livestream').then((m) => m.ReportMissingLivestreamPageComponent),
    },
];
