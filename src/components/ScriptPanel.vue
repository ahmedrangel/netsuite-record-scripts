<script setup lang="ts">
const props = defineProps<{
  scripts: NetSuiteScript[];
  origin: string;
  search: string;
}>();

const filteredScripts = computed(() => {
  return props.scripts.filter(s => {
    const search = props.search.toLowerCase();
    return s.name.toLowerCase().includes(search) ||
      s.owner.toLowerCase().includes(search) ||
      s.status?.toLowerCase().includes(search) ||
      s.version?.toLowerCase().includes(search) ||
      Object.values(s.functions).some(f => f?.toLowerCase().includes(search));
  });
});
</script>

<template>
  <template v-for="(s, i) in filteredScripts" :key="i">
    <div class="border-b border-gray-200 px-3 py-2 text-start bg-slate-50 hover:bg-lime-50 rounded">
      <div class="flex justify-between">
        <div class="text-start">
          <p class="text-base font-semibold">
            <span class="hover:underline">
              <a :href="origin + s.url" target="_blank" rel="noopener noreferrer">{{ s.name }}</a>
            </span>
          </p>
          <p>
            <span>by&nbsp;</span>
            <span class="hover:underline">
              <a :href="origin + s.ownerUrl" target="_blank" rel="noopener noreferrer">{{ s.owner }}</a>
            </span>
          </p>
        </div>
        <div class="text-end">
          <p>
            <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium ring-1 ring-slate-400/100 ring-inset">{{ s.status }}</span>
            <span v-if="s.version">&nbsp;</span>
            <span v-if="s.version" class="inline-flex items-center rounded-md bg-lime-200 px-2 py-1 text-xs font-medium ring-1 ring-lime-500/100">API v{{ s.version }}</span>
          </p>
        </div>
      </div>
      <ul class="list-disc ps-5">
        <template v-for="(f, j) in s.functions" :key="j">
          <li v-if="f"> {{ j }}: <span class="font-semibold">{{ f }}</span></li>
        </template>
      </ul>
    </div>
  </template>
</template>