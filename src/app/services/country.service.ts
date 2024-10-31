import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Country {
  name: {
    common: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private apiUrl = 'https://restcountries.com/v3.1/all?fields=name';

  constructor(private http: HttpClient) {}

  getCountryNames(): Observable<Country[]> {
    return this.http.get<Country[]>(this.apiUrl);
  }
}
