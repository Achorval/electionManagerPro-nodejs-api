const AuthenticationMiddlewares = require('../app/http/middlewares/UserMiddleware');
const VerifyEmailMiddleware = require('../app/http/middlewares/EmailMiddleware');
const RecoveryMiddleware = require('../app/http/middlewares/RecoveryMiddleware');
const AuthController = require('../app/http/controllers/user/AuthController');
const UserController = require('../app/http/controllers/user/UserController');
const BillsController = require('../app/http/controllers/user/BillsController');
const PaymentController = require('../app/http/controllers/user/PaymentController');
const BalanceController = require('../app/http/controllers/user/BalanceController');

module.exports = (app) => {
  app.post('/api/register', 
    AuthController.register);
  app.post('/api/login', 
    AuthController.login);
  app.post('/api/account/recover',  
    AuthController.forgotPassword);
  app.post('/api/reset/password', 
    VerifyEmailMiddleware.emailMiddleware,
    AuthController.resetPassword);
  app.get('/api/verifyEmail/:token',  
    RecoveryMiddleware.recoveryMiddleware,
    AuthController.processVerifyEmail);
  app.post('/api/resendEmail', 
    AuthenticationMiddlewares.userMiddleware, 
    AuthController.resendVerifyEmail);
  app.post('/api/confirmNumber', 
    AuthenticationMiddlewares.userMiddleware, 
    AuthController.processConfirmNumber);
  
  app.get('/api/countries',
    UserController.fetchCountries);
  app.get('/api/statesandlgas',
    UserController.fetchStatesAndLgas);
  app.get('/api/user', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.getUserDetails); 
  app.get('/api/balance', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.fetchBalance); 
  app.post('/api/toggle/balance', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.toggleBalance); 
  app.get('/api/payment/methods',
    AuthenticationMiddlewares.userMiddleware, 
    UserController.paymentGateways);
  app.post('/api/invite/friend', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.inviteFriend); 
  app.get('/api/reserved/accounts',
    AuthenticationMiddlewares.userMiddleware, 
    UserController.fetchReserveAccounts);
  app.post('/api/reserved/accounts',
    AuthenticationMiddlewares.userMiddleware, 
    UserController.createReserveAccounts);
   
  app.post('/api/setPin', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.setPin); 
  app.post('/api/changePin', 
    AuthenticationMiddlewares.userMiddleware,
    UserController.changePin);
  app.post('/api/account/updatePersonal',   
    AuthenticationMiddlewares.userMiddleware, 
    UserController.updatePersonalInformation);
  app.post('/api/account/updateBusiness',   
    AuthenticationMiddlewares.userMiddleware, 
    UserController.updateBusinessInformation);
  app.post('/api/security/changePassword', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.changePassword);
  app.post('/api/security/2FAuth',   
    AuthenticationMiddlewares.userMiddleware,
    UserController.updateTwoFactorAuth);
 
  app.get('/api/bank/list', 
    AuthenticationMiddlewares.userMiddleware, 
    BalanceController.fetchBankList);
  app.get('/api/bank/accounts', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.fetchBankAccounts);
  app.get('/api/account/validate', 
    AuthenticationMiddlewares.userMiddleware, 
    BalanceController.validateAccountNumber);
  app.post('/api/bank/account/create', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.createBankAccount);
  app.get('/api/bank/account/edit/:id', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.editBackAccount);
  app.put('/api/bank/account/update/:id', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.updateBankAccount);
  app.delete('/api/bank/accounts/delete/:id', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.deleteBankAccount); 

  app.get('/api/products', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.fetchProducts); 
  app.get('/api/services', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.fetchServices); 
  app.get('/api/transactions', 
    AuthenticationMiddlewares.userMiddleware,
    UserController.fetchTransactions);
  app.get('/api/transactions/details/:reference', 
    AuthenticationMiddlewares.userMiddleware,
    UserController.fetchTransactionsDetails);
  app.get('/api/wallets', 
    AuthenticationMiddlewares.userMiddleware,
    PaymentController.fetchWallets); 
  app.post('/api/fundWallet/card', 
    AuthenticationMiddlewares.userMiddleware,
    PaymentController.fundWalletViaWithCard); 
  app.post('/api/fundWallet/reserveAccount', 
    AuthenticationMiddlewares.userMiddleware,
    PaymentController.fundWalletViaReserveAccount);
    
  app.get('/api/dashboard', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.fetchDashboard);
  app.post('/api/developer/mode', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.setDeveloperMode);
  app.get('/api/developer/list', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.fetchDeveloper);
  app.get('/api/preference/list', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.fetchPreference);
  app.post('/api/preference/set', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.setPreference);  
  app.get('/api/notifications', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.getNotifications);  
  app.post('/api/notifications/delete-all', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.deleteAllNotifications); 

  app.post('/api/verify/network', 
    AuthenticationMiddlewares.userMiddleware,
    BillsController.verifyNetwork);
  app.get('/api/airtime/networks', 
    AuthenticationMiddlewares.userMiddleware, 
    BillsController.fetchAirtimeNetworks);
  app.post('/api/airtime/purchase', 
    AuthenticationMiddlewares.userMiddleware, 
    BillsController.airtimePurchase);
  
  app.get('/api/internet/networks', 
    AuthenticationMiddlewares.userMiddleware, 
    BillsController.fetchDatabundleNetworks);
  app.post('/api/internet/purchase', 
    AuthenticationMiddlewares.userMiddleware,
    BillsController.databundlePurchase);
  
  app.get('/api/cables', 
    AuthenticationMiddlewares.userMiddleware,
    BillsController.fetchCableBouquets);
  app.post('/api/cables/validate/smartcard', 
    AuthenticationMiddlewares.userMiddleware,
    BillsController.validateSmartCard);
  app.post('/api/cables/purchase', 
    AuthenticationMiddlewares.userMiddleware, 
    BillsController.cablePurchase);
  
  app.get('/api/electricity/discos',
    AuthenticationMiddlewares.userMiddleware,
    BillsController.fetchDiscos);
  app.post('/api/electricity/validate/meterNumber', 
    AuthenticationMiddlewares.userMiddleware,
    BillsController.validateMeterNumber);
  app.post('/api/electricity/purchase',  
    AuthenticationMiddlewares.userMiddleware,
    BillsController.electricityPurchase); 

  app.get('/api/transfers', 
    AuthenticationMiddlewares.userMiddleware,
    PaymentController.fetchTransfers);
  app.post('/api/transfers/other', 
    AuthenticationMiddlewares.userMiddleware,
    PaymentController.transferToOther);
  app.post('/api/transfers/owned', 
    AuthenticationMiddlewares.userMiddleware,
    PaymentController.transferToOwned);
  app.post('/api/transfers/user', 
    AuthenticationMiddlewares.userMiddleware,
    PaymentController.transferToUser);
  app.get('/api/userAccount/validate', 
    AuthenticationMiddlewares.userMiddleware, 
    PaymentController.validateUserAccount);

  app.get('/api/airtimeEpin/networks', 
    // AuthenticationMiddlewares.userMiddleware, 
    BillsController.fetchAirtimeEpinNetworks);
  app.get('/api/denominations', 
    // AuthenticationMiddlewares.userMiddleware, 
    BillsController.fetchDenominations);
};
