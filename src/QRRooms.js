class QRRooms {
    constructor(firebase, gameIntf, divElem, qrCode, controllerFile) {
        this.firebase = firebase;
        this.gameIntf = gameIntf;
        this.divElem = divElem;
        this.qrCode = qrCode;
        this.controllerFile = controllerFile;

        // Get a key for a new Room
        this.newRoomKey = firebase.database().ref().child('rooms').push().key;
    }

    start(){
		firebase.auth().onAuthStateChanged((user) => {
		  if (user) {
			// User is signed in.
			var isAnonymous = user.isAnonymous;
			this.uid = user.uid;
            this.firebase.database().ref('rooms/'+this.newRoomKey+'/owner').set(this.uid);
			this.firebase.database().ref('rooms/'+this.newRoomKey).onDisconnect().set(null);
            this.setupRoomRefs();
		  } else {
			// User is signed out.
		  }
		});

		firebase.auth().signInAnonymously().catch((error) => {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;

			if (errorCode === 'auth/operation-not-allowed') {
				alert('You must enable Anonymous auth in the Firebase Console.');
			} else {
				console.error(error);
			}
        });
    }

    setupRoomRefs(){
        this.userList = {};

        var roomDiv = document.createElement('div');
        var linkElem = document.createElement('a');
        var textElem = document.createElement('t');
        var qrDiv = document.createElement('div');

        this.hideDiv = document.createElement('a');
        this.hideDiv.innerHTML = "Hide";
        this.hideDiv.href = "#";//function(){ alert('click') };

        this.hidden = false;

        this.hideDiv.onclick = (evt) => {
            this.hidden = !this.hidden;
            roomDiv.style = this.hidden?"display:none":"display:block";
            this.hideDiv.innerHTML = this.hidden?"Show":"Hide";
            return false;
        }

        this.divElem.appendChild(roomDiv);
        this.divElem.appendChild(this.hideDiv);

        roomDiv.appendChild(linkElem);
        roomDiv.appendChild(qrDiv);

        linkElem.appendChild(textElem);

        var path = document.location.href.split("?")[0];
        var base = path.substr(0, path.lastIndexOf("/")+1);
        var url = base+this.controllerFile;
        var qrLink = url+"?room="+this.newRoomKey+"&";

        new this.qrCode(qrDiv, {text:qrLink, width:128, height:128});

        textElem.innerHTML = this.newRoomKey;
        linkElem.href = qrLink;

        var roomUserRef = firebase.database().ref()
                            .child('rooms/'+this.newRoomKey+'/users');

        roomUserRef.on('child_added', (data) => {
          this.addUser(data.key, data.key);
        });

        roomUserRef.on('child_changed', (data) => {
          this.updateUser(data.key, data.key);
        });

        roomUserRef.on('child_removed', (data) => {
          this.removeUser(data.key);
        });
    }

	addUser(key, name){
	  this.userList[key] = {name:name};
	  this.gameIntf.addPlayer(key);

	  var userInputRef = this.firebase.database().ref()
                         .child('rooms/'+this.newRoomKey+'/users/'+key+"/input");
	  var inputListener = (data) => {
		  this.gameIntf.setPlayerInput(key, data.val());
	  };

	  userInputRef.on('value', inputListener);
      this.userList[key].inputRef = userInputRef;
      this.userList[key].inputListener = inputListener;
	}

	updateUser(key, name){
	  var userElem = this.userList[key];
      userElem.name = name;
	}

	removeUser(key){
	  var userElem = this.userList[key];
	  var userInputRef = userElem.inputRef;
	  userInputRef.off('value', userElem.inputListener);

	  delete this.userList[key];
	  this.gameIntf.removePlayer(key);
	}

    // Set data to propogate to users
    setRoomData(key, data){
	  var roomDataRef = this.firebase.database().ref()
                         .child('rooms/'+this.newRoomKey+'/data/roomData');
      roomDataRef.child(key).set(data);
    }

    setUserData(user, key, data){
	  var userDataRef = this.firebase.database().ref()
                         .child('rooms/'+this.newRoomKey+'/data/userData/'+user);
      userDataRef.child(key).set(data);
    }
}

window.QRRooms = QRRooms;
