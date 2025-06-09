import express from "npm:express";
import path from "npm:path";
import expressLess from "npm:express-less";
import fs from "node:fs"

const app = express();

let blogs: any[] = [];
let categories: any[] = [];

app.use("/less-css", (req, res, next) => {
    const oneWeek = 7 * 24 * 60 * 60;
    res.setHeader("Cache-Control", `max-age=${oneWeek}`);
    next();
},expressLess(path.join(Deno.cwd(), "public", "less"), { compress: true }));

app.use("/assets", express.static("./public/assets/", {}));

app.use('/favicon.ico', express.static('./public/assets/favicon.ico'));

app.get("/", (req: any, res: any) => {
    try {
        let template = fs.readFileSync(path.join(Deno.cwd(), "views", "template.html")).toString();
        let indexFile = fs.readFileSync(path.join(Deno.cwd(), "views", "index.html")).toString();

        let html = template.replace("{{body}}", indexFile);

        res.send(html);
    } catch (err) {
        console.log(err);
        res.end();
    }
});

app.get("/blogs", (req: any, res: any) => {
    res.json(blogs); 
});

app.get("/categories", (req: any, res: any) => {
    res.json(categories); 
});

app.get("/blogs/:blogName", async (req: any, res: any) => {
    try {
        let blog = blogs.find((b => b.name == req.params.blogName));

        let template = fs.readFileSync(path.join(Deno.cwd(), "views", "template.html")).toString();
        let blogContent = "";

        let category = categories.find((c) => c.type == blog.category);

        for(let section of blog.sections) {
            blogContent += `
                <section class="section" id="${section.id}">
                    <span class="where-am-i">${category.name}/${blog.name}</span>

                    <div class="row"> 
                        <div class="col-12">
                            <h2>${section.name}</h2>
                        </div>
                        ${section.content}
                    </div>
                </section>
                <br>
            `
        }

        let html = template.replace("{{body}}", blogContent);

        res.send(html);
    } catch (err) {
        console.log(err);
        res.end();
    }
});


app.listen(8000, () => {
    console.log("Server is running on http://localhost:8888");
    
    let config = fs.readFileSync(path.join(Deno.cwd(), "blog-config.json"));
    try {
        let data = JSON.parse(config);
        blogs = data.blogs;
        categories = data.categories;
    }
    catch (err) {
        console.log(err);
    }
});


