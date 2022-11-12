let Validator = require('validatorjs');
const { Op } = require('sequelize');
const { adminAuditLog } = require('../services/SystemService');
const { user } = require('../../models');
const config = require('../../../config/data');
const { 
  titleCase, 
  accessToken, 
  refresToken,  
  hashPassword,
  compareHashPassword
} = require("../../../utils/Helpers");

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
      userName: 'required|string',
      email: 'required|email',
      phone: 'required',
      password: 'required|string|min:8',
      roleId: 'required|integer'
    });

    if (validation.fails()) {
      return response.status(401).json({
        'status': false,
        'message': 'Validation Error',
        'errors': validation.errors.all()
      });
    };

    // ** Check Existing Email
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

    // ** Check Existing Phone
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

    // ** Create a new Admin
    const adminData = await user.create({
      firstName: titleCase(request.body.firstName),
      lastName: titleCase(request.body.lastName),
      userName: titleCase(request.body.userName),
      email: request.body.email.toLowerCase(),
      phone: request.body.phone,
      password: hashPassword(request.body.password),
      roleId: request.body.roleId,
      blocked: false,
      blockedAt: null,
      blockedReason: '',
    });

    // ** Admin Register Audit
    await adminAuditLog({
      userId: adminData.id,
      auditableType: "User",
      auditableId: adminData.id,
      event: 'registerAdmin',
      oldValues: null,
      newValues: {
        firstname: request.body.firstName,
        lastname: request.body.lastName,
        userName: request.body.lastName,
        email: request.body.email,
        phone: request.body.phone,
        roleId: request.body.roleId
      },
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

  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Get admin details for a login admin.
 *
 * @param  array  $data
 * @return Admin
 */
exports.login = async (request, response) => {
  try {
    // ** Validation Rules
    let validation = new Validator(request.body, {
      userName: 'required|string',
      password: 'required|string|min:8'
    });

    if (validation.fails()) {
      return response.status(400).send({
        'status': false,
        'message': 'Validation Error',
        'errors': validation.errors.all()
      });
    };

    // ** Fetch with Email or Phone
    const payload = {
      [Op.or]: [{
        userName: {
          [Op.substring]: request.body.userName
        }
      },{
        email: {
          [Op.substring]: request.body.userName.toLowerCase()
        }
      },{
        phone: {
          [Op.substring]: request.body.userName
        }
      }]
    };

    // ** Find Admin
    const adminData = await user.findOne({
      where: { ...payload },
      attributes: [
        'id', 
        'firstName', 
        'lastName',
        'userName',
        'email',
        'phone', 
        'password',
        'roleId',
        'blocked'
      ]
    });
    
    // ** Check Admin Exist
    if (!adminData) {
      return response.status(401).send({
        status: 'error',
        message: 'Incorrect login details.'
      });
    };

    // ** Check Admin is Blocked
    if(adminData.blocked === true) {
      return response.status(403).send({
        status: 'error',
        message: 'Account is deactivated, contact support!'
      });
    };
  
    // ** Compare Admin Password 
    if(!compareHashPassword(request.body.password, adminData.password)) {
      return response.status(401).send({
        status: 'error',
        message: 'Incorrect login details.'
      });
    };

    // ** Create Admin Login Audit
    await adminAuditLog({
      userId: adminData.id,
      auditableType: "User",
      auditableId: adminData.id,
      event: 'loginAdmin',
      oldValues: null,
      newValues: {
        email: request.body.userName,
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
        accessToken: accessToken(adminData.id),
        refreshToken: refresToken(adminData.id),
        expiresIn: config.ONE_WEEK,
        adminData: adminData
      },
      status: 'success',
      message: 'Login authentication was successful!'
    });

  } catch (error) {  console.log(error)
    return response.status(500).send({
      status: 'error',
      message: "An error occured trying to log in."
    });
  }
};