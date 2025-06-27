<script lang="ts">
  import { onMount } from 'svelte';
  
  let { chatData } = $props();
  
  let chartContainer = $state();
  let chart;

  onMount(async () => {
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    const ctx = chartContainer.getContext('2d');
    
    const participants = Object.keys(chatData.interestScores);
    const colors = ['rgb(59, 130, 246)', 'rgb(239, 68, 68)', 'rgb(34, 197, 94)', 'rgb(251, 191, 36)'];
    
    const datasets = participants.map((participant, index) => ({
      label: participant,
      data: [
        chatData.interestScores[participant].responsiveness,
        chatData.interestScores[participant].initiation,
        chatData.interestScores[participant].effort,
        chatData.interestScores[participant].overall
      ],
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + '20',
      pointBackgroundColor: colors[index % colors.length],
      pointBorderColor: colors[index % colors.length],
      pointHoverBackgroundColor: colors[index % colors.length],
      pointHoverBorderColor: colors[index % colors.length]
    }));
    
    chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Responsiveness', 'Initiation', 'Effort', 'Overall'],
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Interest Comparison',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
          },
          legend: {
            labels: {
              color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
            },
            grid: {
              color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
            },
            angleLines: {
              color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
            },
            pointLabels: {
              color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
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
