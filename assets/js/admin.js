// Initialize charts and data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadDoctors();
    loadAppointments();
    loadReviews();
});

// Mock data for demonstration
const mockData = {
    doctors: [
        { id: 1, name: 'Dr. Smith', specialization: 'Cardiology', city: 'New York', rating: 4.5, appointments: 150, status: 'active' },
        { id: 2, name: 'Dr. Johnson', specialization: 'Neurology', city: 'Boston', rating: 4.8, appointments: 120, status: 'active' },
        // ...existing mock data...
    ],
    users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', appointments: 5, status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', appointments: 3, status: 'active' },
        // ...existing mock data...
    ],
    appointments: [
        { id: 1, doctorId: 1, userId: 1, date: '2024-01-20', status: 'confirmed' },
        { id: 2, doctorId: 2, userId: 2, date: '2024-01-21', status: 'pending' },
        // ...existing mock data...
    ],
    reviews: [
        { id: 1, doctorId: 1, userId: 1, rating: 5, comment: 'Excellent service', status: 'approved' },
        { id: 2, doctorId: 2, userId: 2, rating: 4, comment: 'Good experience', status: 'pending' },
        // ...existing mock data...
    ]
};

function loadDoctors() {
    const doctorsList = document.getElementById('doctors-list');
    const html = mockData.doctors.map(doctor => `
        <div class="doctor-item grid-item">
            <h3>${doctor.name}</h3>
            <p>Specialization: ${doctor.specialization}</p>
            <p>City: ${doctor.city}</p>
            <p>Rating: ${doctor.rating}/5</p>
            <div class="actions" style="display: flex; gap: 10px; margin-top: 10px;">
                <button onclick="editDoctor(${doctor.id})">Edit</button>
                <button onclick="toggleDoctorStatus(${doctor.id})">${doctor.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                <button onclick="deleteDoctor(${doctor.id})">Delete</button>
            </div>
        </div>
    `).join('');
    doctorsList.innerHTML = html;
}

function loadAppointments() {
    const appointmentsList = document.getElementById('appointments-list');
    const html = mockData.appointments.map(apt => {
        const doctor = mockData.doctors.find(d => d.id === apt.doctorId);
        const user = mockData.users.find(u => u.id === apt.userId);
        return `
            <div class="appointment-item grid-item">
                <h3>Appointment #${apt.id}</h3>
                <p>Doctor: ${doctor.name}</p>
                <p>Patient: ${user.name}</p>
                <p>Date: ${apt.date}</p>
                <p>Status: ${apt.status}</p>
                <div class="actions">
                    <button onclick="updateAppointmentStatus(${apt.id}, 'confirmed')">Confirm</button>
                    <button onclick="updateAppointmentStatus(${apt.id}, 'cancelled')">Cancel</button>
                    <button onclick="rescheduleAppointment(${apt.id})">Reschedule</button>
                </div>
            </div>
        `;
    }).join('');
    appointmentsList.innerHTML = html;
}

function loadReviews() {
    const reviewsList = document.getElementById('reviews-list');
    const html = mockData.reviews.map(review => {
        const doctor = mockData.doctors.find(d => d.id === review.doctorId);
        const user = mockData.users.find(u => u.id === review.userId);
        return `
            <div class="review-item grid-item">
                <h3>Review for ${doctor.name}</h3>
                <p>By: ${user.name}</p>
                <p>Rating: ${review.rating}/5</p>
                <p>Comment: ${review.comment}</p>
                <p>Status: ${review.status}</p>
                <div class="actions">
                    <button onclick="updateReviewStatus(${review.id}, 'approved')">Approve</button>
                    <button onclick="updateReviewStatus(${review.id}, 'rejected')">Reject</button>
                    <button onclick="deleteReview(${review.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
    reviewsList.innerHTML = html;
}

// CRUD Operations
function addDoctor() {
    window.location.href = 'add-doctor.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('id');
    const form = document.getElementById('edit-doctor-form');
    const statusMessage = document.getElementById('status-message');

    // Load doctor data
    try {
        const response = await fetch(`http://localhost:8080/doctors/${doctorId}`);
        const doctor = await response.json();

        // Pre-fill form
        document.getElementById('name').value = doctor.DOCTOR_NAME;
        document.getElementById('specialization').value = doctor.SPECIALIZATION;
        document.getElementById('experience').value = doctor.EXPERIENCE;
        document.getElementById('address').value = doctor.ADDRESS;
        document.getElementById('city').value = doctor.CITY;
        document.getElementById('rating').value = doctor.INITIAL_RATING;
    } catch (error) {
        console.error('Failed to fetch doctor data:', error);
        statusMessage.textContent = 'Failed to load doctor data.';
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedDoctor = {
            DOCTOR_NAME: document.getElementById('name').value,
            SPECIALIZATION: document.getElementById('specialization').value,
            EXPERIENCE: document.getElementById('experience').value,
            ADDRESS: document.getElementById('address').value,
            CITY: document.getElementById('city').value,
            INITIAL_RATING: parseFloat(document.getElementById('rating').value)
        };

        try {
            const response = await fetch(`http://localhost:8080/doctors/${doctorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedDoctor)
            });

            if (response.ok) {
                statusMessage.textContent = 'Doctor updated successfully! Redirecting to the admin dashboard...';
                // Add a small delay before redirect for user to see the success message
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 1500);
            } else {
                statusMessage.textContent = 'Failed to update doctor.';
            }
        } catch (error) {
            console.error('Update failed:', error);
            statusMessage.textContent = 'Error while updating doctor.';
        }
    });
});

function toggleDoctorStatus(id) {
    const doctor = mockData.doctors.find(d => d.id === id);
    doctor.status = doctor.status === 'active' ? 'inactive' : 'active';
    loadDoctors();
}

function deleteDoctor(id) {
    if (confirm('Are you sure you want to delete this doctor?')) {
        mockData.doctors = mockData.doctors.filter(d => d.id !== id);
        loadDoctors();
    }
}

function exportUserData() {
    const data = JSON.stringify(mockData.users, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-data.json';
    a.click();
}

function rescheduleAppointment(id) {
    // Open modal with date picker
    const newDate = document.getElementById('newDate').value;
    const appointment = mockData.appointments.find(a => a.id === id);
    appointment.date = newDate;
    loadAppointments();
}

// Event listeners for filters
document.getElementById('specialization-filter')?.addEventListener('change', (e) => {
    const value = e.target.value;
    const filtered = value ? mockData.doctors.filter(d => d.specialization === value) : mockData.doctors;
    loadDoctors(filtered);
});

document.getElementById('appointment-date')?.addEventListener('change', (e) => {
    const value = e.target.value;
    const filtered = value ? mockData.appointments.filter(a => a.date === value) : mockData.appointments;
    loadAppointments(filtered);
});
