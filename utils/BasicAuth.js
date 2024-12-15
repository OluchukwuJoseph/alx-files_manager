/**
 * BasicAuth provides utility methods for handling Basic Authentication.
 * Manages the extraction, decoding, and parsing of Authorization headers.
 */
export default class BasicAuth {
  /**
   * Retrieves the Authorization header from the request.
   *
   * @static
   * @method getAuthorization
   * @param {Object} req - Express request object
   *
   * @description
   * Extracts the Authorization header from the request headers.
   *
   * @throws {Error} If no Authorization header is present
   * @returns {string} The full Authorization header
   */
  static getAuthorization(req) {
    const { authorization } = req.headers;

    // Throw error if Authorization header is missing
    if (!authorization) {
      throw new Error('Missing Authorization Header');
    }

    // Return the full Authorization header
    return authorization;
  }

  /**
   * Decodes a Base64 encoded Authorization header.
   *
   * @static
   * @method decodeAuthorizationHeader
   * @param {string} encodedHeader - Base64 encoded Authorization header
   *
   * @description
   * Converts a Base64 encoded string to its original UTF-8 representation.
   *
   * @throws {Error} If no encoded header is provided
   * @returns {string} The decoded Authorization header
   */
  static decodeAuthorizationHeader(encodedHeader) {
    // Validate that an encoded header is provided
    if (!encodedHeader) {
      throw new Error('Missing Authorization Header');
    }

    // Create a buffer from the Base64 encoded string
    const bufferObj = Buffer.from(encodedHeader, 'base64');

    // Convert buffer to UTF-8 string
    const decodedHeader = bufferObj.toString('utf-8');
    return decodedHeader;
  }

  /**
   * Extracts the credential portion of the Authorization header.
   *
   * @static
   * @method extractAuthorizationHeader
   * @param {string} authorizationHeader - Full Authorization header
   *
   * @description
   * Removes the 'Basic ' prefix from the Authorization header.
   *
   * @throws {Error} If header is missing or doesn't start with 'Basic '
   * @returns {string} Base64 encoded credentials
   */
  static extractAuthorizationHeader(authorizationHeader) {
    // Validate that an authorization header is provided
    if (!authorizationHeader) {
      throw new Error('Missing Authorization Header');
    }

    // Ensure header starts with 'Basic ' prefix
    if (!authorizationHeader.startsWith('Basic ')) {
      throw new Error('Authorization Header does not start with `Basic `');
    }
    // Remove 'Basic ' prefix and return the encoded credentials
    return authorizationHeader.slice(5);
  }

  /**
   * Splits the decoded Authorization header into email and password.
   *
   * @static
   * @method splitAuthorizationHeader
   * @param {string} authorizationHeader - Decoded Authorization header
   *
   * @description
   * Separates the email and password from a colon-separated string.
   *
   * @throws {Error} If no authorization header is provided
   * @returns {Object} Object containing email and password
   */
  static splitAuthorizationHeader(authorizationHeader) {
    // Validate that an authorization header is provided
    if (!authorizationHeader) {
      throw new Error('Missing Authorization Header');
    }

    const colonIndex = authorizationHeader.indexOf(':');
    // Return an object with separated email and password
    return {
      email: authorizationHeader.slice(0, colonIndex), // Everything before the colon
      password: authorizationHeader.slice(colonIndex + 1), // Everything after the colon
    };
  }

  /**
   * Extracts and decodes user credentials from an encoded Authorization header.
   *
   * @static
   * @method getCredentials
   * @param {string} encodedHeader - Full Base64 encoded Authorization header
   *
   * @description
   * Comprehensive method to extract user credentials from an Authorization header.
   * Combines multiple methods to decode and parse the header.
   *
   * @throws {Error} If any step in the credential extraction fails
   * @returns {Object} Object containing extracted email and password
   */
  static getCredentials(encodedHeader) {
    // Validate that an encoded header is provided
    if (!encodedHeader) {
      throw new Error('Missing Authorization Header');
    }

    // Extract the Base64 encoded credentials from the header
    const authorizationHeader = BasicAuth.extractAuthorizationHeader(encodedHeader);
    // Decode the Base64 encoded credentials
    const decodedHeader = BasicAuth.decodeAuthorizationHeader(authorizationHeader);
    // Split the decoded header into email and password
    const credentials = BasicAuth.splitAuthorizationHeader(decodedHeader);

    // Return the extracted credentials
    return credentials;
  }
}
