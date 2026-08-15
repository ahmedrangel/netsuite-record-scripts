import pkg from "../../package.json" with { type: "json" };

export const APP = {
  name: pkg.title,
  description: pkg.description,
  version: pkg.version,
  repository: pkg.homepage,
  kofi: "https://ko-fi.com/ahmedrangel",
  webstore: {
    chrome: "https://chromewebstore.google.com/detail/netsuite-record-scripts/lcaieahkjgeggeiihblhcjbbjlppgieh"
  },
  author: {
    name: pkg.author.name,
    github: "https://github.com/ahmedrangel"
  }
};
