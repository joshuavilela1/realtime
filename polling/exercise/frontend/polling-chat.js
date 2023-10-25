const chat = document.getElementById('chat');
const msgs = document.getElementById('msgs');

// let's store all current messages here
let allChat = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;
const BACKOFF = 5000;

// a submit listener on the form in the HTML
chat.addEventListener('submit', function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = '';
});

async function postNewMsg(user, text) {
  // post to /poll a new message
  // write code here
  const data = {
    user,
    text,
  };

  //request options
  const options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // send POST request
  await fetch('/poll', options);
}

// * Example of long polling / requestanimationframe(waiting for idle thread to run)
// async function getNewMsgs() {
//   poll the server
//   let json;
//   try {
//     const res = await fetch('/poll');
//     json = await res.json();
//   } catch (e) {
//   back off code would go here
//     console.error('polling error', e);
//   }

//   allChat = json.msg;
//   render();

//   let timeToMakeNextRequest = 0;
//   async function rafTimer(time) {
//     if (timeToMakeNextRequest <= time) {
//       await getNewMsgs();
//       timeToMakeNextRequest = time + INTERVAL;
//     }
//     requestAnimationFrame(rafTimer);
//   }

//   requestAnimationFrame(rafTimer);
// }

async function getNewMsgs() {
  try {
    const res = await fetch('/poll');
    const json = await res.json();

    if (res.status >= 400) {
      throw new Error('request did not succeed: ' + res.status);
    }

    allChat = json.msg;
    render();
    failedTries = 0;
  } catch (e) {
    //back off
    failedTries++;
  }
}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id),
  );
  msgs.innerHTML = html.join('\n');
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

// make the first request
getNewMsgs();
