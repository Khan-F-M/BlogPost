const express = require("express");
const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
const blog = require("./blog-service.js");
const app = express();

cloudinary.config({
    cloud_name: 'drdcw2b5u',
    api_key: '289772378654658',
    api_secret: 'wWz6qPFN0vyYJT2G3OWPcNyCbGI',
    secure: true
});

const upload = multer(); // no { storage: storage } since we are not using disk storage


const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function (context) {
            return stripJs(context);
        },
        formatDate: function (dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
}));

app.set('view engine', '.hbs');

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.use(express.static('views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.redirect('/blog');
});

app.get("/about", (req, res) => {
    // res.sendFile(path.join(__dirname, "/views/about.html"));
    res.render("about");
});

app.get('/blog', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
    try {
        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0];

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData })
});

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try {

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the post by "id"
        viewData.post = await blog.getPostById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData })
});

app.get("/categories", function (req, res) {
    blog.getCategories().then((data) => {
        if (data.length > 0) {
            res.render("categories", { categories: data });
        }
        else {
            res.render("categories", { message: "no results" });
        }
    }).catch((err) => {
        res.render("categories", { message: "no results" });
    })
});

app.get("/categories/add", (req, res) => {
    // res.sendFile(path.join(__dirname, "/views/addPost.html"));
    res.render("addCategory")
});

app.post("/categories/add", (req, res) => {
    blog.addCategory(req.body).then(() => {
        res.redirect("/categories");
    })
});

app.get("/categories/delete/:id", (req, res) => {
    blog.deleteCategoryById(req.params.id).then((data) => {
        res.redirect("/categories");
    }).catch((err) => {
        res.status(500).render("categories", { message: "Unable to Remove Category / Category not found" });
    })
});

app.get("/posts/add", (req, res) => {
    blog.getCategories().then((data) => {
        res.render("addPost", { categories: data });
    }).catch((err) => {
        res.render("addPost", { categories: [] });
    })
});

app.get("/posts", function (req, res) {
    if (req.query.category) {
        blog.getPostsByCategory(req.query.category).then((data) => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            }
            else {
                res.render("posts", { message: "no results" });
            }
        }).catch((err) => {
            res.render("posts", { message: "no results" });
        })
    }
    else if (req.query.minDate) {
        blog.getPostsByMinDate(req.query.minDate).then((data) => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            }
            else {
                res.render("posts", { message: "no results" });
            }
        }).catch((err) => {
            res.render("posts", { message: "no results" });
        })
    }
    else {
        blog.getAllPosts().then((data) => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            }
            else {
                res.render("posts", { message: "no results" });
            }
        }).catch((err) => {
            res.render("posts", { message: "no results" });
        })
    }
});

app.get("/post/:value", (req, res) => {
    blog.getPostById(req.params.value).then((data) => {
        res.json({ data });
    }).catch((err) => {
        res.json({ message: err });
    })
})

app.post('/posts/add', upload.single("featureImage"), function (req, res) {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        upload(req).then((uploaded) => {
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }

    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;

        blog.addPost(req.body).then(() => {
            res.redirect("/posts");
        })
    }
})

app.get("/posts/delete/:id", (req, res) => {
    blog.deletePostById(req.params.id).then((data) => {
        res.redirect("/posts");
    }).catch((err) => {
        res.status(500).render("posts", { message: "Unable to Remove Post / Post not found" });
    })
})

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "/views/error.html"));
});

blog.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Express http server listening on ${HTTP_PORT}`);
    });
}).catch(err => {
    console.log(err);
});