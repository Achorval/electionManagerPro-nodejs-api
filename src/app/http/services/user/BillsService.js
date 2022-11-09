const { 
  service,
  thirdParty,
  electricity
} = require('../../../models');

//= ====================================
//  BILLS SERVICE 
//--------------------------------------  
/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.oneColumnThirdParty = (request) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await thirdParty.findOne({ 
        where: {
          active: true
        }, 
        attributes: [
          'name',
          'url',
          'authorization',
        ],
        include: {
          model: service, 
          required: true,
          attributes: [
            'id',
            'name'
          ],
          where: {
            name: request
          }  
        }
      });
      if (result) resolve(result);
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
 exports.electricVendRange = async (code) => {
  try {
    return await electricity.findOne({ 
      where: {
        code: code
      },
      attributes: [
        'minimum', 
        'maximum'
      ]
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

