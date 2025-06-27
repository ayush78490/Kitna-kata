<script lang="ts">
  import { onMount } from 'svelte';
  
  let { chatData } = $props();
  
  let chartContainer = $state();
  let chart;

  onMount(async () => {
    // Import Chart.js dynamically
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    const ctx = chartContainer.getContext('2d');
    
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chatData.timeline.map(d => d.date),
        datasets: [{
          label: 'Messages per Day',
          data: chatData.timeline.map(d => d.count),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Message Timeline',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
          },
          legend: {
            labels: {
              color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
            },
            grid: {
              color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
            }
          },
          y: {
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
            },
            grid: {
              color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
            }
          }
        }
      }
    });

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  });
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
  <div class="h-64">
    <canvas bind:this={chartContainer}></canvas>
  </div>
</div>
