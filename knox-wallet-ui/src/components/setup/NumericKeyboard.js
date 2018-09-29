import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button/Button';
import TextField from '@material-ui/core/TextField';
import CreateSteps from './CreateSteps';
import Grid from '@material-ui/core/Grid/Grid';

const styles = theme => ({
  root: {
    width: '80%',
    margin: '0 auto',
    marginTop: theme.spacing.unit * 4,
  },
  button: {
    margin: theme.spacing.unit,
    // borderRadius: '50%',
    width: '70px',
    height: '70px',
    // padding: 0,
    // minWidth: 0,
  },
});

@withStyles(styles)
export default class NumericKeyboard extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <Grid container spacing={24} className={classes.root}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((label, index) => (
          <Grid key={index} item xs={4}>
            <Button variant="fab" className={classes.button}>
              {label}
            </Button>
          </Grid>
        ))}
      </Grid>
    );
  }
}
