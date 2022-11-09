
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config/data');

/**
 * Create a new unique instance.
 *
 * @return unique
 */
// exports.uniqueNumber = () => {
//   var date = moment().format('YYYYMMDDHmmss');
//   const random = Math.floor(Math.random() * 1000000000) + 1; 
//   const unique = date+random;
//   return unique; 
// };
exports.uniqueNumber = (length) => {
  var date = moment().format('YYYYMMDD');
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  var result = '';
  for ( var i = 0; i < length; i++ ) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return date+result;
}
// let uniqueID = `${new Date().getTime()}${generateRandomLetters(3)`;

/**
 * Generate Numbers and Letters.
 *
 * @param  array  $data
 * @return User
 */
exports.generateNumbersAndLetters = (length) => {
  let result = '';

  if (!length) {
    length = 30;
  }

  var randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var string_length = length;
  for (var i = 0; i < string_length; i++) {
    var randomstrings = Math.floor(Math.random() * randomChars.length);
    result += randomChars.substring(randomstrings, randomstrings + 1);
    // result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

/**
 * Convert string to slug.
 *
 * @var  string
 * @return Slug
 */
exports.slug = async (Text) => {
  return Text
  .toLowerCase()
  .replace(/[^\w ]+/g,'')
  .replace(/ +/g,'-')
  ;
};

/**
* Convert string to Title case.
*
* @var string
*/
exports.titleCase = (str) => {
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
  }
  return splitStr.join(' '); 
};

/**
* Hash string to passsword.
*
* @var string
*/
exports.hashPassword = (password) => {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}

/**
* Compare Hased Password.
*
* @var string
*/
exports.compareHashPassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
}

/**
 * Generate Access Token.
 *
 * @id  $id
 * @return Token
 */
exports.accessToken = (id) => {
  if (id) {
    return jwt.sign({ id: id }, config.accessTokenSecretKey, { 
      expiresIn: config.ONE_WEEK 
    });  
  }
}

/**
 * Generate Refresh Token.
 *
 * @id  $id
 * @return Token
 */
exports.refresToken = (id) => {
  if (id) {
    return jwt.sign({ id: id }, config.refreshTokenSecretKey, { 
      expiresIn: config.ONE_WEEK 
    });
  }
};

/**
 * @function calculateLimitAndOffset
 * @param {number} page page number to get
 * @param {number} pageSize number of items per page/request
 * @returns {object} returns object containing limit and offset
 */
exports.limitAndOffset = (page, pageSize) => {
  const pageAsNumber = (Number.parseInt(page) - 1);
  const limitAsNumber = Number.parseInt(pageSize);

  let offset = 0;
  if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
    offset = pageAsNumber;
  }

  let limit = 1000;
  if (!Number.isNaN(limitAsNumber) && limitAsNumber > 0 && limitAsNumber < 15) {
    limit = limitAsNumber;
  }
   
  return { offset, limit };
}

/**
 * @function paginate
 * @param {number} page page number to get
 * @param {number} count total number of items
 * @param {array} rows items
 * @param {number} pageSize number of items per page/request
 * @returns {object} return the meta for pagination
 */
exports.paginate = (rows, page, totalItems, pageSize) => {
  const meta = {
    data: rows,
    currentPage: Number(page) || 1,
    totalPages: Math.ceil(totalItems / Number(pageSize)),
    pageSize: Number(pageSize),
    totalItems: totalItems
  };
  return meta;
};

