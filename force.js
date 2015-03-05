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

  function ForceNode(n) {
    RED.nodes.createNode(this, n);
    var node = this;
    var credentials = RED.nodes.getCredentials(n.id);
    var conn = new jsforce.Connection({
      loginUrl: n.loginurl
    });
    this.login = function (callback) {
      conn.login(n.username, credentials.password, function (err, userInfo) {
        if (err) {
          node.error(err.toString());
          node.status({ fill: 'red', shape: 'ring', text: 'failed' });
        }
        node.status({});
        callback(conn);
      });
    }
  }

  RED.nodes.registerType('force', ForceNode, {
    credentials: {
      password: { type: 'password' }
    }
  });

  function ForceInNode(n) {
    RED.nodes.createNode(this, n);
    this.force = n.force;
    this.sobject = n.sobject;
    this.extname = n.extname;
    this.operation = n.operation;
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
      node.sendMsg = function (err, result) {
        if (err) {
          node.error(err.toString());
          node.status({ fill: 'red', shape: 'ring', text: 'failed' });
        }
        node.status({});
        msg.payload = result
        node.send(msg);
      };
      node.on('input', function (msg) {
        this.forceConfig.login(function (conn) {
          switch (node.operation) {
            case 'query':
              msg.payload = node.convType(msg.payload, 'string');
              conn.query(msg.payload, node.sendMsg);
              break;
            case 'create':
              msg.payload = node.convType(msg.payload, 'object');
              conn.sobject(node.sobject)
                .create(msg.payload, node.sendMsg);
              break;
            case 'update':
              msg.payload = node.convType(msg.payload, 'object');
              conn.sobject(node.sobject)
                .update(msg.payload, node.sendMsg);
              break;
            case 'upsert':
              msg.payload = node.convType(msg.payload, 'object');
              conn.sobject(node.sobject)
                .upsert(msg.payload, node.extname, node.sendMsg);
              break;
            case 'delete':
              msg.payload = node.convType(msg.payload, 'object');
              conn.sobject(node.sobject)
                .destroy(msg.payload, node.sendMsg);
              break;
          }
        });
      });
    } else {
      this.error('missing force configuration');
    }
  }
  RED.nodes.registerType('force in', ForceInNode);
}
