import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CountryService} from '../../services/country.service';
import {FormsModule} from "@angular/forms";
import {MapComponent} from "../map/map.component";

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
  countryNames: string[] = [];
  filteredCountryNames: string[] = []; // List that will hold filtered names
  paginatedNames: string[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10; // Default items per page
  totalPages: number = 0; // Total number of pages
  searchTerm: string = ''; // Filter term for search
  selectedCountry: any = null; // Holds data for the selected country

  constructor(private countryService: CountryService) {}

  ngOnInit(): void {
    this.countryService.getCountryNames().subscribe((countries) => {
      this.countryNames = countries.map((country) => country.name.common).sort((a, b) => a.localeCompare(b));
      this.applyFilter(); // Initial filter application
    });
  }

  applyFilter(): void {
    // Filter country names based on search term
    this.filteredCountryNames = this.countryNames.filter(name =>
        name.toLowerCase().includes(this.searchTerm.toLowerCase())
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

  fetchCountryDetails(countryName: string): void {
    this.countryService.getCountryByName(countryName).subscribe((country) => {
      this.selectedCountry = country[0]; // API returns an array
    });
  }
}
