const Service = require('../models/Service'); 

// 1. Get All Services (List only text data - FAST 🚀)
const getServices = async (req, res) => {
  try {
    const services = await Service.find().select('-image').sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    console.error("Error in getServices:", error);
    res.status(500).json({ message: "Server Error fetching data" });
  }
};

// 2. Serve Image File (Updated with Better Error Handling & Logs)
const getServiceImage = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service || !service.image) {
       console.log(`Image not found for ID: ${req.params.id}`);
       return res.status(404).send('Image not found');
    }

    // Check if it's a Base64 string
    const imageString = service.image;
    
    // සමහර විට "data:image..." කෑල්ල නැතුව කෙලින්ම Base64 තියෙන්න පුළුවන්.
    // අපි ඒක check කරමු.
    let mimeType = 'image/png'; // Default
    let base64Data = imageString;

    if (imageString.includes(",")) {
        const parts = imageString.split(",");
        // "data:image/jpeg;base64" කොටසින් Type එක ගන්නවා
        if(parts[0].includes(":")) {
            mimeType = parts[0].split(":")[1].split(";")[0];
        }
        base64Data = parts[1];
    }

    const imgBuffer = Buffer.from(base64Data, 'base64');

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': imgBuffer.length
    });
    res.end(imgBuffer);

  } catch (error) {
    console.error(`Error serving image for ID ${req.params.id}:`, error);
    res.status(500).send('Server Error');
  }
};

// 3. Create Service
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

module.exports = { getServices, getServiceImage, createService, deleteService };