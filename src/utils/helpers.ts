import { load } from "cheerio";

export const getScripts = (html: string): NetSuiteScript[][] => {
  const $ = load(html);
  const userEvent = $("[id^=\"serverrow\"]").map((_, el): NetSuiteScript => {
    return {
      name: $(el).find("td:nth-child(2)").text(),
      url: $(el).find("td:nth-child(2) > a").attr("href"),
      owner: $(el).find("td:nth-child(3)").text(),
      ownerUrl: $(el).find("td:nth-child(3) > a").attr("href"),
      version: $(el).find("td:nth-child(4)").text(),
      status: $(el).find("td:nth-child(8) * input").attr("value"),
      functions: {
        beforeLoad: $(el).find("td:nth-child(10)").text(),
        beforeSubmit: $(el).find("td:nth-child(11)").text(),
        afterSubmit: $(el).find("td:nth-child(12)").text()
      }
    };
  }).get();

  const client = $("[id^=\"clientrow\"]").map((_, el): NetSuiteScript => {
    return {
      name: $(el).find("td:nth-child(2)").text(),
      url: $(el).find("td:nth-child(2) > a").attr("href"),
      owner: $(el).find("td:nth-child(3)").text(),
      ownerUrl: $(el).find("td:nth-child(3) > a").attr("href"),
      version: $(el).find("td:nth-child(4)").text(),
      status: $(el).find("td:nth-child(8) * input").attr("value"),
      functions: {
        pageInit: $(el).find("td:nth-child(10)").text(),
        saveRecord: $(el).find("td:nth-child(11)").text(),
        fieldChanged: $(el).find("td:nth-child(12)").text(),
        validateLine: $(el).find("td:nth-child(13)").text()
      }
    };
  }).get();

  const workflows = $("[id^=\"workflowsrow\"]").map((_, el): NetSuiteScript => {
    return {
      name: $(el).find("td:nth-child(1)").text(),
      url: $(el).find("td:nth-child(1) > a").attr("href"),
      owner: $(el).find("td:nth-child(7)").text(),
      ownerUrl: $(el).find("td:nth-child(7) > a").attr("href"),
      status: $(el).find("td:nth-child(8) * input").attr("value"),
      functions: {
        trigger: $(el).find("td:nth-child(9) * input").attr("value")?.replaceAll("-", "")
      }
    };
  }).get();
  return [userEvent, client, workflows];
};

export const getEditScriptURL = (html: string) => {
  const $ = load(html);
  const scriptOnClick = $("div[data-field-name='scriptfile'] a[onclick*='edittextmediaitem']")?.attr("onclick");
  if (!scriptOnClick) return;
  const scriptEditUrl = scriptOnClick.match(/nlOpenWindow\('([^']+)'/)?.[1];
  if (!scriptEditUrl) return;
  return scriptEditUrl;
}

export const handlePopup = async (tabId?: number, url?: string) => {
  if (!url || !tabId) {
    if (tabId) await browser.action.disable(tabId);
    return;
  }
  const hostname = new URL(url).hostname;
  if (!hostname.includes(".netsuite.com")) {
    await browser.action.disable(tabId);
    return;
  }
  await browser.action.enable(tabId);
  await browser.action.setPopup({ popup: "popup-ext.html" });
};