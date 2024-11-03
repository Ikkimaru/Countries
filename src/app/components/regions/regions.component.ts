import { Component, OnInit } from '@angular/core';
import { RegionService } from '../../services/region.service';
import {RegionInterface} from '../../interfaces/region-interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-regions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './regions.component.html',
  styleUrls: ['./regions.component.css'],
})
export class RegionsComponent implements OnInit {
  countriesData: { region: string; subregion: string; country: string; cca2: string; }[] = [];
  selectedCountryInfo: RegionInterface | null = null;
  loadingData = true;

  constructor(private regionService: RegionService) {}

  uniqueRegions: string[] = [];
  filteredSubregions: string[] = [];
  filteredCountries: string[] = [];

  selectedRegion: string | null = null;
  selectedSubregion: string | null = null;
  selectedCountry: string | null = null;

  ngOnInit() {
    this.regionService.getRegions().subscribe((regions) => {
      // Map response data to populate countriesData
      this.countriesData = regions.map(region => ({
        region: region.region,
        subregion: region.subregion,
        country: region.name.common,
        cca2: region.cca2
      }));

      // Populate and sort unique regions list after data is loaded
      this.uniqueRegions = [...new Set(this.countriesData.map(data => data.region))].sort();
    });
  }

  onRegionSelect(region: string) {
    this.selectedRegion = region;

    // Populate and sort subregions for the selected region
    this.filteredSubregions = [
      ...new Set(
        this.countriesData
          .filter(data => data.region === region)
          .map(data => data.subregion)
      ),
    ].sort();

    this.selectedSubregion = null;
    this.filteredCountries = [];
    this.selectedCountry = null;
  }

  onSubregionSelect(subregion: string) {
    this.selectedSubregion = subregion;

    // Populate and sort countries for the selected subregion
    this.filteredCountries = this.countriesData
        .filter(data => data.subregion === subregion && data.region === this.selectedRegion)
        .map(data => data.country)
        .sort();

    this.selectedCountry = null;
  }

  onCountrySelect(country: string) {
    this.loadingData = true;
    this.selectedCountry = country;

    // Find the cca2 code for the selected country from countriesData
    const countryData = this.countriesData.find(data => data.country === country);
    const cca2Code = countryData?.cca2;
    console.log('Running Code: ' + cca2Code);

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
            console.log("Fetched: ", this.selectedCountryInfo);
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
    };
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

  protected readonly Math = Math;
}
