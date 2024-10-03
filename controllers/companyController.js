const Company = require("../models/clients/companyModel");

exports.addingClient = async (req, res) => {
    try {
        // Check if license field is required
        if (!req.files || !req.files.license || req.files.license.length === 0) {
            return res.status(400).send({ message: "license field is required" });
        }


        const generateUniqueCode=async()=>{
            let code;
            let company;
            do{
                code=Math.floor(100000+Math.random()*900000).toString()
                company=await Company.findOne({companyCode:code})
            }while(company)
                return code;
        }
        const uniqueCode=await generateUniqueCode()
        // Construct company data
        const companyData = {
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone,
            email: req.body.email,
            websiteLink: req.body.websiteLink,
            industry: req.body.industry,
            description: req.body.description,
            CEO: req.body.CEO,
            logo: req.files.logo ? req.files.logo[0].filename : undefined, // Use filename instead of path
            license: req.files.license.map(file => ({
                fileName: file.originalname,
                path: file.filename, // Use filename instead of path
                fileType: file.mimetype
            })),
            companyCode:uniqueCode,
            registrationDate:req.body.registrationDate,
            contractDuration:req.body.contractDuration
        };

        // Create and save company document
        const company = await new Company(companyData);
        await company.save();

        res.status(200).send({
            message: "Company Created Successfully",
            company
        });
    } catch (error) {
        console.error("Error creating company:", error);
        res.status(500).send({ message: "Error occurred", error });
    }
};


exports.getCompany=async(req,res)=>{
    try {
        const company=await Company.find()
        res.status(200).send(company)
    } catch (error) {
        res.status(500).send("Unable to Fetch companies",error)
    }
}

exports.deleteCompany = async (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).send("Company ID is required");
    }

    try {
        const result = await Company.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).send("Company not found");
        }

        res.status(200).send("Company deleted successfully");
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).send("An error occurred while deleting the company");
    }
};

