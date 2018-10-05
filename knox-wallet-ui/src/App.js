import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
// import ErrorBoundary from './ErrorBoundary';
import SetupLayout from './components/setup/SetupLayout';
import { inject, observer } from 'mobx-react';
import AppLayout from './components/AppLayout';
import { STATE_PIN_SET, STATE_READY } from './device/Constants';
import PINModal from './components/PINModal';
import FullLoading from './components/FullLoading';

@inject('appStore', 'deviceStore')
@observer
class App extends Component {
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

    // Check if its authenticated, if not, show the PIN request screen
    let isConnectorInstalled = deviceStore.isConnectorInstalled;
    let hasDevice = deviceStore.hasDeviceConnected;
    let state = deviceStore.state;
    let pinVerified = deviceStore.pinVerified;

    let showPinModal =
      isConnectorInstalled &&
      hasDevice &&
      [STATE_PIN_SET, STATE_READY].includes(state) &&
      !pinVerified;

    let maybeContent;

    if (!showPinModal) {
      if (isConnectorInstalled && hasDevice && state === STATE_READY) {
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
        <PINModal open={showPinModal} />
        {maybeContent}
      </React.Fragment>
    );
  }
}

export default hot(module)(App);

// if (module.hot) {
//   module.hot.accept();
// }
