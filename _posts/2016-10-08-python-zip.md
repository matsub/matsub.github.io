---
layout: post
title: Pythonのzip関数の挙動
category: python
styles: syntax
---

はてなブログ時代にPythonのzipの挙動についてちょろっと書いていたんですが、
やたら長ったるかったのでそれの再編的な。


# 要点
`zip(*iterables)`は、[ドキュメント](http://docs.python.jp/3/library/functions.html#zip)
の等価コードにあるように、先に渡したイテラブルから処理していき、
いずれかのイテラブルが`StopIteration`を吐くまで続けます。

`StopIteration`を吐かせるイテラブルの位置に気をつけましょう。


# 渡す順番で挙動が変わる例
まず`[0..8]`のイテレータを作り、`range(7)`を先に渡してみます。

```python
>>> a = iter(range(9))
>>> for i, j in zip(range(7), a):
...   print(i, j)
...
0 0
1 1
2 2
3 3
4 4
5 5
6 6
```

イテレータ`a`の残りの中身は以下のようになっています。

```python
>>> list(a)
[7, 8]
```

次に、先に`a`を渡してzipで回してみます。

```python
>>> a = iter(range(9))
>>> for i, j in zip(a, range(7)):
...   print(i, j)
...
0 0
1 1
2 2
3 3
4 4
5 5
6 6
```

すると、`a`の中身は以下になっています。

```python
>>> list(a)
[8]
```

これは、zip関数内部で先にaの`next`を取って値`7`を得てから、
次に`range(7)`のイテレーションを進めたら`StopIteration`を吐いたためzip関数のイテレーションが終了し、
値`7`は取り出されはするものの返されず、破棄されることに原因があります。


どのイテラブルに`StopIteration`を吐かせるかを考えてうまくzipを使ってあげたら
結構コードがイケてる感じになると思います。

あと最近は転置行列作る時に`zip(*matrix)`してる。


## おまけ
ミュータブルとイテラブルは日本語にしづらくてちょっとアスペっぽくなるんですけどなんか解決策ありませんかね。
