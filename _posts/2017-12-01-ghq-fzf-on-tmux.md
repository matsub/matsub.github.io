---
layout: post
title: ghq+fzf on tmux
category: shellscript
styles: syntax
---
この記事は、 [PMOB Advent Calendar 2017][advcal] の記事です。

ghqで管理しているリポジトリに移動する際、
インクリメンタルにファジー検索して、
リポジトリに移動しながら、
tmuxのセッション名をリポジトリの名前に変更する。
そんなシェルスクリプト`dev`を作りました。ずいぶん前に。

<script type="text/javascript" src="https://asciinema.org/a/150572.js" id="asciicast-150572" async></script>

なんか [去年のアドベントカレンダー][env] にも同じこと書いてたけど、
これを作った経緯を説明します。

- tmux
- ghq
- fzf

の3つの要素があるので、それらを紹介して最後にさっきのdevコマンドのソース置きます。


# tmux
言わずと知れたターミナルマルチプレクサです。
仮装端末いっぱい作るやつです。ちょっと説明します。

tmuxを起動するとtmuxのプロセス(server)が立ち、
serverがセッションを立ち上げて、 セッションにウィンドウを作成します。
1つのウィンドウが1つのターミナルを持ちます。

tmuxプロセスは複数のセッションを管理します。
セッションは複数のウィンドウを持つことができます。
ちなみにこの記事を書いてる最中のtmuxがこんな感じになってます。

<img
    alt="tmuxのスクショ"
    src="/assets/images/2017-12-01-ghq-fzf-on-tmux/tmux.png"
    width="600px"
    >

ここではtmuxは 0-5 の6つのセッションを持っています。
また、現在`matsub-github-io`というセッションにアタッチしていて、
このセッションは3つのウィンドウを持っていることがわかります。

セッションには名前をつけることができます。
セッション名は自動的に数字で命名されますが、
名前をつけるとどのセッションで何をやっていたかわかりやすくて便利です。
セッション名は`tmux rename-session`コマンド、
あるいは`prefix+$`で設定することができます。


# ghq
人にプログラミングの相談を受けるとき、ソースコードが乱雑に置かれていて、
何がどこにあるか本人も理解していないということがたまにあります。
なんだこいつどうしたもんかと思っていましたが、
これからは [ghq] 使えって言えばとりあえず解決します。

[ghq] はGitのリポジトリを管理するためのソフトウェアです。
ghqの主な機能は`ghq get`です。
`ghq get <repository URL>`コマンドで`$GHQ_ROOT`ないし`git config --global
ghq.root=`で設定されたパス以下に`git clone`を実行します。

例えば、`ghq.root`が`~/.ghq`の場合、以下のようなファイル構成になります。

```
~/.ghq
|__ code.google.com/
|   |__ p/
|       |__ vim/
|__ github.com/
    |__ google/
    |   |__ go_github/
    |__ motemen/
    |   |__ ghq/
    |__ urfave/
        |__ cli/
```

リポジトリのパスが自動的に`(ghq root)/<domain name>/<user name>/<repo name>`
になります。

また、`ghq root`コマンドで`ghq.root`を取得でき、
`ghq list`でghqが管理しているリポジトリの一覧を取得できます。
上の例では以下のような結果が得られます。

```sh
$ ghq root
~/.ghq
$ ghq list
code.google.com/p/vim
github.com/google/go_github
github.com/motemen/ghq
github.com/urfave/cli
```

ghq単体だとちょっとディレクトリの整理が楽になる程度ですが、
下のfzfと合わせるとマッチョマンになります。


# fzf
fuzzy finder、[fzf] です。
stdinから受けたリストから、特定の行を曖昧にインクリメンタルサーチできます。

これと`ghq list`を組み合わせると、リポジトリの検索をすることができます。
`ghq list | fzf`で以下のような画面になると思います。

```sh
  code.google.com/p/vim
  github.com/google/go_github
  github.com/motemen/ghq
> github.com/urfave/cli
  4/4
> _
```

この状態で"google"と入力すると、
"google"という文字列を含むリポジトリに絞り込まれます。

```sh
  code.google.com/p/vim
> github.com/google/go_github
  2/4
> google_
```

曖昧検索ですので、"ggl"とかでも引っかかります。

```sh
  code.google.com/p/vim
> github.com/google/go_github
  2/4
> ggl_
```

リポジトリを特定したらリターンキーで確定します。
すると選択した行をstdoutします。
ここで得られる文字列は`github.com/google/go_github`となりますので、
`$(ghq root)`と合わせて、
`$(ghq root)/$(ghq list | fzf)`でリポジトリのフルパスを得られます。


# お土産
以上を踏まえて、最初のdevコマンドのソースです。

```zsh
#!/usr/bin/env zsh
function dev() {
    moveto=$(ghq root)/$(ghq list | fzf)
    cd $moveto

    # rename session if in tmux
    if [[ ! -z ${TMUX} ]]
    then
        repo_name=${moveto##*/}
        tmux rename-session ${repo_name//./-}
    fi
}
```

ちなみに [zshtools] というリポジトリに入ってるので、
zplug使ってる人は ghq, fzf をインストールした上で

```sh
zplug "matsub/zshtools", from: bitbucket
```

でインストールして使ってね。
ついでに日英&英日翻訳コマンド`dict`、
[wttr.in](http://wttr.in/) から天気取得するコマンド`weather`がついてくるぞ。

関係ないけど最近Bitbucket重くね？
おしまい

[origin]: http://blog.fakiyer.com/entry/2016/01/29/142620
[advcal]: https://adventar.org/calendars/2493
[env]: https://www.matsub.net/posts/2016/12/23/environment
[ghq]: https://github.com/motemen/ghq
[fzf]: https://github.com/junegunn/fzf
[zshtools]: https://bitbucket.org/matsub/zshtools
