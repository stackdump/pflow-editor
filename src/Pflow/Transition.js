import React from 'react'
import Draggable from "./Drag";

export default class Transition extends Draggable {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    getFill() {
        if (this.props.ptnet.isRunning())  {
            if (this.props.ptnet.canFire(this.props.id)) {
                return "#62fa75"
            } else if (!this.props.ptnet.transitionFails(this.props.id)) {
                return "#fab5b0"
            }
        }
        return "#ffffff"
    }


    onClick(evt) {
        this.props.ptnet.transitionClick(this.props.id);
        evt.stopPropagation();
    }

    render() {
        let t = this.props.ptnet.getObj(this.props.id);

        if (!this.state || !t) {
            return( <g />)
        }

        return (
            <g transform="translate(-17,-17)"
                onClick={this.onClick}
                onMouseDown={ (evt) => this.startDrag(evt) }
                onMouseUp={ (evt) => this.endDrag(evt) }
                onMouseMove={ (evt) => this.dragging(evt) }
                onDoubleClick={(evt) => evt.preventDefault() }
                onContextMenu={(evt) => {
                    console.log("rightclick");
                    evt.preventDefault();
                    evt.stopPropagation();
                }}
            >
            <circle id={this.props.id+"_handle"} cx={t.position.x+17} cy={t.position.y+17} r={this.getHandleWidth()} fill="transparent" stroke="transparent"></circle>
            <rect
                className="transition" width="34" height="34" fill={this.getFill()} stroke={this.getStroke()}
                id={this.props.id} x={t.position.x} y={t.position.y}
            />
            <text id={this.props.id+"[label]"} x={t.position.x} y={t.position.y-8} className="small">{this.props.id}</text>
            </g>
        );
    }
};

