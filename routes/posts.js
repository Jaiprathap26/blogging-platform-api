const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new blog post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Blog post created
 */


/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all blog posts
 *     parameters:
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of blog posts
 */


/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a single blog post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Blog post found
 *       404:
 *         description: Post not found
 */


/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a blog post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Post updated
 *       404:
 *         description: Post not found
 */


/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Post deleted
 *       404:
 *         description: Post not found
 */



router.post("/", async (req, res) => {
    const{ title, content, category, tags } = req.body;

    if (!title || !content || !category) {
        return res.status(400).json({error: "All fields required"}); 
    }

    const connection = await db.getConnection();    

    try {
        await connection.beginTransaction();
         
        const [result] = await connection.execute(
            "INSERT INTO posts (title, content, category) VALUES (?, ?, ?)",
            [title, content, category]
        );

        const postId = result.insertId;

        for (let tag of tags) {
            const [[existing]] = await connection.execute(
                "SELECT id FROM tags WHERE name=?",
                [tag]
            );

            let tagId = existing?.id;

            if(!tagId) {
                const [newTag] = await connection.execute(
                    "INSERT INTO tags (name) VALUES (?)",
                    [tag]
                );
                tagId = newTag.insertId
            }

            await connection.execute(
                "INSERT INTO post_tags (post_Id, tag_Id) VALUES (?, ?)",
                [postId, tagId]
            );
        }

        res.status(201).json({ message: "Post Created", postId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

router.get("/", async (req, res) => {
    const term = req.query.term;

    let query = `
    SELECT 
        p.id,
        p.title,
        p.content,
        p.category,
        p.created_at,
        p.updated_at,
        GROUP_CONCAT(t.name) AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    `;

    let params = [];

    if (term) {
        query +=`
        WHERE p.title LIKE ?
        OR p.content LIKE ?
        OR p.category LIKE ?
        OR t.name LIKE ?
        `;
        params = Array(4).fill(`%${term}%`);
    }

    query += "GROUP BY p.id";

    const [rows] = await db.execute(query, params);

    //convert "node.js,MySQL" → ["Node.js","MySQL"]
    const posts = rows.map(post =>({
        ...post,
        tags: post.tags ? post.tags.split(",") : []
    }));

    res.json(posts);
});

router.get("/:id", async (req, res) => {
    const postId = req.params.id;

    const query = `
    SELECT
        p.id,
        p.title,
        p.content,
        p.category,
        p.created_at,
        p.updated_at,
        GROUP_CONCAT(t.name) AS tags 
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.id = ?
    GROUP BY p.id 
    `;

    const [rows] = await db.execute(query, [postId]);

    if(rows.length === 0) {
        return res.status(404).json({error: "Post not found"});
    }

    const post = {
        ...rows[0],
        tags: rows[0].tags ? rows[0].tags.split(",") : []
    };

    res.json(post);
});

router.put("/:id", async (req, res) => {
    const postId = req.params.id;
    const { title, content, category, tags } = req.body;

    if( !title || !content || !category ) {
        return res.status(400).json({error: "All fileds required"});
    }

    try {
        //Check post exsits
        const [[post]] = await db.execute(
            "SELECT id FROM posts WHERE id = ?",
            [postId]
        );

        if(!post) {
            return res.status(404).json({error: "Page not found"});
        }

        //Update post
        await db.execute(
            "UPDATE posts SET title=?, content=?, category=? WHERE id=?",
            [title, content, category, postId]
        );

        //Remove old tags 
        await db.execute(
            "DELETE FROM post_tags WHERE post_id = ?",
            [postId]
        );

        //Insert new tags 
        for(let tag of tags) {
            const [[existing]] = await db.execute(
                "SELECT id FROM tags WHERE name = ?",
                [tag]
            );

            let tagId = existing?.id;

            if(!tagId) {
                const [newTag] = await db.execute(
                    "INSERT INTO tags (name) VALUES (?)",
                    [tag]
                );
                tagId =newTag.insertId;
        }

        await db.execute(
            "INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)",
            [postId, tagId]
        );
    }

    res.json({message: "Post updated successfully"});

    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

router.delete("/:id", async (req, res) => {
    const postId = req.params.id;

    try{
        const[result] = await db.execute(
            "DELETE FROM posts WHERE id = ?",
            [postId]
        );

        if(result.affectedRows === 0) {
            return res.status(404).json({error: "Post not found"});
        }

        res.status(204).send();

    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

module.exports = router;
