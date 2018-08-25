---
layout: post
title: An error occurred while verifying firmware.
category: macOS
syntax: true
---
この記事は、 macOS爆発炎上倒壊メモです。かなり雑に書きます。
あと多分[PMOB Advent Calendar 2017][advcal] の記事です。

# TL;DR
- High Sierraインストールしようとして
- `An error occurred while verifying firmware.` でインスコできないなら
- バックアップとってリカバリブート
- Disk Utilityでeraseして再インストールせい

## バックアップしないなら
- パーティション切ってそっちにHigh Sierraインスコせい
- 移行マネージャで、古いパーティションから移行できるよ
- 古いパーティションマウントすれば欲しいファイルだけコピーもできるよ
- 移行終わったらパーティション消すがいいよ

関係ないけど記事の最初に置くならDidn'tじゃなくてWon'tだよね。
ほんとどうでもいい話ですけど。


# 本題
まず何があったのかというと、macOSのスタートアップディスク消しちゃった。へへ。

あんまり細かく記憶していませんが、事の経緯を説明すると、
まずHigh Sierraへアップグレードをしようとしたら以下のようなエラーによってインストールがキャンセルされました。

> An error occurred while verifying firmware.

あまりにも投げっぱなしで意味不明なエラーです。どんなエラーなんだか書いてくれ。
何はともあれなんかディスクの検証に失敗してるっぽいのでその辺で原因を探ってみたところ、

- Disk Utility.app でCoreStorageをverify
    - -> 確かなんもなかった
- `diskutil cs verifyVolume <start_up_disk>`
    - -> "windows boot.ini required"って言われた

は？windows boot.ini？？とか思いましたけどそういえば昔bootcampでデュアルブートしてました。
で、記憶にないんですがwindowsを削除するときにbootcampを使っていなかったらしく、

[Remove "Windows" Entry from Mac Boot Loader][remains-efi]

これに類似する問題に引っかかってました。
違う点がありまして、私の環境ではGUIの起動ディスク選択画面にwindowsはもう存在しませんでした。
bootcampは使ったんだけどファイナライズが不正に終了しちゃったとかかなと思ってます。

ともあれ、stackexchangeの情報を元にdiskutilを叩いてEFIからwindowsのブートイメージを削除しました。
macOSのスタートアップイメージも一緒に飛んだけどな。


# その1: OSブートできないよね
上記の処理をしたあとにmacbookを再起動すると、
画面にクエスチョンマークが表示され、OSが起動しませんでした。
なんもしてないのにパソコンが壊れた〜。

Appleの[スタートアップ時に表示されるアイコンの説明][startup]を見てみると、
"Folder with a question mark" というのに該当することがわかりました。
スタートアップディスクが見つからなかった場合に表示されるそうです。
ウケる。

とりあえず再起動、cmd+Rを押してリカバリモードで起動です。
スタートアップディスクがないのでネットブートになります。

ネットブートが完了すると、起動したのはMavericksでした。
購入時に入っていたOSだったと思います。
で、今まで使用していたボリュームに対して再インストールをしようとすると、

> This volume cannot be installed because it already contains a newer version of
> the operating system.

的なエラーが出ました。うろ覚えですけど。
今までの環境が10.12.xだったので、10.9であるMavericksはインストールできないと。
なるほどね。

これを解決するには空のボリュームが必要です。
ボリュームのeraseが楽ですが、私は面倒臭がってバックアップをとっていなかったので、
初期化するとファイル損失しちゃいます。
ぶっちゃけコードはリポジトリ、データはDB、ドキュメントなりなんなりはクラウドストレージにあるし、
開発環境再現はdotfilesから一発なので、ローカルストレージが飛んでもあんまり痛くありませんが、
鍵情報とか飛ぶとめんどくさそうなので救済することにしました。

ちなみに[公式のガイド][reinstall]によると、
リカバリモードで起動するOSは現在入っている（またはそのMacに入れることができる）最新のOSらしいですが、
なぜかMavericksが入りました。


# その2: Mavericks -> High Sierra
パーティションを切ってそっちにMavericksの環境を入れ、
入れたMavericksからHigh Sierraにアップデートして古いパーティションにあるデータを統合する。
という計画でいきます。

リカバリモードの画面からDisk Utilityを起動し、新しいパーティションを追加します。
フォーマットはMac OSなんちゃら。
作成したボリュームを対象に、Reinstallerを起動します。

Mavericksが入るので、適当に設定し、administerでログイン、App Storeを起動します。
High Sierraのインストーラーがあるので、これをインストールします。

ここで問題が発生します。
High SierraをインストールするにはApple IDでログインする必要がありますが、
二段階認証を有効化している場合、
MavericksのApp Storeではパスコードの入力画面が表示されないので、ログインが不可能です。
多分Safariのバージョンが古いことが原因です。

二段階認証を無効化するには[こちらのガイドからどうぞ][2factor]。
ちなみにMavericksのSafariからは、同様にパスコード入力画面が表示されないのでログインできません。
他のデバイスからログインし、二段階認証を解除してください。

二段階認証が無効化された状態でApp Storeにログイン、
High Sierraをインストールすることができます。やっちゃいましょう。


# その3: 古いパーティションから移行
High Sierraをインストールしてごちゃごちゃセットアップします。
FileVaultは有効化しても多分大丈夫ですが、
私は有効化したところログインループが発生したので再びOSを再インストールしました。
なんだったんだあれ。
High Sierraのインストールが完了したら、古いパーティションからデータをとってきましょう。

## 方法1: 移行アシスタント
`/Applications/Utilities/Migration Assistant.app`を起動します。
移行アシスタントって名前かもしれません。
これを使えばポチポチやってるだけで、
移行するユーザーやディレクトリを選択してデータの移行ができます。

## 方法2: Finderなどから抜いてくる
古いパーティションをマウントすると（最初からマウントされていると思いますが）、
`/Volumes/`以下に古いボリュームが認識されるので、
ドラッグ&ドロップなどで必要なファイルを引っ張ってくることができます。
ユーザー情報とかは抜いてきません。


# その4: 古いパーティションを消す
`diskutil eraseVolume free n <old_partition>`
とかで古いパーティションのデバイス消しました。
Disk Utility.appでeraseしてもいいと思うよ。

で、バックアップとって新しいAPFS Containerのリサイズしたら作業完了です。


# この先やること
まだ残ってる作業とか、ちょっと分かってないところがまだあるのでそのメモ

- macOSのfsとかブート周りを調べる
    - CoreStorageってなんなの
    - or Linux入れちゃう
- FileVaultのログインループはなんだったのか
- Time Cupsle設定してバックアップとってAPFSコンテナ消してリサイズ

# 結論
- stackoverflowを盲信してはいけない
- みんなはちゃんとバックアップ取ろうな

[advcal]: https://adventar.org/calendars/2493
[startup]: https://support.apple.com/en-us/HT204156
[remains-efi]: https://apple.stackexchange.com/questions/122192/remove-windows-entry-from-mac-boot-loader
[reinstall]: https://support.apple.com/en-us/HT204904
[2factor]: https://support.apple.com/en-us/HT204915
