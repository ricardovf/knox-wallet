import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import BasePaper, { paperWidth, styles as baseStyle } from './BasePaper';
import Grid from '@material-ui/core/Grid';

const styles = theme => {
  return {
    ...baseStyle(theme),
    paperSpaceTwoOptions: {
      margin: '70px auto',
      width: 'inherit',
      [theme.breakpoints.down(paperWidth + theme.spacing.unit * 3 * 2)]: {
        width: 'inherit',
        margin: '20px auto',
      },
    },
    button: {
      margin: theme.spacing.unit,
      marginBottom: 0,
    },
    mainTitle: {
      marginBottom: theme.spacing.unit * 4,
    },
  };
};

@withStyles(styles, { withTheme: true })
export default class CreateOrRecovery extends BasePaper {
  render() {
    const { classes } = this.props;

    this.content = (
      <div className={classes.paperSpaceTwoOptions}>
        <Typography
          variant="headline"
          gutterBottom
          className={classes.mainTitle}
        >
          Let's setup your device
        </Typography>

        <Grid container spacing={16}>
          <Grid item xs={12} sm={6}>
            <div>
              <Typography variant="title" gutterBottom>
                Create a new wallet
              </Typography>
              <Typography variant="subheading" color="textSecondary" paragraph>
                We will walk you through the setup process in just a few steps.
              </Typography>

              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                href="/create-set-name"
              >
                Create new
              </Button>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div>
              <Typography variant="title" gutterBottom>
                Recover from backup
              </Typography>
              <Typography variant="subheading" color="textSecondary" paragraph>
                We will help you restore your wallet using the recovery seed
                words.
              </Typography>

              <Button
                color="primary"
                className={classes.button}
                href="/recovery-set-name"
              >
                Recover wallet
              </Button>
            </div>
          </Grid>
        </Grid>
      </div>
    );

    return super.render();
  }
}
