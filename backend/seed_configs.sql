-- Seeding site configurations for YSC St. Dominic

INSERT INTO site_configs (key, value, category) VALUES
('hero_content', '{"title": "Serving Christ Through Youthful Passion", "subtitle": "Join the St. Dominic Catholic Church youth community in our mission of faith, service, and spiritual growth.", "button_text": "Join Our Community"}', 'home'),
('about_summary', '{"title": "Our Journey in Faith", "content": "Since our founding, YSC St. Dominic has been a beacon for young Catholics to find their voice, serve their community, and grow closer to God through prayer and collective action."}', 'about'),
('contact_info', '{"email": "yscstdominic@gmail.com", "phone": "+254 700 000000", "location": "Juja, Kenya"}', 'general')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
