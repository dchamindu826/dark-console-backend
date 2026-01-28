const Service = require('../models/Service'); 

// 1. Get All Services (List only text data - Super Fast 🚀)
const getServices = async (req, res) => {
  try {
    // Image field eka ain karala anith data tika evanawa
    const services = await Service.find().select('-image').sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    console.error("Error in getServices:", error);
    res.status(500).json({ message: "Server Error fetching data" });
  }
};

// 2. Serve Image File (මේකෙන් තමයි Image එක පෙන්නන්නේ)
const getServiceImage = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service || !service.image) {
       return res.status(404).send('Image not found');
    }

    // Base64 String එක නියම Image එකක් බවට හරවනවා
    // Format eka: "data:image/png;base64,....."
    const imageParts = service.image.split(",");
    
    if (imageParts.length < 2) {
        return res.status(400).send("Invalid Image Data");
    }

    // Image Type eka hoyagannawa (png/jpg/jpeg)
    const mimeType = imageParts[0].split(":")[1].split(";")[0]; 
    const imgBuffer = Buffer.from(imageParts[1], 'base64');

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': imgBuffer.length
    });
    res.end(imgBuffer);

  } catch (error) {
    console.error("Error serving image:", error);
    res.status(500).send('Server Error');
  }
};

// 3. Create Service (Uploads work as usual ✅)
const createService = async (req, res) => {
  const { title, description, price, category, image } = req.body;

  if (!title || !description || !price || !category || !image) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const newService = new Service({ 
        title, 
        description, 
        price: Number(price), 
        category, 
        image // 🔥 Image eka DB ekatama save wenawa (Base64)
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

module.exports = { getServices, getServiceImage, createService, deleteService };