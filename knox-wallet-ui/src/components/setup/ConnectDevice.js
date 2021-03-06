import React from 'react';
import Typography from '@material-ui/core/Typography';
import BasePaper, { styles as baseStyle } from './BasePaper';
import usb from '../../media/img/usb.png';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => {
  return {
    ...baseStyle(theme),
    usb: {
      marginTop: theme.spacing.unit * 4,
    },
  };
};

@withStyles(styles)
export default class InstallConnector extends BasePaper {
  render() {
    const { classes } = this.props;

    // if (!this.state.connected) {
    this.content = (
      <div className={classes.paperSpaceLarge}>
        <Typography variant="headline" gutterBottom>
          Connect your device to continue
        </Typography>
        <img src={usb} className={classes.usb} />
      </div>
    );
    // } else {
    //   this.content = (
    //     <div className={classes.paperSpaceLarge}>
    //       <Typography variant="headline" gutterBottom>
    //         Device connected
    //       </Typography>
    //       <Link to="/create-or-recovery">
    //         <img src={usb} className={classes.usb} />
    //       </Link>
    //     </div>
    //   );
    // }

    return super.render();
  }
}
