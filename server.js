const express = require('express');
const app = express();
const path = require('path');
const bodyparser = require('body-parser');
const dotenv = require('dotenv');
const {connect, connection} = require('./database');

dotenv.config();

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, './public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Doctor Routes
// GET route to fetch all doctors
app.get('/doctors', (req, res) => {
    const query = 'SELECT * FROM DOCTOR';
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching doctors:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(200).json(results); // Send all doctor data to frontend
    });
});

// DELETE doctor by ID
app.delete('/doctor/:id', (req, res) => {
    const doctorId = req.params.id;

    const deleteQuery = "DELETE FROM DOCTOR WHERE ID = ?";
    connection.query(deleteQuery, [doctorId], (err, result) => {
        if (err) {
            console.error("Error deleting doctor:", err);
            return res.status(500).json({ message: "Failed to delete doctor" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.status(200).json({ message: "Doctor deleted successfully" });
    });
});

// Get specific doctor by ID
app.get('/doctors/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT * FROM DOCTOR WHERE ID = ?';
    connection.query(query, [id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results[0]);
    });
});

// Update doctor
app.put('/doctors/:id', (req, res) => {
    const id = req.params.id;
    const updated = req.body;

    const query = `UPDATE DOCTOR SET 
        DOCTOR_NAME = ?, SPECIALIZATION = ?, EXPERIENCE = ?, 
        ADDRESS = ?, CITY = ?, INITIAL_RATING = ? 
        WHERE ID = ?`;

    const values = [
        updated.DOCTOR_NAME,
        updated.SPECIALIZATION,
        updated.EXPERIENCE,
        updated.ADDRESS,
        updated.CITY,
        updated.INITIAL_RATING,
        id
    ];

    connection.query(query, values, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true });
    });
});

app.get('/doctors/search', (req, res) => {
    const location = req.query.location;

    if (!location) {
        return res.status(400).json({ error: 'Location is required' });
    }

    const query = 'SELECT * FROM DOCTOR WHERE LOWER(CITY) = LOWER(?)';
    connection.query(query, [location], (err, results) => {
        if (err) {
            console.error('DB error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(results)
        // ✅ Even if no doctors found, send an empty array
        console.log("Doctors fetched successfully:", results);
    });
});


// Appointment Routes
// GET route to fetch all appointments
app.get('/appointments', (req, res) => {
    const query = 'SELECT * FROM APPOINTMENT';
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching appointments:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(200).json(results); // Send all appointment data to frontend
    });
});

//Post routes
app.post('/add-doctor', (req, res) => {
    const { name, specialization, experience, address, city, state, rating } = req.body;

    if (!name || !specialization || !experience || !address || !city || !state || !rating) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Insert new user into database
    const insertQuery = "INSERT INTO DOCTOR (DOCTOR_NAME, SPECIALIZATION, EXPERIENCE, ADDRESS, CITY, STATE, INITIAL_RATING) VALUES (?, ?, ?, ?, ?, ?, ?)";
    connection.query(insertQuery, [name, specialization, experience, address, city, state, rating], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error creating doctor" });
        }

        res.status(201).json({ message: "Doctor Added Successfully", userId: result.insertId });
    });
})

app.post('/contact', (req, res) => {
    const { name, email, query } = req.body;

    if (!name || !email || !query) {
        return res.status(400).json({ message: "All fields are required" });
    }   
    
    // Insert new queries into database
    const insertQuery = "INSERT INTO CONTACT (USERNAME, EMAIL, QUERY) VALUES (?, ?, ?)";
    connection.query(insertQuery, [name, email, query], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error submitting query" });
        }

        res.status(201).json({ message: "Query Submitted Successfully", userId: result.insertId });
    });
})

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Checks if user exists in the database
    const query = "SELECT * FROM USER WHERE EMAIL = ? AND PASSWORD = ?";
    connection.query(query, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.status(200).json({ message: "Login successful", user: results[0] });
    });

})

app.post('/signup', (req, res) => {
    const { name, email, password, number } = req.body;

    if (!name || !email || !password || !number) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Checks if user already exists in the database
    const checkQuery = "SELECT * FROM USER WHERE EMAIL = ?";
    connection.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Insert new user into database
        const insertQuery = "INSERT INTO USER (USERNAME, EMAIL, PASSWORD, PHONE_NUMBER) VALUES (?, ?, ?, ?)";
        connection.query(insertQuery, [name, email, password, number], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error creating user" });
            }

            res.status(201).json({ message: "User registered successfully", userId: result.insertId });
        });
    });

})

app.post('/new-appointment', (req, res) => {
    const { name, email, health_issue, date, time } = req.body;

    if (!name || !email || !health_issue || !date || !time) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Insert new user into database
    const insertQuery = "INSERT INTO APPOINTMENT (PATIENT_NAME, PATIENT_EMAIL, HEALTH_ISSUE, APPOINTMENT_DATE, APPOINTMENT_TIME) VALUES (?, ?, ?, ?, ?)";
    connection.query(insertQuery, [name, email, health_issue, date, time], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error creating user" });
        }

        res.status(201).json({ message: "Appointment Created Successfully", userId: result.insertId });
    });
})

app.post('/subscribe', (req, res) => {

})

// Get routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.get('/add-doctor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add-doctor.html'));
})
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
})

app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blog.html'));
})

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
})

app.get('/create-appointment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'appointment.html'));
})

app.get('/doctor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'doctor.html'));
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
})

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'services.html'));
})

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
})

// Start the server
connect();

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});