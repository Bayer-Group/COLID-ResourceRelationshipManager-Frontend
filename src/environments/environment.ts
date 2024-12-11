// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  environment: 'Local',
  baseUrl: 'bayer.com',
  versionNumber: '2.12',
  resourceRelationshipManagerApi: 'http://localhost:51830',
  pageSize: 10,
  dmpUrl: 'http://localhost:4300',
  colidApiUrl: 'http://localhost:51770/api/v3/',
  appDataApiUrl: 'http://localhost:51810/api/',
  dmpCoreApiUrl: 'http://localhost:51800/api/',
  loggingUrl: 'http://localhost:51800/api/log',
  icons: 'https://dataservices-icons.dev.colid.int.bayer.com/',
  allowAnonymous: true,
  adalConfig: {
    authority:
      'yourdomain.onmicrosoft.com',
    clientId: '<rrm service client id>',
    redirectUri: 'http://localhost:4305/logged-in',
    protectedResourceMap: {
      'https://localhost:44301': [
        '<rrm service client id>/Resource.Search.All',
      ],
    },
    postLogoutRedirectUri: 'http://localhost:4305',
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
