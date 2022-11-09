const jwt = require('jsonwebtoken');
const config = require('../../../config/data');
const { user } = require('../../models');

exports.userMiddleware = (request, response, next) => {
  try {
    const bearerHeader = request.headers.authorization;
    if ( bearerHeader ) {
      const token = bearerHeader.split(' ')[1];
      jwt.verify(token, config.accessTokenSecretKey, { expiresIn: config.ONE_WEEK },  (err, decoded) => {
        
        if (decoded) {
          user.findOne({
            where: {
              id: decoded.id
            },
            attributes: [
              'id', 
              'firstName', 
              'lastName',
              'accountType',
              'email',
              'isEmailVerified',
              'emailVerifiedAt',
              'phone', 
              'isPhoneVerified',
              'dob',
              'gender',
              'bvn',
              'isBvnVerified', 
              'hasTransactionPin',
              'balanceStatus',
              'blocked'
            ]
          }).then(function (userData) {
            request.userData = userData,
            next();
          });
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
    } else {
      return response.status(403).send({
        status: 'error',
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

exports.emailMiddleware = (request, response, next) => {
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
    }   else {
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