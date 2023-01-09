// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  environment: 'Local',
  versionNumber: '1.0',
  resourceRelationshipManagerApi: 'https://localhost:44301',
  pageSize: 10,
  dmpUrl: "http://localhost:4300",
  colidApiUrl: 'http://localhost:51770/api/v3/',
  appDataApiUrl: 'http://localhost:51810/api/',
  dmpCoreApiUrl: 'http://localhost:51800/api/',
  loggingUrl: 'http://localhost:51800/api/log',
  icons: 'https://dataservices-icons.dev.colid.int.bayer.com/',
  allowAnonymous: true,
  adalConfig: {
    authority: "https://login.microsoftonline.com/fcb2b37b-5da0-466b-9b83-0014b67a7c78",
    clientId: '4798b327-d4d0-44f8-96c4-263ee30f1e92',
    redirectUri: 'http://localhost:4305/logged-in',
    protectedResourceMap: {
      'https://localhost:44301': ['3dffe4e2-02fa-4e72-884d-189770c6bd66/Resource.Search.All'],
    },
    postLogoutRedirectUri: 'http://localhost:4305'
  },
  rrmUrl: 'http://localhost:4305/',
  pidUrl: 'http://localhost:4200/',
  kgeUrl: 'https://kge.example.com/',
  appSupportFeedBack: {
    mailToLink: 'mailTo:Product Data Marketplace and PID - Driving Data as an asset - Data Stream Open4All <9a204e0a.bayergroup.onmicrosoft.com@emea.teams.ms>s',
    supportTicketLink: 'http://placeholder.url/'
  },

};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
