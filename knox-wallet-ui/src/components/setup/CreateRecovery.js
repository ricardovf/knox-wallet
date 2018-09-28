import React from 'react';
import Typography from '@material-ui/core/Typography';
import BasePaper, { paperWidth, styles as baseStyle } from './BasePaper';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CreateSteps from './CreateSteps';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

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
      marginBottom: theme.spacing.unit * 3,
      fontWeight: 500,
    },
    buttons: {
      textAlign: 'right',
    },
  };
};

@withStyles(styles, { withTheme: true })
export default class CreateRecovery extends BasePaper {
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
        <div className={classes.paperSpaceMedium}>
          <Typography variant="subheading" className={classes.mainTitle}>
            You will now see the recovery seed of your new wallet. It’s
            mandatory that you write down on paper all the words in the exact
            correct order.
          </Typography>

          <Typography variant="subheading" color="secondary" paragraph>
            Please note that this unique combination of 24 words is the ONLY WAY
            to recover your wallet if you lose your device. After this step, the
            words will NEVER be shown again.
          </Typography>

          <FormGroup>
            <FormControlLabel
              control={<Checkbox value="1" />}
              label="I won't make a digital copy of my recovery seed or upload it online."
            />
            <FormControlLabel
              control={<Checkbox value="2" />}
              label="I will write down on paper my recovery seed and store it on a safe place."
            />
            <FormControlLabel
              control={<Checkbox value="3" />}
              label="I've read all the information above and I understand that I'm the only responsible for any financial losses incurred through the improper care of sensitive information related to my recovery seed."
            />
          </FormGroup>
        </div>
        <div className={classes.buttons}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            href="/create-recovery"
          >
            Continue
          </Button>
        </div>
      </div>
    );

    return super.render();
  }
}
