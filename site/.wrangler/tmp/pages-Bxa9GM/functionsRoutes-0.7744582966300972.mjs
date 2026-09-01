import { onRequestPost as __api_contact_js_onRequestPost } from "/home/user/git-clone-https-github.com-JonathanB555-bensaidavocats/site/functions/api/contact.js"
import { onRequestPost as __api_rapport_js_onRequestPost } from "/home/user/git-clone-https-github.com-JonathanB555-bensaidavocats/site/functions/api/rapport.js"

export const routes = [
    {
      routePath: "/api/contact",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_contact_js_onRequestPost],
    },
  {
      routePath: "/api/rapport",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_rapport_js_onRequestPost],
    },
  ]