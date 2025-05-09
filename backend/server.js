const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 5001;
app.use(bodyParser.json());
app.use(cors());

const config = {
  user: "sa",
  password: "Zainab.19",
  server: "localhost",
  database: "project",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function connectDB() {
  try {
    await sql.connect(config);
    console.log(" Connected to SQL Server!");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}
connectDB();

//GENRE

// GET / Read request
app.get("/genre", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM genre");
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching: ", error);
    res.status(500).json({ message: "Error fetching" });
  }
});

//Post / Create request
app.post("/genre", async (req, res) => {
  try {
    const { genres } = req.body; // Expecting an array of genres

    if (!Array.isArray(genres) || genres.length === 0) {
      return res.status(400).json({ message: "Genre(s) array is required" });
    }

    const pool = await sql.connect(config);
    const request = pool.request();

    let values = genres.map((_, index) => `(@gname${index})`).join(",");
    let query = `INSERT INTO genre (gname) VALUES ${values}`;

    genres.forEach((gname, index) => {
      request.input(`gname${index}`, sql.VarChar, gname);
    });

    //insert multiple genres at once via json like :{"genres": ["Rock", "Pop", "Jazz", "Hip-Hop"]}
    //can also insert just one via: {"genres": ["Electronic"]}

    await request.query(query);
    res.status(201).json({ message: "Genre(s) added" });
  } catch (error) {
    console.error("Error inserting genre:", error);
    res.status(500).json({ message: "Error inserting genre" });
  }
});

//PUT / Update request
app.put("/genre", async (req, res) => {
  try {
    const { id, gname } = req.body;

    // Ensure both id and gname are provided
    if (id === undefined || id === null || !gname) {
      return res
        .status(400)
        .json({ message: "Both id and genre name are required" });
    }

    const query = `UPDATE genre SET gname = @gname WHERE id = @id`;

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("id", sql.Int, id);
    request.input("gname", sql.VarChar, gname);

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Genre not found" });
    }

    // to run write  {"id": 5, "gname": "Action"}

    res.status(200).json({ message: "Genre updated" });
  } catch (error) {
    console.error("Error updating genre:", error);
    res.status(500).json({ message: "Error updating genre" });
  }
});

//DELETE request
app.delete("/genre", async (req, res) => {
  try {
    const { ids } = req.body; //expecting array again

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Id(s) array is required" });
    }

    const pool = await sql.connect(config);
    const request = pool.request();

    const idParams = ids.map((_, index) => `@id${index}`).join(", ");
    const query = `DELETE FROM genre WHERE id IN (${idParams})`;

    ids.forEach((id, index) => {
      request.input(`id${index}`, sql.Int, id);
    });

    //delete multiple genres at once via json like :{"ids": [ 1 , 2 , 3 ]}
    //can also delete just one via: {"ids": [4]}

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json({ message: "No genre(s) found for deletion" });
    }

    res.status(200).json({ message: "Genre(s) deleted successfully" });
  } catch (error) {
    console.error("Error deleting genre(s):", error);
    res.status(500).json({ message: "Error deleting genre(s)" });
  }
});

//USER

app.get("/allusers", async (req, res) => {
  try {
    const { userId } = req.query; // Get userId from query parameters

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("userId", sql.Int, userId) // Pass userId as input
      .query("SELECT * FROM users WHERE id <> @userId");

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching users: ", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

//Post / Create request
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password, age, country } = req.body; // Expecting a single user

    if (!username || !email || !password || !age || !country) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const pool = await sql.connect(config);
    const request = pool.request();

    let query = `
            INSERT INTO users (uname, uemail, upassword, uage, ucountry) 
            VALUES (@uname, @uemail, @upassword, @uage, @ucountry)
        `;

    request.input("uname", sql.VarChar, username);
    request.input("uemail", sql.VarChar, email);
    request.input("upassword", sql.VarChar, password);
    request.input("uage", sql.Int, age);
    request.input("ucountry", sql.VarChar, country);

    await request.query(query);
    res.status(201).json({ success: true, message: "User added successfully" });
  } catch (error) {
    console.error("Error inserting user:", error);
    res.status(500).json({ message: "Error inserting user" });
  }
});

//PUT / Update request
app.put("/users", async (req, res) => {
  try {
    const { id, uname, uemail, upassword, uage, ucountry } = req.body;

    // Ensure id is provided
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    let updates = [];
    let request = new sql.Request();

    if (uname) {
      updates.push("uname = @uname");
      request.input("uname", sql.VarChar, uname);
    }
    if (uemail) {
      updates.push("uemail = @uemail");
      request.input("uemail", sql.VarChar, uemail);
    }
    if (upassword) {
      updates.push("upassword = @upassword");
      request.input("upassword", sql.VarChar, upassword);
    }
    if (uage) {
      updates.push("uage = @uage");
      request.input("uage", sql.Int, uage);
    }
    if (ucountry) {
      updates.push("ucountry = @ucountry");
      request.input("ucountry", sql.VarChar, ucountry);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one field must be updated" });
    }

    request.input("id", sql.Int, id);
    let query = `UPDATE users SET ${updates.join(", ")} WHERE id = @id`;

    const pool = await sql.connect(config);
    const result = await pool.request().query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
});

//DELETE request
app.delete("/users", async (req, res) => {
  try {
    const { ids } = req.body; // Expecting an array of user IDs

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Id(s) array is required" });
    }

    const pool = await sql.connect(config);
    const request = pool.request();

    const idParams = ids.map((_, index) => `@id${index}`).join(", ");
    const query = `DELETE FROM users WHERE id IN (${idParams})`;

    ids.forEach((id, index) => {
      request.input(`id${index}`, sql.Int, id);
    });

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "No user(s) found for deletion" });
    }

    res.status(200).json({ message: "User(s) deleted successfully" });
  } catch (error) {
    console.error("Error deleting user(s):", error);
    res.status(500).json({ message: "Error deleting user(s)" });
  }
});

//ARTIST

app.get("/artist", async (req, res) => {
  try {
    const query = "SELECT * FROM artist";
    const pool = await sql.connect(config);
    const result = await pool.request().query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Error fetching artists" });
  }
});

app.post("/artist", async (req, res) => {
  try {
    const { aname, instagram, gender, monthlystreams } = req.body;

    if (!aname || !gender || !monthlystreams) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const query = `INSERT INTO artist (aname, instagram, gender, monthlystreams) 
                       VALUES (@aname, @instagram, @gender, @monthlystreams)`;

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("aname", sql.VarChar, aname);
    request.input("instagram", sql.VarChar, instagram || null);
    request.input("gender", sql.VarChar, gender);
    request.input("monthlystreams", sql.BigInt, monthlystreams);

    await request.query(query);
    res.status(201).json({ message: "Artist added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding artist" });
  }
});

app.put("/artist", async (req, res) => {
  try {
    const { id } = req.params;
    const { aname, instagram, gender, monthlystreams } = req.body;

    let updates = [];
    const request = new sql.Request();

    if (aname) {
      updates.push("aname = @aname");
      request.input("aname", sql.VarChar, aname);
    }
    if (instagram) {
      updates.push("instagram = @instagram");
      request.input("instagram", sql.VarChar, instagram);
    }
    if (gender) {
      updates.push("gender = @gender");
      request.input("gender", sql.VarChar, gender);
    }
    if (monthlystreams) {
      updates.push("monthlystreams = @monthlystreams");
      request.input("monthlystreams", sql.BigInt, monthlystreams);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const query = `UPDATE artist SET ${updates.join(", ")} WHERE id = @id`;
    request.input("id", sql.Int, id);

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Artist not found" });
    }

    res.status(200).json({ message: "Artist updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating artist" });
  }
});

app.delete("/artist", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Id(s) array is required" });
    }

    const pool = await sql.connect(config);
    const request = pool.request();
    const idParams = ids.map((_, index) => `@id${index}`).join(", ");

    ids.forEach((id, index) => {
      request.input(`id${index}`, sql.Int, id);
    });

    const query = `DELETE FROM artist WHERE id IN (${idParams})`;
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json({ message: "No artist(s) found for deletion" });
    }

    res.status(200).json({ message: "Artist(s) deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting artist(s)" });
  }
});

//ALBUM

app.get("/album", async (req, res) => {
  try {
    const query = "SELECT * FROM album";
    const pool = await sql.connect(config);
    const result = await pool.request().query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Error fetching albums" });
  }
});

app.post("/album", async (req, res) => {
  try {
    const { aname, artist } = req.body;

    if (!aname || !artist) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const query = `INSERT INTO album (aname, artist) VALUES (@aname, @artist)`;
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("aname", sql.VarChar, aname);
    request.input("artist", sql.Int, artist);

    await request.query(query);
    res.status(201).json({ message: "Album added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding album" });
  }
});

app.put("/album", async (req, res) => {
  try {
    const { id } = req.params;
    const { aname, artist } = req.body;

    let updates = [];
    const request = new sql.Request();

    if (aname) {
      updates.push("aname = @aname");
      request.input("aname", sql.VarChar, aname);
    }
    if (artist) {
      updates.push("artist = @artist");
      request.input("artist", sql.Int, artist);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const query = `UPDATE album SET ${updates.join(", ")} WHERE id = @id`;
    request.input("id", sql.Int, id);

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Album not found" });
    }

    res.status(200).json({ message: "Album updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating album" });
  }
});

app.delete("/album", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Id(s) array is required" });
    }

    const pool = await sql.connect(config);
    const request = pool.request();
    const idParams = ids.map((_, index) => `@id${index}`).join(", ");

    ids.forEach((id, index) => {
      request.input(`id${index}`, sql.Int, id);
    });

    const query = `DELETE FROM album WHERE id IN (${idParams})`;
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json({ message: "No album(s) found for deletion" });
    }

    res.status(200).json({ message: "Album(s) deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting album(s)" });
  }
});

//SONGS

app.get("/songs", async (req, res) => {
  try {
    const query = "SELECT * FROM SONGS";
    const pool = await sql.connect(config);
    const result = await pool.request().query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Error fetching songs" });
  }
});


app.delete("/songs", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Id(s) array is required" });
    }

    const pool = await sql.connect(config);
    const request = pool.request();
    const idParams = ids.map((_, index) => `@id${index}`).join(", ");

    ids.forEach((id, index) => {
      request.input(`id${index}`, sql.Int, id);
    });

    const query = `DELETE FROM SONGS WHERE id IN (${idParams})`;
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "No song(s) found for deletion" });
    }

    res.status(200).json({ message: "Song(s) deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting song(s)" });
  }
});

//TASTE

app.get("/taste", async (req, res) => {
  try {
    const query = "SELECT * FROM TASTE";
    const pool = await sql.connect(config);
    const result = await pool.request().query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Error fetching taste records" });
  }
});

app.post("/taste", async (req, res) => {
  try {
    const { userid, songsid, taste } = req.body;

    if (!userid || !songsid) {
      return res
        .status(400)
        .json({ message: "User ID and Song ID are required" });
    }

    const query = `INSERT INTO TASTE (userid, songsid, taste) 
                       VALUES (@userid, @songsid, @taste)`;

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("userid", sql.Int, userid);
    request.input("songsid", sql.Int, songsid);
    request.input("taste", sql.Int, taste || 1);

    await request.query(query);
    res.status(201).json({ message: "Taste added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding taste" });
  }
});

app.put("/taste", async (req, res) => {
  try {
    const { userid, songsid, taste } = req.body;

    if (!userid || !songsid || taste === undefined) {
      return res
        .status(400)
        .json({
          message: "User ID, Song ID, and new taste value are required",
        });
    }

    const query = `UPDATE TASTE SET taste = @taste WHERE userid = @userid AND songsid = @songsid`;
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("userid", sql.Int, userid);
    request.input("songsid", sql.Int, songsid);
    request.input("taste", sql.Int, taste);

    const result = await request.query(query);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Taste record not found" });
    }

    res.status(200).json({ message: "Taste updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating taste" });
  }
});

app.delete("/taste", async (req, res) => {
  try {
    const { userid, songsid } = req.body;

    if (!userid || !songsid) {
      return res
        .status(400)
        .json({ message: "User ID and Song ID are required" });
    }

    const query = `DELETE FROM TASTE WHERE userid = @userid AND songsid = @songsid`;
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("userid", sql.Int, userid);
    request.input("songsid", sql.Int, songsid);

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Taste record not found" });
    }

    res.status(200).json({ message: "Taste deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting taste" });
  }
});

//Playlist

app.get("/playlist", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const query = "SELECT * FROM PLAYLIST WHERE userid = @userId";
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("userId", sql.Int, userId);
    const result = await request.query(query);

    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Error fetching playlists" });
  }
});

app.post("/playlist", async (req, res) => {
  try {
    const { ptitle, pdescription, userid } = req.body;

    if (!ptitle || !userid) {
      return res
        .status(400)
        .json({ message: "Title and User ID are required" });
    }

    const query = `INSERT INTO PLAYLIST (ptitle, pdescription, userid) 
                       VALUES (@ptitle, @pdescription, @userid)`;

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("ptitle", sql.VarChar, ptitle);
    request.input("pdescription", sql.Text, pdescription || null);
    request.input("userid", sql.Int, userid);

    await request.query(query);
    res.status(201).json({ message: "Playlist created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating playlist" });
  }
});

app.put("/playlist", async (req, res) => {
  try {
    const { id } = req.params;
    const { ptitle, pdescription } = req.body;

    if (!ptitle && !pdescription) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const query = `UPDATE PLAYLIST SET ptitle = @ptitle, pdescription = @pdescription, p_updated = GETDATE() 
                       WHERE id = @id`;
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("id", sql.Int, id);
    request.input("ptitle", sql.VarChar, ptitle);
    request.input("pdescription", sql.Text, pdescription || null);

    const result = await request.query(query);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.status(200).json({ message: "Playlist updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating playlist" });
  }
});

app.delete("/playlist/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM PLAYLIST WHERE id = @id`;
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("id", sql.Int, id);

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.status(200).json({ message: "Playlist deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting playlist" });
  }
});

//Playlist _ s

app.post("/playlist_s", async (req, res) => {
  try {
    const { playlistid, songsid } = req.body;

    if (!playlistid || !songsid) {
      return res
        .status(400)
        .json({ message: "Playlist ID and Song ID are required" });
    }

    const query = `INSERT INTO PLAYLIST_S (playlistid, songsid) VALUES (@playlistid, @songsid)`;
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("playlistid", sql.Int, playlistid);
    request.input("songsid", sql.Int, songsid);

    await request.query(query);
    res.status(201).json({ message: "Song added to playlist" });
  } catch (error) {
    res.status(500).json({ message: "Error adding song to playlist" });
  }
});

app.delete("/playlist_s", async (req, res) => {
  try {
    const { playlistid, songsid } = req.body;

    if (!playlistid || !songsid) {
      return res
        .status(400)
        .json({ message: "Playlist ID and Song ID are required" });
    }

    const query = `DELETE FROM PLAYLIST_S WHERE playlistid = @playlistid AND songsid = @songsid`;
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("playlistid", sql.Int, playlistid);
    request.input("songsid", sql.Int, songsid);

    await request.query(query);
    res.status(200).json({ message: "Song removed from playlist" });
  } catch (error) {
    res.status(500).json({ message: "Error removing song from playlist" });
  }
});

//functional queries
//get user by email and password for login
app.post("/login", async (req, res) => {
  try {
    const { uemail, upassword } = req.body; // Get email and password from the request body

    if (!uemail || !upassword) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const query = `
            SELECT * FROM USERS 
            WHERE uemail = @uemail AND upassword = @upassword
        `;

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("uemail", sql.VarChar, uemail);
    request.input("upassword", sql.VarChar, upassword);

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      res
        .status(200)
        .json({
          success: true,
          message: "Login successful",
          user: result.recordset[0],
        });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in user", error: error.message });
  }
});

//spotify api doesnt return genre tho
//get all songs of a specific genre of a user liked and his playlist
app.get("/songs/genre/:userid/:genreid", async (req, res) => {
  try {
    const { userid, genreid } = req.params;

    if (!userid || !genreid) {
      return res
        .status(400)
        .json({ message: "User ID and Genre ID are required" });
    }

    const query = `
            SELECT DISTINCT s.id, s.stitle, s.sartist, s.sgenre, s.salbumid, s.srating 
            FROM SONGS s
            JOIN TASTE t ON s.id = t.songsid AND t.userid = @userid
            LEFT JOIN PLAYLIST_S ps ON s.id = ps.songsid
            LEFT JOIN PLAYLIST p ON ps.playlistid = p.id AND p.userid = @userid
            WHERE s.sgenre = @genreid
        `;

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("userid", sql.Int, userid);
    request.input("genreid", sql.Int, genreid);

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res
        .status(404)
        .json({ message: "No songs found for this genre and user" });
    }
  } catch (error) {
    console.error("Error fetching songs:", error);
    res
      .status(500)
      .json({ message: "Error fetching songs", error: error.message });
  }
});

//get all liked songs by a user
app.get("/songs/liked/:userid", async (req, res) => {
  try {
    const { userid } = req.params;

    if (!userid) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const query = `
            SELECT * FROM UserLikedSongsView WHERE userid = @userid
        `;

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("userid", sql.Int, userid);

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({ message: "No liked songs found for this user" });
    }
  } catch (error) {
    console.error("Error fetching liked songs:", error);
    res
      .status(500)
      .json({ message: "Error fetching liked songs", error: error.message });
  }
});

//get all playlist of a user
app.get("/playlists/:userid", async (req, res) => {
  try {
    const { userid } = req.params;

    if (!userid) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const query = `
            SELECT id, ptitle, pdescription, p_created, p_updated
            FROM PLAYLIST
            WHERE userid = @userid
        `;

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("userid", sql.Int, userid);

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({ message: "No playlists found for this user" });
    }
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res
      .status(500)
      .json({ message: "Error fetching playlists", error: error.message });
  }
});

//get most liked songs
app.get("/songs/most-liked", async (req, res) => {
  try {
    const query = `
            SELECT s.id, s.stitle, s.sgenre, s.salbumid, s.srating, COUNT(t.userid) AS like_count
            FROM TASTE t
            JOIN SONGS s ON t.songsid = s.id
            GROUP BY s.id, s.stitle, s.sgenre, s.salbumid, s.srating
            ORDER BY like_count DESC
        `;

    const pool = await sql.connect(config);
    const request = pool.request();

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({ message: "No liked songs found" });
    }
  } catch (error) {
    console.error("Error fetching most liked songs:", error);
    res
      .status(500)
      .json({
        message: "Error fetching most liked songs",
        error: error.message,
      });
  }
});

//most popular genre based on liked songs
app.get("/genres/most-popular", async (req, res) => {
  try {
    const query = `
            SELECT g.id, g.gname, COUNT(t.songsid) AS like_count
            FROM TASTE t
            INNER JOIN SONGS s ON t.songsid = s.id
            INNER JOIN GENRE g ON s.sgenre = g.id
            GROUP BY g.id, g.gname
            ORDER BY like_count DESC
        `;

    const pool = await sql.connect(config);
    const request = pool.request();

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({ message: "No liked genres found" });
    }
  } catch (error) {
    console.error("Error fetching most popular genres:", error);
    res
      .status(500)
      .json({
        message: "Error fetching most popular genres",
        error: error.message,
      });
  }
});

//get users based on name
app.get("/users", async (req, res) => {
  try {
    const { name } = req.query; // Getting name from query params

    const query = `SELECT * FROM USERS WHERE uname = @name`;
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("name", sql.VarChar, name);

    const result = await request.query(query);
    res.status(200).json(result.recordset);
   
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

app.post("/likes", async (req, res) => {
  let transaction;
  try {
    const {
      stitle,
      genrename,
      albumname,
      rating,
      simage,
      trackUri,
      userId,
      authornames,
    } = req.body;
    console.log("Liking song:", stitle, "for user:", userId);

    const pool = await sql.connect(config);
    transaction = new sql.Transaction(pool);
    await transaction.begin();


    let genreResult = await pool
      .request()
      .input("genrename", sql.VarChar, genrename)
      .query("SELECT id FROM GENRE WHERE gname = @genrename");

    let genreId = genreResult.recordset.length
      ? genreResult.recordset[0].id
      : (await pool.request()
        .input("genrename", sql.VarChar, genrename)
        .query("INSERT INTO GENRE (gname) OUTPUT INSERTED.id VALUES (@genrename)")
      ).recordset[0].id;


    let albumResult = await pool
      .request()
      .input("albumname", sql.VarChar, albumname)
      .query("SELECT id FROM ALBUM WHERE aname = @albumname");

    let albumId = albumResult.recordset.length
      ? albumResult.recordset[0].id
      : (await pool.request()
        .input("albumname", sql.VarChar, albumname)
        .query("INSERT INTO ALBUM (aname) OUTPUT INSERTED.id VALUES (@albumname)")
      ).recordset[0].id;


    let songResult = await pool
      .request()
      .input("trackUri", sql.VarChar, trackUri)
      .query("SELECT id FROM SONGS WHERE trackuri = @trackUri");

    let songId = songResult.recordset.length
      ? songResult.recordset[0].id
      : (await pool.request()
        .input("stitle", sql.VarChar, stitle)
        .input("trackUri", sql.VarChar, trackUri)
        .input("genreId", sql.Int, genreId)
        .input("albumId", sql.Int, albumId)
        .input("rating", sql.Float, rating || 0)
        .input("simage", sql.VarChar, simage)
        .query(`
                    INSERT INTO SONGS (stitle, trackuri, sgenre, salbumid, srating, simage)
                    OUTPUT INSERTED.id
                    VALUES (@stitle, @trackUri, @genreId, @albumId, @rating, @simage)
                `)
      ).recordset[0].id;

    for (let artistName of authornames) {
      let artistResult = await pool
        .request()
        .input("artistName", sql.VarChar, artistName)
        .query("SELECT id FROM ARTIST WHERE aname = @artistName");

      let artistId = artistResult.recordset.length
        ? artistResult.recordset[0].id
        : (await pool.request()
          .input("artistName", sql.VarChar, artistName)
          .query("INSERT INTO ARTIST (aname) OUTPUT INSERTED.id VALUES (@artistName)")
        ).recordset[0].id;


      let linkCheck = await pool
        .request()
        .input("songId", sql.Int, songId)
        .input("artistId", sql.Int, artistId)
        .query(
          "SELECT 1 FROM songsANDartist WHERE songsid = @songId AND artistid = @artistId"
        );

      if (linkCheck.recordset.length === 0) {
        await pool
          .request()
          .input("songId", sql.Int, songId)
          .input("artistId", sql.Int, artistId)
          .query(
            "INSERT INTO songsANDartist (songsid, artistid) VALUES (@songId, @artistId)"
          );
      }
    }


    let tasteCheck = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("songId", sql.Int, songId)
      .query(
        "SELECT 1 FROM TASTE WHERE userid = @userId AND songsid = @songId"
      );

    if (tasteCheck.recordset.length === 0) {
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("songId", sql.Int, songId)
        .query("INSERT INTO TASTE (userid, songsid) VALUES (@userId, @songId)");
    } else {
      return res.status(400).json({ message: "Song already liked!" });
    }

    await transaction.commit();
    res.status(200).json({ message: "Song liked successfully!" });
  } catch (error) {
    console.error("Error liking song:", error);
    if (transaction) {
      await transaction.rollback();
    }
    res
      .status(500)
      .json({ message: "Error liking song", error: error.message });
  }
});

//liked songs
app.get("/likedsongs", async (req, res) => {
  try {
    const { name } = req.query; // Getting name from query params

    const query = `
            SELECT 
                s.id AS songsid, 
                s.stitle,  
                g.gname AS genre,
 STRING_AGG(a.aname, ', ') AS artist_name , 
alb.aname AS album_name, 
s.trackuri as trackuri
            FROM taste
            JOIN users u ON u.id = taste.userid
            JOIN songs s ON s.id = taste.songsid
            JOIN genre g ON s.sgenre = g.id
            join album alb on alb.id=s.salbumid
            LEFT JOIN songsANDartist sa ON s.id = sa.songsid
            LEFT JOIN artist a ON sa.artistid = a.id
            WHERE u.uname = @name
            GROUP BY s.id, s.stitle, g.gname, alb.aname,s.trackuri;
        `;

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("name", sql.VarChar, name);

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching liked songs", error: error.message });
  }
});

app.get("/playlistsongs", async (req, res) => {
  try {
    const { playlistid } = req.query; // Get playlist ID from query params

    if (!playlistid) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    const query = `SELECT * FROM PlaylistSongsView psv join SONGS s on  psv.songid = s.id where playlistid = @playlistid`;
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("playlistid", sql.Int, playlistid);

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching playlist songs", error: error.message });
  }
});

app.get("/liked-genre-songs", async (req, res) => {
  try {
    const { userid, genre } = req.query;

    if (!userid || !genre) {
      return res
        .status(400)
        .json({ message: "User ID and genre are required" });
    }

    const query = `
            SELECT s.id AS songid, s.stitle AS songtitle, g.gname AS genre, s.srating
            FROM TASTE t
            JOIN SONGS s ON t.songsid = s.id
            JOIN GENRE g ON s.sgenre = g.id
            WHERE t.userid = @userid AND g.gname = @genre;
        `;

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("userid", sql.Int, userid);
    request.input("genre", sql.VarChar, genre);

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching liked songs", error: error.message });
  }
});

app.get("/liked-songs-by-artist", async (req, res) => {
  try {
    const { userid, artist } = req.query;

    if (!userid || !artist) {
      return res
        .status(400)
        .json({ message: "User ID and artist name are required" });
    }

    const query = `
            SELECT s.id AS songid, s.stitle AS songtitle, a.aname AS artist, s.srating
            FROM TASTE t
            JOIN SONGS s ON t.songsid = s.id
            JOIN songsANDartist sa ON s.id = sa.songsid
            JOIN ARTIST a ON sa.artistid = a.id
            WHERE t.userid = @userid AND a.aname = @artist;
        `;

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("userid", sql.Int, userid);
    request.input("artist", sql.VarChar, artist);

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching liked songs by artist",
        error: error.message,
      });
  }
});

app.get("/playlist-songs-by-genre", async (req, res) => {
  try {
    const { userid, genre, playlist } = req.query;

    if (!userid || !genre || !playlist) {
      return res
        .status(400)
        .json({ message: "User ID, genre, and playlist name are required" });
    }

    const query = `
            SELECT s.id AS songid, s.stitle AS songtitle, g.gname AS genre, p.ptitle AS playlist
            FROM PLAYLIST_S ps
            JOIN SONGS s ON ps.songsid = s.id
            JOIN GENRE g ON s.sgenre = g.id
            JOIN PLAYLIST p ON ps.playlistid = p.id
            WHERE p.userid = @userid AND g.gname = @genre AND p.ptitle = @playlist;
        `;

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("userid", sql.Int, userid);
    request.input("genre", sql.VarChar, genre);
    request.input("playlist", sql.VarChar, playlist);

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching playlist songs by genre",
        error: error.message,
      });
  }
});

app.get("/friends", async (req, res) => {
  try {
    const { userId } = req.query; // Get userId from query parameters

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const query = `
            SELECT u.id AS friendId, u.uname AS friendName
            FROM FRIENDS f
            JOIN USERS u ON 
                (f.user1 = @userId AND u.id = f.user2) OR 
                (f.user2 = @userId AND u.id = f.user1)
        `;

    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(query);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res
      .status(500)
      .json({ message: "Error fetching friends", error: error.message });
  }
});

app.post("/addfriends", async (req, res) => {
  try {
    const { user1, user2 } = req.body; // Get user IDs from request body

    if (!user1 || !user2) {
      return res
        .status(400)
        .json({ message: "Both user1 and user2 are required" });
    }

    if (user1 === user2) {
      return res
        .status(400)
        .json({ message: "A user cannot be friends with themselves" });
    }

    const pool = await sql.connect(config);

    // Check if the friendship already exists
    const checkFriendship = await pool
      .request()
      .input("user1", sql.Int, user1)
      .input("user2", sql.Int, user2).query(`
                SELECT * FROM FRIENDS 
                WHERE (user1 = @user1 AND user2 = @user2) 
                   OR (user1 = @user2 AND user2 = @user1)
            `);

    if (checkFriendship.recordset.length > 0) {
      return res.status(400).json({ message: "Friendship already exists" });
    }

    await pool
      .request()
      .input("user1", sql.Int, user1)
      .input("user2", sql.Int, user2)
      .query("INSERT INTO FRIENDS (user1, user2) VALUES (@user1, @user2)");

    res.status(201).json({ message: "Friendship added successfully!" });
  } catch (error) {
    console.error("Error adding friends:", error);
    res
      .status(500)
      .json({ message: "Error adding friends", error: error.message });
  }
});

app.get("/friendssongs", async (req, res) => {
  try {
    const { userId } = req.query; // Get userId from query parameters

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const query = `
           SELECT DISTINCT 
    s.id AS songid,
    s.stitle AS songtitle,
    g.gname AS genre,
    STRING_AGG(a.aname, ', ') AS artist_name,
    al.aname AS album_name,
    s.srating AS rating,
    s.simage AS image_url,
    s.trackuri AS track_uri
 
FROM FRIENDS f
JOIN TASTE t ON (f.user1 = t.userid OR f.user2 = t.userid) 
JOIN SONGS s ON t.songsid = s.id
LEFT JOIN genre g ON s.sgenre = g.id
LEFT JOIN album al ON s.salbumid = al.id
LEFT JOIN songsANDartist sa ON s.id = sa.songsid
LEFT JOIN artist a ON sa.artistid = a.id
WHERE (f.user1 = @userId OR f.user2 = @userId) 
AND t.userid <> @userId  
AND a.aname IS NOT NULL
GROUP BY 
    s.id,
    s.stitle,
    g.gname,
    al.aname,
    s.srating,
    s.simage,
    s.trackuri

            

        `;

    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(query);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching friends' songs:", error);
    res
      .status(500)
      .json({ message: "Error fetching friends' songs", error: error.message });
  }
});

app.delete("/removefriend", async (req, res) => {
  try {
    const { userId, friendId } = req.body; // Get userId and friendId from request body

    if (!userId || !friendId) {
      return res.status(400).json({ message: "Both User ID and Friend ID are required" });
    }

    const query = `
            DELETE FROM FRIENDS
            WHERE (user1 = @userId AND user2 = @friendId) 
               OR (user1 = @friendId AND user2 = @userId);
        `;

    const pool = await sql.connect(config);
    await pool.request()
      .input("userId", sql.Int, userId)
      .input("friendId", sql.Int, friendId)
      .query(query);

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ message: "Error removing friend", error: error.message });
  }
});


app.get("/topartistsongs", async (req, res) => {
  const { id } = req.query;
  const userId = id;

  if (!userId || isNaN(userId)) {
    console.log("Invalid User ID:", id);
    return res.status(400).json({ error: "Invalid User ID" });
  }

  try {
    const pool = await sql.connect();

    const songsQuery = `
      SELECT DISTINCT s.id AS songid, s.stitle, s.trackuri
      FROM SONGS s
      JOIN SONGSANDARTIST sa ON s.id = sa.songsid
      WHERE sa.artistid IN (SELECT sa.artistid FROM SONGSANDARTIST sa JOIN TASTE t ON sa.songsid = t.songsid WHERE t.userid = @UserID)
      AND s.id NOT IN (SELECT songsid FROM TASTE WHERE userid = @UserID)
      AND s.trackuri IS NOT NULL; 
    `;

    const songsResult = await pool.request().input("UserID", sql.Int, userId).query(songsQuery);

    console.log("Fetched Songs from DB:", songsResult.recordset); // Debugging log

    res.json(songsResult.recordset);
  } catch (error) {
    console.error("Error fetching top artist songs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/topgenresongs", async (req, res) => {
  const { id } = req.query;
  const userId = id;// Convert id to a number
  console.log("Received ID:", id);
  console.log("Parsed User ID:", userId);

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "Invalid User ID" });
  }
  try {
    const pool = await sql.connect(); 
    const topGenresQuery = `
          SELECT TOP 3 s.sgenre, COUNT(t.songsid) AS like_count
          FROM TASTE t
          JOIN SONGS s ON t.songsid = s.id
          WHERE t.userid = @UserID
          GROUP BY s.sgenre
          ORDER BY like_count DESC;
      `;

    const topGenresResult = await pool
      .request()
      .input("UserID", sql.Int, id) 
      .query(topGenresQuery);

    if (topGenresResult.recordset.length === 0) {
      return res.json([]);
    }

    // Extract genre names safely
    const genreNames = topGenresResult.recordset.map(row => `'${row.sgenre}'`).join(",");

    if (!genreNames) {
      return res.json([]);
    }

    // Fetch songs by these top genres, excluding already liked songs
    const songsQuery = `
         
          SELECT DISTINCT s.id AS songid, s.stitle, s.sgenre, s.salbumid, s.srating, s.trackuri
          FROM SONGS s
          JOIN SONGSANDARTIST sa ON s.id = sa.songsid
         WHERE s.sgenre IN (${genreNames})
          AND s.id NOT IN (SELECT songsid FROM TASTE WHERE userid = @UserID)
          AND s.trackuri IS NOT NULL;  
      `;

    const songsResult = await pool
      .request()
      .input("UserID", sql.Int, id) 
      .query(songsQuery);

    res.json(songsResult.recordset);
  } catch (error) {
    console.error("Error fetching top genre songs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/topartistandgenresongs", async (req, res) => {
  const { id } = req.query;
  const userId = id; 

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "Invalid User ID" });
  }
  try {
    const pool = await sql.connect(); 

    // Get the top 3 artists liked by the user
    const topArtistsQuery = `
          SELECT TOP 3 sa.artistid, COUNT(t.songsid) AS like_count
          FROM TASTE t
          JOIN SONGSANDARTIST sa ON t.songsid = sa.songsid
          WHERE t.userid = @UserID
          GROUP BY sa.artistid
          ORDER BY like_count DESC;
      `;

    const topArtistsResult = await pool
      .request()
      .input("UserID", sql.Int, id) 
      .query(topArtistsQuery);

    // Get the top 3 genres liked by the user
    const topGenresQuery = `
          SELECT TOP 3 s.sgenre, COUNT(t.songsid) AS like_count
          FROM TASTE t
          JOIN SONGS s ON t.songsid = s.id
          WHERE t.userid = @UserID
          GROUP BY s.sgenre
          ORDER BY like_count DESC;
      `;

    const topGenresResult = await pool
      .request()
      .input("UserID", sql.Int, id) 
      .query(topGenresQuery);

    if (topArtistsResult.recordset.length === 0 && topGenresResult.recordset.length === 0) {
      return res.json([]);
    }

    // Extract artist IDs and genre names safely
    const artistIds = topArtistsResult.recordset.map(row => row.artistid).join(",");
    const genreNames = topGenresResult.recordset.map(row => `'${row.sgenre}'`).join(",");

    if (!artistIds && !genreNames) {
      return res.json([]);
    }

    let whereClause = [];
    if (artistIds) whereClause.push(`sa.artistid IN (${artistIds})`);
    if (genreNames) whereClause.push(`s.sgenre IN (${genreNames})`);

    // Fetch songs by top artists and genres, excluding already liked songs
    const songsQuery = `
       SELECT DISTINCT s.id AS songid, s.stitle, s.sgenre, s.salbumid, s.srating, s.trackuri
          FROM SONGS s
          JOIN SONGSANDARTIST sa ON s.id = sa.songsid
          WHERE (${whereClause.join(" OR ")})
          AND s.id NOT IN (SELECT songsid FROM TASTE WHERE userid = @UserID)
          AND s.trackuri IS NOT NULL; 
         
      `;

    const songsResult = await pool
      .request()
      .input("UserID", sql.Int, id) 
      .query(songsQuery);

    res.json(songsResult.recordset);
  } catch (error) {
    console.error("Error fetching top artist and genre songs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/addsong", async (req, res) => {
  let transaction;
  try {
    const {
      stitle,
      genrename,
      albumname,
      rating,
      simage,
      trackUri,
      userId,
      authornames,
    } = req.body;
    console.log("Adding song:", stitle, "for user:", userId);

    const pool = await sql.connect(config);
    transaction = new sql.Transaction(pool);
    await transaction.begin();

   
    let genreResult = await pool
      .request()
      .input("genrename", sql.VarChar, genrename)
      .query("SELECT id FROM GENRE WHERE gname = @genrename");

    let genreId = genreResult.recordset.length
      ? genreResult.recordset[0].id
      : (await pool.request()
        .input("genrename", sql.VarChar, genrename)
        .query("INSERT INTO GENRE (gname) OUTPUT INSERTED.id VALUES (@genrename)")
      ).recordset[0].id;

   
    let albumResult = await pool
      .request()
      .input("albumname", sql.VarChar, albumname)
      .query("SELECT id FROM ALBUM WHERE aname = @albumname");

    let albumId = albumResult.recordset.length
      ? albumResult.recordset[0].id
      : (await pool.request()
        .input("albumname", sql.VarChar, albumname)
        .query("INSERT INTO ALBUM (aname) OUTPUT INSERTED.id VALUES (@albumname)")
      ).recordset[0].id;

   
    let songResult = await pool
      .request()
      .input("trackUri", sql.VarChar, trackUri)
      .query("SELECT id FROM SONGS WHERE trackuri = @trackUri");

    let songId = songResult.recordset.length
      ? songResult.recordset[0].id
      : (await pool.request()
        .input("stitle", sql.VarChar, stitle)
        .input("trackUri", sql.VarChar, trackUri)
        .input("genreId", sql.Int, genreId)
        .input("albumId", sql.Int, albumId)
        .input("rating", sql.Float, rating || 0)
        .input("simage", sql.VarChar, simage)
        .query(`
                    INSERT INTO SONGS (stitle, trackuri, sgenre, salbumid, srating, simage)
                    OUTPUT INSERTED.id
                    VALUES (@stitle, @trackUri, @genreId, @albumId, @rating, @simage)
                `)
      ).recordset[0].id;

   
    for (let artistName of authornames) {
      let artistResult = await pool
        .request()
        .input("artistName", sql.VarChar, artistName)
        .query("SELECT id FROM ARTIST WHERE aname = @artistName");

      let artistId = artistResult.recordset.length
        ? artistResult.recordset[0].id
        : (await pool.request()
          .input("artistName", sql.VarChar, artistName)
          .query("INSERT INTO ARTIST (aname) OUTPUT INSERTED.id VALUES (@artistName)")
        ).recordset[0].id;

    
      let linkCheck = await pool
        .request()
        .input("songId", sql.Int, songId)
        .input("artistId", sql.Int, artistId)
        .query(
          "SELECT 1 FROM songsANDartist WHERE songsid = @songId AND artistid = @artistId"
        );

      if (linkCheck.recordset.length === 0) {
        await pool
          .request()
          .input("songId", sql.Int, songId)
          .input("artistId", sql.Int, artistId)
          .query(
            "INSERT INTO songsANDartist (songsid, artistid) VALUES (@songId, @artistId)"
          );
      }
    }


    await transaction.commit();
    res.status(200).json({ message: "Song added to songs successfully!" });
  } catch (error) {
    console.error("Error liking song:", error);
    if (transaction) {
      await transaction.rollback();
    }
    res
      .status(500)
      .json({ message: "Error liking song", error: error.message });
  }
});

const clientId = "2cbadd009ef8428285512f390151a730";
const clientSecret = "f8e498771c7f42f29fccfa9a72083555";
const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search";
// Function to get Spotify access token


async function getSpotifyAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const data = await response.json();
  return data.access_token;
}


app.get("/api/spotify-token-search", async (req, res) => {
  try {
    const accessToken = await getSpotifyAccessToken();
    if (accessToken) {
      res.json({ access_token: accessToken });
    } else {
      res.status(400).json({ error: "Failed to get access token" });
    }
  } catch (error) {
    console.error("Error fetching access token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to fetch song recommendations based on a name
app.get("/searchairec", async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: "Please provide a name query parameter." });
  }

  try {
    const accessToken = await getSpotifyAccessToken();
    const searchUrl = `${SPOTIFY_SEARCH_URL}?q=${encodeURIComponent(name)}&type=track&limit=1`;

    const response = await fetch(searchUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    if (!data.tracks || !data.tracks.items.length) {
      return res.status(404).json({ error: "No songs found." });
    }

    const songs = data.tracks.items.map((track) => ({
      name: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      album: track.album.name,
      uri: track.uri,
      image: track.album.images[0]?.url
    }));

    res.json({ songs });
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});