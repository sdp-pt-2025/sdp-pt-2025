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
app.post("/userPreperence", async (req, res) => {
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
    const stdnum = req.query.s;
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
    const stdnum = req.params.s;
    try {
        const result = await pool.query(`SELECT * FROM Pfp WHERE student_num=$1`, [stdnum]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).send(e);
    }
});

app.delete("/deletemodule",async(req,res)=>{
    const std_num=req.query.s;
    const module=req.query.m;

    try{
        await pool.query(`DELETE FROM UserModules WHERE student_num=$1 AND module=$2`,[std_num,module]);
        
    }catch(error){
        res.send(error)
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
