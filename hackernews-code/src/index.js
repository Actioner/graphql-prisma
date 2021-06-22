const { readFileSync } = require('fs');
const {join } = require('path');
const { ApolloServer, PubSub } = require('apollo-server');
const { PrismaClient } = require('@prisma/client');

const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const User = require('./resolvers/User');
const Link = require('./resolvers/Link');
const Subscription = require('./resolvers/Subscription');
const Vote = require('./resolvers/Vote');
const { getUserId } = require('./utils');

const pubsub = new PubSub()
const prisma = new PrismaClient({
    log: ['query'],
  });

const resolvers = {
    Query,
    Mutation,
    Subscription,
    User,
    Link,
    Vote
};

const server = new ApolloServer({
    typeDefs: readFileSync(
        join(__dirname, 'schema.graphql'),
        'utf8'
    ),
    resolvers,
    context: ({ req }) => {
        if (req.body.query.indexOf('IntrospectionQuery') < 0) {
            console.log('\x1b[36m%s\x1b[0m', 'graphQL:query', req.body.query);
            console.log('\x1b[36m%s\x1b[0m', 'graphQL:variables', req.body.variables);
        }
        
        return {
            ...req,
            prisma,
            pubsub,
            userId: req && req.headers.authorization ?
                getUserId(req) :
                null
        };
    },
    debug: true
});

server
    .listen()
    .then(({ url }) =>
        console.log(`Server is running on ${url}`)
    );