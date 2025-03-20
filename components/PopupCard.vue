<script lang="ts" setup>
import { load } from "cheerio";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import { Icon } from "@iconify/vue";

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
  if (!recordType || !baseURL) return;
  const requestResult = await browser.scripting.executeScript({
    target: { tabId },
    args: [recordType, baseURL],
    func: async (recordType: string, baseURL: string) => {
      const response = await fetch(`${baseURL}/app/common/scripting/scriptedrecord.nl?id=${recordType.toUpperCase()}&e=T`)
      return response.text();
    },
  });
  const html = requestResult[0].result;
  if (!html) return;
  const $ = load(html);
  const userEventsElements = $('#server_splits > tbody > tr.uir-list-row-tr');
  userEventScripts.value = userEventsElements.map((_, el) => {
    return {
      name: $(el).find('td:nth-child(2)').text(),
      url: `${baseURL}${$(el).find('td:nth-child(2) > a').attr('href')}`,
      owner: $(el).find('td:nth-child(3)').text(),
      ownerUrl: `${baseURL}${$(el).find('td:nth-child(3) > a').attr('href')}`,
      version: $(el).find('td:nth-child(4)').text(),
      status: $(el).find('td:nth-child(8) > span > div > input').attr('value'),
      beforeLoad: $(el).find('td:nth-child(10)').text(),
      beforeSubmit: $(el).find('td:nth-child(11)').text(),
      afterSubmit: $(el).find('td:nth-child(12)').text(),
    }
  }).get();

  clientScripts.value = $('#client_splits > tbody > tr.uir-list-row-tr').map((_, el) => {
    return {
      name: $(el).find('td:nth-child(2)').text(),
      url: `${baseURL}${$(el).find('td:nth-child(2) > a').attr('href')}`,
      owner: $(el).find('td:nth-child(3)').text(),
      ownerUrl: `${baseURL}${$(el).find('td:nth-child(3) > a').attr('href')}`,
      version: $(el).find('td:nth-child(4)').text(),
      status: $(el).find('td:nth-child(8) > span > div > input').attr('value'),
      pageInit: $(el).find('td:nth-child(10)').text(),
      saveRecord: $(el).find('td:nth-child(11)').text(),
      fieldChanged: $(el).find('td:nth-child(12)').text(),
      validateLine: $(el).find('td:nth-child(13)').text(),
    }
  }).get();
});

const tabs = computed(() => [
  { name: 'User Event Scripts', count: userEventScripts.value.length },
  { name: 'Client Scripts', count: clientScripts.value.length },
  { name: 'Workflows', count: workflows.value.length },
]);
</script>

<template>
  <div class="card">
    <div class="px-1 py-2 text-lg font-semibold flex justify-between items-center">
      <span>NETSUITE RECORD SCRIPTS</span>
      <span class="gh-icon">
        <a href="https://github.com/ahmedrangel/netsuite-record-scripts" target="_blank" rel="noopener noreferrer">
          <Icon icon="simple-icons:github" height="22" />
        </a>
      </span>
    </div>
    <TabGroup>
      <TabList class="flex align-center justify-center gap-1 pb-2">
        <template v-for="(tab, i) in tabs" :key="i">
          <Tab v-slot="{ selected }" class="w-full rounded overflow-hidden cursor-pointer border border-fuchsia-300">
            <div class="flex align-center justify-center gap-1 px-2 py-1" :class="selected ? 'bg-fuchsia-100' : 'bg-fuchsia-50'">
              <span class="text-md font-semibold">{{ tab.name }}</span>
              <span class="px-1 rounded border font-semibold" :class="selected ? 'bg-lime-200 border-lime-600' : 'bg-lime-100 border-lime-500'">{{ tab.count }}</span>
            </div>
          </Tab>
        </template>
      </TabList>
      <TabPanels>
        <TabPanel class="panel flex flex-col gap-1">
          <template v-for="(ue, i) in userEventScripts" :key="i">
            <div class="border-b border-gray-200 p-1 text-start bg-white hover:bg-lime-50 rounded">
              <div class="flex justify-between">
                <div class="text-start">
                  <p class="text-base font-semibold">
                    <span class="hover:underline">
                      <a :href="ue.url" target="_blank" rel="noopener noreferrer">{{ ue.name }}</a>
                    </span>
                  </p>
                  <p class="mb-1">
                    <span>by&nbsp;</span>
                    <span class="hover:underline">
                      <a :href="ue.ownerUrl" target="_blank" rel="noopener noreferrer">{{ ue.owner }}</a>
                    </span>
                  </p>
                </div>
                <div class="text-end">
                  <p class="mb-1">
                    <span class="inline-flex items-center rounded-md bg-lime-200 px-2 py-1 text-xs font-medium ring-1 ring-lime-500/10 ring-inset">v{{ ue.version }}</span>
                    <span>&nbsp;</span>
                    <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium ring-1 ring-slate-500/10 ring-inset">{{ ue.status }}</span>
                  </p>
                </div>
              </div>
              <ul class="list-disc ps-5">
                <li v-if="ue.beforeLoad">beforeLoad: <span class="font-semibold">{{ ue.beforeLoad }}</span></li>
                <li v-if="ue.beforeSubmit">beforeSubmit: <span class="font-semibold">{{ ue.beforeSubmit }}</span></li>
                <li v-if="ue.afterSubmit">afterSubmit: <span class="font-semibold">{{ ue.afterSubmit }}</span></li>
              </ul>
            </div>
          </template>
        </TabPanel>
        <TabPanel class="panel flex flex-col gap-1">
          <template v-for="(cs, i) in clientScripts" :key="i">
            <div class="border-b border-gray-200 p-1 text-start bg-white hover:bg-lime-50 rounded">
              <div class="flex justify-between">
                <div class="text-start">
                  <p class="text-base font-semibold">
                    <span class="hover:underline">
                      <a :href="cs.url" target="_blank" rel="noopener noreferrer">{{ cs.name }}</a>
                    </span>
                  </p>
                  <p class="mb-1">
                    <span>by&nbsp;</span>
                    <span class="hover:underline">
                      <a :href="cs.ownerUrl" target="_blank" rel="noopener noreferrer">{{ cs.owner }}</a>
                    </span>
                  </p>
                </div>
                <div class="text-end">
                  <p class="mb-1">
                    <span class="inline-flex items-center rounded-md bg-lime-200 px-2 py-1 text-xs font-medium ring-1 ring-lime-500/10 ring-inset">v{{ cs.version }}</span>
                    <span>&nbsp;</span>
                    <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium ring-1 ring-slate-500/10 ring-inset">{{ cs.status }}</span>
                  </p>
                </div>
              </div>
              <ul class="list-disc ps-5">
                <li v-if="cs.pageInit">pageInit: <span class="font-semibold">{{ cs.pageInit }}</span></li>
                <li v-if="cs.saveRecord">saveRecord: <span class="font-semibold">{{ cs.saveRecord }}</span></li>
                <li v-if="cs.fieldChanged">fieldChanged: <span class="font-semibold">{{ cs.fieldChanged }}</span></li>
                <li v-if="cs.validateLine">validateLine: <span class="font-semibold">{{ cs.validateLine }}</span></li>
              </ul>
            </div>
          </template>
        </TabPanel>
        <TabPanel class="panel">Content 3</TabPanel>
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

