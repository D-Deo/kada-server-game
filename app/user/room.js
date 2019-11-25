const Comp = require('./component');
const cons = require('../common/constants');
const pomelo = require('pomelo');
const RoomSession = require('../session/roomSession');


class Room extends Comp {
    constructor(user) {
        super(user);

        this.session = null;
        this.deposit = null;
        this.score = null;
    }

    async bind(session, deposit, score) {
        this.session = RoomSession.fromJson(session);
        this.deposit = deposit ? this.user.getComp('bag').useItemBundle(deposit.bundle, deposit.count) : null;
        this.bindScore(score);
        await this.bindSession();
        return this.toJson_Room();
    }

    isBinding() {
        return !!this.session;
    }

    async unbind() {
        this.session = null;
        this.unbindScore();
        await this.bindSession();
    }

    async bindSession() {
        this.user.sendAttributeAction(cons.UserAttributeAction.CHANGE(), {'room': this.toJson_User()});
        let session = this.user.getSession();
        if(!session) {
            return;
        }

        await session.bindProperty('room', this.toJson_User());
    }

    bindScore(score) {
        if(!score) {
            this.score = null;
            return;
        }

        this.score = this.user.getComp('bag').getItem(score, true);
        this.score.on(cons.ItemEvent.CHANGE(), this.onChangeScore, this);
        this.score.lock();
    }

    unbindScore() {
        if(!this.score) {
            return;
        }

        this.score.off(cons.ItemEvent.CHANGE(), this.onChangeScore, this);
        this.score.unlock();
        this.score = null;
    }

    changeScore(count, exts) {
        if(count === 0) {
            return;
        }

        this.score.change(count, exts, true);
    }

    onChangeScore(item, count, relock) {
        if(relock) {
            return;
        }

        pomelo.app.rpc.room.userRemote.changeScore(
            this.session.getServerId(),
            this.session.toJson(),
            this.user.getId(),
            count,
            () => {}
        );
    }
	
	toJson_Login() {
		return this.session ? this.session.getGame() : null;
	}

    toJson_Room() {
        let json = this.user.toJson_Room();
        json.deposit = this.deposit;
        json.score = this.score ? this.score.toJson() : null;
        return json;
    }

    toJson_User() {
        return this.session ? this.session.toJson() : null;
    }
}


module.exports = Room;