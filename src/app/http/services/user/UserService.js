const { 
  limitAndOffset,
} = require("../../../../utils/Helpers");
// ** Models
const {
  role,
  permission,
  user,
  wallet,
  service,
  balance,
  transaction,
  auditLog, 
} = require('../../../models');

//= ====================================
//  USER SERVICE 
//--------------------------------------   
/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.multipleColumnsTransaction = (request) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { offset, limit } = limitAndOffset(request.query.page, request.query.perPage);
      const result = await transaction.findAndCountAll({ 
        limit: limit, 
        offset: offset,
        order: [
          ['createdAt', 'DESC']
        ], 
        attributes: [
          'id',
          'reference', 
          'amount', 
          'narration',
          'status',
          'createdAt'
        ],
        include: [{
          model: balance, 
          required: true,
          attributes: [
            'current'
          ],
          where: {
            userId: request.authUser.userData.id
          }
        },{
          model: service, 
          required: true,
          attributes: [
            'name'
          ] 
        }] 
      })
      resolve(result);
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
exports.userAuditLog = (data) => {
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
* Return current wallet resources.
*
* @var string $userId, label
*/
exports.currentBalance = async (request, label) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await balance.findOne({
        attributes: [
          'id',
          'userId',
          'walletId',
          'previous',
          'book',
          'current',
        ],
        where: {
          userId: request.authUser.userData.id,
          active: true
        },
        include: {
          model: wallet,
          required: true,
          attributes: [
            'id',
            'name'
          ],
          where: {
            label: label,
            active: true
          }
        }
      });
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
}

/**
* Return current transaaction pin resources.
*
* @var string $userId
*/
exports.authorizeTransaction = async (request) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await user.findOne({
        attributes: [
          'transactionPin',
        ],
        where: {
          id: request.authUser.userData.id,
          blocked: false
        }
      });
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Where to redirect users when the intended url fails.
 *
 * @var string
 */
exports.fetchNetwork = async (id) => {
  try {
    const data = await network.findOne({
      where: {
        id: id
      },
      attributes: [
        'name'
      ]
    });

    if (!data) {
      return res.status(400).send({
        message: 'No record found'
      });
    }

    return data.toJSON().name;

  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
}