import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { UsageReport } from '@dspace/core/statistics/models/usage-report.model';

type ChartMode = 'bar' | 'line' | 'pie';

interface ChartDatum {
  label: string;
  value: number;
}

@Component({
  selector: 'ds-statistics-chart',
  templateUrl: './statistics-chart.component.html',
  styleUrls: ['./statistics-chart.component.scss'],
})
export class StatisticsChartComponent implements AfterViewInit, OnChanges {
  @Input() report: UsageReport;
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;

  mode: ChartMode = 'bar';
  private canvasReady = false;
  private readonly colors = ['#0b3d91', '#d93c72', '#00a7a0', '#f2b134', '#5e60ce', '#ef8354', '#3d8b37', '#7653a6'];

  ngAfterViewInit(): void {
    this.canvasReady = true;
    this.drawChart();
  }

  ngOnChanges(): void {
    if (this.canvasReady) {
      this.drawChart();
    }
  }

  setMode(mode: ChartMode): void {
    this.mode = mode;
    this.drawChart();
  }

  downloadPng(): void {
    const canvas = this.chartCanvas?.nativeElement;
    if (!canvas) {
      return;
    }
    const link = document.createElement('a');
    link.download = `${this.report.reportType || 'statistics'}-${this.mode}-chart.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  private get chartData(): ChartDatum[] {
    if (!this.report?.points?.length) {
      return [];
    }
    const header = Object.keys(this.report.points[0].values)[0];
    return this.report.points.map((point) => ({
      label: point.label,
      value: Number(point.values[header]) || 0,
    }));
  }

  private drawChart(): void {
    const canvas = this.chartCanvas?.nativeElement;
    const data = this.chartData;
    if (!canvas || !data.length) {
      return;
    }

    const cssWidth = Math.max(canvas.parentElement?.clientWidth || 720, 320);
    const cssHeight = 360;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = cssWidth * ratio;
    canvas.height = cssHeight * ratio;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.scale(ratio, ratio);
    context.clearRect(0, 0, cssWidth, cssHeight);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, cssWidth, cssHeight);

    if (this.mode === 'pie') {
      this.drawPieChart(context, data, cssWidth, cssHeight);
    } else {
      this.drawCartesianChart(context, data, cssWidth, cssHeight);
    }
  }

  private drawCartesianChart(context: CanvasRenderingContext2D, data: ChartDatum[], width: number, height: number): void {
    const padding = { top: 28, right: 24, bottom: 78, left: 56 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(...data.map(({ value }) => value), 1);
    context.font = '12px Arial, sans-serif';
    context.strokeStyle = '#d9e1ea';
    context.fillStyle = '#4a5568';

    for (let step = 0; step <= 4; step++) {
      const y = padding.top + (chartHeight / 4) * step;
      const value = Math.round(maxValue - (maxValue / 4) * step);
      context.beginPath();
      context.moveTo(padding.left, y);
      context.lineTo(width - padding.right, y);
      context.stroke();
      context.fillText(String(value), 8, y + 4);
    }

    const slotWidth = chartWidth / data.length;
    const points = data.map((datum, index) => ({
      x: padding.left + slotWidth * index + slotWidth / 2,
      y: padding.top + chartHeight - (datum.value / maxValue) * chartHeight,
      ...datum,
    }));

    if (this.mode === 'bar') {
      context.fillStyle = '#0b3d91';
      points.forEach(({ x, y, value }) => {
        const barWidth = Math.max(8, slotWidth * 0.62);
        context.fillRect(x - barWidth / 2, y, barWidth, padding.top + chartHeight - y);
        context.fillStyle = '#203040';
        context.textAlign = 'center';
        context.fillText(String(value), x, y - 7);
        context.fillStyle = '#0b3d91';
      });
    } else {
      context.strokeStyle = '#d93c72';
      context.lineWidth = 3;
      context.beginPath();
      points.forEach(({ x, y }, index) => index === 0 ? context.moveTo(x, y) : context.lineTo(x, y));
      context.stroke();
      points.forEach(({ x, y, value }) => {
        context.fillStyle = '#d93c72';
        context.beginPath();
        context.arc(x, y, 4, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#203040';
        context.textAlign = 'center';
        context.fillText(String(value), x, y - 9);
      });
    }

    context.fillStyle = '#4a5568';
    points.forEach(({ x, label }) => {
      context.save();
      context.translate(x, height - padding.bottom + 14);
      context.rotate(-Math.PI / 5);
      context.textAlign = 'right';
      context.fillText(this.truncate(label, 20), 0, 0);
      context.restore();
    });
  }

  private drawPieChart(context: CanvasRenderingContext2D, data: ChartDatum[], width: number, height: number): void {
    const total = data.reduce((sum, datum) => sum + datum.value, 0) || 1;
    const radius = Math.min(width * 0.22, height * 0.3);
    const centerX = width * 0.3;
    const centerY = height * 0.48;
    let angle = -Math.PI / 2;
    context.font = '12px Arial, sans-serif';

    data.forEach((datum, index) => {
      const slice = (datum.value / total) * Math.PI * 2;
      context.fillStyle = this.colors[index % this.colors.length];
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.arc(centerX, centerY, radius, angle, angle + slice);
      context.closePath();
      context.fill();
      angle += slice;
    });

    data.forEach((datum, index) => {
      const y = 38 + index * 28;
      context.fillStyle = this.colors[index % this.colors.length];
      context.fillRect(width * 0.61, y - 10, 12, 12);
      context.fillStyle = '#203040';
      context.textAlign = 'left';
      context.fillText(`${this.truncate(datum.label, 26)} (${datum.value})`, width * 0.61 + 19, y);
    });
  }

  private truncate(value: string, limit: number): string {
    return value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
  }
}
