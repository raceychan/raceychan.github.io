# FastAPI

I am a long-term fastapi users, I have been using fastapi since Octomber 2020 and have applied it to 10+ projects.
I was pretty satisifed with what fastapi offers, but it is what it does not offer bothers me,
Over the years, I found myself writing some modules repeatedly for almost every project,

- api throttling
- publish events to kafka
- authorization & authentification
- boiler-plate code for factories.
- Difficult to integrate third-party plugins

Some people suggest that fastapi focuses on performance and django focuses on functionality, but I think we can have both. 

Finally, I've decided to integrate all those modules I wrote along the way and made a new framework.

It covers most features fastapi has , with some extra features:

- Type-Based Dependency Injection
- Builtin Auth System that let you build a full fledged access control with a few lines.
- Messaging system
- Error response generator
- Problem Page

In addition to all those features, lihil also offers better performance for core matrics of a web framework.

- Higher RPS 
- Lower memory usage
- Shorter GC time
- Faster startup time

