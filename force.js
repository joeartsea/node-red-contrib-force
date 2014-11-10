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
      node.on('input', function (msg) {
        this.sendMsg = function (err, result) {
          if (err) {
            node.error(err.toString());
            node.status({ fill: 'red', shape: 'ring', text: 'failed' });
          }
          node.status({});
          msg.payload = result
          node.send(msg);
        };
        this.forceConfig.login(function (conn) {
          if (typeof msg.topic === 'string') {
            switch (node.operation) {
              case 'query':
                conn.query(msg.topic, node.sendMsg);
                break;
              case 'create':
                conn.sobject(node.sobject)
                  .create(JSON.parse(msg.topic), node.sendMsg);
                break;
              case 'update':
                conn.sobject(node.sobject)
                  .update(JSON.parse(msg.topic), node.sendMsg);
                break;
              case 'upsert':
                conn.sobject(node.sobject)
                  .upsert(JSON.parse(msg.topic), node.extname, node.sendMsg);
                break;
              case 'delete':
                conn.sobject(node.sobject)
                  .destroy(msg.topic, node.sendMsg);
                break;
            }
          } else {
            node.error('msg.topic : the query is not defined as a string');
          }
        });
      });
    } else {
      this.error('missing force configuration');
    }
  }
  RED.nodes.registerType('force in', ForceInNode);
}
