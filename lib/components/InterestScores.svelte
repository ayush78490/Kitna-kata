<script lang="ts">
  let { chatData } = $props();

  function getScoreColor(score) {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }

  function getScoreBackground(score) {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  }

  function getProgressColor(score) {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
  <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Interest Level Analysis</h3>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each Object.entries(chatData.interestScores) as [participant, scores]}
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-medium text-gray-900 dark:text-white">{participant}</h4>
          <div class="flex items-center gap-2">
            <span class="text-2xl font-bold {getScoreColor(scores.overall)}">{scores.overall}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">/100</span>
          </div>
        </div>
        
        <div class="space-y-3">
          <!-- Overall Score -->
          <div class="p-3 rounded-lg {getScoreBackground(scores.overall)}">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Interest</span>
              <span class="text-sm {getScoreColor(scores.overall)}">{scores.overall}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div class="h-2 rounded-full {getProgressColor(scores.overall)}" style="width: {scores.overall}%"></div>
            </div>
          </div>

          <!-- Individual Metrics -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">Responsiveness</span>
              <span class="text-sm font-medium {getScoreColor(scores.responsiveness)}">{scores.responsiveness}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div class="h-1.5 rounded-full {getProgressColor(scores.responsiveness)}" style="width: {scores.responsiveness}%"></div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">Initiation</span>
              <span class="text-sm font-medium {getScoreColor(scores.initiation)}">{scores.initiation}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div class="h-1.5 rounded-full {getProgressColor(scores.initiation)}" style="width: {scores.initiation}%"></div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">Effort</span>
              <span class="text-sm font-medium {getScoreColor(scores.effort)}">{scores.effort}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div class="h-1.5 rounded-full {getProgressColor(scores.effort)}" style="width: {scores.effort}%"></div>
            </div>
          </div>
        </div>

        <!-- Explanation -->
        <div class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
          {scores.explanation}
        </div>
      </div>
    {/each}
  </div>
</div>
