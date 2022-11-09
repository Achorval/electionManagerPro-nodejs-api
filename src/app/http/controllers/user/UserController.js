let Validator = require('validatorjs');
const thirdParty = require('../../../../utils/ThirdParty');
const { 
  userAuditLog,
  multipleColumnsTransaction 
} = require('../../services/user/UserService');
const { 
  hashPassword,
  compareHashPassword,
  generateNumbersAndLetters
} = require("../../../../utils/Helpers");
// ** Models
const {
  lga,
  user,
  state,
  balance,
  country,
  service,
  developer,
  transaction,
  bankAccount,
  preference,
  userPreference,
  reserveAccount
} = require('../../../models');

//= ====================================
//  USER CONTROLLER
//--------------------------------------  
/**
 * Show the application user details.
 *
 * @return Response
 */
exports.getUserDetails = async (request, response) => {
  try {
    return response.status(200).send({
      status: 'success',
      message: 'User record retrieved successfully!',
      data: request.userData,
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Toggle user account balance.
 *
 * @return Response
 */
exports.toggleBalance = async (request, response) => {
  try {
    const userData = await user.findOne({
      where: {
        id: request.userData.id
      }
    });

    if (userData) {
      await userData.update({
        balanceStatus: request.body.status
      });

      return response.status(200).send({
        data: request.body.status,
        status: 'success',
        message: 'Your balance status has been changed successfully!'
      });
    };
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchBalance = async (request, response) => {
  try {
    await balance.findOne({ 
      where: {
        userId: request.userData.id,
        active: true
      },
      attributes: [
        'walletId',
        'previous', 
        'book',
        'current'
      ]
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Balance have been retrieved successfully!'
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
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchProducts = async (request, response) => {
  try {
    await product.findAll({ 
      where: {
        active: true
      },
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'name', 
        'slug',
        'imageUrl',
        'url',
        'color',
        'description',
        'active'
      ]
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Products have been retrieved successfully!'
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
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchServices = async (request, response) => {
  try {
    await service.findAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id',
        'name', 
        'slug',
        'active'
      ]
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Services have been retrieved successfully!'
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
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchTransactions = async (request, response) => {
  try {
    const result = await multipleColumnsTransaction(request);
    return response.status(200).send({
      data: {
        total: result.count,
        data: result.rows
      },
      status: 'success',
      message: 'Transactions have been retrieved successfully!'
    });
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured try, again later.'
    })
  }
};

/**
 * Display a listing of the resource.
 *
 * @param  string  $reference
 * @return Response
 */
exports.fetchTransactionsDetails = async (request, response) => {
  try {
    await transaction.findOne({ 
      where: {
        reference: request.params.reference
      },
      attributes: [
        'id',
        'reference', 
        'amount', 
        // 'type',
        'narration',
        'status',
        'createdAt'
      ],
      include: [{
        model: balance, 
        required: true,
        attributes: [
          'previous',
          'current'
        ] 
      },{
        model: service, 
        required: true,
        attributes: [
          'name'
        ] 
      }] 
    }).then(function (result) {
      return response.status(200).send({
        data: result,
        status: 'success',
        message: 'Transactions have been retrieved successfully!'
      });
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: '123An Error Occured try, again later.'
    })
  }
};

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.paymentGateways = async (request, response) => {
  try {
    await paymentGateway.findAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      where: {
        status: true
      },
      attributes: [
        'id', 
        'name', 
        'label',
        'apiLink',
        'appFee', 
      ] 
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Payment gateways retrieved successfuly!'
      });
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later.'
    })
  }
};

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchDashboard = async (request, response) => {
  try {
    const count = await transaction.count({
      include: {
        model: balance, 
        required: true,
        where: {
          userId: request.userData.id
        }  
      }
    });

    const inflow = await transaction.sum('amount', { 
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
          name: 'Fund Wallet'
        }  
      } 
    });
    
    const outflow = await transaction.sum('amount', { 
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
          name: 'Fund Wallet'
        }  
      }  
    });

    const data = {
      count: count,
      inflow: inflow === null ? 0 : inflow,
      outflow: outflow === null ? 0 : outflow
    }

    return response.send({
      data: data,
      status: 'success',
      message: 'Dashboard records have been retrieved successfully!',
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
exports.getNotifications = async (request, response) => {
  try {
    await notification.findAll({
      where: {
        userId: request.userData.id,
        active: true
      }
    }).then((data) => {
      return response.send({
        data: data,
        status: 'success',
        message: 'Notifications have been retrieved successfully!'
      });
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Remove the specified resource from storage.
 *
 * @param  string  $id
 * @return Response
 */
exports.deleteAllNotifications = async (request, response) => {
  try {
    await notification.update({
      active: false
    },{
      where: {
          userId: request.userData.id
      }
    }).then(() => {
      return response.send({
        status: 'success',
        message: 'Notifications have been cleared successfully!'
      });
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
exports.updatePersonalInformation = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      country: 'required|string',
      address: 'required|string',
      city:    'required|string',
      lga:     'required|string',
      state:   'required|string'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    }
    const userData = await user.findOne({
      where: {
        id: request.userData.id,
        blocked: false
      }
    });

    if (userData) {
      await userData.update({
        country: request.body.country,
        address: request.body.address,
        city: request.body.city,
        lga: request.body.lga,
        state: request.body.state
      });

      await userAuditLog({
        userId: request.userData.id,
        requests: {
          ...request.body
        },
        responses: null,
        channel: 'web',
        url: request.originalUrl,
        device: request.get('User-Agent'),
        ipAddress: request.ip,
        action: 'updatePersonalInformation'
      });

      return response.send({
        status: 'success',
        message: 'Personal Information have been updated successfully!'
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
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
exports.updateBusinessInformation = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      businessName: 'required|string',
      businessCategory: 'required|string',
      businessDescription: 'required|string',
      businessWebsiteUrl: 'required|string'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    }
    const userData = await user.findOne({
      where: {
        id: request.userData.id,
        blocked: false
      }
    });

    if (userData) {
      await userData.update({
        businessName: request.body.businessName,
        businessCategory: request.body.businessCategory,
        businessDescription: request.body.businessDescription,
        businessWebsiteUrl: request.body.businessWebsiteUrl
      });

      await userAuditLog({
        userId: request.userData.id,
        requests: {
          ...request.body
        },
        responses: null,
        channel: 'web',
        url: request.originalUrl,
        device: request.get('User-Agent'),
        ipAddress: request.ip,
        action: 'updateBusinessInformation'
      });

      return response.send({
        status: 'success',
        message: 'Business information have been updated successfully!'
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
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
exports.changePassword = async (request, response) => {
  try { 
    // ** Validation Rules
    let validation = new Validator(request.body, {
      newPassword: 'required',
      currentPassword: 'required',
      retypeNewPassword: 'required'
    });
    if (validation.fails()) {
      return response.status(400).send({
        'status': false,
        'message': 'Validation Error',
        'errors': validation.errors.all()
      });
    };

    // ** Check if User Exist
    const userData = await user.findOne({
      where: {
        id: request.userData.id
      }
    });

    if (!userData) {
      return response.status(400).send({
        status: 'error',
        message: `No user found`,
      });
    }

    if(!compareHashPassword(request.body.currentPassword, userData.password)) {
      return response.status(401).send({
        status: 'error',
        message: 'Current password is incorrect!'
      });
    };

    if (request.body.currentPassword === request.body.newPassword) {
      return response.status(400).send({
        status: 'error',
        message: 'New Password cannot be same as your old password!'
      });
    };

    if (request.body.newPassword !== request.body.retypeNewPassword) {
      return response.status(400).send({
        status: 'error',
        message: 'New password does not match!'
      });
    };

    await userData.update({
      password: hashPassword(request.body.newPassword)
    });

    // ** Change Password Audit
    await userAuditLog({
      userId: request.userData.id,
      auditableType: "User",
      auditableId: request.userData.id,
      event: 'changePassword',
      oldValues: null,
      newValues: null,
      url: request.originalUrl,
      userAgent: request.get('User-Agent'),
      ipAddress: request.ip,
      channel: "Web",
      returnData: null
    });

    return response.status(200).send({
      status: 'success',
      message: 'Password have been changed successfuly!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
exports.updateTwoFactorAuth = async (request, response) => {
  try {
    const data = await user.findOne({
      where: {
        id: request.userData.id
      }
    });
    await data.update({
      twoFactorAuth: request.body.email2FAuth
    });
    await userAuditLog({
      userId: request.userData.id,
      requests: {
        ...request.body
      },
      responses: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: request.body.email2FAuth ? 'twoFactorAuthEnabled' : 'twoFactorAuthDisabled' 
    });
    return response.send({
      data: request.body.email2FAuth,
      status: 'success',
      message: `Two-factor authentication ${request.body.email2FAuth ? 'enabled' : 'disabled'} successfully!`
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

//= ====================================
//  PREFERENCE CONTROLLER  
//--------------------------------------
/**
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchDeveloper = async (request, response) => {
  try {
    const data = await developer.findOne({
      where: {
        userId: request.userData.id
      },
      attributes: [
        'mode',
        'publicKey',
        'secretKey',
        'webhookUrl'
      ]
    });
    if (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: `Developer records have been retrieved successfuly!`
      });
    }
  } catch (error) { console.log(error)
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    })
  }
};

/**
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
exports.setDeveloperMode = async (request, response) => {
  try {
    const data = await developer.findOne({
      where: {
        userId: request.userData.id
      },
      attributes: [
        'id',
        'mode',
        'publicKey',
        'secretKey',
        'webhookUrl'
      ]
    });
    if (data) {
      await data.update({...request.body}); 
      await userAuditLog({
        userId: request.userData.id,
        requests: {
          ...request.body
        },
        responses: null,
        channel: 'web',
        url: request.originalUrl,
        device: request.get('User-Agent'),
        ipAddress: request.ip,
        action: 'setDeveloperMode'
      });
      return response.status(200).send({
        status: 'success',
        message: `Developer mode have been ${request.body.mode ? 'turned on' : 'turned off'} successfuly!`
      });
    }
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    })
  }
};

/**
 * Display a listing of the resource.
 *
 * @return Response
 */  
exports.fetchPreference = async (request, response) => {
  try {
    await preference.findAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id',
        'title'
      ],
      include: {
        model: userPreference,
        required: false,
        where: {
          userId: request.userData.id
        },
        attributes: [
          'preferenceId',
          'value'
        ]
      }
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Preference have been retrieved successfuly!'
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
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
exports.setPreference = async (request, response) => {
  try {
    const result = await userPreference.findOne({
      where: {
        userId: request.userData.id,
        preferenceId: request.body.preference,
        value: request.body.value
      },
      attributes: [
        'id',
        'value'
      ]
    });
    if (result) {
      await userPreference.destroy({
        where: {
          userId: request.userData.id,
          preferenceId: request.body.preference,
          value: request.body.value
        }
      });
      await userAuditLog({
        userId: request.userData.id,
        requests: {
          ...request.body
        },
        responses: null,
        channel: 'web',
        url: request.originalUrl,
        device: request.get('User-Agent'),
        ipAddress: request.ip,
        action: 'deletePreference'
      });
      return response.status(200).send({
        status: 'success',
        message: 'Preference have been disabled successfuly!'
      });
    } else {
      await userPreference.create({
        userId: request.userData.id,
        preferenceId: request.body.preference,
        value: request.body.value
      });

      await userAuditLog({
        userId: request.userData.id,
        requests: {
          ...request.body
        },
        responses: null,
        channel: 'web',
        url: request.originalUrl,
        device: request.get('User-Agent'),
        ipAddress: request.ip,
        action: 'createPreference'
      });

      return response.status(200).send({
        status: 'success',
        message: 'Preference have been enabled successfuly!'
      });
    }
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    })
  }
};

//= ====================================
//  BANK ACCOUNT CONTROLLER
//--------------------------------------
/**
 * Display a listing of the resource.
 *
 * @return Response
 */  
exports.fetchBankAccounts = async (request, response) => {
  try { 
    await bankAccount.findAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      where: {
        userId: request.userData.id,
        active: true
      },
      attributes: [
        'id', 
        'bankName', 
        'bankCode', 
        'accountNumber', 
        'accountName',
      ] 
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Bank account have been retrieved successfully!'
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
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.createBankAccount = async (request, response) => {
  try {
    const account = await bankAccount.findOne({
      where: {
        userId: request.userData.id,
        accountNumber: request.body.accountNumber,
      }
    });
    if (account === null) {
      await bankAccount.create({
        userId: request.userData.id,
        bankName: request.body.bankName,
        bankCode: request.body.bankCode, 
        accountNumber: request.body.accountNumber,
        accountName: request.body.accountName.toUpperCase(),
        type: 'own'
      });
      await userAuditLog({
        userId: request.userData.id,
        requests: {
          ...request.body
        },
        responses: null,
        channel: 'web',
        url: request.originalUrl,
        device: request.get('User-Agent'),
        ipAddress: request.ip,
        action: 'createBankAccount'
      });
      return response.status(201).send({
        status: 'success',
        message: 'Bank account have been created successfully!'
      });
    } else {
      return response.status(400).send({
        status: 'error',
        message: 'Account account already exist!'
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
 * Edit the specified resource in storage. 
 *
 * @param  string  $id
 * @return Response
 */
exports.editBackAccount = async (request, response) => {
  try { 
    if (request)   {
      await bankAccount.findOne({
        where: {
          id: request.params.id,
          userId: request.userData.id
        },
        attributes: [
          'id', 
          'bankName', 
          'bankCode', 
          'accountNumber', 
          'accountName'
        ] 
      }).then(function (data) {
        return response.status(200).send({
          data: data,
          status: 'success',
          message: 'Bank account have been edited successfully!'
        });
      });
    }
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    })
  }
};

/**
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
exports.updateBankAccount = async (request, response) => {
  try { 
  const data = await bankAccount.findOne({
    where: {
      id: request.params.id,
      userId: request.userData.id
    }
  });
  await data.update({
    bankName: request.body.bankName,
    bankCode: request.body.bankCode,
    accountNumber: request.body.accountNumber,
    accountName: request.body.accountName
  });
  await userAuditLog({
    userId: request.userData.id,
    requests: {
      ...request.body
    },
    responses: null,
    channel: 'web',
    url: request.originalUrl,
    device: request.get('User-Agent'),
    ipAddress: request.ip,
    action: 'updateBankAccount'
  });
  return response.status(200).send({
    data: request.params.id,
    status: 'success',
    message: 'Bank account have been updated successfully!'
  });
} catch (error) {
  return response.status(400).send({
    status: 'error',
    message: 'An Error Occured, try again later!'
  })
  }
};

/**
 * Remove the specified resource from storage.
 *
 * @param  string  $id
 * @return Response
 */
exports.deleteBankAccount = async (request, response) => {
  try {
    await bankAccount.findOne({
      where: {
        id: request.params.id,
        userId: request.userData.id
      }
    }).then(function (data) {
      data.update({
        active: false
      });
      return response.status(200).send({
          status: 'success',
          message: 'Bank account have been deleted successfully!'
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
 * Verify a user for an incoming Invitation request.
 *
 * @param  array  $data
 * @return Response
 */
exports.inviteFriend = async (request, response) => {
  try {
    // ** validation rules
    let rules = {
      friendEmail: 'required|string'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    }
    
    const { friendEmail } = request.body;

    // ** Find email or phone
    const userData = await user.findOne({
      where: {
        email: friendEmail.trim()
      }
    });

    if(userData) {
      return response.status(401).send({
        status: 'error',
        message: 'User account already exist.'
      });
    };

    // ** Invite friend audit
    await userAuditLog({
      userId: request.userData.id,
      requests: {
        ...request.body
      },
      responses: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: 'inviteFriend'
    });

    return response.send({
      status: 'success',
      message: 'Invitation has be sent successful!'
    });

  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
exports.setPin = async (request, response) => {
  try { 
    // ** Validation Rules
    let validation = new Validator(request.body, {
      pin : 'required|string'
    });
    if (validation.fails()) {
      return response.status(400).send({
        'status': false,
        'message': 'Validation Error',
        'errors': validation.errors.all()
      });
    };

    // ** Check User Exist
    const userData = await user.findOne({
      where: {
        id: request.userData.id
      }
    });

    if (!userData) {
      return response.status(400).send({
        status: 'error',
        message: `No user found`,
      });
    };

    // ** Set New PIN
    await userData.update({
      transactionPin: hashPassword(request.body.pin),
      hasTransactionPin: true
    });

     // ** Set PIN Audit
    await userAuditLog({
      userId: request.userData.id,
      auditableType: "User",
      auditableId: request.userData.id,
      event: 'setPin',
      oldValues: null,
      newValues: {
        pin: hashPassword(request.body.pin)
      },
      url: request.originalUrl,
      userAgent: request.get('User-Agent'),
      ipAddress: request.ip,
      channel: "Web",
      returnData: null
    });

    return response.status(200).send({
      status: 'success',
      message: 'Pin have been set successfuly!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
};

/**
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
exports.changePin = async (request, response) => {
  try { 
    // ** Validation Rules
    let validation = new Validator(request.body, {
      oldPin : 'required|string',
      newPin : 'required|string',
      retryPin : 'required|string'
    });
    if (validation.fails()) {
      return response.status(400).send({
        'status': false,
        'message': 'Validation Error',
        'errors': validation.errors.all()
      });
    };

    // ** Check User Exist
    const userData = await user.findOne({
      where: {
        id: request.userData.id
      }
    });

    // ** PIN Not Found
    if (!userData) {
      return response.status(400).send({
        status: 'error',
        message: `No user found!`,
      });
    }

    // ** Compare PIN
    if(!compareHashPassword(request.body.oldPin, userData.transactionPin)) {
      return response.status(401).send({
        status: 'error',
        message: 'Old pin is incorrect!'
      });
    };

    if (request.body.newPin !== request.body.retryPin) {
      return response.status(400).send({
        status: 'error',
        message: 'New pin does not match!'
      });
    }

    // ** Update PIN Audit
    await userData.update({
      transactionPin: hashPassword(request.body.newPin)
    });

    // ** Change PIN Audit
    await userAuditLog({
      userId: request.userData.id,
      auditableType: "User",
      auditableId: request.userData.id,
      event: 'changePin',
      oldValues: null,
      newValues: {
        oldPin: hashPassword(request.body.oldPin),
        newPin: hashPassword(request.body.newPin),
        retryPin: hashPassword(request.body.retryPin)
      },
      url: request.originalUrl,
      userAgent: request.get('User-Agent'),
      ipAddress: request.ip,
      channel: "Web",
      returnData: null
    });

    return response.status(200).send({
      status: 'success',
      message: 'Pin have been changed successfuly!'
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
exports.fetchCountries = async (request, response) => {
  try {
    await country.findAll({ 
      order: [
        ['createdAt', 'ASC']
      ], 
      attributes: [
        'id',
        'name',
        'alpha2Code'
      ]
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Country have been retrieved successfuly!'
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
exports.fetchStatesAndLgas = async (request, response) => {
  try {
    await state.findAll({ 
      where: {
        active: true
      },
      order: [
        ['createdAt', 'ASC']
      ], 
      attributes: [
        'id',
        'name',
        'alias'
      ],
      include: {
        model: lga, 
        required: true,
        where: {
          active: true
        },
        attributes: [
          'id',
          'name',
          'slug'
        ] 
      }
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'States and lga have been retrieved successfuly!'
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
exports.fetchReserveAccounts = async (request, response) => {
  try {
    await reserveAccount.findAll({ 
      where: {
        userId: request.userData.id
      },
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id',
        'accountName',
        'accountNumber',
        'bankName'
      ]
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Reserved accounts have been retrieved successfuly!'
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
exports.createReserveAccounts = async (request, response) => {
  try {
    console.log('result........')
    console.log(`${request.userData.firstName} ${request.userData.lastName}`)

    const result = await thirdParty.monnifyPost('bank-transfer/reserved-accounts', {
      "accountReference": `${new Date().getTime()}${generateNumbersAndLetters(3)}`,
	    "accountName": `${request.userData.firstName} ${request.userData.lastName}`,
	    "currencyCode": "NGN",
	    "contractCode": "2626516511",
	    "customerEmail": request.userData.email,
	    // "bvn": "21212121212",
	    "customerName": `${request.userData.firstName} ${request.userData.lastName}`, 
      "getAllAvailableBanks": false,
      "preferredBanks": ["035"]
    });

    await reserveAccount.create({
      userId: request.userData.id,
      accountName: result.data.responseBody.accountName,
      accountNumber: result.data.responseBody.accountNumber,
      bankName: result.data.responseBody.bankName,
      bankCode: result.data.responseBody.bankCode,
      reference: result.data.responseBody.accountReference,
      active: 1,
    });
    await userAuditLog({
      userId: request.userData.id,
      requests: {
        ...request.body
      },
      responses: {
        ...result.data
      },
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: 'createReserveAccount'
    });
    return response.status(201).send({
      status: 'success',
      message: 'Reserve account have been created successfully!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};