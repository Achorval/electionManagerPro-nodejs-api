const {
  permission,
  role
} = require('../models');

/**
  * Determine whether the user can view any models.
  *
  * @param  \App\Models\User  $user
  * @return \Illuminate\Auth\Access\Response|bool
  */
exports.viewAny = async (request, response, next) => {
  try {
    

  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
};

/**
 * Determine whether the user can view the model.
 *
 * @param  \App\Models\User  $user
 * @param  \App\Models\Post  $post
 * @return \Illuminate\Auth\Access\Response|bool
 */
exports.view = async (request, response, next) => {
  try {
    if ( request.authAdmin.adminData.roleId ) {
      const result = await role.findOne({ 
        where: {
          id: 1
        },
        include: {
          model: permission, 
          required: true,
          where: {
            name: 'create userss'
          }  
        } 
      });
      if (result) {
        next();
      } else {
        return response.status(403).send({
          message: "Not authorize to perform this action!"
        });
      }
    }   else {
      return response.status(403).send({
        message: "No role provided!"
      });
    };
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Determine whether the user can create models.
 *
 * @param  \App\Models\User  $user
 * @return \Illuminate\Auth\Access\Response|bool
 */
exports.create = async (request, response) => {
  try {
    
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    })
  }
};  

/**
 * Determine whether the user can update the model.
 *
 * @param  \App\Models\User  $user
 * @param  \App\Models\Post  $post
 * @return \Illuminate\Auth\Access\Response|bool
 */
exports.update = async (request, response) => {
  try {
    
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
exports.delete = async (request, response) => {
  try {
    
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
}; 

/**
 * Determine whether the user can restore the model.
 *
 * @param  \App\Models\User  $user
 * @param  \App\Models\Post  $post
 * @return \Illuminate\Auth\Access\Response|bool
 */
exports.restore = async (request, response) => {
  try {
    // Validation rules
   
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};


exports.checkPermission = async (roleId, permName) => {
  return new Promise(
    (resolve, reject) => {
      Permission.findOne({
        where: {
          perm_name: permName
        }
      }).then((perm) => {
        RolePermission.findOne({
          where: {
            role_id: roleId,
            perm_id: perm.id
          }
        }).then((rolePermission) => {
          // console.log(rolePermission);
          if(rolePermission) {
            resolve(rolePermission);
          } else {
            reject({message: 'Forbidden'});
          }
        }).catch((error) => {
          reject(error);
        });
      }).catch(() => {
        reject({message: 'Forbidden'});
      });
    }
  );
};