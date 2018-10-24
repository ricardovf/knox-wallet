import React from 'react';
import BasePaper, { styles as baseStyle } from './BasePaper';
import { withStyles } from '@material-ui/core/styles';
import Steps from './Steps';
import { inject, observer } from 'mobx-react';
import {
  STATE_INSTALLED,
  STATE_PIN_SET,
  STATE_READY,
  STATE_SETUP_DONE,
} from '../../device/Constants';
import CreateOrRecoverySetPIN from './CreateOrRecoverySetPIN';
import CreateWriteSeed from './CreateWriteSeed';

const styles = theme => {
  return {
    ...baseStyle(theme),
    mainTitle: {
      marginBottom: theme.spacing.unit * 4,
    },
    buttons: {
      textAlign: 'right',
    },
  };
};

const steps = ['Choose a PIN', 'Write the recovery seed'];

@withStyles(styles)
@inject('appStore', 'deviceStore')
@observer
export default class Create extends BasePaper {
  handleBack = () => {
    if (this.props.deviceStore.state === STATE_SETUP_DONE) {
      this.props.appStore.setupBackToDecide();
    }
  };

  render() {
    const { classes, appStore, deviceStore } = this.props;

    let hasDevice = deviceStore.hasDeviceConnected;
    let state = deviceStore.state;

    if (!hasDevice || state === STATE_INSTALLED || state === STATE_READY)
      return null;

    let component = null;
    let step = 0;

    if (state === STATE_SETUP_DONE) {
      // must set PIN
      component = <CreateOrRecoverySetPIN handleBack={this.handleBack} />;
      step = 0;
    } else if (state === STATE_PIN_SET) {
      // must generate seed and write words
      component = <CreateWriteSeed />;
      step = 1;
    }

    this.content = (
      <div>
        <Steps steps={steps} currentStep={step} />
        {component}
      </div>
    );

    return super.render();
  }
}
