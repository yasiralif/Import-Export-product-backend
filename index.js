const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
require("dotenv").config()
app.use(express.json())
app.use(cors())

// firebase admin
var admin = require("firebase-admin");

var serviceAccount = require("./firebasekey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.zgnatwl.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // await client.connect();

    const bd = client.db('import-exports')
    const importCollection = bd.collection('import')
    const userImportCollection = bd.collection('my-import')
    const exportCollection = bd.collection('user-exports')
    // console.log(importCollection);

    // authorization verify Token


    // get section  all data find
    app.get("/all-products", async (req, res) => {
      const imported = await importCollection.find().toArray();
      const exported = await exportCollection.find().toArray();
      const allProducts = [...imported, ...exported];
      res.send(allProducts);
    })

    app.get("/all-products/:id", async (req, res) => {
      const { id } = req.params
      // console.log(id);
      const objectId = new ObjectId(id)
      const result = await importCollection.findOne({ _id: objectId })
      res.send(result)

    })

    // latest products data
    app.get("/latest-products", async (req, res) => {
      const imported = await importCollection.find().toArray();
      const exported = await exportCollection.find().toArray();

      const allProducts = [...imported, ...exported];

      allProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
// console.log(object);
      res.send(allProducts.slice(0, 6));
    });


    app.get("/my-imports-detalis/:id", async (req, res) => {
      const { id } = req.params
      // console.log(id);
      const objectId = new ObjectId(id)
      // console.log(objectId);
      const result = await userImportCollection.findOne({ _id: objectId })
      // console.log(result);
      res.send(result)

    })

    // user export


    app.get("/user-exports", async (req, res) => {

      const email = req.query.email;
      const result = await exportCollection.find({ create_by: email }).toArray();
      res.send(result);
    })


    app.post("/user-exports", async (req, res) => {
      const newProduct = req.body;
      const result = await exportCollection.insertOne(newProduct)
      res.send(result)
    })

    // put method 
    app.put("/all-products/:id", async (req, res) => {

      const { id } = req.params
      const data = req.body
      const objectId = new ObjectId(id)
      const filter = { _id: objectId }
      const updateData = { $set: data };

      const result = await exportCollection.updateOne(filter, updateData)
      res.send({
        result

      })
    })

    // import user section 
    // app.post("/user-imports", async (req, res) => {
    //   const newProduct = req.body;
    //   const filter = { _id: new ObjectId(newProduct.productId) };
      
    //   const update = {
    //     $inc: {
    //       stock: -newProduct.quantity
    //     }
    //   };
    //   const saveImport = await importCollection.updateOne(filter, update);

    //   const result = await userImportCollection.insertOne(newProduct)
    //   res.send(result, saveImport)
    // })
app.post("/user-imports", async (req, res) => {
  const newProduct = req.body;

 
  const filter = { _id: new ObjectId(newProduct.productId) };
  const update = {
    $inc: {
      stock: -newProduct.quantity
    }
  };
  const saveImport = await importCollection.updateOne(filter, update);

  
  const userFilter = {
    productId: newProduct.productId,
    create_by: newProduct.create_by
  };

  const userUpdate = {
    $inc: { stock: newProduct.quantity },
    $setOnInsert: { ...newProduct }  
  };

  const options = { upsert: true };

  const result = await userImportCollection.updateOne(
    userFilter,
    userUpdate,
    options
  );

  res.send({ result, saveImport });
});

    


    // user-imports single data find
    app.get("/user-imports", async (req, res) => {
      const email = req.query.email;
      const result = await userImportCollection.find({ create_by: email }).toArray();
      res.send(result);
    })

    // delete method 
 app.delete("/user-imports/:id", async (req, res) => {
  const { id } = req.params;
  const objectId = new ObjectId(id);
  const result = await userImportCollection.deleteOne({ _id: objectId });
  res.send(result);
});

// delete method
   app.delete("/user-exports/:id", async (req, res) => {
   const { id } = req.params;
  //  console.log(id);
  const objectId = new ObjectId(id);
  const result = await exportCollection.deleteOne({ _id: objectId });
      res.send(result)
      // console.log(result);

    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/home', (req, res) => {
  res.send('this is home')
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
