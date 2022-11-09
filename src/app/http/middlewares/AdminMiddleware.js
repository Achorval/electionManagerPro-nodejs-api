const jwt = require('jsonwebtoken');
const { user } = require('../../models');
const config = require('../../../config/data');

exports.adminMiddleware = (request, response, next) => {
  try {
    const bearerHeader = request.headers.authorization;
    if (bearerHeader) {
      const token = bearerHeader.split(' ')[1];
      jwt.verify(token, config.accessTokenSecretKey, { expiresIn: config.ONE_WEEK }, (err, decoded) => {
        if (decoded) {
          user.findOne({
            where: {
              id: decoded.id
            },
            attributes: [
              'id', 
              'firstName', 
              'lastName',
              'userName',
              'email',
              'phone', 
              'roleId',
              'blocked'
            ], 
          }).then(function (adminData) {
            request.adminData = adminData,
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
};