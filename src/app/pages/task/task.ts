import { Component, computed, OnInit, signal } from '@angular/core';
import { PeriodService } from '../../services/period.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Period } from '../../models';

@Component({
  selector: 'app-periods',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './task.html',
  styleUrl: './task.scss',
})
export class Task implements OnInit {
  periods = signal<Period[]>([]);
  sortedPeriods = computed(() => [...this.periods()].sort(
    (a, b) =>
      new Date(b.startDate).getTime() -
      new Date(a.startDate).getTime()
  ));
  periodForm: FormGroup;
  loading = signal(false);
  submitted = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(
    private periodService: PeriodService,
    private fb: FormBuilder,
  ) {
    this.periodForm = this.fb.group({
      startDate: ['', [Validators.required]],
      endDate: [''],
    });
  }

  ngOnInit(): void {
    this.periodService.periods$.subscribe((p) => this.periods.set(p));
    this.periodService.loadPeriods();
    console.log('this.periods():', this.periods())
  }
  get f() {
    return this.periodForm.controls;
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.periodForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.periodService.createPeriod(this.periodForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Period added successfully!');
        this.periodForm.reset();
        this.submitted.set(false);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Failed to add period. Please try again.',
        );
      },
    });
  }

  daysUntil(nextPeriodDate: string): string {
    const days = this.periodService.daysUntilNextPeriod(nextPeriodDate);
    return days > 0 ? `${days} days` : 'Completed';
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

  calculateDuration(startDate: string, endDate?: string): number | string {
    if (!endDate) return '-';
    const duration = this.periodService.calculatePeriodDuration(startDate, endDate);
    return duration ? `${duration} days` : '-';
  }
}

