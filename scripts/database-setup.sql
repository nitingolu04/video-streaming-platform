-- Database Setup for Video Streaming Platform
-- This script sets up the necessary tables for the platform

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    location VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    subscriber_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Videos table
CREATE TABLE videos (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    video_url VARCHAR(1000) NOT NULL,
    thumbnail_url VARCHAR(1000),
    duration INT NOT NULL, -- in seconds
    file_size BIGINT, -- in bytes
    video_quality VARCHAR(20) DEFAULT '720p',
    status ENUM('processing', 'published', 'private', 'deleted') DEFAULT 'processing',
    category VARCHAR(100),
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    dislike_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    visibility ENUM('public', 'unlisted', 'private') DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    INDEX idx_view_count (view_count),
    FULLTEXT INDEX idx_title_description (title, description)
);

-- Video tags table
CREATE TABLE video_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(36) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_video_tag (video_id, tag),
    INDEX idx_tag (tag)
);

-- Comments table
CREATE TABLE comments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    video_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    parent_id VARCHAR(36) NULL, -- for replies
    content TEXT NOT NULL,
    like_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_video_id (video_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_created_at (created_at)
);

-- Likes table (for videos)
CREATE TABLE video_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    is_like BOOLEAN NOT NULL, -- TRUE for like, FALSE for dislike
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_video_like (user_id, video_id),
    INDEX idx_video_id (video_id),
    INDEX idx_user_id (user_id)
);

-- Comment likes table
CREATE TABLE comment_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_comment_like (user_id, comment_id),
    INDEX idx_comment_id (comment_id),
    INDEX idx_user_id (user_id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subscriber_id VARCHAR(36) NOT NULL,
    channel_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscriber_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subscription (subscriber_id, channel_id),
    INDEX idx_subscriber_id (subscriber_id),
    INDEX idx_channel_id (channel_id)
);

-- Watch history table
CREATE TABLE watch_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    video_id VARCHAR(36) NOT NULL,
    watch_time INT DEFAULT 0, -- seconds watched
    completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_video_watch (user_id, video_id),
    INDEX idx_user_id (user_id),
    INDEX idx_video_id (video_id),
    INDEX idx_last_watched_at (last_watched_at)
);

-- Playlists table
CREATE TABLE playlists (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    video_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_public (is_public)
);

-- Playlist videos table
CREATE TABLE playlist_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playlist_id VARCHAR(36) NOT NULL,
    video_id VARCHAR(36) NOT NULL,
    position INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_playlist_video (playlist_id, video_id),
    INDEX idx_playlist_id (playlist_id),
    INDEX idx_video_id (video_id),
    INDEX idx_position (position)
);

-- Video analytics table
CREATE TABLE video_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    watch_time_total INT DEFAULT 0, -- total seconds watched
    unique_viewers INT DEFAULT 0,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_video_date (video_id, date),
    INDEX idx_video_id (video_id),
    INDEX idx_date (date)
);

-- Notifications table
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    type ENUM('like', 'comment', 'subscribe', 'upload', 'mention') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    related_id VARCHAR(36), -- ID of related entity (video, comment, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Insert sample data
INSERT INTO users (id, name, email, password_hash, bio, is_verified) VALUES
('user-1', 'Tech Academy', 'tech@academy.com', '$2b$10$hash1', 'Educational technology content', TRUE),
('user-2', 'Dev Channel', 'dev@channel.com', '$2b$10$hash2', 'Web development tutorials', TRUE),
('user-3', 'AI Insights', 'ai@insights.com', '$2b$10$hash3', 'Artificial Intelligence explained', FALSE);

INSERT INTO videos (id, user_id, title, description, video_url, thumbnail_url, duration, status, category, view_count, like_count) VALUES
('video-1', 'user-1', 'Introduction to Cloud Computing', 'Learn the fundamentals of cloud computing...', 'https://example.com/video1.mp4', 'https://example.com/thumb1.jpg', 930, 'published', 'Technology', 125847, 3420),
('video-2', 'user-2', 'Modern Web Development Trends', 'Explore the latest trends in web development...', 'https://example.com/video2.mp4', 'https://example.com/thumb2.jpg', 1335, 'published', 'Technology', 89234, 2156),
('video-3', 'user-3', 'AI and Machine Learning Basics', 'Understanding AI and ML fundamentals...', 'https://example.com/video3.mp4', 'https://example.com/thumb3.jpg', 1125, 'published', 'Technology', 203456, 5678);

INSERT INTO video_tags (video_id, tag) VALUES
('video-1', 'cloud computing'),
('video-1', 'technology'),
('video-1', 'tutorial'),
('video-2', 'web development'),
('video-2', 'javascript'),
('video-2', 'react'),
('video-3', 'artificial intelligence'),
('video-3', 'machine learning'),
('video-3', 'python');

-- Create indexes for better performance
CREATE INDEX idx_videos_trending ON videos (view_count DESC, created_at DESC);
CREATE INDEX idx_videos_latest ON videos (created_at DESC);
CREATE INDEX idx_comments_latest ON comments (created_at DESC);

COMMIT;
