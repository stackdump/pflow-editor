
// initialMarking format is "Default,0"
import {parseString} from "xml2js";

function getInitial(placeIn) {
    return parseInt(placeIn.tokens[0])
}

function getCap(placeIn) {
    return 0
}

function getCoords(obj) {
    // REVIEW: pflow designates negative values
    return { x: parseInt(obj.x), y: parseInt(obj.y)}
}

function getId(obj) {
    return obj.id[0]
}

function getName(obj) {
    return obj.name[0]
}

function getWeight(arc) {
    return parseInt(arc['multiplicity'][0])
}

function isInhibitor(arc) {
    return arc.type[0] === "inhibitor"
}

export default function OpenPflow(schema, success, error) {

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "schemata/"+schema+".pflow", true);
    xhr.onload = (e) => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                parseString(xhr.responseText, (err, pflow_json) => {
                    if (err) {
                        console.error(err)
                    } else {
                        let net = new PFlow(schema, pflow_json);
                        net.reindex();
                        success(new PTNet(schema, net));
                    }
                });
            } else {
                error(xhr.statusText);
                console.error(xhr.statusText);
            }
        }
    };
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
        return null;
    };
    xhr.send(null);
}

class PTNet {
    constructor(schema, net) {
        this.schema = net.schema;
        this.places = net.places;
        this.transitions = net.transitions;
    }

}

// construct PTNet from PFlow
class PFlow {
    constructor(schema, pnml){
        this.schema = schema;
        this.places = {};
        this.transitions = {};

        // used to reindex pflow -> ptnet
        this._pnml = pnml; // KLUDGE only use first net
        this._place_ids = {}; // map[string] => offset
        this._place_labels = {}; // map[string::id] => string
        this._transition_ids = {}; // map[string] => offset
    }

    emptyVector() {
        let size = Object.keys(this.places).length;
        let v = [];
        for (let i = 0; i < size; i++) {
            v[i] = 0;
        }
        return v
    }

    loadSubnets(subnet) {

        if(subnet.subnet) {
            for (const n of subnet.subnet) {
                this.loadSubnets(n);
            }
        }

        for (const [i, p] of subnet['place'].entries()) {
            this._place_ids[getId(p)] = i;
            this._place_labels[getId(p)] = p.label;

            this.places[p.label] = {
                offset: i,
                capacity: getCap(p),
                initial: getInitial(p),
                position: getCoords(p),
            };
        }

        for (const t of subnet['transition']) {
            this._transition_ids[getId(t)] = t.label;
            this.transitions[t.label] = {
                role: "default",
                delta: this.emptyVector(),
                position: getCoords(t),
                guards: {},
            };
        }

        for ( const a of subnet['arc']) {
            let pkey = "";
            let tkey = "";
            let unit = null;

            if (this.isTransition(a['destinationId'][0])) {
                //console.log('(', s, ')', '<-[', d, ']')
                tkey = 'destinationId';
                pkey = 'sourceId';
                unit = getWeight(a)*-1;
            } else {
                //console.log('[', s, '] ->','(', d, ')' )
                tkey = 'sourceId';
                pkey = 'destinationId';
                unit = getWeight(a);
            }

            // TODO deal w/ ref_places (from subnets)

            let t = this.transitions[this._transition_ids[a[tkey]]];
            let place_offset = this._place_ids[a[pkey]];
            let place_label = this._place_labels[a[pkey]];

            if (isInhibitor(a)) {
                let g = this.emptyVector();
                //console.log('inhibitor', unit)
                g[place_offset] = unit; // FIXME should this be inverted?
                t.guards[place_label] = g;
            }  else {
                t.delta[place_offset] = unit;
            }

        }
    }

    isTransition(label) {
        if (label in this._transition_ids) {
            return true
        } else {
            return false
        }
    }

    reindex() {
        for (const n of this._pnml.document['subnet']) {
            this.loadSubnets(n);
        }

        for (const r of this._pnml.document['roles'][0].role) {
            const label = getName(r);
            for (const tid of r['transitionId']) {
                this.transitions[this._transition_ids[tid]].role = label;
            }
        }
    }
};

