import { getQuery } from "ufo";

export default defineContentScript({
  matches: ["https://*.netsuite.com/*"],
  async main () {
    const improveEditorConfig = await storage.getItem("local:improveEditor");
    if (!window.location.href.includes("/edittextmediaitem.nl") || improveEditorConfig !== "true") return;

    const { id } = getQuery(window.location.href);
    if (!id) {
      window.close();
      return;
    }

    console.info("[NetSuite Record Scripts] Applying editor styles...");
    const applyEditorStyles = () => {
      const screenWidth = window.innerWidth;
      const adjustedWidth = screenWidth - 40;
      if (screenWidth < 1080) return;
      setTimeout(() => {
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

    applyEditorStyles();

    window.onresize = () => {
      applyEditorStyles();
    };

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
  }
});
