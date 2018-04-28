# Knox Wallet Interface

This is the main user interface for the knox wallet. It runs on the browser and was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

It uses:

1. React
2. Redux
3. [Styleguidist](https://react-styleguidist.js.org/docs/documenting.html)

## Development resources

It uses hot module replacement so you just code and see the results.

We use prettier to keep the code style consistent. Active to run prettier on your IDE.

### To mantain redux state on reload

Use debug_session query on the url:

```
http://localhost:3000/?debug_session=whatever
```