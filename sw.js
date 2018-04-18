/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, serviceworker, es6 */

'use strict';

/* eslint-disable max-len */

//const applicationServerPublicKey = 'BLGg-EIIY1ul2aZInvDoSwTteSBXvfvJCDXjcDXwYiM-pcQqpigRIVLvtadb5YPbBSFnMzxr4rwKjCAyxbvaD30';

/* eslint-enable max-len */

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}



var notifType = "";
var approveUrl = "";
var rejectUrl = "";


self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  var pushPayload = JSON.parse( event.data.text());
  notifType = pushPayload.PushType;
  approveUrl = pushPayload.ApproveUrl;
  rejectUrl = pushPayload.RejectUrl;

  if(notifType == "General"){
      const title = 'Ar PWA';
      const options = {
        body: pushPayload.Message,
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        },
        icon: 'images/track_and_field.png',
        badge: 'images/badge.png',
        actions: [
           {"action": "yes", "title": "Yes", "icon": "images/yes.png" },
          { "action": "no", "title": "No", "icon": "images/no.png" }
        ]
      };

      event.waitUntil(self.registration.showNotification(title, options));

  }else if(notifType == "Rating"){
      const title = 'Ar PWA';
      const options = {
        body: pushPayload.Message,
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        },
        icon: 'images/track_and_field.png',
        image: 'images/5star.png'
      };

      event.waitUntil(self.registration.showNotification(title, options));
  }

  

  
});

self.addEventListener('notificationclick', function(event) {


  if(notifType == "General"){
    console.log('[Service Worker] Notification click Received.');
    console.log('You select: ', event.action);

    if(event.action == "yes"){
      event.notification.close();
      event.waitUntil(
        clients.openWindow(approveUrl)
      );

    }else if(event.action == "no"){
      event.notification.close();
      event.waitUntil(
        clients.openWindow(rejectUrl)
      );
    }

  }else if(notifType == "Rating"){
    console.log('[Service Worker] Notification click Received.');
    console.log('You select: ', event.action);
    event.notification.close();
    event.waitUntil(
      clients.openWindow(approveUrl)
    );
  }

  

  

 
});

/*
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[Service Worker]: \'pushsubscriptionchange\' event fired.');
  //const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(newSubscription) {
      // TODO: Send to application server
      console.log('[Service Worker] New subscription: ', newSubscription);
    })
  );
});

*/
self.addEventListener('fetch', function(event){

});