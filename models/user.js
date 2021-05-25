var mongoose=require('mongoose');
var Schema = mongoose.Schema;
var bcrypt =require('bcrypt');

var schema =new Schema(
    {
        username:{type:String,require:true},
        email:{type:String,require:true},
        password:{type:String,require:true},
        creation_dt:{type:String,require:true}
    }
)

schema.statics.hashPassword =function hashPassword(password)
{
    return bcrypt.hashSync(password,10);
}  
schema.methods.isValid=function(hashedpassword)
{
    return bcrypt.compareSync(hashedpassword,this.password);
}
module.exports=mongoose.model('User',schema);