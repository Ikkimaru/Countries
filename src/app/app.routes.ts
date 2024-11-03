import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import {MapComponent} from './components/map/map.component';
import {RegionsComponent} from './components/regions/regions.component';

export const routes: Routes = [
    {
        path: '',
        component: RegionsComponent,
        title: 'Home Page'
    }
];
