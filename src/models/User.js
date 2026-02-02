import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  leader: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    college: { type: String, required: true },
    course: { type: String, required: true },
    password: { type: String, required: true }, // 
  },
  teamName: { type: String, required: true },
  members: [
    {
      name: String,
      phone: String,
      email: String,
      course: String,
    }
  ],
  selectedEvents: [{ type: String }],
  totalAmount: { type: Number, required: true },
  transactionId: { type: String, required: true },
  status: { type: String, default: "Pending" }, // Admin baad me verify karega
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);