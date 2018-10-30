class RoomUser {
    constructor(firebase, cbs){
        this.firebase = firebase;
        this.currentRoom = null;
        this.uid = null;
		
		this.inputRef = null;
		this.inputVal = ""; // needs to have some non-null value
	    this.disconnectHandler = null;

		this.userCB = cbs !== undefined ? cbs.userCB : undefined;
		this.roomCB = cbs !== undefined ? cbs.roomCB : undefined;
		this.roomDataCB = cbs !== undefined ? cbs.roomDataCB : undefined;
		this.userDataCB = cbs !== undefined ? cbs.userDataCB : undefined;

		firebase.auth().onAuthStateChanged((user) => {
		  if (user) {
			// User is signed in.
			var isAnonymous = user.isAnonymous;
			this.uid = user.uid;
			if(this.userCB !== undefined) this.userCB(this.uid);

			this.firebase.database().ref('user_room/'+this.uid).onDisconnect().set(null);
			this.firebase.database().ref('user_room/'+this.uid).on("value", (data) => {
				if(this.disconnectHandler != null){
					this.disconnectHandler.onDisconnect().cancel();
					this.disconnectHandler = null;
				}

				this.currentRoom = data.val();
				if(this.currentRoom != null){
					this.inputRef = firebase.database().ref('rooms/'+this.currentRoom+'/users/'+this.uid+'/input');
					this.disconnectHandler = firebase.database().ref('rooms/'+this.currentRoom+'/users/'+this.uid);
					this.disconnectHandler.onDisconnect().set(null);
					this.updateInput(this.inputVal);
					if(this.roomCB !== undefined) this.roomCB(this.currentRoom);

					if(this.roomDataRef != null){
						this.roomDataRef.off("value", this.roomDataRefListener);
						this.roomDataRef = this.roomDataRefListener = null;
					}
					this.roomDataRef = firebase.database().ref('rooms/'+this.currentRoom+'/data/roomData');
					this.roomDataRefListener = (data) => {
						this.handleRoomData(data.val());
					};
					this.roomDataRef.on("value", this.roomDataRefListener);

					if(this.userDataRef != null){
						this.userDataRef.off("value", this.userDataRefListener);
						this.userDataRef = this.userDataRefListener = null;
					}
					this.userDataRef = firebase.database().ref('rooms/'+this.currentRoom+'/data/userData/'+this.uid);
					this.userDataRefListener = (data) => {
						this.handleUserData(data.val());
					};
					this.userDataRef.on("value", this.userDataRefListener);
				} else {
					if(this.roomCB !== undefined) this.roomCB(null);
					this.attemptAutoJoin();
				}
			});
		  } else {
			if(this.userCB !== undefined) this.userCB(null);
			// User is signed out.
			// ...
		  }
		  // ...
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

    joinRoom(key){
        var updates = {};

        updates['user_room/'+this.uid] = key;
        if(this.currentRoom != null){
            updates['rooms/'+this.currentRoom+'/users/'+this.uid] = null;
        }
        updates['rooms/'+key+'/users/'+this.uid] = { input:"" };

        return this.firebase.database().ref().update(updates);
    }

	attemptAutoJoin(){
		//GET param room
		var match = RegExp('[?&]' + 'room' + '=([^&]*)').exec(window.location.search);
		var room = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
		if(room === null) return;
		this.joinRoom(room);
	}

	updateInput(val){
		this.inputVal = val;
		if(this.inputRef == null) return;
		this.inputRef.set(val);
	}

	handleRoomData(val){
		if(this.roomDataCB !== undefined) this.roomDataCB(val);
	}

	handleUserData(val){
		if(this.userDataCB !== undefined) this.userDataCB(val);
	}
}

window.RoomUser = RoomUser;
