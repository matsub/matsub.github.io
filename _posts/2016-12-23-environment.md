---
layout: post
title: 最近のdotfiles
category: shellscript
syntax: true
---

この記事は、
[PMOB Advent Calendar 2016](http://www.adventar.org/calendars/1832)
の 23日目 の記事です。

- 前の記事 [【PMOB】記事ないです【アドベントカレンダー】](http://sorenuts.hatenablog.com/entry/2016/12/22/142426)
- 次の記事 [まだないよ]()

年末って感じですね。大掃除の時期です。
整理整頓ゴミ掃除。
ということで設定ファイルを大掃除しようね。


# zshrc

分割しました。
`.zsh/`以下にそれぞれの設定を書き、
`.zshrc`でロードするというスタイルにしています。

```
~/
|_ .zshrc
|_ .zsh/
  |_ ALIAS
  |_ COMPLETION
  |_ ENVIRONMENTS
  |_ PATH
  |_ PLUG-SETTINGS
  |_ PLUGINS
  |_ zplug
```


## `.zshrc`に書くこと

`.zshrc`の中では、基本的に`source`しまくってます。
こんな感じ。

```zsh
export ZDOTDIR=$HOME/.zsh
export ZPLUG_HOME=$ZDOTDIR/zplug

source $ZDOTDIR/COMPLETION

source $ZDOTDIR/PLUGINS
source $ZDOTDIR/PLUG-SETTINGS

source $ZDOTDIR/PATH
source $ZDOTDIR/ALIAS
source $ZDOTDIR/ENVIRONMENTS
source $ZDOTDIR/npm_completion
source $ZDOTDIR/pip_completion
```

一部順番を気にする必要があります。
なるべく依存関係を作らないように切り出していくと編集しやすくなって強い。
あとVCSで追いやすくなるかも。自分しか使ってないんであんま関係ないですけどね。


## プラグイン

今まではパスの通ってるところに `git submodule add` してautoloadなりsourceしていました。
ですが今回 [zplug](https://github.com/zplug/zplug) を使ってみました。
めっちゃいいですね。
サポートコマンドも充実していて、ほとんどの zsh ツールに対応できると思います。
これを機に自作の zsh ツールは切り出して、zplug で管理するようにしました。

zplug 自体は dotfiles のサブモジュールにしてます。
zplug のアップデートがあるので、`ignore=dirty` するといいと思います。

プラグインの使用感は vim のプラグインと似たような印象でした。
zshrc に相当するセットアップソースを書くだけで完了です。

現在は以下のプラグインを使用しています。
そんなに入れてないね。

- [hchbaw/auto-fu.zsh](https://github.com/hchbaw/auto-fu.zsh)  
  言わずと知れた補完自動展開プラグイン。なんかmasterバグるのでpuブランチ使ってます。
- [zsh-users/zsh-completions](https://github.com/zsh-users/zsh-completions)  
  これも言わずと知れた補完強化。
- [yonchu/zsh-python-prompt](https://github.com/yonchu/zsh-python-prompt)  
  pyenvからpythonのバージョン取ってきてプロンプトに入れやすくするやつ


そういえばパッケージマネージャの auto-fu がクソ重いんで特定のコマンドだけ auto-fu 切りたいんですけどなんかいい方法ありますかね。


# vimrc

ちょっと迷ったけど分割しました。
`.vim/config`以下にそれぞれの設定を書き、
`.vimrc`でロードするというスタイルにしています。

Vimは以下のものを使ってます。
neovimいいよって言われてちょっとマヨってる。

```
VIM - Vi IMproved 8.0
MacOS X (unix) version
Compiled by Homebrew
```


vimrcは以下のような形です。

```
~/
|_ .vimrc
|_ .vim/
  |_ config/
    |_ appearance.vim
    |_ keybinding.vim
    |_ plugins.vim
    |_ system.vim
```

どこを見れば何が設定できるか、
見やすくていい感じ。


## `.vimrc`に書くこと

`.vim/config/` 以下を走らせます。

```vim
" .vim/config/
runtime! config/*.vim
```

vimrc がすごいしょぼくなった。
これを気に plugin 系の設定をだいたい一箇所に集めたのでスッキリしました。
ftplugin で設定してるものもまだありますけど。

あ、プラグインマネージャは [vim-plug](https://github.com/junegunn/vim-plug) 使ってます。


# homebrew

`brew doctor` したらこんなメッセージが

> Warning: Your Homebrew's prefix is not /usr/local.
> You can install Homebrew anywhere you want but some bottles (binary packages)
> can only be used with a /usr/local prefix and some formulae (packages)
> may not build correctly with a non-/usr/local prefix.

これのせいで `brew upgrade` がクソ重かったのか。
ということで修正します。

`/opt/homebrew`派からの乗り換えの時の注意点として、
`/etc/paths, /etc/shells` の更新、ログインシェルの確認をするといいと思います。
あと私は dotfiles の再インスコ。

```sh
$ # uninstall dotfiles
$ cd path/to/dotfiles
$ python deploy.py unlink
$ cd ..
$ rm -rf dotfiles
$ # uninstall homebrew
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/uninstall)"
$ sudo rm -rf /opt
$ exec -l /bin/sh
$ # re-install homebrew
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
$ # install dotfiles
$ curl -L https://dotfiles.matsub.tech | sh
```

バイナリがボコボコ落ちるようになってめっちゃ早くなりました。

あと pyenv を入れている時、 `brew doctor` が pyenv の config を拾って警告してくるので、
これが嫌な場合は以下のようにすると無視してくれます。
私はこれで alias 張ってます。

```zsh
env PATH=${PATH/${HOME}\/\.pyenv\/shims:/} brew doctor
```

あと doctor が怒るとしたら、 keg-only な formula を link --force してたときくらいですかね。


# リポジトリ大掃除

今までは適当にディレクトリ切ってリポジトリを置いて開発していました。

```
~/
|_ PMOB
  |_ some_project
|_ Develop
  |_ some_project
|_ Code
  |_ some_snippets_classified_by_lang
```

みたいな。

これを [ghq](https://github.com/motemen/ghq) で管理することにしたらめっちゃよかった。

## ghq

ghq はリポジトリを管理するためのソフトです。
リポジトリを `prefix/host/owner/repo_name/` の形で自動的に配置するソフトなんですが、
これに後述するちょちょいのちょいをちょいするとすごく良い（日本語）。
とりあえず、ghq の設定は `.gitconfig` で行います。

```config
...
[ghq]
  root = ~/Develop
```

`git config --global ghq.root=` で設定すると多分パスが展開されるので手動で書き込みました。

### ghq のコマンド

ghq のコマンドは結構少ないです。

| command | description                                     |
|---------|-------------------------------------------------|
| get     | Clone/sync with a remote repository             |
| help    | Show a list of commands or help for one command |
| import  | Bulk get repositories from stdin                |
| list    | List local repositories                         |
| look    | Look into a local repository                    |
| root    | Show repositories' root                         |

`ghq get` でガンガンリポジトリを追加していく感じです。

### すごいいいコマンド

[fzf](https://github.com/junegunn/fzf) を使って ghq の管理しているリポジトリに移動し、
ついでに tmux に入っている場合はセッション名を書き換えます。

```zsh
function dev() {
    moveto=$(ghq root)/$(ghq list | fzf)
    cd $moveto

    # rename session if in tmux
    if [[ ! -z ${TMUX} ]]
    then
        repo_name=${moveto##*/}
        tmux rename-session $repo_name
    fi
}
```

デモ

<script type="text/javascript" src="https://asciinema.org/a/96844.js" id="asciicast-96844" async></script>

すごいいい。


# 最後に

最近の私の dotfiles は多分こんな感じです。
みんなも大掃除しよう。

あとtpm(tmuxのマネージャ)入れたのに何も入れてません。
なんか面白いものあったら教えてください。
