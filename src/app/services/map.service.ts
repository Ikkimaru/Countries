import {Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CountryCoordinates } from '../interfaces/countryCoordinates-interface';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private cachedData: CountryCoordinates[] = [];
  private apiUrl = 'https://restcountries.com/v3.1';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getCountryNameAndLatlng(): Observable<CountryCoordinates[]> {
    //localStorage.setItem('countryCoordinates', ""); //Delete local storage
    if (isPlatformBrowser(this.platformId)) {
      const cachedData = localStorage.getItem('countryCoordinates');
      if (cachedData) {
        console.log('Returning cached data from localStorage');
        this.cachedData = JSON.parse(cachedData); // Restore from localStorage
        return of(this.cachedData);
      }
    }

    return this.http.get<CountryCoordinates[]>(`${this.apiUrl}/all?fields=name,latlng,capitalInfo`).pipe(
      tap(data => {
        this.cachedData = data;
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('countryCoordinates', JSON.stringify(data)); // Cache in localStorage
          console.log('Fetched and cached data');
        }
      }),
      catchError(error => {
        console.error('Error fetching country data', error);
        return of([]); // Return an empty array on error
      })
    );
  }
}




