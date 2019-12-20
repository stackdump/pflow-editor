import React, { Component } from 'react'
import Toolbar from "./Toolbar";
import Properties from "./Properties";
import Menu from "./Menu";
import Net from './Net';
import NewPTNet from "./PTNet";
import OpenTemplate from "./Templates";

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
                    return OpenTemplate(pf, pf.schema)
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