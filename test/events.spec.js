import chai, { expect } from 'chai'
import spies from 'chai-spies-next'

import EventHandler from '../src/events'
import Message from '../src/message'

chai.use(spies)

/** @test {EventHandler} */
describe('EventHandler', () => {
  let handler

  before(() => {
    handler = new EventHandler()
  })

  /** @test {EventHandler#on} */
  describe('on', () => {
    let spy
    let id

    before(() => {
      spy = chai.spy()
      id = handler.on('/test/path', spy)
    })

    it('returns different subscription ids for each listener', () => {
      const anotherId = handler.on(['test', 'path'], () => {})
      expect(id !== anotherId).to.be.true
    })

    it('registers a handler which can be called', () => {
      handler.notify('/test/path', {})
      expect(spy).to.have.been.called()
    })
  })

  /** @test {EventHandler#off} */
  describe('off', () => {
    let spy
    let id

    before(() => {
      spy = chai.spy()
      id = handler.on('/test/path', spy)
    })

    it('removes a handler', () => {
      const success = handler.off('/test/path', id)
      handler.notify('/test/path', {})

      expect(spy).to.not.have.been.called()
      expect(success).to.be.true
    })

    it('returns false when handler was not found', () => {
      const success = handler.off('/test/path/which/does/not/exist', id)
      expect(success).to.be.false
    })
  })

  /** @test {EventHandler#notify} */
  describe('notify', () => {
    const testdata = {
      test: 'data',
    }

    const spy = []

    before(() => {
      for (let i = 0; i < 9; i += 1) {
        spy.push(chai.spy())
      }

      handler.on('/', spy[0])
      handler.on('/one/test', spy[1])
      handler.on('/and/another', spy[2])
      handler.on('/two/test/path', spy[3])
      handler.on(['two', 'test', 'path'], spy[4])
      handler.on('/two/some/path', spy[5])

      handler.on('error', spy[6])
      handler.on('close', spy[7])
      handler.on('open', spy[8])
    })

    afterEach(() => {
      spy.forEach((item) => {
        item.reset()
      })
    })

    it('passes over the event data', () => {
      handler.notify('/and/another', testdata)
      expect(spy[2]).to.have.been.called.with(testdata)
    })

    it('accepts messages', () => {
      handler.notify(new Message(['and', 'another']))
      expect(spy[2]).to.have.been.called()
    })

    it('accepts binary packets', () => {
      const binary = new Uint8Array([
        47, 97, 110, 100, 47, 97, 110,
        111, 116, 104, 101, 114, 0, 0, 0, 0, 44, 0, 0, 0,
      ])

      handler.notify(binary)
      expect(spy[2]).to.have.been.called()
    })

    describe('event listeners', () => {
      it('notifies error callbacks', () => {
        handler.notify('error', testdata)
        expect(spy[6]).to.have.been.called.with(testdata)
      })

      it('notifies close callbacks', () => {
        handler.notify('close', testdata)
        expect(spy[7]).to.have.been.called.with(testdata)
      })

      it('notifies open callbacks', () => {
        handler.notify('open', testdata)
        expect(spy[8]).to.have.been.called.with(testdata)
      })
    })

    describe('address listeners with timetags', () => {
      it('calls the handler later', () => {
        handler.notify('/', testdata, Date.now() + 5000)

        expect(spy[0]).to.not.have.been.called()
      })
    })

    describe('address listeners', () => {
      it('calls the root listener', () => {
        handler.notify('/', testdata)

        expect(spy[0]).to.have.been.called()
        expect(spy[1]).to.not.have.been.called()
        expect(spy[4]).to.not.have.been.called()
      })

      it('calls two listeners with the same address', () => {
        handler.notify('/two/test/path', testdata)

        expect(spy[3]).to.have.been.called()
        expect(spy[4]).to.have.been.called()
      })

      it('works with {} wildcard', () => {
        handler.notify('/two/{test,some}/path', testdata)

        expect(spy[1]).to.not.have.been.called()
        expect(spy[3]).to.have.been.called()
        expect(spy[4]).to.have.been.called()
        expect(spy[5]).to.have.been.called()
      })

      it('works with [] wildcard', () => {
        handler.notify('/[pawgfo]ne/[bnit]est', testdata)

        expect(spy[1]).to.have.been.called()
        expect(spy[2]).to.not.have.been.called()
      })

      it('works with [!] wildcard', () => {
        handler.notify('/two/[!s][eso][tspm][tea]/path', testdata)

        expect(spy[3]).have.been.called()
        expect(spy[5]).not.have.been.called()
      })

      it('works with [a-z] wildcard', () => {
        handler.notify('/two/[a-z]est/p[a-c]t[e-i]', testdata)

        expect(spy[3]).have.been.called()
        expect(spy[5]).not.have.been.called()
      })

      it('works with * wildcard', () => {
        handler.notify('/two/*', testdata)

        expect(spy[3]).have.been.called()
        expect(spy[4]).have.been.called()
        expect(spy[5]).have.been.called()
        expect(spy[1]).not.have.been.called()
      })

      it('works with * wildcard calling all', () => {
        handler.notify('/*', testdata)

        expect(spy[0]).have.been.called()
        expect(spy[1]).have.been.called()
        expect(spy[2]).have.been.called()
        expect(spy[3]).have.been.called()
        expect(spy[4]).have.been.called()
        expect(spy[5]).have.been.called()
      })

      it('works with ? wildcard', () => {
        handler.notify('/two/????/pa?h', testdata)

        expect(spy[0]).not.have.been.called()
        expect(spy[3]).have.been.called()
        expect(spy[5]).have.been.called()
      })
    })
  })
})
