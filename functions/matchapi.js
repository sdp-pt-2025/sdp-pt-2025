const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const database = admin.firestore();

exports.getMatches = functions.https.onRequest(async(req, res) => {


   

    try {
      if (req.query.t=="create") {


        const check=[]
    const potentials = [];
    const liked = [];
    const matched = [];
    const emails = [];

    function Search(mymodule, modules) {
      for(let mine of mymodule){
        for(let yours of modules){
check.push([mine, yours]);
        if(mine===yours){
            return true;
        }
    }

      }
      return false;
    }


       const e = req.query.e;   

        // get all user emails
        const q = await database.collection("Users").get();
        q.forEach(doc => emails.push(doc.id));

        // loop through emails
        for (let email of emails) {
          const modules = [];
          if (email === e) continue;

          const mq = await database.collection("Users").doc(email).collection("Modules").get();
          mq.forEach(doc => modules.push(doc.id));
            const mymodule=[];
          const m = await database.collection("Users").doc(e).collection("Modules").get();
          m.forEach(doc => mymodule.push(doc.id));

          if (Search(mymodule, modules)) {
            
            potentials.push(email);
          }
        }

        // save matches
        await database.collection("MatchUsers").doc(e).set({
          potentials:potentials,
          liked:liked,
          matched:matched
        });

        res.status(200).send({ potentials, liked, matched ,e,emails,check});
      } 

      else if(req.query.t=="liked"){
        //get the fields
        let potentials=[];
        let potential;
        let liked;
        let matched;
        let e=req.query.e;
        let r= req.query.r;

        //const q=  await database.collection("MatchUsers").doc(e).get();

       const docSnap = await database.collection("MatchUsers").doc(e).get();
if (docSnap.exists) {
     potential = docSnap.data().potentials;
     liked = docSnap.data().liked;
     matched = docSnap.data().matched;
}

        for(let i of potential){
            if(i===r){
                continue;
            }
            potentials.push(i);
        }
        liked.push(r);

        //now we update;

        await database.collection("MatchUsers").doc(e).update({
            potentials:potentials,
            liked:liked,
            matched:matched
        })

        let likedd
      
        // Now we check if its a match
         const docSna = await database.collection("MatchUsers").doc(r).get();
if (docSna.exists) {
     likedd = docSna.data().liked;
    
}

if(likedd.includes(e)){
  //then its a match so add on both on matched array



  //////////////////////////////////////////////////////
  let likeddd=[];
  let potentiall;
  let matched;
  const docSnap = await database.collection("MatchUsers").doc(e).get();
if (docSnap.exists) {
     potentiall = docSnap.data().potentials;
     likeddd = docSnap.data().liked;
     matched = docSnap.data().matched;
}

        
        matched.push(r);

        //now we update;

        await database.collection("MatchUsers").doc(e).update({
            potentials:potentiall,
            liked:likeddd,
            matched:matched
        })






  /////////////////////////////////////////////////////////


  let like;
  let potentials;
  let match;
  const s = await database.collection("MatchUsers").doc(r).get();
if (s.exists) {
     potentials = s.data().potentials;
     like = s.data().liked;
     match = s.data().matched;
}

        
        match.push(e);

        //now we update;

        await database.collection("MatchUsers").doc(r).update({
            potentials:potentials,
            liked:like,
            matched:match
        })






  /////////////////////////////////////////////////////////

 res.send("Matched");
}else{
res.send("Not Matched");
}       

      }
      
    /**   else if(req.query.t==="matched"){
        //get the fields
        let potentials=[];
        let potential;
        let rejected;
        let matched;
        let e=req.query.e;
        let r= req.query.r;

        //const q=  await database.collection("MatchUsers").doc(e).get();

       const docSnap = await database.collection("MatchUsers").doc(e).get();
if (docSnap.exists) {
     potential = docSnap.data().potentials;
     rejected = docSnap.data().rejected;
     matched = docSnap.data().matched;
}

        for(let i of potential){
            if(i===r){
                continue;
            }
            potentials.push(i);
        }
        matched.push(r);

        //now we update;

        await database.collection("MatchUsers").doc(e).update({
            potentials:potentials,
            rejected:rejected,
            matched:matched
        })

        res.send({potentials,rejected,matched});

      }
      
      
      
      **/
      
      else {
        res.status(405).send("Method Not Allowed");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
});
