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
  "use strict";
  var jsforce = require("jsforce");
  var request = require("request");

  function ForceChatterContentInNode(n) {
    RED.nodes.createNode(this, n);
    this.force = n.force;
    this.operation = n.operation;
    this.group = n.group;
    this.query = n.query;
    this.to = n.to;
    this.mention = n.mention;
    this.forceConfig = RED.nodes.getNode(this.force);

    if (this.forceConfig) {
      var node = this;
      node.on("input", function (msg) {
        this.sendMsg = function (err, result) {
          if (err) {
            node.error(err.toString());
            node.status({ fill: "red", shape: "ring", text: "failed" });
          } else {
            node.status({});
          }
          msg.payload = result;
          node.send(msg);
        };
        this.forceConfig.login(function (conn, err) {
          if (err) {
            node.sendMsg(err);
            return;
          }
          switch (node.operation) {
            case "get_feed":
              conn.chatter.resource("/feeds/news/me/feed-elements").retrieve(node.sendMsg);
              break;
            case "get_group":
              var url = "/feeds/record/" + node.group + "/feed-elements";
              conn.chatter.resource(url).retrieve(node.sendMsg);
              break;
            case "search_feed":
              conn.chatter.resource("/feed-elements", { q: node.query }).retrieve(node.sendMsg);
              break;
            case "post_feed":
              var feedItem = {
                body: {
                  messageSegments: []
                },
                feedElementType: "FeedItem",
                subjectId: node.to || msg.topic || "me"
              };
              console.log('node.mention', node.mention);
              return;
              var mentions = node.mention.split(",");
              for (var i = 0; i < mentions.length; i++) {
                if (mentions[i]) {
                  feedItem.body.messageSegments.push({
                    type: "Mention",
                    id: mentions[i]
                  });
                  feedItem.body.messageSegments.push({
                    type: "Text",
                    text: "\n"
                  });
                }
              }
              feedItem.body.messageSegments.push({
                type: "Text",
                text: msg.payload
              });
              
              if (msg.filename && msg.binaryBuffer) {
                //register photo
                feedItem.capabilities = {
                  content:{
                    description: msg.payload,
                    title: msg.filename
                  }
                };
                var options = {
                  method: "POST",
                  url: `${conn.instanceUrl}/services/data/v${conn.version}/chatter/feed-elements`,
                  headers: {
                    Authorization: `Bearer ${conn.accessToken}`,
                  },
                  formData: {
                    feedElementFileUpload: {
                      value: msg.binaryBuffer,
                      options: {
                        filename: msg.filename,
                        contentType: "application/octet-stream",
                      },
                    },
                    json: {
                      value: JSON.stringify(feedItem),
                      options: {
                        contentType: "application/json; charset=UTF-8",
                      },
                    },
                    feedElementType: "FeedItem",
                    subjectId: node.to || msg.topic || "me",
                  },
                };
                
                request(options, function (error, response) {
                  if (error) throw new Error(error);
                  msg.payload = JSON.parse(response.body);
                  node.send(msg);
                });
              } else {
                conn.chatter.resource("/feed-elements").create(feedItem, node.sendMsg);
              }
              break;
          }
        }, msg);
      });
    } else {
      this.error("missing force configuration");
    }
  }
  RED.nodes.registerType("force-chatter content", ForceChatterContentInNode);


  RED.httpAdmin.get("/force-chatter/get-groups", function (req, res) {
    var forceCredentials = RED.nodes.getCredentials(req.query.credentials);
    var forceNode = RED.nodes.getNode(req.query.id);
    var configNode = RED.nodes.getNode(req.query.credentials);
    var forceConfig = null;

    if (forceNode && forceNode.forceConfig) {
      forceConfig = forceNode.forceConfig;
    } else if (configNode) {
      forceConfig = configNode;
    } else {
      forceConfig = req.query;
      if (forceCredentials) forceConfig.credentials = forceCredentials;
      forceConfig.login = ForceNodeLogin;
    }

    if (!req.query.id || !req.query.credentials || !forceConfig) {
      return res.send('{"error": "Missing force credentials"}');
    }

    var credentials = {
      password: forceConfig.credentials.password,
      clientid: forceConfig.credentials.clientid,
      clientsecret: forceConfig.credentials.clientsecret,
      accessToken: forceConfig.credentials.accessToken,
      refreshToken: forceConfig.credentials.refreshToken,
      instanceUrl: forceConfig.credentials.instanceUrl
    };
    RED.nodes.addCredentials(req.query.credentials, credentials);

    forceConfig.login(function (conn) {
      conn.chatter.resource("/users/me/groups").retrieve(
        function (err, result) {
          if (err) {
            return res.send('{"error": "error:' + err.toString() + '"}');
          }
          res.send(result);
        });
    }, {});
  });

  RED.httpAdmin.get("/force-chatter/get-mentions", function (req, res) {
    var forceCredentials = RED.nodes.getCredentials(req.query.credentials);
    var forceNode = RED.nodes.getNode(req.query.id);
    var configNode = RED.nodes.getNode(req.query.credentials);
    var forceConfig = null;
    var splitUser = res.socket.parser.incoming._parsedUrl.path.split(
      "&userPage="
    );
    var userPage = splitUser[1];
    var splitGroup = res.socket.parser.incoming._parsedUrl.path.split(
      "&groupPage="
    );
    var groupPage = splitGroup[1];
    if (forceNode && forceNode.forceConfig) {
      forceConfig = forceNode.forceConfig;
    } else if (configNode) {
      forceConfig = configNode;
    } else {
      forceConfig = req.query;
      if (forceCredentials) forceConfig.credentials = forceCredentials;
      forceConfig.login = ForceNodeLogin;
    }

    if (!req.query.id || !req.query.credentials || !forceConfig) {
      return res.send('{"error": "Missing force credentials"}');
    }

    var credentials = {
      password: forceConfig.credentials.password,
      clientid: forceConfig.credentials.clientid,
      clientsecret: forceConfig.credentials.clientsecret,
      accessToken: forceConfig.credentials.accessToken,
      refreshToken: forceConfig.credentials.refreshToken,
      instanceUrl: forceConfig.credentials.instanceUrl
    };
    RED.nodes.addCredentials(req.query.credentials, credentials);

    forceConfig.login(function (conn, err, n) {
      var resData = { success: true };
      conn.chatter.resource("/users?page=" + userPage + "&pageSize=50").retrieve(
        function (err, result) {
          if (err) {
            return res.send('{"error": "error:' + err.toString() + '"}');
          }
          resData.users = result;


          conn.chatter.resource("/groups?page=" + groupPage + "&pageSize=50").retrieve(
            function (err, result) {
              if (err) {
                return res.send('{"error": "error:' + err.toString() + '"}');
              }
              resData.groups = result;
              res.send(resData);
            });
        });
    }, {});
  });

  function ForceNodeLogin(callback, msg) {
    var accessToken = msg.accessToken || this.credentials.accessToken;
    var instanceUrl = msg.instanceUrl || this.credentials.instanceUrl;
    if (this.logintype == "oauth") {
      var error;
      if (!this.credentials.accessToken || !this.credentials.instanceUrl) {
        error = JSON.parse('["' + "No Authenticate specified" + '"]');
      }
      var conn = new jsforce.Connection({
        oauth2: {
          clientId: this.credentials.clientid,
          clientSecret: this.credentials.clientsecret,
          redirectUri: null
        }
      });
      conn.initialize({
        accessToken: accessToken,
        refreshToken: this.credentials.refreshToken,
        instanceUrl: instanceUrl
      });
      callback(conn, error);

    } else if (this.logintype == "Username-Password") {
      var conn = new jsforce.Connection({
        loginUrl: this.loginurl
      });
      var error;

      conn.login(this.username, this.password, function (err, userInfo) {
        if (err) {
          error = err;
        }
        callback(conn, error);
      });
    } else if (this.logintype == "Signed-Request") {
      var conn = new jsforce.Connection({
        accessToken: accessToken,
        instanceUrl: instanceUrl
      });
      callback(conn, error);
    }
  }
};
