# Firebase QRRooms

This repo provides a sample framework within which you can create multiplayer games. Games run on one device and other users can join the game by scanning a QR code with their own device.

# Demos:

Live examples:

[**demo_users**](https://dyarosla.github.io/firebase_qr_rooms/demo_users/): Basic sample of creating a room and having users join/leave.


[**demo_words**](https://dyarosla.github.io/firebase_qr_rooms/demo_words/): Word-based word-find game.

[**demo_action**](https://dyarosla.github.io/firebase_qr_rooms/demo_action/): Action-based collecting-coins game.

# To Setup

To host a game yourself or create your own:

- Create a firebase app. `https://firebase.google.com/`
- Create a real time database.
- Using your firebase credentials, update `src/firebaseConfigSample.js`, and rename it to `src/firebaseConfig.js`.
- Update the database rules to those found in `src/dbrules.json`.
- Turn on firebase auth and anonymous user accounts.

# To Run Locally

- Run `python -m SimpleHTTPServer` in the demo directory of your choice to set up a local server.
- Go to `http://localhost:8000/` in your browser.
- Scan the QR code generated with another device to join the demo room.
