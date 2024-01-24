import 'core-js/modules/es.promise';
import 'whatwg-fetch';
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://6d0e1c66725748388bc62e1825fe630f@sentry.2q4tas.com/54",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});

// serviceWorkerRegistration.register({
//   onUpdate: () => {
//     window.alert('New version available! Ready to update? onUpdate');
//     window.location.reload();
//   },
// });

// if (LOGROCKET_APP_ID) {
//   LogRocket.init(LOGROCKET_APP_ID, {
//     network: {
//       requestSanitizer: (request) => {
//         if (request.headers['Authorization']) {
//           request.headers['Authorization'] = '';
//         }
//
//         return request;
//       },
//     },
//   });
//   setupLogRocketReact(LogRocket);
// } else {
//   console.error('LogRocket app id not found')
// }
