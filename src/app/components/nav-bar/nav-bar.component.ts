import {Component, Output, EventEmitter} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    NgIf,
    NgClass
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  isExpanded = false; // State to track whether the nav bar is expanded

  @Output() navBarToggle = new EventEmitter<boolean>(); // Create an event emitter

  toggleNavbar() {
    this.isExpanded = !this.isExpanded; // Toggle the expanded state
    this.navBarToggle.emit(this.isExpanded); // Emit the state change
  }
}
