import {Routes} from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {MapComponent} from './components/map/map.component';
import {RegionsComponent} from './components/regions/regions.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home Page'
  },
  {
    path: 'map',
    component: MapComponent,
    title: 'Map Page'
  },
  {
    path: 'regions',
    component: RegionsComponent,
    title: 'Regions Page'
  },
];
