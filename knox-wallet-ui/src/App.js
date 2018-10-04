import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
// import ErrorBoundary from './ErrorBoundary';
import SetupLayout from './components/setup/SetupLayout';
import { inject, observer } from 'mobx-react';
import AppLayout from './components/AppLayout';
import { STATE_READY } from './device/Constants';

@inject('appStore', 'deviceStore')
@observer
class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // config store to monitor state and device connection
    this.props.deviceStore.autoRefreshStateStart();
  }

  componentWillUnmount() {
    this.props.deviceStore.autoRefreshStateStop();
  }

  render() {
    const { appStore, deviceStore } = this.props;

    return (
      <React.Fragment>
        {deviceStore.isConnectorInstalled &&
        deviceStore.hasDeviceConnected &&
        deviceStore.state === STATE_READY ? (
          <AppLayout />
        ) : (
          <SetupLayout />
        )}
      </React.Fragment>
    );
  }
}

export default hot(module)(App);
