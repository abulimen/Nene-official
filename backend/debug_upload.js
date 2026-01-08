const fs = require('fs');
const path = require('path');

async function debugUpload() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@nene.com',
                password: 'password123'
            })
        });

        if (!loginRes.ok) {
            console.error('Login failed:', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.data.token;
        console.log('Login successful, token obtained.');

        // 2. Upload
        console.log('Uploading file...');
        const formData = new FormData();
        const filePath = path.join(__dirname, '../public/vite.svg');
        const fileContent = fs.readFileSync(filePath);
        const blob = new Blob([fileContent], { type: 'image/svg+xml' });
        formData.append('image', blob, 'vite.svg');

        const uploadRes = await fetch('http://localhost:5000/api/admin/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        console.log('Upload Response Status:', uploadRes.status);
        const text = await uploadRes.text();
        console.log('Upload Response Body:', text);

    } catch (error) {
        console.error('Error:', error);
    }
}

debugUpload();
