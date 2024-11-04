import { Component, OnInit } from '@angular/core';
import { RegionService } from '../../services/region.service';
import {RegionInterface} from '../../interfaces/region-interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {LanguageService} from '../../services/language.service';
import {CountryDetailsComponent} from '../country-details/country-details.component';

@Component({
  selector: 'app-regions',
  standalone: true,
  imports: [CommonModule, FormsModule, CountryDetailsComponent],
  templateUrl: './regions.component.html',
  styleUrls: ['./regions.component.css'],
})
export class RegionsComponent implements OnInit {
  countriesData: { region: string; subregion: string; country: string; cca2: string; }[] = [];
  languageMap: { [key: string]: string } = {};
  loadingData = true;

  constructor(protected regionService: RegionService, private languageService: LanguageService) {

  }
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
    const previousCountry = this.selectedCountry;
    this.selectedCountry = null; // Set to null to force reload
    setTimeout(() => {
      this.selectedCountry = previousCountry; // Set it back to re-trigger *ngIf
    });

  }

}
