import React from 'react'
import Draggable from "./Drag";

export default class PVar extends Draggable {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.onAltClick = this.onAltClick.bind(this);
    }

    onClick(evt) {
        this.props.ptnet.varClick(this.props.id);
        evt.stopPropagation();
    }

    onAltClick(evt) {
        this.props.ptnet.varAltClick(this.props.id);
        evt.preventDefault();
        evt.stopPropagation();
    }

    render() {
        if (! this.state ) { return(<g/>) }
        let p = this.props.ptnet.getObj(this.props.id).position;

        let tokenCount = () => {
            let tokens = this.props.ptnet.vars[this.props.id].initial;

            if (tokens === 0){
                return // don't show zeros
            } else if (tokens === 1) {
                return (<circle cx={p.x} cy={p.y} r="2" id={this.props.id+"_tokens"}
                    fill="#000000"
                    stroke="#000000" orient="0" className="tokens"/>)
            } else if (tokens < 10) {
                return (<text id={this.props.id+"_tokens"} x={p.x-4} y={p.y+5} className="large">{tokens}</text>)
            } else if (tokens >= 10) {
                return (<text id={this.props.id+"_tokens"} x={p.x-7} y={p.y+5} className="small">{tokens}</text>)
            }
        };

        return (
            <g
                onMouseDown={ (evt) => this.startDrag(evt) }
                onMouseUp={ (evt) => this.endDrag(evt) }
                onMouseMove={ (evt) => this.dragging(evt) }
                onClick={this.onClick}
                onContextMenu={this.onAltClick}
            >
                <circle id={this.props.id+"[handle]"} cx={p.x} cy={p.y} r={this.getHandleWidth()} fill="transparent" stroke="transparent"></circle>
                <circle cx={p.x} cy={p.y} r="20"id={this.props.id}
                        strokeWidth="1.5"
                        fill="#FFFFFF"
                        stroke="#000000"
                        orient="0"
                        className="var"
                        shapeRendering="auto"
                        strokeDasharray="4"
                />
                {tokenCount()}
                <text id={this.props.id+"[label]"} x={p.x-20} y={p.y-25} className="small">{this.props.id}</text>
                <text id={this.props.id+"[label]"} x={p.x+25} y={p.y+4} className="note">{this.props.ptnet.vars[this.props.id].description}</text>
            </g>
        );
    }
};
