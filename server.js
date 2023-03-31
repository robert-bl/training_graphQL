const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLString,
    GraphQLScalarType
} = require('graphql')
const { books, authors } = require('./database')


const app = express()

//most basic return
// const schema = new GraphQLSchema({
//     query: new GraphQLObjectType({
//         name: 'helloworld',
//         fields: () => ({
//             message: {
//                 type: GraphQLString,
//                 resolve: () => `Hello World`
//             },
//         })
//     })
// })

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents and author who writes books',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt)},
        name: { type: GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorID === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt)},
        name: { type: GraphQLNonNull(GraphQLString)},
        authorID: { type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorID)
            }
        }
    })
})


const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A Book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of books',
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: 'An author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of authors',
            resolve: () => authors
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorID: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                /* This would be set up differently with a proper DB, e.g. id would be auto generated*/
                const book = { id: books.length + 1, name: args.name, authorID: args.authorID }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                /* This would be set up differently with a proper DB, e.g. id would be auto generated*/
                const author = { id: authors.length + 1, name: args.name }
                authors.push(author)
                return author
            }
        },
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
    //activates url
    schema: schema,
    graphiql: true
}))


app.listen(5000., () => console.log('Server Running'))