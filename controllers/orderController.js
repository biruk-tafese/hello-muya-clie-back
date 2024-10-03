const order = require('../models/service-requests/orderModel');

exports.createOrder = async (req, res) => {
  try {
    const { problemDescription, orderDate, orderTime, images } = req.body;
    const newOrder = new order({
      problemDescription,
      orderDate,
      orderTime,
      images,
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await order.find();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

exports.getSingleOrder = async (req, res) => {
  try {
    const singleOrder = await order.findById(req.params.id);
    if (!singleOrder) {
      return res.status(404).json({ message: 'Service order not found.' });
    }
    res.json(singleOrder);
  } catch (error) {
    console.error('Error fetching service order:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.trackSingleOrder = async (req, res) => {
  // This method is for showing clients and service providers on the map
  res.status(501).json({ message: 'Tracking functionality not implemented yet.' });
};

exports.editSingleOrder = async (req, res) => {
  const { id } = req.params;
  const { status, notes, additionalInfo } = req.body;

  try {
    const updatedOrder = await order.findByIdAndUpdate(id, { status, notes, additionalInfo }, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error editing single order:', error);
    res.status(500).json({ message: 'Failed to edit order' });
  }
};

exports.searchOrder = async (req, res) => {
  const { clientName, serviceProviderName, serviceType } = req.query;

  const query = {};
  if (clientName) query.client = { $regex: clientName, $options: 'i' };
  if (serviceProviderName) query.serviceProvider = { $regex: serviceProviderName, $options: 'i' };
  if (serviceType) query.serviceType = { $regex: serviceType, $options: 'i' };

  try {
    const orders = await order.find(query);
    res.json(orders);
  } catch (error) {
    console.error('Error searching orders:', error);
    res.status(500).json({ message: 'Failed to search orders' });
  }
};

exports.filterOrders = async (req, res) => {
  const { status } = req.query;

  const query = {};
  if (status) query.status = status;

  try {
    const orders = await order.find(query);
    res.json(orders);
  } catch (error) {
    console.error('Error filtering orders:', error);
    res.status(500).json({ message: 'Failed to filter orders' });
  }
};

exports.getOrderLocation = async (req, res) => {
  const { id } = req.params;
  try {
    const foundOrder = await order.findById(id).populate('client serviceprovider');
    const client = foundOrder.client;
    const serviceProvider = foundOrder.serviceProvider;

    const clientLatitude = client.latitude;
    const clientLongitude = client.Longitude;
    const spLatitude = serviceProvider.latitude;
    const spLongitude = serviceProvider.longitude;

    res.status(200).json({
      clientLocation: { 
        latitude: clientLatitude,
        longitude: clientLongitude
      },
      serviceProviderLocation: {
        latitude: spLatitude,
        longitude: spLongitude
      } 
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Error fetching locations' });
  }
};