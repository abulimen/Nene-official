const { models } = require('./models');
const { sequelize } = require('./utils/db');
const { Product, Review } = models;

const nigerianNames = [
    "Chioma Okonkwo", "Tunde Bakare", "Zainab Musa", "Emeka Nnamdi", "Funke Adebayo",
    "Ngozi Eze", "Yakubu Bello", "Aisha Ibrahim", "Bolanle Coker", "Chinedu Okafor",
    "Folake Mensah", "Kemi Adeyemi", "Ifeanyi Uche", "Olamide Sowore", "Efe Osagie",
    "Tamuno Briggs", "Fatima Yusuf", "Segun Oladipo", "Amaka Onwuka", "Habib Abdullahi"
];

const genericReviews = [
    { text: "Abeg, this is the real deal! The taste takes me back to my childhood.", rating: 5 },
    { text: "Delivery was fast to Lekki. The packaging was still cold when it arrived.", rating: 5 },
    { text: "I was skeptical at first, but wow. Nené really tried with this one.", rating: 4 },
    { text: "Perfect for this Lagos heat! So refreshing.", rating: 5 },
    { text: "My kids finished everything in one sitting. I have to order more now.", rating: 5 },
    { text: "Good quality, but I wish the delivery fee was a bit lower to the mainland.", rating: 4 },
    { text: "The texture is thick and creamy, just how I like it.", rating: 5 },
    { text: "Finally, a healthy snack that doesn't taste like cardboard. Well done!", rating: 5 },
    { text: "It's okay, but I prefer the sweetened version more.", rating: 3 },
    { text: "Customer service was top notch. They called to confirm my location immediately.", rating: 5 }
];

const specificReviews = {
    "Nene Chicken Shawarma": [
        { text: "Omo, this shawarma is bad! The chicken is plenty, not just cabbage.", rating: 5 },
        { text: "Best shawarma I've had in Ikeja axis. The sauce is spicy but sweet.", rating: 5 },
        { text: "The bread was fresh and soft. Will definitely order for my office party.", rating: 4 },
        { text: "Too sweet for me, I prefer it more spicy. But the chicken was tender.", rating: 3 }
    ],
    "Nene Chocolate & Red Velvet Parfait": [
        { text: "This is pure indulgence! The red velvet cake chunks are moist and delicious.", rating: 5 },
        { text: "My girlfriend loved it. Best surprise gift ever.", rating: 5 },
        { text: "A bit too sweet for my liking, but my kids enjoyed it.", rating: 4 },
        { text: "The chocolate layers are rich. Perfect dessert after dinner.", rating: 5 }
    ],
    "Nene Yogurt Parfait": [
        { text: "My go-to breakfast before hitting the traffic. Keeps me full till afternoon.", rating: 5 },
        { text: "Fruits were very fresh. I love the crunch of the granola.", rating: 5 },
        { text: "Healthy and tasty. I've subscribed to the weekly plan.", rating: 5 }
    ],
    "Nene Unsweetened Greek Yogurt": [
        { text: "Perfect for my diet. I use it for smoothies and salad dressing.", rating: 5 },
        { text: "Thick like proper Greek yogurt should be. No water at all.", rating: 5 },
        { text: "I add my own honey and nuts. It's a blank canvas for breakfast.", rating: 4 }
    ],
    "Nene Sweetened Greek Yogurt": [
        { text: "Sweet but not too sugary. Just the right balance.", rating: 5 },
        { text: "My husband who hates yogurt actually likes this one.", rating: 5 }
    ]
};

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedReviews = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // Clear existing reviews to avoid duplicates and remove generic ones
        await Review.destroy({ where: {}, truncate: false });
        console.log('Cleared existing reviews...');

        const products = await Product.findAll();

        if (products.length === 0) {
            console.log('No products found. Please seed products first.');
            return;
        }

        console.log(`Found ${products.length} products. Adding authentic Nigerian reviews...`);

        for (const product of products) {
            // Get specific reviews for this product name, or use generic ones
            const productSpecific = specificReviews[product.name] || [];

            // Determine how many reviews to add (between 3 and 6)
            const numReviews = Math.floor(Math.random() * 4) + 3;

            const reviewsToAdd = [];

            // Add specific reviews first (if any)
            if (productSpecific.length > 0) {
                reviewsToAdd.push(...productSpecific);
            }

            // Fill the rest with generic reviews
            while (reviewsToAdd.length < numReviews) {
                reviewsToAdd.push(getRandomElement(genericReviews));
            }

            // Shuffle reviews
            const shuffledReviews = reviewsToAdd.sort(() => 0.5 - Math.random());

            for (const reviewData of shuffledReviews) {
                const name = getRandomElement(nigerianNames);
                // Create a realistic email based on the name
                const emailName = name.toLowerCase().replace(' ', '.');
                const email = `${emailName}${Math.floor(Math.random() * 100)}@example.com`;

                await Review.create({
                    product_id: product.id,
                    customer_name: name,
                    customer_email: email,
                    rating: reviewData.rating,
                    review_text: reviewData.text,
                    status: "approved",
                    is_featured: reviewData.rating === 5 && Math.random() > 0.5 // Feature some 5-star reviews
                });
            }

            console.log(`Added ${shuffledReviews.length} reviews for ${product.name}`);
        }

        console.log('Reviews seeded successfully with Nigerian context!');
    } catch (error) {
        console.error('Error seeding reviews:', error);
    } finally {
        await sequelize.close();
    }
};

seedReviews();
