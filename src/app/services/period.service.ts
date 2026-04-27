import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Period, CreatePeriodRequest } from '../models';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PeriodService {
  private periodsSubject = new BehaviorSubject<Period[]>([]);
  public periods$ = this.periodsSubject.asObservable();

  constructor(private apiService: ApiService, private authService: AuthService) {
    // Wait until authenticated or token present before loading periods
    if (this.authService.hasToken()) {
      this.loadPeriods();
    } else {
      this.authService.currentUser$
        .pipe(filter((u) => !!u))
        .subscribe(() => this.loadPeriods());
    }
  }

  /**
   * Load all periods from backend
   */
  loadPeriods(): void {
    console.log('loadPeriods:',)
    this.apiService.getPeriods().subscribe({
      next: (response) => {
        this.periodsSubject.next(response.data || []);
      },
      error: (error) => {
        console.error('Failed to load periods:', error);
      },
    });
  }

  /**
   * Get all periods
   */
  getPeriods(): Period[] {
    console.log('getPeriods:', this.periodsSubject.value);
    return this.periodsSubject.value;
  }

  /**
   * Create new period
   */
  createPeriod(data: CreatePeriodRequest): Observable<any> {
    return this.apiService.createPeriod(data).pipe(
      tap((response:any) => {
        // Add new period to the list
        const currentPeriods = this.periodsSubject.value;
        this.periodsSubject.next([response.data, ...currentPeriods]);
      }),
    );
  }

  /**
   * Get period by ID
   */
  getPeriodById(id: number): Period | undefined {
    return this.periodsSubject.value.find((p) => p.id === id);
  }

  /**
   * Calculate days until next period
   */
  daysUntilNextPeriod(nextPeriodDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = new Date(nextPeriodDate);
    nextDate.setHours(0, 0, 0, 0);
    const diff = nextDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate cycle length from two periods
   */
  calculateCycleLength(startDate: string, nextPeriodDate: string): number {
    const start = new Date(startDate);
    const next = new Date(nextPeriodDate);
    const diff = next.getTime() - start.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate period duration
   */
  calculatePeriodDuration(
    startDate: string,
    endDate?: string,
  ): number | null {
    if (!endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day
  }


  /**
   * Get average period duration
   */
  getAveragePeriodDuration(): number {
    const periods = this.periodsSubject.value.filter((p) => p.endDate);
    if (periods.length === 0) return 5; // Default to 5 if no data

    let totalDays = 0;
    periods.forEach((period) => {
      const duration = this.calculatePeriodDuration(
        period.startDate,
        period.endDate,
      );
      if (duration) totalDays += duration;
    });

    return Math.round(totalDays / periods.length);
  }

  /**
   * Get upcoming reminders
   */
  getUpcomingReminders(): Period[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.periodsSubject.value
      .filter((p) => {
        const reminderDate = new Date(p.reminderDate);
        reminderDate.setHours(0, 0, 0, 0);
        return reminderDate >= today && !p.isNotified;
      })
      .sort((a, b) => {
        const dateA = new Date(a.reminderDate);
        const dateB = new Date(b.reminderDate);
        return dateA.getTime() - dateB.getTime();
      });
  }
}
