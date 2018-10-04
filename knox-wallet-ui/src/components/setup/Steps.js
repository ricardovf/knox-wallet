import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

const styles = theme => ({
  root: {
    width: '100%',
  },
  stepper: {
    paddingBottom: 0,
  },
});

@withStyles(styles)
export default class Steps extends React.Component {
  isStepDone = step => {
    return step < this.props.currentStep;
  };

  render() {
    const { classes, steps, currentStep } = this.props;

    return (
      <div className={classes.root}>
        <Stepper className={classes.stepper} activeStep={currentStep}>
          {steps.map((label, index) => {
            const props = {};
            const labelProps = {};
            if (this.isStepDone(index)) props.completed = true;

            return (
              <Step key={label} {...props}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </div>
    );
  }
}

Steps.propTypes = {
  classes: PropTypes.object,
  steps: PropTypes.array,
  currentStep: PropTypes.number,
};
