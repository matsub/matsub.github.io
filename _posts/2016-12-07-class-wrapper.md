---
layout: post
title: Pythonのデコレータが扱う値に副作用をもたせる
category: python
---
この記事は、
[PMOB Advent Calendar 2016](http://www.adventar.org/calendars/1832)
の 7日目 の記事かもしれない。

- 前の記事 [2016年にたべたラーメンとかつけ麺まとめ](http://menonomo.hateblo.jp/entry/2016/12/06/040834)
- 次の記事 [そうだ俺が怠惰の罪だ](http://zodi-g12.hatenablog.com/entry/2016/12/08/195451)

デコレータが扱う値に副作用をもたせるやつです。


# 内容
デコレータで関数のパラメータをいじることを考えます。

```python
def decorator(value):
    def wrapper(f):
        def _wrapper(*args, **kwargs):
            kwargs['key'] = value
            return f(*args, **kwargs)
        return _wrapper
    return wrapper
```

こんな感じで値をどうこうするデコレータを考えるとします。
この `value` がイミュータブルの場合、
状態によってこの関数の挙動を変えるには新しく関数をデコレータにかける必要があります。
ここで、設計上別の関数を与え続けることができない、
副作用で制御した方が無駄がないといったケースあると思います。
そこで、クラスメソッドにデコレータを作って云々する方法を紹介します。


# やる
デコレータが見る値をインスタンス変数にして、
そこを弄ったら中身が変わることを確認します。

```python
class WrapClass:
    def __init__(self):
        self.bias = 10

    def instance_wrapper(self, func):
        def wrapper(*args, **kwargs):
            kwargs['value'] += self.bias
            return func(*args, **kwargs)
        return wrapper


wrapper = WrapClass()

@wrapper.instance_wrapper
def func(value):
    return value*2

print(func(value=10))
# >>> 40

wrapper.bias = 100
print(func(value=10))
# >>> 220
```

ちゃんと変わってますねー。
方法はこれで良さそうです。


# なにごとかね
上のコードで、
デコレータが閉じていない（ `self.bias` のインスタンスへの参照が切られていない）
ことを確認しました。
もうちょっと詳しく見てみます。

```python
class WrapClass:
    def __init__(self):
        self.foo = None

    def instance_wrapper(self, func):
        def wrapper(*args, **kwargs):
            kwargs['id'] = id(self.foo)
            return func(*args, **kwargs)
        return wrapper


wrapper = WrapClass()

@wrapper.instance_wrapper
def f(id):
    return id
print(f())

wrapper.bias = 100
print(f())

@wrapper.instance_wrapper
def g(id):
    return id
print(g())
```

このコードを実行すると、
生成時、値の変更後、同インスタンスを用いた新しい関数定義のときに、
`self.foo` をそれぞれ同じ参照先に持っていることが確認できます。

ついでにデコレータにかけられた関数のスコープを見てみると、
以下のようになっています。

```python
print(f)
# >>> <function WrapClass.instance_wrapper.<locals>.wrapper at 0x10878f158>
```


まあそらそうだって話なんですけどね。
Pythonの評価戦略はドキュメントのどっかにありました。
記事だと下のがわかりやすかったです。

[https://jeffknupp.com/blog/2012/11/13/is-python-callbyvalue-or-callbyreference-neither/](https://jeffknupp.com/blog/2012/11/13/is-python-callbyvalue-or-callbyreference-neither/)

コメント欄もおもしろいよ。
日本語のいい記事みたいなのはパッと見つかりませんでした。
ごめんね。
最近オライリーから出た本にいいのがあったような気もします。
おしまい。
