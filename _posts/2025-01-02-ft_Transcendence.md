---
title: ft_transcendence - Full-Stack Real-Time Application
date: 2024-03-20 10:00:00 +0100
categories: [Web Development, Full-Stack, TypeScript]
tags: [Vue/React, NestJS, PostgreSQL, WebSockets, SPA, OAuth2]
render_with_liquid: false
---

# Introduction :

A Single Page Application (SPA) relies on asynchronous data fetching to dynamically rewrite the current web page with new data from the web server, avoiding the default behavior of loading entire new pages. Combined with WebSockets for real-time bidirectional communication, this architecture is standard for modern, interactive web applications.

# Project goals :

ft_transcendence is a 1337 project designed to synthesize full-stack development skills. The objective is to build a web platform featuring a real-time multiplayer Pong game, a chat system, user profiles, and OAuth2 authentication, utilizing a modern tech stack (e.g., NestJS for the backend, Vue.js or React for the frontend, and PostgreSQL).

# Walkthrough :

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

:four: Real-time Communication (WebSockets) :

Instantiate WebSocket gateways for the Chat and Game modules. In NestJS, this is handled using `@WebSocketGateway()`.

    @WebSocketGateway({ cors: true })
    export class GameGateway implements OnGatewayConnection {
      @SubscribeMessage('playerMove')
      handleMove(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        // Calculate physics and broadcast updated paddle position
      }
    }

:five: Pong Game Engine :

The authoritative game state must reside on the server to prevent client-side manipulation (cheating). The server calculates ball velocity, paddle collisions, and score updates at a fixed tick rate, broadcasting the updated coordinate data to connected clients. The frontend framework parses this data and renders the elements on a `<canvas>`.

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
