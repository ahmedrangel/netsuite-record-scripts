export {};

declare global {
  interface NetSuiteScript {
    type: "userevent" | "client" | "workflow" | "suitelet";
    name: string;
    url?: string;
    owner: string;
    ownerUrl?: string;
    version?: string;
    status?: string;
    deployed?: boolean;
    functions: {
      [key: string]: string | undefined;
    };
    deploys?: {
      name: string;
      url?: string;
      status?: string;
    }[];
  }

  interface NetSuiteRecordScriptsConfig {
    hideNotDeployed: boolean;
    improveEditor: boolean;
  }
}