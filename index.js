const HOST = 'https://dev71980.service-now.com';
const DMAAP_TABLE = 'u_kafka_message';
const DMAAP_FIELD_NAME = 'u_message';
const USERNAME = 'jaydeepdeb';
const PASSWORD = 'India@123'

const NUMBER_OF_RECORDS = 1;
const INPUT_FILE_PATH = './Proper ones/ADI_filtered_payload.json';
const OUTPUT_FILE_PATH = './ADI_Postman_Payload.json';

const UPLOAD_TO_INSTANCE = false;
const GENERATE_POSTMAN_PAYLOAD = true;




const fs = require('fs');
const axios = require('axios');

let payload = fs.readFileSync(INPUT_FILE_PATH);
payload = JSON.parse(payload);
console.log('Total records input : '+payload.orders.length+'\n');

if(UPLOAD_TO_INSTANCE === true) {
    let payloadData = {
        records: []
    }
    for (let index = 0; index < payload.orders.length; index++) {
        let order = payload.orders[index];
        if (index === NUMBER_OF_RECORDS) break;
        let record = {};
        record[DMAAP_FIELD_NAME] = JSON.stringify(order.Message);
        payloadData.records.push(record)
    }
    axios.post(`${HOST}/${DMAAP_TABLE}.do?JSONv2&sysparm_action=insertMultiple`, payloadData, {
        auth: {
            username: USERNAME,
            password: PASSWORD
        }
    }).then(function (response) {
        console.log(NUMBER_OF_RECORDS+' records inserted in instance');
    }).catch(function (error) {
        console.log('Upload error');
    });
}

if(GENERATE_POSTMAN_PAYLOAD === true) {
    escapeJson = function (str) {
        return str
            .replace(/[\\]/g, '\\\\')
            .replace(/[\"]/g, '\\\"')
            .replace(/[\/]/g, '\\/')
            .replace(/[\b]/g, '\\b')
            .replace(/[\f]/g, '\\f')
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r')
            .replace(/[\t]/g, '\\t');
    };
    let postmanPayload = '{\"records\":[';
    for (let index = 0; index < payload.orders.length; index++) {
        let order = payload.orders[index];
        if (index === NUMBER_OF_RECORDS) {
            postmanPayload += '{\"' + DMAAP_FIELD_NAME + '\": "' + escapeJson(JSON.stringify(order.Message)) + '" }';
            break;
        } else postmanPayload += '{\"' + DMAAP_FIELD_NAME + '\": "' + escapeJson(JSON.stringify(order.Message)) + '" },';
    }
    fs.writeFileSync(OUTPUT_FILE_PATH, postmanPayload + ']}');
    console.log('Payload generated for '+NUMBER_OF_RECORDS+' records, FilePath: '+OUTPUT_FILE_PATH);
}
