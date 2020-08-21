'use strict'

import Net from 'net'
import { InteractsWithHeaders } from './interacts-with-headers'

export class Request extends InteractsWithHeaders {
  /**
   * The wrapped request instance.
   */
  private readonly request: any

  /**
   * Create a new instance for the given `request`.
   *
   * @param {Object} request
   */
  constructor (request: any) {
    request = request || {}

    super(request.headers)

    this.request = request
  }

  /**
   * Returns the client IP address.
   *
   * @returns {String | undefined}
   */
  getClientIp (): string | undefined {
    return this.fromHeaders() ??
     this.fromConnection() ??
     this.fromSocket() ??
     this.fromInfo() ??
     this.fromRaw() ??
     this.fromRequestContext()
  }

  /**
   * Returns the IP address if available in the HTTP request headers.
   *
   * @returns {String | undefined}
   */
  fromHeaders (): undefined | string {
    if (this.hasHeaders()) {
      // nginx (if configured), load balancers (AWS ELB), and other proxies
      if (this.hasIpInForwardedFor()) {
        return this.getFromForwardedFor()
      }

      // Heroku, AWS EC2, nginx (if configured), and others
      if (this.hasIpInHeader('x-client-ip')) {
        return this.ipInHeader('x-client-ip')
      }

      // used by some proxies, like nginx
      if (this.hasIpInHeader('x-real-ip')) {
        return this.header('x-real-ip')
      }

      // Cloudflare
      if (this.hasIpInHeader('cf-connecting-ip')) {
        return this.header('cf-connecting-ip')
      }

      // Fastly and Firebase
      if (this.hasIpInHeader('fastly-client-ip')) {
        return this.header('fastly-client-ip')
      }

      // Akamai, Cloudflare
      if (this.hasIpInHeader('true-client-ip')) {
        return this.header('true-client-ip')
      }

      // Rackspace
      if (this.hasIpInHeader('x-cluster-client-ip')) {
        return this.header('x-cluster-client-ip')
      }
    }
  }

  /**
   * Determine whether a valid IP address is available in the “x-forwarded-for” HTTP header.
   *
   * @returns {Boolean}
   */
  hasIpInForwardedFor (): boolean {
    return this.isIp(
      this.getFromForwardedFor()
    )
  }

  /**
   * Returns the IP address if available from the “x-forwarded-for” HTTP header.
   *
   * @returns {String | undefined}
   */
  getFromForwardedFor (): string | undefined {
    if (this.hasIpInHeader('x-forwarded-for')) {
      return this.ipInHeader('x-forwarded-for')
    }

    if (this.hasIpInHeader('x-forwarded')) {
      return this.ipInHeader('x-forwarded')
    }

    if (this.hasIpInHeader('forwarded-for')) {
      return this.ipInHeader('forwarded-for')
    }

    if (this.hasIpInHeader('forwarded')) {
      return this.ipInHeader('forwarded')
    }
  }

  /**
   * Determine whether the request IP comes from the given header `name`.
   *
   * @param {String} name - the header name
   *
   * @returns {Boolean}
   */
  hasIpInHeader (name: string): boolean {
    return !!this.ipInHeader(name)
  }

  /**
   * Returns the first IP address from the `name`d header.
   *
   * @param {String} name
   *
   * @returns {String | undefined}
   */
  ipInHeader (name: string): string | undefined {
    return this.findIp(
      this.header(name)?.split(',')
    )
  }

  /**
   * Returns the first valid IP address from the list of IP address candidates.
   *
   * @param {Array} ips
   *
   * @returns {String | undefined}
   */
  findIp (ips: string[] = []): string | undefined {
    return ips
      .map(ip => ip.trim())
      .map(ip => this.removePortFrom(ip))
      .find(ip => this.isIp(ip))
  }

  /**
   * Returns the plain IP v4 address without the port number.
   *
   * @param {String} ip
   *
   * @returns {String}
   */
  removePortFrom (ip: string): string {
    if (this.isIpv6(ip)) {
      return ip
    }

    return ip.includes(':')
      ? ip.split(':')[0]
      : ip
  }

  /**
   * Returns the IP address if available in the request connection.
   *
   * @returns {String | undefined}
   */
  fromConnection (): undefined | string {
    if (!this.hasConnection()) {
      return
    }

    if (this.isIp(this.request.connection.remoteAddress)) {
      return this.request.connection.remoteAddress
    }

    if (!this.request.connection.socket) {
      return
    }

    if (this.isIp(this.request.connection.socket.remoteAddress)) {
      return this.request.connection.socket.remoteAddress
    }
  }

  /**
   * Determine whether the request has a `connection` object assigned.
   *
   * @returns {Boolean}
   */
  hasConnection (): boolean {
    return !!this.request.connection
  }

  /**
   * Returns the IP address if available in the request socket.
   *
   * @returns {String | undefined}
   */
  fromSocket (): undefined | string {
    if (!this.hasSocket()) {
      return
    }

    if (this.isIp(this.request.socket.remoteAddress)) {
      return this.request.socket.remoteAddress
    }
  }

  /**
   * Determine whether the request has a `socket` object assigned.
   *
   * @returns {Boolean}
   */
  hasSocket (): boolean {
    return !!this.request.socket
  }

  /**
   * Returns the IP address if available in the request info object.
   *
   * @returns {String | undefined}
   */
  fromInfo (): undefined | string {
    if (!this.hasInfo()) {
      return
    }

    if (this.isIp(this.request.info.remoteAddress)) {
      return this.request.info.remoteAddress
    }
  }

  /**
   * Determine whether the request has an `info` object assigned.
   *
   * @returns {Boolean}
   */
  hasInfo (): boolean {
    return !!this.request.info
  }

  /**
   * Returns the IP address if available from the raw request object. The
   * `raw` request object is typically available in web frameworks like
   * Fastify or hapi providing the original Node.js request instance.
   *
   * @returns {String | undefined}
   */
  fromRaw (): undefined | string {
    if (this.hasRaw()) {
      return new Request(this.request.raw).getClientIp()
    }
  }

  /**
   * Determine whether the request has a `requestContext` object assigned.
   *
   * @returns {Boolean}
   */
  hasRaw (): boolean {
    return !!this.raw()
  }

  /**
   * Returns the raw request object.
   *
   * @returns {Object}
   */
  raw (): object | undefined {
    return this.request.raw
  }

  /**
   * Returns the IP address if available in the request context. The request
   * context is typically available in serverless functions, like AWS Lambda.
   *
   * @returns {String | undefined}
   */
  fromRequestContext (): undefined | string {
    // AWS API Gateway/Lambda
    if (!this.hasRequestContext()) {
      return
    }

    if (!this.requestContext().identity) {
      return
    }

    if (this.isIp(this.requestContext().identity.sourceIp)) {
      return this.requestContext().identity.sourceIp
    }
  }

  /**
   * Determine whether the request has a `requestContext` object assigned.
   *
   * @returns {Boolean}
   */
  hasRequestContext (): boolean {
    return !!this.requestContext()
  }

  /**
   * Returns the request context.
   *
   * @returns {*}
   */
  requestContext (): any {
    return this.request.requestContext
  }

  /**
   * Determine whether it’s a valid `ip` address.
   *
   * @param {String} ip
   *
   * @returns {Boolean}
   */
  isIp (ip?: string): boolean {
    ip = ip ?? ''

    return this.isIpv4(ip) || this.isIpv6(ip)
  }

  /**
   * Determine whether the given `ip` address is a valid IP v4 address.
   *
   * @param {String} ip
   *
   * @returns {Boolean}
   */
  isIpv4 (ip: string): boolean {
    return Net.isIP(ip) === 4
  }

  /**
   * Determine whether the given `ip` address is a valid IP v4 address.
   *
   * @param {String} ip
   *
   * @returns {Boolean}
   */
  isIpv6 (ip: string): boolean {
    return Net.isIP(ip) === 6
  }
}
