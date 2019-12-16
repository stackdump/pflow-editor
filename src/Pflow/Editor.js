import React, { Component } from 'react'
import Toolbar from "./Toolbar";
import Properties from "./Properties";
import Menu from "./Menu";
import Net from './Net';
import NewPTNet from "./PTNet";

export default class Editor extends Component {

    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(evt) {
        this.state.editorClick(evt);
    }

    componentDidMount() {
        this.setState(
            NewPTNet({
                onLoad: () => {
                    let pf = this.props.getPflow();
                    // KLUDGE: inject vars for initial POC
                    // need to add a way to store & persist these alongside the net
                    pf.vars = {
                        ":COLLATERAL:": {
                            initial: 5,
                            offset: 0,
                            position: { x: 640, y: 100},
                            description: "Amount USD on deposit",
                            mapping: [
                                {weight: { source: "INPUT", target: "COLLATERAL"}},
                                {weight: { source: "COLLATERAL", target: "COVER"}},
                                {initial: { target: "COLLATERAL"}},
                            ]
                         },
                        ":TOKENS:": {
                            initial: 7,
                            offset: 1,
                            position: { x: 640, y: 180},
                            description: "Y: Number of tokens being shorted",
                            mapping: [
                                {weight: { source: "INPUT", target: "TOKENS"}},
                                {weight: { source: "TOKENS", target: "COVER"}},
                                {initial: {target: "TOKENS"}},
                            ]
                        },
                        ":VALUE:": {
                            initial: 8,
                            offset: 2,
                            position: { x: 640, y: 260},
                            description: " Current Value = 2 * Collateral - Y * (rate of pXYZ in block M = 2/7)",
                            mapping: [
                                {weight: { source: "COVER", target: "OUTPUT"}},
                            ]
                        },
                    };
                    return pf;
                },
                onSave: this.props.setPflow,
                onUpdate: () => {
                    this.setState(this.state)
                }
            })
        )
    }

    render() {

        if (! this.state) {
            return <React.Fragment/>
        }

        return (
            <React.Fragment>
                <Menu ptnet={this.state} />
                <Toolbar ptnet={this.state}/>
                <svg width={window.innerWidth}
                     height={500}
                     onContextMenu={(evt) => evt.preventDefault() }
                     onClick={this.onClick} >
                    <defs>
                        <marker id="markerArrow1" markerWidth="23" markerHeight="13" refX="31" refY="6" orient="auto">
                            <rect className="transition" width="28" height="3" fill="#ffffff" stroke="#ffffff" x="3" y="5" />
                            <path d="M2,2 L2,11 L10,6 L2,2" />
                        </marker>
                        <marker id="markerInhibit1" markerWidth="23" markerHeight="13" refX="31" refY="6" orient="auto">
                            <rect className="transition" width="28" height="3" fill="#ffffff" stroke="#ffffff" x="3" y="5" />
                            <circle cx="5" cy="6.5" r={4}></circle>
                        </marker>
                    </defs>
                    <Net ptnet={this.state} />
                </svg>
                < hr/>
                <Properties ptnet={this.state} />
            </React.Fragment>
        )
      }
}