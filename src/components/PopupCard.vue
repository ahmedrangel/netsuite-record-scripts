<script lang="ts" setup>
import { load } from "cheerio";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import { Icon } from "@iconify/vue";
import ScriptPanel from "./ScriptPanel.vue";
import { getScripts } from "../utils/helpers";
import NetsuiteRecordScriptsIcon from "./NetsuiteRecordScriptsIcon.vue";

const loading = ref(false);
const fetched = ref(false);
const record = ref("");

const userEventScripts = ref<any[]>([]);
const clientScripts = ref<any[]>([]);
const workflows = ref<any[]>([]);

onMounted(async() => {
  const currentTab = await browser.tabs.query({ active: true, currentWindow: true });
  const tabId = currentTab[0].id || 0;
  const result = await browser.scripting.executeScript({
    target: { tabId },
    func: () => {
      const input = document.querySelector('#baserecordtype') as HTMLInputElement;
      return {
        recordType: input?.value || null,
        baseURL: window.location.origin || null,
      };
    },
  });
  const { recordType, baseURL } = (result[0].result!);
  if (!recordType || !baseURL) {
    fetched.value = true;
    return;
  }
  record.value = recordType;
  loading.value = true;
  const requestResult = await browser.scripting.executeScript({
    target: { tabId },
    args: [recordType, baseURL],
    func: async (recordType: string, baseURL: string) => {
      const response = await fetch(`${baseURL}/app/common/scripting/scriptedrecord.nl?id=${recordType.toUpperCase()}&e=T`).catch(() => null);
      if (!response) return null;
      return response.text();
    },
  });
  loading.value = false;
  fetched.value = true;
  const html = requestResult?.[0]?.result;
  if (!html) return;
  const $ = load(html);
  const scripts = getScripts($, baseURL);
  [userEventScripts.value, clientScripts.value, workflows.value] = scripts;
});

const tabs = computed(() => [
  { name: 'User Event', count: userEventScripts.value.length },
  { name: 'Client', count: clientScripts.value.length },
  { name: 'Workflow', count: workflows.value.length },
]);
</script>

<template>
  <div class="card">
    <div class="px-1 py-2 text-lg font-semibold flex justify-between items-center">
      <span class="flex justify-start items-center gap-2">
        <NetsuiteRecordScriptsIcon height="32" />
        <span>NETSUITE RECORD SCRIPTS</span>
      </span>
      <span class="gh-icon">
        <a href="https://github.com/ahmedrangel/netsuite-record-scripts" target="_blank" rel="noopener noreferrer">
          <Icon icon="simple-icons:github" height="26" />
        </a>
      </span>
    </div>
    <div v-if="!record" class="flex justify-center items-center h-32 gap-2">
      <Icon icon="ph:newspaper-duotone" class="text-rose-500" height="32" />
      <span class="text-lg font-semibold">Not a record page</span>
    </div>
    <div v-else-if="!userEventScripts.length && !clientScripts.length && !workflows.length && fetched" class="flex justify-center items-center h-32 gap-2">
      <Icon icon="ph:x-circle-duotone" class="text-rose-500" height="32" />
      <span class="text-lg font-semibold">No scripts found</span>
    </div>
    <div v-else-if="loading">
      <div class="flex justify-center items-center h-32 gap-2">
        <Icon icon="eos-icons:loading" class="text-violet-600 animate-spin" height="32" />
        <span class="text-lg font-semibold">Loading...</span>
      </div>
    </div>
    <TabGroup v-else-if="fetched && !loading && (userEventScripts.length || clientScripts.length || workflows.length)">
      <TabList class="flex align-center justify-center gap-1 pb-2">
        <template v-for="(tab, i) in tabs" :key="i">
          <Tab v-slot="{ selected }" class="w-full rounded overflow-hidden cursor-pointer border border-violet-900">
            <div class="flex align-center justify-center gap-1 px-2 py-2" :class="selected ? 'bg-violet-500/30' : 'bg-violet-900/70'">
              <span class="text-md font-bold" :class="selected ? '' : 'text-slate-50'">{{ tab.name }}</span>
              <span class="px-1.5 rounded border font-bold bg-lime-200 border-lime-600">{{ tab.count }}</span>
            </div>
          </Tab>
        </template>
      </TabList>
      <TabPanels>
        <TabPanel class="panel flex flex-col gap-1">
          <ScriptPanel :scripts="userEventScripts" />
        </TabPanel>
        <TabPanel class="panel flex flex-col gap-1">
          <ScriptPanel :scripts="clientScripts" />
        </TabPanel>
        <TabPanel class="panel flex flex-col gap-1">
          <ScriptPanel :scripts="workflows" />
        </TabPanel>
      </TabPanels>
    </TabGroup>
    <div class="py-3 text-xs">
      <span>by</span>
      <span>&nbsp;</span>
      <span class="hover:underline">
        <a href="https://github.com/ahmedrangel" target="_blank" rel="noopener noreferrer" class="hover:underline">Ahmed Rangel</a>
      </span>
    </div>
  </div>
</template>

