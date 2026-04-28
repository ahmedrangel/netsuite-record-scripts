import { load } from "cheerio";
import { $fetch } from "ofetch";
import { getQuery, parseURL, withQuery } from "ufo";

export const getScripts = async (options: { origin: string, recordType: string }): Promise<NetSuiteScript[][]> => {
  const { origin, recordType } = options;
  const html = await $fetch(`${origin}/app/common/scripting/scriptedrecord.nl?id=${recordType.toUpperCase()}&e=T`, { responseType: "text" }).catch(() => null);
  if (!html) return [[], [], []];
  const $ = load(html);
  const userEvent = $("[id^=\"serverrow\"]").map((_, el): NetSuiteScript => ({
    type: "userevent",
    name: $(el).find("td:nth-child(2)").text()?.trim(),
    url: $(el).find("td:nth-child(2) > a").attr("href"),
    owner: $(el).find("td:nth-child(3)").text()?.trim(),
    ownerUrl: $(el).find("td:nth-child(3) > a").attr("href"),
    version: $(el).find("td:nth-child(4)").text()?.trim(),
    status: $(el).find("td:nth-child(8) * input").attr("value"),
    deployed: $(el).find("td:nth-child(9) > span").attr("class")?.includes("checkbox_ck") ? true : false,
    functions: {
      beforeLoad: $(el).find("td:nth-child(10)").text()?.trim(),
      beforeSubmit: $(el).find("td:nth-child(11)").text()?.trim(),
      afterSubmit: $(el).find("td:nth-child(12)").text()?.trim()
    }
  })).get();

  const client = $("[id^=\"clientrow\"]").map((_, el): NetSuiteScript => ({
    type: "client",
    name: $(el).find("td:nth-child(2)").text()?.trim(),
    url: $(el).find("td:nth-child(2) > a").attr("href"),
    owner: $(el).find("td:nth-child(3)").text()?.trim(),
    ownerUrl: $(el).find("td:nth-child(3) > a").attr("href"),
    version: $(el).find("td:nth-child(4)").text()?.trim(),
    status: $(el).find("td:nth-child(8) * input").attr("value"),
    deployed: $(el).find("td:nth-child(9) > span").attr("class")?.includes("checkbox_ck") ? true : false,
    functions: {
      pageInit: $(el).find("td:nth-child(10)").text()?.trim(),
      saveRecord: $(el).find("td:nth-child(11)").text()?.trim(),
      fieldChanged: $(el).find("td:nth-child(12)").text()?.trim(),
      validateLine: $(el).find("td:nth-child(13)").text()?.trim()
    }
  })).get();

  const workflows = $("[id^=\"workflowsrow\"]").map((_, el): NetSuiteScript => ({
    type: "workflow",
    name: $(el).find("td:nth-child(1)").text()?.trim(),
    url: $(el).find("td:nth-child(1) > a").attr("href"),
    owner: $(el).find("td:nth-child(7)").text()?.trim(),
    ownerUrl: $(el).find("td:nth-child(7) > a").attr("href"),
    status: $(el).find("td:nth-child(8) * input").attr("value"),
    functions: {
      trigger: $(el).find("td:nth-child(9) * input").attr("value")?.replaceAll("-", "")
    }
  })).get();
  return [userEvent, client, workflows];
};

export const getSuitelet = async (outerHTML: string, options: { origin: string, scriptURL: string }): Promise<NetSuiteScript | null> => {
  const html = await $fetch(`${options.origin}${options.scriptURL}&selectedtab=scriptdeployments`, { responseType: "text" }).catch(() => null);
  if (!html) return null;
  const $ = load(html);
  const isV2 = $("[data-field-name=\"defaultfunction_v2\"]").find("span[id=\"defaultfunction_v2_fs\"]").attr("class")?.includes("checkbox_read_ck");
  const isV1 = $("[data-field-name=\"defaultfunction\"]").length;
  const scriptModules = await getScriptModules(outerHTML, { origin: options.origin });
  return {
    type: "suitelet",
    name: $("[data-field-name=\"name\"] span[data-field-type=\"text\"]").text()?.trim(),
    url: options.scriptURL,
    owner: $("[data-field-name=\"owner\"] span[data-field-type=\"select\"]").find("a").text()?.trim(),
    ownerUrl: $("[data-field-name=\"owner\"] span[data-field-type=\"select\"]").find("a").attr("href"),
    version: $("[data-field-name=\"apiversion\"] span[data-field-type=\"select\"]").text()?.trim(),
    functions: {
      ...isV2 ? {
        onRequest: "onRequest"
      } : isV1 ? {
        onRequest: $("[data-field-name=\"defaultfunction\"] span[data-field-type=\"text\"]").text()?.trim()
      } : {}
    },
    deploys: $("[id^=\"deploymentsrow\"]").map((_, el) => ({
      name: $(el).find("td:nth-child(1)").text()?.trim(),
      url: $(el).find("td:nth-child(1) > a").attr("href"),
      status: $(el).find("td:nth-child(3)").text()?.trim()
    })).get(),
    scriptModules
  };
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
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).catch(() => null);
};

export const getFixedOrigin = (origin: string) => {
  // Fixes origin for extform URLs
  if (origin.includes("extforms.netsuite.com")) {
    return origin.replace("extforms.", "app.");
  }
  return origin;
};

const customization = {
  customrecord: "/app/common/custom/custrecord.nl",
  item: "/app/common/custom/itemcustfields.nl",
  entity: "/app/common/custom/entitycustfields.nl",
  transactions: "/app/common/custom/bodycustfields.nl",
  events: "/app/common/custom/eventcustfields.nl",
  other: "/app/common/custom/othercustfields.nl"
};

const customizationURLMapping = {
  "/app/common/entity": customization.entity,
  "/app/accounting/project": customization.entity,
  "/app/common/item": customization.item,
  "/app/accounting/transactions": customization.transactions,
  "/app/crm/sales": customization.other,
  "/app/crm/": customization.events,
  "/app/accounting/wms": customization.other
};

export const getCustomizationURL = (href: string, origin: string, recType?: string | null) => {
  if (href && recType) {
    return withQuery(`${origin}${customization.customrecord}`, { id: recType, e: "T" });
  }

  for (const [urlPattern, customizationPath] of Object.entries(customizationURLMapping)) {
    if (href.includes(urlPattern)) {
      return `${origin}${customizationPath}`;
    }
  }
};

export const getInlineSuitelets = async (html: string, options: { origin: string }): Promise<NetSuiteScript[]> => {
  const { origin } = options;
  if (!origin) return [];
  const $ = load(html);
  const inlineSuiteletsURL: string[] = [];
  const inlineSuitelets: NetSuiteScript[] = [];

  $("iframe[src*='/app/site/hosting/scriptlet.nl']").each((_, el) => {
    const src = $(el).attr("src");
    if (src) {
      const liveURL = src.startsWith(origin) ? src : `${origin}${src}`;
      const { script } = getQuery<{ script: string }>(liveURL);
      const suiteletURL = `/app/common/scripting/script.nl?id=${parseInt(script)}`;
      inlineSuiteletsURL.push(suiteletURL);
    }
  });

  const fetchSuiteletScripts = inlineSuiteletsURL.map(async (suiteletURL) => {
    const suitelet = await getSuitelet("", { origin, scriptURL: suiteletURL });
    if (!suitelet) return;
    inlineSuitelets.push({ ...suitelet, isInline: true });
  });

  await Promise.allSettled(fetchSuiteletScripts);

  return inlineSuitelets;
};

const normalizeModulePathKey = (host: string, path: string) => {
  path = path.startsWith("/") ? path.slice(1) : path;
  // Hostname can be used to differentiate between different NetSuite accounts, as the same script can have different URLs in different accounts
  return `scriptModule:${host}:${path.replaceAll("/", ":")}`;
};

export const getScriptModules = async (html: string, options: { origin: string }): Promise<{ name: string, url: string, editURL: string }[]> => {
  const tabId = await getCurrentTabId();
  if (!tabId) return [];
  const $ = load(html);
  const scriptModules: { name: string, url: string, editURL: string }[] = [];
  const oldScriptModules = $("script").map((_, el) => {
    const src = $(el).attr("src");
    if (src && src.includes("/core/media/media.nl?id=")) {
      return src;
    }
  }).get().reverse();
  const scriptModulesElement = $("script[data-requiremodule]").map((_, el) => $(el).attr("src")).get();
  for (const scriptModuleURL of [...oldScriptModules, ...scriptModulesElement]) {
    const { id, _xt, childPath } = getQuery<{ id?: string, _xt: string, childPath: string }>(scriptModuleURL);
    const { host } = parseURL(options.origin);

    const modulePath = `${childPath}${_xt}`;
    const key = normalizeModulePathKey(host!, id || modulePath);

    const cachedModule = await storage.getItem<{ name: string, url: string, editURL: string }>(`session:${key}`);
    if (cachedModule) {
      scriptModules.push(cachedModule);
      continue;
    }

    const result = await browser.scripting.executeScript({
      target: { tabId: tabId },
      world: "MAIN",
      args: [modulePath, id || null],
      func: async (modulePath, id) => {
        return await new Promise((resolve) => {
          if (!window?.require || typeof window?.require !== "function") {
            resolve(null);
            return;
          }
          const require = window.require as unknown as typeof define;
          // @ts-expect-error void return
          require(["N/search"], (search) => {
            try {
              let resolved = false;
              const resolveObject = (name: string, id: string) => ({
                name,
                url: `/app/common/media/mediaitem.nl?id=${id}`,
                editURL: `/app/common/record/edittextmediaitem.nl?id=${id}&e=T&l=T&target=filesize&syntaxHighlighting=T`
              });
              if (id) {
                const fileSearch = search.create({
                  type: "file",
                  filters: [
                    search.createFilter({ name: "internalid", operator: search.Operator.IS, values: id })
                  ],
                  columns: ["name", "internalid"]
                }).run().getRange({ start: 0, end: 1 });

                if (fileSearch?.length) {
                  const fileResultName = fileSearch[0].getValue({ name: "name" }) as string;
                  const fileResultId = fileSearch[0].getValue({ name: "internalid" }) as string;
                  resolve(resolveObject(fileResultName, fileResultId));
                  resolved = true;
                }
                return;
              }

              if (modulePath) {
                const parts = modulePath.split("/");
                if (!parts[0]) parts.shift();
                const fileName = parts.pop();
                const firstFolder = parts.pop();
                const filters = [];
                filters.push(search.createFilter({ name: "name", operator: search.Operator.IS, values: fileName }));

                if (firstFolder) {
                  filters.push(search.createFilter({
                    name: "formulatext",
                    operator: search.Operator.IS,
                    formula: "{folder}",
                    values: firstFolder
                  }));
                }

                const fileSearch = search.create({
                  type: "file",
                  filters,
                  columns: ["name", "internalid"]
                }).run().getRange({ start: 0, end: 1 });

                if (fileSearch?.length) {
                  const fileResultName = fileSearch[0].getValue({ name: "name" }) as string;
                  const fileResultId = fileSearch[0].getValue({ name: "internalid" }) as string;
                  resolve(resolveObject(fileResultName, fileResultId));
                  resolved = true;
                }
                if (!resolved) resolve(null);
                return;
              }
            }
            catch {
              resolve(null);
            }
          });
        });
      }
    });

    const moduleResult = result?.[0]?.result as { name: string, url: string, editURL: string } | null;
    if (!moduleResult) continue;
    scriptModules.push(moduleResult);
    await storage.setItem(`session:${key}`, moduleResult);
  }
  return scriptModules;
};
