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
  const editorUrl = props.origin + scriptEditUrl;
  await browser.scripting.executeScript({
    args: [editorUrl],
    target: { tabId: props.tabId },
    func: (url: string) => {
      const screenHeight = window.screen.height * 1;
      window.open(url, "popupWindow", `width=800,height=${screenHeight},scrollbars=yes,resizable=yes"`);
    }
  });
  openingStates.value[url] = false;
};
</script>

<template>
  <TransitionGroup name="list">
    <template v-for="s in filteredScripts" :key="`${s.type} ${s.name} ${s.owner}`">
      <div class="border-b border-gray-200 px-3 py-2 text-start bg-slate-50 hover:bg-lime-50 rounded">
        <div class="flex justify-between">
          <div class="text-start">
            <p class="text-base font-semibold flex items-center gap-1">
              <span class="hover:underline">
                <a :href="origin + s.url" target="_blank" rel="noopener noreferrer">{{ s.name }}</a>
              </span>
              <span v-if="s.url && s.type !== 'workflow'" class="text-gray-700 bg-lime-200 hover:bg-lime-300 p-0.5 rounded cursor-pointer text-xs font-medium ring-1 ring-lime-500 ring-inset" title="Open script editor" @click="openEdit(s.url)">
                <Icon v-if="openingStates[s.url]" icon="eos-icons:loading" height="16" />
                <Icon v-else icon="ph:note-pencil-bold" height="16" />
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
            <p class="text-sm font-semibold flex items-center gap-0.5">
              <span v-if="s.deployed === true" class="inline-flex items-center rounded-md bg-lime-200 px-1 py-1 text-xs font-medium ring-1 ring-lime-500 ring-inset" title="Deployed">
                <Icon icon="ph:check-bold" height="16" width="16" />
              </span>
              <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium ring-1 ring-slate-400 ring-inset" :title="s.status">{{ s.status }}</span>
              <span v-if="s.version" class="inline-flex items-center rounded-md bg-lime-200 px-2 py-1 text-xs font-medium ring-1 ring-lime-500 ring-inset" :title="`API v${s.version}`">API v{{ s.version }}</span>
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
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-active {
  position: absolute;
  width: 0%;
  left: 50%;
  top: 100%;
  transform: translateX(100%);
}
</style>