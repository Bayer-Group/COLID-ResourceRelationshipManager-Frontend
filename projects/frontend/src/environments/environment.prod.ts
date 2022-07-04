export const environment = {
  production: true,
  environment: 'prod',
  resourceRelationshipManagerApi: "<injected via env variables / user secrets>",
  dmpUrl: "<injected via env variables / user secrets>",
  pidApi: "<injected via env variables / user secrets>",
  esApi: "<injected via env variables / user secrets>",
  icons: "<injected via env variables / user secrets>",
  allowAnonymous: false,
  adalConfig: {
    authority: "<injected via env variables / user secrets>",
    clientId: "<injected via env variables / user secrets>",
    redirectUri: "<injected via env variables / user secrets>",
    protectedResourceMap: {
      "<injected via env variables / user secrets>": ['x/Resource.Read.All'],
      "<injected via env variables / user secrets": ['x/Resource.ReadWrite', 'x/Resource.Read.All'],
      "<injected via env variables>": ['x/Resource.Search.All']
    },
    postLogoutRedirectUri: "<injected via env variables / user secrets>"
  },
  appSupportFeedBack: {
    mailToLink: 'mailTo:Product Data Marketplace and PID - Driving Data as an asset - Data Stream Open4All <x>',
    supportTicketLink: 'http://placeholder.url/'
  },
};
