import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {CommonModule, NgFor} from '@angular/common';
import {CountryCoordinates} from '../../interfaces/countryCoordinates-interface';
import {MapService} from '../../services/map.service';
import {CountryDetailsComponent} from '../country-details/country-details.component';
import {RegionService} from '../../services/region.service';
import ResizeObserver from 'resize-observer-polyfill';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [NgFor, CommonModule, CountryDetailsComponent, FormsModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('image') imageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('childComponent', { static: false }) childComponent!: ElementRef;

  private resizeObserver!: ResizeObserver;

  dots: { x: number; y: number; country: string; cca2:string; }[] = [];
  capitalDots: { x: number; y: number; country: string; capital: string }[] = [];
  countryCoordinates: CountryCoordinates[] = [];
  imageSrc: string = 'https://upload.wikimedia.org/wikipedia/commons/7/74/Mercator-projection.jpg';
  imageWidth: number = 0;
  imageHeight: number = 0;
  labelFontSize: number = 12;
  selectedCountry: { country: string; x: number; y: number; cca2: string } | null = null;
  selectedCountryId: string | null = null;
  overlayPosition = { left: 0, top: 0};
  childComponentWidth: number = 0;
  childComponentHeight: number = 0;
  isOverlayVisible = false;
  dotSize: number = 8;
  xOffset: number = 0;
  yOffset: number = 50;
  searchQuery: string = '';

  constructor(private mapService: MapService, protected regionService: RegionService, private cdr: ChangeDetectorRef) {
    this.updateLabelFontSize();
  }

  ngOnInit() {
    this.waitUntilRendered();
    this.fetchCountryCoordinates(); // Fetch coordinates on initialization
    this.updateLabelFontSize(); // Set initial label font size
  }

  ngAfterViewInit() {
    // Initialize the ResizeObserver
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        this.childComponentWidth = width;
        this.childComponentHeight = height;
        this.updateOverlaySize();
      }
    });

    // Start observing the child component
    if (this.childComponent) {
      this.resizeObserver.observe(this.childComponent.nativeElement);
    }
  }
  ngOnDestroy() {
    // Cleanup the observer when the component is destroyed
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateLabelFontSize(); // Update font size on window resize
    this.updateDotPositions();
  }

  isCountryHighlighted(country: string): boolean {
    if (!this.searchQuery) {
      return false;
    }
    return country.toLowerCase().includes(this.searchQuery.toLowerCase());
  }

  onSearchChange(): void {
  }

  updateOverlaySize() {
    // Logic to set the overlay size
    const overlayElement = document.querySelector('.overlay') as HTMLElement;
    if (overlayElement) {
      overlayElement.style.width = `${this.childComponentWidth}px`;
      overlayElement.style.height = `${this.childComponentHeight}px`;
    }
  }
  protected calculateDotPosition(dot: { x: number; y: number }): { top: string; left: string } {
    // Assuming this.imageWidth and this.imageHeight are set after the image is loaded
    const offsetX = 10; // Adjust as necessary
    const offsetY = 10; // Adjust as necessary
    const top = (dot.y / this.imageHeight * 100) + offsetY + '%';
    const left = (dot.x / this.imageWidth * 100) + offsetX + '%';
    return { top, left };
  }

  onLabelClick(event: MouseEvent, country: string): void {
    this.isOverlayVisible = true;

    const containerRect = this.imageElement.nativeElement.getBoundingClientRect(); // Get the container dimensions

    // Get mouse position relative to the container
    const mouseX = event.clientX - containerRect.left;
    const mouseY = event.clientY - containerRect.top;

    // Set overlay position based on mouse click position
    this.overlayPosition.left = mouseX;
    this.overlayPosition.top = mouseY;

    // Adjust overlay position to stay within the container boundaries
    this.adjustOverlayPosition(containerRect);

    // Set the selected country ID
    this.selectedCountryId = country;

    // Find the selected country details
    const foundDot = this.dots.find(dot => dot.country === country);
    this.selectedCountry = foundDot ? { ...foundDot } : null; // Ensure it is either the found dot or null
    this.updateOverlaySize();
  }

  private adjustOverlayPosition(containerRect: DOMRect): void {
    const overlayHeight = 200; // Adjust according to your overlay's height
    const overlayWidth = 300;  // Adjust according to your overlay's width

    // Ensure the overlay does not go out of the right boundary
    if (this.overlayPosition.left + overlayWidth > containerRect.width) {
      this.overlayPosition.left = containerRect.width - overlayWidth - 10; // Leave some padding
    }

    // Ensure the overlay does not go out of the bottom boundary
    if (this.overlayPosition.top + overlayHeight > containerRect.height) {
      this.overlayPosition.top = containerRect.height - overlayHeight - 10; // Leave some padding
    }

    // If the overlay goes above the top of the container, adjust it downwards
    if (this.overlayPosition.top < 0) {
      this.overlayPosition.top = 10; // Keep it within a small margin from the top
    }
  }

  mapCoordinatesToPixels(lat: number, lng: number, mapWidth: number, mapHeight: number) {
    const x = (lng + 180) * (mapWidth / 360) + this.xOffset;
    const latRad = lat * (Math.PI / 180);
    const y =
      (mapHeight / 2) -
      (mapWidth * Math.log(Math.tan(Math.PI / 4 + latRad / 2)) / (2 * Math.PI)) +
      this.yOffset;

    return { x, y };
  }


  private fetchCountryCoordinates() {
    this.mapService.getCountryNameAndLatlng().subscribe({
      next: (coordinates: CountryCoordinates[]) => {
        this.countryCoordinates = coordinates; // Assign the fetched coordinates
        this.populateInitialDotPositions(); // Populate dots after fetching the coordinates
        this.updateDotPositions();
      },
      error: (err) => {
        console.error('Error fetching country coordinates:', err);
      }
    });
  }

  private updateLabelFontSize() {
    if (typeof window !== 'undefined') {
      const zoomLevel = window.devicePixelRatio;
      this.labelFontSize = 12 / zoomLevel; // Adjust the font size based on the zoom level
      this.dotSize = 8 / zoomLevel; // Adjust the dot size based on the zoom level
    }
  }

  private async waitUntilRendered() {
    await this.imageLoadPromise();
    this.updateImageSize();
    this.populateInitialDotPositions(); // Populate dots after size is updated
    this.updateDotPositions();
  }

  private imageLoadPromise(): Promise<void> {
    return new Promise((resolve) => {
      // Check if running in the browser
      if (typeof window !== 'undefined') {
        const img = new Image();
        img.src = this.imageSrc;
        img.onload = () => {
          this.imageWidth = img.width; // Store image width
          this.imageHeight = img.height; // Store image height
          resolve();
        };
        img.onerror = () => resolve(); // Ensure we resolve even on error
      } else {
        // If not running in the browser, resolve immediately
        resolve();
      }
    });
  }

  private populateInitialDotPositions() {
    this.dots = [
      { x: this.imageWidth / 2, y: this.imageHeight / 2, country: 'Center-ish', cca2: "" },
      ...this.countryCoordinates.map((coord: CountryCoordinates) => {
        const [lat, lon] = coord.latlng;
        const { x, y } = this.mapCoordinatesToPixels(lat, lon, this.imageWidth, this.imageHeight);
        return { x, y, country: coord.name.common, cca2: coord.cca2 };
      }),
    ];

    this.capitalDots = this.countryCoordinates
      .filter((coord) => coord.capitalInfo?.latlng) // Ensure capital has coordinates
      .map((coord) => {
        const [capitalLat, capitalLon] = coord.capitalInfo!.latlng;
        const { x, y } = this.mapCoordinatesToPixels(capitalLat, capitalLon, this.imageWidth, this.imageHeight);
        return {
          x,
          y,
          country: coord.name.common,
          capital: coord.capitalInfo?.latlng && coord.capitalInfo.latlng.length > 0
            ? coord.capitalInfo.latlng[0].toString()
            : ''
        };
      });
  }


  private updateImageSize() {
    if (this.imageElement) {
      this.imageWidth = this.imageElement.nativeElement.offsetWidth;
      this.imageHeight = this.imageElement.nativeElement.offsetHeight;
    }
  }

  private updateDotPositions() {
    // Reposition both country and capital dots after resizing
    const mapWidth = this.imageWidth;
    const mapHeight = this.imageHeight;

    this.dots = this.dots.map((dot) => {
      const { x, y, country, cca2 } = dot;
      return { x, y, country, cca2 };
    });

    this.capitalDots = this.capitalDots.map((dot) => {
      const { x, y, country, capital } = dot;
      return { x, y, country, capital };
    });
  }

  toggleCountryDetails() {
    // If the overlay is visible, close it
    if (this.isOverlayVisible) {
      this.isOverlayVisible = false;
      this.selectedCountry = null; // Optionally clear selected country
    } else {
      this.isOverlayVisible = true; // Otherwise, show the overlay
    }
  }

  protected readonly Math = Math;
}
