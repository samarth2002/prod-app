import mongoose from 'mongoose'
import { v4 as uuidv4} from 'uuid'

const subTaskSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4, required: true },
    name: { type: String, required: true },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: true,
    },
    points: { type: Number, required: true },
    link: {type: String},
    createdAt: {type: Number, default: ()=>Math.floor(Date.now()/1000), required: true},
    updatedAt: {type: Number, default: ()=>Math.floor(Date.now()/1000)}
});

const taskSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4, required: true},
    name: {type: String, required: true},
    totalPoints: {type: Number, required: true},
    subTasks: { type: [subTaskSchema], default: [] },
    createdAt: {type: Number, default: ()=> Math.floor(Date.now()/1000)},
    updatedAt: {type: Number, default: ()=>Math.floor(Date.now()/1000)},
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
    versionKey: false
})



taskSchema.pre('save', function (next){
    this.updatedAt = Math.floor(Date.now()/1000)
    next();
})


export const initializeTaskModel = (connection: any)=>{
    return connection.models.Task || connection.model('Task', taskSchema) 
}