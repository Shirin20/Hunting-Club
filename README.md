# API Documentation

This documentation describes the RESTful API for the Hunting Club. The API allows users to manage hunting games, user authentication, and webhook registration.

## Base URL

All API requests should be made to the following base URL:

## Authentication

To perform safe HTTP calls, a valid JWT token is required. To obtain a JWT token, you should first register a new user or sign in with an existing user:

- `POST /users/register`: Register a new user.
- `POST /users/login`: Sign in with an existing user.

## Resources

### Games

- `GET /games`: Retrieve all games.
- `POST /games`: Create a new game. Requires authentication.
- `GET /games/:id`: Retrieve a specific game by ID.
- `PUT /games/:id`: Update a specific game by ID. Requires authentication.
- `DELETE /games/:id`: Delete a specific game by ID. Requires authentication.

### Users

- `POST /users/login`: Log in as an existing user.
- `POST /users/register`: Register a new user.

### Webhooks

- `GET /webhooks`: Retrieve webhook options.
- `POST /webhooks/register`: Register a new webhook subscriber. Requires authentication.
- `PUT /webhooks/:id`: Update a specific webhook subscriber by ID. Requires authentication.
