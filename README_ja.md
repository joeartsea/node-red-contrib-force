node-red-contrib-force
========================
このモジュールは、<a href="http://www.salesforce.com/" target="_new">Salesforce/force.com</a> の<a href="http://nodered.org" target="_new">Node-RED</a> ノードコレクションです。

[![NPM](https://nodei.co/npm/node-red-contrib-force.png?downloads=true)](https://nodei.co/npm/node-red-contrib-force/)

前提条件
-------

node-red-contrib-forceは、<a href="http://nodered.org" target="_new">Node-RED</a>のインストールが必要です。


インストール
-------

Node-REDをインストールしたルートディレクトリで以下のコマンドを実行します。

    npm install node-red-contrib-force

Node-REDインスタンスを再起動すると、パレットにforceノードが表示されて使用可能になります。

概要
-------

node-red-contrib-forceは、次のモジュールを含んでいます。

#### force ノード

forceノードでは、Salesforce組織に対して次の処理を実行します。

- **検索** - データの検索を行います。SOQLクエリは、functionノードなどを用いて`msg.payload`にて設定します。

- **作成** - データを新規作成します。

- **更新** - データの更新を行います。

- **作成/更新** - データの新規作成/更新を行います。

- **削除** - データの削除を行います。

**Tip**： 作成または更新、削除するデータは、functionノードなどを用いて`msg.payload`に設定します。それぞれサポートしているデータ形式は次のとおりです。
- 作成または更新： オブジェクトの項目名(API参照名)と値をkey/valueにしたJSONオブジェクト、またはJSONオブジェクトの配列
      {Name: "test", field__c: 12345}
- 削除： オブジェクトIdの配列
      ["001000000001abcDEF", "001000000002ghiJKL"]

#### force bulk ノード

force bulkノードでは、Salesforce組織に対して次の一括データ処理を実行します。

- **検索** - データの検索を行いCSVファイルを作成します。SOQLクエリは、functionノードなどを用いて`msg.payload`にて設定します。

- **作成(レコード単位)** - データの一括作成を行います。作成するデータは、オブジェクトの項目名(API参照名)と値をkey/valueにしたJSONオブジェクトをfunctionノードなどを用いて`msg.payload`に設定します。
      [{Name: "test", field__c: 12345}, {Name: "testtest", field__c: 6789}]

- **作成(CSV一括)** - CSVファイルを読み込み、データの一括作成を行います。

- **更新** - CSVファイルを読み込み、データの一括更新を行います。

- **作成/更新** - CSVファイルを読み込み、データを一括で新規作成/更新します。

- **削除** - CSVファイルを読み込み、データの一括削除を行います。

**Tip**： CSVファイルは、ヘッダー行にオブジェクトの項目名(API参照名)を、それ以降の行に値を記述します。カンマ以外の区切り文字はサポートしていません。

#### force chatter ノード

force chatterノードでは、Salesforce組織に対して次のChatter処理を実行します。

- **フィード取得** - Chatterフィードの取得を行います。

- **グループフィード取得** - Chatterグループのフィードを取得します。Chatterグループは、force chatterノードの設定で指定します。

- **フィード検索** - Chatterフィードの検索を行います。検索するキーワードは、force chatterノードの設定で指定します。

- **フィード投稿** - Chatterにメッセージを投稿します。投稿するメッセージは、functionノードなどを用いて`msg.payload`にて設定します。force chatterノードの設定で投稿先や@メンション先を指定することもできます。

#### force signed request ノード

force signed requestノードでは、Salesforce組織に対する署名付きリクエストの分析をします。

**Note**： forceノード、force bulkノード、及びforce chatterノードは、次のいずれかの方法でSalesforce組織にログインします。

- **ユーザ名/パスワード** - Salesforce組織のログインユーザ名とパスワードでログイン認証します。

- **Oauth2** - Salesforceの接続アプリケーションのコンシューマ鍵とコンシューマの秘密を使用してログイン認証をします。

- **署名付きリクエスト** - Salesforce組織のログインユーザ名と接続アプリケーションのコンシューマの秘密を使用してログイン認証をします。

**Tip**： 接続アプリケーションについての詳細は、Salesforceヘルプの[接続アプリケーションの作成](https://help.salesforce.com/articleView?id=connected_app_create.htm&type=5)を参照してください。

謝辞
-------

node-red-contrib-forceは、次のオープンソースソフトウェアを使用しています。

- [JSforce](https://github.com/jsforce/jsforce): JavaScriptアプリケーション用のSalesforce APIライブラリ
- [Requet](https://github.com/request/request): 簡略化されたHTTPリクエストクライアント


ライセンス
-------

こちらを参照してください。[license](https://github.com/joeartsea/node-red-contrib-force/blob/master/LICENSE) (Apache License Version 2.0).


貢献
-------

[GitHub issues](https://github.com/joeartsea/node-red-contrib-force/issues)への問題提起、Pull requestsのどちらもあなたの貢献を歓迎します。


開発者
-------

開発者がnode-red-contrib-forceのソースを改変する場合、以下のコードを実行してクローンを作成します。

```
cd ~\.node-red\node_modules
git clone https://github.com/joeartsea/node-red-contrib-force.git
cd node-red-contrib-force
npm install
```
