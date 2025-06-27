<script lang="ts">
  let { chatData } = $props();

  let metrics = $derived([
    {
      label: 'Total Messages',
      value: chatData.totalMessages.toLocaleString(),
      icon: '💬',
      color: 'blue'
    },
    {
      label: 'Active Days',
      value: chatData.activeDays,
      icon: '📅',
      color: 'green'
    },
    {
      label: 'Avg Response Time',
      value: chatData.avgResponseTime,
      icon: '⏱️',
      color: 'yellow'
    },
    {
      label: 'Most Active Hour',
      value: `${chatData.peakHour}:00`,
      icon: '🕐',
      color: 'purple'
    },
    {
      label: 'Emoji Density',
      value: `${chatData.emojiDensity}%`,
      icon: '😊',
      color: 'pink'
    },
    {
      label: 'Questions Asked',
      value: chatData.totalQuestions,
      icon: '❓',
      color: 'indigo'
    }
  ]);

  function getColorClasses(color) {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800',
      indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
    };
    return colors[color] || colors.blue;
  }
</script>

<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
  {#each metrics as metric}
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="flex items-center justify-between mb-2">
        <span class="text-2xl">{metric.icon}</span>
        <div class="w-3 h-3 rounded-full {getColorClasses(metric.color)}"></div>
      </div>
      <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {metric.value}
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        {metric.label}
      </div>
    </div>
  {/each}
</div>
