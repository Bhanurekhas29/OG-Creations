CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    username      VARCHAR(60)  NOT NULL UNIQUE,
    email         VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(30)  NOT NULL DEFAULT 'admin',
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auth_tokens (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    token_hash CHAR(64)     NOT NULL UNIQUE,
    expires_at DATETIME     NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS password_resets (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    token_hash CHAR(64)     NOT NULL UNIQUE,
    expires_at DATETIME     NOT NULL,
    used_at    DATETIME     NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS media (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(120) NOT NULL UNIQUE,
    mime       VARCHAR(60)  NOT NULL,
    data       MEDIUMBLOB   NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS site_settings (
    setting_key   VARCHAR(80) PRIMARY KEY,
    setting_value TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS nav_items (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    label      VARCHAR(60)  NOT NULL,
    url        VARCHAR(255) NOT NULL,
    sort_order INT          NOT NULL DEFAULT 0,
    is_active  TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed the default menu once.
INSERT INTO nav_items (label, url, sort_order)
SELECT t.label, t.url, t.sort_order FROM (
    SELECT 'Home' AS label, '#home' AS url, 1 AS sort_order UNION ALL
    SELECT 'About', '#about', 2 UNION ALL
    SELECT 'Services', '#services', 3 UNION ALL
    SELECT 'Works', '#works', 4 UNION ALL
    SELECT 'Process', '#process', 5 UNION ALL
    SELECT 'Contact', '#contact', 6
) t WHERE NOT EXISTS (SELECT 1 FROM nav_items);

CREATE TABLE IF NOT EXISTS services (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(60)  NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT '',
    image       VARCHAR(255) NOT NULL DEFAULT '',
    sort_order  INT          NOT NULL DEFAULT 0,
    is_active   TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed the default services once.
INSERT INTO services (title, description, image, sort_order)
SELECT t.title, t.description, t.image, t.sort_order FROM (
    SELECT 'Movies' AS title, 'Feature films developed and delivered from script to screen.' AS description, '/images/service-movies.jpg' AS image, 1 AS sort_order UNION ALL
    SELECT 'Web Series', 'Episodic storytelling built for streaming audiences.', '/images/service-web-series.jpg', 2 UNION ALL
    SELECT 'Casting', 'The right face for every role — discovered, tested, shaped.', '/images/service-casting.jpg', 3 UNION ALL
    SELECT 'Ad Shoots', 'Commercials and brand films crafted to hold attention in seconds.', '/images/service-ad-shoots.jpg', 4 UNION ALL
    SELECT 'Modeling', 'Portfolios and campaigns that frame talent at its best.', '/images/service-modeling.jpg', 5 UNION ALL
    SELECT 'Events', 'Launches, shows and celebrations captured with cinematic care.', '/images/service-events.jpg', 6 UNION ALL
    SELECT 'Post Production', 'Editing, colour and sound finished to a single standard.', '/images/service-post-production.jpg', 7
) t WHERE NOT EXISTS (SELECT 1 FROM services);

CREATE TABLE IF NOT EXISTS works (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(80)  NOT NULL,
    category   VARCHAR(60)  NOT NULL DEFAULT '',
    video_url  VARCHAR(500) NOT NULL DEFAULT '',
    thumbnail  VARCHAR(255) NOT NULL DEFAULT '',
    sort_order INT          NOT NULL DEFAULT 0,
    is_active  TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed five placeholder projects once.
INSERT INTO works (title, category, thumbnail, sort_order)
SELECT t.title, t.category, t.thumbnail, t.sort_order FROM (
    SELECT 'Project Title' AS title, 'Movies' AS category, '/images/work-movies.jpg' AS thumbnail, 1 AS sort_order UNION ALL
    SELECT 'Project Title', 'Web Series', '/images/work-web-series.jpg', 2 UNION ALL
    SELECT 'Project Title', 'Ad Shoots', '/images/work-ad-shoots.jpg', 3 UNION ALL
    SELECT 'Project Title', 'Modeling', '/images/work-modeling.jpg', 4 UNION ALL
    SELECT 'Project Title', 'Events', '/images/work-events.jpg', 5
) t WHERE NOT EXISTS (SELECT 1 FROM works);

CREATE TABLE IF NOT EXISTS process_steps (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(60)  NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT '',
    icon        VARCHAR(30)  NOT NULL DEFAULT 'Star',
    sort_order  INT          NOT NULL DEFAULT 0,
    is_active   TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed the default five stages once.
INSERT INTO process_steps (title, description, icon, sort_order)
SELECT t.title, t.description, t.icon, t.sort_order FROM (
    SELECT 'Concept' AS title, 'Shaping the idea, story and creative direction.' AS description, 'Lightbulb' AS icon, 1 AS sort_order UNION ALL
    SELECT 'Planning', 'Scripts, schedules, locations and budgets.', 'ClipboardList', 2 UNION ALL
    SELECT 'Casting', 'Selecting talent that fits every role.', 'Users', 3 UNION ALL
    SELECT 'Production', 'Filming with the right crew and equipment.', 'Clapperboard', 4 UNION ALL
    SELECT 'Final Delivery', 'Edit, grade and deliver the finished work.', 'Package', 5
) t WHERE NOT EXISTS (SELECT 1 FROM process_steps);

CREATE TABLE IF NOT EXISTS upcoming_projects (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(80)  NOT NULL,
    tagline         VARCHAR(255) NOT NULL DEFAULT '',
    lead_actor      VARCHAR(80)  NOT NULL DEFAULT '',
    lead_actress    VARCHAR(80)  NOT NULL DEFAULT '',
    supporting_cast VARCHAR(600) NOT NULL DEFAULT '',
    release_date    VARCHAR(40)  NOT NULL DEFAULT '',
    status_label    VARCHAR(40)  NOT NULL DEFAULT '',
    image           VARCHAR(255) NOT NULL DEFAULT '',
    sort_order      INT          NOT NULL DEFAULT 0,
    is_active       TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed one sample project once.
INSERT INTO upcoming_projects (title, tagline, lead_actor, lead_actress, supporting_cast, release_date, status_label, image, sort_order)
SELECT 'The Silent Chapter', 'Some truths are better left unsaid.
But he chose to speak.', 'Vikram Raj', 'Ananya Rao',
       'Meera Nair
Rithvik Shankar
Sathish Kumar', 'Dec 2025', 'In Cinemas', '/images/upcoming-silent-chapter.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM upcoming_projects);

CREATE TABLE IF NOT EXISTS why_items (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(80)  NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT '',
    sort_order  INT          NOT NULL DEFAULT 0,
    is_active   TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed the default four reasons once.
INSERT INTO why_items (title, description, sort_order)
SELECT t.title, t.description, t.sort_order FROM (
    SELECT 'Creative Storytelling' AS title, 'Every project begins with the story and the emotion it should carry.' AS description, 1 AS sort_order UNION ALL
    SELECT 'End-to-End Production', 'Concept, casting, shoot and delivery handled in one place.', 2 UNION ALL
    SELECT 'Collaborative Execution', 'We work closely with you at every stage, keeping your vision central.', 3 UNION ALL
    SELECT 'Production Quality', 'Careful attention to lighting, framing, sound and finish.', 4
) t WHERE NOT EXISTS (SELECT 1 FROM why_items);

CREATE TABLE IF NOT EXISTS enquiries (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(80)   NOT NULL,
    phone      VARCHAR(20)   NOT NULL,
    email      VARCHAR(120)  NOT NULL,
    service    VARCHAR(80)   NOT NULL,
    message    TEXT          NOT NULL,
    ip         VARCHAR(45)   NOT NULL DEFAULT '',
    is_read    TINYINT(1)    NOT NULL DEFAULT 0,
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_created (ip, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Settings from the first iteration that are no longer used.
DELETE FROM site_settings WHERE setting_key IN ('logo', 'tagline');

INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
    ('site_name', 'OG Creations'),
    ('header_logo', '/images/logo-medallion.jpg'),
    ('footer_logo', '/images/logo-medallion.jpg'),
    ('meta_title', 'OG Creations - Concept to Creation'),
    ('meta_description', ''),
    ('meta_keywords', ''),
    ('show_credits', '1'),
    ('credit_url', 'https://vetriitsystems.com'),
    ('nav_cta_enabled', '1'),
    ('nav_cta_label', 'Start a Project'),
    ('nav_cta_url', '#contact'),
    ('hero_eyebrow', 'Film & Creative Production · Chennai'),
    ('hero_heading', 'From *Concept* to Creation'),
    ('hero_description', 'OG Creations brings stories to the screen — movies, web series, commercials, casting, modeling and events, produced with cinematic care.'),
    ('hero_btn1_label', 'Start a Project'),
    ('hero_btn1_url', '#contact'),
    ('hero_btn2_label', 'Explore Our Craft'),
    ('hero_btn2_url', '#services'),
    ('hero_tags', 'Direction\nCinematography\nArt Direction\nPost'),
    ('hero_bg_image', '/images/hero-bg.jpg'),
    ('marquee_enabled', '1'),
    ('marquee_items', 'Movies\nWeb Series\nCasting\nAd Shoots\nModeling\nEvents'),
    ('marquee_speed', '30'),
    ('studio_eyebrow', 'The Studio'),
    ('studio_heading', 'Built for stories that deserve'),
    ('studio_heading_accent', 'the big screen.'),
    ('studio_text1', 'OG CREATIONS is a film and creative production house devoted to the craft of cinema — direction, cinematography, casting, art and post, held to a single standard of finish.'),
    ('studio_text2', 'We keep our sets bright and our crews sharp. Whether the brief is a feature film, a streaming series or a sixty-second spot, the work is art-directed frame by frame — nothing left to default.'),
    ('studio_btn_label', 'See What We Produce'),
    ('studio_btn_url', '#services'),
    ('studio_image1', '/images/studio-1.jpg'),
    ('studio_image2', '/images/studio-2.jpg'),
    ('studio_image3', '/images/studio-3.jpg'),
    ('services_eyebrow', 'Our Services'),
    ('services_heading', 'What We Create'),
    ('works_eyebrow', 'Featured Projects'),
    ('works_heading', 'Our Works'),
    ('works_categories', 'Movies
Web Series
Ad Shoots
Modeling
Events'),
    ('bts_heading_bold', 'Behind'),
    ('bts_heading_light', 'The Scenes'),
    ('bts_1_image', '/images/bts-1.jpg'), ('bts_1_caption', 'Scene 72 · Take 4'),
    ('bts_2_image', '/images/bts-2.jpg'), ('bts_2_caption', 'The quiet before the scene'),
    ('bts_3_image', '/images/bts-3.jpg'), ('bts_3_caption', 'Every frame earns its place'),
    ('bts_3_subtitle', 'A working set, from first light to last.'),
    ('bts_4_image', '/images/bts-4.jpg'), ('bts_4_caption', 'Every frame, monitored'),
    ('bts_5_image', '/images/bts-5.jpg'), ('bts_5_caption', 'Golden hour, on location'),
    ('process_eyebrow', 'Our Production Process'),
    ('process_heading', 'Five Stages, One Vision'),
    ('upcoming_heading', 'Upcoming Projects'),
    ('upcoming_subtitle', 'Exciting Stories · Powerful Performances · Coming Soon'),
    ('why_eyebrow', 'Why Choose OG Creations'),
    ('why_heading', 'Crafted with Intent'),
    ('why_image', '/images/why.jpg'),
    ('contact_eyebrow', 'Start a Project'),
    ('contact_heading', 'Have a Story to Tell?'),
    ('contact_subheading', 'Let''s Bring It to Life.'),
    ('contact_phone', '9884277001'),
    ('contact_email', 'ogcreationsofficial@gmail.com'),
    ('contact_address', 'No. 15, Rajamannar Salai, KK Nagar, Chennai 600 078'),
    ('contact_map_embed', 'https://www.google.com/maps?q=No.+15+Rajamannar+Salai+KK+Nagar+Chennai+600078&output=embed'),
    ('contact_directions_url', 'https://www.google.com/maps/dir/?api=1&destination=No.+15+Rajamannar+Salai+KK+Nagar+Chennai+600078'),
    ('contact_bg_image', '/images/contact-bg.jpg'),
    ('contact_notify_email', 'ogcreationsofficial@gmail.com'),
    ('contact_success_message', 'Thank you! Your enquiry has been received. Our team will get back to you shortly.'),
    ('favicon', '/images/favicon-1793356986-ea515d.png'),
    ('footer_tagline', 'Concept to Creation'),
    ('footer_description', 'Film and creative production, from concept to creation.'),
    ('footer_copyright', 'All rights reserved.'),
    ('footer_navigate', '[{"label":"About","url":"#about"},{"label":"Services","url":"#services"},{"label":"Works","url":"#works"},{"label":"Process","url":"#process"},{"label":"Contact","url":"#contact"}]'),
    ('footer_services', '[{"label":"Movies","url":"#services"},{"label":"Web Series","url":"#services"},{"label":"Casting","url":"#services"},{"label":"Ad Shoots","url":"#services"},{"label":"Modeling","url":"#services"},{"label":"Events","url":"#services"}]'),
    ('social_instagram', ''),
    ('social_facebook', ''),
    ('social_youtube', ''),
    ('float_call_enabled', '1'),
    ('float_call_number', '9884277001'),
    ('float_wa_enabled', '1'),
    ('float_wa_number', '919884277001'),
    ('float_wa_message', 'Hi OG Creations, I would like to know more about your services.');
