import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodService } from '../../services/period.service';
import { Period } from '../../models';

interface ChartBar {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  color: string;
  label: string;
  labelX: number;
  labelY: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class ReportsComponent implements OnInit {
  periods = signal<Period[]>([]);
  sortedPeriods = computed(() => [...this.periods()].sort(
    (a, b) =>
      new Date(b.startDate).getTime() -
      new Date(a.startDate).getTime()
  ));
  bars = signal<ChartBar[]>([]);
  chartViewBox = signal('0 0 600 220');

  averagePeriodDuration = signal(0);
  totalTrackedPeriods = computed(() => this.periods().length);
  earliestPeriod = computed(() => {
    const p = this.periods();
    return p.length > 0 ? this.formatDate(p[p.length - 1].startDate) : 'N/A';
  });

  constructor(private periodService: PeriodService) { }

  ngOnInit(): void {
    this.periodService.periods$.subscribe((p) => {
      this.periods.set(p);
      this.buildChart();
    });
    this.periodService.loadPeriods();
    this.averagePeriodDuration.set(this.periodService.getAveragePeriodDuration());
  }

  private buildChart(): void {
    const p = this.sortedPeriods();
    console.log('p:', p)
    if (p.length < 2) {
      this.bars.set([]);
      return;
    }

    const cycles: Array<{ value: number; current: Date, next: Date }> = [];

    for (let i = 0; i < p.length; i++) {
      const cur = new Date(p[i].startDate);
      const next = new Date(p[i].endDate || p[i].nextPeriodDate);
      const diff = this.periodService.calculatePeriodDuration(p[i].startDate, p[i].endDate) || 28;
      // const diff = Math.abs(
      //   Math.round((cur.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)),
      // );
      cycles.push({ value: diff || 28, current: cur, next: next });
    }
    
    const max = Math.max(...cycles.map((c) => c.value), 30);
    const barWidth = 45;
    const barGap = 20;
    const chartHeight = 160;
    const chartWidth = cycles.length * (barWidth + barGap) + 80;

    this.chartViewBox.set(
      `0 0 ${Math.max(chartWidth, 600)} ${chartHeight + 80}`,
    );
    this.bars.set(
      cycles.map((cycle, i) => {
        const height = Math.round((cycle.value / max) * chartHeight);
        const x = 40 + i * (barWidth + barGap);
        const y = chartHeight - height + 20;
        const hue = 280 - i * 5;
        const color = `hsl(${hue}, 70%, 55%)`;
        const monthLabel = `${new Date(cycle.current).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        })} - ${new Date(cycle.next).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        })}`;

        return {
          x,
          y,
          width: barWidth,
          height,
          value: cycle.value,
          color,
          label: monthLabel,
          labelX: x + barWidth / 2,
          labelY: chartHeight + 45,
        };
      }),
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getPeriodDetails(): string[] {
    const p = this.periods();
    if (p.length === 0) return [];

    return p.map(
      (period) =>
        `${this.formatDate(period.startDate)} ${period.endDate ? `- ${this.formatDate(period.endDate)}` : '(ongoing)'}`,
    );
  }
}

