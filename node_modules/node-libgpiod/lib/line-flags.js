/**
 * Line flags are needed to modify the way input behaves, as can be seen in the
 * 1.6.x series:
 *
 * https://git.kernel.org/pub/scm/libs/libgpiod/libgpiod.git/tree/include/gpiod.h?h=v1.6.x#n990
 * https://git.kernel.org/pub/scm/libs/libgpiod/libgpiod.git/tree/tests/tests-line.c?h=v1.6.x#n464
 *
 * It was defined here because from 1.4 to 1.6 version, a few extra values
 * appeared and currently node-gyp does not behave well with compile flags.
 * 
 * Also check the index.d.ts for those values under LineFlags type.
 *
 */
module.exports = {
  get GPIOD_LINE_REQUEST_FLAG_OPEN_DRAIN() {
    return 1;
  },
  get GPIOD_LINE_REQUEST_FLAG_OPEN_SOURCE() {
    return 2;
  },
  get GPIOD_LINE_REQUEST_FLAG_ACTIVE_LOW() {
    return 4;
  },
  get GPIOD_LINE_REQUEST_FLAG_BIAS_DISABLE() {
    return 8;
  },
  get GPIOD_LINE_REQUEST_FLAG_BIAS_PULL_DOWN() {
    return 16;
  },
  get GPIOD_LINE_REQUEST_FLAG_BIAS_PULL_UP() {
    return 32;
  },
};
