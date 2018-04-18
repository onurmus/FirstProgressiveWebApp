'use strict';


function getNameFromSubscriptionID(subscription) {
    //var subscription_id = subscription.endpoint.split('gcm/send/')[1];
    var subscription_id = JSON.stringify(subscription);

    fetch('https://arnotificationsender20180418102257.azurewebsites.net/Notification/GetUserNameByGcm', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ GcmId : subscription_id})
    }).then(function(response) {
      console.log(response);
      response.json().then(function(data) {
        document.getElementById("userId").value =data;
        document.getElementById("userId").disabled = true;
      });
      return ;
    });

}


function saveSubscriptionID(subscription) {
    //var subscription_id = subscription.endpoint.split('gcm/send/')[1];
    var subscription_id = JSON.stringify(subscription);
    var user_id =document.getElementById("userId").value;

    if(user_id.trim() == ""){
      alert("Please Enter User Name!")
      return false;
    }else{
      user_id = JSON.stringify(user_id);
      fetch('https://arnotificationsender20180418102257.azurewebsites.net/Notification/AddNewNotifUser', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ GcmId : subscription_id, UserId: user_id })
      });""
      return  true;
    }
}

function deleteSubscriptionID(subscription) {
    //var subscription_id = subscription.endpoint.split('gcm/send/')[1];
    var subscription_id = JSON.stringify(subscription);
    var user_id = JSON.stringify(document.getElementById("userId").value);
    fetch('https://arnotificationsender20180418102257.azurewebsites.net/Notification/DeleteNotifUser', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ GcmId : subscription_id, UserId: user_id })
    });
}


//const applicationServerPublicKey = 'BLGg-EIIY1ul2aZInvDoSwTteSBXvfvJCDXjcDXwYiM-pcQqpigRIVLvtadb5YPbBSFnMzxr4rwKjCAyxbvaD30';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

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

function updateBtn() {
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = 'Do not send Notifications';
  } else {
    pushButton.textContent = 'Send me cute Notifications';
  }

  pushButton.disabled = false;
}

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server

  const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionDetails =
    document.querySelector('.js-subscription-details');

  if (subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription);
    subscriptionDetails.classList.remove('is-invisible');
  } else {
    subscriptionDetails.classList.add('is-invisible');
  }
}

function subscribeUser() {
  //const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true//,
    //applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');
    

    if(saveSubscriptionID(subscription) == true){

      //updateSubscriptionOnServer(subscription);

      isSubscribed = true;

      updateBtn();
    }else{
      unsubscribeUser();
    }

    
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      deleteSubscriptionID(subscription);
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    //updateSubscriptionOnServer(null);
    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}

function initializeUI() {
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    updateSubscriptionOnServer(subscription);

    

    if (isSubscribed) {
      console.log('User IS subscribed.');
      getNameFromSubscriptionID(subscription);
    } else {
      console.log('User is NOT subscribed.');
    }

    updateBtn();
  });
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.register('sw.js',{
    scope: '.' 
  })
  .then(function(swReg) {
    console.log('Service Worker is registered', swReg);

    swRegistration = swReg;
    initializeUI();
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');
  pushButton.textContent = 'Push Not Supported';
}
