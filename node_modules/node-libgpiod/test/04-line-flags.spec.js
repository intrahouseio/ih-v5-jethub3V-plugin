const assert = require('node:assert');
const gpiod = require('..');

describe('libgpiod LineFlags sugar', () => {
  it('GPIOD_LINE_REQUEST_FLAG_OPEN_DRAIN', done => {
    assert.equal(1, gpiod.LineFlags.GPIOD_LINE_REQUEST_FLAG_OPEN_DRAIN);
    done();
  });

  it('GPIOD_LINE_REQUEST_FLAG_OPEN_SOURCE', done => {
    assert.equal(2, gpiod.LineFlags.GPIOD_LINE_REQUEST_FLAG_OPEN_SOURCE);
    done();
  });

  it('GPIOD_LINE_REQUEST_FLAG_ACTIVE_LOW', done => {
    assert.equal(4, gpiod.LineFlags.GPIOD_LINE_REQUEST_FLAG_ACTIVE_LOW);
    done();
  });

  it('GPIOD_LINE_REQUEST_FLAG_BIAS_DISABLE', done => {
    assert.equal(8, gpiod.LineFlags.GPIOD_LINE_REQUEST_FLAG_BIAS_DISABLE);
    done();
  });

  it('GPIOD_LINE_REQUEST_FLAG_BIAS_PULL_DOWN', done => {
    assert.equal(16, gpiod.LineFlags.GPIOD_LINE_REQUEST_FLAG_BIAS_PULL_DOWN);
    done();
  });

  it('GPIOD_LINE_REQUEST_FLAG_BIAS_PULL_UP', done => {
    assert.equal(32, gpiod.LineFlags.GPIOD_LINE_REQUEST_FLAG_BIAS_PULL_UP);
    done();
  });
});
