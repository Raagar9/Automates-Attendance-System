const { spawn } = require('child_process');
const path = require('path');

const testPythonIntegration = () => {
    const pythonScript = path.join(__dirname, '../../recognize.py');
    const testImagePath = path.join(__dirname, '../../Input/Input 1.jpg');
    //C:\Users\Lenovo\Desktop\SDAM\Input\Input 1.jpg
    
    const pythonProcess = spawn('python', [
        pythonScript,
        testImagePath
    ]);

    pythonProcess.stdout.on('data', (data) => {
        console.log('Python Output:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error('Python Error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
        console.log('Python process exited with code:', code);
    });
};

testPythonIntegration();