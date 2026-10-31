<?php
declare(strict_types=1);

/**
 * One-time content update from the "OG Creations SEO Content" document: meta tags, section intros, service /
 * process / reason texts, image alt texts and the FAQ list. It runs once per database (flag content_seo_v1),
 * so it also reaches the live site on its first visit after a deploy; later edits made in the admin are kept.
 */

function ensure_faq_table(): void
{
    db()->exec(
        'CREATE TABLE IF NOT EXISTS faqs (
            id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            question   VARCHAR(255) NOT NULL,
            answer     TEXT         NOT NULL,
            sort_order INT          NOT NULL DEFAULT 0,
            is_active  TINYINT(1)   NOT NULL DEFAULT 1
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
}

/** Adds the projects' short description column when the database does not have it yet. */
function ensure_works_description(): void
{
    static $done = false;
    if ($done) return;
    $done = true;
    if (!db()->query("SHOW COLUMNS FROM works LIKE 'description'")->fetch()) {
        db()->exec("ALTER TABLE works ADD COLUMN description VARCHAR(255) NOT NULL DEFAULT '' AFTER category");
    }
}

function seo_content(): array
{
    return [
        'settings' => [
            'meta_title'       => 'Movie Production Company in Chennai | OG Creations',
            'meta_description' => 'OG Creations is a movie production house in Chennai for films, web series, short films, ad shoots, casting, modeling and events. Start your project.',
            'meta_keywords'    => 'movie production company, movie production house, production house, film making company, film producers, film and production companies, cinematography companies, video editing agency, video film company, production houses near me, video production company, commercial modeling, film studio',
            'hero_description' => 'OG Creations is a movie production company in Chennai, bringing stories to life through movies, web series, short films, ad shoots, casting, modeling and events.',
            'studio_text1'     => 'OG Creations is a film production house in Chennai, bringing stories to life through direction, cinematography, casting, art direction and post-production.',
            'studio_text2'     => 'From feature films and web series to short films and ad shoots, we bring creative ideas to the screen with thoughtful planning, skilled execution and attention to every frame.',
            'services_intro'   => 'OG Creations is a film and video production company in Chennai, bringing creative ideas to life through movies, web series, casting, ad shoots, modeling and events. From concept development to final delivery, we bring every production together with creativity and attention to detail.',
            'works_intro'      => 'Explore films, web series, short films and ad films produced by OG Creations. Discover our creative projects and the stories we bring to life through film production in Chennai.',
            'works_categories' => "Movies\nWeb Series\nShort Films\nAd Shoots\nModeling\nEvents",
            'bts_intro'        => 'Step inside the world of OG Creations and discover the creativity behind every production—from on-set filming and cinematography to lighting, makeup and the final frame.',
            'bts_1_alt'        => 'Clapperboard on a film set during a shoot by OG Creations',
            'bts_2_alt'        => 'Makeup artist preparing an actress before a shoot',
            'bts_3_alt'        => 'OG Creations film crew shooting a ballroom scene with a director, camera dolly and monitors',
            'bts_4_alt'        => 'Cinematographer watching a camera monitor on a film set in Chennai',
            'bts_5_alt'        => 'Film crew shooting two actors on location at golden hour',
            'process_intro'    => 'Every OG Creations production, from movies and web series to ad films and short films, follows a structured process—from the first creative idea to final delivery.',
            'upcoming_image_alt' => 'Film crew working with cameras and monitors on a production set.',
            'why_subtext'      => 'Discover why filmmakers, brands and artists choose OG Creations as their creative production partner in Chennai.',
            'contact_intro'    => 'Planning a movie, web series, short film or ad shoot in Chennai? Share your project details, and the OG Creations team will get back to you to discuss the next steps.',
            'contact_map_title' => 'OG Creations Studio, KK Nagar, Chennai',
            'faq_eyebrow'      => 'Frequently Asked Questions',
            'faq_heading'      => 'Film Production Questions, Answered.',
            'faq_intro'        => 'Have questions about our film, web series or ad production services in Chennai? Find answers below or contact OG Creations to discuss your project.',
        ],
        'services' => [
            'Movies'      => 'From concept to screen, we bring feature films to life through creative direction, cinematography, casting and post-production.',
            'Web Series'  => 'We produce engaging web series, managing the creative and production process from planning and casting to filming and final editing.',
            'Casting'     => 'We help productions find suitable talent for movies, web series, short films and ad shoots through a focused casting process.',
            'Ad Shoots'   => "We create commercial ads and brand films, bringing together concepts, scripts, filming and editing to communicate your brand's message.",
            'Modeling'    => 'We produce fashion shoots, model portfolios and commercial modeling projects with attention to lighting, composition and visual presentation.',
            'Events'      => 'We support event production for launches, brand events and stage productions, capturing important moments with professional visual storytelling.',
            'Short Films' => 'We bring short-film stories to life, from concept development and casting to filming and final editing. Our team creates compelling short films for filmmakers, brands and creative projects.',
        ],
        'process' => [
            2 => 'Organising scripts, schedules, locations and budgets.',
            4 => 'Bringing the vision to life with the right crew and equipment.',
            5 => 'Completing post-production, video editing, colour grading and delivery of the finished project.',
        ],
        'why' => [
            'Creative Storytelling'   => 'Every project begins with a story, shaped by the emotions and vision we want to bring to the screen.',
            'End-to-End Production'   => 'From concept development and casting to filming and final delivery, we bring the production process together under one roof.',
            'Collaborative Execution' => 'We work closely with you at every stage, ensuring your ideas and creative vision guide the project.',
            'Production Quality'      => 'We pay attention to lighting, framing, sound and finishing details to deliver a polished final production.',
        ],
        'faqs' => [
            ['What does a movie production company in Chennai do?', 'A movie production company manages the process of bringing a film from concept to screen. At OG Creations, this includes planning, casting, filming and final delivery, with direction, cinematography, art direction and post-production coordinated throughout the project.'],
            ['Does OG Creations produce web series and short films?', "OG Creations works on movies, web series and short films, from concept development to filming and final editing. Contact our team to discuss your project's requirements."],
            ['Can you handle casting for my film or ad?', 'Our casting services help productions identify suitable talent for movies, web series, short films and ad shoots. Contact us to discuss your casting requirements.'],
            ['Do you shoot ad films and commercials for brands?', "OG Creations produces commercial ads and brand films, bringing together creative concepts, scripts, filming and editing to communicate your brand's message."],
            ['Do you do modeling and portfolio shoots?', 'We produce fashion shoots, model portfolios and commercial modeling projects, with attention to lighting, composition and visual presentation.'],
            ['Do you offer video editing and post-production?', 'Our post-production services include video editing, colour grading and final delivery for films, web series and ad productions.'],
            ['How do I start a project with OG Creations?', 'Fill in the Start a Project form with your contact details, the service you need and your project requirements. You can also call 9884277001 to discuss your project with our team.'],
        ],
    ];
}

/** Applies the document's content once. $all is the full settings array (already read by the caller). */
function apply_seo_content_once(array $all): void
{
    if (($all['content_seo_v1'] ?? '') === '1') {
        return;
    }
    try {
        $c = seo_content();
        $pdo = db();
        foreach ($c['settings'] as $k => $v) {
            set_setting($k, $v);
        }

        // Services: update by title; the old "Post Production" card becomes "Short Films".
        $has = fn(string $t) => (bool) $pdo->query('SELECT 1 FROM services WHERE title = ' . $pdo->quote($t))->fetchColumn();
        if (!$has('Short Films') && $has('Post Production')) {
            $pdo->exec("UPDATE services SET title = 'Short Films' WHERE title = 'Post Production'");
        }
        $upd = $pdo->prepare('UPDATE services SET description = ? WHERE title = ?');
        foreach ($c['services'] as $title => $desc) {
            $upd->execute([$desc, $title]);
        }
        if (!$has('Short Films')) {
            $next = (int) $pdo->query('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM services')->fetchColumn();
            $pdo->prepare('INSERT INTO services (title, description, image, sort_order) VALUES (?, ?, ?, ?)')
                ->execute(['Short Films', $c['services']['Short Films'], '/images/service-post-production.jpg', $next]);
        }

        // Process steps: by position, only while the step still carries its original title.
        $updStep = $pdo->prepare('UPDATE process_steps SET description = ? WHERE sort_order = ? AND title = ?');
        $titles = [2 => 'Planning', 4 => 'Production', 5 => 'Final Delivery'];
        foreach ($c['process'] as $pos => $desc) {
            $updStep->execute([$desc, $pos, $titles[$pos]]);
        }

        $updWhy = $pdo->prepare('UPDATE why_items SET description = ? WHERE title = ?');
        foreach ($c['why'] as $title => $desc) {
            $updWhy->execute([$desc, $title]);
        }

        ensure_faq_table();
        if ((int) $pdo->query('SELECT COUNT(*) FROM faqs')->fetchColumn() === 0) {
            $ins = $pdo->prepare('INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)');
            foreach ($c['faqs'] as $i => [$q, $a]) {
                $ins->execute([$q, $a, $i + 1]);
            }
        }
        set_setting('content_seo_v1', '1');
    } catch (Throwable $e) {
        error_log('SEO content update failed: ' . $e->getMessage());
    }
}

/** One-time: sample short descriptions for the placeholder projects (only those that are still empty). */
function apply_works_descriptions_once(array $all): void
{
    if (($all['content_works_desc_v1'] ?? '') === '1') {
        return;
    }
    try {
        ensure_works_description();
        $samples = [
            'Movies'     => 'A feature film from OG Creations, produced from concept to screen with creative direction, cinematography and post-production.',
            'Web Series' => 'An engaging web series produced by OG Creations, from planning and casting to filming and final editing.',
            'Short Films' => 'A short film brought to life by OG Creations, from concept development and casting to filming and editing.',
            'Ad Shoots'  => "A commercial ad film from OG Creations, built to communicate a brand's message through concept, filming and editing.",
            'Modeling'   => 'A fashion and portfolio shoot produced by OG Creations with careful lighting, composition and visual presentation.',
            'Events'     => 'An event captured by OG Creations with professional visual storytelling for launches, brand events and stage productions.',
        ];
        $upd = db()->prepare("UPDATE works SET description = ? WHERE category = ? AND description = ''");
        foreach ($samples as $cat => $text) {
            $upd->execute([$text, $cat]);
        }
        set_setting('content_works_desc_v1', '1');
    } catch (Throwable $e) {
        error_log('Works description update failed: ' . $e->getMessage());
    }
}
