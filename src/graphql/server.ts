import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import type { Application } from "express";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";
import { createContext } from "./context";
import corsMiddleware from "../config/cors";

export const setupGraphQL = async (app: Application) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.options("/graphql", corsMiddleware);
  app.use(
    "/graphql",
    corsMiddleware,
    expressMiddleware(server, {
      context: createContext,
    })
  );
};
