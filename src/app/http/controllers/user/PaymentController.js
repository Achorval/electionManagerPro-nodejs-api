let Validator = require('validatorjs');
const { Op } = require('sequelize');
const { 
  compareHashPassword,
  generateNumbersAndLetters
} = require("../../../../utils/Helpers");
const { 
  userAuditLog,
  currentBalance,
  authorizeTransaction
} = require("../../services/user/UserService");
const { 
  user,
  wallet,
  service,
  balance,
  currency,
  userWallet,
  transaction
} = require('../../../models');

//= ====================================
//  PAYMENT CONTROLLER 
//--------------------------------------   
/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.fetchWallets = async (request, response) => {
  try {
    await wallet.findAll({ 
      where: {
        active: true
      },
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id',
        'name',
        'label'
      ],
      include: [{
        model: userWallet, 
        where: {
          userId: request.userData.id
        },
        required: true,
        attributes: [
          'id',
          'address',
          'barCode'
        ] 
      },{
        model: balance, 
        where: {
          active: true,
          userId: request.userData.id
        },
        required: true,
        attributes: [
          'current'
        ] 
      },{
        model: currency, 
        required: true,
        attributes: [
          'id',
          'name',
          'iso',
          'symbolUrl',
          'type'
        ] 
      }]  
    }).then(function (data) { 
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Wallet details retrived successfuly!'
      })
    });
  } catch (error) { console.log(error)
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured try, again later.'
    })
  }
};

/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.fundWalletViaWithCard = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      amount:     'required|integer',
      cardNumber: 'required|string',
      expiryDate: 'required|string',
      cvv:        'required|string',
      saveCard:   'required|string',
      service:   'required|string'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    };

    // ** Fetch the current balance
    const balanceData1 = await currentBalance(request, 'naira');

    await balanceData1.update({
      active: false
    });

    const balanceData2 = await balance.create({
      userId: request.userData.id,
      walletId: balanceData1.walletId,
      previous: parseFloat(balanceData1.current),
      book: parseFloat(balanceData1.current),
      current: parseFloat(balanceData1.current) + parseFloat(request.body.amount),
      active: true
    });

    const transactionData = await transaction.create({
      userId: request.userData.id,
      serviceId: request.body.service,
      balanceId: balanceData2.id,
      reference: `${new Date().getTime()}${generateNumbersAndLetters(4)}`,
      externalReference: null,
      amount: parseFloat(request.body.amount),
      discount: 0.00,
      surcharge: 0.00,
      token: 0.00,
      narration: 'Topped up wallet via card',
      status: 'success'
    });

    // ** Fund wallet audit
    await userAuditLog({
      userId: request.userData.id,
      transactionId: transactionData.id,
      request: {
        ...request.body
      },
      response: null,
      url: request.originalUrl,
      device: request.get('User-Agent'),
      channel: 'web',
      ipAddress: request.ip,
      action: 'fundWalletViaCard'
    });

    return response.status(201).send({
      status: 'success',
      message: 'Wallet have been funded successfully!'
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
exports.fundWalletViaReserveAccount = async (request, response) => {
  try {
    // Validation rules
    if (request.body.eventType === 'SUCCESSFUL_TRANSACTION') {
      // ** Fetch the current balance
      const balanceData1 = await currentBalance(request, 'naira');
  
      await balanceData1.update({
        active: false
      });
  
      const balanceData2 = await balance.create({
        userId: request.userData.id,
        walletId: balanceData1.walletId,
        previous: parseFloat(balanceData1.current),
        book: parseFloat(balanceData1.current),
        current: parseFloat(balanceData1.current) + parseFloat(request.body.amountPaid),
        active: true
      });
  
      const transactionData = await transaction.create({
        userId: request.userData.id,
        serviceId: request.body.service,
        balanceId: balanceData2.id,
        reference: `${new Date().getTime()}${generateNumbersAndLetters(5)}`,
        externalReference: request.body.transactionReference,
        amount: parseFloat(request.body.amountPaid),
        discount: 0.00,
        surcharge: 0.00,
        token: 0.00,
        narration: 'Topped up wallet via reserve account',
        status: 'success'
      });
     
      // ** Fund wallet audit
      await userAuditLog({
        userId: request.userData.id,
        transactionId: transactionData.id,
        request: {
          ...request.body
        },
        response: null,
        url: request.originalUrl,
        device: request.get('User-Agent'),
        channel: 'web',
        ipAddress: request.ip,
        action: 'fundWalletViaReserveAccount'
      });

      return response.status(201).send({
        status: 'success',
        message: 'Wallet have been funded successfully!'
      });
    }
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
exports.fetchTransfers = async (request, response) => {
  try {
    const availableBalance = await balance.findOne({ 
      where: {
        userId: request.userData.id,
        active: true
      },
      attributes: [
        'current'
      ]
    });
    const amountTransfered = await transaction.sum('amount', { 
      where: {
        status: 'success'
      },
      include: {
        model: balance, 
        required: true,
        where: {
          userId: request.userData.id
        }  
      },
      include: {
        model: service, 
        required: true,
        where: {
          name: 'Owned Bank Account',
          name: 'User Bank Account',
          name: 'Other Bank Account'
        }  
      } 
    });
    const successfullTransfers = await transaction.count({
      where: {
        status: 'success'
      },
      include: {
        model: balance, 
        required: true,
        where: {
          userId: request.userData.id
        }  
      }
    });
    
    return response.send({
      data: {
        availableBalance: availableBalance,
        successfullTransfers: successfullTransfers,
        amountTransfered: amountTransfered === null ? 0 : amountTransfered
      },
      status: 'success',
      message: 'Transfers have been retrieved successfully!',
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
exports.transferToOther = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      wallet: 'required|integer',
      amount: 'required|integer',
      bankCode: 'required|string',
      bankName: 'required|string',
      accountNumber: 'required|integer',
      accountName: 'required|string',
      pin:   'required|integer'
    };

    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
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
    };

    return response.status(201).send({
      status: 'success',
      message: 'Transfer have been funded successfully!'
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
exports.transferToOwned = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      wallet: 'required|integer',
      amount: 'required|integer',
      bankCode: 'required|string',
      bankName: 'required|string',
      accountNumber: 'required|integer',
      accountName: 'required|string',
      pin: 'required|integer'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
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

    return response.status(201).send({
      status: 'success',
      message: 'Transfer have been funded successfully!'
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
exports.transferToUser = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      wallet: 'required|integer',
      username: 'required|string',
      amount: 'required|integer',
      accountName: 'required|string',
      pin:   'required|integer'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
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

    return response.status(201).send({
      status: 'success',
      message: 'Transfer have been funded successfully!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
}; 

/**
 * Validate a specified resource in storage.
 *
 * @return Response
 */  
exports.validateUserAccount = async (request, response) => {
  try { 
    // ** validation rules
    let rules = {
      username: 'required'
    };
    
    let validation = new Validator(request.query, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    }

    // ** email or phone
    const payload = {
      [Op.or]: [{
        email: {
          [Op.substring]: request.query.username.toLowerCase()}
        },
        {
        phone: {
          [Op.substring]: request.query.username}
        }
      ]
    };

    const userData = await user.findOne({
      where: { ...payload, roleId: 1 },
      attributes: [
        'firstName',
        'lastName',
        'email',
        'phone'
      ] 
    });

    if (userData === null || request.userData.email === userData.email || request.userData.phone === userData.phone) {
      return response.status(400).send({
        status: 'error',
        message: 'User account not found!'
      })
    }
    return response.status(200).send({
      data: userData,
      status: 'success',
      message: 'User account have been validated successfuly!'
    })
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
};

//= ====================================
//  WITHDRAWAL CONTROLLER  
//--------------------------------------
/**
 * Show the application admin details.
 *
 * @return void
 */
exports.withdrawOwnBank = async (request, response) => {
  try {
    const balanceData = await walletBalance(request.userData.id, request.body.wallet);

    if (balanceData.current >= request.body.amount) {

      const bankData = await BankAccount.findOne({
        where: {
          accountNumber: request.body.accountNumber
        } 
      });

      let reference = await uniqueNumber();

      const transactionData = await Transaction.create({
        userId: request.userData.id,
        serviceId: request.body.service,
        walletId: request.body.wallet,
        reference: reference,
        type: 'Debit',
        amount: request.body.amount,
        description: 'Own bank withdrawal',
        status: 'Pending',
      });

      await withdraw.create({
        transactionId: transactionData.toJSON().id,
        bankAccountId: bankData.toJSON().id
      });

      const walletbalance = await Balance.findOne({
        where: {
          userId: request.userData.id,
          walletId: request.body.walletId,
          status: true
        }
      });

      walletbalance.update({
        status: false
      });

      await balance.create({
        userId: request.userData.id,
        walletId: request.body.walletId,
        transactionId: transactionData.toJSON().id,
        previous: walletbalance.toJSON().current,
        current: (balanceData.toJSON().current*1) - (request.body.amount*1),
        status: true
      });
        
      return response.status(200).send({
        status: 'success',
        message: 'Withdrawal request have been sent successfuly!'
      });
    } else {
      return response.status(406).send({
        status: 'error',
        message: 'Insufficient balance in your wallet!'
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
 * Show the application admin details.
 *
 * @return void
 */
exports.withdrawOtherBank = async (request, response) => {
  try {
    const balanceData = await WalletBalance(request.userData.id, request.body.wallet);

    if (balanceData.current >= request.body.amount) {

      const bankData = await bankAccount.create({
        userId: request.userData.id,
        bankName: request.body.bankName,
        bankCode: request.body.bankCode,
        accountNumber: request.body.accountNumber,
        accountName: request.body.accountName,
        type: 'other',
      });

      let reference = await uniqueNumber();

      const transactionData = await Transaction.create({
        userId: request.userData.id,
        serviceId: request.body.service,
        walletId: request.body.wallet,
        reference: reference,
        type: 'Debit',
        amount: request.body.amount,
        description: 'Other bank withdrawal',
        status: 'Pending',
      });

      await withdraw.create({
        transactionId: transactionData.toJSON().id,
        bankAccountId: bankData.toJSON().id
      });

      const walletbalance = await balance.findOne({
        where: {
          userId: request.userData.id,
          walletId: request.body.walletId,
          status: true
        }
      });

      walletbalance.update({
        status: false
      });

      await balance.create({
        userId: request.userData.id,
        walletId: request.body.walletId,
        transactionId: transactionData.toJSON().id,
        previous: walletbalance.toJSON().current,
        current: (balanceData.toJSON().current*1) - (request.body.amount*1),
        status: true
      });
        
      return response.status(200).send({
        status: 'success',
        message: 'Withdrawal request have been sent successfuly!'
      });
    } else {
      return response.status(406).send({
        status: 'error',
        message: 'Insufficient balance in your wallet!'
      });
    }
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
}