import React, { Component } from 'react'
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

export default class Properties extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.getData = this.getData.bind(this);
    }

    componentDidMount() {
        this.setState({ tab: 0 })
    }

    handleChange(evt, val) {
        this.setState({ tab: val })
    }

    getData() {
        let obj = this.props.ptnet.getCurrentObj();

        let data = {
            selected: obj,
        };

        if (! obj) {
            return { type: "Select" }
        }

        data.type = this.props.ptnet.getType(obj);
        if (!obj)  {
            return this.props.ptnet.vars;
        }

        switch (this.state.tab) {
            case 0: {
                data.source = this.props.ptnet.getObj(obj['source']);
                data.target = this.props.ptnet.getObj(obj['target']);
                break
            }
            case 1: {
                data.vars =this.props.ptnet.vars;
                break
            }
            default :{
            }
        }

        return data
    }

    render() {
        if (! this.state)  {
            return <React.Fragment />
        }

        let classes = useStyles;
        let data = this.getData();

        return (
            <Paper square>
                <Tabs
                    value={this.state.tab}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={this.handleChange} >
                    <Tab label={data.type || "Select"} />
                    <Tab label="Variables" />

                </Tabs>
                <div style={{ maxWidth: '100%' }}>
                    <Typography variant="h6" className={classes.title}>
                        <pre>
                        {JSON.stringify(data, null, "\t")}
                        </pre>
                    </Typography>
                </div>
            </Paper>
        )
    }
}
