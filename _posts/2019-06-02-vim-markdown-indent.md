---
layout: post
title: vimでHackMDっぽいlist-indent
category: vim
styles: syntax
---
HackMDでリストをインデントする際の振る舞いが直感的で好きです。
なのでvimでmarkdown書いてるときもやりたい。


```
- foo
- bar_ <- ここでTab押すと
```

```
- foo
    - bar_ <- こうなってほしい
```

でも実際は以下のようになります。普通にtabstop分の空白が入る感じ(noexpandtabならtabが入る)。

```
- foo
- bar    _ <- こうなっちゃう
```

# やる
`plasticboy/vim-markdown`を使っている場合、以下の方法で実現できます。

```vim
function! s:GetSynStack()
    return map(synstack(line('.'), col('.')), 'synIDattr(v:val, "name")')
endfunc

function! s:IndentLikeHackMD()
    " simply return a tab character if the cursor is not on list item line
    if index(s:GetSynStack(), 'mkdListItemLine') < 0
        return '^I' " here is ^V^I
    endif

    return '^T' " here is ^V^T
endfunc

inoremap <expr> <Tab> <SID>IndentLikeHackMD()
```

ちなみにuntabは`Ctrl+D`でできるので、以下のようにするとShift+Tabでuntabできるようになります。
私はこの設定はmarkdownに限らず使ってます。

```vim
inoremap <S-Tab> <C-D>
```
