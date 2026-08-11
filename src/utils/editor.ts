import { getQuery } from "ufo";

const applyEditorStyles = () => {
  // Fix 2026.1 editor useless element
  const uselessElements = [
    document.querySelector("div.uir-text-area-wrapper.uir-resizable-element"),
    document.querySelector("div.uir-resizable-element-resizer")
  ];
  for (const uselessElement of uselessElements) {
    if (uselessElement) uselessElement.className = "";
  }
  const screenWidth = window.innerWidth;
  const adjustedWidth = screenWidth - 40;
  setTimeout(() => {
    const isRedwood = Boolean(document.querySelector("link[rel='stylesheet'][href*='redwood']"));
    if (isRedwood) {
      const tables = document.querySelectorAll("table");
      for (const table of tables) {
        const tableElement = table as HTMLElement;
        tableElement.style.padding = "0px";
      }
      const mCharData = document.querySelector("[data-field-name='mCharData']") as HTMLElement;
      if (mCharData) {
        mCharData.style.margin = "18px";
      }
    }
    const codeElement = document.querySelector("div[data-language='javascript']") as HTMLElement;
    if (codeElement) {
      codeElement.style.width = `${adjustedWidth}px`;
    }
    const mCharDataElement = document.getElementById("mCharData");
    if (mCharDataElement) {
      mCharDataElement.style.width = `${adjustedWidth}px`;
      mCharDataElement.style.whiteSpace = "nowrap";
    }
    const parentSpan = document.querySelector("span.uir-field.uir-resizable[data-nsps-type='field_input'][data-field-type='textarea']") as HTMLElement;
    if (parentSpan) {
      parentSpan.style.width = `${adjustedWidth}px`;
    }
    const parentData = document.getElementById("mCharData_fs");
    if (parentData) {
      const childrends = parentData.children;
      for (let i = 0; i < childrends.length; i++) {
        const child = childrends[i] as HTMLElement;
        child.style.width = `${adjustedWidth}px`;
      }
    }
  }, 100);
};

export const editorInject = async () => {
  const improveEditorConfig = await storage.getItem("local:improveEditor");
  if (!window.location.href.includes("/edittextmediaitem.nl") || improveEditorConfig !== "true") return;

  const { id } = getQuery(window.location.href);
  const errorPage = document.querySelector(".error-page");

  if (!id && !errorPage) {
    window.close();
    return;
  }

  console.info("[NetSuite Record Scripts] Applying editor styles...");

  applyEditorStyles();

  window.onresize = () => applyEditorStyles();

  const targetElement = document.getElementById("mCharData_fs");
  if (targetElement) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          applyEditorStyles();
        }
      }
    });
    observer.observe(targetElement, { childList: true, subtree: true });
  }
};