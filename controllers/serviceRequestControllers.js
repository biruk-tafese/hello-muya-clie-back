const serviceRequest = require('../models/service-requests/serviceRequestModel');



exports.createRequest=async(req,res)=>{
  try {
    const newRequest=new  serviceRequest(req.body)
    await newRequest.save()
    res.status(200).send(newRequest)
  } catch (error) {
    res.status(500).send({
      message:"Something went wrong",
      error
    })
  }
}
exports.getAllServiceRequests = async (req,res) =>  {
    try {
        const serviceRequests = await serviceRequest.find();
        res.json(serviceRequests);
        if(serviceRequests.length===0){
         console.log("No request is found")
        }
      } catch (error) {
        console.error('Error fetching service requests:', error);
        res.status(500).json({ message: 'Failed to fetch service requests' });
      }
};

exports.updateServiceRequestStatus = async (req,res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const serviceRequests = await serviceRequest.findByIdAndUpdate(id, { status }, { new: true });
      // console.error('Error updating service request status:', serviceRequest);

      res.json(serviceRequests);
    } catch (error) {
      console.error('Error updating service request status:', error);
      res.status(500).json({ message: 'Failed to update service request status' });
    }
}

exports.addNoteToServiceRequest = async (req,res) => {
    const { id } = req.params;
  const { notes } = req.body;
  try {
    const serviceRequest = await serviceRequest.findByIdAndUpdate(id, { notes }, { new: true });
    res.json(serviceRequest);
  } catch (error) {
    console.error('Error adding notes to service request:', error);
    res.status(500).json({ message: 'Failed to add notes to service request' });
  }
}

exports.deleteServiceRequest = async (req,res) => {
    const { id } = req.params;
  try {
    await ServiceRequest.findByIdAndDelete(id);
    res.json({ message: 'Service request deleted successfully' });
  } catch (error) {
    console.error('Error deleting service request:', error);
    res.status(500).json({ message: 'Failed to delete service request' });
  }
}

exports.searchServiceRequest = async (req,res) => {
    try {
        const { clientName, status } = req.query;
        const query = {};
        if (clientName) query.clientName = { $regex: new RegExp(clientName, 'i') };
        // if (serviceProviderName) query.serviceProviderName = { $regex: new RegExp(serviceProviderName, 'i') };
        if (status) query.status = status;
    
        const serviceRequests = await ServiceRequest.find(query);
        res.json(serviceRequests);
      } catch (error) {
        console.error('Error searching service requests:', error);
        res.status(500).json({ message: 'Failed to search service requests' });
      }
}

 // Adjust the path as needed

// Route to get number of services done per month
exports.getDataByMonth=async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          date: { $exists: true },
          // Assuming you have a field to mark if the service request is completed
          status: "Completed"
        }
      },
      {
        $group: {
          _id: {
            year: { $year: { date: { $dateFromString: { dateString: "$date" } } } },
            month: { $month: { date: { $dateFromString: { dateString: "$date" } } } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          count: 1
        }
      }
    ];

    const result = await serviceRequest.aggregate(pipeline);
    res.json(result);
  } catch (error) {
    res.status(500).send({
      message:"Unable to Fetch data by month"
    })
    console.error('Error fetching services per month:', error);
    res.status(500).send('Server Error');
  }
}

exports.getRecentService= async(req,res)=>{
  try {
    const  recentService= await serviceRequest.find().sort({date:-1}).limit(5)
    res.status(200).send(recentService)
  } catch (error) {
    res.status(500).send("Error is Occured",error)
    
  }
}


