import { AfterViewInit, Component, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NavBarComponent} from './components/nav-bar/nav-bar.component';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {
  @ViewChild(NavBarComponent) navBar!: NavBarComponent;

  isNavBarExpanded: boolean = false; // Initialize with default value

  ngAfterViewInit() {
    // Set isNavBarExpanded based on the navbar state
    this.isNavBarExpanded = this.navBar.isExpanded;
  }

  onNavBarToggle(isExpanded: boolean) {
    this.isNavBarExpanded = isExpanded; // Update the state when toggled
  }
}
