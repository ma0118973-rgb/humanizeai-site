import { onRequest as __api_gemini_ts_onRequest } from "/home/hatch/workspace/sitework/abi_src/functions/api/gemini.ts"

export const routes = [
    {
      routePath: "/api/gemini",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_gemini_ts_onRequest],
    },
  ]