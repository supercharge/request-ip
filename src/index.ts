'use strict'

import { Request } from './request'

/**
 * Retrieve the client IP address for the given `request`.
 *
 * @param {Object} request
 *
 * @returns {String}
 */
export function getClientIp (request: any): undefined | string {
  return new Request(request).getClientIp()
}
