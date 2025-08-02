import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  interviewerEmail: {  
    type: String,
    required: true,
    index: true
  },
  candidateEmail: {    
    type: String,
    required: true,
    index: true
  },
  createdBy: {
    type: String,      
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

interviewSchema.index({ interviewerEmail: 1, date: 1 });
interviewSchema.index({ candidateEmail: 1, date: 1 });

const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);
export default Interview;