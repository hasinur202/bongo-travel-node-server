const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pjlge.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('bongo_travel');
        const toursCollection = database.collection('tours');
        const bookingCollection = database.collection('bookings');

        // GET API
        app.get('/tours', async (req, res) => {
            const cursor = toursCollection.find({});
            const tours = await cursor.toArray();
            res.send(tours);
        });

        // GET Single Tour
        app.get('/tours/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tour = await toursCollection.findOne(query);
            res.json(tour);
        })

        // Add Tour API
        app.post('/addtour', async (req, res) => {
            const tour = req.body;
            const result = await toursCollection.insertOne(tour);
            res.json(result);
        })
        // Add Booking API
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.json(result);
        })

        // GET Booking by userid
        app.get('/bookings/:uid', async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid };
            const booking = await bookingCollection.find(query);
            const booktours = await booking.toArray();
            res.json(booktours);
        })

        // GET Booking all
        app.get('/all-bookings', async (req, res) => {
            const booking = await bookingCollection.find({});
            const booktours = await booking.toArray();
            res.json(booktours);
        })

        // DELETE Booking API
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.json(result);
        })

        //Approve API
        app.put('/approve-booking/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 1
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        //Reject API
        app.put('/reject-booking/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 3
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

                //UPDATE API
                // app.put('/users/:id', async (req, res) => {
                //     const id = req.params.id;
                //     const updatedUser = req.body;
                //     const filter = { _id: ObjectId(id) };
                //     const options = { upsert: true };
                //     const updateDoc = {
                //         $set: {
                //             name: updatedUser.name,
                //             email: updatedUser.email
                //         },
                //     };
                //     const result = await usersCollection.updateOne(filter, updateDoc, options)
                //     console.log('updating', id)
                //     res.json(result)
                // })

    }

    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Bongo Travel Server');
});

app.listen(port, () => {
    console.log('Running Bongo Travel Server on Port', port);
})