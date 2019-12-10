import {Component} from "react";

export default class Draggable extends Component {

    // Keeps a user from mousing-out of the svg if dragging too quickly
    getHandleWidth() {
        if (this.state.dragging) {
            return window.innerWidth*2
        } else {
            return 36
        }
    }

    getStroke() {
        if (this.props.ptnet.isSelected(this.props.id)) {
            return "#8140ff"
        }  else {
            return "#000000"
        }
    }

    componentDidMount() {
        this.setState({ dragging: false, })
    }

    startDrag(evt) {
        this.setState({ dragging: true });
        evt.stopPropagation();
    }

    endDrag(evt) {
        this.setState({ dragging: false });
        evt.stopPropagation();
    }

    dragging = (evt) => {
        if (this.state.dragging) {
            this.props.ptnet.positionUpdated(this, evt);
        }
        evt.stopPropagation();
    };

}
