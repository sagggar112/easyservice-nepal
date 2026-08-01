# EasyService Nepal

This repository contains a full-stack application with separate `client` and `server` folders.

## Project Structure

- `client/` - React + Vite frontend
- `server/` - Node.js + Express backend
- `database/` - database-related files
- `.gitignore` - generated ignore rules for Node, build artifacts, and environment files

## Requirements

- Node.js installed
- Git installed

## Setup

Install dependencies for both packages.

```bash
cd c:\easyservice-nepal\server
npm install

cd c:\easyservice-nepal\client
npm install
```

## Running the app

Start the server:

```bash
cd c:\easyservice-nepal\server
npm run dev
```

Start the client:

```bash
cd c:\easyservice-nepal\client
npm run dev
```

## Notes

- `client` is configured with Vite and TypeScript
- `server` uses Express, PostgreSQL (`pg`), JWT, and Multer for uploads
- Add your environment variables in `.env` files as needed

## Git

A Git repository was initialized at the project root.
