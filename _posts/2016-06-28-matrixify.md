---
layout: post
title: flattenの逆
category: python
---
最近PIL(Pillowですけど)を使ったり
機械学習で分類器に特徴ベクトル渡したりでよくflattenを使うのですが、
こいつのデコードにflattenの逆が欲しいんですよね。
横幅と縦幅使ってインデクシングしながらオブジェクト回すのすごい見づらいので
ジェネレータ使って変換したさがヤバい。

```python
def matrixify(lst, width, height):
    def _iter(row):
        for x in range(width):
            yield row[x]

    for y in range(height):
        yield _iter(lst[y*width:(y+1)*width])
```

もとからイテラブルなものをそのまま返すのに内部でジェネレータに戻す必要はあるのか。
ということで簡易版。

```python
def matrixify(lst, width, height):
    for y in range(height):
        yield lst[y*width:(y+1)*width]
```

下の方が実用性ありそう。

### おまけのflatten

組み込みのflattenはないので適当にジェネレータ回すことになるのですが、
`itertools`の`chain`使うのが一番無駄ないです。

```python
from itertools import chain
flatten = lambda lst: chain.from_iterable(lst)
```

ちなみにジェネレータです。
