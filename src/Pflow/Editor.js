import React, { Component } from 'react'
import Net from './Net';
import Menu from "./Menu";
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
                onLoad: this.props.getPflow,
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
                <Menu ptnet={this.state}/>
                <svg width={window.innerWidth}
                     height={window.innerHeight}
                     onContextMenu={(evt) => evt.preventDefault() }
                     onClick={this.onClick}
                >
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
            </React.Fragment>
        )
      }
}