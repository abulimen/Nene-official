require('dotenv').config();
const { models, sequelize } = require('./models');
const { BlogPost } = models;

const blogPosts = [
    {
        title: "Why Greek Yogurt is the Ultimate Superfood",
        excerpt: "Discover the science-backed benefits of Greek yogurt, from its high protein content to its gut-friendly probiotics.",
        category: "Nutrition",
        image_url: "blog/greek-yogurt-superfood.jpg",
        author: "Nené Nutrition Team",
        is_published: true,
        published_at: new Date(),
        content: `
            <p>Greek yogurt has surged in popularity over the last decade, and for good reason. Unlike regular yogurt, Greek yogurt is strained to remove the whey, resulting in a thicker, creamier texture and a nutritional profile that stands out in the dairy aisle.</p>

            <h3>A Protein Powerhouse</h3>
            <p>One of the most significant advantages of Greek yogurt is its protein content. A typical serving contains nearly double the protein of regular yogurt. This makes it an excellent choice for athletes looking to repair muscle tissue after a workout, or for anyone wanting to feel fuller for longer. Protein plays a crucial role in regulating appetite hormones, which can help prevent mid-afternoon snacking.</p>

            <h3>Gut Health and Probiotics</h3>
            <p>Your gut microbiome influences everything from digestion to immune function. Greek yogurt is often packed with probiotics—beneficial bacteria that support a healthy gut environment. Regular consumption of probiotic-rich foods can improve digestion and may even boost your immune system.</p>

            <h3>Versatility in the Kitchen</h3>
            <p>Beyond the breakfast bowl, Greek yogurt is incredibly versatile. Its thick consistency makes it a perfect lower-calorie substitute for heavy cream, mayonnaise, or sour cream. Try using it in:</p>
            <ul>
                <li><strong>Marinades:</strong> The lactic acid helps tenderize meat.</li>
                <li><strong>Sauces:</strong> Create creamy pasta sauces without the heavy cream.</li>
                <li><strong>Baking:</strong> Use it to keep muffins and cakes moist while boosting protein.</li>
            </ul>

            <p>Incorporating Greek yogurt into your daily diet is a simple way to boost your nutrient intake without sacrificing flavor or texture.</p>
        `
    },
    {
        title: "5 Minute Breakfasts That Fuel Your Day",
        excerpt: "Mornings are busy. Here are quick, nutritious breakfast ideas using Nené products that you can whip up in minutes.",
        category: "Recipes",
        image_url: "blog/healthy-breakfast.jpg",
        author: "Nené Kitchen",
        is_published: true,
        published_at: new Date(Date.now() - 86400000), // Yesterday
        content: `
            <p>We've all been there: the alarm goes off late, and suddenly breakfast becomes an afterthought. However, skipping the first meal of the day often leads to energy crashes and poor food choices later on. The solution isn't waking up earlier; it's smarter, faster recipes.</p>

            <h3>1. The Classic Berry Parfait</h3>
            <p>This is as simple as it gets but never fails to satisfy. Layer Nené Unsweetened Greek Yogurt with a handful of fresh berries and a sprinkle of granola. The combination of protein, fiber, and antioxidants provides a sustained energy release.</p>

            <h3>2. Peanut Butter & Banana Smoothie</h3>
            <p>Blend half a cup of Greek yogurt, one ripe banana, a tablespoon of peanut butter, and a splash of milk. This smoothie is rich in potassium and healthy fats, making it a perfect post-workout option or a breakfast on the go.</p>

            <h3>3. Savory Yogurt Bowl</h3>
            <p>Who says yogurt has to be sweet? Top a bowl of plain Greek yogurt with sliced cucumbers, cherry tomatoes, a drizzle of olive oil, and a pinch of za'atar spice. It's refreshing, hydrating, and completely sugar-free.</p>

            <h3>4. Overnight Oats</h3>
            <p>Prep this the night before to save even more time. Mix rolled oats with Greek yogurt and milk, then let it sit in the fridge overnight. In the morning, the oats will be soft and ready to eat. Top with nuts or seeds for extra crunch.</p>

            <h3>5. Yogurt Toast</h3>
            <p>Spread a thick layer of Greek yogurt on whole-grain toast and top with sliced strawberries or a drizzle of honey. It's a creamy, tangy alternative to cream cheese that packs significantly more nutrition.</p>

            <p>Healthy eating doesn't require hours in the kitchen. With these simple ideas, you can fuel your body effectively, even on your busiest mornings.</p>
        `
    },
    {
        title: "Sweet Tooth? How to Indulge Without the Guilt",
        excerpt: "Craving something sweet? Learn how to satisfy your dessert cravings while staying on track with your health goals.",
        category: "Lifestyle",
        image_url: "blog/healthy-indulgence.jpg",
        author: "Nené Wellness",
        is_published: true,
        published_at: new Date(Date.now() - 172800000), // 2 days ago
        content: `
            <p>The concept of "guilt-free" eating often feels like a marketing gimmick. However, the goal isn't to eliminate sugar entirely but to find a balance that allows for enjoyment without compromising your health. Deprivation often leads to bingeing, so allowing yourself smart indulgences is actually a sustainable strategy.</p>

            <h3>The Role of Natural Sweeteners</h3>
            <p>Refined sugar causes rapid spikes in blood glucose, followed by crashes that leave you tired and craving more. Natural sweeteners like honey, maple syrup, or fruit purees offer a different experience. While they still contain sugar, they often come with trace minerals and antioxidants. More importantly, when paired with protein and fat—like in our Sweetened Greek Yogurt—the absorption of sugar is slowed, resulting in more stable energy levels.</p>

            <h3>Smart Swaps</h3>
            <p>Satisfying a craving is often about texture and flavor rather than just sugar.</p>
            <ul>
                <li><strong>Craving Ice Cream?</strong> Try our Frozen Yogurt. It offers the same creamy, cold satisfaction but with live cultures and protein.</li>
                <li><strong>Craving Cake?</strong> A yogurt parfait with layers of fruit and granola can mimic the complexity of a dessert while providing fiber and vitamins.</li>
                <li><strong>Craving Chocolate?</strong> Dark chocolate (70% cocoa or higher) contains less sugar and is rich in iron and magnesium. Pair a square with a dollop of yogurt for a balanced treat.</li>
            </ul>

            <h3>Mindful Indulgence</h3>
            <p>Often, we eat sweets out of boredom or stress rather than genuine hunger. Taking the time to sit down and truly savor a treat can make a small portion feel much more satisfying. Notice the texture, the temperature, and the flavor profile. When you eat mindfully, you're less likely to overindulge.</p>

            <p>Wellness is a marathon, not a sprint. Incorporating treats that offer nutritional value allows you to enjoy the sweeter side of life while maintaining your overall well-being.</p>
        `
    }
];

async function seedBlogPosts() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected');

        console.log('Seeding blog posts...');

        for (const post of blogPosts) {
            await BlogPost.create(post);
            console.log(`✅ Created post: ${post.title}`);
        }

        console.log('✅ Blog post seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database error:', error);
        process.exit(1);
    }
}

seedBlogPosts();
