import crypto from "crypto"
import "./env.js"

const secretKey = process.env.crypto_ciphering_secret_key
const ivector = process.env.crypto_ciphering_vector

// Function to encrypt data
export function encrypt(data, key= secretKey) {
  const iv = ivector; // Generate initialization vector
  const cipher = crypto.createCipheriv('aes-256-cbc',Buffer.from(key,"hex") , Buffer.from(iv,"hex"));
  let encryptedData = cipher.update(data, 'utf8', 'hex');
  encryptedData += cipher.final('hex');
  return encryptedData
}

// Function to decrypt data
export function decrypt(encryptedData, key=secretKey, iv=ivector) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
  decryptedData += decipher.final('utf8');
  return decryptedData;
}

// // Example usage
// const dataToEncrypt = "qL9MohgBc9wrAJuyqXZkKG8cbYE6tf8W58GeaDSzxHvo5WE93EPd9qWVz6mERuS8fersWzkMovTrgamt2VZngeew4ugZqtFm48X4MqrRXfieLHdh3qJTEbBYJ4FvYbHg";
// const encryptedData = encrypt(dataToEncrypt);
// console.log("Encrypted:", encryptedData);

// // Decrypt with the same key and IV used for encryption
// const decryptedData = decrypt(encryptedData);
// console.log("Decrypted:", decryptedData);
