---
slug: design-patterns-you-should-unlearn-in-python-part2
title: Design Patterns You Should Unlearn in Python-Part2
authors: [raceychan]
tags: [python, design patterns, oop]
toc_min_heading_level: 2
toc_max_heading_level: 5
---


![image-1.jpg](https://unsplash.com/photos/so5nsYDOdxw/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzUwNDQyOTM2fA&force=true&w=1920)

Ever since the *Gang of Four* released their legendary *Design Patterns* book in the 90s, "design patterns" have been a cornerstone of how developers talk about software architecture. Over time, though, the term itself has grown fuzzier. When someone mentions a pattern today, they might be referring to:

- The **intent** behind the pattern: the problem it's trying to solve.
- The **implementation**: the exact class structure or code to achieve it.

When we talk about “design patterns you should unlearn in Python,” we’re talking about the second kind: the implementation. These patterns still solve real problems. But in Python, the way you solve them often looks nothing like the solutions shown in C++ or Java.

That’s the key idea behind this series. The moral is simple:

> Bears learn to climb trees to reach food. But Eagles do not climb, they fly.

In Part 1, we took apart the Builder and Singleton patterns, showing how Python’s features (like default arguments or modules) make many “classic” implementations unnecessary or even counterproductive.

Now, let’s move on to two more patterns: **Flyweight** and **Prototype**. Both solve real problems. But as you'll see, Python gives us simpler, more natural ways to solve them.

<!-- truncate -->

---

## Flyweight Pattern: Sharing to Save Memory

In Part 1, we looked at Singleton, a classic example of overengineering in Python, where a simple module or closure often does the job better.

Flyweight is closely related. If Singleton is about having **only one instance per class**, Flyweight is about having **one instance per unique set of parameters**. Both patterns try to avoid excessive object creation, just in different ways.

But here’s the problem: developers often reach for Singleton when they really need Flyweight. Or worse, they don’t need either.

Here’s a quick litmus test:

- **No constructor parameters** (or they’re always the same)? You probably don’t need a class. Just use a module-level object.
- **Constructor parameters matter**? Then Singleton is likely the wrong choice, a Flyweight-style pattern might be more appropriate.

### Flyweight from the book

The Flyweight pattern was originally created to handle memory constraints in object-heavy applications. As the GoF book puts it:
	
> "Use sharing to support large numbers of fine-grained objects efficiently."
	
The classic example is a document editor that represents thousands of characters. Each character with its own font, size, and position is a tiny object, but when you have tens of thousands of them, the memory cost adds up fast. Creating one full object per character can easily exhaust memory, especially in older environments with tight constraints.

> The book has detailed illustration on this, we will append links to this at the bottom of th article.

Flyweight solves this by reusing shared parts of each character(like the glyph and font) and storing only the unique parts separately.

If you search online for how to implement the Flyweight pattern in Python, you’ll often run into examples like this:

```python
from typing import ClassVar
from dataclasses import dataclass


class User:
    _users: ClassVar[dict[tuple[str, int], "User"]] = {}

    def __new__(cls, name: str, age: int) -> "User":
        if not (u := cls._users.get((name, age))):
            cls._users[(name, age)] = u = super().__new__(cls)
        return u

    def __init__(self, name: str, age: int):
       self.name = name
       self.age = age
```


This approach that uses `__new__` in combination with a class variable to control the creation of instances, similar to what we had in the singleton pattern, is an example of over-engineering most of the time, and tends to open a rabbit hole of problems. 

The core issue is that **mutable class variables are shared across all instances, and across subclasses too**. This makes them very easy to mutate accidentally from multiple places in your codebase. Because the cache lives at the class level, it becomes difficult to control, track, or test.

The use of the `__new__` magic method makes things even worse. It bypasses the usual object creation flow, and can easily create surprising behavior, especially when subclassing. For example, would you expect this code to raise an error?

```python
u = User("user", 20)
assert type(u) is User
```

Imaging someone inherit your class:

```python
class Admin(User):
    ...


In [6]: Admin("user",20)
Out[6]: <__main__.Admin at 0x7c123e18b650>

In [7]: User("user",20)
Out[7]: <__main__.Admin at 0x7c123e18b650>
```

If you're working in a larger codebase or using third-party tools that instantiate a sbuclass of `User` without knowing about your custom `__new__`, these surprises turn into hard-to-debug runtime errors. Once you start rewriting object creation logic with __new__ and shared caches, you're on shaky ground. It’s fragile, implicit, and rarely worth it in Python.

### Better approach: A factory function with cache:

```python
from functools import lru_cache

@lru_cache
def create_user(name: str, age: int) -> User:
    return User(name, age)
```

This avoids all the pitfalls of `__new__` and class-level state. It’s simple, explicit, and safe.

Unlike the previous implementation, `lru_cache` guarantees that `create_user(...)` always returns a real `User` and not its subclasses. And because the cache is tied to the function, not the class, instances can't accidentally mutate or replace shared state. You can reason about it just like any other function: same inputs, same output, always predictable.

one small caveat is to avoid using it like this where you put the `lru_cache` decorated function side a class as a method. 

```python
class UserFactory:
    @lru_cache
    def create_user(self, name: str, age: int) -> User:
        return User(name, age)
```

In this case, every instance of `UserFactory` will have its own separate cache. That’s because `self` is included in the arguments being hashed. So calling `factory1.create_user("Alice", 30)` and `factory2.create_user("Alice", 30)` won’t hit the same cache, even if everything else is the same.

Also, when constructor params contain mutable objects, you might do a little DIY, just like what python `re.compile` did.

```python title="re.compile from python 3.11"
_cache = {}  # ordered!

_MAXCACHE = 512
def _compile(pattern, flags):
    # internal: compile pattern
    if isinstance(flags, RegexFlag):
        flags = flags.value
    try:
        return _cache[type(pattern), pattern, flags]
    except KeyError:
        pass
    if isinstance(pattern, Pattern):
        if flags:
            raise ValueError(...)
        return pattern
    if not _compiler.isstring(pattern):
        raise TypeError(...)
    if flags & T:
        import warnings
        warnings.warn(...)
    p = _compiler.compile(pattern, flags)
    if not (flags & DEBUG):
        if len(_cache) >= _MAXCACHE:
            # Drop the oldest item
            try:
                del _cache[next(iter(_cache))]
            except (StopIteration, RuntimeError, KeyError):
                pass
        _cache[type(pattern), pattern, flags] = p
    return p
```


### Prototype Pattern: What Problem Is It Solving?

Now that we’ve seen how the Flyweight pattern often collapses into a simple caching function in Python, let’s look at another pattern that frequently gets reinterpreted (or misunderstood) in modern code: **Prototype**.

Prototype is especially interesting because the way it’s presented in many online tutorials today, “reuse object state to create new objects”, is not actually its original focus. In the _Design Patterns_ book, the problem it solves is more architectural, and has to do with **decoupling object creation from a framework that doesn’t know about your custom types**.

Imagine you're building a music editor using a GUI framework. There's a `GraphicTool` class provided by the framework that users interact with to create graphics.

```python
class GraphicTool:
    def click(self) -> Graphics: ... 
    
# when users click the GraphicTool it would return a graph object that would be rendered on the screen.
```

You define your own classes like `MusicalNote`, which inherit from the base `Graphics` type:

```python
from gui import Graphics

class MusicalNote(Graphics):
	def __init__(self, note: str = "C4"):
	    self.note = note
```

Here’s the problem the GoF book describes:

> " GraphicTool presents a problem to the framework designer. The classes for notes and staves are specific to our application, but the GraphicTool class belongs to the framework. GraphicTool doesn't know how to create instances of our music classes to add to the score."

And it continues:

> " The question is, how can the framework use it to parameterize instances of GraphicTool by the _class_ of Graphic they're supposed to create?"

In short, although `GraphicTool` knows how to work with the base `Graphics` type defined by the library, it has no knowledge of the concrete subclasses like `MusicalNote` that are defined in the client application. Yet it is the GUI library who must create and place these objects when users interact with the tool palette.

This creates a tension. The framework can’t be expected to hardcode support for every user-defined subclass of `Graphics`. Nor is it practical to subclass `GraphicTool` for each new graphic type the client might introduce. To address this, the **Prototype** pattern offers a solution: rather than teaching the framework how to construct every possible object, the client supplies a preconfigured instance(a prototype) that the framework can clone whenever a new object is needed.

Under this pattern, you define a `clone()` method on your custom graphic class such as `MusicalNote`. This method returns a new copy of the object, allowing `GraphicTool` to remain completely unaware of the specific type it is cloning. It simply holds a reference to the prototype and invokes `proto.clone()` whenever it needs to create a new instance. In this way, the creation logic stays entirely in the hands of the client, while the framework remains flexible and extensible.

```python
class GraphicTool:
    def __init__(self, proto: Graphics):
        self.proto = proto
        
    def click(self) -> Graphic:
        return self.proto.clone()
```
From the client code, you might do:
```python
g = GraphicTool(proto=MusicalNote())
```
This works because you implement a `clone()` method on your custom class, and the tool just calls that to get a new object.

But in Python, this approach feels a little... off. Wouldn’t you just pass a **class** or **factory function** instead? That’s how we handle this kind of situation all the time. It’s cleaner, easier to read, and plays nicer with the rest of the language:


```python
class GraphicTool:
    def __init__(self, graph_factory: Callable[..., Graphics]):
        self.graph_factory = graph_factory
        
    def click(self) -> Graphic:
        return self.graph_factory()
        
# from client code
g = GrpahicTool(graph_factory=MusicalNote)

# To create with default values, pass factory, say lambda: MusicalNote(note="C5")
g = GraphicTool(graph_factory=lambda: MusicalNote(note="C5"))
```

This pattern of passing a callable is everywhere in Python. From `asyncio`'s `set_task_factory()` to the `target` parameter in `threading.Thread`, Python developers lean on factories because they’re straightforward and flexible.

### why didn’t the **Gang of Four** book recommend passing a factory instead? 

The book itself provides the answer:
> " Prototype is particularly useful with static languages like C++, where classes are not objects, and little or no type information is available at run-time. It's less important in languages like Smalltalk or Objective C that provide what amounts to a prototype (i.e., a class object) for creating instances of each class."

In other words, languages like C++ (especially pre-C++11) didn't support passing classes or lambdas as first-class objects. You couldn’t treat types as values or pass around factory functions. That’s why the Prototype pattern , cloning a sample object instead of constructing a new one, made sense in those contexts.

But in dynamic, reflective languages like Python, where classes and functions are first-class citizens, we have simpler, clearer alternatives. Instead of cloning objects with a `clone()` method, we just pass a **factory function or class constructor** ,  and we get more flexibility, better readability, and tighter integration with the language ecosystem.

So while the Prototype pattern remains a clever solution to a real problem in statically typed languages, in Python, it’s often **an unnecessary workaround** for a problem we don’t have.

### Wrapping Up

Flyweight and Prototype both solve real problems: minimizing object creation and decoupling object construction from frameworks. 

But the way they were designed in the context of C++ and Java doesn't always translate cleanly to Python.

In Python, we get powerful tools out of the box: first-class functions, flexible constructors, easy memoization with `functools.lru_cache`, and dynamic types. When we use those tools effectively, many classic patterns fade into the background, not because we’re ignoring good design, but because we’ve outgrown the constraints that made those patterns necessary in the first place.

So when you're tempted to reach for an old-school design pattern, pause and ask: _Is there a simpler, more natural way to express this in Python?_

Most of the time, there is.


---

Links:

[GOF flyweight pattern](https://www.cs.unc.edu/~stotts/GOF/hires/pat4ffso.htm)

[string interning from cpython github repo](https://github.com/python/cpython/blob/main/InternalDocs/string_interning.md)


[Random flyweight implementation in python I found online](https://github.com/gennad/Design-Patterns-in-Python/blob/master/flyweight.py)



--- 

Thank list

- Thanks u/commy2 for fixing the flyweight user code example

- Thanks u/camel_hopper for fixing typo "Graphic" -> "Graphics"

- Thanks u/tomysshadow for fixing typo "GrpahicTool" -> "GraphicTool"


