// හරියටම බලන්න මේ පාත් එක හරිද කියලා (../models/Service)
const Service = require('../models/Service'); 

// 1. Get All Services (මේකේ තමයි 500 Error එක එන්නේ)
const getServices = async (req, res) => {
  try {
    // Database එකෙන් Data ගන්නවා
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    console.error("Error in getServices:", error); // Terminal එකේ Error එක පෙන්නන්න
    res.status(500).json({ message: "Server Error fetching data" });
  }
};

// 2. Create Service (මේකේ තමයි 400 Error එක එන්නේ)
const createService = async (req, res) => {
  const { title, description, price, category, image } = req.body;

  // Validation Check
  if (!title || !description || !price || !category || !image) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const newService = new Service({ 
        title, 
        description, 
        price: Number(price), // Price එක Number එකක් බවට හරවන්න
        category, 
        image 
    });
    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    console.error("Error in createService:", error);
    res.status(400).json({ message: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getServices, createService, deleteService };