class MultiplayerGameIntf {
    constructor(cbs){
        this.players = {};
        this.playerList = [];

        if(cbs == undefined){
            this.addCB = undefined;
            this.removeCB = undefined;
            this.inputCB = undefined;
        } else {
            this.addCB = cbs.addCB;
            this.removeCB = cbs.removeCB;
            this.inputCB = cbs.inputCB;
        }
    }

    addPlayer(id){
        this.players[id] = {};
        this.playerList.push(id);
        if(this.addCB !== undefined) this.addCB(id);
    }

    removePlayer(id){
        delete this.players[id];
        this.playerList.splice(this.playerList.indexOf(id), 1);
        if(this.removeCB !== undefined) this.removeCB(id);
    }

    getPlayers(){
        return this.playerList;
    }

    setPlayerInput(id, input){
        this.players[id]['input'] = input;
        if(this.inputCB !== undefined) this.inputCB(id, input);
    }

    getPlayerInput(id){
        return this.players[id]['input'];
    }
}

window.MultiplayerGameIntf = MultiplayerGameIntf;
