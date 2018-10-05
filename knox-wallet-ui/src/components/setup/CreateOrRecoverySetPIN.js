import React from 'react';
import Typography from '@material-ui/core/Typography';
import BasePaper, { paperWidth, styles as baseStyle } from './BasePaper';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button/Button';
import TextField from '@material-ui/core/TextField';
import NumericKeyboard from './NumericKeyboard';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import Steps from './Steps';
import { computed, observable, action } from 'mobx';
import { isValidPin } from '../../device/util/PIN';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH } from '../../device/Constants';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Icon from '@material-ui/core/Icon';

const styles = theme => {
  return {
    ...baseStyle(theme),
    mainTitle: {
      marginBottom: theme.spacing.unit * 4,
    },
    buttons: {
      textAlign: 'right',
    },
    input: {
      color: `${theme.palette.text.primary}`,
    },
  };
};

const STEP_SET = 0;
const STEP_CONFIRM = 1;

@withStyles(styles)
@inject('appStore', 'deviceStore')
@observer
export default class CreateOrRecoverySetPIN extends React.Component {
  @observable
  pin = '';

  @observable
  pinConfirmation = '';

  @observable
  step = STEP_SET;

  @computed
  get pinValid() {
    if (this.step === STEP_SET) {
      return isValidPin(this.pin);
    } else {
      return (
        isValidPin(this.pin) &&
        isValidPin(this.pinConfirmation) &&
        this.pin === this.pinConfirmation
      );
    }
  }

  @action.bound
  changePin(pin) {
    this.pin = pin;
  }

  @action.bound
  changePinConfirmation(pin) {
    this.pinConfirmation = pin;
  }

  @action.bound
  askPin() {
    this.step = STEP_SET;
  }

  @action.bound
  askConfirmation() {
    this.step = STEP_CONFIRM;
  }

  componentDidMount() {
    this.changePin('');
    this.changePinConfirmation('');
  }

  render() {
    const { classes, appStore, deviceStore } = this.props;

    let errorText = `Choose between ${PIN_MIN_LENGTH} and ${PIN_MAX_LENGTH} digits`;
    let showError = undefined;

    if (this.step === STEP_SET) {
      showError = this.pin.length > PIN_MIN_LENGTH && !this.pinValid;
    } else {
      if (this.pinConfirmation.length > PIN_MIN_LENGTH) {
        if (this.pinConfirmation !== this.pin) {
          showError = true;
          errorText = `The confirmation pin doesn't match the pin`;
        }
      }
    }

    return (
      <div>
        <form noValidate autoComplete="off">
          <div className={classes.paperSpaceFormWithSteps}>
            <Typography
              variant="subheading"
              gutterBottom
              className={classes.mainTitle}
            >
              {this.step === STEP_SET ? (
                <div>
                  Choose a <strong>new and hard to guess PIN</strong> to protect
                  your device from unauthorized access.
                </div>
              ) : (
                <div>Please confirm the new PIN</div>
              )}
            </Typography>

            <FormControl
              className={classes.formControl}
              error={showError}
              aria-describedby="pin-text"
              fullWidth
            >
              <Input
                type="password"
                value={this.step === STEP_SET ? this.pin : this.pinConfirmation}
                disabled
                classes={{ input: classes.input }}
                endAdornment={
                  (this.step === STEP_SET && this.pin.length > 0) ||
                  (this.step === STEP_CONFIRM &&
                    this.pinConfirmation.length > 0) ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Clear PIN"
                        onClick={() => {
                          if (this.step === STEP_SET) this.changePin('');

                          this.changePinConfirmation('');
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

            <NumericKeyboard
              pin={this.step === STEP_SET ? this.pin : this.pinConfirmation}
              handlePinChange={
                this.step === STEP_SET
                  ? this.changePin
                  : this.changePinConfirmation
              }
            />
          </div>
          <div className={classes.buttons}>
            <Button
              className={classes.button}
              onClick={() => {
                if (this.step === STEP_SET) {
                  this.props.handleBack();
                } else {
                  this.changePin('');
                  this.changePinConfirmation('');
                  this.askPin();
                }
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={() => {
                if (this.step === STEP_SET) {
                  this.askConfirmation();
                } else {
                  deviceStore.setPIN(this.pin);
                }
              }}
              disabled={!this.pinValid}
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    );
  }
}

CreateOrRecoverySetPIN.propTypes = {
  classes: PropTypes.object,
  handleBack: PropTypes.func,
};
