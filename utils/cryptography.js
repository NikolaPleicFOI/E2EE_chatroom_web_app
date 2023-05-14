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

/*const Crypt = require("crypto");

const algorithm = 'aes-256-ctr'
const secretKey = 'lPu8JSE98ax3offyD3jMxGZ8YiukMB'
let key = Crypt.createHash('sha256').update(String(secretKey)).digest('base64').substr(0, 32);

function encrypt(msg) {
	const iv = Crypt.randomBytes(16);
	
  const cipher = Crypt.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([cipher.update(msg), cipher.final()]);

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  }
}

function decrypt(encryptedString) {
  console.log(encryptedString);
  
  const decipher = Crypt.createDecipheriv(algorithm, key, Buffer.from(hash.iv, 'hex'))
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])
  
  console.log(decryptedString);
  return decrpyted.toString()
}
*/

module.exports = { encrypt, decrypt };
