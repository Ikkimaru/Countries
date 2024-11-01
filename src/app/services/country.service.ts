import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, Observable, of, tap} from 'rxjs';
import {CountryInterface} from '../interfaces/country-interface';
import {CountryCoordinates} from '../interfaces/countryCoordinates-interface';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private apiUrl = 'https://restcountries.com/v3.1';
  private cachedData: CountryCoordinates[] | null = null;

  constructor(private http: HttpClient) {}

  getCountryNames(): Observable<CountryInterface[]> {
    return this.http.get<CountryInterface[]>(`${this.apiUrl}/all?fields=name`);
  }
  getCountryNameAndLatlng(): Observable<CountryCoordinates[]> {
    // Return cached data if available
    if (this.cachedData) {
      console.log('Returning cached data'); // Debug log for caching
      return of(this.cachedData); // Return cached data as an observable
    }

    // Fetch data from API and cache it
    // return this.http.get<CountryCoordinates[]>(`${this.apiUrl}/all?fields=name,latlng`).pipe(
    return this.http.get<CountryCoordinates[]>(`/countries.json`).pipe(
      tap(data => {
        this.cachedData = data; // Cache the fetched data
        console.log('Fetched and cached data:', data); // Debug log for fetched data
      }),
      catchError(error => {
        console.error('Error fetching country data', error);
        return of([]); // Return an empty array on error
      })
    );
  }
  getCountryByName(countryName:string): Observable<CountryInterface[]> {
    return this.http.get<CountryInterface[]>(`${this.apiUrl}/name/${countryName}`);
  }

  // Optional: Method to clear the cache
  clearCache() {
    this.cachedData = null;
  }
}
