import { load } from "cheerio";

export const getScripts = (html: string): NetSuiteScript[][] => {
  const $ = load(html);
  const userEvent = $("[id^=\"serverrow\"]").map((_, el): NetSuiteScript => ({
    type: "userevent",
    name: $(el).find("td:nth-child(2)").text(),
    url: $(el).find("td:nth-child(2) > a").attr("href"),
    owner: $(el).find("td:nth-child(3)").text(),
    ownerUrl: $(el).find("td:nth-child(3) > a").attr("href"),
    version: $(el).find("td:nth-child(4)").text(),
    status: $(el).find("td:nth-child(8) * input").attr("value"),
    deployed: $(el).find("td:nth-child(9) > span").attr("class")?.includes("checkbox_ck") ? true : false,
    functions: {
      beforeLoad: $(el).find("td:nth-child(10)").text(),
      beforeSubmit: $(el).find("td:nth-child(11)").text(),
      afterSubmit: $(el).find("td:nth-child(12)").text()
    }
  })).get();

  const client = $("[id^=\"clientrow\"]").map((_, el): NetSuiteScript => ({
    type: "client",
    name: $(el).find("td:nth-child(2)").text(),
    url: $(el).find("td:nth-child(2) > a").attr("href"),
    owner: $(el).find("td:nth-child(3)").text(),
    ownerUrl: $(el).find("td:nth-child(3) > a").attr("href"),
    version: $(el).find("td:nth-child(4)").text(),
    status: $(el).find("td:nth-child(8) * input").attr("value"),
    deployed: $(el).find("td:nth-child(9) > span").attr("class")?.includes("checkbox_ck") ? true : false,
    functions: {
      pageInit: $(el).find("td:nth-child(10)").text(),
      saveRecord: $(el).find("td:nth-child(11)").text(),
      fieldChanged: $(el).find("td:nth-child(12)").text(),
      validateLine: $(el).find("td:nth-child(13)").text()
    }
  })).get();

  const workflows = $("[id^=\"workflowsrow\"]").map((_, el): NetSuiteScript => ({
    type: "workflow",
    name: $(el).find("td:nth-child(1)").text(),
    url: $(el).find("td:nth-child(1) > a").attr("href"),
    owner: $(el).find("td:nth-child(7)").text(),
    ownerUrl: $(el).find("td:nth-child(7) > a").attr("href"),
    status: $(el).find("td:nth-child(8) * input").attr("value"),
    functions: {
      trigger: $(el).find("td:nth-child(9) * input").attr("value")?.replaceAll("-", "")
    }
  })).get();
  return [userEvent, client, workflows];
};

export const getEditScriptURL = (html: string) => {
  const $ = load(html);
  const scriptOnClick = $("div[data-field-name='scriptfile'] a[onclick*='edittextmediaitem']")?.attr("onclick");
  if (!scriptOnClick) return;
  const scriptEditUrl = scriptOnClick.match(/nlOpenWindow\('([^']+)'/)?.[1];
  if (!scriptEditUrl) return;
  return scriptEditUrl;
};

export const getCurrentTabId = async () => {
  const currentTab = await browser.tabs.query({ active: true, currentWindow: true });
  const tabActive = currentTab.find(tab => tab.active || null);
  return tabActive?.id;
};

export const handlePopup = async (tabId?: number) => {
  if (!tabId) return await browser.action.disable();

  const result = await browser.scripting.executeScript({
    target: { tabId: tabId },
    func: () => window.location.href
  }).catch(() => null);
  const url = result?.[0]?.result;

  if (!url) return await browser.action.disable();

  const hostname = new URL(url).hostname;
  if (!hostname.includes(".netsuite.com")) return await browser.action.disable();

  await browser.action.enable();
  await browser.action.setPopup({ popup: "popup-ext.html" });
};