import React from 'react';
import Typography from '@material-ui/core/Typography';
import BasePaper, { paperWidth, styles as baseStyle } from './BasePaper';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button/Button';
import TextField from '@material-ui/core/TextField';
import CreateSteps from './CreateSteps';
import NumericKeyboard from './NumericKeyboard';
import { inject, observer } from 'mobx-react';

const styles = theme => {
  return {
    ...baseStyle(theme),
    paperSpaceFormWithSteps: {
      margin: '70px auto 24px auto',
      width: '440px',
      [theme.breakpoints.down(paperWidth + theme.spacing.unit * 3 * 2)]: {
        width: 'inherit',
        margin: `20px ${theme.spacing.unit}px 20px ${theme.spacing.unit}px`,
      },
    },
    mainTitle: {
      marginBottom: theme.spacing.unit * 4,
    },
    buttons: {
      textAlign: 'right',
    },
  };
};

@withStyles(styles)
@inject('appStore', 'deviceStore')
@observer
export default class CreateSetPIN extends BasePaper {
  render() {
    const { classes, appStore } = this.props;

    this.content = (
      <div>
        <CreateSteps />
        <form noValidate autoComplete="off">
          <div className={classes.paperSpaceFormWithSteps}>
            <Typography
              variant="subheading"
              gutterBottom
              className={classes.mainTitle}
            >
              Choose a <strong>new and hard to guess PIN</strong> to protect
              your device from unauthorized access.
            </Typography>

            <TextField
              fullWidth
              type="password"
              helperText="Choose between 4 and 8 digits"
              inputProps={{
                'aria-label': 'PIN',
              }}
            />

            <NumericKeyboard />
          </div>
          <div className={classes.buttons}>
            <Button
              className={classes.button}
              onClick={appStore.setupBackToDecide}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    );

    return super.render();
  }
}
