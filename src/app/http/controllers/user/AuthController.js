const { Op } = require('sequelize');
let Validator = require('validatorjs');
const config = require('../../../../config/data');
const emailSender = require('../../../../config/Mail');
const { userAuditLog } = require('../../services/user/UserService');
const { 
  titleCase, 
  accessToken, 
  refresToken, 
  hashPassword,
  compareHashPassword
} = require("../../../../utils/Helpers");
// ** Models
const {
  user,
  role,
  permission,
  wallet,
  balance,
  referral,
  userWallet,
  developer
} = require('../../../models');


//= ====================================
//  AUTH CONTROLLER
//--------------------------------------  
/**
 * Verify a user for an incoming login request.
 *
 * @param  array  $data
 * @return User
 */
exports.login = async (request, response) => {
  try {
    // ** Validation Rules
    let validation = new Validator(request.body, {
      userName: 'required|string',
      password: 'required|string|min:8'
    });

    if (validation.fails()) {
      return response.status(401).json({
        'status': false,
        'message': 'Validation Error',
        'errors': validation.errors.all()
      });
    };
    
    // ** Check Email or Phone **//
    const payload = {
      [Op.or]: [{
        email: {
          [Op.substring]: request.body.userName.toLowerCase()}
        },
        {
        phone: {
          [Op.substring]: request.body.userName}
        }
      ]
    };
    const userData = await user.findOne({ 
      where: { ...payload },
      attributes: [
        'id', 
        'firstName', 
        'lastName',
        'accountType',
        'email',
        'password',
        'isEmailVerified',
        'emailVerifiedAt',
        'phone', 
        'isPhoneVerified',
        'dob',
        'gender',
        'bvn',
        'isBvnVerified', 
        'hasTransactionPin',
        'balanceStatus',
        'blocked'
      ]
    });
    
    // ** Check if user exist
    if(!userData) {
      return response.status(401).send({
        status: 'error',
        message: 'Incorrect login details.'
      });
    };

     // ** Check if user is blocked
    if(userData.blocked === true) {
      return response.status(403).send({
        status: 'error',
        message: 'Account is deactivated, contact support!'
      });
    };

     // ** Compare password
    if(!compareHashPassword(request.body.password, userData.password)) {
      return response.status(401).send({
        status: 'error',
        message: 'Incorrect login details.'
      });
    };

    // ** Login audit
    await userAuditLog({
      userId: userData.id,
      auditableType: "User",
      auditableId: userData.id,
      event: 'userLogin',
      oldValues: null,
      newValues: {
        userName: request.body.userName,
        password: hashPassword(request.body.password)
      },
      url: request.originalUrl,
      userAgent: request.get('User-Agent'),
      ipAddress: request.ip,
      channel: "Web",
      returnData: null
    });

    return response.send({
      data: {
        expiresIn: config.ONE_WEEK,
        accessToken: accessToken(userData.id),  
        refreshToken: refresToken(userData.id),
        userData: userData
      },
      status: 'success',
      message: 'You have successfully logged in. Now you can start transacting. Enjoy!'
    });

  } catch (error) {   console.log(error)
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Create a new user for an incoming registration request.
 *
 * @param  array  $data
 * @return User
 */
exports.register = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.body, {
      firstName: 'required|string',
      lastName: 'required|string',
      email: 'required|email',
      countryId: 'required|integer',
      phone: 'required|string',
      password: 'required|string|min:8',
      accountType: 'required|string'
    });
    if (validation.fails()) {
      return response.status(401).json({
        'status': false,
        'message': 'Validation Error',
        'errors': validation.errors.all()
      });
    };

    // ** Check existing email
    const emailExist = await user.findOne({
      where: {
        email: request.body.email.toLowerCase()
      }
    });
    if (emailExist) {
      return response.status(400).send({
        status: 'error',
        message: 'This email is already in use.'
      });
    };

    // ** Check existing phone
    const phoneExist = await user.findOne({
      where: {
        phone: request.body.phone
      }
    });
    if (phoneExist) {
      return response.status(400).send({
        status: 'error',
        message: 'This phone number is already in use.'
      });
    };

    // ** Create a new user
    const userData = await user.create({
      firstName: titleCase(request.body.firstName),
      lastName: titleCase(request.body.lastName),
      email: request.body.email.toLowerCase(),
      accountType: request.body.accountType,
      isEmailVerified: false,
      emailVerifiedAt: null,
      phone: request.body.phone,
      phoneVerificationCode: '',
      isPhoneVerified: false,
      phoneVerifiedAt: null,
      dob: '',
      gender: '',
      isGenderVerified: false,
      photoUrl: '',
      address: '',
      city: '',
      lga: '',
      state: '',
      countryId: request.body.countryId,
      roleId: 2,
      password: hashPassword(request.body.password),
      bvn: null,
      isBvnVerified: false,
      bvnVerifiedAt: null,
      isIDUploaded: false,
      isIDVerified: false,
      iDVerifiedAt: null,
      isProofOfAddressUploaded: false,
      isProofOfAddressVerified: false,
      proofOfAddressVerifiedAt: null,
      transactionPin: '',
      hasTransactionPin: false,
      balanceStatus: false,
      rememberToken: '',
      blocked: false,
      blockedAt: null,
      blockedReason: '',
      kycStatus: false
    });

    // ** Create Developer
    await developer.create({
      userId: userData.id,
      publicKey: '',
      secretKey: '',
      webhookUrl: null,
      mode: false
    }); 

    // ** Get Exising Wallet
    const walletData = await wallet.findAll({
      attributes: ['id', 'name']
    });
    if (walletData) {
      for ( var i=0; i < walletData.length; i++  ) {
        let primary = walletData[i].name == 'Naira' ? true : false;
        await userWallet.create({
          userId: userData.id,
          walletId: walletData[i].id,
          address: '',
          primary: primary,
          barCode: '',
          isFrozen: false
        });
        // ** Create User Balance
        await balance.create({  
          userId: userData.id,
          walletId: walletData[i].id,
          previous: 0.00,
          book: 0.00,
          current: 0.00,
          active: true
        });
      };
    };

    // ** Create Referral
    if (request.body.referralCode) {
      const referralExist = await user.findOne({
        where: {
          email: request.body.referralCode
        },
        attributes: [
          'email'
        ] 
      });
      if (referralExist && request.body.email !== request.body.referralCode) {
        await referral.create({
          referrerEmail: request.body.referralCode.toLowerCase(),
          refereeEmail: request.body.email.toLowerCase()
        });
      }   
    };

    // ** Send verification email
    // emailSender.sendMail({
    //   transport: 'default',
    //   options: {
    //     from: '"Paycrowdy" <noreply@paycrowdy.com>',
    //     to: email, 
    //     subject: "Verify your Email", 
    //   },
    //   text: '',
    //   html: {
    //     template: 'verifyEmail',
    //     vars: {
    //       firstName: `${user.firstName}`, 
    //       lastName: `${user.lastName}`, 
    //       verifyEmailLink: `https://paycrowdy.com/verify-email/` + accessToken(user.id)
    //     } 
    //   }
    // });

    // ** Create Register Audit
    await userAuditLog({
      userId: userData.id,
      auditableType: "User",
      auditableId: userData.id,
      event: 'userRegister',
      oldValues: null,
      newValues: null,
      url: request.originalUrl,
      userAgent: request.get('User-Agent'),
      ipAddress: request.ip,
      channel: "Web",
      returnData: null
    });

    return response.status(201).send({
      status: 'success',
      message: 'Your account has been created successfully!'
    }); 
  } catch (error) { console.log(error)
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Verify user for an incoming email verification request.
 *
 * @param  Request  $request
 * @return Response
 */
exports.processVerifyEmail = async (request, response) => {
  try {
    // ** Validation Rules
    let validation = new Validator(request.userData, {
      id : 'required'
    });
    if (validation.fails()) {
      return response.status(400).send({
        'status': false,
        'message': 'Validation Error',
        'errors': validation.errors.all()
      });
    };

    const user = await user.findOne({
      where: {
        id: request.userData.id
      }
    });

    if (user === null) {
      return response.status(401).send({
        status: 'error',
        message: 'User not found, contact support!'
      });
    };

    if (user.isEmailVerified && user.emailVerifiedAt !== null) {
      return response.status(200).send({
        status: 'success',
        message: 'Your email address is already verified!'
      });
    }

    await user.update({
      isEmailVerified: true,
      emailVerifiedAt: Date.now()
    });

    await userAuditLog({
      userId: request.userData.id,
      auditableType: "User",
      auditableId: request.userData.id,
      event: 'verifyEmail',
      oldValues: null,
      newValues: {
        ...request.body
      },
      url: request.originalUrl,
      userAgent: request.get('User-Agent'),
      ipAddress: request.ip,
      channel: "Web",
      returnData: null
    });

    return response.status(200).send({
      status: 'success',
      message: 'Your email address has been verified successfully!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Resend email verification request.
 *
 * @param  Request  $request
 * @return Response
 */
exports.resendVerifyEmail = async (request, response) => {
  try {
    // ** Validation Rules
    let validation = new Validator(request.userData, {
      id : 'required'
    });
    if (validation.fails()) {
      return response.status(400).send({
        'status': false,
        'message': 'Validation Error',
        'errors': validation.errors.all()
      });
    };

    // ** Check if User Exist
    const user = await user.findOne({
      where: {
        id: request.userData.id
      }
    });
    if (user === null) {
      return response.status(401).send({
        status: 'error',
        message: 'User not found!'
      });
    }

    // ** Verification Email
    emailSender.sendMail({
      transport: 'default',
      options: {
        from: '"Paycrowdy" <noreply@paycrowdy.com>',
        to: user.email, 
        subject: "Verify your Email", 
      },
      text: '',
      html: {
        template: 'verifyEmail',
        vars: {
          firstName: `${user.firstName}`, 
          lastName: `${user.lastName}`, 
          verifyEmailLink: `https://paycrowdy.com/verify-email/` + accessToken(user.id)
        } 
      }
    });

    // ** Resend Verify Email Audit
    await userAuditLog({
      userId: request.userData.id,
      auditableType: "User",
      auditableId: request.userData.id,
      event: 'resendVerifyEmail',
      oldValues: null,
      newValues: {
        ...request.body
      },
      url: request.originalUrl,
      userAgent: request.get('User-Agent'),
      ipAddress: request.ip,
      channel: "Web",
      returnData: null
    });
    return response.status(200).send({
      status: 'success',
      message: 'Activation link has been sent to Your email!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Process phone verification request.
 *
 * @param  Request  $request
 * @return Response
 */
exports.processConfirmNumber = async (request, response) => {
  try {
    // ** Validation Rules
    let validation = new Validator(request.body, {
      otp : 'required'
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
        id: request.userData.id,
        phoneVerificationCode: request.body.otp
      }
    });

    if (userData === null) {
      return response.status(400).send({
        status: 'error',
        message: 'Invalid otp!'
      });
    }

    await userData.update({
      phoneVerificationCode: '',
      isPhoneVerified: true,
      phoneVerifiedAt: Date.now()
    });

    // ** Phone Number Verification Audit
    await userAuditLog({
      userId: request.userData.id,
      auditableType: "User",
      auditableId: request.userData.id,
      event: 'verifyPhoneNumber',
      oldValues: null,
      newValues: {
        ...request.body
      },
      url: request.originalUrl,
      userAgent: request.get('User-Agent'),
      ipAddress: request.ip,
      channel: "Web",
      returnData: null
    });

    return response.status(200).send({
      status: 'success',
      message: 'Phone number has been verified successfully!'
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Request for password reset link.
 *
 * @param  Request  $request
 * @return Response
 */
exports.forgotPassword = async (request, response) => {
  try {
    // ** Validation Rules
    let validation = new Validator(request.body, {
      email: 'required'
    });
    if (validation.fails()) {
      return response.status(400).send({
        'status': false,
        'message': 'Validation Error',
        'errors': validation.errors.all()
      });
    };

    // ** User Exist
    const userData = await user.findOne({
      where: {
        email: request.body.email
      }
    });

    if (!userData) {
      return response.status(401).send({
        status: 'error',
        message: 'User email not found!'
      });
    };

    if (userData.blocked === true) {
      return response.status(401).send({
        status: 'error',
        message: 'Account is blocked, contact support!'
      });
    };

    // ** Account recovery email
    emailSender.sendMail({
      transport: 'default',
      options: {
        from: '"Paycrowdy" <noreply@paycrowdy.com>',
        to: request.body.email, 
        subject: "Reset your Paycrowdy password", 
      },
      text: '',
      html: {
        template: 'resetPassword',
        vars: {
          firstName: `${userData.firstName}`, 
          lastName: `${userData.lastName}`, 
          email: request.body.email,
          recoveryLink: `https://paycrowdy.com/reset-password/` + accessToken(userData.id)
        } 
      }
    });

    // ** Creat Forgot password link Audit
    await userAuditLog({
      userId: request.userData.id,
      auditableType: "User",
      auditableId: request.userData.id,
      event: 'resetPasswordLink',
      oldValues: null,
      newValues: {
        ...request.body
      },
      url: request.originalUrl,
      userAgent: request.get('User-Agent'),
      ipAddress: request.ip,
      channel: "Web",
      returnData: null
    });

    return response.status(200).send({
      status: 'success',
      message: 'Reset link has been sent to your email'
    });

  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Reset forgot password.
 *
 * @param  Request  $request
 * @return Response
 */
exports.resetPassword = async (request, response) => {
  try {
    // ** Validation Rules
    let validation = new Validator(request.adminData, {
      id: 'required'
    });
    if (validation.fails()) {
      return response.status(400).send({
        'status': false,
        'message': 'Validation Error',
        'errors': validation.errors.all()
      });
    };

     // ** Find User Account Details
    const userData = await user.findOne({
      where: {
        id: request.userData.id
      }
    });
    if (userData === null) {
      return response.status(401).send({
        status: 'error',
        message: 'User not found, contact support!'
      });
    };
    if (userData.blocked === true) {
      return response.status(401).send({
        status: 'error',
        message: 'Account is blocked, contact support!'
      });
    };
    if (request.body.newPassword !== request.body.retypeNewPassword) {
      return response.status(200).send({
        status: 'success',
        message: 'Password does not match!'
      });
    }

     // ** Update Password
    await user.update({
      password: hashPassword(request.body.newPassword)
    });

    // ** Create ResetPassword Audit
    await userAuditLog({
      userId: request.userData.id,
      auditableType: "User",
      auditableId: request.userData.id,
      event: 'resetPassword',
      oldValues: null,
      newValues: {
        ...request.userData
      },
      url: request.originalUrl,
      userAgent: request.get('User-Agent'),
      ipAddress: request.ip,
      channel: "Web",
      returnData: null
    });
    
    return response.status(200).send({
      status: 'success',
      message: 'Password Reset has been completed successfully!'
    });
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};
