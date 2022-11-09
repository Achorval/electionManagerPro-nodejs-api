let Validator = require('validatorjs');
const { 
  paginate,  
  limitAndOffset
} = require("../../../../utils/Helpers");
const { 
  role,
  permission,
} = require('../../../models');


//= ====================================
//  ROLE CONTROLLER
//--------------------------------------

/**
  * Determine whether the user can view any models.
  *
  * @param  \App\Models\User  $user
  * @return \Illuminate\Auth\Access\Response|bool
  */
exports.fetchRoles = async (request, response) => {
  try {
    const data = await role.findAll({
      include: [ permission ]
    });

    return response.status(200).send({
      data: data,
      status: 'success',
      message: 'Roles have been retrieved successfully!'
    });

    // const { offset, limit } = limitAndOffset(request.query.page, request.query.perPage);
    // await role.findAndCountAll({ 
    //   order: [
    //     ['createdAt', 'DESC']
    //   ], 
    //   attributes: [
    //     'id', 
    //     'uuid', 
    //     'name', 
    //     'description'
    //   ],
    //   limit: limit, 
    //   offset: offset, 
    // }).then(function (result) { 
    //   return response.status(200).send({
    //     data: paginate(result.rows, request.query.page, result.count, request.query.perPage),
    //     status: 'success',
    //     message: 'Roles have been retrieved successfully!'
    //   });
    // });
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
exports.createRole = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      name: 'required|string',
      description: 'required|string'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    };

    const result = await role.create({
      name: request.body.name,
      description: request.body.description
    });
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "Role",
      auditableId: result.id,
      event: 'createRole',
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
    return response.status(201).send({
      status: 'success',
      message: 'Role have been created successfully!'
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
exports.updateRole = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      name: 'required',
      description: 'required'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    }
    const result = await role.findOne({
      where: {
        uuid: request.params.uuid
      }
    });
    // ** Check if Role exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'Role not found!.'
      });
    };
    await result.update({
      name: request.body.name,
      description: request.body.description
    });
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "Role",
      auditableId: result.id,
      event: 'updateRole',
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
      message: 'Role have been updated successfully!'
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Determine whether the user can delete the model.
 *
 * @param  \App\Models\User  $user
 * @param  \App\Models\Post  $post
 * @return \Illuminate\Auth\Access\Response|bool
 */
exports.deleteRole = async (request, response) => {
  try {
    const result = await role.destroy({
      where: {
        uuid: request.params.uuid
      }
    });
    // ** Check if Permission exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'Role not found!.'
      });
    };
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "Role",
      auditableId: result.id,
      event: 'deleteRole',
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
      message: 'Role have been deleted successfully!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
}; 

//= ====================================
//  PERMISSION CONTROLLER
//--------------------------------------
/**
  * Determine whether the user can view any models.
  *
  * @param  \App\Models\User  $user
  * @return \Illuminate\Auth\Access\Response|bool
  */
 exports.fetchPermissions = async (request, response) => {
  try {
    const { offset, limit } = limitAndOffset(request.query.page, request.query.perPage);
    await permission.findAndCountAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id', 
        'uuid', 
        'name', 
        'description'
      ],
      limit: limit, 
      offset: offset, 
    }).then(function (result) { 
      return response.status(200).send({
        data: paginate(result.rows, request.query.page, result.count, request.query.perPage),
        status: 'success',
        message: 'Permissions have been retrieved successfully!'
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
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.createPermission = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      name: 'required|string',
      description: 'required|string'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    }

    const result = await permission.create({
      name: request.body.name,
      description: request.body.description
    });

    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "Permission",
      auditableId: result.id,
      event: 'createPermission',
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
    return response.status(201).send({
      status: 'success',
      message: 'Permission have been created successfully!'
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
exports.updatePermission = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      name: 'required|string',
      description: 'required|string'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    }
    const result = await permission.findOne({
      where: {
        uuid: request.params.uuid
      }
    });
    // ** Check if Permission exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'Permission not found!.'
      });
    };
    await permission.update({
      name: request.body.name,
      description: request.body.description
    });
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "Permission",
      auditableId: result.id,
      event: 'updatePermission',
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
      message: 'Permission have been updated successfully!'
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Determine whether the user can delete the model.
 *
 * @param  \App\Models\User  $user
 * @param  \App\Models\Post  $post
 * @return \Illuminate\Auth\Access\Response|bool
 */
exports.deletePermission = async (request, response) => {
  try {
    const result = await permission.destroy({
      where: {
        uuid: request.params.uuid
      }
    });
    // ** Check if Permission exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'Permission not found!.'
      });
    };
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "Permission",
      auditableId: result.id,
      event: 'deletePermission',
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
      message: 'Permission have been deleted successfully!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
}; 


//= ====================================
//  PERMISSIONROLE CONTROLLER
//--------------------------------------