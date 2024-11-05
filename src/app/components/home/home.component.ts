import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CountryService} from '../../services/country.service';
import {FormsModule} from "@angular/forms";
import {MapComponent} from "../map/map.component";
import {CountryInterface} from "../../interfaces/country-interface";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
      CommonModule, FormsModule,MapComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  @Input() countryNames: CountryInterface[] = [];
  filteredCountryNames: CountryInterface[] = []; // List that will hold filtered names
  paginatedNames: CountryInterface[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10; // Default items per page
  totalPages: number = 0; // Total number of pages
  searchTerm: string = ''; // Filter term for search
  selectedCountry: any = null; // Holds data for the selected country
  loading: boolean = true;

  constructor(private countryService: CountryService) {
  }

  ngOnInit(): void {
    this.countryService.getCountryNames().subscribe((countries) => {
      // Adjust the mapping to create objects that match CountryInterface
      this.countryNames = countries.map((country) => ({
        name: {
          common: country.name.common,
          official: country.name.official // Include the official name as well
        },
        cca2: country.cca2 // Store cca2 code alongside the country name
      })).sort((a, b) => a.name.common.localeCompare(b.name.common)); // Sort by common name

      this.applyFilter(); // Call the filter method
      this.loading = false; // Set loading to false after fetching data
    });
  }

  applyFilter(): void {
    // Filter country names based on search term using the common name
    this.filteredCountryNames = this.countryNames.filter(country =>
        country.name.common.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.totalPages = Math.ceil(this.filteredCountryNames.length / this.itemsPerPage);
    this.currentPage = 1; // Reset to the first page after applying the filter
    this.updatePaginatedNames();
  }

  updatePaginatedNames(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedNames = this.filteredCountryNames.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedNames();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedNames();
    }
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(target.value, 10);
    this.totalPages = Math.ceil(this.filteredCountryNames.length / this.itemsPerPage);
    this.currentPage = 1; // Reset to the first page when items per page changes
    this.updatePaginatedNames();
  }

  fetchCountryDetails(cca2: string): void {
    this.countryService.getCountryByAlpha(cca2).subscribe((country) => {
      if (country) {
        if (Array.isArray(country) && country.length > 0) {
          this.selectedCountry = country[0]; // If an array, take the first item
        } else if (!Array.isArray(country)) {
          this.selectedCountry = country; // If a single object, assign it directly
        }
      } else {
        console.error('No data found for country:', country); // Log if no data found
        this.selectedCountry = null; // Handle no data case
      }
    });
  }
}
