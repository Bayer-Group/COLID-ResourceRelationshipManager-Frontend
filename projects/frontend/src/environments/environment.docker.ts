export const environment = {
  production: false,
  environment: 'Docker',
  resourceRelationshipManagerApi: 'http://localhost:51830',
  dmpUrl: "http://localhost:4300/",
  pidApi: 'http://localhost:51770/api/v3/',
  esApi: "http://localhost:51800/api/",
  icons: 'https://dataservices-icons.dev.colid.int.bayer.com/',
  allowAnonymous: true,
  adalConfig: {
    authority: "<injected via env variables / user secrets>",
    clientId: "<injected via env variables / user secrets>",
    redirectUri: 'http://localhost:4305/logged-in',
    protectedResourceMap: {
      'http://localhost:51830': ['x/Resource.Read.All'],
      'http://localhost:51770': ['x/Resource.ReadWrite', 'x/Resource.Read.All'],
      'http://localhost:51800': ['x/Resource.Search.All']
    },
    postLogoutRedirectUri: 'http://localhost:4305/'
  },
  appSupportFeedBack: {
    mailToLink: 'mailTo:Product Data Marketplace and PID - Driving Data as an asset - Data Stream Open4All',
    supportTicketLink: 'http://placeholder.url/'
  },
};
