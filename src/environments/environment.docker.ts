export const environment = {
  production: false,
  environment: 'Docker',
  baseUrl: 'bayer.com',
  versionNumber: '2.11',
  resourceRelationshipManagerApi: 'http://localhost:51830',
  pageSize: 10,
  dmpUrl: 'http://localhost:4300',
  colidApiUrl: 'http://localhost:51770/api/v3',
  appDataApiUrl: 'http://localhost:51810/api/',
  dmpCoreApiUrl: 'http://localhost:51800/api/',
  loggingUrl: 'http://localhost:51800/api/log',
  icons: 'https://dataservices-icons.dev.colid.int.bayer.com/',
  allowAnonymous: true,
  adalConfig: {
    authority:
      'yourdomain.onmicrosoft.com',
    clientId: '<rrm service client id>',
    redirectUri: 'http://localhost:4400/logged-in',
    protectedResourceMap: {
      'http://localhost:51830': [
        '<rrm service client id>/Resource.Read.All',
      ],
      'http://localhost:51770': [
        '<pid api service client id>/Resource.ReadWrite',
        '<pid api service client id>/Resource.Read.All',
      ],
      'http://localhost:51800': [
        '<search service client id>/Resource.Search.All',
      ],
    },
    postLogoutRedirectUri: 'http://localhost:4400/',
  },
  rrmUrl: 'http://localhost:4305/',
  pidUrl: 'http://localhost:4200/',
  kgeUrl: 'https://kge.example.com/',
  appSupportFeedBack: {
    mailToLink:
      'mailTo:Product Data Marketplace and PID - Driving Data as an asset - Data Stream Open4All <9a204e0a.bayergroup.onmicrosoft.com@emea.teams.ms>s',
    supportTicketLink: 'http://placeholder.url/',
  },
  deploymentInfoUrl:
    'https://info.dev.colid.int.bayer.com/current_deployment.json',
};
