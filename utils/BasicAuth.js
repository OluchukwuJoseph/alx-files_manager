export default class BasicAuth {
  static getAuthorization(req) {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new Error('Missing Authorization Header');
    }
    return authorization;
  }

  static decodeAuthorizationHeader(encodedHeader) {
    if (!encodedHeader) {
      throw new Error('Missing Authorization Header');
    }

    const bufferObj = Buffer.from(encodedHeader, 'base64');
    const decodedHeader = bufferObj.toString('utf-8');

    return decodedHeader;
  }

  static extractAuthorizationHeader(authorizationHeader) {
    if (!authorizationHeader) {
      throw new Error('Missing Authorization Header');
    }

    if (!authorizationHeader.startsWith('Basic ')) {
      throw new Error('Authorization Header does not start with `Basic `');
    }
    return authorizationHeader.slice(5);
  }

  static splitAuthorizationHeader(authorizationHeader) {
    if (!authorizationHeader) {
      throw new Error('Missing Authorization Header');
    }

    const colonIndex = authorizationHeader.indexOf(':');

    return {email: authorizationHeader.slice(0, colonIndex),
      password: authorizationHeader.slice(colonIndex + 1)};
  }

  static getCredentials(encodedHeader) {
    if (!encodedHeader) {
      throw new Error('Missing Authorization Header');
    }

    const authorizationHeader = BasicAuth.extractAuthorizationHeader(encodedHeader);
    const decodedHeader = BasicAuth.decodeAuthorizationHeader(authorizationHeader);
    const credentials = BasicAuth.splitAuthorizationHeader(decodedHeader);

    return credentials;
  }
}
