const rewireReactHotLoader = require('react-app-rewire-hot-loader');
const rewireMobX = require('react-app-rewire-mobx');
const { compose } = require('react-app-rewired');

module.exports = compose(
  rewireReactHotLoader,
  rewireMobX
);

// module.exports = function(config, env) {
//   const rewires = compose(
//     rewireReactHotLoader,
//     rewireMobX
//   );
//
//   return rewires(config, env);
// };
