---
layout: post
title: GitHub Actions で遊ぶ
category: github
styles: syntax
---
この記事は [PMOB Advent Calendar](https://adventar.org/calendars/3478) 8日目の記事です。

# やること
今朝起きたら [GitHub Actions limited public Beta](https://github.com/features/actions)
に割り当てられたので遊んでみます。やることは以下です。

公式チュートリアルより、

- 自作Actionを使ったHello, World
- 公式Actionを使った自動テスト

雰囲気で、

- PR出たら自動でreviewer割り当て


# GitHub Actionsとは？
GitHub Actionsは、GitHub上にあるリポジトリに関するワークフローを自動化する仕組みです。
例えば、Issueが上がっときに特定の誰かをAssignして対応する。
PRが上がったらCIでテストして、パスしたら誰かがreviewerとして割り当てられる。
masterブランチにコミットがあったらデプロイスクリプトを実行する。
こういった仕組みをリポジトリに宣言的に設定し、
自動的に実行されるという仕組みがGitHub Actionsです。

[Closed Beta](https://github.com/features/actions)を経て
10/15, 16 に行われた[GitHub Universe](https://githubuniverse.com/)で発表された機能の1つで、
現在[limited public Beta](https://github.com/features/actions)として公開されています。
beta sign upをしたユーザーに順次機能を解放していて、
11月末からtwitter上でもパラパラと当選報告が見られます。

私は発表された日の夜にsign upしたのですが、
今朝起きたら当選していてクリスマスの朝くらいテンションが上がりました。
この勢いでやっていくぞ


# 準備とか
まず最初に、[limited public betaではpublic repositoryにActionsを設定することができません](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#workflow-configuration-options)。
なのでこの記事ではprivate repositoryを作成して利用しますが、
今回遊んだrepositoryはレプリカを作成して公開したいと思います。

ではprivate repoを作ります。

<figure>
<img src="/assets/images/2018-12-08-gh-actions/repo_created.png">
</figure>

もう `Actions` のタブが見えますね。
このタブをクリックすると、GUIからワークフローを作成することができます。

まだ残っている準備がひとつだけあります。GitHub ActionsはGUIからも触れますが、
`.github/*.workflow` の形で作られるファイルからも設定ができます。
なのでエディタの準備が必要ですね。vimから触るときは、syntaxにこれ使います。
手前味噌だぜ。

[https://github.com/matsub/github-actions.vim ](https://github.com/matsub/github-actions.vim)

Actionsが発表された日の夜に、ホテルでドキュメンテーションの更新を確認したその場で書き始めたものです。
おそらく宇宙で最初のGitHub Actions用vim-syntaxだと思います。


# Hello, World
[Creating a new workflow](https://developer.github.com/actions/creating-workflows/creating-a-new-workflow/)
に従って、まずはHello, Worldを作ってみます。

まずDockerfileを作成します。
ActionsがやることはDockerコンテナの実行なので、
ここでやることはHello, Worldするコンテナイメージ用のDockerfileを作ることになります。

<script src="https://gist.github.com/matsub/d9cb6bb28bdb9f45652a7681141a0a2f.js"></script>

ほぼコピペですが、主にActions用変数をいじってみました（[Documentation](https://developer.github.com/actions/creating-github-actions/creating-a-docker-container/#label)）。
iconは[Feather](https://feathericons.com/)のものを利用できるらしいです。Octiconじゃないんかい。
あと `homepage` と `com.github.actions.icon` を空にしています。

`entrypoint.sh` を置いて実行権限を与え、pushします。
構造はこんな感じ

```
._. try-github-actions ❯❯❯ tree
.
└── action-hello-world
    ├── Dockerfile
    └── entrypoint.sh
```

## GUIからworkflowを作る。
早速workflowを作ります。せっかくなのでGUIから。

ｳｵｰ

<figure>
<img src="/assets/images/2018-12-08-gh-actions/created_gui.png">
</figure>

こうなりました。これはVisual Editorの画面で、
"Edit new File" のタブに行くとエディタ画面に移ります。
ではGUIからworkflowを作ってみたいと思います。

<figure>
<img src="/assets/images/2018-12-08-gh-actions/visual_editor.gif">
</figure>

このあと、この画面の右上にある "Commit" 的なボタンを押すと、
GitHubのGUIからファイルを編集した時のようにmasterに直接コミットするかfeature-branchを切るかを選択するpopupが出ます。
今回はそのままmasterにコミットしました。
するとworkflowが走ったっぽく、Actionsタブがこんな画面になりました。

<figure>
<img src="/assets/images/2018-12-08-gh-actions/workflow_ran.png">
</figure>

右側にworkflowの実行時間などがあります。Logも見られるようです。

<figure>
<img src="/assets/images/2018-12-08-gh-actions/workflow_log.png">
</figure>

サマリの下にdetailsがあります。
`COMPLETED <com.github.actions.name>` のような形でログが出るようですね。

<figure>
<img src="/assets/images/2018-12-08-gh-actions/workflow_log_detail.png">
</figure>


# 自動テストとcheck suite設定
自動テストもやってみましょう。
Hello, world!と並列するActionで、lintを通った後にtestするというアレをします。

ブランチを切ってゴミスクリプトを作り、actionsを追記します。
ディレクトリ構造はこんな感じ

```
._. try-github-actions ❯❯❯ tree -a -I ".git|node_modules"
.
├── .eslintrc.js
├── .github
│   └── main.workflow
├── action-hello-world
│   ├── Dockerfile
│   └── entrypoint.sh
├── package.json
├── src
│   ├── feature.js
│   └── feature.test.js
└── yarn.lock
```

workflowの中身は以下のような感じになりました。
actionイメージは公式のものを利用しています。
公式イメージはこのページにあります。

[GitHub Actions](https://github.com/actions)

```
workflow "New workflow" {
  on = "push"
  resolves = ["Hello World", "npm test"]
}

action "Hello World" {
  uses = "./action-hello-world"
  args = "\"Hello, world! I'm $MY_NAME\""
  env = {
    MY_NAME = "matsub"
  }
}


action "npm test" {
  needs = "npm lint"
  uses = "actions/npm@master"
  args = "run test"
}

action "npm lint" {
  needs = "npm install"
  uses = "actions/npm@master"
  args = "run lint"
}

action "npm install" {
  uses = "actions/npm@master"
  args = "install"
}
```

pushするとGitHubのGUIのActionsタブはこんな感じになりました。
一回コケてるのは気にしない。

<figure>
<img src="/assets/images/2018-12-08-gh-actions/workflow_test.png">
</figure>

左側の部分はcommit logだったんですね。
見切れてますがlintの下にtestがあってpassしているという形です。

そしてみんな大好きbranch protectionの画面に移ると、
自動的にactionsが追加されているのがわかります。

<figure>
<img src="/assets/images/2018-12-08-gh-actions/merge_protection.png">
</figure>

workflowごとじゃなくてactionごとなんですね。
細かい設定がmerge strategyに便利そうです。

merge protectionを設定し、
PRを作ってマージしたらActionsを使った自動テストは完了です。


# Assigning PR reviewer automatically
さて、チュートリアル的な事はやり切った気がするので、普通に便利なやつを作ります。
私の会社のチームに、PRが作成されると自動的にreviewerをアサインし、
Slackに通知するという仕組みがあります。
PRが発行されると発火されるwebhookを使っています。
GitHub Actionsでこの仕組みの "自動アサイン" の部分を作ろうと思います。

使うイベントは以下のリストより、 `pull_request` です。

[Events supported in workflow files](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#events-supported-in-workflow-files)


## workflow作り
これから作ろうとしているものは、明らかに最初のテストのワークフローとは "別のワークフロー" です。
なのでまずは別のworkflowを作ろうと思います。

話すと長くなるので省略しますが、現時点で複数の `.workflow` ファイルを使う事はできませんでした。
なので `main.workflow` に追記する形になります。

追記部分はこんな感じ。

```
workflow "Assign Reviewer" {
  on = "pull_request"
  resolves = "Assign"
}

action "Assign" {
  uses = "./action-assign-reviewer"
  env = {
    MAX_REVIEWER = "1"
  }
  secrets = ["GITHUB_TOKEN"]
}
```

今までと違うところは `GITHUB_TOKEN` を利用するためにworkflow側でsecretを追加しることと、
新しいイメージを作っています。

<script src="https://gist.github.com/matsub/276b6012dc0cacd5aaa9ada3c0baa4e3.js"></script>

`main.py` の中身を実装するぞー


## 自動アサインの実装
とりあえずmasterに直commitでworkflowの設定をします。
実装したい動作は、

1. PRのアクション時に
2. レビュワーが一定数以下だったら
3. Collaboratorの中からランダムに1人assignする

こんな感じです。実装内容は以下です。

レビュワーの数については `GITHUB_EVENT_PATH` から取得し、
レビュワー数が少なかったらassignします。
GitHubのアクセストークンはインスタンスに与えられる `GITHUB_TOKEN` をそのまま使って、
Collaboratorを調べてassignまでします。
assignしなかった場合、Exit codeはstatusが `neutral` になるように 78 を使います。
詳細については以下のページ。

[Accessing the runtime environment](https://developer.github.com/actions/creating-github-actions/accessing-the-runtime-environment/)

Pythonにしたのは、jsonを扱うのが素のshellscriptだと辛そうだったためです。
Pythonのコードはこちら。

[action-assign-reviewer/main.py](https://github.com/matsub/try-github-actions-replica/blob/master/action-assign-reviewer/main.py)


## 動くぞ

<figure>
<img src="/assets/images/2018-12-08-gh-actions/auto-assign.png">
</figure>

数多の屍を超えて動きました。やったね


# 感想
とりあえず workflow ファイルを分割したいです。
1 ファイル 1 workflow で管理したい。

あとは、このActionでFailしたらこのActionに行く、みたいな設定がしたくなりました。
Workflowという概念なら、「ここでコケた場合こうする」みたいな部分も考えたいなーと思いました。
一応 `check_run[conclusion]` など使えばどうにかなるかもしれませんが。

あと手動トリガー。少なくともデバッグ用に欲しいです。

それとランニングログは終了するまで読めないのですが、実行中も見たいです。

触ると色々出てきますねー


# 今後やりたいこと
`page_build` のtriggerがあるので、public repositoryでもActionsが使えるようになったら、
gh-pagesの更新時にtwitterに通知するやつをActionsで作っときたいですね。
あとは運用系で細かいのをActionsに持ってくるのかなーと思ってます。料金次第ですけどね。

あと残っている遊びですが、
最初の方に書いたようにActionsがやっていることはDockerコンテナの実行なので、
publicなコンテナレジストリにあるイメージをActionに利用することができます。

[Using a Dockerfile image in an action](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#using-a-dockerfile-image-in-an-action)

だからといって、私は特に面白いことも思いつかないんですけどね。
アイデア系苦手なんじゃよ。

あとはブランチフィルタリング。masterブランチならデプロイ、みたいなアレです。
今回はデプロイがなかったので使いませんでしたが。

[https://github.com/actions/bin/tree/master/filter ](https://github.com/actions/bin/tree/master/filter)

最後に、今回作ったrepoの公開用になります。

[https://github.com/matsub/try-github-actions-replica ](https://github.com/matsub/try-github-actions-replica)

おしまい
