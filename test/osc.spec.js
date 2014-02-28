var OSC = new OSC();

describe('A suite', function() {
  it('returns the answer to all questions', function() {
    expect(OSC.answer()).toEqual(42);
  });
});
