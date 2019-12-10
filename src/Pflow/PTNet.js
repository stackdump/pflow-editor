import NewSimulation from "./Simulation";

export default function NewPTNet(p) {
    return new PTNet(p.onLoad, p.onSave, p.onUpdate)
}

// handle editor/simulator actions
class PTNet {

    constructor(onLoad, onSave, onUpdate) {
        // petri-net
        let pflow = onLoad();
        this.schema = pflow.schema;
        this.places = pflow.places;
        this.transitions = pflow.transitions;

        // app state
        this.mode = 'select';
        this.update = onUpdate;
        this.save = onSave;
        this.simulation = null;
        this.lastSelected = null;

        // accessors
        this.getMode = this.getMode.bind(this);
        this.getObj = this.getObj.bind(this);
        this.getTokenCount = this.getTokenCount.bind(this);

        // editor
        this.menuAction = this.menuAction.bind(this);
        this.positionUpdated = this.positionUpdated.bind(this);

        // simulation
        this.isRunning = this.isRunning.bind(this);
        this.canFire = this.canFire.bind(this);
        this.fire = this.fire.bind(this);
        this.isSelected = this.isSelected.bind(this);

        // elements
        this.editorClick = this.editorClick.bind(this);
        this.transitionClick=this.transitionClick.bind(this);
        this.placeClick=this.placeClick.bind(this);
        this.arcClick=this.arcClick.bind(this);
        this.arcAltClick=this.arcAltClick.bind(this);
        this.placeAltClick=this.placeAltClick.bind(this);
    }

    placeSeq() {
        let x = 0;
        while (this.places["place"+x]) {
            x++;
        }
        return "place"+x;
    }

    transitionSeq() {
        let x = 0;
        while (this.transitions["txn"+x]) {
            x++;
        }
        return "txn"+x;
    }

    isRunning() {
        return this.mode === 'execute' && this.simulation != null;
    }

    getTokenCount(oid) {
        let p = this.getObj(oid);
        if (!p) {
            console.error("place not found " +oid);
            return -1
        }

        if (this.isRunning()) {
            return this.simulation.state[p.offset]
        } else {
            return p.initial
        }
    }

    fire(oid, multiple) {
        let updated = false;
        if (this.isRunning()) {
            this.simulation.fire(oid, multiple || 1, () => {
                updated = true;
            });
        }
        return updated;
    }

    canFire(oid, role) {
        let t = this.getObj(oid);
        if (role && t.role !== role) {
            return false;
        }

        if (this.isRunning() && oid in this.transitions) {
            let res = this.simulation.canFire(oid);
            return res[1];
        } else {
            return false
        }
    }

    getMode() {
        return this.mode
    }

    getObj(oid) {
        if (oid in this.transitions) {
            return this.transitions[oid];
        } else {
            return this.places[oid];
        }
    }

    positionUpdated(el, evt, callback) {
        if (['execute', 'delete'].indexOf(this.mode) >= 0 ) {
            return
        }

        let obj = this.getObj(el.props.id);
        obj.position.x = obj.position.x + evt.movementX;
        obj.position.y = obj.position.y + evt.movementY;
        this.update();

        if (callback) {
            callback()
        }
    }

    menuAction(action, callback) {
        if (this.mode === action) {
            action = 'select'
        }
        //console.log(this.mode, "->", action);
        this.mode=action;

        switch(action) {
            case "execute": {
                this.simulation = NewSimulation(this);
                //console.log(this.simulation);
                break;
            }
            default: {
                //console.error("unknown menuAction: "+action);
            }
        }

        this.update();
        if (callback) {
            callback(this.mode);
        }
    }

    emptyVector() {
        return Object.keys(this.places).map(() => {
            return 0
        })
    }

    addPlace(coords) {
        let newOffset = Object.keys(this.places).length;
        this.places[this.placeSeq()] = {
            initial: 0,
            capacity: 0,
            offset: newOffset,
            position: coords,
        };

        // extend delta vector size
        for (const oid in this.transitions) {
            this.transitions[oid].delta[newOffset] = 0;
        }

        return true;
    }

    addTransition(coords) {
        let oid = this.transitionSeq();
        this.transitions[oid] = {
            role: 'default',
            delta: this.emptyVector(),
            position: coords,
            guards: {}
        };
        return true;
    }

    editorClick(evt) {
        let updated = false;
        switch (this.mode) {
            case 'place': {
                updated = this.addPlace({x: evt.clientX-8, y: evt.clientY-25});
                break;
            }
            case 'transition': {
                updated = this.addTransition({x: evt.clientX-8, y: evt.clientY-25});
                break;
            }
            default: {
            }
        }
        evt.stopPropagation();
        if (updated) { this.update() }
    }

    validArc(begin, end) {
        return (
            (begin in this.places && end in this.transitions) ||
            (begin in this.transitions && end in this.places)
        )
    }

    addArc(begin, end) {
        let t = null;
        let p = null;
        let weight = 0;

        if (begin in this.transitions) {
            weight = 1;
            t = this.transitions[begin];
            p = this.places[end];
        } else {
            weight = -1;
            t = this.transitions[end];
            p = this.places[begin];
        }

        t.delta[p.offset] = weight;
    }

    pairSelected(begin, end) {
        let updated = false;

        switch (this.mode) {
            case 'arc': {
                if (this.validArc(begin, end)) {
                    //console.log(begin, "->", end);
                    this.addArc(begin, end);
                    updated = true;
                }
                break;
            }
            default: {
            }
        }
        this.lastSelected = null;
        return updated;
    }

    selectObj(oid) {
        if (!this.lastSelected) {
            this.lastSelected = oid;
        } else {
            this.pairSelected(this.lastSelected, oid)
        }
    }

    delPlace(oid) {
        let offset = this.places[oid].offset;
        for (const txn in this.transitions) {
            delete this.transitions[txn].delta[offset];
            delete this.transitions[txn].guards[oid];
        }
        delete this.places[oid];
    }

    delArc(obj) {
        let p = null;
        let t = null;

        if (obj.source in this.places) {
            p = obj.source;
            t = obj.target;
        } else {
            t = obj.source;
            p = obj.target;
        }

        let offset = this.places[p].offset;
        this.transitions[t].delta[offset] = 0;
        delete this.transitions[t].guards[p];
    }

    placeAltClick(oid) {
        let updated = false;
        switch (this.mode) {
            case 'token': {
                let p = this.getObj(oid);
                if (p.initial > 0) {
                    p.initial--;
                    updated = true;
                }
                break;
            }
            default: {
            }
        }
        if (updated) { this.update() }
    }

    placeClick(oid) {
        let updated = false;
        switch (this.mode) {
            case 'delete': {
                this.delPlace(oid);
                updated = true;
                break;
            }
            case 'arc': {
                this.selectObj(oid);
                updated = true;
                break;
            }
            case 'token': {
                this.getObj(oid).initial++;
                updated = true;
                break;
            }
            default: {
            }
        }
        if (updated) { this.update() }
    }

    transitionClick(oid) {
        let updated = false;
        switch (this.mode) {
            case 'execute': {
                updated = this.fire(oid);
                break;
            }
            case 'delete': {
                delete this.transitions[oid];
                updated = true;
                break;
            }
            case 'arc': {
                this.selectObj(oid);
                updated = true;
                break;
            }
            default: {
            }
        }
        if (updated) { this.update() }

    }

    isSelected(oid) {
        return this.lastSelected === oid
    }

    toggleInhibitor(arc) {
        if (arc.source in this.transitions) {
            //console.log("inhibitor source must be a place");
            return false;
        }

        let label = arc.source;
        let p = this.getObj(arc.source);
        let t = this.getObj(arc.target);

        if (t.delta[p.offset] !== 0) {
            t.guards[label] = this.emptyVector();
            t.guards[label][p.offset] = t.delta[p.offset];
            t.delta[p.offset] = 0;
        } else {
            // REVIEW: do we need to invert sign?
            t.delta[p.offset] = t.guards[label][p.offset];
            delete t.guards[label];
        }
        return true;
    }

    addGuardToken(t, pid, offset, delta) {
        let v = t.guards[pid][offset];

        if (v > 0) {
            v += delta;
        }
        if (v < 0) {
            v -= delta;
        }

        if (v === 0) {
            return false;
        }

        t.guards[pid][offset] = v;
        return true;
    }

    addArcToken(obj, delta) {
        let t = null;
        let p = null;
        let pid = null;
        if (obj.source in this.transitions) {
            t = this.getObj(obj.source);
            p = this.getObj(obj.target);
            pid = obj.target;
        } else {
            t = this.getObj(obj.target);
            p = this.getObj(obj.source);
            pid = obj.source;
        }

        if (t.delta[p.offset] === 0) {
            return this.addGuardToken(t, pid, p.offset, delta)
        }

        let v = t.delta[p.offset];

        if (v > 0) {
            v += delta;
        }
        if (v < 0) {
            v -= delta;
        }

        if (v === 0) {
            return false;
        }

        t.delta[p.offset] = v;
        return true;
    }

    arcClick(obj) {
        let updated = false;
        switch (this.mode) {
            case 'token': {
                console.log("token++");
                updated = this.addArcToken(obj, 1);
                break;
            }
            case 'delete': {
                if (obj.source in this.transitions) {
                    this.delArc(obj)
                } else {
                    this.delArc(obj)
                }
                updated = true;
                break;
            }
            default: {
            }
        }
        if (updated) { this.update() }
    }

    arcAltClick(obj) {
        let updated = false;
        switch (this.mode) {
            case 'arc': {
                updated = this.toggleInhibitor(obj);
                break;
            }
            case 'token': {
                updated = this.addArcToken(obj, -1);
                break;
            }
            default: {
            }
        }
        if (updated) { this.update() }

    }
}
