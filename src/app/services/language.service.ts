import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Language {
  code: string;
  name: string;
}

interface LanguagesResponse {
  languages: Language[];
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private languagesUrl = '/languageCodes.json';

  constructor(private http: HttpClient) { }

  // Method to fetch languages
  getLanguages(): Observable<LanguagesResponse> {
    return this.http.get<LanguagesResponse>(this.languagesUrl);
  }
}
