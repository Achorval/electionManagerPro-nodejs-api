const axios = require('axios');
const config = require('../config/data');

//= ======================================
  //  PAYSTACK SERVICES
  //--------------------------------------
exports.paystackGetRequest =  async (endPoint) => {
  try {
    const data = await axios.get(`https://api.paystack.co/${endPoint}`, {
      headers: {
        'Authorization': `Bearer sk_live_0268cd9da6181f3822cc9900fa080c0bf639a892`,
        'Content-Type': 'application/json'
      }
    });

    return data;

  } catch (error) {
    return false;
  }
};

//= ====================================
//  BUYPOWER SERVICES
//--------------------------------------
exports.buyPowerGet = (endPoint, params = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios.get(`https://idev.buypower.ng/v2/${endPoint}`, {
        params: params,
        headers: {
          'Authorization': `Bearer 7883e2ec127225f478279f0cb848e3551eaaa99d484ec39cf0b77a9ccf1d9d0d`,
          'Content-Type': 'application/json'
        }
      });
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

exports.buyPowerPost = async (endPoint, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios.post(`https://idev.buypower.ng/v2/${endPoint}`, payload, {
        headers: {
          'Authorization': `Bearer 7883e2ec127225f478279f0cb848e3551eaaa99d484ec39cf0b77a9ccf1d9d0d`,
          'Content-Type': 'application/json'
        }
      });
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

//= ====================================
//  SIMHOSTING SERVICES
//--------------------------------------
exports.simhostUssd = async  (server_id, sim, ussd_code, ref) => {
  try {
    const payload = {
      apikey: config.SIMHOSTNG.API_KEY,
      server: server_id,
      sim: sim,
      number: ussd_code,
      ref: ref
    } 
    const simhostngResponse = await axios.post('https://simhostng.com/api/ussd', {}, {
      params: payload
    });
    return simhostngResponse.data;
      
  } catch (error) {
    return error.response.data;
  }
};

exports.simhostSms = async (server_id, sim, send_to, message, ref) => {
  try {
    const payload = {
      apikey: config.SIMHOSTNG.API_KEY,
      server: server_id,
      sim: sim,
      number: send_to,
      message: message,
      ref: ref
    } 
    const simhostngResponse = await axios.post('https://simhostng.com/api/sms', {}, {
      params: payload
    });
    return simhostngResponse.data;
      
  } catch (error) {
    return error.response.data;
  }
};

//= ====================================
//  VTPASS SERVICES
//--------------------------------------
exports.vtPassGet = async (endPoint, params) => {
  try {
    const response = await axios.get(`https://vtpass.com/api/${endPoint}=${params}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.VTPass.username}:${config.VTPass.password}`, 'utf8').toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;

  } catch (error) {
    return error.response.data;
  }
};

exports.vtPassPost = async (endPoint, payload) => {
  try {
    const response = await axios.post(`https://sandbox.vtpass.com/api/${endPoint}`, payload, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${'achordval@gmail.com'}:${'real8323'}`, 'utf8').toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
  
    return response.data;

  } catch (error) {
    return error.response.data;
  }
};

//= ====================================
//  TELERIVET SERVICES
//--------------------------------------
exports.sendUssd = async (ussd_code, phone_id) => {
  try {
    const API_KEY = config.TELERIVET.API_KEY;    
    const PROJECT_ID = config.TELERIVET.PROJECT_ID;
    const payload = {
      "to_number":    ussd_code,
      "phone_id":     phone_id,
      "message_type": "ussd",
    };

    const telerivetResponse = await axios.post(`https://api.telerivet.com/v1/projects/${PROJECT_ID}/messages/send`, payload, {
      headers: {
        'Authorization': `Basic ${Buffer.from(API_KEY, 'utf8').toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    return telerivetResponse;

  } catch (error) {
    return false;
  }
};

exports.sendSms = async (content, to_number, phone_id) => {
  try {
    const API_KEY = config.TELERIVET.API_KEY;    
    const PROJECT_ID = config.TELERIVET.PROJECT_ID;
    const payload = {
      "content": content,
      "to_number": to_number,
      "phone_id": phone_id
    };

    const telerivetResponse = await axios.post(`https://api.telerivet.com/v1/projects/${PROJECT_ID}/messages/send`, payload, {
      headers: {
        'Authorization': `Basic ${Buffer.from(API_KEY, 'utf8').toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    return telerivetResponse;

  } catch (error) {
    return false;
  }
};

//= ====================================
//  AKUUK SERVICES
//--------------------------------------
exports.akuukGet = async (endPoint, params = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios.get(`https://api.akuuk.com/${endPoint}`, {
        params: params,
        headers: {
          'Authorization': `Basic ${Buffer.from(`220166:3eff9fdddd9cd9225e9dfa0a5625445d`, 'utf8').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
}

exports.akuukPost = async (endPoint, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios.post(`https://api.akuuk.com/${endPoint}`, payload, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`220166:3eff9fdddd9cd9225e9dfa0a5625445d`, 'utf8').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
};

//= ====================================
//  MONNIFY SERVICES
//--------------------------------------
exports.monnifyToken = async (endPoint, payload=null) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post(`https://api.monnify.com/api/v1/${endPoint}`, payload, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${'MK_PROD_LJ73YKFSSK'}:${'YM3C5AS58PVUXJGJMCGAWSGHUE4KMUPU'}`, 'utf8').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });
      resolve(response);
    } catch (e) {
      reject(e);
    }
  });
};

exports.monnifyGet = async (endPoint) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('1:..................')
      console.log(endPoint)
      const result = await this.monnifyToken('auth/login');
      console.log('2:..................')
      console.log(result)
      if (result.data.requestSuccessful) {
        const response = await axios.get(`https://api.monnify.com/api/v1/${endPoint}`, {
          headers: {
            'Authorization': `Bearer ${result.data.responseBody.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        resolve(response);
      }
    } catch (e) {
      reject(e);
    }
  });
};

exports.monnifyPost = async (endPoint, payload=null) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await this.monnifyToken('auth/login');
      if (result.data.requestSuccessful) {
        const response = await axios.post(`https://sandbox.monnify.com/api/v1/${endPoint}`, payload, {
          headers: {
            'Authorization': `Bearer ${result.data.responseBody.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        resolve(response);
      }
    } catch (e) {
      reject(e);
    }
  });
};