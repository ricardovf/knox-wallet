import React, { Component } from 'react';
// import ErrorBoundary from './ErrorBoundary';
import SetupLayout from './components/setup/SetupLayout';
import { inject, observer } from 'mobx-react';
import AppLayout from './components/AppLayout';
import { STATE_PIN_SET, STATE_READY } from './device/Constants';
import FullLoading from './components/FullLoading';
import UnlockWithPINModal from './components/UnlockWithPINModal';

@inject('appStore', 'deviceStore')
@observer
export default class App extends Component {
  componentDidMount() {
    // config store to monitor state and device connection
    this.props.deviceStore.autoRefreshStateStart();

    if (!this.props.appStore.firstLoadComplete) {
      setTimeout(this.props.appStore.changeFirstLoadToComplete, 1000);
    }
  }

  componentWillUnmount() {
    this.props.deviceStore.autoRefreshStateStop();
  }

  render() {
    const { appStore, deviceStore } = this.props;

    let showPinModal =
      deviceStore.isConnectorInstalled &&
      deviceStore.hasDeviceConnected &&
      [STATE_PIN_SET, STATE_READY].includes(deviceStore.state) &&
      !deviceStore.pinVerified;

    let maybeContent;

    if (!showPinModal) {
      if (
        deviceStore.isConnectorInstalled &&
        deviceStore.hasDeviceConnected &&
        deviceStore.state === STATE_READY
      ) {
        maybeContent = <AppLayout />;
      } else {
        maybeContent = <SetupLayout />;
      }
    }

    if (!appStore.firstLoadComplete) {
      return <FullLoading />;
    }

    return (
      <React.Fragment>
        <UnlockWithPINModal open={showPinModal} />
        {maybeContent}
      </React.Fragment>
    );
  }
}
