<script lang="ts" setup>
import { load } from "cheerio";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

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
      version: $(el).find('td:nth-child(4)').text(),
      status: $(el).find('td:nth-child(8) > span > div > input').attr('value'),
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
    <TabGroup>
      <TabList class="flex align-center justify-center gap-2">
        <template v-for="(tab, i) in tabs" :key="i">
          <Tab v-slot="{ selected }" class="w-full rounded overflow-hidden cursor-pointer border border-purple-300">
            <div class="flex align-center justify-center gap-2 px-2 py-1" :class="selected ? 'bg-purple-100' : 'bg-purple-50'">
              <span class="text-md font-semibold">{{ tab.name }}</span>
              <span class="px-1 rounded border font-semibold" :class="selected ? 'bg-lime-200 border-lime-600' : 'bg-lime-200 border-lime-500'">{{ tab.count }}</span>
            </div>
          </Tab>
        </template>
      </TabList>
      <TabPanels>
        <TabPanel>
          <template v-for="(ue, i) in userEventScripts" :key="i">
            <div class="border-b border-gray-200 py-2 text-start">
              <p class="text-lg font-semibold hover:underline">
                <a :href="ue.url" target="_blank" rel="noopener noreferrer">{{ ue.name }}</a>
              </p>
              <p>by {{ ue.owner }}</p>
              <ul class="list-disc ms-5">
                <li v-if="ue.beforeLoad">beforeLoad: <span class="font-semibold">{{ ue.beforeLoad }}</span></li>
                <li v-if="ue.beforeSubmit">beforeSubmit: <span class="font-semibold">{{ ue.beforeSubmit }}</span></li>
                <li v-if="ue.afterSubmit">afterSubmit: <span class="font-semibold">{{ ue.afterSubmit }}</span></li>
              </ul>
            </div>
          </template>
        </TabPanel>
        <TabPanel>
          <template v-for="(cs, i) in clientScripts" :key="i">
            <div class="border-b border-gray-200 py-2 text-start">
              <p class="text-lg font-semibold hover:underline">
                <a :href="cs.url" target="_blank" rel="noopener noreferrer">{{ cs.name }}</a>
              </p>
              <p>by {{ cs.owner }}</p>
            </div>
          </template>
        </TabPanel>
        <TabPanel>Content 3</TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
