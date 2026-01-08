// Brand Colors - Light Mode Palette
export const COLORS = {
    dark: '#1c1917',    // Stone 900 - Primary Text
    medium: '#44403c',  // Stone 700 - Secondary Text
    light: '#78716c',   // Stone 500 - Muted Text
    bg: '#fafaf9',      // Stone 50 - Main Background
    card: '#ffffff',    // White - Card Background
    teal: '#0d9488',    // Teal 600 - Primary Brand Color
    tealLight: '#ccfbf1',
    gold: '#d97706',    // Amber 600 - Accent
    goldLight: '#fef3c7',
    cream: '#f5f5f4',   // Stone 100
};

// Product Data
export const PRODUCTS = [
    {
        id: 1,
        name: "Unsweetened Greek Yogurt",
        tagline: "High Protein • Zero Added Sugar",
        price: 4500,
        description: "The purest form of Greek yogurt. Rich, velvety texture with zero added sugars. Perfect for breakfast bowls or savory dips.",
        accent: COLORS.teal,
        accentBg: COLORS.tealLight,
        nutrition: { cal: 120, protein: "18g", sugar: "0g" },
        reviews: 124,
        rating: 4.9,
        ingredients: "Cultured Pasteurized Non-Fat Milk, Live Active Cultures.",
        size: "500g"
    },
    {
        id: 2,
        name: "Sweetened Greek Yogurt",
        tagline: "Naturally Sweetened • Creamy",
        price: 4800,
        description: "Indulge without the guilt. Gently sweetened with natural honey and monk fruit for a perfectly balanced treat.",
        accent: COLORS.gold,
        accentBg: COLORS.goldLight,
        nutrition: { cal: 140, protein: "16g", sugar: "4g" },
        reviews: 89,
        rating: 4.8,
        ingredients: "Cultured Pasteurized Milk, Honey, Monk Fruit Extract, Live Cultures.",
        size: "500g"
    },
    {
        id: 3,
        name: "Vanilla Ice Cream",
        tagline: "Creamy Indulgence • Keto Friendly",
        price: 5500,
        description: "Classic vanilla bean flavor wrapped in a rich, creamy texture. Low carb, high satisfaction, and absolutely delicious.",
        accent: COLORS.dark,
        accentBg: '#e7e5e4',
        nutrition: { cal: 180, protein: "12g", sugar: "2g" },
        reviews: 215,
        rating: 4.9,
        ingredients: "Cream, Milk Protein Isolate, Erythritol, Vanilla Bean, Stevia.",
        size: "473ml"
    }
];

export const BLOG_POSTS = [
    {
        id: 1,
        title: "The Science of Probiotics",
        excerpt: "Why gut health is the new wealth, and how Nené supports your microbiome.",
        date: "Oct 12, 2023",
        category: "Wellness",
        image: "https://images.unsplash.com/photo-1576670158645-30a561959888?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 2,
        title: "5 Morning Bowls to Start Your Day",
        excerpt: "From fruity explosions to savory delights, elevate your breakfast game.",
        date: "Oct 08, 2023",
        category: "Recipes",
        image: "https://images.unsplash.com/photo-1511690656952-34342d5c2895?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 3,
        title: "Vanilla: The Complex Orchid",
        excerpt: "Tracing the journey of our vanilla beans from Madagascar to your tub.",
        date: "Sep 28, 2023",
        category: "Sourcing",
        image: "https://images.unsplash.com/photo-1626202482271-e98279d411d2?auto=format&fit=crop&q=80&w=800"
    }
];

export const REVIEWS = [
    { id: 1, user: "Chioma A.", text: "Finally a yogurt in Lagos that actually tastes authentic. The unsweetened one is a staple in my fridge now.", rating: 5 },
    { id: 2, user: "Tunde B.", text: "Delivery was super fast to Lekki. The vanilla ice cream is surprisingly good for being keto.", rating: 5 },
    { id: 3, user: "Sarah K.", text: "Love the packaging and the taste is divine. Highly recommend!", rating: 4 }
];

export const FAQS = [
    { q: "Do you deliver outside Lagos?", a: "Yes! We currently deliver to Lagos, Abuja, Port Harcourt, and Ibadan via refrigerated logistics." },
    { q: "Is the packaging recyclable?", a: "Absolutely. Our Nené tubs are made from 100% recyclable BPA-free plastic." },
    { q: "How long does it last?", a: "Unopened, our yogurts last 3 weeks in the fridge. Once opened, consume within 3 days for freshness." }
];

export const NIGERIAN_STATES = [
    "Lagos", "Abuja (FCT)", "Rivers", "Ogun", "Oyo", "Enugu", "Kano", "Kaduna"
];
