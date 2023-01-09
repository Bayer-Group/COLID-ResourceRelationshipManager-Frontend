export const environment = {
  production: false,
  environment: 'Docker',
  versionNumber: '1.0',
  resourceRelationshipManagerApi: 'http://localhost:51830',
  pageSize: 10,
  dmpUrl: "http://localhost:4300",
  colidApiUrl: 'http://localhost:51770/api/v3',
  appDataApiUrl: 'http://localhost:51810/api/',
  dmpCoreApiUrl: 'http://localhost:51800/api/',
  loggingUrl: 'http://localhost:51800/api/log',
  icons: 'https://dataservices-icons.dev.colid.int.bayer.com/',
  allowAnonymous: true,
  adalConfig: {
    authority: "https://login.microsoftonline.com/fcb2b37b-5da0-466b-9b83-0014b67a7c78",
    clientId: '4798b327-d4d0-44f8-96c4-263ee30f1e92',
    redirectUri: 'http://localhost:4400/logged-in',
    protectedResourceMap: {
      'http://localhost:51830': ['3dffe4e2-02fa-4e72-884d-189770c6bd66/Resource.Read.All'],
      'http://localhost:51770': ['c4e574ef-810e-44a3-be08-17f59be1a845/Resource.ReadWrite', 'c4e574ef-810e-44a3-be08-17f59be1a845/Resource.Read.All'],
      'http://localhost:51800': ['7ba8ee68-418b-4f2d-b1eb-57cf1cba79ce/Resource.Search.All']
    },
    postLogoutRedirectUri: 'http://localhost:4400/'
  },
  rrmUrl: 'http://localhost:4305/',
  pidUrl: 'http://localhost:4200/',
  kgeUrl: 'https://kge.example.com/',
  appSupportFeedBack: {
    mailToLink: 'mailTo:Product Data Marketplace and PID - Driving Data as an asset - Data Stream Open4All <9a204e0a.bayergroup.onmicrosoft.com@emea.teams.ms>s',
    supportTicketLink: 'http://placeholder.url/'
  },
};
