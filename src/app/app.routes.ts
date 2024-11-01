import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import {MapComponent} from './components/map/map.component';

export const routes: Routes = [
    {
        path: '',
        component: MapComponent,
        title: 'Home Page'
    }
];
