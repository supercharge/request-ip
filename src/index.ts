'use strict'

import { Request } from './request'

/**
 * Retrieve the client IP address from the given `request`.
 *
 * @param {Object} request
 *
 * @returns {String}
 */
export function getClientIp (request: any): string | undefined {
  return new Request(request).getClientIp()
}

/**
 * Retrieve all client IP addresses from the given `request`.
 *
 * @param {Object} request
 *
 * @returns {String}
 */
export function getClientIps (request: any): string[] {
  return new Request(request).getClientIps()
}
