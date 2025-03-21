export {};

declare global {
  interface NetSuiteScript {
    name: string;
    url: string;
    owner: string;
    ownerUrl: string;
    version?: string;
    status?: string;
    functions: {
      [key: string]: string | undefined;
    };
  }
}