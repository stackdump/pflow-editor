
// initialMarking format is "Default,0"

var TEMPLATES = {};
var PSHORT = 'pshort';

// set initial variables
// these values override the inputs from the pflow file
TEMPLATES[PSHORT] = (pf) => {

    // REVIEW: if we wanted to calculate these values
    // data would be injected from a mainnet

    let collateral = 5; // USD shorted at rate = 5/7
    let tokens = 7; // number of tokens being shorted
    let rate_in_block_m = 2/7; // current USD value of short contract

    // NOTE: aside from binding values to the petri-net
    // this is the only calculation made per transaction
    //
    // calculate market value
    let value = 2 * collateral - tokens * rate_in_block_m;

    if (value <= 0) {
        value = 0;
        console.log("short halted due to insufficent value")
    }

    pf.vars = {
        ":COLLATERAL:": {
            initial: collateral,
            offset: 0,
            position: { x: 700, y: 100},
            description: "Amount USD on deposit at block N",
            mapping: [
                {weight: { source: "INPUT", target: "COLLATERAL"}},
                {weight: { source: "COLLATERAL", target: "COVER"}},
                {initial: { target: "COLLATERAL"}},
            ]
        },
        ":TOKENS:": {
            initial: tokens,
            offset: 1,
            position: { x: 700, y: 180},
            description: "Y: pXYZ shorted at block N",
            mapping: [
                {weight: { source: "INPUT", target: "TOKENS"}},
                {weight: { source: "TOKENS", target: "COVER"}},
                {initial: {target: "TOKENS"}},
            ]
        },
        ":VALUE:": {
            initial: value,
            offset: 2,
            position: { x: 700, y: 260},
            description: "USD VALUE = 2 * COLLATERAL - Y * (rate-of-pXYZ-in-block-M = 2/7)",
            mapping: [
                {weight: { source: "COVER", target: "OUTPUT"}},
                {weight: { source: "VALUE", target: "COVER"}},
                {initial: { target: "VALUE"}},
            ]
        },
    };

    return pf
};

export default function OpenTemplate(ptNet, schema) {
    if (!(schema in TEMPLATES)) {
        console.log("missing template for: "+ schema);
        return ptNet
    }
    return TEMPLATES[schema](ptNet);
}


