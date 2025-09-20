import pg from "pg";
import dotenv from "dotenv";
import express from 'express';




const app = express();
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.NEON_DB_URL
});

app.use(express.json());

// ---------------- CREATE TABLES ----------------
const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS UserInfo(
                student_num VARCHAR(50) PRIMARY KEY,
                Username TEXT,
                Age VARCHAR(50),
                Email VARCHAR(250),
                DOS TEXT,
                YOS VARCHAR(50)
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Pfp(
            id SERIAL PRIMARY KEY,
                student_num VARCHAR(50) ,
                pfp TEXT
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS UserPreferance(
                student_num VARCHAR(50) PRIMARY KEY,
                Study_goal TEXT,
                Bio TEXT,
                Learning_style TEXT,
                Study_location TEXT,
                Motivator TEXT
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS UserModules(
                student_num VARCHAR(50) PRIMARY KEY,
                module VARCHAR(50)
            );
        `);

    } catch (error) {
        console.log(error);
    }
};

createTable();

// ---------------- ROUTES ----------------

// Add user info
app.post("/userinfo", async (req, res) => {
    const { a: Age, u: Username, d: DOS, y: YOS, s: stdnum, e: Email } = req.query;

    try {
        await pool.query(
            `INSERT INTO UserInfo (student_num, Username, Age, DOS, YOS, Email)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [stdnum, Username, Age, DOS, YOS, Email]
        );
        res.send({ message: "User info added", stdnum });
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});

// Add profile picture
app.post("/pfp", async (req, res) => {
    const { s: stdnum, p: pfp } = req.query;

    try {
        await pool.query(
            `INSERT INTO Pfp (student_num, pfp) VALUES ($1,$2)`,
            [stdnum, pfp]
        );
        res.send({ message: "Profile picture added", stdnum });
    } catch (e) {
        res.status(500).send(e);
    }
});

// Add modules
app.post("/modules", async (req, res) => {
    const { s: stdnum, m: module } = req.query;

    try {
        await pool.query(
            `INSERT INTO UserModules (student_num, module) VALUES ($1,$2)`,
            [stdnum, module]
        );
        res.send({ message: "Module added", stdnum, module });
    } catch (e) {
        res.status(500).send(e);
    }
});

// Add user preference
app.post("/userPreferance", async (req, res) => {
    const { s: stdnum, sg: Study_goal, b: Bio, l: Learning_style, sl: Study_location, m: Motivator } = req.query;

    try {
        await pool.query(
            `INSERT INTO UserPreferance (student_num, Study_goal, Bio, Learning_style, Study_location, Motivator)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [stdnum, Study_goal, Bio, Learning_style, Study_location, Motivator]
        );
        res.send({ message: "User preference added", stdnum });
    } catch (e) {
        res.status(500).send(e);
    }
});

// Get user info
app.get("/getuserinfo", async (req, res) => {
    const stdnum = req.params.s;
    try {
        const result = await pool.query(`SELECT * FROM UserInfo WHERE student_num=$1`, [stdnum]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Get user modules
app.get("/getusermodules", async (req, res) => {
    const stdnum = req.query.s;
    try {
        const result = await pool.query(`SELECT * FROM UserModules WHERE student_num=$1`, [stdnum]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Get user preferences
app.get("/getuserpreferance", async (req, res) => {
    const stdnum = req.query.s;
    try {
        const result = await pool.query(`SELECT * FROM UserPreferance WHERE student_num=$1`, [stdnum]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Get profile picture
app.get("/getpfp", async (req, res) => {
    const stdnum = req.query.s;
    try {
        const result = await pool.query(`SELECT * FROM Pfp WHERE student_num=$1`, [stdnum]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).send(e);
    }
});


app.get("/recommended", async (req, res) => {
  try {
    const stdnum = req.query.s?.trim();

    const recommended = [];

   
    const res1 = await pool.query(
      `SELECT pfp FROM pfp WHERE student_num = $1`,
      [stdnum]
    );
        console.log("res1:", res1.rows); // modules for this student

console.log(res1.rows.length);
    for (const a of res1.rows) {
      const module = a.pfp; // now this will actually have the module name

      // 2️⃣ Get all students in the same module
      const res2 = await pool.query(
        `SELECT student_num FROM pfp WHERE pfp = $1`,
        [module]
      );
      console.log("res2:", res2.rows); // students in same module
      console.log("ohhh");


      for (const b of res2.rows) {
        const student = b.student_num;

        // 3️⃣ Get their usernames
        const res3 = await pool.query(
          `SELECT username, student_num FROM userinfo WHERE student_num = $1`,
          [student]
        );
        console.log("res3:", res3.rows); // usernames


        // Add each user to the array
        recommended.push(...res3.rows);
      }
    }


    res.json(recommended);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }

});

app.get("/search",async(req,res)=>{
    const module= req.query.m?.trim();
    const result= await pool.query(`SELECT student_num FROM Pfp WHERE pfp=$1`,[module]);
    let array=[];

    for(const row of result.rows){
        array.push(row.student_num);
    }
    //get the names of the student num
    const ret=[]
    for(const std of array){
        const q= await pool.query(`SELECT username, student_num FROM userinfo WHERE student_num=$1`,[std]);
        for(const rs of q.rows){
            ret.push(rs);

        }

    }
    res.json(ret);


});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
