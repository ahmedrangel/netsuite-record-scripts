import type { CheerioAPI } from "cheerio";

export const getScripts = ($: CheerioAPI, baseURL: string): NetSuiteScript[][] => {
  const userEvent = $("[id^=\"serverrow\"]").map((_, el): NetSuiteScript => {
    return {
      name: $(el).find("td:nth-child(2)").text(),
      url: `${baseURL}${$(el).find("td:nth-child(2) > a").attr("href")}`,
      owner: $(el).find("td:nth-child(3)").text(),
      ownerUrl: `${baseURL}${$(el).find("td:nth-child(3) > a").attr("href")}`,
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
      url: `${baseURL}${$(el).find("td:nth-child(2) > a").attr("href")}`,
      owner: $(el).find("td:nth-child(3)").text(),
      ownerUrl: `${baseURL}${$(el).find("td:nth-child(3) > a").attr("href")}`,
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
      url: `${baseURL}${$(el).find("td:nth-child(1) > a").attr("href")}`,
      owner: $(el).find("td:nth-child(7)").text(),
      ownerUrl: `${baseURL}${$(el).find("td:nth-child(7) > a").attr("href")}`,
      status: $(el).find("td:nth-child(8) * input").attr("value"),
      functions: {
        trigger: $(el).find("td:nth-child(9) * input").attr("value")?.replaceAll("-", "")
      }
    };
  }).get();
  return [userEvent, client, workflows];
};