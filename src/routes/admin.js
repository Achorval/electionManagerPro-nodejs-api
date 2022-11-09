const AuthenticationMiddlewares = require('../app/http/middlewares/AdminMiddleware');
const AuthController = require('../app/http/controllers/admin/AuthController');
const AdminController = require('../app/http/controllers/admin/AdminController');
const PermissionRoleController = require('../app/http/controllers/admin/PermissionRoleController');

module.exports = (app) => {   
  app.post('/api/admin/register', 
    AuthController.register);
  app.post('/api/admin/login', 
    AuthController.login);
  app.get('/api/admin', 
    AuthenticationMiddlewares.adminMiddleware, 
    AdminController.adminDetail);

  app.get('/api/admin/roles', 
    AuthenticationMiddlewares.adminMiddleware, 
    PermissionRoleController.fetchRoles);
  app.post('/api/admin/roles/create', 
    AuthenticationMiddlewares.adminMiddleware,
    PermissionRoleController.createRole);
  app.put('/api/admin/roles/update/:uuid', 
    AuthenticationMiddlewares.adminMiddleware,
    PermissionRoleController.updateRole);
  app.delete('/api/admin/roles/delete/:uuid', 
    AuthenticationMiddlewares.adminMiddleware, 
    PermissionRoleController.deleteRole);

  app.get('/api/admin/permissions', 
    AuthenticationMiddlewares.adminMiddleware, 
    PermissionRoleController.fetchPermissions);
  app.post('/api/admin/permissions/create', 
    AuthenticationMiddlewares.adminMiddleware,
    PermissionRoleController.createPermission);
  app.put('/api/admin/permissions/update/:uuid', 
    AuthenticationMiddlewares.adminMiddleware,
    PermissionRoleController.updatePermission);
  app.delete('/api/admin/permissions/delete/:uuid', 
    AuthenticationMiddlewares.adminMiddleware, 
    PermissionRoleController.deletePermission);

  app.get('/api/admin/states', 
    AuthenticationMiddlewares.adminMiddleware, 
    AdminController.fetchStates);
  app.post('/api/admin/states/create', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.createState);
  app.put('/api/admin/states/update/:id', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.updateState);
  app.delete('/api/admin/states/delete/:id', 
    AuthenticationMiddlewares.adminMiddleware, 
    AdminController.deleteState);
  app.put('/api/admin/states/status', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.updateStateStatus);

  app.get('/api/admin/lgas', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.fetchLgas);
  app.post('/api/admin/lgas/create',
    AuthenticationMiddlewares.adminMiddleware, 
    AdminController.createLga);
  app.put('/api/admin/lgas/update/:id', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.updateLga);
  app.delete('/api/admin/lgas/delete/:id', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.deleteLga);
  app.put('/api/admin/lgas/status', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.updateLga);

  app.get('/api/admin/wards', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.fetchWards);
  app.post('/api/admin/wards/create', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.createWard);
  app.put('/api/admin/wards/update/:id', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.updateWard);
  app.delete('/api/admin/wards/delete/:id', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.deleteWard);
  app.put('/api/admin/wards/status', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.updateWard);

  app.get('/api/admin/pollingUnits', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.fetchPollingUnits); 
  app.post('/api/admin/pollingUnits/create', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.createPollingUnit);
  app.put('/api/admin/pollingUnits/update/:id', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.updatePollingUnit);
  app.delete('/api/admin/pollingUnits/delete/:id', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.deletePollingUnit);
  app.put('/api/admin/pollingUnits/status', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.updatePollingUnit);
}

