import React, {Component} from 'react';
import Place from './Place'
import Arc from './Arc'
import Transition from './Transition'
import PVar from './Var'

class Net extends Component {

    render() {
        let p = this.props.ptnet.places;
        let t = this.props.ptnet.transitions;
        let v = this.props.ptnet.vars;
        let place_index = [];

        for (const label in p) {
            place_index[p[label].offset] = label
        }

        const vars = Object.keys(v).map((label, index) =>
            <PVar key={label} id={label} ptnet={this.props.ptnet} />
        );

        const places = Object.keys(p).map((label, index) =>
            <Place key={label} id={label} ptnet={this.props.ptnet} />
        );

        const transitions = Object.keys(t).map((label, index) =>
            <Transition key={label} id={label} ptnet={this.props.ptnet} />
        );

        const arcs = [];

        for (const txn in t) {
            for (const place in t[txn].guards) {
                let id = txn+'-o'+place;
                arcs.push(
                    <Arc key={id}  id={id} ptnet={this.props.ptnet} source={place} target={txn} inhibitor={true} transition={t} />
                );
            }
        }

        for (const txn in t) {
            for (const i in t[txn].delta) {
                let v = t[txn].delta[i];
                if (v > 0) {
                    let id = txn+'--'+place_index[i];
                    arcs.push(
                        <Arc key={id}  id={id} ptnet={this.props.ptnet} source={txn} target={place_index[i]} transition={t}/>
                    );
                } else if (v < 0) {
                    let id = place_index[i]+'-='+txn;
                    arcs.push(
                        <Arc key={id} id={id} ptnet={this.props.ptnet} source={place_index[i]} target={txn} transition={t}/>
                    );
                }
            }
        }

        return (
            <g id={this.props.schema}>
                { vars }
                { arcs }
                { places }
                { transitions }
            </g>
        );
    }
}

export default Net;
