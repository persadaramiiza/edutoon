import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1723348800000 implements MigrationInterface {
  name = 'InitialSchema1723348800000';
  transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'users',
      'profiles',
      'videos',
      'quizzes',
      'quiz_options',
      'quiz_attempts',
      'video_progress',
      'watch_history',
    ];
    const existing: string[] = [];
    for (const table of tables) {
      if (await queryRunner.hasTable(table)) existing.push(table);
    }
    if (existing.length > 0) {
      throw new Error(
        `Initial migration refused because tables already exist: ${existing.join(', ')}. ` +
          'Use a new empty MariaDB database or baseline an audited schema explicitly.',
      );
    }

    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`email\` varchar(255) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`full_name\` varchar(100) NULL,
        \`role\` enum('parent', 'creator', 'admin') NOT NULL DEFAULT 'parent',
        \`deleted_at\` datetime(6) NULL,
        CONSTRAINT \`PK_users_id\` PRIMARY KEY (\`id\`),
        CONSTRAINT \`UQ_users_email\` UNIQUE (\`email\`),
        INDEX \`IDX_users_email\` (\`email\`),
        INDEX \`IDX_users_role\` (\`role\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`profiles\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(100) NOT NULL,
        \`avatar_url\` varchar(500) NULL,
        \`age_group\` int NOT NULL DEFAULT 0,
        \`user_id\` int NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL,
        CONSTRAINT \`PK_profiles_id\` PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_profiles_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
        INDEX \`IDX_profiles_age_group\` (\`age_group\`),
        INDEX \`IDX_profiles_user_id\` (\`user_id\`),
        INDEX \`IDX_profiles_user_created\` (\`user_id\`, \`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`videos\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`title\` varchar(255) NOT NULL,
        \`description\` text NULL,
        \`video_url\` varchar(255) NOT NULL,
        \`thumbnail_url\` varchar(255) NULL,
        \`platform\` varchar(255) NOT NULL DEFAULT 'youtube',
        \`category\` varchar(255) NULL,
        \`min_age\` int NOT NULL DEFAULT 0,
        \`max_age\` int NOT NULL DEFAULT 18,
        \`view_count\` int NOT NULL DEFAULT 0,
        \`status\` varchar(255) NOT NULL DEFAULT 'draft',
        \`creator_id\` int NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`published_at\` datetime(6) NULL,
        CONSTRAINT \`PK_videos_id\` PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_videos_creator\` FOREIGN KEY (\`creator_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`quizzes\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`videoId\` int NOT NULL,
        \`timestamp_seconds\` int NOT NULL,
        \`question_text\` text NOT NULL,
        CONSTRAINT \`PK_quizzes_id\` PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_quizzes_video\` FOREIGN KEY (\`videoId\`) REFERENCES \`videos\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`quiz_options\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`quizId\` int NOT NULL,
        \`option_text\` varchar(255) NOT NULL,
        \`is_correct\` tinyint(1) NOT NULL DEFAULT 0,
        CONSTRAINT \`PK_quiz_options_id\` PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_quiz_options_quiz\` FOREIGN KEY (\`quizId\`) REFERENCES \`quizzes\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`quiz_attempts\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`profile_id\` int NOT NULL,
        \`quiz_id\` int NOT NULL,
        \`is_correct\` tinyint(1) NOT NULL,
        \`attempted_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CONSTRAINT \`PK_quiz_attempts_id\` PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`video_progress\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`video_id\` int NOT NULL,
        \`profile_id\` int NOT NULL,
        \`timestamp_seconds\` int NOT NULL DEFAULT 0,
        \`is_completed\` tinyint(1) NOT NULL DEFAULT 0,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        CONSTRAINT \`PK_video_progress_id\` PRIMARY KEY (\`id\`),
        CONSTRAINT \`UQ_video_progress_video_profile\` UNIQUE (\`video_id\`, \`profile_id\`),
        CONSTRAINT \`FK_video_progress_video\` FOREIGN KEY (\`video_id\`) REFERENCES \`videos\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`watch_history\` (
        \`profile_id\` int NOT NULL,
        \`video_id\` int NOT NULL,
        \`last_position_seconds\` int NOT NULL DEFAULT 0,
        \`is_completed\` tinyint(1) NOT NULL DEFAULT 0,
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        CONSTRAINT \`PK_watch_history\` PRIMARY KEY (\`profile_id\`, \`video_id\`),
        CONSTRAINT \`FK_watch_history_profile\` FOREIGN KEY (\`profile_id\`) REFERENCES \`profiles\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_watch_history_video\` FOREIGN KEY (\`video_id\`) REFERENCES \`videos\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `watch_history`');
    await queryRunner.query('DROP TABLE `video_progress`');
    await queryRunner.query('DROP TABLE `quiz_attempts`');
    await queryRunner.query('DROP TABLE `quiz_options`');
    await queryRunner.query('DROP TABLE `quizzes`');
    await queryRunner.query('DROP TABLE `videos`');
    await queryRunner.query('DROP TABLE `profiles`');
    await queryRunner.query('DROP TABLE `users`');
  }
}
