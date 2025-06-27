<script lang="ts">
  import { onMount } from 'svelte';
  
  let { chatData } = $props();
  
  let canvasContainer = $state();
  let canvas;

  onMount(() => {
    canvas = document.createElement('canvas');
    canvas.width = canvasContainer.offsetWidth;
    canvas.height = 300;
    canvasContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    // Simple word cloud implementation
    const words = chatData.wordFrequency.slice(0, 50);
    const maxCount = Math.max(...words.map(w => w.count));
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    words.forEach((word, index) => {
      const fontSize = Math.max(12, (word.count / maxCount) * 48);
      const x = Math.random() * (canvas.width - word.word.length * fontSize * 0.6);
      const y = Math.random() * (canvas.height - fontSize) + fontSize;
      
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = `hsl(${(index * 137.5) % 360}, 70%, 50%)`;
      ctx.fillText(word.word, x, y);
    });

    return () => {
      if (canvas && canvasContainer.contains(canvas)) {
        canvasContainer.removeChild(canvas);
      }
    };
  });
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Used Words</h3>
  
  <div bind:this={canvasContainer} class="w-full h-75 border border-gray-200 dark:border-gray-600 rounded"></div>
  
  <div class="mt-4 flex flex-wrap gap-2">
    {#each chatData.wordFrequency.slice(0, 20) as word}
      <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
        {word.word} ({word.count})
      </span>
    {/each}
  </div>
</div>
