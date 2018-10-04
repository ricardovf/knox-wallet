import React from 'react';
import Typography from '@material-ui/core/Typography';
import BasePaper, { paperWidth, styles as baseStyle } from './BasePaper';
import usb from '../../media/img/usb.png';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button/Button';
import TextField from '@material-ui/core/TextField';
import CreateSteps from './CreateSteps';
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
export default class CreateSetName extends BasePaper {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
    };
  }

  render() {
    const { classes } = this.props;

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
              Choose a name to identify your device. You can change it later if
              you want.
            </Typography>

            <TextField
              autoFocus
              placeholder="My great wallet"
              className={classes.input}
              fullWidth
              inputProps={{
                'aria-label': 'Name',
              }}
            />
          </div>
          <div className={classes.buttons}>
            <Button className={classes.button}>Back</Button>
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
