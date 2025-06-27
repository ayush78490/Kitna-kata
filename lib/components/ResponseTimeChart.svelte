<script lang="ts">
  import { onMount } from 'svelte';
  
  let { chatData } = $props();
  
  let chartContainer = $state();
  let chart;

  onMount(async () => {
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    const ctx = chartContainer.getContext('2d');
    
    chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Instant (<5m)', 'Fast (<1h)', 'Slow (>3h)'],
        datasets: [{
          data: [
            chatData.responseTimeDistribution.instant,
            chatData.responseTimeDistribution.fast,
            chatData.responseTimeDistribution.slow
          ],
          backgroundColor: [
            'rgb(34, 197, 94)',
            'rgb(251, 191, 36)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Response Time Distribution',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
          },
          legend: {
            position: 'bottom',
            labels: {
              color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
              padding: 20
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
