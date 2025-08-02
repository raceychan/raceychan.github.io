---
slug: Most-Design-Patterns-Are-Just-Dependency-Injection-In-Disguise
title: Most Design Patterns Are Just Dependency Injection in Disguise
authors: [raceychan]
tags: [python, design patterns, oop]
toc_min_heading_level: 2
toc_max_heading_level: 5
draft: true
---

# Most Design Patterns Are Just Dependency Injection in Disguise  

Design patterns are a helpful way to talk about structure — reusable blueprints for solving common problems in code. They give us a shared vocabulary, and when used well, they make systems more flexible and understandable.

But once you’ve worked with a few of them, you start to notice something: a lot of patterns look suspiciously similar in actual implementation. You’re injecting different behaviors, delegating to different components, maybe wrapping an object to change what it does — but structurally, it’s often the same playbook with different labels.

This post looks at a few well-known patterns — Strategy, State, Adapter, Proxy, Command — and makes the case that most of them reduce to the same fundamental technique: **Dependency Injection**. And once you add in two key design principles — **Open/Closed** and **Liskov Substitution** — you’ll find you can design pattern-like solutions without memorizing any formal templates.

<!-- truncate -->

Let’s start with the one pattern you probably used even before you knew what it was:

## The Strategy Pattern: The Gateway Drug

The Strategy pattern is the classic answer to “I need to do something in multiple ways, and I want to swap that behavior at runtime.” You define an interface, then inject different implementations depending on what you’re trying to do.

In plain English: it's just a fancy way of passing a function (or object) into another object to do something configurable.

Here’s a not-so-contrived example:

```python
from typing import Protocol

class DiscountStrategy(Protocol):
    def apply(self, price: float) -> float: ...

class TenPercentDiscount:
    def apply(self, price: float) -> float:
        return price * 0.9

class NoDiscount:
    def apply(self, price: float) -> float:
        return price

class Checkout:
    def __init__(self, discount: DiscountStrategy):
        self.discount = discount

    def total(self, price: float) -> float:
        return self.discount.apply(price)
```

Usage:

```python
checkout = Checkout(TenPercentDiscount())
print(checkout.total(100))
```

And just like that, you’ve implemented the Strategy pattern. Did we need to call it that? Not really. In Python, it just looks like... dependency injection.

## The State Pattern: Strategy with Memory

The State pattern is basically the Strategy pattern with a twist: the injected object also holds some internal state and may modify itself or the context based on that.

You know how in a game you might have `IdleState`, `RunningState`, `DeadState`, and each one handles user input differently? That’s State pattern territory. But again, at its core, you're injecting behavior — the current "state object" — and swapping it out when needed.

```python
class State(Protocol):
    def handle(self) -> None: ...

class Idle:
    def handle(self) -> None:
        print("Doing nothing")

class Running:
    def handle(self) -> None:
        print("Running!")

class Character:
    def __init__(self, state: State):
        self.state = state

    def update(self):
        self.state.handle()
```

It's Strategy, but with a bit more drama.

## The Adapter Pattern: Strategy with an Accent

The Adapter pattern is about taking an object with the wrong shape and giving it the right one, usually by wrapping it.

Example: You have a library that expects a `Logger` with a `log()` method, but you’re stuck with one that has a `write()` method instead.

```python
class LegacyLogger:
    def write(self, msg: str) -> None:
        print(f"[legacy] {msg}")

class LoggerAdapter:
    def __init__(self, adaptee: LegacyLogger):
        self.adaptee = adaptee

    def log(self, msg: str) -> None:
        self.adaptee.write(msg)
```

Did we just inject behavior via composition and delegation? Yes. Are we still in Strategy territory? Also yes.

## Other Patterns That Also Fall In Line

You don’t need to look far to see that **Proxy**, **Command**, **Decorator**, and **Visitor** can all be reduced to:

- Inject something into something else
- Call a method on it
- Maybe wrap it or delegate behavior

Patterns differ more in *intent* than *structure*. Which brings us to the point of this whole exercise.

## So... What's Actually Happening?

What’s underneath all of these patterns is just **Dependency Injection** plus **subclassing** (or duck typing), guided by two classic principles:

### Dependency Injection (DI)

DI is the idea that instead of hardcoding dependencies inside a class, you pass them in. This makes testing, configuration, and extension way easier.

In Python, DI is dead simple. Just pass stuff to the constructor (or function). No frameworks required.

### Subclassing and Liskov Substitution

The **Liskov Substitution Principle** (LSP) says: if you write code to an interface, any implementation should be swappable without surprises. Strategy, State, and the rest rely on this idea to keep behavior modular and interchangeable.

### The Open/Closed Principle (OCP)

OCP says software entities should be open for extension, but closed for modification. In practice, this means: don’t rewrite a class to change its behavior, inject a new one instead.

When you use DI + LSP + OCP, you naturally end up with code that looks like a design pattern without having to name it.

## You Don’t Need to Memorize Patterns — Just Learn These

If you understand:

- How to inject behavior (via functions, objects, or composition)
- How to write to abstractions, not concretions
- How to keep components swappable and extendable

...you’re already halfway to implementing 80% of the Gang of Four catalog.

Patterns are useful as vocabulary when communicating with other developers. But in Python, especially, we often don’t need to formally implement them — we just need to understand the problem they solve, and pick the cleanest way to solve it.

## Conclusion

Design patterns aren’t bad — they’re just overused and over-taught as if they’re sacred scripture. But most of them are really just different flavors of **Dependency Injection**, powered by **LSP** and **OCP**.

So instead of memorizing 23 pattern templates, you’ll get much farther by learning:

- How to inject behavior
- How to write extensible abstractions
- How to avoid rewriting code when you can just plug in new stuff

The patterns will follow. And if they don’t, maybe you didn’t need them in the first place.

