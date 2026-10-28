
const quotes = [
    "The secret of getting ahead is getting started.",
    "Small progress is still progress. Keep going.",
    "Your only limit is the one you set yourself.",
    "Discipline today creates strength tomorrow.",
    "Every workout is a step toward a stronger you.",
    "Consistency beats perfection.",
    "Believe in yourself and keep moving forward.",
    "A healthy lifestyle is built one day at a time.",
    "Don't stop when you're tired. Stop when you're done.",
    "Make yourself proud, one rep at a time.",
    "Your body can stand almost anything. It is your mind you have to convince.",
    "Stronger every day, one workout at a time.",
    "Great things never come from comfort zones.",
    "Success starts with self-discipline.",
    "Push yourself because nobody else can do it for you.",
    "The pain of discipline is less than the pain of regret.",
    "You don't have to be extreme, just consistent.",
    "A little progress each day adds up to big results.",
    "Train your mind and your body will follow.",
    "Sweat now, shine later.",
    "Your future self will thank you for starting today.",
    "Fitness is not a destination; it is a way of life.",
    "Don't wish for it. Work for it.",
    "Fall in love with taking care of yourself.",
    "Every step forward counts, no matter how small.",
    "Be stronger than your excuses.",
    "Champions are made when nobody is watching.",
    "Progress takes patience. Keep showing up.",
    "The hardest lift is lifting yourself off the couch.",
    "Your health is an investment, not an expense.",
    "Make movement a celebration of what your body can do.",
    "One good workout won't change everything, but consistency will.",
    "You are capable of more than you think.",
    "Set goals, stay focused, and trust the process.",
    "Results happen over time, not overnight.",
    "Don't compare your journey to someone else's.",
    "Start where you are. Use what you have. Do what you can.",
    "Every day is another chance to get stronger.",
    "The only bad workout is the one that didn't happen.",
    "Strength grows through effort and persistence.",
    "Your commitment matters more than your motivation.",
    "Be proud of every healthy choice you make.",
    "A stronger body begins with a stronger decision.",
    "Turn your obstacles into opportunities.",
    "Dream big, train smart, and stay consistent.",
    "You didn't come this far to only come this far.",
    "Take care of your body. It's the only place you have to live.",
    "You are one decision away from a healthier habit.",
    "Focus on progress, not perfection.",
    "Keep moving forward. Your hard work will add up."
];

const quoteElement = document.getElementById("quote");
const quoteButton = document.getElementById("new-quote");

let remainingQuotes = [];
let lastQuote = "";

function shuffleQuotes() {
    remainingQuotes = [...quotes];

    // Shuffle the quotes using Fisher-Yates
    for (let i = remainingQuotes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [remainingQuotes[i], remainingQuotes[j]] =
            [remainingQuotes[j], remainingQuotes[i]];
    }

    // Avoid repeating the last quote across rounds
    if (
        remainingQuotes.length > 1 &&
        remainingQuotes[0] === lastQuote
    ) {
        [remainingQuotes[0], remainingQuotes[1]] =
            [remainingQuotes[1], remainingQuotes[0]];
    }
}

quoteButton.addEventListener("click", () => {
    if (remainingQuotes.length === 0) {
        shuffleQuotes();
    }

    const nextQuote = remainingQuotes.shift();

    quoteElement.textContent = nextQuote;
    lastQuote = nextQuote;
});

const fitnessForm = document.getElementById("fitness-form");
const messageElement = document.getElementById("message");

fitnessForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Validate age before submitting
    const age = Number(document.getElementById("age").value);

    if (!Number.isInteger(age) || age < 10 || age > 120) {
        messageElement.textContent =
            "Please enter a valid age between 10 and 120.";
        messageElement.style.color = "#b42318";
        return;
    }

    messageElement.textContent = "Generating your fitness report...";
    messageElement.style.color = "#17294b";

    try {
        const response = await fetch("/download-pdf", {
    method: "POST",
    body: new URLSearchParams(new FormData(fitnessForm))
});        

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || "Unable to generate PDF.");
        }

        // Convert the response into a downloadable PDF
        const pdfBlob = await response.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const downloadLink = document.createElement("a");

        downloadLink.href = pdfUrl;
        downloadLink.download = "FitTrack-Fitness-Report.pdf";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        URL.revokeObjectURL(pdfUrl);

        messageElement.textContent =
            "Your fitness report is ready for download!";
        messageElement.style.color = "#217a4b";

    } catch (error) {
        messageElement.textContent = error.message;
        messageElement.style.color = "#b42318";
    }
});
