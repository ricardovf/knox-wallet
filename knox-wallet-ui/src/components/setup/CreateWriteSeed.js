import React from 'react';
import Typography from '@material-ui/core/Typography';
import BasePaper, { paperWidth, styles as baseStyle } from './BasePaper';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { inject, observer } from 'mobx-react';
import { computed, observable, action, runInAction } from 'mobx';
import { task } from 'mobx-task';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';

const styles = theme => {
  return {
    ...baseStyle(theme),
    mainTitle: {
      marginBottom: theme.spacing.unit * 3,
      fontWeight: 500,
    },
    buttons: {
      textAlign: 'right',
    },
    wordsPaper: {
      textAlign: 'center',
    },
    word: {
      color: theme.palette.secondary.main,
      '& span': {
        color: theme.palette.text.secondary,
        fontWeight: '300',
      },
    },
    buttonProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12,
    },
  };
};

@withStyles(styles)
@inject('appStore', 'deviceStore')
@observer
export default class CreateWriteSeed extends React.Component {
  wordList = [];

  @observable
  currentWord = 0;

  @observable
  step = 0;

  @observable
  agreeCount = 0;

  @computed
  get allTermsChecked() {
    return this.agreeCount === 3;
  }

  @action.bound
  changeAgree(event) {
    if (event.target) this.agreeCount += event.target.checked ? 1 : -1;
    else this.agreeCount = event;
  }

  generateAndShowWords = task(
    async () => {
      try {
        let words = await this.props.deviceStore.randomSeedWords();
        runInAction(() => {
          this.wordList = words;
          this.step = 1;
        });
        return true;
      } catch (e) {}

      return false;
    },
    { state: undefined }
  );

  finishPrepareSeed = task(
    async () => {
      try {
        await this.props.deviceStore.prepareSeed(this.wordList);
        return true;
      } catch (e) {}

      return false;
    },
    { state: undefined }
  );

  @action.bound
  showNextWord() {
    if (this.step === 1) this.currentWord++;
  }

  @action.bound
  showPreviousWord() {
    if (this.step === 1) this.currentWord--;
  }

  render() {
    const { classes } = this.props;

    if (this.step === 0) {
      return (
        <div>
          <div className={classes.paperSpaceMedium}>
            <Typography variant="subheading" className={classes.mainTitle}>
              You will now see the recovery seed of your new wallet. It’s
              mandatory that you write down on paper all the words in the exact
              correct order.
            </Typography>

            <Typography variant="subheading" color="secondary" paragraph>
              Please note that this unique combination of 24 words is the ONLY
              WAY to recover your wallet if you lose your device. After this
              step, the words will NEVER be shown again.
            </Typography>

            <FormGroup>
              <FormControlLabel
                control={<Checkbox onChange={this.changeAgree} value="1" />}
                label="I won't make a digital copy of my recovery seed or upload it online."
              />
              <FormControlLabel
                control={<Checkbox onChange={this.changeAgree} value="1" />}
                label="I will write down on paper my recovery seed and store it on a safe place."
              />
              <FormControlLabel
                control={<Checkbox onChange={this.changeAgree} value="1" />}
                label="I've read all the information above and I understand that I'm the only responsible for any financial losses incurred through the improper care of sensitive information related to my recovery seed."
              />
            </FormGroup>
          </div>
          <div className={classes.buttons}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={
                !this.allTermsChecked || this.generateAndShowWords.pending
              }
              onClick={() => {
                this.generateAndShowWords();
              }}
            >
              Continue
              {this.generateAndShowWords.state !== undefined &&
                this.generateAndShowWords.pending && (
                  <CircularProgress
                    size={24}
                    className={classes.buttonProgress}
                  />
                )}
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <div className={classes.paperSpaceMedium + ' ' + classes.wordsPaper}>
            <Typography
              variant="subheading"
              gutterBottom
              className={classes.mainTitle}
            >
              Write down the word {this.currentWord + 1} of 24
            </Typography>

            <Typography variant="title" gutterBottom className={classes.word}>
              <span>{this.currentWord + 1}.</span>{' '}
              {this.wordList[this.currentWord]}
            </Typography>
          </div>
          <div className={classes.buttons}>
            <Button
              className={classes.button}
              onClick={this.showPreviousWord}
              disabled={this.currentWord === 0}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={
                this.currentWord === 23
                  ? this.finishPrepareSeed
                  : this.showNextWord
              }
            >
              {this.currentWord === 23 ? 'Finish' : 'Next word'}
            </Button>
          </div>
        </div>
      );
    }
  }
}
