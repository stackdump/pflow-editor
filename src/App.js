import React, {Component} from 'react';
import OpenPflow from "./Pflow/Pflow";
import Editor from './Pflow/Editor';
import './App.css'

class App extends Component {
    constructor(props) {
        super(props);
        this.getPflow = this.getPflow.bind(this);
        this.setPflow = this.setPflow.bind(this);
    }

    getPflow() {
        return JSON.parse(JSON.stringify(this.state['ptnet']))
    }

    setPflow(ptnet) {
        this.setState({
            ptnet: ptnet
        })
    }

    open(schema) {
        OpenPflow(schema, (ptnet) => {
            this.setPflow(ptnet)
        })
    }

    componentDidMount() {
        this.open("counter");
    }

    render() {
        if (! this.state) {
            return (<React.Fragment />)
        }

        return (
            <div className={"App"}>
                <Editor getPflow={this.getPflow} setPflow={this.setPflow} />
            </div>
        )
    }
}

export default App;
