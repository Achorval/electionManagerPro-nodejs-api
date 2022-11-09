const axios = require('axios');
const thirdParty = require('../../../../utils/ThirdParty');

//= ====================================
//  BANK LIST CONTROLLER
//--------------------------------------
/**
 * Display a listing of the resource.
 *
 * @return Response
 */
 exports.fetchBankList = async (request, response) => {
  try { 
    const result = await axios.get(`https://api.monnify.com/api/v1/sdk/transactions/banks`);
    if(result.data.requestSuccessful) {
      return response.status(200).send({
        data: result.data.responseBody,
        status: 'success',
        message: 'Bank list have been retrieved successfully!'
      });
    } 
  } catch (error) {   
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
};

/**
 * Validate a specified resource in storage.
 *
 * @return Response
 */  
exports.validateAccountNumber = async (request, response) => {
  try { 
    const result = await thirdParty.monnifyGet(`disbursements/account/validate?accountNumber=${request.query.accountNumber}&bankCode=${request.query.bankCode}`);
    if(result.data.requestSuccessful) {
      return response.status(200).send({
        data: result.data.responseBody,
        status: 'success',
        message: 'Account number validated successfully!'
      });
    } 
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'Incorrect bank account details, try again later!'
    })
  }
};