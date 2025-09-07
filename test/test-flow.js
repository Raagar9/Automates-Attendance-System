const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function testFullFlow() {
    try {
        // 1. Check directories
        console.log('Checking directories...');
        const dirs = ['../../Input', '../../Data'];  // Changed to point to root level folders
        dirs.forEach(dir => {
            if (!fs.existsSync(path.join(__dirname, dir))) {
                throw new Error(`Directory ${dir} not found`);
            }
        });

        // 2. Check Python script
        console.log('Checking Python script...');
        if (!fs.existsSync(path.join(__dirname, '../../recognize.py'))) {
            throw new Error('recognize.py not found');
        }

        // 3. Check embeddings file
        console.log('Checking embeddings file...');
        if (!fs.existsSync(path.join(__dirname, '../../embedding.npy'))) {
            throw new Error('embedding.npy not found');
        }

        // 4. Test API endpoint
        console.log('Testing API endpoint...');
        const form = new FormData();
        const imagePath = path.join(__dirname, '../../Input/Input 1.jpg');
        
        console.log('Image path:', imagePath);
        console.log('Image exists:', fs.existsSync(imagePath));
        
        form.append('image', fs.createReadStream(imagePath));
        
        console.log('Sending request to http://localhost:5000/api/upload');
        const response = await axios.post('http://localhost:5000/api/upload', form, {
            headers: form.getHeaders()
        });

        console.log('API Response:', response.data);
        console.log('All tests passed!');
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testFullFlow();