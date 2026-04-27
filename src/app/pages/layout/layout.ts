import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services';
import { User } from '../../models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class LayoutComponent implements OnInit {
  currentUser = signal<User | null>(null);
  menuOpen = signal(false);
  userMenuOpen = signal(false);
  dashboardOpen = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
    });
  }

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
  }

  toggleUserMenu(): void {
    this.userMenuOpen.set(!this.userMenuOpen());
  }

  toggleDashboard(): void {
    this.dashboardOpen.set(!this.dashboardOpen());
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }

  navigateTo(route: string): void {
    this.router.navigate([`/dashboard/${route}`]);
    this.closeMenu();
  }
}
