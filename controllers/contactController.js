const Contact = require("../models/contactModel");


const postContact = async (req, res) => {
    const { name, email, message } = req.body;
  
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }
  
    try {
      await Contact.create({ name, email, message });
      res.status(200).json({ message: "Message received and saved." });
    } catch (error) {
      res.status(500).json({ message: "Server error. Try again later." });
    }
  }

const getContact = async (req, res) => {
    try {
      const messages = await Contact.find().sort({ createdAt: -1 });
      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  }

  
  module.exports = {postContact,getContact}