import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Team name is required"],
            unique: true,
            trim: true,
        },

        technicians: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

export const MaintenanceTeam = mongoose.model("MaintenanceTeam", teamSchema);