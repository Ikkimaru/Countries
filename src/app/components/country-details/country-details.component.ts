import {Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef, Renderer2} from '@angular/core';
import {DatePipe, DecimalPipe, KeyValuePipe, NgForOf, NgIf, NgStyle} from '@angular/common';
import {RegionInterface} from '../../interfaces/region-interface';
import {LanguageService} from '../../services/language.service';
import { RegionService } from '../../services/region.service';

@Component({
  selector: 'app-country-details',
  standalone: true,
  imports: [
    DecimalPipe,
    NgForOf,
    NgIf,
    DatePipe,
    KeyValuePipe,
    NgStyle
  ],
  templateUrl: './country-details.component.html',
  styleUrl: './country-details.component.css'
})
export class CountryDetailsComponent implements OnInit, OnChanges {
  protected readonly Math = Math;
  @Input() selectedCountry!: string | null;
  @Input() regionService!: RegionService;
  @Input() countriesData!: { region: string; subregion: string; country: string; cca2: string }[];
  selectedCountryInfo: RegionInterface | null = null;
  languageMap: { [key: string]: string } = {};
  loadingData = true;
  backgorundMapUrl:string = "";

  constructor(private languageService: LanguageService,private el: ElementRef,private renderer: Renderer2) {
  }

  ngOnInit() {
    if(!this.countriesData){
      this.getRegionInfo();
    }
    this.languageService.getLanguages().subscribe(
      (response) => {
        // Create a mapping of language codes to names
        response.languages.forEach(lang => {
          this.languageMap[lang.code] = lang.name;
        });
      },
      (error) => {
        console.error('Error fetching languages:', error);
      }
    );
    if(this.selectedCountry) {
      this.getCountryInfo(this.selectedCountry);
    }
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
      }
    });

    resizeObserver.observe(this.el.nativeElement);
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedCountry'] && changes['selectedCountry'].currentValue) {
      this.getCountryInfo(this.selectedCountry!);
    }
  }

  getCurrentTime(timezone: string): string {
    const now = new Date();

    // Convert current time to UTC
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000;

    // Extract the UTC offset (e.g., '+02:00') from the timezone string
    const offsetSign = timezone.includes('-') ? -1 : 1;
    const offsetHours = parseInt(timezone.split(':')[0].replace('UTC', ''), 10) * offsetSign;
    const offsetMinutes = parseInt(timezone.split(':')[1], 10) * offsetSign;

    // Calculate the offset in milliseconds
    const offsetInMilliseconds = (offsetHours * 60 + offsetMinutes) * 60 * 1000;

    // Create a new date object adjusted to the specified timezone
    const localTime = new Date(utcTime + offsetInMilliseconds);

    // Return the time in a readable format (optional)
    return localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }



  getRegionInfo()
  {
    this.regionService.getRegions().subscribe((regions) => {
      // Map response data to populate countriesData
      this.countriesData = regions.map(region => ({
        region: region.region,
        subregion: region.subregion,
        country: region.name.common,
        cca2: region.cca2
      }));
    });
  }
  getCountryInfo(country: string) {
    this.loadingData = true;
    this.selectedCountry = country;

    // Ensure that countriesData is defined and populated before proceeding
    if (!this.countriesData || this.countriesData.length === 0) {
      console.warn('countriesData is not yet populated. Attempting to load regions.');
      this.getRegionInfo(); // Call getRegionInfo if data is missing
      this.loadingData = false;
      return;
    }

    // Find the cca2 code for the selected country from countriesData
    const countryData = this.countriesData.find(data => data.country === country);
    const cca2Code = countryData?.cca2;

    if (cca2Code) {
      // Pass the cca2 code to getCountryByAlpha
      this.regionService.getCountryByAlpha(cca2Code).subscribe(
        (countryInfo) => {
          if (countryInfo) {
            // Check if the response is an array
            if (Array.isArray(countryInfo) && countryInfo.length > 0) {
              // Assign the first item if it's an array
              this.selectedCountryInfo = this.mapCountryInfo(countryInfo[0]);
            } else if (!Array.isArray(countryInfo)) {
              // Assign directly if it's a single object
              this.selectedCountryInfo = this.mapCountryInfo(countryInfo);
            }
          } else {
            console.error('No data found for country:', countryInfo);
            this.selectedCountryInfo = null; // Handle no data case
          }
        },
        (error) => {
          console.error('Error fetching country information:', error);
        },
        () => {
          this.loadingData = false;
        }
      );
    } else {
      console.error('CCA2 code not found for the selected country.');
      this.loadingData = false;
    }
  }

  getLanguages() {
    if (this.selectedCountryInfo && this.selectedCountryInfo.languages) {
      return Object.entries(this.selectedCountryInfo.languages).map(([key, value]) => ({
        key,
        value
      }));
    }
    return []; // Return an empty array if no languages are available
  }
  getLanguageName(code: string): string {
    return this.languageMap[code] || code; // Return the name or the code if not found
  }

// Method to map the country info to the desired structure
  private mapCountryInfo(countryInfo: any) {
    return {
      region: countryInfo.region,
      subregion: countryInfo.subregion,
      name: countryInfo.name,
      cca2: countryInfo.cca2,
      population: countryInfo.population,
      area: countryInfo.area,
      flag: countryInfo.flag,
      latlng: countryInfo.latlng,
      demonyms: countryInfo.demonyms,
      translations: countryInfo.translations,
      timezones: countryInfo.timezones,
      maps: countryInfo.maps,
      coatOfArms: countryInfo.coatOfArms,
      flags:countryInfo.flags,
      languages:countryInfo.languages,
      capital:countryInfo.capital,
      capitalInfo: {
        latlng: Array.isArray(countryInfo.capitalInfo.latlng) ? countryInfo.capitalInfo.latlng : []
      },
    };
  }

  get capitalLatLng(): string {
    const capitalInfo = this.selectedCountryInfo?.capitalInfo; // Optional chaining to prevent null access

    if (capitalInfo && Array.isArray(capitalInfo.latlng) && capitalInfo.latlng.length === 2) {
      const lat = capitalInfo.latlng[0] ?? 0; // Default to 0 if undefined
      const lng = capitalInfo.latlng[1] ?? 0; // Default to 0 if undefined

      return `${Math.abs(lat)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng)}° ${lng >= 0 ? 'E' : 'W'}`;
    }
    return 'Coordinates not available';
  }


  get countryTranslations() {
    const translationsArray = [];
    if (this.selectedCountryInfo?.translations) {
      for (const [language, translation] of Object.entries(this.selectedCountryInfo.translations)) {
        translationsArray.push({ language, ...translation });
      }
    }
    return translationsArray;
  }

  protected readonly Array = Array;
}
