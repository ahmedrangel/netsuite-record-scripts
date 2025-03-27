export {};

declare global {
  interface NetSuiteScript {
    type: "userevent" | "client" | "workflow";
    name: string;
    url?: string;
    owner: string;
    ownerUrl?: string;
    version?: string;
    status?: string;
    functions: {
      [key: string]: string | undefined;
    };
  }
}