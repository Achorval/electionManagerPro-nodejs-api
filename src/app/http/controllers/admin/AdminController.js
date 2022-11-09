let Validator = require('validatorjs');
const { 
  slug,
  paginate,
  limitAndOffset
} = require("../../../../utils/Helpers");
const {
  adminAuditLog,
} = require('../../services/admin/SystemService');
const { 
  state,
  lga,
  ward,
  pollingUnit,
  role,
  user,
} = require('../../../models');

/**
 * Display a list of the resource.
 *
 * @return Response
 */
exports.adminDetail = async (request, response) => {
  try {
    return response.status(200).send({
      status: 'success',
      data: request.adminData
    })
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    })
  }
};

/**
 * Block user account details.
 *
 * @return void
 */
exports.blockUserAccount = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.params, {
      email: 'required|email'
    });
    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    };
    
    const result = await user.findOne({
      where: {
        email: request.params.email
      }
    });
    // ** Check if User Exist
    if (!result) {
      return response.status(401).send({
        status: 'error',
        message: 'User account not found!.'
      });
    }; 
      
    if(result.blocked == true) {
      result.update({
        blocked: false,
        blockedAt: Date.now(),
        blockedReason: request.body.reason,
      });
      return response.status(200).send({
        status: 'success',
        message: 'User account enabled successfully!'
      });
    } else {
      result.update({
        blocked: true,
        blockedAt: Date.now(),
        blockedReason: request.body.reason,
      });
      return response.status(200).send({
        status: 'success',
        message: 'User account disabled successfully!'
      });
    }
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

// //= ====================================
// //  STATE CONTROLLER
// //--------------------------------------   
/**
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchStates = async (request, response) => {
  try {
    const { offset, limit } = limitAndOffset(request.query.page, request.query.perPage);
    await state.findAndCountAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id',
        'uuid',
        'name', 
        'slug',
        'active'
      ], 
      limit: limit, 
      offset: offset
    }).then(function (result) {
      return response.status(200).send({
        data: paginate(result.rows, request.query.page, result.count, request.query.perPage),
        status: 'success',
        message: 'States have been retrieved successfuly!'
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
exports.createState = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.body, {
      name: 'required|string'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    };
    const result = await state.create({
      name: request.body.name,
      slug: await slug(request.body.name)
    })
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "State",
      auditableId: result.id,
      event: 'createState',
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
      message: 'State have been created successfully!'
    });
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
},

/**
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
exports.updateState = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.body, {
      name: 'required|string'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    }
    const result = await state.findOne({
      where: {
        id: request.params.id
      }, 
      attributes: [
        'id', 
        'name'
      ]
    });
    // ** Check if State Exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'State not found!.'
      });
    };
    
    // ** Update State 
    await result.update({
      name: request.body.name,
      slug: await slug(request.body.name)
    });
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "State",
      auditableId: result.id,
      event: 'updateState',
      oldValues: {
        ...result
      },
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
      message: 'State have been updated successfully!'
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
exports.deleteState = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.params, {
      id: 'required|integer'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    };
    const result = await state.destroy({
      where: {
        id: request.params.id
      }
    });
    // ** Check if State exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'State not found!.'
      });
    };
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "State",
      auditableId: request.params.id,
      event: 'deleteState',
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
      message: 'State have been deleted successfully!'
    });
  } catch (error) { console.log(error)
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
exports.updateStateStatus = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.body, {
      uuid: 'required|integer',
      active: 'required|string'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    };
    const result = await state.findOne({
      where: {
        uuid: request.body.uuid
      },
      attributes: [
        'id',  
        'uuid',
        'active'
      ]
    });
    // ** Check if State status exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'State status not found!.'
      });
    };
    await result.update({
      active: request.body.active
    });
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "State",
      auditableId: result.id,
      event: 'updateStateStatus',
      oldValues: {
        ...result
      },
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
      message: 'State status have been updated successfully!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

//= ====================================
//  LGA CONTROLLER
//-------------------------------------- 
/**
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchLgas = async (request, response) => {
  try {
    const { offset, limit } = limitAndOffset(request.query.page, request.query.perPage);
    await lga.findAndCountAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id',
        'uuid',
        'stateId', 
        'name',
        'slug',
        'active'
      ], 
      limit: limit, 
      offset: offset,
      include: {
        model: state,
        where: {
          active: true
        },
        attributes: [
          'id',
          'name'
        ]
      }
    }).then(function (result) {
      return response.status(200).send({
        data: paginate(result.rows, request.query.page, result.count, request.query.perPage),
        status: 'success',
        message: 'State have been retrieved successfuly!'
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
exports.createLga = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.body, {
      stateId: 'required|integer',
      name: 'required|string'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    };
    const result = await lga.create({
      stateId: request.body.stateId,
      name: request.body.name,
      slug: await slug(request.body.name)
    })
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "Lga",
      auditableId: result.id,
      event: 'createLga',
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
      message: 'State have been created successfully!'
    });
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
},

/**
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
exports.updateLga = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.body, {
      stateId: 'required|integer',
      name: 'required|string'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    }
    const result = await state.findOne({
      where: {
        uuid: request.params.uuid
      }, 
      attributes: [
        'id', 
        'stateId', 
        'name',
        'slug'
      ]
    });
    // ** Check if Lga Exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'Lga not found!.'
      });
    };
    await lga.update({
      stateId: request.body.stateId,
      name: request.body.name,
      slug: request.body.name
    });
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "Lga",
      auditableId: result.id,
      event: 'updateLga',
      oldValues: {
        ...result
      },
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
      message: 'Lga have been updated successfully!'
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
exports.deleteLga = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.params, {
      id: 'required|integer'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    };
    const result = await lga.destroy({
      where: {
        id: request.params.id
      }
    });
    // ** Check if LGA exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'Lga not found!.'
      });
    };
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "Lga",
      auditableId: request.params.id,
      event: 'deleteLga',
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
      message: 'Lga have been deleted successfully!'
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
exports.updateLgaStatus = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.body, {
      uuid: 'required|integer',
      active: 'required|string'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    };
    const result = await lga.findOne({
      where: {
        uuid: request.body.uuid
      },
      attributes: [
        'id',  
        'uuid',
        'active'
      ]
    });
    // ** Check if Lga exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'Lga status not found!.'
      });
    };
    await result.update({
      active: request.body.active
    });
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "Lga",
      auditableId: result.id,
      event: 'updateLgaStatus',
      oldValues: {
        ...result
      },
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
      message: 'Lga status have been updated successfully!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

//= ====================================
//  WARD CONTROLLER
//--------------------------------------
/**
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchWards = async (request, response) => {
  try {
    const { offset, limit } = limitAndOffset(request.query.page, request.query.perPage);
    await ward.findAndCountAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id',
        'uuid',
        'lgaId', 
        'name',
        'active'
      ], 
      limit: limit, 
      offset: offset,
      include: {
        model: lga,
        where: {
          active: true
        },
        attributes: [
          'id',
          'name'
        ]
      }
    }).then(function (result) {
      return response.status(200).send({
        data: paginate(result.rows, request.query.page, result.count, request.query.perPage),
        status: 'success',
        message: 'Ward have been retrieved successfuly!'
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
exports.createWard = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.body, {
      lgaId: 'required|integer',
      name: 'required|string'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    };
    const result = await ward.create({
      lgaId: request.body.lgaId,
      name: request.body.name
    })
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "Ward",
      auditableId: result.id,
      event: 'createWard',
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
      message: 'Ward have been created successfully!'
    });
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
},

/**
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
exports.updateWard = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.body, {
      lgaId: 'required|integer',
      name: 'required|string'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    }
    const result = await ward.findOne({
      where: {
        id: request.params.id
      }, 
      attributes: [
        'id', 
        'lgaId', 
        'name'
      ]
    });
    // ** Check if Ward Price Exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'Ward price not found!.'
      });
    };
    await result.update({
      lgaId: request.body.lgaId,
      name: request.body.name
    });
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "Ward",
      auditableId: result.id,
      event: 'updateWard',
      oldValues: {
        ...result
      },
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
      message: 'Ward have been updated successfully!'
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
exports.deleteWard = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.params, {
      id: 'required|integer'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    };
    const result = await ward.destroy({
      where: {
        id: request.params.id
      }
    });
    // ** Check if Ward exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'Ward not found!.'
      });
    };
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "Ward",
      auditableId: request.params.id,
      event: 'deleteWard',
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
      message: 'Ward have been deleted successfully!'
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
exports.updateWardStatus = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.body, {
      uuid: 'required|integer',
      active: 'required|string'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    };
    const result = await ward.findOne({
      where: {
        uuid: request.body.uuid
      },
      attributes: [
        'id',  
        'uuid',
        'active'
      ]
    });
    // ** Check if Ward status exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'Ward status not found!.'
      });
    };
    await result.update({
      active: request.body.active
    });
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "Ward",
      auditableId: result.id,
      event: 'updateWardStatus',
      oldValues: {
        ...result
      },
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
      message: 'Ward status have been updated successfully!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

//= ====================================
//  POLLING UNIT CONTROLLER
//--------------------------------------
/**
 * Display a listing of the resource.
 *
 * @return Response
 */
 exports.fetchPollingUnits = async (request, response) => {
  try {
    const { offset, limit } = limitAndOffset(request.query.page, request.query.perPage);
    await pollingUnit.findAndCountAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id',
        'uuid',
        'wardId', 
        'name',
        'active'
      ], 
      limit: limit, 
      offset: offset,
      include: {
        model: ward,
        where: {
          active: true
        },
        attributes: [
          'id',
          'name'
        ]
      }
    }).then(function (result) {
      return response.status(200).send({
        data: paginate(result.rows, request.query.page, result.count, request.query.perPage),
        status: 'success',
        message: 'Polling Units have been retrieved successfuly!'
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
exports.createPollingUnit = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.body, {
      wardId: 'required|integer',
      name: 'required|string'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    };
    const result = await pollingUnit.create({
      wardId: request.body.wardId,
      name: request.body.name
    })
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "PollingUnit",
      auditableId: result.id,
      event: 'createPollingUnit',
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
      message: 'Polling Unit have been created successfully!'
    });
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
},

/**
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
exports.updatePollingUnit = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.body, {
      wardId: 'required|integer',
      name: 'required|string'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    }
    const result = await pollingUnit.findOne({
      where: {
        id: request.params.id
      }, 
      attributes: [
        'id', 
        'wardId', 
        'name'
      ]
    });
    // ** Check if Polling Unit Exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'Polling Unit not found!.'
      });
    };
    await result.update({
      wardId: request.body.wardId,
      name: request.body.name
    });
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "PollingUnit",
      auditableId: result.id,
      event: 'updatePollingUnit',
      oldValues: {
        ...result
      },
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
      message: 'Polling Unit have been updated successfully!'
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
exports.deletePollingUnit = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.params, {
      id: 'required|integer'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      );
    };
    const result = await pollingUnit.destroy({
      where: {
        id: request.params.id
      }
    });
    // ** Check if Polling Unit exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'Polling Unit not found!.'
      });
    };
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "PollingUnit",
      auditableId: request.params.id,
      event: 'deletePollingUnit',
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
      message: 'Polling Unit have been deleted successfully!'
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
exports.updateWardStatus = async (request, response) => {
  try {
    // Validation Rules
    let validation = new Validator(request.body, {
      uuid: 'required|integer',
      active: 'required|string'
    });

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    };
    const result = await pollingUnit.findOne({
      where: {
        uuid: request.body.uuid
      },
      attributes: [
        'id',  
        'uuid',
        'active'
      ]
    });
    // ** Check if Polling Unit exist
    if(!result) {
      return response.status(401).send({
        status: 'error',
        message: 'Polling Unit status not found!.'
      });
    };
    await result.update({
      active: request.body.active
    });
    await adminAuditLog({
      userId: request.adminData.id,
      auditableType: "PollingUnit",
      auditableId: result.id,
      event: 'updatePollingUnitStatus',
      oldValues: {
        ...result
      },
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
      message: 'Polling Unit status have been updated successfully!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};