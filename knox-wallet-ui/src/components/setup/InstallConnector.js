import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import BasePaper, { styles } from './BasePaper';

@withStyles(styles, { withTheme: true })
export default class InstallConnector extends BasePaper {
  render() {
    const { classes } = this.props;

    this.content = (
      <div className={classes.paperSpaceLarge}>
        <Typography variant="headline" gutterBottom>
          To start using your secure wallet, please install the KNOX connector
        </Typography>
        <Typography variant="subheading" color="textSecondary" paragraph>
          This software will facilitate the comunication between your device and
          the wallet interface running on the browser.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          href="/usb"
        >
          <Icon className={classes.leftIcon}>cloud_download</Icon>
          Download
        </Button>

        <Typography variant="caption" color="textSecondary">
          Version 1.1 for Mac OSX
        </Typography>
      </div>
    );

    return super.render();
  }
}
