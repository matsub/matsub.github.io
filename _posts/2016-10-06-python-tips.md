---
layout: post
title: 最近Pythonでほーんってなったやつ
category: python
styles: syntax
---
ここ最近のPythonのTips的な。
ちなみに最近はWebRTCと機械学習にかまけてます。
でも機械学習はコード書いてないです。たくさん微分してます。

# ジェネレータで再帰しながらリスト展開
ジェネレータで再帰っぽいことをしながら、リスト展開っぽく`yield`したい。

```python
>>> def f(n):
...   for i in range(n):
...     if i==0:
...       yield n
...     else:
...       yield list(f(i))
...
>>> list(f(3))
[3, [1], [2, [1]]]
```

ちょっとキモいですが、イメージはこんな感じ。
あと視覚化するためにジェネレータは`list`で展開しています。
そして、本来欲しい答えは`[3, 1, 2, 1]`です。
ネストの構造が相当キモいので、
これを`flatten`的なものを作って展開するのはちょい面倒くさそうです。

そこで、`yield from`を使います。
`yield from`はPython 3.3で追加されたPEP380よりの仕様で、
ここでジェネレータを呼び出すことで、
呼び出し先のyieldを自分のものとしてyieldすることができます。
この呼び出すジェネレータをサブジェネレータとか言ったりします。
多分覚えなくていいです。

コルーチン的な使い方も多分まだできると思いますが、
そっちは今後は`async`文に統一されていくんじゃないかなと思っています。

```python
>>> def f(n):
...   for i in range(n):
...     if i==0:
...       yield n
...     else:
...       yield from f(i)
...
>>> list(f(3))
[3, 1, 2, 1]
```

2系だと文法エラーです。`__future__`の中とかにあんのかな。
もうめっきり2系書かなくなったのでわかりませんけども。
その場合は`for item in f(i): yield item`が等価なコードです。
でも`yield from`の方がPythonicなコードだと思う。

パーサ的な仕事をする時に役立ちますね。
私は符号化木作る時にこれやりたくなってゴニョゴニョしました。


# バイナリを指定チャンクごと読み出す
バイナリを適当なチャンクサイズで読み出しながら、EOFをキャッチして終了したい。

```python
from functools import partial

chunk_size = 1024

with open(fname, 'rb') as f:
    for chunk in iter(partial(f.read, chunk_size), b'')
        # Do something
```

2系だとバイナリリテラルである必要がないため、
stack overflowなんかだとsentinelが文字列リテラルになってたりしました。
いややはり3系の方がPythonicでいいですね。

いやまあ厳密にはEOFじゃなくて空文字をsentinelにしてるっていうやつなんですけど、
バイナリの途中に空文字入らないよね。ね？
だからちゃんと仕事してくれると思います。

`patrial`やら`total_ordering`やら`functools`は便利な子が多いですね。
