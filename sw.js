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


var host =  "https://arnotificationsender20180418102257.azurewebsites.net"; ///"http://localhost:46678";
var NotificationTypes = {
  General:1,
  Image:2
}

var push;
var notifType;
var approveUrl;
var rejectUrl;

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


function saveUserResponse(subscription,actionId) {
    //var subscription_id = subscription.endpoint.split('gcm/send/')[1];
    var subscription_id = JSON.stringify(subscription);

    fetch(host+'/Notification/SavePushAnswer', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ GcmId : subscription_id, PushId : push.payload.PushId, ActionId:actionId})
    });

}


function getActionUrl(actionKey){

  var action1 = push.firstAction;
  var action2 = push.secondAction;


  if(action1.key == actionKey){
      return action1.resultUrl;

  }else if(action2.key == actionKey){

      return action2.resultUrl;
  }
}

function getActionId(actionKey){

  var action1 = push.firstAction;
  var action2 = push.secondAction;


  if(action1.key == actionKey){
      return action1.id;

  }else if(action2.key == actionKey){

      return action2.id;
  }
}

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  push = JSON.parse( event.data.text());
  var pushPayload = push.payload;
  var action1 = push.firstAction;
  var action2 = push.secondAction;
  var imageAction = push.imageAction;

  notifType = pushPayload.PushType;
  approveUrl = pushPayload.ApproveUrl;
  rejectUrl = pushPayload.RejectUrl;

  if(notifType == NotificationTypes.General){

      var actionArr = [];
      if(action1 != null && action1 != "null"){
        actionArr[0] = {"action": action1.key, "title": action1.title, "icon": action1.iconUrl }

        if(action2 != null && action2 != "null"){
          actionArr[1] = {"action": action2.key, "title": action2.title, "icon": action2.iconUrl }
        }

      }else{
          if(action2 != null && action2 != "null"){
            actionArr[0] = {"action": action2.key, "title": action2.title, "icon": action2.iconUrl }
          }
      }

      const title = 'Ar PWA';
      const options = {
        body: pushPayload.PushMessage,
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        },
        icon: 'images/track_and_field.png',
        badge: 'images/badge.png',
        actions: actionArr
      };

      event.waitUntil(self.registration.showNotification(title, options));

  }else if(notifType == NotificationTypes.Image){
      var imageUrl = pushPayload.ImageUrl;
      const title = 'Ar PWA';
      const options = {
        body: pushPayload.PushMessage,
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        },
        icon: 'images/track_and_field.png',
        image: imageAction.iconUrl
      };

      event.waitUntil(self.registration.showNotification(title, options));
  }
  
});

self.addEventListener('notificationclick', function(event) {


  if(notifType == NotificationTypes.General){
    console.log('[Service Worker] Notification click Received.');
    console.log('You select: ', event.action);

    self.registration.pushManager.getSubscription()
    .then(function(subscription) {
      if (subscription && event.action != null) {
        saveUserResponse (subscription, getActionId(event.action)); 
      }
    })
    .catch(function(error) {
      console.log('Error on save answer', error);
    })
    .then(function() {
      console.log('User answer is saved.');
    });


    

    event.notification.close();
    event.waitUntil(
      clients.openWindow(getActionUrl(event.action))
    );

  }else if(notifType == NotificationTypes.Image){
    console.log('[Service Worker] Notification click Received.');
    console.log('You select: ', event.action);


    self.registration.pushManager.getSubscription()
    .then(function(subscription) {
      if (subscription && event.action != null) {
        saveUserResponse (subscription, push.imageAction.id); 
      }
    })
    .catch(function(error) {
      console.log('Error on save answer', error);
    })
    .then(function() {
      console.log('User answer is saved.');
    });

    event.notification.close();
    event.waitUntil(
      clients.openWindow(push.imageAction.resultUrl)
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

self.addEventListener('install', event => {
  self.skipWaiting();
});