<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { defaultExtConfig, extConfig } from "@/utils/config";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [value: boolean];
}>();


watch(() => extConfig, async () => {
  for (const key in extConfig) {
    await storage.setItem(`local:${key}`, String(extConfig[key as keyof typeof extConfig]));
  }
}, { deep: true });

onMounted(async () => {
  for (const key in extConfig) {
    const storedValue = await storage.getItem(`local:${key}`);
    if (!storedValue) {
      extConfig[key as keyof typeof extConfig] = defaultExtConfig[key as keyof typeof extConfig];
    }
    else {
      extConfig[key as keyof typeof extConfig] = storedValue === "true";
    }
  }
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="text-start bg-white rounded shadow-lg w-11/12 max-w-md p-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Configuration</h2>
        <button title="Close" @click="emit('close', false)">
          <Icon icon="ph:x-bold" height="24" class="text-rose-700" />
        </button>
      </div>
      <hr class="my-2 text-gray-300">
      <h4 class="text-lg font-semibold mb-2">Scripts</h4>
      <div class="flex items-center gap-2">
        <input id="hideNotDeployed" v-model="extConfig.hideNotDeployed" type="checkbox" checked>
        <label for="hideNotDeployed" class="text-start">Hide not deployed</label>
      </div>
      <hr class="my-2 text-gray-300">
      <h4 class="text-lg font-semibold mb-2">Editor</h4>
      <div class="flex items-center gap-2">
        <input id="improveEditor" v-model="extConfig.improveEditor" type="checkbox" checked>
        <label for="improveEditor" class="text-start">Improve text editor</label>
      </div>
    </div>
  </div>
</template>