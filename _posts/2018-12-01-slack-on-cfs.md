---
layout: post
title: CFsでSlash Commands
category: gcp
styles: syntax
---
この記事は [PMOB Advent Calendar](https://adventar.org/calendars/3478) 1日目の記事です。


# やること
SlackのslashcommandsをGoogle Cloud Functionsで実装します。

作りたいのはSlack版ソーシャルブックマークみたいなやつ。こんなイメージ

```
/bookmark https://cloud.google.com/functions/docs/quickstart
-> 覚えたよ

/bookmark-random
-> これ読め https://cloud.google.com/functions/docs/quickstart
```


# Slack側にAppを作る
まずAppを作ります。 モチベになるしAPIキー先に発行すると楽なので。

[https://api.slack.com/apps ](https://api.slack.com/apps)

こっから新しく作ります。つくった。

<img src="/assets/images/2018-12-01-slack-on-cfs/app_created.png" width="600px">


# Cloud Functions作る
Cloud Functions初めて触るのでQuick Start読んでみます。

[https://cloud.google.com/functions/docs/quickstart ](https://cloud.google.com/functions/docs/quickstart)

ほーんnode。express.jsっぽいですね。
node6とかいう文字が見えましたが、とりあえず見なかったことにしてnode8でhello worldしてみます。

[試した時のrevision](https://github.com/matsub/slack-bookmark/tree/4846e6d2075dadeb5b93979fcdc30b7c1bbce1a8)

```
❯❯❯ gcloud functions deploy helloGET --runtime nodejs8 --trigger-http
Created .gcloudignore file. See `gcloud topic gcloudignore` for details.
Deploying function (may takeDeploying function (may take a while - up to 2 minutes)...done.
```

1分くらいでデプロイできました。
発行されたエンドポイント叩いて確かめてみます。

```
❯❯❯ curl https://<region-and-project>.cloudfunctions.net/helloGET
Hello World!
```

すげえ、マジでこれだけでごくのか。spin-up timeもクソ短いって感じがします。

すぐ実装に着手できそうなので、今作ったfunctionは消しておきます。

```
❯❯❯ gcloud functions list
NAME      STATUS  TRIGGER       REGION
helloGET  ACTIVE  HTTP Trigger  <region-deployed-to>

❯❯❯ gcloud functions delete helloGET
Deleted.
```

gcloudコマンド、直感的に操作できるので割と好きです。


# Slash Commands っぽいレスポンスにする
ではこれをslash commands形式のレスポンスにします。

[この時点でのrevision](https://github.com/matsub/slack-bookmark/tree/e39803b3cff6c40aa9d3564cf54d490b7db023dc)

デプロイしましょう。
ちなみにデプロイするリージョンはconfigの[functions/region]で設定します。
オプション `--region=` で実行時の指定もできます。
どこにも値を明示しなければ、 `us-central1` にデプロイされます。
（参考: [gcloud functions deploy](https://cloud.google.com/sdk/gcloud/reference/functions/deploy)）

```
❯❯❯ gcloud functions deploy slackBookmark --runtime nodejs8 --trigger-http
Deploying function (may take a while - up to 2 minutes)...done.

❯❯❯ curl https://<region-and-project>.cloudfunctions.net/slackBookmark
{"response_type":"in_channel","text":"Hello, Slack!"}
```

いけそう。もうslash commandsの設定しちゃいましょう。


# Slack Appの設定
Slack Appの設定画面から、Slash Commandsの設定をします。

Request URLはCFsからもらったURLを使うんじゃよ。

<img src="/assets/images/2018-12-01-slack-on-cfs/configure_slashcommands.png" width="640px">

この時点でコマンドを２つ作ることはわかっていたので、先に設定しています。

ではslash commands叩いてみましょう。

<img src="/assets/images/2018-12-01-slack-on-cfs/got_raw_text.png" width="480px">

お、header忘れでjsonが無視されたっぽいですね。
というかテキストそのまま吐いてくれましたっけ？Slackの仕様が変わった気がする。

テキストを吐いてくれているのでこれで良い気もしますが、 `in_channel` で返したいので明示しておきたい気持ちがあります。
実装時には `Content-Type` つけましょう。


# 実装するぞ
で、私はデータ書き込み/読み出しするやつを作りたい。
データの置き場所は多分Datastoreが楽なんでしょう。
`@google-cloud/datastore` 使ってさっと書きます。

[この時点でのrevision](https://github.com/matsub/slack-bookmark/tree/ab926f847d1a76b85f230e6120cd15bef07cd627)

これをデプロイした結果こうなった。

<img src="/assets/images/2018-12-01-slack-on-cfs/completed.png" width="600px">

完成。記事書きながらで1時間くらいでできました。CFs楽ちんぞ

# FAQ
Q. ランダムじゃないじゃん

A. マジ？気づかなかった


# 最後に
公式にslashcommandsのサンプルあるやんけ

[https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/functions/slack ](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/functions/slack)

おわり
