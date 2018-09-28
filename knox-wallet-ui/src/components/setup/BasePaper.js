import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';

export const paperWidth = 720;

export const styles = theme => ({
  root: {
    textAlign: 'center',
    marginTop: '-70px',
    width: 'auto',
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    [theme.breakpoints.up(paperWidth + theme.spacing.unit * 2 * 2)]: {
      width: paperWidth,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    // marginTop: theme.spacing.unit * 3,
    // marginBottom: theme.spacing.unit * 3,
    padding: theme.spacing.unit * 1,
    [theme.breakpoints.up(paperWidth + theme.spacing.unit * 3 * 2)]: {
      // marginTop: theme.spacing.unit * 6,
      // marginBottom: theme.spacing.unit * 6,
      // padding: theme.spacing.unit * 1,
    },
  },
  paperSpaceLarge: {
    margin: '70px auto',
    width: '440px',
    [theme.breakpoints.down(paperWidth + theme.spacing.unit * 3 * 2)]: {
      width: 'inherit',
      margin: `20px ${theme.spacing.unit}px 20px ${theme.spacing.unit}px`,
    },
  },
  paperSpaceMedium: {
    textAlign: 'left',
    margin: '70px auto 24px auto',
    width: '560px',
    [theme.breakpoints.down(paperWidth + theme.spacing.unit * 3 * 2)]: {
      width: 'inherit',
      margin: `20px ${theme.spacing.unit}px 20px ${theme.spacing.unit}px`,
    },
  },
  button: {
    margin: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
});

export default class BasePaper extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Paper elevation={1} className={classes.paper} square={true}>
          {this.content}
        </Paper>
      </div>
    );
  }
}

BasePaper.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};
