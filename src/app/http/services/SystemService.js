let Validator = require('validatorjs');
const { limitAndOffset } = require("../../../utils/Helpers");
const { auditLog,  } = require('../../models');

//= ====================================
//  SYSTEM SERVICE 
//--------------------------------------   
/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.oneColumn = (request, product, attributes) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { offset, limit } = limitAndOffset(request.query.page, request.query.perPage);
      const result = await product.findAndCountAll({ 
        order: [
          ['createdAt', 'DESC']
        ], 
        attributes: attributes,
        limit: limit, 
        offset: offset 
      });
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.checkEmailUser = (request) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await user.findOne({ 
        where: {
          email: request.body.email
        } 
      });
      if (result) resolve(true);
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

/**
* Where to redirect users when the intended url fails.
*
* @var string
*/
exports.adminAuditLog = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await auditLog.create(data);
      if (result) 
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
//  exports.checkAssignedRolePermission = (request) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const result = await user.findOne({ 
//         where: {
//           email: request.body.email
//         } 
//       });
//       if (result) resolve(true);
//       resolve(true);
//     } catch (e) {
//       reject(e);
//     }
//   });
// };