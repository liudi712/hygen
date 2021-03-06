import { configLookup, ConfigResolver } from '../config'
import L from 'lodash'

describe('config lookup', () => {
  it('sanitizes bad "from" path', () => {
    const p = L.find(configLookup('.myconfig', 'foo'), f =>
      f.match(/foo\/\.myconfig/)
    )
    expect(p).toBeDefined()
  })

  it('looks up configuration upwards', () => {
    expect(configLookup('.myconfig', '/')).toEqual(['/.myconfig'])
    expect(configLookup('.myconfig', '/one')).toEqual([
      '/one/.myconfig',
      '/.myconfig'
    ])
    expect(configLookup('.myconfig', '/users/foo/bar/baz')).toEqual([
      '/users/foo/bar/baz/.myconfig',
      '/users/foo/bar/.myconfig',
      '/users/foo/.myconfig',
      '/users/.myconfig',
      '/.myconfig'
    ])
  })
})

describe('resolver', () => {
  it('resolves closest file', async () => {
    const exists = jest.fn()
    exists.mockReturnValue(Promise.resolve(true))

    const load = jest.fn()
    load.mockReturnValue(Promise.resolve({ param: 1 }))

    const resolver = new ConfigResolver('.hygen.js', {
      exists,
      load
    })
    const config = await resolver.resolve('/foo/bar')

    expect(exists).toMatchSnapshot()
    expect(load).toMatchSnapshot()
    expect(config).toEqual({ param: 1 })
  })

  it('resolves a file in the walk path', async () => {
    const exists = jest.fn(f => f === '/foo/.hygen.js')

    const load = jest.fn()
    load.mockReturnValue(Promise.resolve({ param: 1 }))

    const resolver = new ConfigResolver('.hygen.js', {
      exists,
      load
    })
    const config = await resolver.resolve('/foo/bar')

    expect(exists).toMatchSnapshot()
    expect(load).toMatchSnapshot()
    expect(config).toEqual({ param: 1 })
  })
})
