const Category = require('./Category');
const Message = require('./Message');
const Post = require('./Post');
const User = require('./User');
const Tag = require('./Tag');
const PostTag = require('./PostTag');

User.hasMany(Post, {
    foreignKey: 'user_id'
});

Post.belongsTo(User, {
    foreignKey: 'user_id'
});

Post.belongsTo(Category, {
    foreignkey: 'category_id'
});

Category.hasMany(Post, {
    foreignKey: 'category_id'
});

Post.hasMany(Message, {
    foreignKey: 'post_id'
});

Message.belongsTo(Post, {
    foreignKey: 'post_id'
});

User.hasMany(Message, {
    foreignKey:'user_id'
});

Message.belongsTo(User, {
    foreignKey: 'user_id'
});

Tag.belongsToMany(Post, {
    through: PostTag,
    foreignKey: 'tag_id'
});

Post.belongsToMany(Tag, {
    through: PostTag,
    foreignKey: 'post_id'
});

module.exports = { Category, Message, Post, User, Tag, PostTag };
