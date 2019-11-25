const Super = require('../../../../room/robotCommand_Think');
const cons = require('../../../../common/constants');
const _ = require('underscore');

class RobotCommand_Fire extends Super {
    static create(room, robot, ai) {
        let command = new RobotCommand_Fire(room, robot, ai);
        robot.runCommand(command);
        return command;
    }

    constructor(room, robot, ai) {
        super(room, robot, 200, 5000);
        this.ai = ai;
        this.bulletId = 0;
    }

    Fire() {
        //let action = this.ai.getOutCards(turn);;
        // setInterval(()=>{
        // this.bulletId++;
        // let lockFishId = this.room.getComp('state').getRdmFish();
        // let action = {name: cons.RoomAction.FIRE(), bulletId: this.bulletId,
        //         bullet_mulriple:this.room.getAttr('betOptions')[0],angle:250,lockFishId,isRobot:true };
        // this.robot.fire(action);},200);
    }
    // timeout() {
    //     this.Fire();
    // }
}

module.exports = RobotCommand_Fire;