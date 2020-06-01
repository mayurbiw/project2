import os
from datetime import datetime
from flask import Flask, render_template, jsonify, request, redirect
from flask_socketio import SocketIO, emit


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# class to represent message
class message:
    def __init__(self,username,channel,text):
        self.username = username
        self.channel = channel
        self.text = text
        self.ts = datetime.now()

# class to represent channel
class channel:
    def __init__(self,channelname):
        self.name = channelname
        self.messages = []
        self.users = []

    def addMessage(self,message):
        if len(self.messages) == 99:
          del self.messages[0]
        self.messages.append(message)

    def addUser(self,username):
      self.users.append(username)

    def totalUsers(self):
      return len(self.users)

    def isUserExists(self,username):
        if username in self.users:
            return True
        return False

# intial channels
c1 = channel('technology')
c2 = channel('football')
c3 = channel('managment')
c4 = channel('relationships')
c5 = channel('learning')
c6 = channel('creativity')
c7 = channel('video games')
c8 = channel('wwesmackdown')
c9 = channel('wweraw')
c10 = channel('wrestlemania')
c11 = channel('hockey')

c1.addUser("mayur")
c1.addUser("amit")
c1.addUser("john")


c2.addUser("Khan")
c2.addUser("rakhi")

# associating few messages with channel technology (c1) to better test the application
m1 = message(username = 'mayur', channel='technology',text='Hi everyone any good source to learn python')
m2 = message(username = 'mahesh', channel='technology',text='try to check out kaggle')

m3 = message(username = 'mayur', channel='technology',text='Oh whats that? Never heard of it')
m4 = message(username = 'mahesh', channel='technology',text='Kaggle is the home to data science')

m5 = message(username = 'mahesh', channel='technology',text='They have a great tutorial on python')
m6 = message(username = 'mahesh', channel='technology',text='It is made for people who already know one programming language')

m7 = message(username = 'mayur', channel='technology',text='Oh great just like me. Thanks Buddy !')
m8 = message(username = 'mahesh', channel='technology',text='Your welcome')



c1.addMessage(m1)
c1.addMessage(m2)
c1.addMessage(m3)
c1.addMessage(m4)
c1.addMessage(m5)
c1.addMessage(m6)
c1.addMessage(m7)
c1.addMessage(m8)

c2.addMessage(m1)
c2.addMessage(m2)

channelList = [c1,c2,c3,c4,c5,c6,c7,c8,c9,c10,c11]

@app.route("/")
def index():
    return render_template('index.html',channelList=channelList)

@app.route("/checkAvailability",methods=["POST"])
def checkAvailabilitfy():
    channelname = request.form.get("channelname")
    for ch in channelList:
        if ch.name == channelname:
            return jsonify({"success":True})
    return jsonify({"success":False})

@app.route("/createChannel",methods=["GET"])
def createChannel():
    channelName = request.args.get('channelname')
    chan = channel(channelName)
    channelList.append(chan)
    return redirect("/")

@app.route("/createUser",methods=["GET"])
def createUser():
    channelName = request.args.get('channelName')
    userName = request.args.get('userName')
    for c in channelList:
        if c.name == channelName:
            c.addUser(userName)
    return redirect("/")

@app.route("/showMessages",methods=["POST"])
def showMessages():
    # get the channel name
    channelname = request.form.get("channel")
    username = request.form.get("user")
    result = dict()
    for c in channelList:
        if c.name == channelname:
            if(c.isUserExists(username)==False):
                # flag to represent that user does not exits in the channel.
                result[0]=0
                return  jsonify(result)

    for c in channelList:
      messages = dict()
      if c.name == channelname:
          for i, m in enumerate(c.messages):
              msg = dict()
              msg["ts"] =  m.ts
              msg["useranme"] = m.username
              msg["text"] = m.text
              messages[i] = msg
          result[0] = messages

    for c in channelList:
        if c.name == channelname:
            result[1] = c.users

    return jsonify(result)
    return "channel not found"

@app.route("/showUsers",methods=["POST"])
def showUsers():
    channelname = request.form.get("channel")
    return channelname.users

@socketio.on("messageSent")
def sendMessage(data):
      res = dict()
      messageText = data["messageText"]
      print(messageText)
      user = data["user"]
      channel = data["channel"]
      newMessage = message(text=messageText, username=user, channel = channel )

      # adding new message into a channel
      for c in channelList:
          if c.name == channel:
              c.addMessage(newMessage)
              a = dict()
              a["text"] = newMessage.text
              a["username"] = newMessage.username
              a["channel"] = newMessage.channel
              a["ts"] = newMessage.ts
              emit("addNewMessage", {"text": newMessage.text,
                                    "username": newMessage.username,
                                    "channel": newMessage.channel,
                                    "ts": str(newMessage.ts)
                                    }, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
