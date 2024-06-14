var express=require("express")
var bodyParser=require("body-parser")
var mongoose=require("mongoose")

const app=express()
app.set('view engine', 'ejs');

app.use(bodyParser.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended:true
}))

mongoose.connect('mongodb://127.0.0.1:27017/cars')
var db=mongoose.connection
db.on('error',()=> console.log("Error in Connecting to Database"))
db.once('open',()=> console.log("Connected to Database"))

app.post("/sign_up",(req,res) => {
    var firstname= req.body.fname
    var lastname= req.body.lname
    var email=req.body.email
    var license= req.body.lic
    var phone=req.body.phone
    var password=req.body.pass

    var data={
        "firstname":firstname,
        "lastname":lastname,
        "email":email,
        "license":license,
        "phone":phone,
        "password":password
    }
    db.collection('registration').insertOne(data,(err,collection) => {
        if(err){
            throw err;
        }
        console.log("Record Inserted Succesfully")
    })
    return res.redirect('index.html')
})

var username;
app.post("/login",async (req,res) => {
    try{
        username= req.body.email
        var password= req.body.pass

        const result=await db.collection('registration').findOne({email:username})
        if(result.password==password){
            try {
                const cursor = db.collection('cars').find(); 
                const cars = await cursor.toArray(); 
                res.render('cardetails.ejs', {
                    cars: cars, 
                    user: result
                });
            } catch (error) {
                console.error(error); 
            }
        }
        else{
            res.redirect('/?error=Wrong%20Password')
        }
    }
    catch{
        res.redirect('/?error=Wrong%20details')
    }
})

app.post("/adminlogin",async (req,res) => {
    try{
        var username= req.body.adid
        var password= req.body.adpass
        const result=await db.collection('admin').findOne({email:username})
        if(result.password==password){
            try {
                const cursor = db.collection('registration').find(); 
                const users = await cursor.toArray(); 
                res.render('adminusers.ejs', {
                    users: users 
                });
            } catch (error) {
                console.error(error); 
            }
        }
        else{
            res.redirect('/?error=Wrong%20Password')
        }
    }
    catch{
        res.redirect('/?error=Wrong%20details')
    }
})

app.get('/adminvehicle', async(req, res) => {
    try {
        const cursor = db.collection('cars').find(); 
        const cars = await cursor.toArray(); 
        res.render('adminvehicle.ejs', {
            cars: cars 
        });
    } catch (error) {
        console.error(error); 
    }
});
app.get('/adminfeed', async(req, res) => {
    try {
        const cursor = db.collection('feedback').find(); 
        const feedback = await cursor.toArray(); 
        res.render('adminfeed.ejs', {
            feedback: feedback 
        });
    } catch (error) {
        console.error(error); 
    }
});
app.get('/adminusers', async(req, res) => {
    try {
        const cursor = db.collection('registration').find(); 
        const users = await cursor.toArray(); 
        res.render('adminusers.ejs', {
            users: users 
        });
    } catch (error) {
        console.error(error); 
    }
});
app.get('/adminbook', async (req, res) => {
    try {
        const cursor = db.collection('booking').find(); 
        const bookings = await cursor.toArray(); 
        res.render('adminbook.ejs', {
            bookings: bookings 
        });
    } catch (error) {
        console.error(error); 
    }
});
app.get('/cardetails', async(req, res) => {
    try {
        const cursor = db.collection('cars').find(); 
        const cars = await cursor.toArray(); 
        const result=await db.collection('registration').findOne({email:username})
        res.render('cardetails.ejs', {
            cars: cars, 
            user: result
        });
    } catch (error) {
        console.error(error); 
    }
});
app.get('/aboutus2', async(req, res) => {
    try {
        const result=await db.collection('registration').findOne({email:username})
        res.render('aboutus2.ejs', {
            user: result
        });
    } catch (error) {
        console.error(error); 
    }
});
app.get('/contactus2', async(req, res) => {
    try {
        const result=await db.collection('registration').findOne({email:username})
        res.render('contactus2.ejs', {
            user: result
        });
    } catch (error) {
        console.error(error); 
    }
});
app.get('/bookingstatus', async(req, res) => {
    try {
        const result=await db.collection('registration').findOne({email:username})
        const status=await db.collection('booking').findOne({$and:[{email:username},{book_status:{$ne:"RETURNED"}}]})
        if(status==null){
            res.render('bookingstatus.ejs', {
                user: result,
                status:{},
                car:{}
            });
        }
        else{
            res.render('bookingstatus.ejs', {
                user: result,
                status:status
            });
        }
    } catch (error) {
        console.error(error); 
    }
});
app.post("/carfeedback",async(req,res) => {
    var feedmsg= req.body.feedmsg
    const feed=db.collection('feedback').find().sort({feed_id:-1});
    const feedarr=await feed.toArray(); 
    var id=parseInt(feedarr[0].feed_id)+1
    var data={
        "feed_id":id,
        "email":username,
        "msg":feedmsg,
    }
    db.collection('feedback').insertOne(data)
    const cursor = db.collection('cars').find(); 
    const cars = await cursor.toArray(); 
    const result=await db.collection('registration').findOne({email:username})
    res.render('cardetails.ejs', {
        cars: cars, 
        user: result
    });
})
app.get('/booking', async(req, res) => {
    try {
        const result=await db.collection('registration').findOne({email:username})
        res.render('booking.ejs', {
            user: result
        });
    } catch (error) {
        console.error(error); 
    }
});
app.post("/newcar",async(req,res) => {
    const carid=db.collection('cars').find().sort({car_id:-1});
    const cararr=await carid.toArray(); 
    var id=parseInt(cararr[0].car_id)+1;
    var name=(req.body.carname).toUpperCase();
    var fuel=(req.body.ftype).toUpperCase();
    var capacity=req.body.capacity;
    var price=req.body.price;
    var img="images/"+req.body.image;
    var data={
        "car_id":id,
        "car_name":name,
        "fuel_type":fuel,
        "capacity":capacity,
        "price":price,
        "available":"YES",
        "src":img
    }
    db.collection('cars').insertOne(data,(err,collection) => {
        if(err){
            console.log(err);
        }
        console.log("Record Inserted Succesfully")
    })
    const cursor = db.collection('cars').find(); 
    const cars = await cursor.toArray(); 
    res.render('adminvehicle.ejs', {
        cars: cars 
    });
})
app.post("/bookcar",async(req,res) => {
    var name=(req.body.name).toUpperCase()
    const result=await db.collection('registration').findOne({email:username})
    const car=await db.collection('cars').findOne({car_name:name})
    var email=username
    var book_place=req.body.place
    var book_date=req.body.date
    var duration=req.body.dur
    var phone=result.phone
    var destination=req.body.des
    var return_date=req.body.rdate
    var price=car.price*duration
    var book_status="UNDER PROCESSING"

    var data={
        "car_name":name,
        "email":email,
        "book_place":book_place,
        "book_date":book_date,
        "duration":duration,
        "phone":phone,
        "destination":destination,
        "return_date":return_date,
        "price":price,
        "book_status":book_status
    }
    db.collection('booking').insertOne(data,(err,collection) => {
        if(err){
            throw err;
        }
        console.log("Record Inserted Succesfully")
    })
    const cursor = db.collection('cars').find(); 
    const cars = await cursor.toArray(); 
    res.render('cardetails.ejs', {
        user: result,
        cars:cars
    });
})
app.post('/deletecar', async(req, res) => {
    try {
        var name=req.body.carname;
        db.collection('cars').deleteOne({car_name:name})
        const cursor = db.collection('cars').find(); 
        const cars = await cursor.toArray(); 
        res.render('adminvehicle.ejs', {
            cars: cars 
        });
    } catch (error) {
        console.error(error); 
    }
});
app.post('/approve', async(req, res) => {
    try {
        var name=req.body.ap;
        db.collection('booking').updateOne({$and:[{email:name},{book_status:{$ne:"RETURNED"}}]},{$set:{book_status:"APPROVED"}})
        const cursor = db.collection('booking').find(); 
        const bookings = await cursor.toArray(); 
        res.render('adminbook.ejs', {
            bookings: bookings 
        });
    } catch (error) {
        console.error(error); 
    }
});
app.post('/return', async(req, res) => {
    try {
        var name=req.body.re;
        db.collection('booking').updateOne({$and:[{email:name},{book_status:{$ne:"RETURNED"}}]},{$set:{book_status:"RETURNED"}})
        const cursor = db.collection('booking').find(); 
        const bookings = await cursor.toArray(); 
        res.render('adminbook.ejs', {
            bookings: bookings 
        });
    } catch (error) {
        console.error(error); 
    }
});


app.get("/",(req,res) => {
    res.set({
        "Allow-acces-Allow-Origin":'*'
    })
    return res.redirect('index.html')
}).listen(3000);

console.log("Listening on port 3000")