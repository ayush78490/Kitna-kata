<script lang="ts">
  import { onMount } from 'svelte';
  import MetricsOverview from './MetricsOverview.svelte';
  import TimelineChart from './TimelineChart.svelte';
  import ResponseTimeChart from './ResponseTimeChart.svelte';
  import ActivityHeatmap from './ActivityHeatmap.svelte';
  import InterestRadar from './InterestRadar.svelte';
  import WordCloud from './WordCloud.svelte';
  import InterestScores from './InterestScores.svelte';
  import { chatStore } from '../stores.js';
  import { exportToPDF } from '../utils/pdfExport.js';

  let { chatData } = $props();

  let showExportModal = $state(false);
  let isExporting = $state(false);

  function handleNewAnalysis() {
    chatStore.set(null);
  }

  async function handleExportPDF() {
    isExporting = true;
    try {
      await exportToPDF(chatData);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      isExporting = false;
      showExportModal = false;
    }
  }

  function shareResults() {
    const shareData = {
      participants: chatData.participants.length,
      totalMessages: chatData.totalMessages,
      dateRange: `${chatData.dateRange.start} to ${chatData.dateRange.end}`,
      topInterest: Math.max(...Object.values(chatData.interestScores).map(s => s.overall))
    };
    
    const url = new URL(window.location.href);
    url.searchParams.set('shared', btoa(JSON.stringify(shareData)));
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      alert('Shareable link copied to clipboard!');
    });
  }
</script>

<div class="space-y-8">
  <!-- Header Actions -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Chat Analysis Results</h2>
      <p class="text-gray-600 dark:text-gray-300">
        {chatData.totalMessages} messages • {chatData.participants.length} participants • 
        {chatData.dateRange.start} to {chatData.dateRange.end}
      </p>
    </div>
    
    <div class="flex gap-3">
      <button
        onclick={shareResults}
        class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
        </svg>
        Share
      </button>
      
      <button
        onclick={() => showExportModal = true}
        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        Export PDF
      </button>
      
      <button
        onclick={handleNewAnalysis}
        class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
      >
        New Analysis
      </button>
    </div>
  </div>

  <!-- Metrics Overview -->
  <MetricsOverview {chatData} />

  <!-- Interest Scores -->
  <InterestScores {chatData} />

  <!-- Charts Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <TimelineChart {chatData} />
    <ResponseTimeChart {chatData} />
    <ActivityHeatmap {chatData} />
    <InterestRadar {chatData} />
  </div>

  <!-- Word Cloud -->
  <WordCloud {chatData} />
</div>

<!-- Export Modal -->
{#if showExportModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export PDF Report</h3>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Generate a comprehensive PDF report with all your chat analysis results.
      </p>
      
      <div class="flex gap-3 justify-end">
        <button
          onclick={() => showExportModal = false}
          class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          disabled={isExporting}
        >
          Cancel
        </button>
        <button
          onclick={handleExportPDF}
          disabled={isExporting}
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {#if isExporting}
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          {/if}
          {isExporting ? 'Generating...' : 'Export PDF'}
        </button>
      </div>
    </div>
  </div>
{/if}
