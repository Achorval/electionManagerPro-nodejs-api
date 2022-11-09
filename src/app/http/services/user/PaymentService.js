// const { 
//   service,
//   thirdParty
// } = require('../../../models');

//= ====================================
//  PAYMENT SERVICE 
//--------------------------------------  
/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
// exports.oneColumnThirdParty = (request) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const result = await thirdParty.findOne({ 
//         where: {
//           status: true
//         }, 
//         attributes: [
//           'name',
//           'url',
//           'authorization',
//         ],
//         include: {
//           model: service, 
//           required: true,
//           attributes: [
//             'id',
//             'name'
//           ],
//           where: {
//             name: request
//           }  
//         }
//       });
//       if (result) resolve(result);
//       resolve(true);
//     } catch (e) {
//       reject(e);
//     }
//   });
// };
