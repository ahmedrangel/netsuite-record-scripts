<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { getEditScriptURL } from "../utils/helpers";

const props = defineProps<{
  scripts: NetSuiteScript[];
  origin: string;
  search: string;
  tabId?: number;
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

const openingStates = ref<{ [x: string]: boolean }>({});

const openEdit = async (url: string) => {
  if (!props.tabId) return;
  openingStates.value[url] = true;
  const requestResult = await browser.scripting.executeScript({
    args: [url],
    target: { tabId: props.tabId },
    func: async (url: string) => {
      const response = await fetch(url).catch(() => null);
      if (!response) return null;
      return response.text();
    }
  });
  const scriptInfo = requestResult?.[0]?.result;
  if (!scriptInfo) return openingStates.value[url] = false;
  const scriptEditUrl = getEditScriptURL(scriptInfo);
  if (!scriptEditUrl) return openingStates.value[url] = false;
  await browser.tabs.create({ url: props.origin + scriptEditUrl });
  openingStates.value[url] = false;
};
</script>

<template>
  <TransitionGroup name="list">
    <template v-for="(s, i) in filteredScripts" :key="i">
      <div class="border-b border-gray-200 px-3 py-2 text-start bg-slate-50 hover:bg-lime-50 rounded">
        <div class="flex justify-between">
          <div class="text-start">
            <p class="text-base font-semibold flex items-center gap-2">
              <span class="hover:underline">
                <a :href="origin + s.url" target="_blank" rel="noopener noreferrer">{{ s.name }}</a>
              </span>
              <span v-if="s.url && s.type !== 'workflow'" class="text-gray-600 bg-lime-200 hover:bg-lime-300 p-0.5 rounded cursor-pointer text-xs font-medium ring-1 ring-lime-600" title="Open script editor" @click="openEdit(s.url)">
                <Icon v-if="openingStates[s.url]" icon="eos-icons:loading" height="16" />
                <Icon v-else icon="ph:pencil-bold" height="16" />
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
              <span v-if="s.version" class="inline-flex items-center rounded-md bg-lime-200 px-2 py-1 text-xs font-medium ring-1 ring-lime-500">API v{{ s.version }}</span>
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
  </TransitionGroup>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>