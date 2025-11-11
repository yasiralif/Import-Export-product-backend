const express = require('express')
const app = express()
const port = 3000
const cors= require('cors')
app.use(express.json())
app.use(cors())

// firebase admin
var admin = require("firebase-admin");

var serviceAccount = require("./firebasekey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://yasir:8egxI8NOJ8sNhOHo@cluster0.zgnatwl.mongodb.net/?appName=Cluster0";

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
    
    await client.connect();

    const bd= client.db('import-exports')
    const importCollection= bd.collection('import')
    // console.log(importCollection);

    // get section  all data find
    app.get("/all-products", async (req, res)=>{
        const result =await importCollection.find().toArray()
        res.send(result)
    })
     app.get("/all-products/:id", async (req, res)=>{
          const{id}=req.params
    //   console.log(id);
      const objectId = new ObjectId(id)
    //   console.log(objectId);
      const result = await importCollection.findOne({_id:objectId})
        // console.log(result);
      res.send(result)
    
    })

    // user export
 


    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// async function run() {
//   try {
    
//     await client.connect();
//     const db =client.db('frist')
//     const mycollection = db.collection('frist-1-card')
//     // console.log(mycollection);

//     app.get('/apps', async (req ,res)=>{
//         const result = await mycollection.find().toArray()
//         // console.log(result);
//         res.send(result)
//     })
//     //single data find method
//     app.get("/apps/:id", async (req, res)=>{
//       const{id}=req.params
//       // console.log(id);
//       const objectId = new ObjectId(id)
//       const result = await mycollection.findOne({_id:objectId})
//       // console.log(id);
//       res.send({
//         result
//       })
//     })

    
//       // post method 
//     app.post('/apps', async (req, res)=>{
//       const data =req.body
      
//       const result = await mycollection.insertOne(data);
//       // console.log(data);
//       res.send({
//         success:true,
//         result
//       })
//     })
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // await client.close();
//   }
// }
// run().catch(console.dir);



app.get('/home', (req, res) => {
  res.send('this is home')
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
