import React, { Component } from 'react'

const ACTIONS = [
    "select",
    "delete",
    "place",
    "transition",
    "arc",
    "token",
    "execute",
];

export default class Menu extends Component {
    constructor(props) {
        super(props);
        this.menuAction = this.menuAction.bind(this);
    }

    menuAction(action) {
        this.props.ptnet.menuAction(action, (mode) => {
            this.setState({ mode: mode })
        })
    }

    componentDidMount() {
        this.setState({ mode: this.props.ptnet.getMode() })
    }

    render() {
        if (! this.state) {
            return (<React.Fragment/>)
        }

        let actions = ACTIONS.map((label) => {
            let style = { color: "grey"};
            if (this.state.mode === label) {
                style = { color: "black"};
            }
            return (<button key={label} style={style} name={label}
                onClick={() => this.menuAction(label)}
                onContextMenu={(evt) => evt.preventDefault() }
            >{label}</button>)
        }) ;

        return (
            <div className="menu" mode={this.props.ptnet.mode}> {actions} </div>
        )
    }
}
