// Emergency teams for each disaster type
const emergencyTeams = {
    Earthquake: {
        teams: ["Urban Search & Rescue", "Medical Teams", "Structural Engineers", "Heavy Equipment"],
        eta: "15-30 minutes"
    },
    Flood: {
        teams: ["Water Rescue Squad", "Medical Boats", "Sandbagging Crews", "Power Restoration"],
        eta: "20-45 minutes"
    },
    Wildfire: {
        teams: ["Firefighters", "Helicopters", "Evacuation Teams", "Air Tankers"],
        eta: "10-25 minutes"
    },
    Hurricane: {
        teams: ["National Guard", "Evacuation Teams", "Power Restoration", "Debris Clearance"],
        eta: "30-60 minutes"
    },
    Tornado: {
        teams: ["Search & Rescue", "Medical Teams", "Structural Engineers"],
        eta: "20-45 minutes"
    },
    Industrial_Accident: {
        teams: ["Hazmat Team", "Firefighters", "Medical Teams"],
        eta: "15-30 minutes"
    },
    Transport_Accident: {
        teams: ["Jaws of Life Team", "Ambulances", "Police"],
        eta: "10-25 minutes"
    },
    Terrorism: {
        teams: ["SWAT Team", "Bomb Squad", "FBI Crisis Response"],
        eta: "Immediate (High Alert)"
    },
    Disease_Outbreak: {
        teams: ["Epidemiologists", "Mobile Hospitals", "Medical Teams"],
        eta: "1-2 hours"
    },
    Other: {
        teams: ["Police", "Ambulance", "Fire Department"],
        eta: "Varies"
    }
};

let map;
let geocoder;
let marker = null;
let notificationTimeout;

// Initialize map
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 2,
        center: { lat: 0, lng: 0 },
    });

    geocoder = new google.maps.Geocoder();

    // Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(userLocation);
                map.setZoom(12);
                // Add temporary marker for user's location
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "Your Current Location",
                    icon: {
                        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    }
                });
            },
            () => {
                alert("Geolocation failed. Defaulting to map view.");
            }
        );
    }

    // Click to set location (with place name and coordinates)
    map.addListener("click", (event) => {
        // Remove previous marker if exists
        if (marker) {
            marker.setMap(null);
        }
        
        // Add new red marker
        marker = new google.maps.Marker({
            position: event.latLng,
            map: map,
            title: "Selected Disaster Location",
            icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            }
        });
        
        // Show coordinates immediately
        document.getElementById("coordinates").textContent = 
            `Lat: ${event.latLng.lat().toFixed(6)}, Lng: ${event.latLng.lng().toFixed(6)}`;
        
        // Geocode for address
        geocodeLatLng(event.latLng);
    });
}

// Convert Lat/Lng to Place Name
function geocodeLatLng(latLng) {
    geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK") {
            if (results[0]) {
                document.getElementById("location").value = results[0].formatted_address;
            } else {
                document.getElementById("location").value = "Unknown location";
            }
        } else {
            document.getElementById("location").value = "Error: Could not determine address";
        }
    });
}

// Audio elements for sound effects
const createAudio = () => {
    const audio = new Audio();
    audio.src = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...";
    return audio;
};

const tickSound = createAudio();
const alertSound = createAudio();

// Show notification

function showNotification(content) {
    const notification = document.getElementById("responseNotification");
    const contentDiv = document.getElementById("responseContent");
    const countdownDiv = document.getElementById("countdown");
    
    contentDiv.innerHTML = content;
    notification.style.display = "block";
    
    // Clear any existing timeout
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
    
    // Start countdown from 10
    let seconds = 10;
    updateCountdown();
    
    function updateCountdown() {
        // Update display
        countdownDiv.textContent = `Closing in ${seconds}...`;
        
        // Visual effects
        if (seconds <= 3) {
            countdownDiv.classList.add("urgent");
            if (seconds === 3) alertSound.play().catch(e => console.log("Audio blocked:", e));
        } else {
            tickSound.play().catch(e => console.log("Audio blocked:", e));
        }
        
        seconds--;
        
        if (seconds >= 0) {
            setTimeout(updateCountdown, 1000);
        } else {
            hideNotification();
        }
    }
    
    // Auto-hide after 10 seconds (fallback)
    notificationTimeout = setTimeout(() => {
        hideNotification();
    }, 10000);
}

// Hide notification and reset form
function hideNotification() {
    const notification = document.getElementById("responseNotification");
    notification.style.display = "none";
    resetForm();
}

// Reset the form
function resetForm() {
    document.getElementById("reportForm").reset();
    document.getElementById("coordinates").textContent = "Lat/Lng: Not selected";
    if (marker) {
        marker.setMap(null);
        marker = null;
    }
}

// Form submission
document.getElementById("reportForm").addEventListener("submit", (e) => {
    e.preventDefault();
    
    const disasterType = document.getElementById("disasterType").value;
    const location = document.getElementById("location").value;
    const coordinates = document.getElementById("coordinates").textContent;
    const description = document.getElementById("description").value;
    
    // Get emergency response details
    const response = emergencyTeams[disasterType] || emergencyTeams.Other;
    
    // Create response content
    const responseContent = `
        <h3>🚑 Emergency Response Activated</h3>
        <p><strong>Disaster:</strong> ${disasterType}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Coordinates:</strong> ${coordinates.replace("Lat/Lng: ", "")}</p>
        <p><strong>Teams Dispatched:</strong></p>
        <ul>
            ${response.teams.map(team => `<li>${team}</li>`).join("")}
        </ul>
        <p><strong>ETA:</strong> ${response.eta}</p>
        <p><em>Help is on the way! Stay safe.</em></p>
    `;
    
    // Show the notification
    showNotification(responseContent);
    
    // In a real app, you would send this data to a server here
    console.log("Disaster reported:", { 
        disasterType, 
        location, 
        coordinates,
        description 
    });
});

// Close notification when X is clicked
document.querySelector(".close-notification").addEventListener("click", hideNotification);

// Load Google Maps
function loadMap() {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDPzfzPe9p8REyDmNi7dVu6jvflrDzAeUA&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

loadMap();