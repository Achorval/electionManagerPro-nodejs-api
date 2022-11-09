let Validator = require('validatorjs');
const {  
  akuukGet,
  akuukPost,
  vtPassPost,
  buyPowerPost
} = require("../../../../utils/ThirdParty");
const { 
  uniqueNumber, 
  compareHashPassword, 
  generateNumbersAndLetters  
} = require("../../../../utils/Helpers");
const { 
  userAuditLog,
  currentBalance,
  authorizeTransaction
} = require("../../services/user/UserService");
const {  
  oneColumnThirdParty 
} = require("../../services/user/BillsService");
const { 
  disco,
  cable, 
  prefix,
  airtime, 
  bouquet,
  network,
  balance,
  databundle,
  airtimeEpin,
  transaction, 
  electricity,
  denomination
} = require('../../../models');

//= ====================================
//  AIRTIME CONTROLLER
//--------------------------------------    

/**
 * Verify a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.verifyNetwork = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.body, {
      prefix: 'required|string'
    });
    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    };

    const result = await prefix.findOne({  
      where: {
        name: request.body.prefix
      },
      attributes: [
        'id' 
      ], 
      include: { 
        model: network, 
        required: true,
        attributes: [
          'id', 
          'name' 
        ]
      } 
    });
    // ** Check if Prefix Exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'Prefix not found!.'
      });
    };
    
    return response.status(200).send({
      data: data,
      status: 'success',
      message: 'Network prefix have been verified successfuly!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
};

/**
 * Display a listing of the resource.
 *
 * @return Response
 */ 
exports.fetchAirtimeNetworks = async (request, response) => {
  try {
    await network.findAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id',
        'name', 
        'label', 
        'identifier', 
        'imageUrl'
      ],
      where: {
        active: true
      },
      include: {
        model: airtime,
        required: true,
        attributes: [
          'discount',
          'networkId'
        ],
        where: {
          active: true
        } 
      },
      group: "networkId"
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Network providers have been retrieved successfuly!'
      })
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.airtimePurchase = async (request, response) => {
  try {  
    // ** Validation Rules
    let validation = new Validator(request.body, {
      network: 'required|string',
      phone:   'required|string',
      amount:  'required|integer',
      pin:     'required|integer'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    }
     // ** Authorize Transaction
    const transactionPin = await authorizeTransaction(request);

    // ** Compare Transaction Pin
    if(!compareHashPassword(request.body.pin, transactionPin.transactionPin)) {
      return response.status(401).send({
        status: 'error',
        message: 'Incorrect transaction pin.'
      });
    };

    // ** Fetch the Current Balance
    const balanceData = await currentBalance(request, 'naira');

    if (parseFloat(balanceData.current) < parseFloat(request.body.amount)) {
      return response.status(406).send({
        status: 'error',
        message: 'Insufficient balance in your wallet!'
      });
    }

    if (parseFloat(request.body.amount) < 100 && parseFloat(request.body.amount) > 10000) { 
      return response.status(406).send({
        status: 'error',
        message: 'Minimum of ₦100.00 and Maximum of ₦10,000.00'
      });
    }

    const thirdPartyResult = await oneColumnThirdParty('airtime-purchase');
      
    await balanceData.update({
      active: false
    });

    const balanceData2 = await balance.create({
      userId: request.userData.id,
      walletId: balanceData.walletId,
      previous: parseFloat(balanceData.current),
      book: parseFloat(balanceData.current),
      current: (parseFloat(balanceData.current)) - (parseFloat(request.body.amount)),
      active: true
    });

    const uniqueID = `${new Date().getTime()}${generateNumbersAndLetters(3)}`;

    const transactionData = await transaction.create({
      userId: request.userData.id,
      serviceId: result.service.id,
      reference: uniqueID,
      externalReference: null,
      amount: parseFloat(request.body.amount),
      balanceId: balanceData2.id,
      narration: `Bought ${request.body.network} airtime`,
      status: 'pending',
      completedAt: null
    });

    const airtimeData = await airtime.findOne({
      where: {
        active: true
      }, 
      attributes: [
        'id',
        'networkId',
        'discount'
      ],
      include: {
        model: network, 
        required: true,
        attributes: [
          'id',
          'name'
        ],
        where: {
          active: true,
          label: request.body.network
        }  
      }
    });

    if (airtimeData.discount > 0) {
      // ** Fetch the current balance
      const balanceData4 = await currentBalance(request, 'naira');

      await balanceData4.update({
        active: false
      });

      const balanceData3 = await balance.create({
        userId: request.userData.id,
        walletId: balanceData2.walletId,
        previous: parseFloat(balanceData2.current),
        book: parseFloat(balanceData2.current),
        current: (parseFloat(balanceData2.current)) + (parseFloat((airtimeData.discount / 100)) * parseFloat(request.body.amount)),
        active: true
      });

      await transaction.create({
        userId: request.userData.id,
        serviceId: thirdPartyResult.service.id,
        reference: `${new Date().getTime()}${generateNumbersAndLetters(3)}`,
        externalReference: null,
        amount: parseFloat((airtimeData.discount / 100)) * parseFloat(request.body.amount),
        balanceId: balanceData3.id,
        narration: 'Airtime Cashback',
        status: 'success',
        completedAt: new Date()
      });
    }

    const akuukResult = await akuukPost('bills/airtime', {
      mrcReference: uniqueID,
      number: request.body.phone,
      amount: parseFloat(request.body.amount),
      billing: 'prepaid'
    });

    if (akuukResult.data.status === 'Success') {
      const resultUpdate = await transaction.findOne({
        attributes: [
          'id',
          'reference',
          'status'
        ],
        where: {
          status: 'pending',
          reference: uniqueID
        },
        include: {
          model: balance,
          required: true,
          attributes: [
            'id',
            'userId'
          ],
          where: {
            userId: request.userData.id
          }
        }
      });

      await resultUpdate.update({
        externalReference: akuukResult.data.txnReference,
        status: 'success',
        completedAt: new Date()
      });
    }

    // ** Airtime Purchase Audit
    await userAuditLog({
      userId: request.userData.id,
      auditableType: "Transaction",
      auditableId: transactionData.id,
      event: 'airtimePurchase',
      oldValues: null,
      newValues: {
        phone: request.body.phone,
        network: request.body.network,
        amount: request.body.amount
      },
      url: request.originalUrl,
      userAgent: request.get('User-Agent'),
      ipAddress: request.ip,
      channel: "Web",
      returnData: {
        ...akuukResult.data
      }
    });

    return response.status(200).send({
      data: { 
        phone: request.body.phone,
        amount: request.body.amount,
        service: thirdPartyResult.service.name,
        date: transactionData.createdAt,
        reference: transactionData.reference
      },
      status: 'success',
      message: 'Airtime has been purchased successfully!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An error occured, try again later.'
    });
  }
};

//= ====================================
//  DATABUNDLE CONTROLLER
//-------------------------------------- 
/**
 * Display a listing of the resource.
 *
 * @return Response
 */ 
exports.fetchDatabundleNetworks = async (request, response) => {
  try {
    await network.findAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'name', 
        'label',
        'identifier', 
        'imageUrl'
      ],
      where: {
        active: true
      },
      include: {
        model: databundle,
        required: true,
        attributes: [
          'networkId',
          'name',
          'identifier',
          'price',
          'discount',
          'validity'
        ],
        where: {
          active: true
        }
      },
      // group: "networkId"
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Network providers have been retrieved successfuly!'
      })
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }     
};

/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.databundlePurchase = async (request, response) => {
  try {
    // ** Validation Rules
    let validation = new Validator(request.body, {
      network: 'required|string',
      phone:   'required|string',
      amount:  'required|integer',
      pin:     'required|integer'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    }

    // ** Authorize transaction
    const transactionPin = await authorizeTransaction(request);

    // ** Compare transaction pin
    if(!compareHashPassword(request.body.pin, transactionPin.transactionPin)) {
      return response.status(401).send({
        status: 'error',
        message: 'Incorrect transaction pin.'
      });
    };
    
    // ** Fetch the current balance
    const balanceData = await currentBalance(request, 'naira');

    if (parseFloat(balanceData.current) < parseFloat(request.body.amount)) {
      return response.status(406).send({
        status: 'error',
        message: 'Insufficient balance in your wallet!'
      });
    }

    const thirdPartyResult = await oneColumnThirdParty('Databundle Purchase');

    await balanceData.update({
      active: false
    });

    const balanceData2 = await balance.create({
      userId: request.userData.id,
      walletId: balanceData.walletId,
      previous: parseFloat(balanceData.current),
      book: parseFloat(balanceData.current),
      current: (parseFloat(balanceData.current)) - (parseFloat(request.body.amount)),
      active: true
    });

    const uniqueID = `${new Date().getTime()}${generateNumbersAndLetters(3)}`;

    const transactionData = await transaction.create({
      userId: request.userData.id,
      serviceId: thirdPartyResult.service.id,
      reference: uniqueID,
      externalReference: null,
      amount: parseFloat(request.body.amount),
      balanceId: balanceData2.id,
      narration: `Bought ${request.body.network} data`,
      status: 'pending',
      completedAt: null
    });

    const databundleData = await databundle.findOne({
      where: {
        active: true,
        ussd: request.body.databundle
      }, 
      attributes: [
        'id',
        'networkId',
        'discount'
      ],
      include: {
        model: network, 
        required: true,
        attributes: [
          'id',
          'name'
        ],
        where: {
          active: true,
          name: request.body.network
        }  
      }
    });

    if (databundleData.discount > 0) {
      // ** Fetch the current balance
      const balanceData4 = await currentBalance(request, 'naira');

      await balanceData4.update({
        active: false
      });

      const balanceData3 = await balance.create({
        userId:   request.userData.id,
        walletId: balanceData2.walletId,
        previous: parseFloat(balanceData2.current),
        book:     parseFloat(balanceData2.current),
        current:  (parseFloat(balanceData2.current)) + (parseFloat((databundleData.discount / 100)) * parseFloat(request.body.amount)),
        active:   true
      });

      await transaction.create({
        userId:            request.userData.id,
        serviceId:         thirdPartyResult.service.id,
        reference:         `${new Date().getTime()}${generateNumbersAndLetters(3)}`,
        externalReference: null,
        amount:            parseFloat((databundleData.discount / 100)) * parseFloat(request.body.amount),
        balanceId:         balanceData3.id,
        narration:         'Databundle Cashback',
        status:            'success',
        completedAt:       new Date()
      });
    }

    const akuukResult = await akuukPost('bills/internet', {
      mrcReference: uniqueID,
      number: request.body.phone,
      identifier: request.body.databundle
    });

    if (akuukResult.data.status === 'Success') {
      const resultUpdate = await transaction.findOne({
        attributes: [
          'id',
          'reference',
          'status'
        ],
        where: {
          status: 'pending',
          reference: uniqueID
        },
        include: {
          model: balance,
          required: true,
          attributes: [
            'id',
            'userId'
          ],
          where: {
            userId: request.userData.id
          }
        }
      });

      await resultUpdate.update({
        externalReference: akuukResult.data.txnReference,
        status: 'success',
        completedAt: new Date()
      });
    }

    // ** Airtime Purchase Audit
    await userAuditLog({
      userId: request.userData.id,
      auditableType: "Transaction",
      auditableId: transactionData.id,
      event: 'databundlePurchase',
      oldValues: null,
      newValues: {
        phone: request.body.phone,
        network: request.body.network,
        amount: request.body.amount
      },
      url: request.originalUrl,
      userAgent: request.get('User-Agent'),
      ipAddress: request.ip,
      channel: "Web",
      returnData: {
        ...akuukResult.data
      }
    });
    
    return response.status(200).send({
      data: { 
        phone: request.body.phone,
        amount: request.body.amount,
        service: thirdPartyResult.service.name,
        date: transactionData.createdAt,
        reference: transactionData.reference
      },
      status: 'success',
      message: 'Airtime has been purchased successfully!'
    });
  } catch (error) {
    response.status(400).send({
      status: 'error',
      message: 'An Error Occured try, again later.'
    });
  }
};

//= ====================================
//  CABLE CONTROLLER
//--------------------------------------  
/**
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchCableBouquets = async (request, response) => {
  try {
    await cable.findAll({ 
      order: [
        ['createdAt', 'DESC']
      ],
      where: {
        active: true
      },
      attributes: [
        'name',
        'label',
        'slug',
        'identifier',
        'imageUrl'
      ],
      include: {
        model: bouquet,
        where: {
          active: true
        },
        attributes:  [
          'cableId',
          'name',
          'identifier',
          'amount',
          'discount',
          'fee'
        ],
        required: true
      },
      // group: "cableId"
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: "Cables have been retrieved successfuly!"
      });
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
};

/**
 * Validate a list of resource.
 *
 * * @param  string  smartCard, cable
 * @return Response
 */
exports.validateSmartCard = async (request, response) => {
  try { 
    const akuukResult = await akuukGet('payment/cabletv/smartcard', {
      provider: request.body.cable,
      number: request.body.smartCard
    });

    if (akuukResult.data.errors) {
      return response.status(406).send({
        status: 'error',
        message: akuukResult.data.message
      });
    }

    return response.status(200).send({
      data: akuukResult.data.customerName,
      status: 'success',
      message: 'Smart card number have been validated successfuly!'
    });
  } catch (error) {  
    response.status(400).send({
      status: 'error',
      message: 'An error occured, try again later.'
    })
  }
};

/**
 * Show the application admin details.
 *
 * @return void
 */
exports.cablePurchase = async (request, response) => {
  try { 
    const currentBalance = await currentBalance(
        request.id, NGN);

    if (currentBalance >= request.body.amount) {

      const data  = await vtPassPost("pay", {
        request_id: await uniqueNumber(),
        billersCode: request.body.smartCard,
        serviceID: request.body.cable,
        variation_code: request.body.bouquet,
        phone: request.body.phone,
      });

      await userAuditLog.create({
        userId: request.id,
        data: JSON.stringify(data),
        url: request.originalUrl,
        device: request.get('User-Agent'),
        ipAddress: request.ip,
        action: 'payCable'
      });

      const transData = await transaction.create({
        userId: request.id,
        serviceId: 4,
        walletId: request.body.walletId,
        reference: data.content.transactions.transactionId,
        amount: request.body.amount,
        description: `${request.body.cable} purchase`,
        statusId: 2
      });
      
      const balData = await balance.findOne({
        where: {
          userId: request.id,
          walletId: request.body.walletId,
          active: true
        }
      });

      balData.update({
        active: false
      });

      await balance.create({
        userId: request.id,
        walletId: request.body.walletId,
        transactionId: transData.toJSON().id,
        previous: balData.toJSON().current,
        current: (balData.toJSON().current*1) - (request.body.amount*1),
        active: true
      });
      
      return response.status(201).send({
        data: data,
        status: 'success',
        message: 'Electricity Transaction Successful'
      });

    } else {
      return response.status(403).send({
        status: 'error',
        message: 'Insufficient balance in your wallet!'
      });
    }
  } catch (error) {  
    response.status(400).send({
      status: 'error',
      message: 'An error occured, try again later.'
    })
  }
};

//= ====================================
//  ELECTRICITY CONTROLLER
//--------------------------------------

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchDiscos = async (request, response) => {
  try {
    await disco.findAll({ 
      order: [
        ['createdAt', 'DESC']
      ],
      where: {
        active: true
      }, 
      attributes: [
        'id', 
        'name',
        'label',
        'slug',
        'identifier',
        'imageUrl'
      ],
      include: {
        model: electricity,
        where: {
          active: true
        },
        attributes:  [
          'discoId',
          'type',
          'minimum',
          'maximum',
          'discount',
          'fee'
        ],
        required: true
      },
      group: "discoId"
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: "Discos have been retrieved successfuly!"
      });
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
}; 

/**
 * Validate a list of resource.
 *
 * * @param  string  meterNumber, electric, vendType
 * @return Response
 */
exports.validateMeterNumber = async (request, response) => {
  try {
    const akuukResult = await akuukGet('payment/electricity/meter', {
      disco: request.body.disco,
      number: request.body.meterNumber,
      billing: request.body.vendType
    });

    if (akuukResult.data.errors) {
      return response.status(406).send({
        status: 'error',
        message: akuukResult.data.message
      });
    }

    return response.status(200).send({
      data: akuukResult.data.owner,
      status: 'success',
      message: 'Meter number have been verified successfuly!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An error occured, try again later.'
    })
  }
};

/**
 * Show the application admin details.
 *
 * * @param  int  $id
 * @return void
 */
exports.electricityPurchase = async (request, response) => {
  try {
    // ** Validation Rules
    let validation = new Validator(request.body, {
      disco:       'required|string',
      vendType:    'required|string',
      meterNumber: 'required|integer',
      amount:      'required|integer',
      pin:         'required|integer'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    }

    // ** Authorize Transaction
    const transactionPin = await authorizeTransaction(request);

    // ** Compare Transaction Pin
    if(!compareHashPassword(request.body.pin, transactionPin.transactionPin)) {
      return response.status(401).send({
        status: 'error',
        message: 'Incorrect transaction pin.'
      });
    };
    
    // ** Fetch the Current Balance
    const balanceData = await currentBalance(request, 'naira');

    if (parseFloat(balanceData.current) < parseFloat(request.body.amount)) {
      return response.status(406).send({
        status: 'error',
        message: 'Insufficient balance in your wallet!'
      });
    }

    const thirdPartyResult = await oneColumnThirdParty('Electricity Purchase');

    if ('BuyPower') {
      switch('BuyPower') {
        case 'Akuuk':
          // code block
          break;
        case 'BuyPower':
          await balanceData.update({
            active: false
          });
      
          const balanceData2 = await balance.create({
            userId: request.userData.id,
            walletId: balanceData.walletId,
            previous: parseFloat(balanceData.current),
            book: parseFloat(balanceData.current),
            current: (parseFloat(balanceData.current)) - (parseFloat(request.body.amount)),
            active: true
          });
      
          const uniqueID = `${new Date().getTime()}${generateNumbersAndLetters(3)}`;
      
          const transactionData = await transaction.create({
            userId: request.userData.id,
            serviceId: thirdPartyResult.service.id,
            reference: uniqueID,
            externalReference: null,
            amount: parseFloat(request.body.amount),
            balanceId: balanceData2.id,
            narration: `Bought ${request.body.disco} electricity`,
            status: 'pending',
            completedAt: null
          });
      
          const electricityData = await electricity.findOne({
            where: {
              active: true,
              identifier: request.body.disco
            }, 
            attributes: [
              'id',
              'discoId',
              'discount',
              'fee'
            ],
            include: {
              model: disco, 
              required: true,
              attributes: [
                'id',
                'name'
              ],
              where: {
                active: true
              }  
            }
          });

          if (electricityData.discount > 0) {
            // ** Fetch the current balance
            const balanceData4 = await currentBalance(request, 'naira');
      
            await balanceData4.update({
              active: false
            });
      
            const balanceData3 = await balance.create({
              userId:   request.userData.id,
              walletId: balanceData2.walletId,
              previous: parseFloat(balanceData2.current),
              book:     parseFloat(balanceData2.current),
              current:  (parseFloat(balanceData2.current)) + (parseFloat((electricityData.discount / 100)) * parseFloat(request.body.amount)),
              active:   true
            });
      
            await transaction.create({
              userId:            request.userData.id,
              serviceId:         thirdPartyResult.service.id,
              reference:         `${new Date().getTime()}${generateNumbersAndLetters(3)}`,
              externalReference: null,
              amount:            parseFloat((electricityData.discount / 100)) * parseFloat(request.body.amount),
              balanceId:         balanceData3.id,
              narration:         'Electricity Cashback',
              status:            'success',
              completedAt:       new Date()
            });
          }
      
          const buyPowerResult = await buyPowerPost('vend', {
            orderId: uniqueID, 
            meter: request.body.meterNumber,
            disco: request.body.disco,
            paymentType: 'ONLINE',
            vendType: request.body.vendType,
            amount: request.body.amount,
            phone: '08086548049'
          });
      
          if (buyPowerResult.data.status === true) {
            const resultUpdate = await transaction.findOne({
              attributes: [
                'id',
                'reference',
                'status'
              ],
              where: {
                status: 'pending',
                reference: uniqueID
              },
              include: {
                model: balance,
                required: true,
                attributes: [
                  'id',
                  'userId'
                ],
                where: {
                  userId: request.userData.id
                }
              }
            });
      
            await resultUpdate.update({
              externalReference: buyPowerResult.data.data.vendRef,
              status: 'success',
              completedAt: new Date()
            });
          }

          // ** Electricity Purchase Audit
          await userAuditLog({
            userId: request.userData.id,
            auditableType: "Transaction",
            auditableId: transactionData.id,
            event: 'electricityPurchase',
            oldValues: null,
            newValues: {
              phone: request.body.phone,
              network: request.body.network,
              amount: request.body.amount
            },
            url: request.originalUrl,
            userAgent: request.get('User-Agent'),
            ipAddress: request.ip,
            channel: "Web",
            returnData: {
              ...akuukResult.data
            }
          });

          return response.status(200).send({
            data: { 
              meterNumber: request.body.meterNumber,
              amount: request.body.amount,
              service: thirdPartyResult.service.name,
              date: transactionData.createdAt,
              reference: transactionData.reference
            },
            status: 'success',
            message: 'Electricity has been purchased successfully!'
          });           
          break;
        default:
          return response.status(400).send({
            status: 'error',
            message: 'An error occured, try again later.'
          });
      }
    }
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An error occured, try again later.'
    });
  }
};


//= ====================================
//  EPIN CONTROLLER
//--------------------------------------  
/**
 * Display a listing of the resource.
 *
 * @return Response
 */ 
exports.fetchAirtimeEpinNetworks = async (request, response) => {
  try {
    await network.findAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id',
        'name', 
        'label', 
        'identifier', 
        'imageUrl'
      ],
      where: {
        active: true
      },
      include: {
        model: airtimeEpin,
        required: true,
        attributes: [
          'discount',
          'networkId'
        ],
        where: {
          active: true
        } 
      },
      group: "networkId"
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Epin Network providers have been retrieved successfuly!'
      })
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Display a listing of the resource.
 *
 * @return Response
 */ 
exports.fetchDenominations = async (request, response) => {
  try {
    await denomination.findAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id',
        'unit', 
        'active'
      ],
      where: {
        active: true
      }
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Denominations have been retrieved successfuly!'
      })
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};