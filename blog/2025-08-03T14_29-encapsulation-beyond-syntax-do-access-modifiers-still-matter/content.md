---
slug: encapsulation-beyond-syntax-do-access-modifiers-still-matter
title: "Encapsulation Beyond Syntax: Do Access Modifiers Still Matter?"
authors: [raceychan]
tags: [python, oop]
---

![gears](https://unsplash.com/photos/JBZvYieOmCQ/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8N3x8bWVjaGFuaWNzfGVufDB8fHx8MTc1NDI0NjQ1OXww&force=true&w=1920)

Access modifiers are ubiquitous across programming languages, yet they've become increasingly controversial in modern development. Through my experience with software development and technical discussions, I've observed a troubling pattern: many developers either treat access modifiers as meaningless ceremony or dismiss them entirely as outdated relics.

This dismissive attitude stems from a fundamental misunderstanding of their purpose. Access modifiers aren't just syntactic decorations: they're essential tools for implementing encapsulation, one of object-oriented programming's core principles. When used properly, they significantly enhance code maintainability and enable effective team collaboration. Conversely, their absence or misuse leads to fragile, tightly coupled systems that become maintenance nightmares.

Consider the typical enterprise codebase that has grown unwieldy over time. While poor encapsulation isn't the only culprit, it's often a primary factor in creating systems where simple changes ripple unpredictably throughout the application. This problem is particularly evident in Python projects, where the language's flexibility can mask structural issues until they become critical.

Rather than contributing to the abundance of tutorials on *how* to use access modifiers, this article explores the deeper question: *why* should we use them? We'll examine their role in creating maintainable software from multiple perspectives, from individual classes to entire system architectures.


<!--truncate-->

## What Are Access Modifiers?

Access modifiers are those little gatekeepers in your code that decide who gets to touch what. They're language constructs that control the visibility of class members: properties, methods, inner secrets, and they’re a cornerstone of something much bigger: encapsulation.

Encapsulation is about drawing clean lines between what your code offers to the outside world, and what it hides for internal use only. And access modifiers? They’re how we draw those lines.

Think of them as your API’s “do not enter” signs, or lack thereof.


### Common Access Modifiers Across Languages

| Language | Public | Protected | Private |
|----------|---------|-----------|---------|
| C++ | `public:` | `protected:` | `private:` |
| Python | `name` | `_name` | `__name` |

**C++:**
```cpp
  class UserRepository {
  public:
      UserRepository(std::shared_ptr<DatabaseEngine> engine) : _engine(engine) {}

      bool add_user(const UserProfile& user) {
          _validate_email(user.email);
          // do insert query here
          return true;
      }

  protected:
      std::shared_ptr<DatabaseEngine> _engine;  // Protected member (underscore prefix)

      void _validate_email(const std::string& email) {  // Protected method (underscore prefix)
          if (email.find('@') == std::string::npos) {
              throw std::invalid_argument("Not a valid email");
          }
      }
  };
```

**Python:**
```python
from sqlalchemy.ext.asyncio import AsyncEngine
from typing import Optional
from .model import UserProfile

class UserRepository:
    def __init__(self, engine: AsyncEngine):
        self._engine = engine           # Protected
    
    def add_user(self, user: UserProfile) -> bool:          # Public
        self._validate_email(user.email)

        stmt = # insert user query ...
        async with self._engine.begin() as conn:
            await self.conn.execute(stmt)
    
    def _validate_email(self, email: str):
        if not "@" in email:
            raise ValueError("Not a valid email")
```

### Python's Convention-Based Approach

You might notice that, there is no `protected`, `public` keyword like our cpp example and that's right,
unlike C++ or Java, Python doesn’t really enforce access control. It just politely asks you not to touch certain things and hopes you’re mature enough to listen. This approach, known as “consenting adults”, relies on naming conventions rather than hard rules.

So in Python:

`name` = public

`_name` = protected (but really just a hint)

`__name` = private (with name mangling)


### How it works

Let’s walk through each level of access with proper Python examples.

#### Public

Public members are the official interface of your class. Anyone can read or modify them. 

That’s especially true with dataclasses.

```python
from dataclasses import dataclass

@dataclass
class User:
    email: str
    is_active: bool
```
> here every member of `User` is made public

Why? Because dataclass is built for one very specific job: representing data. The fields in a dataclass are just values(python builtin types, or other dataclasses), not resources, not services, not open sockets.  There's no side effect when you read or write to them. That simplicity makes it safe (and sensible) for those fields to be public by default.

In practice, dataclasses are usually fully exposed (as value objects). The use case where you’d expose some fields but guard others, the kind that might warrant access modifiers, is not what dataclasses are meant for. That kind of partial encapsulation calls for a regular class, not a dataclass.


#### Protected

Protected members are for “internal use” by the class itself and its subclasses. In Python, a single underscore (_name) signals this. It’s not enforced by the interpreter, but it’s a strong hint: “this is not part of the public API.”

```python
class UserService:
    def __init__(self, user_repo: UserRepository):
        self._user_repo = user_repo
```

Can another module access `_user_repo`? Yes. Should it? Probably not.

Python won’t slap your wrist for accessing `_user_repo`, but if you later break your app by depending on internals you weren’t supposed to touch, well, that’s on you.

Wouldn't it be nice if someone warned you when you accidentally stepped over the line?

That’s where Python’s type-checking ecosystem comes in. Before Python 3.6, this kind of static checking wasn’t realistic. But now, with tools like pyright or mypy, you can actually get warnings when you misuse protected members.

To enable this, add the following to your pyproject.toml:

```toml
[tool.pyright]
exclude = ["tests"]
include = ["lihil/*.py"]
python_version = "3.10"
typeCheckingMode = "strict"
```


If you're using an editor like VSCode, it’ll now helpfully highlight any inappropriate access to protected fields: either with a squiggly underline or a firm tooltip telling you to back off.


Here is an example of how vscode would complain if you access protected attribute from outside of the class

![protected attr](./protected_attr.png)

It’s not bulletproof, but it’s enough to catch most accidental misuse, and that alone can save you a debugging session or three.

#### Private

Double underscore time. When you prefix a name with __, Python uses name mangling to make it harder to access from outside the class.

```python
class TokenManager:
    def __init__(self):
        self.__secret_key = "super-secret"

    def validate(self, token: str) -> bool:
        return token.endswith(self.__secret_key)
```


Now if you try to access `manager.__secret_key`c, you’ll get an AttributeError. Looks private, right?

But try just a little harder:
```python
>>> manager._TokenManager__secret_key
>>> "super-secret"
```

That’s all name mangling is, nothing fancy, no real security. It’s basically just renaming a key in a dictionary:

```python
cls_dict[attr_name] = f"_{cls.__name__}{attr_name}"
```

This isn’t about locking things down. It’s about discouraging accidents, especially the kind caused by autocomplete or careless refactors. It prevents casual misuse, not determined inspection.

So yes, it’s obscurity, not security, and it’s doing exactly what it was designed to do.

* Protected vs Private

    Many people get confused by the difference between protected vs private, some would call both of them "private".

    the difference is indeed subtle, it is mainly for who are you hiding from? protected hiding information from outside of the class(where subclasses are still considered insider), where as private hiding information from everyone execept the class itself.

## The "Closed" part in Open-Closed Principle

The Open-Closed Principle (OCP) says that software entities should be open for extension, but closed for modification. It sounds fancy, but here's the practical translation: you should be able to add new behavior without rewriting old code.

That second part, closed for modification, is where access modifiers come in. It's about protecting existing code from unintentional breakage. If your module exposes all of its internals to the outside world, then any change, even a harmless-looking one, risks breaking someone else’s code.

Let’s walk through a real-world-ish example.

### The Problem Without Access Modifiers

Suppose we’re building a UserService that provides the read/writer of `UserProfile` to other world. 


```python
class UserRepository:
    def add_user(self, user: UserProfile) -> None:
        ...

class UserService:
    def __init__(self, repo: UserRepository):
        self.repository = repo

    def register(self, email: str, name: str) -> UserProfile:
        user = UserProfile(email=email, name=name)
        self.repository.add_user(user)
        return user
```

Everything works fine... until another service comes along and decides it’s faster to just skip UserService entirely:

```python
# Somewhere else in the codebase
service = UserService()
user = UserProfile(email="a@example.com", name="Alice")
service.repository.add_user(user)  # Uh-oh
```

That might seem harmless, but now your internal behavior is part of someone else's dependency. You can't refactor add_user() without checking who else might be calling it. You can’t change validation rules, logging, or caching logic in register() because someone has bypassed it completely.

So now you're stuck. You want to improve your implementation, but you can't, because you're afraid to break downstream code that was never supposed to depend on this stuff in the first place.

That’s what “closed for modification” is really about: being able to change your code without changing its consumers. And that only works if you give them a stable, public interface, and hide the rest.

### The Solution With Proper Encapsulation

Let’s rewrite that UserService example ,but this time, with some actual boundaries.

```python
class UserRepository:
    def add_user(self, user: UserProfile) -> None:
        ...

    def find_by_email(self, email: str) -> UserProfile | None:
        ...

class UserService:
    def __init__(self, repository: UserRepository):
        self._repository = repository                # protected

    def register(self, email: str, name: str) -> UserProfile:
        user = UserProfile(email=email, name=name)
        self._repository.add_user(user)
        return user
```

This version actually respects encapsulation. The UserService offers one clear, well-defined public method: register(). That’s the official way to create a user, and it’s the only thing external code should be calling.

Everything else, like the repository, is considered internal. It's still accessible in Python if someone really wants to go spelunking, but we've marked it as protected `_repository` to signal our intent: this is not part of the public contract. If you reach in and touch it, you’re on your own.

This pattern maintains a clean separation between what the outside world should use and what it shouldn’t touch. It keeps your service focused, predictable, and safe to refactor, without the risk of breaking someone else's code just because you renamed a helper or swapped out your persistence layer.

## Why Access Modifiers Become Less Popular

Access modifiers continue to serve an important role in defining clear boundaries within code, but their practical usage has shifted alongside modern software design practices. As the industry has moved toward modular architectures and composition-based design, the need for strict access control has diminished in many scenarios.

###  Composition Over Inheritance

Historically, access modifiers(private, specifically) were often used to safeguard internals from misuse by subclasses. But as composition has become the preferred alternative to inheritance, particularly in languages like Rust and Go, this concern has become less relevant. Go, for example, lacks inheritance entirely and does not include traditional access modifiers beyond public/private naming conventions. Yet it remains highly capable of building well-encapsulated, maintainable systems.

### Separation of Data and Behavior

Another factor is the growing tendency to decouple data structures from business logic. In Python, for instance, dataclass objects are typically used to represent data without complex behavior. Since they don’t carry logic that needs to be guarded, fine-grained access control becomes less critical. Instead, we rely on conventions and well-defined interfaces to guide correct usage.

## Encapsulation beyond syntax

Access modifiers are one way to draw boundaries, but they’re not the only way. Many languages embrace encapsulation by convention, tooling, or structure, even if they don’t have formal protected or private keywords.

Let’s look at a few quick examples:

### Python

```python
# token_serivce/__init__.py
from .service import TokenService

__all__ = ["TokenService"]  # Everything else stays internal
```


> or just name other top level members with "_" prefix.

### Typescript

```ts
// token_serivce.ts

export class TokenService {}       // public
class InternalCache {}             // not exported = private to module
```

These languages all use different syntactic mechanisms, but they’re solving the same problem: hide what’s internal, and make what’s public explicit.

Whether it's a leading underscore in Python, capitalization in Go, or an export keyword in TypeScript, you're doing the same thing: protecting the shape of your interface, and making your codebase safer to evolve.

This is why access modifiers like protected and private are valuable, but not essential. Encapsulation is a mindset, not a keyword.

## Encapsulation beyond code

Encapsulation doesn’t stop at classes, functions, or modules, it applies at the **architectural level**, too.

In a microservice-based system, each service is an isolated unit with its own data, logic, and internal state. You don’t (and shouldn’t) reach across service boundaries to query another service’s database or call its internal methods. Instead, communication happens through **well-defined interfaces**, usually REST, gRPC, or message queues.

This is encapsulation at the system level:

- A service only exposes the API endpoints it wants others to use.
- Internal components like DAOs, caches, feature flags, or job queues are entirely hidden.
- Breaking changes can be avoided because external consumers never depend on internal details.

A good example would be an **API Gateway**. To the caller, it stays transparent. But behind the scenes, the gateway might route the request to multiple services, apply authentication, logging, retries, or circuit-breaking logic. None of that is exposed. The caller doesn't know, and doesn't need to.

It’s the same idea as `private` or `protected`, just scaled out over a network.

Whether you’re defining a Python method, a Go module, or a service boundary in your infrastructure, the principle is the same:

> **Hide internal details. Expose a clean, intentional interface. Decouple everything else.**

That’s encapsulation, even without the keyword.

## Wrap it up

We started with a question: **Do access modifiers still matter?** And the answer is yes, but not because of the syntax. They matter because they support a much bigger principle: **encapsulation**.

Throughout this article, we’ve explored how access modifiers like `private`, `protected`, and even Python’s humble underscore help draw boundaries between what’s internal and what’s public. But we’ve also seen that encapsulation goes far beyond these keywords. It lives in:

- **Class design**, through naming and structure  
- **Module and package organization**, via `__all__`, leading underscores, and folder layout  
- **Language conventions**, like capitalization in Go or `export` in TypeScript  
- **System architecture**, where APIs and service boundaries define what’s accessible  

So no. access modifiers aren’t meaningless ceremony, and they’re not relics either. They’re part of a larger toolkit we use to manage complexity, reduce coupling, and protect ourselves (and our teammates) from the chaos of accidental dependencies.

Even in a language like Python, where access control is convention-driven and technically unenforced, **encapsulation still matters**. In fact, it might matter *more*, because we rely on discipline, design, and clarity rather than compiler enforcement.

If there’s one idea to walk away with, it’s this:

> **Encapsulation isn’t about what the language allows, it’s about what the design intends.**

Use access modifiers when they help. Use structure, convention, and documentation when they don’t. Just make sure your interfaces are clear, your boundaries are meaningful, and your internals stay safely tucked away where they belong.