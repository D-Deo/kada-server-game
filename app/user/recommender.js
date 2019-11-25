const Comp = require('./component');
const cons = require('../common/constants');
const dao = require('../dao');
const pomelo = require('pomelo');
const _ = require('underscore');


class Recommender extends Comp {
    constructor(user) {
        super(user);

        this.parent = null;
        this.children = {};
    }

    getAncestors() {
        if(!this.parent) {
            return [];
        }

        let ancestors = [];
        let iterator = this.parent;
        while(iterator) {
            ancestors.push(iterator);
            iterator = iterator.getComp('recommender').getParent();
        }
        return ancestors.reverse();
    }

    isAncestor(u) {
        return _.contains(this.getAncestors(), u);
    }

    getParent() {
        return this.parent;
    }

    removeParent() {
        if(!this.parent) {
            return;
        }

        this.parent.getComp('recommender').removeChild(this.user);
        this.parent = null;
    }

    setParent(p, options = {}) {
        if(this.parent === p) {
            return;
        }

        this.removeParent();

        this.parent = p;
        this.parent && this.parent.getComp('recommender').addChild(p);
        !options.ignoreAction && this.user.sendAttributeAction(cons.UserAttributeAction.CHANGE(), {recommender: this.toJson()});
        !options.ignoreUpdate && dao.user.recommender(this.user.getId(), this.toJson());
    }

    addChild(u) {
        this.children[u.getId()] = u;
    }

    removeChild(u) {
        delete this.children[u.getId()];
    }

    async load() {
        let recommender = this.user.getAttr('recommender');
        if(!recommender) {
            return;
        }

        let manager = pomelo.app.components['userManager'];
        let parents = recommender.split(':');
        let parent = parseInt(_.last(parents));
        this.setParent(manager.getUserById(parent), {ignoreAction: true, ignoreUpdate: true});
    }

    toJson() {
        return this.parent ? this.parent.getId() : null;
    }
}


module.exports = Recommender;