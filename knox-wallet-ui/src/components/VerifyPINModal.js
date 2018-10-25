import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { paperWidth } from './setup/BasePaper';
import { withStyles } from '@material-ui/core';
import { action, computed, observable } from 'mobx';
import { isValidPin } from '../device/util/PIN';
import {
  PIN_MAX_ATTEMPTS,
  PIN_MAX_LENGTH,
  PIN_MIN_LENGTH,
} from '../device/Constants';
import FormControl from '@material-ui/core/FormControl/FormControl';
import Input from '@material-ui/core/Input/Input';
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Icon from '@material-ui/core/Icon/Icon';
import FormHelperText from '@material-ui/core/FormHelperText/FormHelperText';
import NumericKeyboard from './setup/NumericKeyboard';
import Footer from './Footer';
import withMobileDialog from '@material-ui/core/es/withMobileDialog';
import CircularProgress from '@material-ui/core/CircularProgress';
import { task } from 'mobx-task';
import { __DEV__ } from '../Util';

const styles = theme => {
  return {
    input: {
      color: `${theme.palette.text.primary}`,
    },

    paper: {
      [theme.breakpoints.up(paperWidth + theme.spacing.unit * 2 * 2)]: {
        width: paperWidth,
        marginLeft: 'auto',
        marginRight: 'auto',
      },
    },
    buttonProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12,
    },
  };
};

@withMobileDialog()
@withStyles(styles)
@inject('appStore', 'deviceStore')
@observer
class VerifyPINModal extends React.Component {
  @observable
  pin = '';

  @observable
  tries = 0;

  @observable
  pinValidatedOnDevice = false;

  verifyPinOnDevice = task(
    async () => {
      try {
        await this.props.deviceStore.verifyPin(this.pin);
        this.props.handleSuccess();
        return true;
      } catch (e) {}

      this.props.deviceStore._pinRemainingAttempts.refresh();

      return false;
    },
    { state: undefined }
  );

  @computed
  get pinValid() {
    return isValidPin(this.pin);
  }

  @action.bound
  changePin(pin) {
    this.pin = pin;
  }

  @action.bound
  changeTries(tries) {
    this.tries = tries;
  }

  @action.bound
  changePinValidatedOnDevice(validated) {
    this.pinValidatedOnDevice = validated;
  }

  componentDidMount() {
    this.changePin(__DEV__ ? '1234' : '');
    this.changeTries(0);
    this.changePinValidatedOnDevice(false);
    this.props.deviceStore._pinRemainingAttempts.refresh();
  }

  render() {
    const { classes, deviceStore, open, fullScreen } = this.props;

    let errorText = `The pin have between ${PIN_MIN_LENGTH} and ${PIN_MAX_LENGTH} digits`;
    let showError =
      this.pin.length > PIN_MIN_LENGTH && !this.pinValid ? true : undefined;

    if (
      (this.pinValid && this.tries > 0) ||
      deviceStore.pinRemainingAttempts !== PIN_MAX_ATTEMPTS
    ) {
      showError = true;
      errorText = '';
      if (this.tries > 0) {
        errorText = this.tries > 0 ? 'PIN incorrect. ' : '';
      }
      errorText += `You have ${
        deviceStore.pinRemainingAttempts
      } tries left before the device is erased.`;
    }

    let pinEntry = (
      <form noValidate autoComplete="off">
        <div className={classes.paperSpaceFormWithSteps}>
          <FormControl
            className={classes.formControl}
            error={showError}
            aria-describedby="pin-text"
            fullWidth
          >
            <Input
              type="password"
              value={this.pin}
              disabled
              classes={{ input: classes.input }}
              endAdornment={
                this.pin.length > 0 ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Clear PIN"
                      onClick={() => {
                        this.changePin('');
                        this.changeTries(0);
                      }}
                    >
                      <Icon>backspace</Icon>
                    </IconButton>
                  </InputAdornment>
                ) : (
                  undefined
                )
              }
            />
            <FormHelperText id="pin-text">{errorText}</FormHelperText>
          </FormControl>

          <NumericKeyboard pin={this.pin} handlePinChange={this.changePin} />
        </div>
      </form>
    );

    return (
      <Dialog
        onExit={() => {
          this.changePin('');
          this.changeTries(0);
        }}
        onClose={this.props.handleClose}
        open={open}
        aria-labelledby="form-dialog-pin-enter"
        classes={{ paper: classes.paper }}
        fullScreen={fullScreen}
      >
        <DialogTitle id="form-dialog-pin-enter">Confirm operation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter your PIN to confirm the operation
          </DialogContentText>
          {pinEntry}
          {/*<Footer onlySimulator={true} />*/}
        </DialogContent>
        <DialogActions>
          <Button className={classes.button} onClick={this.props.handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            className={classes.button}
            onClick={() => {
              this.verifyPinOnDevice();
            }}
            disabled={!this.pinValid || this.verifyPinOnDevice.pending}
          >
            Confirm
            {this.verifyPinOnDevice.state !== undefined &&
              this.verifyPinOnDevice.pending && (
                <CircularProgress
                  size={24}
                  className={classes.buttonProgress}
                />
              )}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

VerifyPINModal.propTypes = {
  classes: PropTypes.object,
  open: PropTypes.bool,
  fullScreen: PropTypes.bool,
  handleClose: PropTypes.func,
  handleSuccess: PropTypes.func,
};

export default VerifyPINModal;
