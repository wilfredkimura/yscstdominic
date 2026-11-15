const axios = require('axios');

async function testApi() {
    try {
        // Test login
        console.log('Testing admin login...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@yscstdominic.org',
            password: '12345678'
        });
        console.log('✅ Login successful:', loginRes.data.user?.email);
        
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        
        // Test create event
        console.log('\nTesting event creation...');
        const eventRes = await axios.post('http://localhost:5000/api/events', {
            title: 'Test Event',
            slug: 'test-event',
            date: '2025-12-01',
            location: 'Test Location',
            description: 'Test description',
            category: 'Test',
            image_url: '',
            is_featured: false,
            enable_rsvp: true
        }, { headers });
        console.log('✅ Event created:', eventRes.data.title, 'enable_rsvp:', eventRes.data.enable_rsvp);
        
        const eventId = eventRes.data.id;
        
        // Test RSVP
        console.log('\nTesting RSVP...');
        const rsvpRes = await axios.post(`http://localhost:5000/api/events/${eventId}/rsvp`, {
            name: 'Test User',
            phone_number: '+254700000000'
        });
        console.log('✅ RSVP created:', rsvpRes.data.name);
        
        // Test RSVP on event without enable_rsvp
        console.log('\nTesting RSVP on disabled event...');
        const disabledEventRes = await axios.post('http://localhost:5000/api/events', {
            title: 'Disabled RSVP Event',
            slug: 'disabled-rsvp-event',
            date: '2025-12-02',
            location: 'Test Location',
            description: 'Test description',
            category: 'Test',
            image_url: '',
            is_featured: false,
            enable_rsvp: false
        }, { headers });
        
        try {
            await axios.post(`http://localhost:5000/api/events/${disabledEventRes.data.id}/rsvp`, {
                name: 'Test User 2',
                phone_number: '+254700000001'
            });
            console.log('❌ RSVP should have failed');
        } catch (err) {
            if (err.response?.status === 400) {
                console.log('✅ RSVP correctly rejected:', err.response.data.error);
            }
        }
        
        console.log('\n✅ All tests passed!');
    } catch (err) {
        console.error('❌ Test failed:', err.response?.data || err.message);
    }
}

testApi();