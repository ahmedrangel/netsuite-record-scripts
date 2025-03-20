<script lang="ts" setup>
import { $fetch } from 'ofetch';
import { load } from "cheerio";

const userEventScripts = ref();

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
  const { recordType, baseURL } = result[0].result!;
  if (!recordType) {
    return;
  }
  const html = await $fetch(`${baseURL}/app/common/scripting/scriptedrecord.nl?id=${recordType?.toUpperCase()}&e=T`);
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
});
</script>

<template>
  <div class="card">
    <p v-for="(ue, i) in userEventScripts" :key="i">
      <a :href="ue.url" target="_blank" rel="noopener noreferrer">{{ ue.name }}</a> by {{ ue.owner }}
    </p>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
