import React, { Component } from 'react'

export default class Arc extends Component {

    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.onAltClick = this.onAltClick.bind(this);
        this.getMarker = this.getMarker.bind(this);
        this.getStroke = this.getStroke.bind(this);
    }

    getArcDef() {
        return {source: this.props.source, target: this.props.target};
    }

    onClick(evt) {
        evt.stopPropagation();
        this.props.ptnet.arcClick(this.getArcDef());
    }

    onAltClick(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        this.props.ptnet.arcAltClick(this.getArcDef());
    }

    getMarker() {
        if (this.props['inhibitor']) {
            return "url(#markerInhibit1)"
        } else {
            return "url(#markerArrow1)"
        }
    }

    getStroke() {
        let obj = { target: this.props.target, source: this.props.source };
        if (this.props.ptnet.isSelected(obj)) {
            return "#8140ff"
        }  else {
            return "#000000"
        }
    }

    render() {
        let source = this.props.ptnet.getObj(this.props.source);
        let target = this.props.ptnet.getObj(this.props.target);
        if (! source || ! target) {
            return (< g/>)
        }

        let x1=source.position.x;
        let y1=source.position.y;
        let x2=target.position.x;
        let y2=target.position.y;

        let midX = (x2+x1)/2;
        let midY = (y2+y1)/2 - 8;
        let offsetX=4;
        let offsetY=4;

        if (Math.abs(x2-midX) < 8) {
            offsetX=8;
        }

        if (Math.abs(y2-midY) < 8) {
            offsetY=0;
        }

        let weight = 0;
        if (this.props.inhibitor) {
            if ('delta' in source) {
                weight = source.guards[this.props.target][target.offset];
            } else {
                weight = target.guards[this.props.source][source.offset];
            }
        } else {
            if ('delta' in source) {
                weight = source['delta'][target.offset];
            } else {
                weight = target['delta'][source.offset];
            }
        }

        return (
            <g
                onContextMenu={this.onAltClick}
            >
                <line
                    stroke={this.getStroke()}
                    markerEnd={this.getMarker()}
                    id={this.props.id}
                    x1={x1} y1={y1}
                    x2={x2} y2={y2}
                />
                <text id={this.props.id+"[label]"} x={midX-offsetX} y={midY+offsetY} className="small">{Math.abs(weight)}</text>
                <circle id={this.props.id+"[handle]"}
                    r={13} cx={midX} cy={midY} fill="transparent" stroke="transparent"
                    onClick={this.onClick}
                />
            </g>
        );
    }
};

