'use strict'

export class InteractsWithHeaders {
  /**
   * The wrapped request instance.
   */
  private readonly _headers: Map<string, string>

  /**
   * Create a new instance for the given `request`.
   *
   * @param {Object} headers
   */
  constructor (headers: any) {
    this._headers = this.asMap(headers || {})
  }

  /**
   * Returns the request headers.
   *
   * @param {Object} requestHeaders
   *
   * @returns {Object}
   */
  private asMap (requestHeaders: any): Map<string, string> {
    const headers = new Map()

    Object.keys(requestHeaders).forEach(name => {
      const value = requestHeaders[name]

      headers.set(this.lower(name), value ? this.lower(value) : value)
    })

    return headers
  }

  /**
   * Returns the lowercased string of `str`.
   *
   * @param {String} str
   *
   * @returns {String}
   */
  lower (str: string): string {
    return String(str).toLowerCase()
  }

  /**
   * Returns the request headers.
   *
   * @returns {Map}
   */
  headers (): Map<string, string> {
    return this._headers
  }

  /**
   * Determine whether the request comes with headers.
   *
   * @returns {Boolean}
   */
  hasHeaders (): boolean {
    return this.headers().size > 0
  }

  /**
   * Returns a request header if available, undefined otherwise.
   *
   * @param {String} name - the header name
   *
   * @returns {String}
   */
  header (name: string): string | undefined {
    return this.headers().get(name)
  }
}
