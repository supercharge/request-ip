'use strict'

const RequestIp = require('..')
const { getClientIp } = require('..')

const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()

describe('Request IP: ', () => {
  it('exports a function', async () => {
    expect(getClientIp).to.be.a.function()
  })

  it('request headers is undefined', async () => {
    expect(RequestIp.getClientIp()).to.be.undefined()
    expect(RequestIp.getClientIp(null)).to.be.undefined()

    expect(RequestIp.getClientIp({})).to.be.undefined()
    expect(RequestIp.getClientIp(123)).to.be.undefined()
    expect(RequestIp.getClientIp('request')).to.be.undefined()
  })

  it('handles null values', async () => {
    expect(
      RequestIp.getClientIp({ info: { remoteAddress: undefined } })
    ).to.be.undefined()

    expect(
      RequestIp.getClientIp({ info: { remoteAddress: null } })
    ).to.be.undefined()

    expect(
      RequestIp.getClientIp({ headers: { remoteAddress: null } })
    ).to.be.undefined()
  })

  it('x-client-ip', async () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-client-ip': '8.8.8.8' } })
    ).to.equal('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { 'x-client-ip': 'not-an-ip' } })
    ).to.be.undefined()
  })

  it('fastly-client-ip', async () => {
    expect(
      RequestIp.getClientIp({ headers: { 'fastly-client-ip': '8.8.8.8' } })
    ).to.equal('8.8.8.8')
  })

  it('cf-connecting-ip', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'cf-connecting-ip': '8.8.8.8' } })
    ).to.equal('8.8.8.8')
  })

  it('true-client-ip', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'true-client-ip': '8.8.8.8' } })
    ).to.equal('8.8.8.8')
  })

  it('x-real-ip', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-real-ip': '8.8.8.8' } })
    ).to.equal('8.8.8.8')
  })

  it('x-cluster-client-ip', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-cluster-client-ip': '8.8.8.8' } })
    ).to.equal('8.8.8.8')
  })

  it('x-forwarded-for', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': null } })
    ).to.be.undefined()
    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': undefined } })
    ).to.be.undefined()

    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': '8.8.8.8' } })
    ).to.equal('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': '8.8.8.8, 4.4.4.4' } })
    ).to.equal('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': '8.8.8.8, 4.4.4.4, 1.1.1.1' } })
    ).to.equal('8.8.8.8')
  })

  it('x-forwarded-for with masked (unknown) IPs', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': 'unknown, [redacted], 8.8.8.8, 4.4.4.4' } })
    ).to.equal('8.8.8.8')
  })

  it('x-forwarded-for with port', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded-for': 'unknown, 8.8.8.8:443, 4.4.4.4:443' } })
    ).to.equal('8.8.8.8')
  })

  it('forwarded-for', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'forwarded-for': '8.8.8.8' } })
    ).to.equal('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { 'forwarded-for': '8.8.8.8, 4.4.4.4' } })
    ).to.equal('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { 'forwarded-for': 'unknown, unknown, 8.8.8.8, 4.4.4.4' } })
    ).to.equal('8.8.8.8')
  })

  it('x-forwarded', () => {
    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded': '8.8.8.8' } })
    ).to.equal('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded': '8.8.8.8, 4.4.4.4' } })
    ).to.equal('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { 'x-forwarded': 'unknown, unknown, 8.8.8.8, 4.4.4.4' } })
    ).to.equal('8.8.8.8')
  })

  it('forwarded', () => {
    expect(
      RequestIp.getClientIp({ headers: { forwarded: '8.8.8.8' } })
    ).to.equal('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { forwarded: '8.8.8.8, 4.4.4.4' } })
    ).to.equal('8.8.8.8')

    expect(
      RequestIp.getClientIp({ headers: { forwarded: 'unknown, unknown, 8.8.8.8, 4.4.4.4' } })
    ).to.equal('8.8.8.8')
  })

  it('request.connection', () => {
    expect(
      RequestIp.getClientIp({ connection: { remoteAddress: '8.8.8.8' } })).to.equal('8.8.8.8')
    expect(
      RequestIp.getClientIp({ connection: { } })
    ).to.be.undefined()

    expect(
      RequestIp.getClientIp({ connection: { remoteAddress: 'not-an-ip-address' } })).to.be.undefined()
  })

  it('request.connection.socket', () => {
    expect(
      RequestIp.getClientIp({ connection: { socket: { remoteAddress: '8.8.8.8' } } })).to.equal('8.8.8.8')
    expect(
      RequestIp.getClientIp({ connection: { socket: { } } })).to.be.undefined()
    expect(
      RequestIp.getClientIp({ connection: { socket: { remoteAddress: 'invalid-ip' } } })).to.be.undefined()
  })

  it('request.socket', () => {
    expect(
      RequestIp.getClientIp({ socket: { remoteAddress: '8.8.8.8' } })).to.equal('8.8.8.8')
    expect(
      RequestIp.getClientIp({ socket: { remoteAddress: 'invalid-ip' } })
    ).to.be.undefined()

    expect(
      RequestIp.getClientIp({ socket: { } })
    ).to.be.undefined()
  })

  it('request.info', () => {
    expect(
      RequestIp.getClientIp({ info: { remoteAddress: '8.8.8.8' } })).to.equal('8.8.8.8')
    expect(
      RequestIp.getClientIp({ info: { remoteAddress: 'invalid-ip' } })
    ).to.be.undefined()

    expect(
      RequestIp.getClientIp({ info: { } })
    ).to.be.undefined()
  })

  it('request.requestContext', () => {
    expect(
      RequestIp.getClientIp({ requestContext: { identity: { sourceIp: '8.8.8.8' } } })
    ).to.equal('8.8.8.8')

    expect(
      RequestIp.getClientIp({ requestContext: { identity: { sourceIp: 'invalid-ip' } } })
    ).to.be.undefined()

    expect(
      RequestIp.getClientIp({ requestContext: { } })
    ).to.be.undefined()

    expect(
      RequestIp.getClientIp({ requestContext: { identity: {} } })
    ).to.be.undefined()
  })

  it('request.raw', () => {
    expect(
      RequestIp.getClientIp({ raw: { info: { remoteAddress: '8.8.8.8' } } })
    ).to.equal('8.8.8.8')

    expect(
      RequestIp.getClientIp({ raw: { info: { remoteAddress: 'invalid-ip' } } })
    ).to.be.undefined()

    expect(
      RequestIp.getClientIp({ raw: { info: {} } })
    ).to.be.undefined()

    expect(
      RequestIp.getClientIp({ raw: { } })
    ).to.be.undefined()
  })

  it('supports IPv6 addresses', () => {
    expect(
      RequestIp.getClientIp({
        connection: { remoteAddress: '2001:0db8:85a3:0000:0000:8a2e:0370:7334' }
      })
    ).to.equal('2001:0db8:85a3:0000:0000:8a2e:0370:7334')

    expect(
      RequestIp.getClientIp({
        headers: { 'x-forwarded-for': '2001:0db8:85a3:0000:0000:8a2e:0370:7334' }
      })
    ).to.equal('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
  })

  it('supports shortened IPv6 addresses', () => {
    expect(
      RequestIp.getClientIp({ connection: { remoteAddress: '2001:db8::2:1' } })
    ).to.equal('2001:db8::2:1')
  })
})
