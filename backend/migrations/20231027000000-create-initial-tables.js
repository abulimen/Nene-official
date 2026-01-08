'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Products
        await queryInterface.createTable('products', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            tagline: {
                type: Sequelize.STRING
            },
            description: {
                type: Sequelize.TEXT
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            size: {
                type: Sequelize.STRING
            },
            ingredients: {
                type: Sequelize.TEXT
            },
            nutrition_info: {
                type: Sequelize.JSON
            },
            image_url: {
                type: Sequelize.STRING(500)
            },
            accent_color: {
                type: Sequelize.STRING(7)
            },
            accent_bg_color: {
                type: Sequelize.STRING(7)
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 2. Discount Codes
        await queryInterface.createTable('discount_codes', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            code: {
                type: Sequelize.STRING(50),
                unique: true,
                allowNull: false
            },
            discount_type: {
                type: Sequelize.ENUM('percentage', 'fixed'),
                allowNull: false
            },
            discount_value: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            minimum_order_amount: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0
            },
            usage_limit: {
                type: Sequelize.INTEGER
            },
            usage_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            expires_at: {
                type: Sequelize.DATE
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 3. Admin Users
        await queryInterface.createTable('admin_users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            email: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            password_hash: {
                type: Sequelize.STRING,
                allowNull: false
            },
            full_name: {
                type: Sequelize.STRING(100)
            },
            last_login: {
                type: Sequelize.DATE
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 4. Shipping Config
        await queryInterface.createTable('shipping_config', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            state_name: {
                type: Sequelize.STRING(100),
                unique: true,
                allowNull: false
            },
            shipping_fee: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 5. Social Media Links
        await queryInterface.createTable('social_media_links', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            platform: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            url: {
                type: Sequelize.STRING(500),
                allowNull: false
            },
            icon_name: {
                type: Sequelize.STRING(50)
            },
            display_order: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 6. Orders
        await queryInterface.createTable('orders', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            order_number: {
                type: Sequelize.STRING(50),
                unique: true,
                allowNull: false
            },
            customer_first_name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            customer_last_name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            customer_email: {
                type: Sequelize.STRING,
                allowNull: false
            },
            customer_phone: {
                type: Sequelize.STRING(20),
                allowNull: false
            },
            shipping_address: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            shipping_city: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            shipping_state: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            subtotal: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            shipping_fee: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            discount_amount: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0
            },
            total_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            payment_status: {
                type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'),
                defaultValue: 'pending'
            },
            payment_reference: {
                type: Sequelize.STRING
            },
            order_status: {
                type: Sequelize.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
                defaultValue: 'pending'
            },
            discount_code_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'discount_codes',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            notes: {
                type: Sequelize.TEXT
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 7. Order Items
        await queryInterface.createTable('order_items', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            order_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'orders',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            product_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            product_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            subtotal: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 8. Reviews
        await queryInterface.createTable('reviews', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            customer_name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            customer_email: {
                type: Sequelize.STRING
            },
            rating: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            review_text: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('pending', 'approved', 'rejected'),
                defaultValue: 'pending'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 9. Blog Posts
        await queryInterface.createTable('blog_posts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            excerpt: {
                type: Sequelize.TEXT
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            category: {
                type: Sequelize.STRING(100)
            },
            image_url: {
                type: Sequelize.STRING(500)
            },
            author: {
                type: Sequelize.STRING(100),
                defaultValue: 'Admin'
            },
            is_published: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            published_at: {
                type: Sequelize.DATE
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 10. Order Status History
        await queryInterface.createTable('order_status_history', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            order_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'orders',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            old_status: {
                type: Sequelize.STRING(50)
            },
            new_status: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            changed_by: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'admin_users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            notes: {
                type: Sequelize.TEXT
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Add Indexes
        await queryInterface.addIndex('products', ['is_active']);
        await queryInterface.addIndex('orders', ['order_number']);
        await queryInterface.addIndex('orders', ['customer_email']);
        await queryInterface.addIndex('orders', ['order_status']);
        await queryInterface.addIndex('reviews', ['product_id']);
        await queryInterface.addIndex('reviews', ['status']);
        await queryInterface.addIndex('blog_posts', ['is_published']);
        await queryInterface.addIndex('admin_users', ['email']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('order_status_history');
        await queryInterface.dropTable('blog_posts');
        await queryInterface.dropTable('reviews');
        await queryInterface.dropTable('order_items');
        await queryInterface.dropTable('orders');
        await queryInterface.dropTable('social_media_links');
        await queryInterface.dropTable('shipping_config');
        await queryInterface.dropTable('admin_users');
        await queryInterface.dropTable('discount_codes');
        await queryInterface.dropTable('products');
    }
};
