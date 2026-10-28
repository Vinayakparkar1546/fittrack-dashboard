
const express = require("express");
const path = require("path");
const PDFDocument = require("pdfkit");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Kubernetes health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy" });
});

// Generate and download the fitness report
app.post("/download-pdf", (req, res) => {
    const {
        name,
        age,
        gender,
        height,
        weight,
        goal,
        activity,
        experience,
        diet
    } = req.body || {};

    const parsedAge = Number(age);
    const parsedHeight = Number(height);
    const parsedWeight = Number(weight);

    // Validate required fields and numeric ranges
    if (
        typeof name !== "string" ||
        !name.trim() ||
        !Number.isInteger(parsedAge) ||
        parsedAge < 10 ||
        parsedAge > 120 ||
        height === "" ||
        !Number.isFinite(parsedHeight) ||
        parsedHeight < 50 ||
        parsedHeight > 250 ||
        weight === "" ||
        !Number.isFinite(parsedWeight) ||
        parsedWeight < 10 ||
        parsedWeight > 500 ||
        typeof goal !== "string" ||
        !goal.trim() ||
        typeof activity !== "string" ||
        !activity.trim() ||
        typeof experience !== "string" ||
        !experience.trim() ||
        typeof diet !== "string" ||
        !diet.trim() ||
        (gender !== undefined && typeof gender !== "string")
    ) {
        return res.status(400).json({
            error: "Please enter valid details. Age must be between 10 and 120, and all required fields must be completed."
        });
    }

    // Create the PDF
    try {
        const pdf = new PDFDocument({ margin: 50 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="FitTrack-Fitness-Report.pdf"'
        );

        pdf.on("error", (error) => {
            console.error("PDF generation error:", error.message);

            if (!res.headersSent) {
                res.status(500).json({
                    error: "Unable to generate the PDF. Please try again."
                });
            } else {
                res.destroy(error);
            }
        });

        pdf.pipe(res);

        pdf
            .fontSize(26)
            .fillColor("#17294b")
            .text("FitTrack", { align: "center" });

        pdf
            .moveDown(0.3)
            .fontSize(16)
            .fillColor("#b08d45")
            .text("PERSONAL FITNESS REPORT", { align: "center" });

        pdf.moveDown(1.5);

        pdf
            .fontSize(12)
            .fillColor("#333333")
            .text(`Name: ${name.trim()}`)
            .text(`Age: ${parsedAge}`)
            .text(`Gender: ${gender?.trim() || "Not specified"}`)
            .text(`Height: ${parsedHeight} cm`)
            .text(`Weight: ${parsedWeight} kg`)
            .moveDown()
            .text(`Fitness Goal: ${goal.trim()}`)
            .text(`Activity Level: ${activity.trim()}`)
            .text(`Workout Experience: ${experience.trim()}`)
            .text(`Diet Preference: ${diet.trim()}`);

        pdf.moveDown(2);

        pdf
            .fontSize(14)
            .fillColor("#17294b")
            .text("Your Next Step", { underline: true });

        pdf
            .moveDown(0.5)
            .fontSize(11)
            .fillColor("#333333")
            .text(
                "Build healthy habits, stay consistent, and track your progress. " +
                "Choose activities appropriate for your fitness level and " +
                "consult a qualified professional for personalized advice."
            );

        pdf.moveDown(2);

        pdf
            .fontSize(10)
            .fillColor("#b08d45")
            .text("Your journey, your progress.", { align: "center" });

        pdf.end();
    } catch (error) {
        console.error("PDF creation failed:", error.message);

        if (!res.headersSent) {
            res.status(500).json({
                error: "Unable to create the fitness report."
            });
        }
    }
});

// Handle malformed JSON requests
app.use((error, req, res, next) => {
    console.error("Request error:", error.message);

    if (res.headersSent) {
        return next(error);
    }

    res.status(400).json({
        error: "Invalid request data. Please check your form and try again."
    });
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`FitTrack Dashboard running on port ${PORT}`);
});
