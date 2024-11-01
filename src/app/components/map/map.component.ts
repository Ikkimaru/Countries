import {Component, OnInit, ViewChild, ElementRef, HostListener} from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { CountryService } from '../../services/country.service';
import { CountryCoordinates } from '../../interfaces/countryCoordinates-interface';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [NgFor, CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  @ViewChild('image') imageElement!: ElementRef<HTMLImageElement>;

  dots: { x: number; y: number; country: string }[] = [];
  imageSrc: string = 'https://upload.wikimedia.org/wikipedia/commons/7/74/Mercator-projection.jpg';
  imageWidth: number = 0;
  imageHeight: number = 0;
  zoomed: boolean = false;

  constructor(private countryService: CountryService) {}

  ngOnInit() {
    this.waitUntilRendered();
  }

  private async waitUntilRendered() {
    await this.imageLoadPromise(); // Wait for the image to load
    this.updateImageSize(); // Update image size after it's loaded
    this.populateInitialDotPositions(); // Populate dots after size is updated
  }

  toggleZoom() {
    this.zoomed = !this.zoomed; // Toggle zoom state
  }

  private imageLoadPromise(): Promise<void> {
    return new Promise((resolve) => {
      // Check if the environment supports the Image constructor
      if (typeof window !== 'undefined') {
        const img = new Image();
        img.src = this.imageSrc;
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Ensure we resolve even on error
      } else {
        resolve(); // If not in a browser environment, resolve immediately
      }
    });
  }

  private populateInitialDotPositions() {
    this.countryService.getCountryNameAndLatlng().subscribe((countryData) => {
      this.dots = [
        { x: 0, y: 180, country: 'Center' },
        ...countryData.map((coord) => {
          const [lat, lon] = coord.latlng;
          const { x, y } = this.mapCoordinatesToPixels(lat, lon, this.imageWidth, this.imageHeight);
          return { x, y, country: coord.name.common };
        }),
      ];

      this.updateDotPositions(); // Update dot positions after they are populated
    });
  }

  private updateImageSize() {
    if (this.imageElement) {
      this.imageWidth = this.imageElement.nativeElement.offsetWidth;
      this.imageHeight = this.imageElement.nativeElement.offsetHeight;
    }
  }

  private updateDotPositions() {
    const mapWidth = this.imageWidth;
    const mapHeight = this.imageHeight;

    this.dots = this.dots.map(dot => {
      const { x, y, country } = dot; // Destructure the dot
      return { x, y, country }; // Return the same object structure
    });
  }

  mapCoordinatesToPixels(lat: number, lng: number, mapWidth: number, mapHeight: number) {

    const x = (lng + 180) * (mapWidth / 360);
    const latRad = lat * (Math.PI / 180);
    const y =
      (mapHeight / 2) -
      (mapWidth * Math.log(Math.tan(Math.PI / 4 + latRad / 2)) / (2 * Math.PI));

    return { x, y };
  }

  // HostListener to handle mouse scroll events
  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    event.preventDefault(); // Prevent the default scroll behavior
    this.zoomed = event.deltaY < 0; // Set zoomed to true if scrolling up, false if down
  }
}
