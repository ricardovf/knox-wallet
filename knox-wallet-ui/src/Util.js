export const __DEV__ = !(
  process &&
  process.env &&
  process.env.NODE_ENV === 'production'
);
