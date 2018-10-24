import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button/Button';
import Grid from '@material-ui/core/Grid/Grid';
import PropTypes from 'prop-types';
import Steps from './Steps';

const styles = theme => ({
  root: {
    width: '350px',
    margin: '0 auto',
    marginTop: theme.spacing.unit * 4,
    [theme.breakpoints.down('sm')]: {
      width: '250px',
      marginTop: theme.spacing.unit * 2,
    },
  },
  button: {
    margin: theme.spacing.unit,
    width: '70px',
    height: '70px',

    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing.unit / 2,
      width: '50px',
      height: '50px',
    },
  },
});

@withStyles(styles)
export default class NumericKeyboard extends React.Component {
  render() {
    const { classes, pin, handlePinChange } = this.props;

    return (
      <Grid container spacing={24} className={classes.root}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((label, index) => (
          <Grid key={index} item xs={4}>
            <Button
              variant="fab"
              className={classes.button}
              onClick={() => {
                handlePinChange(pin + '' + label);
              }}
            >
              {label}
            </Button>
          </Grid>
        ))}
      </Grid>
    );
  }
}

Steps.propTypes = {
  classes: PropTypes.object,
  pin: PropTypes.string,
  handlePinChange: PropTypes.func,
};
