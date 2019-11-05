node-red-contrib-force
========================

[**Japanese**](./README_ja.md)

A collection of <a href="http://nodered.org" target="_new">Node-RED</a> nodes for <a href="http://www.salesforce.com/" target="_new">Salesforce/force.com</a>.

[![NPM](https://nodei.co/npm/node-red-contrib-force.png?downloads=true)](https://nodei.co/npm/node-red-contrib-force/)

Pre-requisites
-------

The node-red-contrib-force requires <a href="http://nodered.org" target="_new">Node-RED</a> to be installed.


Install
-------

Run the following command in the root directory of your Node-RED install

    npm install node-red-contrib-force

Restart your Node-RED instance, the force node appears in the palette and ready for use.


Overview
-------

node-red-contrib-force contains the following modules.

#### force node

In the force node, do the following for your Salesforce organization.

- **Query** - Search for data. SOQL query is set in `msg.payload` using function node etc.

- **Create** - Create new data.

- **Update** - Update data.

- **Create/Update** - Create new data or update.

- **Delete** - Delete data.

**Tip**： Data to be created, updated, or deleted is set in `msg.payload` using function node etc. Each supported data format is as follows.
- Create or Update： JSON object or array of JSON objects with Object field name (API Name) and value as key / value.
      {Name: "test", field__c: 12345}
- Delete： Array of Object Ids
      ["001000000001abcDEF", "001000000002ghiJKL"]

#### force bulk node

In the force bulk node, do the following bulk data processing for your Salesforce organization.

- **Query** - Search for data and create CSV file. SOQL query is set in `msg.payload` using function node etc.

- **Create(Record)** - Perform batch creation of data. For the data to be created, the JSON object with object field name (API Name) and value as key / value is set in `msg.payload` using function node etc.
      [{Name: "test", field__c: 12345}, {Name: "testtest", field__c: 6789}]

- **Create(CSV)** - Read CSV file and create data in batch.

- **Update** - Read CSV file and update data in batch.

- **Create/Update** - Read CSV file and create or update data in batch.

- **Delete** - Read CSV file and delete data in batch.

**Tip**： In the CSV file, describe the field name (API Name) of the object in the header line and the value in the subsequent lines. Delimiters other than commas are not supported.

#### force chatter node

In the force chatter node, do the following Chatter process for your Salesforce organization.

- **Get Feed** - Get the Chatter feed.

- **Get Group Feed** - Get a feed for a Chatter group. Chatter groups are specified in the force chatter node settings.

- **Serch Feed** - Search for Chatter feeds. The search keyword is specified in the force chatter node settings.

- **Post Feed** - Post a message to Chatter. The message to be posted is set in `msg.payload` using function node etc. You can also specify the post destination and @mention destination in the force chatter node settings.

#### force signed request node

In the force signed request node analyzes signed requests for Salesforce organizations.

**Note**： The force node, force bulk node, and force chatter node log in to the Salesforce organization in one of the following ways.

- **UserName/Password** - Login by a login username and password for Salesforce organization and authenticate.

- **Oauth2** - Login authentication using the consumer key and consumer secret of Salesforce connected app.

- **Signed Request** - Login authentication is performed using the login username of the Salesforce organization and the consumer secret of the connected app.

**Tip**： For more information on connected apps, see [Create a Connected App](https://help.salesforce.com/articleView?id=connected_app_create.htm) in the Salesforce Help.


Acknowledgements
----------------

The node-red-contrib-force uses the following open source software:

- [JSforce] (https://github.com/jsforce/jsforce): Salesforce API Library for JavaScript applications.
- [Requet] (https://github.com/request/request): Simplified HTTP request client.

License
-------

See [license] (https://github.com/joeartsea/node-red-contrib-force/blob/master/LICENSE) (Apache License Version 2.0).


Contributing
-------

Both submitting issues to [GitHub issues](https://github.com/joeartsea/node-red-contrib-force/issues) and Pull requests are welcome to contribute.


Developers
-------

If the developer wants to modify the source of node-red-contrib-force, run the following code to create a clone.

```
cd ~\.node-red\node_modules
git clone https://github.com/joeartsea/node-red-contrib-force.git
cd node-red-contrib-force
npm install
```

