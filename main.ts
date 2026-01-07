import express from "npm:express";
import { join } from "https://deno.land/std/path/mod.ts";
import expressLess from "npm:express-less";
import fs from "node:fs"

export type CategoryType = "DEV" | "FOOD";

export interface IBlog {
    name: string,
    category: CategoryType 
    listStyle: string,
    excluded: boolean,
    sections: { 
        name : string,
        id: string,
        content: string,
    }[],
};

export interface ICategory {
    name: string,
    type: CategoryType,
    isExpanded: boolean,
};

export interface IBlogData {
    categories: ICategory[],
    blogs: IBlog[]
};


const app = express();

let blogs: IBlog[] = [];
let categories: ICategory[] = [];

app.use("/less-css", (req, res, next) => {
    const oneWeek = 7 * 24 * 60 * 60;
    res.setHeader("Cache-Control", `max-age=${oneWeek}`);
    next();
},expressLess(join(Deno.cwd(), "public", "less"), { compress: true }));

app.use("/css/keyframes.css", express.static("./public/less/keyframes.css", {}));

app.use("/assets", express.static("./public/assets/", {}));

app.use('/favicon.ico', express.static('./public/assets/favicon.ico'));

app.get("/", (req: any, res: any) => {
    try {
        let template = fs.readFileSync(join(Deno.cwd(), "views", "template.html")).toString();
        let indexFile = fs.readFileSync(join(Deno.cwd(), "views", "body.html")).toString();

        let html = template.replace("{{body}}", indexFile);

        res.send(html);
    } catch (err) {
        console.log(err);
        res.end();
    }
});

app.get("/blogs", (req: any, res: any) => {
    res.json(blogs.filter((b: IBlog) => !b.excluded)); 
});

app.get("/categories", (req: any, res: any) => {
    res.json(categories); 
});

app.get("/blogs/:blogName", async (req: any, res: any) => {
    try {
        let blog = blogs.find((b => b.name == req.params.blogName));

        let template = fs.readFileSync(join(Deno.cwd(), "views", "template.html")).toString();
        let blogContent = "";

        let category = categories.find((c) => c.type == blog.category);

        let index = 0;
        for(let section of blog.sections) {

            blogContent += `
                <section class="section ${index == 0 ? 'first' : ''}" id="${section.id}">
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
            index++;
        }

        let html = template.replace("{{body}}", blogContent);

        res.send(html);
    } catch (err) {
        console.log(err);
        res.end();
    }
});

app.get("/*path", async (req: any, res: any, next: any) => {

    if(req.path.endsWith(".php") ||
        req.path.startsWith("/.env") ||
        req.path.startsWith("/.well-known") ||
        req.path === "/dungeon") {
        
        let html = fs.readFileSync(join(Deno.cwd(), "views", "dungeon.html")).toString();
        res.send(html).end();
    }
    next();
});

app.listen(8000, () => {
    console.log("Server is running on http://localhost:8000");
    
    try {
        let data: IBlogData = CONFIG;
        blogs = data.blogs;
        categories = data.categories;
    }
    catch (err) {
        console.log(err);
    }
});

const CONFIG = {
    categories: [ 
        { 
            name: "Development",
            type: "DEV",
            isExpanded: false, 
        }, 
        { 
            name: "Food",
            type: "FOOD",
            isExpanded: false
        }
    ],
    blogs: [
        {
            name: "test",
            category: "FOOD",
            listStyle: "dot",
            excluded: true,
            sections: [
                { 
                    name :"Test", 
                    id: "test",
                    content: "<div class='col-12'><p>This is my blog. I will be posting my projects here and detailing how I did it and anything else related I guess.</p></div>"
                },
                { 
                    name :"Test 2", 
                    id: "test2",
                    content: "<div class='col-12'><p>This is my blog. I will be posting my projects here and detailing how I did it and anything else related I guess.</p></div>"
                },
                { 
                    name :"Test 3", 
                    id: "test3",
                    content: "<div class='col-12'><p>This is my blog. I will be posting my projects here and detailing how I did it and anything else related I guess.</p></div>"
                }
            ]
        }
    ]
};
