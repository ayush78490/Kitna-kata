<script lang="ts">
  let { chatData } = $props();

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function getActivityLevel(day, hour) {
    const key = `${day}-${hour}`;
    const activity = chatData.activityHeatmap[key] || 0;
    const maxActivity = Math.max(...Object.values(chatData.activityHeatmap));
    return maxActivity > 0 ? (activity / maxActivity) * 100 : 0;
  }

  function getHeatmapColor(level) {
    if (level === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (level < 25) return 'bg-blue-200 dark:bg-blue-900';
    if (level < 50) return 'bg-blue-400 dark:bg-blue-700';
    if (level < 75) return 'bg-blue-600 dark:bg-blue-500';
    return 'bg-blue-800 dark:bg-blue-300';
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Heatmap</h3>
  
  <div class="overflow-x-auto">
    <div class="grid grid-cols-25 gap-1 min-w-max">
      <!-- Header row with hours -->
      <div></div>
      {#each hours as hour}
        <div class="text-xs text-gray-500 dark:text-gray-400 text-center p-1">
          {hour.toString().padStart(2, '0')}
        </div>
      {/each}
      
      <!-- Data rows -->
      {#each days as day, dayIndex}
        <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center p-1">
          {day}
        </div>
        {#each hours as hour}
          <div
            class="w-4 h-4 rounded-sm {getHeatmapColor(getActivityLevel(dayIndex, hour))}"
            title="{day} {hour}:00 - {Math.round(getActivityLevel(dayIndex, hour))}% activity"
          ></div>
        {/each}
      {/each}
    </div>
  </div>
  
  <div class="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
    <span>Less active</span>
    <div class="flex gap-1">
      <div class="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
      <div class="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-900"></div>
      <div class="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-700"></div>
      <div class="w-3 h-3 rounded-sm bg-blue-600 dark:bg-blue-500"></div>
      <div class="w-3 h-3 rounded-sm bg-blue-800 dark:bg-blue-300"></div>
    </div>
    <span>More active</span>
  </div>
</div>

<style>
  .grid-cols-25 {
    grid-template-columns: repeat(25, minmax(0, 1fr));
  }
</style>
