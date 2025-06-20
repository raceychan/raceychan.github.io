# FastAPI

Я долгосрочный пользователь FastAPI, использую его с октября 2020 года и применил в более чем 10 проектах.
Я был вполне доволен тем, что предлагает FastAPI, но меня беспокоит то, чего он не предлагает.
За годы работы я обнаружил, что пишу одни и те же модули снова и снова для почти каждого проекта:

- ограничение API (throttling)
- публикация событий в Kafka
- авторизация и аутентификация
- шаблонный код для фабрик
- сложность интеграции сторонних плагинов

Некоторые люди утверждают, что FastAPI фокусируется на производительности, а Django - на функциональности, но я думаю, мы можем иметь и то, и другое.

Наконец, я решил объединить все те модули, которые я написал на этом пути, и создать новый фреймворк.

Он покрывает большинство функций FastAPI с дополнительными возможностями:

- Внедрение зависимостей на основе типов
- Встроенная система авторизации, которая позволяет создать полноценный контроль доступа в несколько строк
- Система сообщений
- Генератор ошибок ответов
- Страница проблем

В дополнение ко всем этим функциям, lihil также предлагает лучшую производительность по ключевым метрикам веб-фреймворка:

- Более высокий RPS
- Меньшее потребление памяти
- Более короткое время сборки мусора
- Более быстрое время запуска

