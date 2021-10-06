const PROTO_PATH = './customers.proto'

const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const { v4: uuidv4 } = require('uuid')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
})

const customersProto = grpc.loadPackageDefinition(packageDefinition)

const server = new grpc.Server()

const customers = [
    {
        id: uuidv4(),
        name: 'Melvin Musehani',
        age: 29,
        address: '214 Emily Hobhouse'
    },
    {
        id: uuidv4(),
        name: 'Khuthadzo',
        age: 14,
        address: '12131 Mamelodi East'
    }
]

server.addService(customersProto.CustomerService.service, {
    getAll: (_, callback) => {
        callback(null, { customers })
    },

    get: (call, callback) => {
        const customer = customers.find(n => n.id == call.request.id)

        if (customer) {
            callback(null, customer)
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: 'Not Found'
            })
        }
    },

    insert: (call, callback) => {
        const customer = call.request

        customer.id = uuidv4()
        customers.push(customer)

        callback(null, customer)
    },

    update: (call, callback) => {
        const existingCustomer = customers.find(n => n.id == call.request.id)

        if (existingCustomer) {
            existingCustomer = {
                id: existingCustomer.id,
                ...call.request
            }

            callback(null, existingCustomer)
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: 'Not Found'
            })
        }
    },

    remove: (call, callback) => {
        const existingCustomerIndex = customers.findIndex(n => n.id == call.request.id)

        if (existingCustomerIndex != -1) {
            customers.splice(existingCustomerIndex, 1)

            callback(null, {})
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: 'Not Found'
            })
        }
    }
})

server.bindAsync('127.0.0.1:30043', grpc.ServerCredentials.createInsecure(), err => {
    if (!err) {
        server.start()
        console.log('Server running at http://127.0.0.1:30043');
        
    } else {
        console.log(err);
    }
    
})

// server.bind('127.0.0.1:30043', grpc.ServerCredentials.createInsecure())



