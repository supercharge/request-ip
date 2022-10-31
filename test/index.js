'use strict'

const RequestIp = require('../dist')
const { getClientIp } = RequestIp

describe('Request IP: ', () => {
  it('exports a function', async () => {
    expect(getClientIp).toBeInstanceOf(Function)
  })

  it('request headers is undefined', async () => {
    expect(RequestIp.getClientIp()).toBeUndefined()
    expect(RequestIp.getClientIp(null)).toBeUndefined()

    expect(RequestIp.getClientIp({})).toBeUndefined()
    expect(RequestIp.getClientIp(123)).toBeUndefined()
    expect(RequestIp.getClientIp('request')).toBeUndefined()
  })

  it('handles null values', async () => {
    expect(
      RequestIp.getClientIp({ info: { remoteAddress: undefined } })
    ).toBeUndefined()

    expect(
      RequestIp.getClientIp({ info: { remoteAddress: null } })
    ).toBeUndefined()

    expect(
      RequestIp.getClientIp({ headers: { remoteAddress: null } })
    ).toBeUndefined()
  })

  it('x-client-ip', async () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-client-ip': '8.8.8.8' } })
    ).toEqual('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { 'x-client-ip': 'not-an-ip' } })
    ).toBeUndefined()
  })

  it('fastly-client-ip', async () => {
    expect(
      RequestIp.getClientIp({ headers: { 'fastly-client-ip': '8.8.8.8' } })
    ).toEqual('8.8.8.8')
  })

  it('cf-connecting-ip', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'cf-connecting-ip': '8.8.8.8' } })
    ).toEqual('8.8.8.8')
  })

  it('true-client-ip', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'true-client-ip': '8.8.8.8' } })
    ).toEqual('8.8.8.8')
  })

  it('x-real-ip', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-real-ip': '8.8.8.8' } })
    ).toEqual('8.8.8.8')
  })

  it('x-cluster-client-ip', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-cluster-client-ip': '8.8.8.8' } })
    ).toEqual('8.8.8.8')
  })

  it('x-forwarded-for', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': null } })
    ).toBeUndefined()
    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': undefined } })
    ).toBeUndefined()

    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': '8.8.8.8' } })
    ).toEqual('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': '8.8.8.8, 4.4.4.4' } })
    ).toEqual('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': '8.8.8.8, 4.4.4.4, 1.1.1.1' } })
    ).toEqual('8.8.8.8')
  })

  it('x-forwarded-for with masked (unknown) IPs', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': 'unknown, [redacted], 8.8.8.8, 4.4.4.4' } })
    ).toEqual('8.8.8.8')
  })

  it('x-forwarded-for with port', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': 'unknown, 8.8.8.8:443, 4.4.4.4:443' } })
    ).toEqual('8.8.8.8')
  })

  it('forwarded-for', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'forwarded-for': '8.8.8.8' } })
    ).toEqual('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { 'forwarded-for': '8.8.8.8, 4.4.4.4' } })
    ).toEqual('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { 'forwarded-for': 'unknown, unknown, 8.8.8.8, 4.4.4.4' } })
    ).toEqual('8.8.8.8')
  })

  it('x-forwarded', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded': '8.8.8.8' } })
    ).toEqual('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded': '8.8.8.8, 4.4.4.4' } })
    ).toEqual('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded': 'unknown, unknown, 8.8.8.8, 4.4.4.4' } })
    ).toEqual('8.8.8.8')
  })

  it('forwarded', () => {
    expect(
      RequestIp.getClientIp({ headers: { forwarded: '8.8.8.8' } })
    ).toEqual('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { forwarded: '8.8.8.8, 4.4.4.4' } })
    ).toEqual('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { forwarded: 'unknown, unknown, 8.8.8.8, 4.4.4.4' } })
    ).toEqual('8.8.8.8')
  })

  it('request.connection', () => {
    expect(
      RequestIp.getClientIp({ connection: { remoteAddress: '8.8.8.8' } })).toEqual('8.8.8.8')
    expect(
      RequestIp.getClientIp({ connection: { } })
    ).toBeUndefined()

    expect(
      RequestIp.getClientIp({ connection: { remoteAddress: 'not-an-ip-address' } })).toBeUndefined()
  })

  it('request.connection.socket', () => {
    expect(
      RequestIp.getClientIp({ connection: { socket: { remoteAddress: '8.8.8.8' } } })).toEqual('8.8.8.8')
    expect(
      RequestIp.getClientIp({ connection: { socket: { } } })).toBeUndefined()
    expect(
      RequestIp.getClientIp({ connection: { socket: { remoteAddress: 'invalid-ip' } } })).toBeUndefined()
  })

  it('request.socket', () => {
    expect(
      RequestIp.getClientIp({ socket: { remoteAddress: '8.8.8.8' } })).toEqual('8.8.8.8')
    expect(
      RequestIp.getClientIp({ socket: { remoteAddress: 'invalid-ip' } })
    ).toBeUndefined()

    expect(
      RequestIp.getClientIp({ socket: { } })
    ).toBeUndefined()
  })

  it('request.info', () => {
    expect(
      RequestIp.getClientIp({ info: { remoteAddress: '8.8.8.8' } })).toEqual('8.8.8.8')
    expect(
      RequestIp.getClientIp({ info: { remoteAddress: 'invalid-ip' } })
    ).toBeUndefined()

    expect(
      RequestIp.getClientIp({ info: { } })
    ).toBeUndefined()
  })

  it('request.requestContext', () => {
    expect(
      RequestIp.getClientIp({ requestContext: { identity: { sourceIp: '8.8.8.8' } } })
    ).toEqual('8.8.8.8')

    expect(
      RequestIp.getClientIp({ requestContext: { identity: { sourceIp: 'invalid-ip' } } })
    ).toBeUndefined()

    expect(
      RequestIp.getClientIp({ requestContext: { } })
    ).toBeUndefined()

    expect(
      RequestIp.getClientIp({ requestContext: { identity: {} } })
    ).toBeUndefined()
  })

  it('request.raw', () => {
    expect(
      RequestIp.getClientIp({ raw: { info: { remoteAddress: '8.8.8.8' } } })
    ).toEqual('8.8.8.8')

    expect(
      RequestIp.getClientIp({ raw: { info: { remoteAddress: 'invalid-ip' } } })
    ).toBeUndefined()

    expect(
      RequestIp.getClientIp({ raw: { info: {} } })
    ).toBeUndefined()

    expect(
      RequestIp.getClientIp({ raw: { } })
    ).toBeUndefined()
  })

  it('supports IPv6 addresses', () => {
    expect(
      RequestIp.getClientIp({
        connection: { remoteAddress: '2001:0db8:85a3:0000:0000:8a2e:0370:7334' }
      })
    ).toEqual('2001:0db8:85a3:0000:0000:8a2e:0370:7334')

    expect(
      RequestIp.getClientIp({
        headers: { 'x-forwarded-for': '2001:0db8:85a3:0000:0000:8a2e:0370:7334' }
      })
    ).toEqual('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
  })

  it('supports shortened IPv6 addresses', () => {
    expect(
      RequestIp.getClientIp({ connection: { remoteAddress: '2001:db8::2:1' } })
    ).toEqual('2001:db8::2:1')
  })

  it('cf-connecting-ip and x-forwarded-for', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': '8.8.8.8', 'cf-connecting-ip': '4.4.4.4' } })
    ).toEqual('4.4.4.4')
  }
})
