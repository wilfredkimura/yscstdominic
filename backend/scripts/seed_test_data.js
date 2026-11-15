require('dotenv').config();
const db = require('../db');

async function seedTestData() {
    console.log('Seeding test data...');

    try {
        // 1. LEADERS (5 entries)
        console.log('\n--- Seeding Leaders ---');
        const leaders = [
            {
                name: 'Fr. Michael Ochieng',
                role: 'Chaplain & Spiritual Director',
                image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                bio: 'Fr. Michael has served as chaplain for YSC for over 8 years. He holds a Masters in Pastoral Theology and is passionate about youth evangelization.',
                rank: 1
            },
            {
                name: 'Sr. Grace Wanjiku',
                role: 'Assistant Chaplain',
                image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
                bio: 'Sr. Grace brings 12 years of experience in youth ministry. She coordinates retreats and formation programs.',
                rank: 2
            },
            {
                name: 'Peter Kamau',
                role: 'Chairperson',
                image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
                bio: 'Peter is a software engineer by profession and has been an active YSC member since 2018. He leads the executive committee.',
                rank: 3
            },
            {
                name: 'Mary Achieng',
                role: 'Secretary',
                image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
                bio: 'Mary is a teacher and manages all YSC communications, records, and correspondence.',
                rank: 4
            },
            {
                name: 'James Mwangi',
                role: 'Treasurer',
                image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
                bio: 'James is an accountant who ensures transparent financial management of all YSC activities and projects.',
                rank: 5
            }
        ];

        for (const leader of leaders) {
            await db.query(
                `INSERT INTO leaders (name, role, image_url, bio, rank) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
                [leader.name, leader.role, leader.image_url, leader.bio, leader.rank]
            );
            console.log(`Added leader: ${leader.name}`);
        }

        // 2. EVENT CATEGORIES (needed for events)
        console.log('\n--- Seeding Event Categories ---');
        const eventCategories = [
            { name: 'Spiritual Retreat', slug: 'spiritual-retreat' },
            { name: 'Community Service', slug: 'community-service' },
            { name: 'Fellowship', slug: 'fellowship' },
            { name: 'Formation', slug: 'formation' },
            { name: 'Celebration', slug: 'celebration' }
        ];

        for (const cat of eventCategories) {
            await db.query(
                `INSERT INTO event_categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
                [cat.name, cat.slug]
            );
            console.log(`Added event category: ${cat.name}`);
        }

        // 3. EVENTS (5 entries)
        console.log('\n--- Seeding Events ---');
        const events = [
            {
                title: 'Annual Youth Retreat 2025',
                description: 'A 3-day spiritual retreat at Subukia Shrine. Theme: "Rooted in Faith, Growing in Love". Includes adoration, confession, talks, and fellowship.',
                event_date: '2025-04-15 08:00:00+03',
                location: 'Subukia National Shrine, Nakuru',
                image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=600&fit=crop',
                category: 'spiritual-retreat',
                is_featured: true
            },
            {
                title: 'Medical Camp Outreach',
                description: 'Free medical camp at St. Theresa Kalimoni grounds. Partnering with local doctors to serve the community. Volunteers needed for registration and ushering.',
                event_date: '2025-05-10 09:00:00+03',
                location: 'St. Theresa Kalimoni Parish Grounds',
                image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
                category: 'community-service',
                is_featured: true
            },
            {
                title: 'Youth Fellowship Night',
                description: 'Monthly fellowship with praise & worship, testimony sharing, and games. Open to all young adults. Light refreshments provided.',
                event_date: '2025-06-28 18:00:00+03',
                location: 'Parish Hall, St. Dominic',
                image_url: 'https://images.unsplash.com/photo-1516280440621-57c482d1a5c4?w=800&h=600&fit=crop',
                category: 'fellowship',
                is_featured: false
            },
            {
                title: 'Bible Study Series: Acts of the Apostles',
                description: '8-week formation program diving deep into the Acts of the Apostles. Every Tuesday at 7 PM. Materials provided.',
                event_date: '2025-07-08 19:00:00+03',
                location: 'Youth Center, St. Dominic',
                image_url: 'https://images.unsplash.com/photo-1461586922584-4c4d0ea95c01?w=800&h=600&fit=crop',
                category: 'formation',
                is_featured: false
            },
            {
                title: 'St. Dominic Feast Day Celebration',
                description: 'Annual feast day celebration with Mass, procession, cultural performances, and community meal. All parishioners welcome.',
                event_date: '2025-08-08 10:00:00+03',
                location: 'St. Dominic Catholic Church',
                image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
                category: 'celebration',
                is_featured: true
            }
        ];

        for (const event of events) {
            await db.query(
                `INSERT INTO events (title, description, event_date, location, image_url, category, is_featured) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
                [event.title, event.description, event.event_date, event.location, event.image_url, event.category, event.is_featured]
            );
            console.log(`Added event: ${event.title}`);
        }

        // 4. BLOG CATEGORIES (needed for blog posts)
        console.log('\n--- Seeding Blog Categories ---');
        const blogCategories = [
            { name: 'Reflections', slug: 'reflections' },
            { name: 'Testimonies', slug: 'testimonies' },
            { name: 'Events', slug: 'events' },
            { name: 'Teachings', slug: 'teachings' },
            { name: 'Announcements', slug: 'announcements' }
        ];

        for (const cat of blogCategories) {
            await db.query(
                `INSERT INTO blog_categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
                [cat.name, cat.slug]
            );
            console.log(`Added blog category: ${cat.name}`);
        }

        // Get admin user ID for author
        const adminResult = await db.query(`SELECT id FROM users WHERE role = 'Admin' LIMIT 1`);
        const adminId = adminResult.rows[0]?.id || 1;

        // 5. BLOG POSTS (5 entries with TipTap JSON content)
        console.log('\n--- Seeding Blog Posts ---');
        const blogPosts = [
            {
                title: 'Finding God in the Silence',
                slug: 'finding-god-in-the-silence',
                content: {
                    type: 'doc',
                    content: [
                        { type: 'paragraph', content: [{ type: 'text', text: 'In the noise of our daily lives, finding moments of silence can feel impossible. Yet, it is often in the silence that God speaks the loudest.' }] },
                        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Power of Silent Prayer' }] },
                        { type: 'paragraph', content: [{ type: 'text', text: 'Silent prayer is not about emptying our minds, but about creating space for God to fill our hearts. St. John of the Cross said, "God\'s first language is silence."' }] },
                        { type: 'paragraph', content: [{ type: 'text', text: 'Try setting aside just 10 minutes each day for silent adoration. You may be surprised at what you hear.' }] }
                    ]
                },
                excerpt: 'Discovering the transformative power of silent prayer in a noisy world.',
                author_id: adminId,
                category: 'reflections',
                image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
                is_published: true,
                is_featured: true
            },
            {
                title: 'My Journey to the Priesthood',
                slug: 'my-journey-to-the-priesthood',
                content: {
                    type: 'doc',
                    content: [
                        { type: 'paragraph', content: [{ type: 'text', text: 'Fr. Michael shares his vocation story, from a young altar server to answering the call to priesthood.' }] },
                        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The First Stirrings' }] },
                        { type: 'paragraph', content: [{ type: 'text', text: 'I was 12 when I first felt the call. Serving at the altar, I experienced a peace I couldn\'t explain.' }] },
                        { type: 'paragraph', content: [{ type: 'text', text: 'God doesn\'t call the qualified; He qualifies the called. Trust the process.' }] }
                    ]
                },
                excerpt: 'Fr. Michael Ochieng shares his inspiring vocation journey.',
                author_id: adminId,
                category: 'testimonies',
                image_url: 'https://images.unsplash.com/photo-1461586922584-4c4d0ea95c01?w=800&h=600&fit=crop',
                is_published: true,
                is_featured: true
            },
            {
                title: 'Youth Retreat 2024: A Recap',
                slug: 'youth-retreat-2024-recap',
                content: {
                    type: 'doc',
                    content: [
                        { type: 'paragraph', content: [{ type: 'text', text: 'Last year\'s retreat brought together 150 young people for an unforgettable weekend of faith and fellowship.' }] },
                        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Highlights' }] },
                        { type: 'bulletList', content: [
                            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Powerful adoration sessions' }] }] },
                            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Inspiring talks on discipleship' }] }] },
                            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Confession and healing' }] }] },
                            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'New friendships formed' }] }] }
                        ]}
                    ]
                },
                excerpt: 'Reliving the graces and highlights from our 2024 annual youth retreat.',
                author_id: adminId,
                category: 'events',
                image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=600&fit=crop',
                is_published: true,
                is_featured: false
            },
            {
                title: 'Understanding the Sacraments: A Guide for Young Catholics',
                slug: 'understanding-the-sacraments-guide',
                content: {
                    type: 'doc',
                    content: [
                        { type: 'paragraph', content: [{ type: 'text', text: 'The seven sacraments are the heart of our Catholic faith. Here\'s a brief guide to understanding each one.' }] },
                        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Sacraments of Initiation' }] },
                        { type: 'paragraph', content: [{ type: 'text', text: 'Baptism, Confirmation, and Eucharist lay the foundation of Christian life.' }] },
                        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Sacraments of Healing' }] },
                        { type: 'paragraph', content: [{ type: 'text', text: 'Reconciliation and Anointing of the Sick restore us to wholeness.' }] },
                        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Sacraments of Service' }] },
                        { type: 'paragraph', content: [{ type: 'text', text: 'Matrimony and Holy Orders build up the Church.' }] }
                    ]
                },
                excerpt: 'A comprehensive guide to the seven sacraments for young Catholics.',
                author_id: adminId,
                category: 'teachings',
                image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=600&fit=crop',
                is_published: true,
                is_featured: false
            },
            {
                title: 'Announcing: New Youth Center Opening',
                slug: 'new-youth-center-opening',
                content: {
                    type: 'doc',
                    content: [
                        { type: 'paragraph', content: [{ type: 'text', text: 'We are thrilled to announce the opening of our new Youth Center at St. Dominic Parish!' }] },
                        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'What to Expect' }] },
                        { type: 'paragraph', content: [{ type: 'text', text: 'The center features a chapel, meeting rooms, a library, and a recreational space. It will serve as a hub for all YSC activities.' }] },
                        { type: 'paragraph', content: [{ type: 'text', text: 'Grand opening: September 15, 2025. All are welcome!' }] }
                    ]
                },
                excerpt: 'Exciting news: Our new Youth Center opens this September!',
                author_id: adminId,
                category: 'announcements',
                image_url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop',
                is_published: true,
                is_featured: true
            }
        ];

        for (const post of blogPosts) {
            await db.query(
                `INSERT INTO blog_posts (title, slug, content, excerpt, author_id, category, image_url, is_published, is_featured) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (slug) DO NOTHING`,
                [post.title, post.slug, JSON.stringify(post.content), post.excerpt, post.author_id, post.category, post.image_url, post.is_published, post.is_featured]
            );
            console.log(`Added blog post: ${post.title}`);
        }

        // 6. ALBUMS (needed for gallery images)
        console.log('\n--- Seeding Albums ---');
        const albums = [
            { title: 'Youth Retreat 2024', description: 'Photos from our annual retreat at Subukia Shrine', cover_image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=600&fit=crop' },
            { title: 'Community Outreach', description: 'Medical camps, feeding programs, and service projects', cover_image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop' },
            { title: 'Fellowship Events', description: 'Game nights, praise & worship, and social gatherings', cover_image_url: 'https://images.unsplash.com/photo-1516280440621-57c482d1a5c4?w=800&h=600&fit=crop' },
            { title: 'Formation Sessions', description: 'Bible studies, catechesis, and spiritual formation', cover_image_url: 'https://images.unsplash.com/photo-1461586922584-4c4d0ea95c01?w=800&h=600&fit=crop' },
            { title: 'Celebrations & Feasts', description: 'Feast days, anniversaries, and parish celebrations', cover_image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop' }
        ];

        for (const album of albums) {
            await db.query(
                `INSERT INTO albums (title, description, cover_image_url) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
                [album.title, album.description, album.cover_image_url]
            );
            console.log(`Added album: ${album.title}`);
        }

        // Get album IDs
        const albumResults = await db.query(`SELECT id, title FROM albums`);
        const albumMap = {};
        albumResults.rows.forEach(a => albumMap[a.title] = a.id);

        // 7. GALLERY IMAGES (5 entries across albums)
        console.log('\n--- Seeding Gallery Images ---');
        const galleryImages = [
            { album_title: 'Youth Retreat 2024', image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=600&fit=crop', caption: 'Group photo at Subukia Shrine' },
            { album_title: 'Youth Retreat 2024', image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', caption: 'Eucharistic adoration session' },
            { album_title: 'Community Outreach', image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop', caption: 'Free medical camp at Kalimoni' },
            { album_title: 'Fellowship Events', image_url: 'https://images.unsplash.com/photo-1516280440621-57c482d1a5c4?w=800&h=600&fit=crop', caption: 'Praise & worship night' },
            { album_title: 'Celebrations & Feasts', image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop', caption: 'St. Dominic Feast Day procession' }
        ];

        for (const img of galleryImages) {
            const albumId = albumMap[img.album_title];
            if (albumId) {
                await db.query(
                    `INSERT INTO gallery_images (album_id, image_url, caption) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
                    [albumId, img.image_url, img.caption]
                );
                console.log(`Added gallery image: ${img.caption} (Album: ${img.album_title})`);
            }
        }

        console.log('\n✅ All test data seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding data:', err);
        process.exit(1);
    }
}

seedTestData();