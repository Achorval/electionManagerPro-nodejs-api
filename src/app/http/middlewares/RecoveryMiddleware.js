const jwt = require('jsonwebtoken');

const config = {
  accessTokenSecretKey: 'dd5f3089-40c3-403d-af14-d0c228b05cb4',
  refreshTokenSecretKey: '7c4c1c50-3230-45bf-9eae-c9b2e401c767'
}

exports.recoveryMiddleware = (request, response, next) => {
  try {
    const token = request.body.token;
    if ( token ) {
      jwt.verify(token, config.accessTokenSecretKey,  (err, decoded) => { 
        if (decoded) {
          
          request.authUser = decoded;
          next();

        } else if (err.message === 'jwt expired') {
          return response.status(403).send({
            status: 'error',
            message: "Access token expired!"
          });
        } else {
          return response.status(403).send({
            status: 'error',
            message: "Unauthorized!"
          });
        }
      });
    }  else {
      return response.status(403).send({
        message: "No token provided!"
      });
    };
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    })
  }
}