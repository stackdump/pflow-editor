export default function NewSimulation(net) {
    return new StateMachine(net.places, net.transitions);
}

class StateMachine {
    constructor(places, transitions) {
        this.state = [];
        this.capacity = [];
        this.transitions = transitions;
        this.places = places;

        for (const i in places) {
            this.capacity[places[i].offset] = places[i].capacity;
            this.state[places[i].offset] = places[i].initial;
        }

        this.canFire = this.canFire.bind(this);
        this.guardsFail = this.guardsFail.bind(this);
        this.transitionFails = this.transitionFails.bind(this);
        this.fire = this.fire.bind(this);
    }

    vadd(state, delta, multiple) {
        let vout = [];
        let valid = true;
        for( const i in state) {
            vout[i] = state[i] + delta[i] * multiple;

            if (vout[i] < 0 || (this.capacity[i] > 0 && this.capacity[i] > vout[i])) {
                valid = false
            }
        }

        return [vout, valid]
    }

    guardsFail(oid, multiple) {
        let res = null;
        let t = this.transitions[oid];
        for (const place in t.guards) {
            res = this.vadd(this.state, t.guards[place], multiple)
            // guard logic is inverse of normal transition
            if (res[1]) { // expect vadd to fail
                return true;
            }
        }

        return false;
    }

    transitionFails(oid, multiple) {
        let t = this.transitions[oid];
        let res = this.vadd(this.state, t.delta, multiple || 1);
        return !res[1]
    }

    canFire(oid, multiple) {
        if (multiple != null && multiple < 0) {
            console.error("multiple must be positive value got: " +multiple);
            return [this.state, false]
        }
        let t = this.transitions[oid];

        if (this.guardsFail(oid, multiple || 1)) {
            return [this.state, false]
        }

        let res = this.vadd(this.state, t.delta, multiple || 1);
        return res;
    }

    fire(oid, multiple, callback) {
        let res = this.canFire(oid, multiple);
        if (res[1]) {
            this.state = res[0];
            if (callback) { callback() }
        }

    }
}
