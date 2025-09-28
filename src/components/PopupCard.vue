<script lang="ts" setup>
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import { Icon } from "@iconify/vue";
import { getQuery, withQuery } from "ufo";
import { getCurrentTabId, getScripts, getSuitelet } from "../utils/helpers";
import ScriptPanel from "./ScriptPanel.vue";
import NetsuiteRecordScriptsIcon from "./NetsuiteRecordScriptsIcon.vue";

const tabId = ref<number>();
const loading = ref(false);
const fetched = ref(false);
const record = ref("");
const netsuiteOrigin = ref("");
const recType = ref<string | null>(null);

const userEventScripts = ref<NetSuiteScript[]>([]);
const clientScripts = ref<NetSuiteScript[]>([]);
const workflows = ref<NetSuiteScript[]>([]);
const suitelet = ref<NetSuiteScript>();
const isSuitelet = ref(false);
const searchInput = ref("");
const filterInput = useTemplateRef("filterInput");

onMounted(async () => {
  tabId.value = await getCurrentTabId();
  if (!tabId.value) return;
  const result = await browser.scripting.executeScript({
    target: { tabId: tabId.value },
    func: () => {
      const input = document.querySelector("#baserecordtype") as HTMLInputElement;
      return {
        recordType: input?.value || null,
        origin: window.location.origin || null,
        location: window.location.href || null
      };
    }
  });
  const { recordType, origin, location } = (result[0].result!);
  if (!origin) {
    fetched.value = true;
    return;
  }
  netsuiteOrigin.value = origin;
  isSuitelet.value = /scriptlet\.nl\?script=\d+&deploy=\d+/.test(location || "");
  if (isSuitelet.value) {
    loading.value = true;
    const scriptIdMatch = location?.match(/script=(\d+)&deploy=(\d+)/);
    if (scriptIdMatch && scriptIdMatch[1]) {
      const scriptId = parseInt(scriptIdMatch[1]);
      const suiteletURL = `${origin}/app/common/scripting/script.nl?id=${scriptId}&selectedtab=scriptdeployments`;
      const suiteletResult = await browser.scripting.executeScript({
        target: { tabId: tabId.value },
        args: [suiteletURL],
        func: async (suiteletURL: string) => {
          const response = await fetch(suiteletURL).catch(() => null);
          if (!response) return null;
          return response.text();
        }
      });
      const html = suiteletResult?.[0]?.result;
      if (!html) {
        loading.value = false;
        fetched.value = true;
        return;
      }
      suitelet.value = getSuitelet(html, { url: suiteletURL });
    }
    loading.value = false;
    fetched.value = true;
    return;
  }
  if (!recordType) {
    fetched.value = true;
    return;
  }
  recType.value = getQuery(location || "")?.rectype as string || null;
  record.value = recordType;
  loading.value = true;
  const requestResult = await browser.scripting.executeScript({
    target: { tabId: tabId.value },
    args: [recordType, origin],
    func: async (recordType: string, origin: string) => {
      const response = await fetch(`${origin}/app/common/scripting/scriptedrecord.nl?id=${recordType.toUpperCase()}&e=T`).catch(() => null);
      if (!response) return null;
      return response.text();
    }
  });
  loading.value = false;
  fetched.value = true;
  const html = requestResult?.[0]?.result;
  if (!html) return;
  const scripts = getScripts(html);
  [userEventScripts.value, clientScripts.value, workflows.value] = scripts;
});

const tabs = computed(() => [
  ...suitelet.value ? [{ name: "Suitelet" }] : [
    { name: "User Event", count: userEventScripts.value.length },
    { name: "Client", count: clientScripts.value.length },
    { name: "Workflow", count: workflows.value.length }
  ]
]);

watchEffect(() => {
  if (filterInput.value) {
    filterInput.value.focus();
  }
});
</script>

<template>
  <div class="card">
    <div class="px-1 py-1.5 text-lg font-semibold flex justify-between items-center">
      <span class="flex justify-start items-center gap-2">
        <NetsuiteRecordScriptsIcon height="30" />
        <span>NETSUITE RECORD SCRIPTS</span>
      </span>
      <span class="gh-icon">
        <a href="https://github.com/ahmedrangel/netsuite-record-scripts" target="_blank" rel="noopener noreferrer">
          <Icon icon="simple-icons:github" height="26" />
        </a>
      </span>
    </div>
    <div v-if="!record && !isSuitelet" class="flex justify-center items-center h-32 gap-2">
      <Icon icon="ph:newspaper-duotone" class="text-rose-500" height="32" />
      <span class="text-lg font-semibold">Not a record page</span>
    </div>
    <div v-else-if="loading">
      <div class="flex justify-center items-center h-32 gap-2">
        <Icon icon="eos-icons:loading" class="text-violet-600" height="32" />
        <span class="text-lg font-semibold">Loading...</span>
      </div>
    </div>
    <TabGroup v-else-if="fetched && !loading">
      <TabList class="flex align-center justify-center gap-1 pb-1">
        <template v-for="(tab, i) in tabs" :key="i">
          <Tab v-slot="{ selected }" class="w-full rounded overflow-hidden cursor-pointer border border-violet-900" @click="filterInput?.focus()">
            <div class="flex align-center justify-center gap-1 p-2" :class="selected ? 'bg-violet-500/30 hover:bg-violet-500/40' : 'bg-violet-900/70 hover:bg-violet-900/82'">
              <span class="text-md font-bold" :class="selected ? '' : 'text-slate-50'">{{ tab.name }}</span>
              <span v-if="!isSuitelet" class="px-1.5 rounded border font-bold bg-lime-200 border-lime-600">{{ tab.count || 0 }}</span>
            </div>
          </Tab>
        </template>
      </TabList>
      <div v-if="!isSuitelet" class="flex items-center justify-between mb-1">
        <div class="flex items-center bg-slate-50 p-1.5 outline-1 -outline-offset-1 outline-violet-900/70 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 w-full rounded-l">
          <input ref="filterInput"
                 v-model="searchInput"
                 type="text"
                 name="filter"
                 class="block min-w-0 grow pr-3 pl-1 text-xs text-gray-900 placeholder:text-gray-500 focus:outline-none"
                 placeholder="Type to filter..."
                 :disabled="!userEventScripts.length && !clientScripts.length && !workflows.length && fetched"
          >
          <div v-if="searchInput" class="grid shrink-0 grid-cols-1 focus-within:relative cursor-pointer" role="button" @click="searchInput = ''">
            <Icon icon="ph:x-circle-duotone" class="text-rose-600" height="15" width="20" />
          </div>
        </div>
        <div class="text-xs rounded-r">
          <a v-if="recType" :href="recType ? withQuery(`${netsuiteOrigin}/app/common/custom/custrecord.nl`, { id: recType, e: 'T' }) : ''" target="_blank" rel="noopener noreferrer" class="px-2 py-1.5 bg-violet-900/70 hover:bg-violet-900/82">
            <span class="text-slate-50 font-normal">{{ record }}</span>
          </a>
          <span v-else class="text-slate-50 px-2 py-1.5 bg-violet-900/70">{{ record }}</span>
        </div>
      </div>
      <div v-if="!userEventScripts.length && !clientScripts.length && !workflows.length && !suitelet && fetched" class="flex justify-center items-center h-32 gap-2">
        <Icon icon="ph:x-circle-duotone" class="text-rose-500" height="32" />
        <span class="text-lg font-semibold">No scripts found</span>
      </div>
      <div v-if="suitelet" class="panel flex flex-col gap-1">
        <ScriptPanel :scripts="[suitelet]" :origin="netsuiteOrigin" :search="searchInput" :tab-id="tabId" />
      </div>
      <TabPanels v-else class="relative overflow-hidden">
        <TabPanel v-for="(scripts, i) of [userEventScripts, clientScripts, workflows]" :key="i" class="panel flex flex-col gap-1">
          <ScriptPanel :scripts="scripts" :origin="netsuiteOrigin" :search="searchInput" :tab-id="tabId" />
        </TabPanel>
      </TabPanels>
    </TabGroup>
    <div class="py-2 text-xs">
      <span>by</span>
      <span>&nbsp;</span>
      <span class="hover:underline">
        <a href="https://github.com/ahmedrangel" target="_blank" rel="noopener noreferrer" class="hover:underline">Ahmed Rangel</a>
      </span>
    </div>
  </div>
</template>

