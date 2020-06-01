document.addEventListener('DOMContentLoaded',() => {
// storing a Display name on first time only
if (!localStorage.getItem('dname')){
  const dname =   prompt('Enter the dispay name');
  if (dname!=null){
    document.querySelector('.displaynameerror').style.display = 'none';
    localStorage.setItem('dname', dname);
    document.querySelector('#displayname').innerHTML = dname;
  }
  else {
    document.querySelector('.displaynameerror').style.display = 'block';
    document.querySelector('.createChannel').style.display = 'none';

  }
}


if(localStorage.getItem('dname')){

  document.querySelector('.displaynameerror').style.display = 'none';

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

  document.querySelector('#send').disabled = true;

  document.querySelector('#messagetext').onkeyup = () => {

  if (document.querySelector('#messagetext').value.length>0){

  document.querySelector('#send').disabled = false;

  }
  else{
    document.querySelector('#send').disabled = true;
  }

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
    document.querySelector('#send').disabled = false;
  };

  span.onmouseover = function(){
  span.style.cursor = 'pointer';
  };

  });
  // showing the messages when user clicks on the channel
  document.querySelectorAll('.channel').forEach(function(button){
        button.onclick = function()
                        {
                            name = button.innerHTML;
                            fetchChanneldata(name);
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

}

});

function fetchChanneldata(name){
  document.querySelector('.createChannel').style.display = 'none';
  document.querySelector('#messagetext').value = ''
  document.querySelector('.channelInfo').style.display = 'none';
  localStorage.setItem('channel', name);
  document.querySelector('#messages').innerHTML = ''
  document.querySelector('#usersList').innerHTML = ''
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
      document.querySelector('#channelheading').innerHTML = localStorage.getItem('channel');  
      document.querySelector('.channelInfo').style.display = 'block';
      document.querySelector('.chatRoom').style.display = 'none';
      document.querySelector('.users').style.display = 'none';
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
}}
const data = new FormData();
data.append('channelname',name);
request.send(data);
}
