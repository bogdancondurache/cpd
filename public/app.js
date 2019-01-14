var app = new Vue({
    el: '#app',

    data: {
        ws: new WebSocket('ws://' + window.location.host + '/ws?room=' +sessionStorage.getItem("roomId") ), // Our websocket
        newMsg: '', // Holds new messages to be sent to the server
        newRoom: '', // Holds new room to be sent to the server
        chatContent: '', // A running list of chat messages displayed on the screen
        chatRoom: [], // A running list of chat room displayed on the screen LE: now actually a list
        email: null, // Email address used for grabbing an avatar
        username: null, // Our username
        joined: "true" == sessionStorage.getItem("joined"), // True if email and username have been filled in
        inRoom: "true" == sessionStorage.getItem("inRoom") ,
        roomId:  -1,
    },
    created: function() {
         var listentoroom = function(id) {
            this.ws = new WebSocket('ws://' + window.location.host + '/ws?room=' + id);
             console.log(ws)

             this.ws.addEventListener('message', function(e) {
                 var msg = JSON.parse(e.data);
                 self.chatContent += '<div class="chip">'
                         + '<img src="' + self.gravatarURL(msg.user) + '">' // Avatar
                         + msg.user
                     + '</div>'
                     + emojione.toImage(msg.message) +  '<div style="text-color:gray;"> &nbsp;' +  msg.time  + '</div>' + '<br/>'; // Parse emojis

                 var element = document.getElementById('chat-messages');
                 element.scrollTop = element.scrollHeight; // Auto scroll to the bottom
             });
         };
        var self = this;

        var rid = sessionStorage.getItem("roomId")
        if (rid != null && rid != "")
            {
                listentoroom(rid);
            }

         if(sessionStorage.getItem("inRoom") != "true" & sessionStorage.getItem("joined") == "true") {
           var request = new XMLHttpRequest();

            // Open a new connection, using the GET request on the URL endpoint
            request.open('GET', 'http://localhost:8000/room', true);

            request.onload = function () {
                var data = JSON.parse(this.response);
                data.forEach(room => {
                    if (room.name != " ")
                    //THIS SHIT IS NOT WORKING
                    self.chatRoom.push({id: room.id, name: room.name});
                    //DADA AICI
                });
                var element = document.getElementById('chat-room');
                element.scrollTop = element.scrollHeight;
            }

            // Send request
            request.send();
        //Request for all the rooms
        } else if (sessionStorage.getItem("inRoom") == "true" & sessionStorage.getItem("joined") == "true"){
            var request = new XMLHttpRequest();

            // Open a new connection, using the GET request on the URL endpoint
            request.open('GET', 'http://localhost:8000/message?room=' + sessionStorage.getItem("roomId"), true);

            request.onload = function () {
                var data = JSON.parse(this.response);
                data.forEach(message => {

                    self.chatContent += '<div class="chip">'
                        + '<img src="' + self.gravatarURL(message.user) + '">' // Avatar
                        + message.user
                    + '</div>'
                    + emojione.toImage(message.message) + '<div style="text-color:gray;"> &nbsp;' +  message.time  + '</div>' + '<br/>'; // Parse emojis

                });
                var element = document.getElementById('chat-message');
                element.scrollTop = element.scrollHeight;
            }
            // Send request
            request.send();
        }

    },

    methods: {
        room: function (event) {
            console.log(event)
            // var i = 1;
            // this.inRoom = true;
            // this.roomId = i;
            // sessionStorage.setItem("inRoom", true);
            // sessionStorage.setItem("roomId", i);
            // listentoroom(i);
         },
        send: function () {
            if (this.newMsg != '') {
                var roomId = sessionStorage.getItem("roomId");
                this.ws.send(
                    JSON.stringify({
                        room:  parseInt(roomId),
                        user: sessionStorage.getItem("username"),
                        message: $('<p>').html(this.newMsg).text(), // Strip out html
                        time: Date()
                    }
                ));
                this.newMsg = ''; // Reset newMsg
            }
        },
        create: function () {

            if (this.newRoom != '') {
                var request = new XMLHttpRequest();

                // Open a new connection, using the GET request on the URL endpoint
                request.open('POST', 'http://localhost:8000/room?name='+this.newRoom, true);
                request.send();
                this.newRoom = ''; // Reset newMsg
                location.reload();
            }
        },

        join: function () {
            if (!this.email) {
                Materialize.toast('You must enter an email', 2000);
                return
            }
            if (!this.username) {
                Materialize.toast('You must choose a username', 2000);
                return
            }
            this.email = $('<p>').html(this.email).text();
            this.username = $('<p>').html(this.username).text();
            var request = new XMLHttpRequest();

            // Open a new connection, using the GET request on the URL endpoint
            request.open('GET', 'http://localhost:8000/login?username='+this.username + '&email=' + this.email, true);
            request.send();
            sessionStorage.setItem("joined", true)
            sessionStorage.setItem("username", this.username)
            this.joined = true;
            this.username;
            request.onload = function () {
                var data = JSON.parse(this.response);
                Materialize.toast(data.message, 2000);
            }
           location.reload()
        },

        gravatarURL: function(email) {
            return 'http://www.gravatar.com/avatar/' + CryptoJS.MD5(email);
        }
    }
});
