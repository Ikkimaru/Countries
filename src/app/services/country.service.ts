import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { CountryInterface } from '../interfaces/country-interface';

@Injectable({
  providedIn: 'root', // Ensure it's provided at root level
})
export class CountryService {
  private apiUrl = 'https://restcountries.com/v3.1';

  constructor(private http: HttpClient) {
  }

  getCountryNames(): Observable<CountryInterface[]> {
    return this.http.get<CountryInterface[]>(`${this.apiUrl}/all?fields=name,cca2`);
  }

  getCountryByName(countryName: string): Observable<CountryInterface[]> {
    return this.http.get<CountryInterface[]>(`${this.apiUrl}/name/${countryName}`);
  }

  getCountryByAlpha(code: string): Observable<CountryInterface[]> {
    return this.http.get<CountryInterface[]>(`${this.apiUrl}/alpha/${code}?fields=name,region,subregion,population,capital,flags, languages`);
  }
}
