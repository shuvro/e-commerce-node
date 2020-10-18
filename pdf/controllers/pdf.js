const pdfmake = require('pdfmake');
const pdfMakePrinter = require('pdfmake/src/printer');
const vfs_fonts = require('pdfmake/build/vfs_fonts');

const generatePdf = function (docDefinition, callback){
  try {
    // var fonts = {
    //   Roboto: {
    //     normal: './fonts/Roboto-Regular.ttf',
    //     bold: './fonts/Roboto-Medium.ttf',
    //     italics: './fonts/Roboto-Italic.ttf',
    //     bolditalics: './fonts/Roboto-MediumItalic.ttf'
    //   }
    // };
    // const fontDescriptors = {};
    // const printer = new pdfMakePrinter(vfs_fonts);
    // const doc = printer.createPdfKitDocument(docDefinition);
    const doc = new pdfmake({
      Roboto: { 
          normal: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
          // bold: new Buffer(require('pdfmake/build/dataTable.vfs_fonts.js').pdfMake.vfs['Roboto-Bold.ttf'], 'base64')
      }
    }).createPdfKitDocument(docDefinition)
    
    let chunks = [];

    doc.on('data', (chunk) => {
      chunks.push(chunk);
    });
  
    doc.on('end', () => {
      callback(Buffer.concat(chunks));
      // const result = Buffer.concat(chunks);
      // callback('data:application/pdf;base64,' + result.toString('base64'));
    });
    
    doc.end();
    
  } catch(err) {
    throw(err);
  }
};


module.exports = {
	generatePdf: generatePdf
}
