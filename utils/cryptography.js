var CryptoJS = require("crypto-js");

const secretKey = 'lPu8JSE98ax3offyD3jMxGZ8YiukMB'

function encrypt(msg){
	console.log("encrypting: " + msg);
	return CryptoJS.RC4.encrypt(msg, secretKey ).toString();
}

function decrypt(msg){
	console.log("decrypting: " + msg);
	return CryptoJS.RC4.decrypt(msg, secretKey ).toString(CryptoJS.enc.Utf8);
}

module.exports = { encrypt, decrypt };
