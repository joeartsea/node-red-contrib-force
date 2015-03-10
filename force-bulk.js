/**
 * Copyright 2014 Atsushi Kojo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function (RED) {
  'use strict';
  var jsforce = require('jsforce');
  var request = require('request');
  var fs = require('fs');

  function ForceBulkInNode(n) {
    RED.nodes.createNode(this, n);
    this.force = n.force;
    this.sobject = n.sobject;
    this.operation = n.operation;
    this.polltimeout = n.polltimeout;
    this.extname = n.extname;
    this.localfilename = n.localfilename;
    this.forceConfig = RED.nodes.getNode(this.force);

    if (this.forceConfig) {
      var node = this;
      node.convType = function (payload, targetType) {
        if (typeof payload !== targetType) {
          if (targetType == 'string') {
            payload = JSON.stringify(payload);
          } else {
            payload = JSON.parse(payload);
          }
        }
        return payload;
      };
      node.readCsv = function(payload, csvFile){
        if(csvFile){
          payload = fs.createReadStream(csvFile);
        } else if(toString.call(payload) === '[object Array]' && typeof payload[0] == 'string') {
          payload = payload.join("\n");
        } else if(typeof payload == 'string' && payload.lastIndexOf("[", 0) == 0) {
          payload = node.convType(payload, 'object');
        }
        return payload;
      };
      node.on('input', function (msg) {
        this.sendMsg = function (err, result) {
          if (err) {
            node.error(err.toString());
            node.status({ fill: 'red', shape: 'ring', text: 'failed' });
          }
          node.status({});
          msg.payload = result;
          node.send(msg);
        };
        this.forceConfig.login(function (conn) {
          var localname = node.localfilename || msg.localfilename || '';
          if(node.polltimeout) conn.bulk.pollTimeout = node.polltimeout;
          switch (node.operation) {
            case 'query':
              msg.payload = node.convType(msg.payload, 'string');
              conn.bulk.query(msg.payload).stream().pipe(fs.createWriteStream(localname));
              msg.payload = 'query result saved.' + localname;
              node.send(msg);
              break;
            case 'insert_record':
              msg.payload = node.convType(msg.payload, 'object');
              conn.bulk.load(node.sobject, "insert", msg.payload, node.sendMsg);
              break;
            case 'insert_csv':
              var csvFileIn = node.readCsv(msg.payload, localname);
              conn.bulk.load(node.sobject, "insert", csvFileIn, node.sendMsg);
              break;
            case 'upsert':
              var extFieldName = node.extname || 'Id';
              var csvFileIn = node.readCsv(msg.payload, localname);
              conn.bulk.load(node.sobject, "upsert", {'extIdField': extFieldName}, csvFileIn, node.sendMsg);
              break;
            default:
              var csvFileIn = node.readCsv(msg.payload, localname);
              conn.bulk.load(node.sobject, node.operation, csvFileIn, node.sendMsg);
              break;
          }
        });
      });
    } else {
      this.error('missing force configuration');
    }
  }
  RED.nodes.registerType('force-bulk in', ForceBulkInNode);
}
