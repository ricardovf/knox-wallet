import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { observer, inject } from 'mobx-react';
import { __DEV__ } from '../Util';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  footer: {
    marginTop: theme.spacing.unit * 6,
    padding: theme.spacing.unit,
    textAlign: 'center',
  },
  dev: { marginTop: theme.spacing.unit * 3 },
  button: {},
});

@withStyles(styles)
@inject('appStore', 'deviceStore')
@observer
export default class Footer extends React.Component {
  render() {
    const { classes, appStore, deviceStore } = this.props;

    let hasDevice = deviceStore.hasDeviceConnected;

    return (
      <div className={classes.footer}>
        <Typography variant="caption" color="textSecondary">
          Ricardo Vieira Fritsche © 2018
        </Typography>

        {__DEV__ && (
          <div className={classes.dev}>
            <Typography variant="caption" color="textSecondary">
              Simulator:
            </Typography>

            {hasDevice && (
              <Button
                onClick={() => {
                  deviceStore.resetDevice();
                }}
                size="small"
                className={classes.button}
              >
                Reset
              </Button>
            )}
            <Button
              onClick={() => {
                hasDevice
                  ? deviceStore.disconnectDevice()
                  : deviceStore.connectDevice();
              }}
              size="small"
              className={classes.button}
            >
              {hasDevice ? 'Disconnect' : 'Connect'} device
            </Button>
          </div>
        )}
      </div>
    );
  }
}
