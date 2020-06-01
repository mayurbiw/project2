document.addEventListener('DOMContentLoaded',() => {

// storing a Disppay name on first time only
if (!localStorage.getItem('dname')){
  const dname =   prompt('Enter the dispay name');
  localStorage.setItem('dname', dname);
  document.querySelector('#displayname').innerHTML = dname;
}

// hidding create channel division
document.querySelector('.createChannel').style.display = 'none';

// hidding  a chat room division
document.querySelector('.chatRoom').style.display = 'none';

// hiding a user list division
document.querySelector('.users').style.display = 'none';

document.querySelector('.channelInfo').style.dispay = 'none';

// showing the create channel division as soon as user clicks on create button
document.querySelector('#createchannel').onclick = () => {

  document.querySelector('.chatRoom').style.display = 'none';
  document.querySelector('.users').style.display = 'none';
  document.querySelector('.channelInfo').style.display = 'none';
  document.querySelector('.createChannel').style.display = 'block';

}

document.querySelector('#cancel').onclick = () => {
  document.querySelector('.createChannel').style.display = 'none';
}

// setting display name in the screen
document.querySelector('#displayname').innerHTML = localStorage.getItem('dname');

document.querySelectorAll('.emoji').forEach(function(span){
  span.onclick = function(){
  emojicode = span.dataset.code.codePointAt(0);
  document.querySelector('#messagetext').value = document.querySelector('#messagetext').value + '&#' + emojicode;
};
});


// showing the messages when user clicks on the channel
document.querySelectorAll('.channel').forEach(function(button){
    button.onclick = function(){

      document.querySelector('#messagetext').value = ''
      document.querySelector('.createChannel').style.display = 'none';
      document.querySelector('.channelInfo').style.display = 'none';
      const name = button.innerHTML;

      const request = new XMLHttpRequest();
      request.open('POST','/showMessages');

      localStorage.setItem('channel', name);

      document.querySelector('#messages').innerHTML = ''
      document.querySelector('#usersList').innerHTML = ''

      request.onload = () => {
        const res = JSON.parse(request.responseText);
        console.log(res);
        // If the user exists in the channel
        if (res[0]!=0)  {
          document.querySelector('.chatRoom').style.display = 'block';
          document.querySelector('.users').style.display = 'block';
          document.querySelector('#channelnamelabel').innerHTML = name;
          console.log(res);

          messages = res[0]
          users = res[1]

          // list of users in the channel
          console.log(users)

          for(var k in messages) {

          //creating a list eleemnts and appending it into the list of messages
          const usernameandts = document.createElement('li');
          usernameandts.style.color = '#a2a3a2'
          usernameandts.innerHTML = messages[k]["useranme"] + " " + messages[k]["ts"];
          usernameandts.style.marginTop = '2%';

          const text = document.createElement('li');
          text.innerHTML = messages[k]["text"];

          document.querySelector('#messages').append(usernameandts);
          document.querySelector('#messages').append(text);
        }

        document.querySelector("#totalUsers").innerHTML = "users : " +users.length;

        for(var u in users){
          const user = document.createElement('li');
          user.innerHTML = users[u]
          document.querySelector('#usersList').append(user);
        }
      }

      else {

        // debugging
        //console.log(res);

        // setting createuser_channelname and createuser_username for adding a new user
        document.querySelector('#createuser_channelname').value = localStorage.getItem('channel');
        document.querySelector('#createuser_username').value = localStorage.getItem('dname')

        document.querySelector('.channelInfo').style.display = 'block';
        document.querySelector('.chatRoom').style.display = 'none';
        document.querySelector('.users').style.display = 'none';

      }

    }
      const data = new FormData();
      console.log(localStorage.getItem('channel'))
;      data.append('channel',localStorage.getItem('channel'));
      data.append('user',localStorage.getItem('dname'));
      request.send(data);
    };
});

document.querySelector('#create').disabled = true;
document.querySelector('#channelname').onkeyup = () => {
      document.querySelector('#create').disabled = true;
      checkAvailability(document.querySelector('#channelname').value);
};

if (localStorage.getItem("channel")){
    name =  localStorage.getItem("channel")
    fetchChanneldata(name)
}

// Connect to web socket
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

socket.on('connect',() => {
document.querySelector('#send').onclick = () => {
    const messageText = document.querySelector('#messagetext').value;
    console.log(messageText);
    const user  = localStorage.getItem('dname');
    const channel = localStorage.getItem("channel");
    socket.emit('messageSent', {'messageText': messageText,"user":user,"channel":channel});
    console.log('message sent');
}
});

socket.on('addNewMessage', data => {
        console.log(data["text"] + data["username"] + data["channel"] + data["ts"]);

        //creating a list eleemnts and appending it into the list of messages
        const usernameandts = document.createElement('li');
        usernameandts.style.color = '#a2a3a2'
        usernameandts.innerHTML = data["username"] + " " + data["ts"];
        usernameandts.style.marginTop = '2%';

        const text = document.createElement('li');
        text.innerHTML = data["text"];

        document.querySelector('#messages').append(usernameandts);
        document.querySelector('#messages').append(text);
        document.querySelector('#messagetext').value = ''

     });
});

function fetchChanneldata(name){
document.querySelector('.createChannel').style.display = 'none';
  const request = new XMLHttpRequest();
  request.open('POST','/showMessages');
  request.onload = () => {
    const res = JSON.parse(request.responseText);

    if (res[0]!=0){
      document.querySelector('.chatRoom').style.display = 'block';
      document.querySelector('.users').style.display = 'block';
      document.querySelector('#channelnamelabel').innerHTML = name;
      console.log(res);

      messages = res[0]
      users = res[1]

      // list of users in the channel
      console.log(users)

      for(var k in messages) {

      //creating a list eleemnts and appending it into the list of messages
      const usernameandts = document.createElement('li');
      usernameandts.style.color = '#a2a3a2'
      usernameandts.innerHTML = messages[k]["useranme"] + " " + messages[k]["ts"];
      usernameandts.style.marginTop = '2%';

      const text = document.createElement('li');
      text.innerHTML = messages[k]["text"];

      document.querySelector('#messages').append(usernameandts);
      document.querySelector('#messages').append(text);
    }

      document.querySelector("#totalUsers").innerHTML = "users : " + users.length;

      for(var u in users){
        const user = document.createElement('li');
        user.innerHTML = users[u]
        document.querySelector('#usersList').append(user);
      }

    }

    else {

      // setting createuser_channelname and createuser_username for adding a new user
      document.querySelector('#createuser_channelname').value = localStorage.getItem('channel');
      document.querySelector('#createuser_username').value = localStorage.getItem('dname')
    }

}
  const data = new FormData();
  data.append('channel',name);
  data.append('user',localStorage.getItem('dname'));
  request.send(data);

}



function checkAvailability(name) {

const request = new XMLHttpRequest();
request.open('POST','/checkAvailability');

request.onload = () => {

const data = JSON.parse(request.responseText);

if(data.success){
  document.querySelector('#alert').style.display = 'inline';
  document.querySelector('#create').disabled = true;
  }
else {
  document.querySelector('#alert').style.display = 'none';
  if (document.querySelector('#channelname').value.length > 0)
      document.querySelector('#create').disabled = false;
}
}

const data = new FormData();
data.append('channelname',name);
request.send(data);

}
