import { PDFDocument } from 'pdf-lib-plus-encrypt';
import fs from 'fs';

async function testDecrypt() {
  try {
    // 1. Create a protected PDF first
    const doc = await PDFDocument.create();
    doc.addPage([600, 400]);
    await doc.encrypt({
      userPassword: 'abc',
      ownerPassword: 'abc_owner',
      permissions: {
        printing: 'highResolution',
        copying: true,
        modifying: true,
      }
    });
    const encryptedBytes = await doc.save();
    fs.writeFileSync('temp_encrypted.pdf', encryptedBytes);
    console.log("Created temp_encrypted.pdf with userPassword 'abc'");

    // 2. Try to decrypt it
    console.log("Loading encrypted PDF with password 'abc'...");
    const loadBytes = fs.readFileSync('temp_encrypted.pdf');
    
    // In pdf-lib-plus-encrypt, to load an encrypted document, we pass the password in options:
    const decryptedDoc = await PDFDocument.load(loadBytes, { password: 'abc' });
    
    // To decrypt, we call decrypt() method on the document or just save it without encrypting again?
    // Let's check if decrypt() exists or if saving it naturally decrypts it:
    if (typeof decryptedDoc.decrypt === 'function') {
        console.log("Calling decrypt()...");
        await decryptedDoc.decrypt();
    } else {
        console.log("No decrypt() method found on prototype. Checking save output...");
    }

    const decryptedBytes = await decryptedDoc.save();
    fs.writeFileSync('temp_decrypted.pdf', decryptedBytes);
    
    // Verify if it is fully decrypted
    console.log("Testing if temp_decrypted.pdf loads without a password...");
    const checkBytes = fs.readFileSync('temp_decrypted.pdf');
    const testDoc = await PDFDocument.load(checkBytes);
    console.log("SUCCESS! PDF loaded without password, page count:", testDoc.getPageCount());

    // Clean up
    fs.unlinkSync('temp_encrypted.pdf');
    fs.unlinkSync('temp_decrypted.pdf');
  } catch (err) {
    console.error("Decryption test error:", err);
  }
}

testDecrypt();
