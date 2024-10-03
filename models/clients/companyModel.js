const mongoose=require('mongoose')
const companySchema=mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  address:{
   type:String,
   required:true
  },
  phone:{
    type:String,
    required:true
  },
  registrationDate:{
   type:Date,
   default:Date.now
  },
  email:{
    type:String,
    required:true
  },
  industry:{
    type:String,
    required:true
  },
  websiteLink:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  CEO:{
    type:String,
    required:true
  },
  companyCode:{
  type:String,
  required:true,
  unique:true
  },
  license:[
    {
        filename: String,  
        path: String,      
        fileType: String, 
        uploadDate: {
          type: Date,
          default: Date.now
        }
    }
  ],
  logo:{
    type:String
  },
  contractDuration:{
    type:String
  }
  
})

const company=mongoose.model("company",companySchema)
module.exports=company