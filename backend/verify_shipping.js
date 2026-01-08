const fs = require('fs');

async function verifyShipping() {
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
        console.log('Login successful.');

        // 2. Get Shipping Configs
        console.log('Fetching shipping configs...');
        const res = await fetch('http://localhost:5000/api/admin/shipping', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response Status:', res.status);
        const data = await res.json();
        console.log('Response Data:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

verifyShipping();
