import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RegionInterface } from '../interfaces/region-interface';
import {CountryInterface} from '../interfaces/country-interface';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private apiUrl = 'https://restcountries.com/v3.1';

  constructor(private http: HttpClient) {}

  getRegions(): Observable<RegionInterface[]> {
    // Check if localStorage is available
    if (typeof window !== 'undefined' && localStorage.getItem('regions')) {
      // Return cached regions from localStorage if available
      const cachedRegions = JSON.parse(localStorage.getItem('regions')!);
      return new Observable<RegionInterface[]>(observer => {
        observer.next(cachedRegions);
        observer.complete();
      });
    } else {
      // Fetch regions from the API and store in localStorage
      return this.http.get<RegionInterface[]>(`${this.apiUrl}/all?fields=name,region,subregion,cca2`).pipe(
        tap(regions => {
          // Update regions with "No Subregions" for empty subregions in the "Antarctic" region
          const updatedRegions = regions.map(region => {
            if (region.region === "Antarctic" && (!region.subregion || region.subregion.trim() === "")) {
              return { ...region, subregion: "No Subregions" };
            }
            return region;
          });

          // Cache the updated regions in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('regions', JSON.stringify(updatedRegions));
          }
        })
      );

    }
  }

  getCountryByAlpha(code: string): Observable<RegionInterface> {
    return this.http.get<RegionInterface>(`${this.apiUrl}/alpha/${code}`);
  }
}
