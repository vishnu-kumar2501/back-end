var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var schema =new Schema(
    {
        username:{type:String,require:true},
        TotalMoney:{type:Number},
        TransactionsNotes:[Object]
    }
)

module.exports=mongoose.model('Wallet',schema);