declare global {
  interface Window {
    angularComponentRef: any;
    ngZone: any;
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import Chart from 'chart.js/auto';
import { DialogModule } from 'primeng/dialog'; // PrimeNG import
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // nodig voor Dialog

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DialogModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'donut-modal-demo';
  showDialog = false;
  dialogData: string = '';
  chart: any;

  constructor(private ngZone: NgZone) { }

  ngOnInit(): void {
    window['angularComponentRef'] = this;
    window['ngZone'] = this.ngZone;

    const canvas = document.getElementById('donutChart') as HTMLCanvasElement;

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Rood', 'Blauw', 'Geel'],
        datasets: [{
          data: [120, 150, 90],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
      },
      options: {
        plugins: {
          tooltip: {
            enabled: false,
            external: (context: any) => {
              const tooltipModel = context.tooltip;
              const tooltipEl = document.getElementById('chartjs-tooltip') as HTMLElement;

              // Tooltip DOM nog niet klaar?
              if (!tooltipEl) return;

              // Verberg alleen als NIET op chart en NIET op tooltip
              if (tooltipModel.opacity === 0) {
                // Laat 'm staan, we verbergen later handmatig
                return;
              }

              const label = tooltipModel.dataPoints?.[0]?.label || '';
              const value = tooltipModel.dataPoints?.[0]?.formattedValue || '';

              tooltipEl.innerHTML = `
                <div>
                  <strong>${label}</strong>: ${value}<br/>
                  <a href="#" id="tooltip-link">Bekijk details</a>
                </div>
              `;

              const chartCanvas = context.chart.canvas.getBoundingClientRect();
              tooltipEl.style.left = chartCanvas.left + window.scrollX + tooltipModel.caretX + 'px';
              tooltipEl.style.top = chartCanvas.top + window.scrollY + tooltipModel.caretY + 'px';
              tooltipEl.style.display = 'block';

              // Link klikbaar maken
              const link = document.getElementById('tooltip-link');
              if (link) {
                link.addEventListener('click', (event) => {
                  event.preventDefault();
                  window['ngZone'].run(() => {
                    window['angularComponentRef'].openDialog(label);
                  });
                });
              }
            }


          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    const chartCanvas = document.getElementById('donutChart');
    const tooltipEl = document.getElementById('chartjs-tooltip');

    if (chartCanvas && tooltipEl) {
      document.addEventListener('mousemove', (event) => {
        const target = event.target as HTMLElement;

        const isOnChart = chartCanvas.contains(target);
        const isOnTooltip = tooltipEl.contains(target);

        if (!isOnChart && !isOnTooltip) {
          tooltipEl.style.display = 'none';
        }
      });
    }
  }


  // dialogData: string = '';
  dialogNames: string[] = [];

  openDialog(label: string) {
    this.dialogData = label;

    // Simuleer verschillende lijsten per segment
    const nameMap: Record<string, string[]> = {
      'Rood': ['Annemarie', 'Bart', 'Carla'],
      'Blauw': ['Daan', 'Eva'],
      'Geel': ['Fleur', 'Gijs', 'Hugo']
    };

    this.dialogNames = nameMap[label] || [];
    this.showDialog = true;
  }
}
