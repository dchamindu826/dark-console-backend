const Event = require('../models/Event');

// 1. Create Event
const createEvent = async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 2. Get All Events
const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Delete Event
const deleteEvent = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: "Event Deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Join Crew (ROBUST FIX)
const joinCrew = async (req, res) => {
    const { eventId, crewCode, userId, userName } = req.body;
    
    console.log("Attempting Join:", { eventId, crewCode, userId });

    try {
        const event = await Event.findById(eventId);
        if(!event) return res.status(404).json({ message: "Event not found" });

        // Find the crew by code
        const crew = event.crews.find(c => c.crewCode === crewCode);
        
        if(!crew) return res.status(404).json({ message: "Invalid Crew Code" });

        // Check if user is ALREADY in the crew
        const isMember = crew.members.some(m => m.userId === userId);
        if(isMember) return res.status(400).json({ message: "You are already in this crew!" });

        // --- FIX: HANDLE NULL LIMIT ---
        // If maxCrewMembers is null/0, default to 4
        const maxMembers = event.maxCrewMembers && event.maxCrewMembers > 0 ? event.maxCrewMembers : 4;

        // Check Limit
        if(crew.members.length >= maxMembers) {
            return res.status(400).json({ message: `Crew is Full! (Max: ${maxMembers})` });
        }

        // Add Member
        crew.members.push({ userId, name: userName });
        await event.save();
        
        console.log("User Joined Crew Successfully");
        res.json({ message: "Joined Crew Successfully!" });

    } catch (error) {
        console.error("Join Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createEvent, getEvents, deleteEvent, joinCrew };