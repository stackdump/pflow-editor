import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import GitHubIcon from '@material-ui/icons/GitHub';

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

export default function ButtonAppBar() {
      const classes = useStyles();

      return (
              <div className={classes.root}>
                 <AppBar position="static">
                    <Toolbar>
                       <Typography variant="h6" className={classes.title}>
                           Pflow-Editor
                       </Typography>
                        <a
                            href="https://github.com/stackdump/pflow-editor"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={classes.dropdownLink}
                        > <GitHubIcon /> </a>
                    </Toolbar>
                 </AppBar>
              </div>
            );
}
