import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Period } from '../../models';
import { PeriodService } from '../../services';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class DashboardHomeComponent implements OnInit {
  periods = signal<Period[]>([]);
  sortedPeriods = computed(() => [...this.periods()].sort(
    (a, b) =>
      new Date(b.startDate).getTime() -
      new Date(a.startDate).getTime()
  ));
  nextPeriod = signal<Period | null>(null);
  daysUntilNext = signal(0);
  averagePeriodDuration = signal(0);


  constructor(private periodService: PeriodService) {}

  ngOnInit(): void {
    this.periodService.periods$.subscribe((periods) => {
      this.periods.set(periods);
      this.calculateStats();
    });
  }
  private calculateStats(): void {
    const periods = this.periods();
    if (periods.length === 0) return;

    // Get next upcoming period
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingPeriods = periods.filter((p) => {
      const nextDate = new Date(p.nextPeriodDate);
      nextDate.setHours(0, 0, 0, 0);
      return nextDate >= today;
    });

    if (upcomingPeriods.length > 0) {
      const next = upcomingPeriods[upcomingPeriods.length - 1];
      this.nextPeriod.set(next);
      this.daysUntilNext.set(this.periodService.daysUntilNextPeriod(next.nextPeriodDate));
    }

    // Calculate averages
    this.averagePeriodDuration.set(this.periodService.getAveragePeriodDuration());
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getStatusColor(daysUntil: number): string {
    if (daysUntil <= 2) return 'warning';
    if (daysUntil <= 7) return 'info';
    return 'success';
  }

  getStatusText(daysUntil: number): string {
    if (daysUntil === 0) return 'Today!';
    if (daysUntil === 1) return 'Tomorrow!';
    if (daysUntil < 7) return `In ${daysUntil} days`;
    return `In about ${Math.round(daysUntil / 7)} weeks`;
  }
}
