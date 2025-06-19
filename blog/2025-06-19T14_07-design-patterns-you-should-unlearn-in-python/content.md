---
slug: design-patterns-you-should-unlearn-in-python-part1
title: Design Patterns You Should Unlearn in Python-Part1
authors: [raceychan]
tags: [python]
toc_min_heading_level: 2
toc_max_heading_level: 5
---



![image-1.jpg](https://unsplash.com/photos/ipmwlGIXzcw/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzUwMzQwMjYwfA&force=true&w=1920)

Search for “design patterns in Python” and you’ll be rewarded with a parade of tutorials showing off how to faithfully re-implement Gang of Four patterns — complete with class diagrams, factory hierarchies, and enough boilerplate to heat a small village. They’ll make you feel like you’re writing “serious” code. Smart. Professional. Enterprise-ready.

But here’s the problem: **most of these patterns solve problems Python doesn’t have**. They were designed for languages like Java and C++, where you have to jump through hoops just to get basic things done — no first-class functions, no dynamic typing, no modules as namespaces. Of course you’d need a Factory or a Singleton if your language gives you nothing else to work with.

Blindly copying those patterns into Python doesn’t make you clever. It makes your code harder to read, harder to test, and harder to explain to the next poor soul who has to maintain it — possibly you, three months from now.

In this post, we’ll go over a few classic GOF patterns that you should unlearn as a Python developer. For each one, we’ll look at:

1. How it’s usually (and badly) implemented in Python,
2. Why it actually made sense back when people were writing Java in 2001,
3. And what the Pythonic alternative looks like — because yes, there’s almost always a simpler way.

Let’s start with the biggest offender: **Creational Patterns** — aka, a whole category of solutions to problems Python already solved.

<!-- truncate -->

### Singleton: When You Want a Global Variable but Make It Look Fancy

Ah yes, the Singleton. The go-to pattern for developers who want global state but still want to feel like they’re writing _object-oriented_ code. In Python, you’ll often see this “smart” implementation using `__new__` and a class variable:


```python
class Singleton:
    _instance: "Singleton" | None = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

It _feels_ clever — until you try to actually use it.

```python
s1 = Singleton(name="Alice", age=30)
s2 = Singleton(name="Bob", age=25)

print(s1.name)  # 'Alice'
print(s2.name)  # Still 'Alice'!
```


What happened? Well, it turns out you’re always getting the same instance, no matter what parameters you pass. Your second call to `Singleton(name="Bob", age=25)` didn’t create anything new — it just silently reused the original object, with its original attributes. No warning. No error. Just quietly wrong.


But things get worse when you try to subclass it:

```python
class DBConnection:
    _instance = None
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

class MySqlConnection(DBConnection): ...
class PostGresConnection(DBConnection): ...

conn1 = MySqlConnection()
conn2 = PostGresConnection()
```

You might expect two separate objects, one for each subclass. But nope — both `conn1` and `conn2` are the same instance. That’s because `_instance` lives on the base class, not per subclass. So congratulations: **you’ve now built the ultimate surprise box.** `PostGresConnection()` might return a `MySqlConnection`, and `MySqlConnection()` might give you a `PostGresConnection`. It all depends on which one you happened to instantiate first.

Hope your app enjoys the roulette.

### Why Singleton Made Sense in C++

Let’s be clear: the Singleton pattern didn’t appear out of thin air. It was born in the wild west of C++ — a language with no real module system and only a limited notion of namespaces.

In C++, your code lives in header and source files, all crammed together during compilation. There’s no clean way to say “this is private to this file” or “this global object only exists once” without jumping through hoops. The language gives you **global variables**, which quickly become a mess if you don’t control their initialization and lifetime carefully.

Because C++ doesn’t have modules (before c++20) or proper package systems, Singleton was a clever hack to guarantee **exactly one** instance of a class, avoiding the nightmare of duplicate globals and multiple definitions. It’s like the language forced you to invent a pattern to handle what Python solves with a simple module-level object.

```cpp
// logger.h

#ifndef LOGGER_H
#define LOGGER_H

class Logger {
public:
    void log(const char* msg);
};

extern Logger globalLogger; // Declaration
#endif

// logger.cpp

#include "logger.h"
#include <iostream>

Logger globalLogger; // Definition

void Logger::log(const char* msg) {
    std::cout << msg << std::endl;
}

// main.cpp

#include "logger.h"

int main() {
    globalLogger.log("Starting the app");
    return 0;
}

```
The `globalLogger` is defined in one translation unit (`logger.cpp`), but if you accidentally define it in multiple places, the linker will complain about duplicate symbols. Managing this global state is tricky — and the Singleton pattern wraps this idea into a class that controls its own single instance, so you don’t have to worry about multiple definitions.

So yes, Singleton is basically a band-aid for C++’s lack of modularity and clean global state management — not a holy grail of software design.

### The Pythonic Alternative: Just Use Modules (Seriously)

If you want a **global, single instance** in Python, you don’t need to reinvent the wheel with complicated Singleton classes. Python already gives you everything you need — in the form of **modules**.

Just create your object at the module level, and it’s guaranteed to be a singleton for as long as that module is imported:


```python
# settings.py
from typing import Final

class Settings: ...

settings: Final[Settings] = Settings() # add typing.Final to settings so type checker would complain if someone is trying to re-assign the settings object.
```


### Want to Delay Creation? Use Closures

Okay, maybe you want to **delay** creating the object until it’s actually needed — lazy initialization. Still no need for Singleton patterns.

Use a simple function with a closure and an internal variable to store the instance:


```python
def _settings():
    settings: Settings = Settings()

    def get_settings() -> Settings:
        return settings

    def set_settings(value: Settings) -> None:
        nonlocal settings
        settings = value

    return get_settings, set_settings

get_settings, set_settings = _settings()
```

[Example of this pattern from github](https://github.com/raceychan/lihil/blob/master/lihil/config/__init__.py)



This approach is especially useful when your settings object depends on values only available at runtime — for example, the path to an environment file (`env_file: Path`). With lazy initialization via closure, you can defer creating the `Settings` instance until you have all the necessary information, instead of forcing it at import time.


### Builder Pattern: Overcomplicating Object Creation Like a Boss

If you’ve dabbled in design patterns, you’ve probably seen the Builder pattern praised as the elegant way to construct complex objects step-by-step. In languages like Java or C++, where constructors can’t have default arguments and object immutability is king, this makes some sense.

But in Python? Oh boy. You’ll often find “builders” that look like this:

```python
class CarBuilder:
    def __init__(self):
        self._color = None
        self._engine = None

    def set_color(self, color: str) -> "CarBuilder":
        self._color = color
        return self

    def set_engine(self, engine: str) -> "CarBuilder":
        self._engine = engine
        return self

    def build(self) -> "Car":
        return Car(color=self._color, engine=self._engine)

class Car:
    def __init__(self, color: str, engine: str):
        self.color = color
        self.engine = engine

car = (
    CarBuilder()
    .set_color("red")
    .set_engine("V8")
    .build()
)
```

This is the kind of code that makes you look like you know what you’re doing... until you realize you just reinvented named arguments with method chaining and extra classes. All that boilerplate, just to avoid using Python’s default arguments or keyword arguments?

Congratulations! You’ve just made a _builder_ to work around a problem Python already solves out of the box.


why Builder pattern is often needed due to lack of default parameter values:
```java
public class Car {
    private final String color;
    private final String engine;

    private Car(Builder builder) {
        this.color = builder.color;
        this.engine = builder.engine;
    }

    public static class Builder {
        private String color;   // no default value
        private String engine;  // no default value

        public Builder setColor(String color) {
            this.color = color;
            return this;
        }

        public Builder setEngine(String engine) {
            this.engine = engine;
            return this;
        }

        public Car build() {
            // You might want to add validation here
            return new Car(this);
        }
    }

    public static void main(String[] args) {
        Car car = new Car.Builder()
            .setColor("Red")
            .setEngine("V8")
            .build();
    }
}
```

In Java, constructors can’t have default values for parameters, and method overloading quickly becomes cumbersome for many options. The Builder pattern solves this by allowing step-by-step construction with optional parameters.

### The Pythonic Alternative: Default Arguments and Factory Functions — No Builders Required

So how do we build complex objects in Python without all the ceremony? Simple: we just use the language like it was meant to be used.

#### 1. Use Default Arguments Like a Normal Human

In Python, we don’t need to chain setters just to create an object. We can give parameters default values right in the constructor — no extra classes needed:

```python
class Car:
    def __init__(self, color: str = "black", engine: str = "V4"):
        self.color = color
        self.engine = engine

car = Car(color="red", engine="V8")
```

Boom. Readable, concise, and infinitely easier to test. You want a default car? Just call `Car()`. You want something fancy? Pass in the arguments. Done.

#### 2. Want Something Fancier? Use a Factory Function with Overloads

If you want more control or better editor support (e.g. different argument combos), a **factory function** with `typing.overload` gives you flexibility _without_ creating a whole `Builder` class:

```python
from typing import overload

class Car:
    def __init__(self, color: str, engine: str):
        self.color = color
        self.engine = engine

@overload
def make_car() -> Car: ...
@overload
def make_car(color: str) -> Car: ...
@overload
def make_car(color: str, engine: str) -> Car: ...

def make_car(color: str = "black", engine: str = "V4") -> Car:
    return Car(color=color, engine=engine)

car1 = make_car()
car2 = make_car("red")
car3 = make_car("blue", "V8")
```

You get clean logic, helpful autocompletion in your IDE, and zero boilerplate. Imagine that — solving the builder problem with just functions and defaults. Who knew?
