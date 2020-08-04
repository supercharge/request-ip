<div align="center">
  <a href="https://superchargejs.com">
    <img width="471" style="max-width:100%;" src="https://superchargejs.com/images/supercharge-text.svg" />
  </a>
  <br/>
  <br/>
  <p>
    <h3>Request IP</h3>
  </p>
  <p>
    Retrieve a request’s IP address
  </p>
  <br/>
  <p>
    <a href="#installation"><strong>Installation</strong></a> ·
    <a href="#usage"><strong>Usage</strong></a> ·
    <a href="#detecting-the-ip-address"><strong>Detecting the IP Address</strong></a>
  </p>
  <br/>
  <br/>
  <p>
    <a href="https://www.npmjs.com/package/@supercharge/request-ip"><img src="https://img.shields.io/npm/v/@supercharge/request-ip.svg" alt="Latest Version"></a>
    <a href="https://www.npmjs.com/package/@supercharge/request-ip"><img src="https://img.shields.io/npm/dm/@supercharge/request-ip.svg" alt="Monthly downloads"></a>
  </p>
  <p>
    <em>Follow <a href="http://twitter.com/marcuspoehls">@marcuspoehls</a> and <a href="http://twitter.com/superchargejs">@superchargejs</a> for updates!</em>
  </p>
</div>

---

## Introduction
The `@supercharge/request-ip` package provides a function to retrieve a request’s IP address.


## Installation

```
npm i @supercharge/request-ip
```


## Usage

```js
const RequestIp = require('@supercharge/request-ip')

const ip = RequestIp.getClientIp(request)

// for example '213.211.254.97' as an IP v4 address
// or '2001:0db8:85a3:0000:0000:8a2e:0370:7334' as an IP v6 address
// or 'undefined' if no IP address is available on the given request
```

Depending on your used web framework, you may use it in a middleware or route handler:


**simple Express example**

```js
const { getClientIp } = require('@supercharge/request-ip')

const expressMiddleware = function (req, res, next) {
  req.ip = getClientIp(req)

  next()
}
```

**simple hapi route handler example:**

```js
const Hapi = require('@hapi/hapi')
const { getClientIp } = require('@supercharge/request-ip')

const server = new Hapi.Server({
  host: 'localhost'
})

server.route({
  method: 'GET',
  path: '/login',
  handler: (request, h) => {
    const ip = getClientIp(request)

    return h.response(ip)
  }
})
```


## Detecting the IP Address
The client’s IP address may be stored in different locations of the request instance varying between services.

Here’s the order of locations in which the packages searches for the requesting IP address:

1. Checks HTTP request headers
    1. `x-forwarded-for`: this header may contain multiple IP address for (client/proxies/hops). This package extracts and returns the first IP address.
    2. `x-forwarded`, `forwarded`, `forwarded-for` as variants from `x-forwarded-for` possibly configured by proxies
    3. `x-client-ip` possibly configured by nginx
    4. `x-real-ip` possibly configured in nginx
    5. `cf-connecting-ip` from Cloudflare
    6. `fastly-client-ip` from Fastly and Firebase
    7. `true-client-ip` from Akamai and Cloudflare
    8. `x-cluster-client-ip` from Rackspace
2. Checks the HTTP connection in `request.connection` and `request.connection.socket`
3. Checks the HTTP socket in `request.socket`
4. Checks the HTTP info in `request.info`
5. Checks the raw HTTP request instance in `request.raw`
6. Checks the request context used by AWS API Gateway/Lambda in `request.requestContext`


## Credits
A huge thank you to [Petar Bojinov](https://github.com/pbojinov) for his [request-ip](https://github.com/pbojinov/request-ip) package. I was using Petar’s package for two years in my [hapi-rate-limitor](https://github.com/futurestudio/hapi-rate-limitor) plugin. It seems Petar is busy with other work and I felt the need to create my own package providing the functionality to retrieve a request’s IP address.


## Contributing
Do you miss a way to find the request’s IP? We very much appreciate your contribution! Please send in a pull request 😊

1.  Create a fork
2.  Create your feature branch: `git checkout -b my-feature`
3.  Commit your changes: `git commit -am 'Add some feature'`
4.  Push to the branch: `git push origin my-new-feature`
5.  Submit a pull request 🚀


## License
MIT © [Supercharge](https://superchargejs.com)

---

> [superchargejs.com](https://superchargejs.com) &nbsp;&middot;&nbsp;
> GitHub [@supercharge](https://github.com/supercharge/) &nbsp;&middot;&nbsp;
> Twitter [@superchargejs](https://twitter.com/superchargejs)
