const router = require('express').Router();
const { Post, User, Message, Category, Chat, Text } = require('../models');
const withAuth = require('../utils/auth');
const {Op} = require('sequelize');

router.get('/', withAuth, (req, res) => {
    Category.findAll({
        attributes: [
            'id',
            'category_name'
        ]
    })
    .then(categoryData => {
        const categories = categoryData.map(category => category.get({ plain: true }));
        
        // gets all posts created by logged in user
        Post.findAll({
            where:{
                user_id: req.session.user_id
            },
            attributes: [
                'id',
                'title',
                'description',
                'price',
                'created_at',
                'image_url'
            ],
            include: [
                {
                    // includes the logged in user's username
                    model: User,
                    attributes:['username']
                },
                {
                    // includes the category of the posting
                    model: Category,
                    attributes:['id','category_name']
                }
            ]
        })
        .then(postData => {
            const posts = postData.map(post => post.get({ plain: true}));
            
            posts.forEach(post => post.myPost = true);

            // gets all chats user is invovled in
            Chat.findAll({
                where:{
                    [Op.or]: [{recipient: req.session.user_id}, {user_id:req.session.user_id}]
                },
                group: ['id'], 
                attributes: [
                    'id',
                    'post_id',
                    'user_id',
                    'recipient'
                ],
                include: [
                    {
                        model:User,
                        attributes:['id','username']
                    },
                    {
                        model:Post,
                        attributes:['id','title']
                    },
                    {
                        model:Text,
                        attributes:['chat_text']
                    }    
                ] 
            })
            .then(dbChatData => {
                
                const chats = dbChatData.map(chat => chat.get({ plain: true }));
                
                // gets all messages created by logged in user
                Message.findAll({
                    where: {
                        user_id: req.session.user_id
                    },
                    attributes: [
                        'id',
                        'message_text', 
                        'user_id',
                        'post_id',
                        'created_at'
                    ],
                    include: [
                        {
                            // includes the post that the message was created on
                            model: Post,
                            attributes: ['id', 'title', 'description'],
                            include: {
                                model: User,
                                attributes: ['username']
                            }
                        },
                        {   
                            // includes the logged in user's username
                            model: User,
                            attributes: ['username']
                        }
                    ]
                })
                .then(messageData =>{
                    const messages = messageData.map(message => message.get({ plain: true }));
                    
                    res.render('dashboard', { 
                        categories,
                        posts,
                        messages,
                        chats,
                        username: req.session.username,
                        loggedIn: true
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json(err);
                });
            });
        });
    });
});

router.get('/edit/:id', withAuth, (req,res) => {
    Category.findAll({
        attributes: [
            'id',
            'category_name'
        ]
    })
    .then(categoryData => {
        const categories = categoryData.map(category => category.get({ plain: true}));
            
        Post.findByPk(req.params.id, {
            attributes: [
                'id',
                'title',
                'description',
                'price',
                'created_at',
                'image_url'
            ],
            include: [
                {
                    model: Message,
                    attributes: ['id', 'message_text', 'post_id', 'user_id', 'created_at'],
                    include: {
                        model: User,
                        attributes: ['username']
                    }
                },
                {
                    model: User,
                    attributes: ['username']
                },
                {
                    model: Category,
                    attributes: ['category_name']
                }
            ]
        })
        .then(userData => {
            
            if(userData) {
                const post = userData.get({ plain: true});
                
                if (req.session.username === post.user.username) {
                    return res.render('edit-posts', {
                        post,
                        categories,
                        username: req.session.username,
                        loggedIn: true
                    });
                } else {
                    res.render('error', {
                        username: req.session.username,
                        message: 'This post does not belong to you!',
                        loggedIn: true
                    });
                }
                
            } else {
                return res.status(404).end();
            }
        })
        .catch(err => {
            return res.status(500).json(err);
        });
    });
});

module.exports = router;