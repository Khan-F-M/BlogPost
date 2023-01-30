const Sequelize = require('sequelize');
const Op = Sequelize.Op

var sequelize = new Sequelize('yhspltqx', 'yhspltqx', '20ULhenF9pVVHdHUaianROcBDBWNe0dz', {
    host: 'manny.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { 
            rejectUnauthorized: false 
        }
    },
    query: { raw: true },
    logging: false
});

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, { foreignKey: 'category' });

module.exports.initialize = () => { 
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve('database synced');
        }).catch((error) => {
            reject({'unable to sync the database': error});
        })
    });
};

module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Post.findAll());
        }).catch(() => {
            reject('no results returned');
        })
    });
};

module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Post.findAll({
                where: {
                    published: true
                }
            }));
        }).catch(() => {
            reject('no results returned');
        })
    });
};

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Category.findAll());
        }).catch(() => {
            reject('no results returned');
        })
    });
};


module.exports.addPost = (postData) => { //The issue is here
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;

        for (var prop in postData) {
            if (postData[prop] == "") {
                postData[prop] == null;
            }
        }
        postData.postDate = new Date();

        Post.create(postData).then(() => {
            resolve(Post.findAll()); 
        }).catch(() => {
            reject('unable to create post');
        })

    });
};

module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Post.findAll({
                where: {
                    category: category
                }
            }));
        }).catch(() => {
            reject('no results returned');
        })
    });
};

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Post.findAll({
                where: {
                    postDate: { //a column in the table
                        [Op.gte]: new Date(minDateStr)
                    }
                }
            }));
        }).catch(() => {
            reject('no results returned');
        })
    });
};

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Post.findAll({
                where: {
                    id: id
                }
            }));
        }).catch(() => {
            reject('no results returned');
        })
    });
};

module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Post.findAll({
                where: {
                    published: true,
                    category: category
                }
            }));
        }).catch(() => {
            reject('no results returned');
        })
    });
};

module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        for (var i in categoryData) {
            if (categoryData[i] == "") {
                categoryData[i] == null;
            }
        }

        Category.create(categoryData).then(() => {
            resolve(Category.findAll()); //not sure tbh
        }).catch(() => {
            reject('unable to create category');
        })

    });
};

module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        })
        .then(resolve())
        .catch(reject('unable to delete category'))
    });
};

module.exports.deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                id: id
            }
        })
        .then(resolve())
        .catch(reject('unable to delete post'))
    });
};