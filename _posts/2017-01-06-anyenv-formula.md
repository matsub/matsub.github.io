---
layout: post
title: anyenvのbrew formula作りました。
category: macOS
syntax: true
---

作りました。

[https://github.com/matsub/homebrew-anyenv](https://github.com/matsub/homebrew-anyenv)


# 使い方

```sh
$ # formulaのダウンロード
$ brew tap matsub/anyenv
$ # anyenv, anyenv-git, anyenv-update のインストール
$ brew install anyenv
$ brew install anyenv-git
$ brew install anyenv-update
```


# anyenvとは
anyenvは、rbenv、pyenvをはじめとした環境管理ソフト、いわゆる ** env のマネージャです。
マネージャのマネージャ。
各 ** env のインストール、アップデートを簡単に管理することができます。

** envについては以下の記事などを読めばどんなものかイメージできるかと思います。

- [pyenvが必要かどうかフローチャート](http://qiita.com/shibukawa/items/0daab479a2fd2cb8a0e7)
- [rbenvとは？（rbenvを利用したRubyのインストール）](http://qiita.com/yunzeroin/items/33a51c805e60ed5eca0e)


# homebrew-anyenvについて
今回作ったリポジトリですが、以下を搭載しました。

- anyenv の formula
- anyenv の bash / zsh / fish 補完
- anyenv git の formula
- anyenv update の formula

## ** envのプラグイン
** envへのプラグイン（pyenv-virtualenv など）をサポートする機能はanyenv、
およびこちらの formula にはありません。
（anyenvの方でIssueが立っていまして、今後どうなって行くかわかりません。: [Externalize env/plugin list #46](https://github.com/riywo/anyenv/issues/46)）

プラグインを入れる際は、 たとえば pyenv-virtualenv では、

```sh
$ git clone https://github.com/yyuu/pyenv-virtualenv $(pyenv root)/plugins/pyenv-virtualenv
```

のように `**env root` コマンドを使うといいと思います。
