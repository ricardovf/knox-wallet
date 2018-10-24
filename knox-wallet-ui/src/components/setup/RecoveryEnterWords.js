import React from 'react';
import Typography from '@material-ui/core/Typography';
import { styles as baseStyle } from './BasePaper';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { inject, observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import { task } from 'mobx-task';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';

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
export default class RecoveryEnterWords extends React.Component {
  wordList = [];

  @observable
  currentWord = 0;

  @observable
  currentWordText = '';

  @computed
  get currentWordIsValid() {
    return this.currentWordText.trim().length > 0;
  }

  @observable
  wordCount = 24;

  @observable
  step = 0;

  @computed
  get formValid() {
    return [12, 15, 18, 21, 24].includes(this.wordCount);
  }

  @action.bound
  changeWordCount(event) {
    if (event.target) this.wordCount = event.target.value;
    else this.wordCount = event;

    this.wordCount = parseInt(this.wordCount, 10);
  }

  commitWordAndPrepareSeed = task(
    async () => {
      this.wordList[this.currentWord] = this.currentWordText;

      try {
        await this.props.deviceStore.prepareSeed(this.wordList);
        return true;
      } catch (e) {}

      return false;
    },
    { state: undefined }
  );

  @action.bound
  changeWordText(event) {
    if (this.step === 1) this.currentWordText = event.target.value;
  }

  @action.bound
  collectWords() {
    this.currentWord = 0;
    this.currentWordText = this.wordList[this.currentWord] || '';
    this.step = 1;
  }

  @action.bound
  commitWordAndGoToNext() {
    if (this.step === 1) {
      this.wordList[this.currentWord] = this.currentWordText;
      this.currentWord++;
      this.currentWordText = this.wordList[this.currentWord] || '';
    }
  }

  @action.bound
  goToPreviousWord() {
    if (this.step === 1) {
      this.currentWord--;

      if (this.currentWord === -1) {
        this.currentWord = 0;
        this.step = 0;
      } else {
        this.currentWordText = this.wordList[this.currentWord] || '';
      }
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.step === 1 && this._wordInput) {
      this._wordInput.focus();
    }
  }

  render() {
    const { classes } = this.props;

    if (this.step === 0) {
      return (
        <div>
          <div className={classes.paperSpaceMedium + ' ' + classes.flexCenter}>
            <Typography variant="subheading" className={classes.mainTitle}>
              Number of words on your seed
            </Typography>

            <RadioGroup
              row
              aria-label="word-count"
              name="word-count"
              value={this.wordCount}
              onChange={this.changeWordCount}
            >
              <FormControlLabel control={<Radio />} value={12} label="12" />
              <FormControlLabel control={<Radio />} value={15} label="15" />
              <FormControlLabel control={<Radio />} value={18} label="18" />
              <FormControlLabel control={<Radio />} value={21} label="21" />
              <FormControlLabel control={<Radio />} value={24} label="24" />
            </RadioGroup>
          </div>
          <div className={classes.buttons}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={!this.formValid}
              onClick={this.collectWords}
            >
              Continue
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
              Type the {this.currentWord + 1}
              th word
            </Typography>

            <TextField
              inputRef={input => (this._wordInput = input)}
              value={
                this.currentWordText
                  ? this.currentWordText
                  : this.wordList[this.currentWord]
                    ? this.wordList[this.currentWord]
                    : ''
              }
              onChange={this.changeWordText}
              className={classes.input}
              fullWidth
              inputProps={{
                'aria-label': 'Name',
              }}
            />
          </div>
          <div className={classes.buttons}>
            <Button className={classes.button} onClick={this.goToPreviousWord}>
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={!this.currentWordIsValid}
              onClick={
                this.currentWord === this.wordCount - 1
                  ? this.commitWordAndPrepareSeed
                  : this.commitWordAndGoToNext
              }
            >
              {this.currentWord === this.wordCount - 1 ? 'Finish' : 'Next word'}
            </Button>
          </div>
        </div>
      );
    }
  }
}
