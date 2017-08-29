'use strict';

const fs = require('fs');
const pdfjsLib  = require('pdfjs-dist');
const json2csv  = require('json2csv');

const fields = ['question', 'fieldName', 'fieldID', 'fieldType', 'popupText', 'charLimit'];

process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
});

pdfjsLib.getDocument('test.pdf').then(async function (doc) {
    let fieldarray = [];
    for (let i=1; i<=doc.numPages; i++){
        let page = await doc.getPage(i);
        let annotations = await page.getAnnotations();
        annotations.forEach(function(field) {
            let fieldType = field.fieldType;
            if (field.fieldType == 'Btn' && field.checkBox == true && field.radioButton == false) fieldType ='checkbox';
            if (field.fieldType == 'Btn' && field.checkBox == false && field.radioButton == true) fieldType ='radio button';
            if (field.fieldType == 'Ch' && field.combo == true) fieldType ='select list';
            if (field.fieldType == 'Tx') fieldType = 'input text';

            let fieldobj = { question: field.fieldName, 
                fieldName: field.fieldName,
                fieldID: field.id,
                fieldType: fieldType,
                popupText: field.alternativeText,
                charLimit: field.maxLen
            }
            fieldarray.push(fieldobj);
        }, this);
    }
    let csv = json2csv({ data: fieldarray, fields: fields, del: ';' });
    return fs.writeFile('exportpdf.csv', csv);
});