---
title: ft_transcendence - Full-Stack Real-Time Application
date: 2024-01-02 10:00:00 +0100
categories: [Web Development, Full-Stack, TypeScript]
tags: [Vue/React, NestJS, PostgreSQL, WebSockets, SPA, OAuth2, TypeScript, Real-time, JWT]
image: /assets/img/posts/ft_transcendence/welcome-background.png
render_with_liquid: false
---

# Introduction :

A Single Page Application (SPA) relies on asynchronous data fetching to dynamically rewrite the current web page with new data from the web server, avoiding the default behavior of loading entire new pages. Combined with WebSockets for real-time bidirectional communication, this architecture is standard for modern, interactive web applications.

# Project goals :

ft_transcendence is a 1337 project designed to synthesize full-stack development skills. The objective is to build a web platform featuring a real-time multiplayer Pong game, a chat system, user profiles, and OAuth2 authentication, utilizing a modern tech stack (e.g., NestJS for the backend, Vue.js or React for the frontend, and PostgreSQL).

The platform supports three distinct game modes :

![Game modes overview](/assets/img/posts/ft_transcendence/img.webp)

# Walkthrough :

Below is the main application Dashboard, showcasing the entry point for players, matchmaking status, and access to different game modes:

![Application Dashboard](/assets/img/posts/ft_transcendence/dashboard.png)

:one: System Architecture :

Define a clean separation of concerns. The backend acts as a RESTful API and WebSocket server. The frontend handles state management and rendering. Both are containerized using Docker.

:two: Database Schema (PostgreSQL) :

Design the relational database schemas. Key entities include Users, Matches, Channels, and Messages. Utilize an ORM (like Prisma or TypeORM) to map objects to database tables.

    model User {
      id        Int      @id @default(autoincrement())
      username  String   @unique
      avatar    String
      matches   Match[]
      status    String   @default("offline")
    }

:three: Authentication and OAuth2 :

Implement the authorization code flow. When a user clicks "Login with 42", redirect them to the 42 API authorization endpoint. Handle the callback, extract the authorization code, and exchange it for an access token. Generate a local JSON Web Token (JWT) to maintain the session state on the client side.

To secure access, users can register and login using their credentials or via Google/42 OAuth providers:

| Login Portal | Registration Portal |
| :---: | :---: |
| ![Login Page](/assets/img/posts/ft_transcendence/auth-login.png) | ![Register Page](/assets/img/posts/ft_transcendence/auth-register.png) |

Both views are fully responsive, adapting seamlessly to mobile screens:

| Mobile Login | Mobile Registration |
| :---: | :---: |
| ![Mobile Login](/assets/img/posts/ft_transcendence/auth-login-mobile.png) | ![Mobile Register](/assets/img/posts/ft_transcendence/auth-register-mobile.png) |

Additionally, we implemented Two-Factor Authentication (2FA) via Google Authenticator. Users scan a dynamic QR code on their security settings page to enable this extra layer:

![Two-Factor Authentication Setup](/assets/img/posts/ft_transcendence/auth-2fa.png)

:four: Chat and Channels (Real-time Messaging) :

The platform includes a fully-featured chat page supporting direct messages, public/private/password-protected channels, and real-time moderation controls (muting, banning, kicking, and designating admins). Users can also block others or directly invite them to a game from the chat interface:

![Chat Page](/assets/img/posts/ft_transcendence/chat-interface.png)

:five: Real-time Communication (WebSockets Gateways) :

To achieve low-latency updates for both chat messages and game coordinates, we instantiate WebSocket gateways. In NestJS, this is managed using `@WebSocketGateway()`, allowing bidirectionally persistent connections between the clients and server.

    @WebSocketGateway({ cors: true })
    export class GameGateway implements OnGatewayConnection {
      @SubscribeMessage('playerMove')
      handleMove(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        // Calculate physics and broadcast updated paddle position
      }
    }

:six: Pong Game Engine :

The authoritative game state must reside on the server to prevent client-side manipulation (cheating). The server calculates ball velocity, paddle collisions, and score updates at a fixed tick rate, broadcasting the updated coordinate data to connected clients. The frontend framework parses this data and renders the elements on a `<canvas>` using Three.js or standard Canvas rendering.

Here is what the live 3D gameplay looks like in action, presenting an immersive horizontal or angled perspective:

| Top-Down View | Angled 3D View |
| :---: | :---: |
| ![Top-Down View](/assets/img/posts/ft_transcendence/game-3d-topdown.png) | ![Angled 3D View](/assets/img/posts/ft_transcendence/game-3d-angled.png) |

The game is divided into three distinct match options:

**1v1 mode** — two players compete in real-time on the same server instance :

![1v1 Pong match](/assets/img/posts/ft_transcendence/play-1vs1.jpg)

**vs Bot mode** — the server runs an AI-controlled paddle opposing the human player :

![Player vs AI bot](/assets/img/posts/ft_transcendence/play-bot.jpg)

**Tournament mode** — a bracket-based competition where players are matched sequentially until a winner is determined :

![Tournament bracket](/assets/img/posts/ft_transcendence/play-Tournaments.jpg)

:seven: User Profiles & Game Statistics :

Each player has a dedicated profile that displays game statistics (total games, win rate, ELO rating, wins/losses) and a complete match history. ELO ratings and performance are charted dynamically to showcase progress:

![Profile Statistics Overview](/assets/img/posts/ft_transcendence/profile-stats.png)

A detailed view displays the recent Match History with win/loss details, ELO history over time, and a radar skill chart:

![Detailed Profile & History](/assets/img/posts/ft_transcendence/profile-details.png)

# Questions and answers

:question: What is the purpose of a JSON Web Token (JWT)?

> A JWT is a compact, URL-safe means of representing claims to be transferred between two parties. It allows the server to verify the user's identity without storing session state in the database or server memory, as the token itself contains a cryptographically signed payload proving its validity.

:question: How do WebSockets differ from standard HTTP requests?

> HTTP is a unidirectional, stateless protocol where the client initiates a request and the server returns a response, after which the connection closes. WebSockets establish a persistent, bidirectional TCP connection, allowing either the client or the server to push data at any time with minimal overhead.

:question: Why should the game logic run on the server?

> Running authoritative game logic on the server ensures state consistency across all clients and mitigates client-side exploits. If the client calculated the ball's position, a modified client could arbitrarily alter the coordinates and transmit false data to the server.

# Ressources :

* NestJS Documentation : https://docs.nestjs.com/
* Vue.js Documentation : https://vuejs.org/
* MDN WebSockets API : https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
