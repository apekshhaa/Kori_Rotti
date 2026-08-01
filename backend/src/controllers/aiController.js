const { spawn } = require("child_process");
const path = require("path");

function runPythonPrediction(inputPayload) {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, "..", "ai", "predict.py");
        const pythonProcess = spawn("python", [pythonScript], {
            cwd: path.join(__dirname, "..", ".."),
            windowsHide: true
        });

        let stdout = "";
        let stderr = "";

        pythonProcess.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });

        pythonProcess.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        pythonProcess.on("error", (error) => {
            reject(error);
        });

        pythonProcess.on("close", (code) => {
            if (code !== 0) {
                const error = new Error(stderr.trim() || `Python process exited with code ${code}`);
                error.code = code;
                error.stderr = stderr.trim();
                return reject(error);
            }

            resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
        });

        pythonProcess.stdin.write(`${JSON.stringify(inputPayload)}\n`);
        pythonProcess.stdin.end();
    });
}

async function predictTrend(req, res) {
    try {
        const { readings } = req.body || {};

        if (!Array.isArray(readings) || readings.length !== 3) {
            return res.status(400).json({
                success: false,
                message: "Exactly three readings are required"
            });
        }

        const { stdout } = await runPythonPrediction({ readings });
        const prediction = JSON.parse(stdout);

        return res.status(200).json({
            success: true,
            prediction
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Trend prediction failed",
            error: error.message
        });
    }
}

module.exports = {
    predictTrend
};
