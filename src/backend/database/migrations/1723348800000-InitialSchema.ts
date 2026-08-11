import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1723348800000 implements MigrationInterface {
  name = 'InitialSchema1723348800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'users', 'profiles', 'videos', 'quizzes', 'quiz_options',
      'quiz_attempts', 'video_progress', 'watch_history',
    ];
    const existing = [] as string[];
    for (const table of tables) {
      if (await queryRunner.hasTable(table)) existing.push(table);
    }
    if (existing.length > 0) {
      throw new Error(
        `Initial migration refused because tables already exist: ${existing.join(', ')}. ` +
        'Audit the production schema and baseline it explicitly before migration:run.',
      );
    }

    await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM ('parent', 'creator', 'admin')`);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "full_name" character varying(100),
        "role" "users_role_enum" NOT NULL DEFAULT 'parent',
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);

    await queryRunner.query(`
      CREATE TABLE "profiles" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "avatar_url" character varying(500),
        "age_group" integer NOT NULL DEFAULT 0,
        "user_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_profiles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_profiles_age_group" ON "profiles" ("age_group")`);
    await queryRunner.query(`CREATE INDEX "IDX_profiles_user_id" ON "profiles" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_profiles_user_created" ON "profiles" ("user_id", "created_at")`);

    await queryRunner.query(`
      CREATE TABLE "videos" (
        "id" SERIAL NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "video_url" character varying NOT NULL,
        "thumbnail_url" character varying,
        "platform" character varying NOT NULL DEFAULT 'youtube',
        "category" character varying,
        "min_age" integer NOT NULL DEFAULT 0,
        "max_age" integer NOT NULL DEFAULT 18,
        "view_count" integer NOT NULL DEFAULT 0,
        "status" character varying NOT NULL DEFAULT 'draft',
        "creator_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "published_at" TIMESTAMP,
        CONSTRAINT "PK_videos_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_videos_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "quizzes" (
        "id" SERIAL NOT NULL,
        "videoId" integer NOT NULL,
        "timestamp_seconds" integer NOT NULL,
        "question_text" text NOT NULL,
        CONSTRAINT "PK_quizzes_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_quizzes_video" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "quiz_options" (
        "id" SERIAL NOT NULL,
        "quizId" integer NOT NULL,
        "option_text" character varying(255) NOT NULL,
        "is_correct" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_quiz_options_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_quiz_options_quiz" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "quiz_attempts" (
        "id" SERIAL NOT NULL,
        "profile_id" integer NOT NULL,
        "quiz_id" integer NOT NULL,
        "is_correct" boolean NOT NULL,
        "attempted_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_quiz_attempts_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "video_progress" (
        "id" SERIAL NOT NULL,
        "video_id" integer NOT NULL,
        "profile_id" integer NOT NULL,
        "timestamp_seconds" integer NOT NULL DEFAULT 0,
        "is_completed" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_video_progress_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_video_progress_video_profile" UNIQUE ("video_id", "profile_id"),
        CONSTRAINT "FK_video_progress_video" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "watch_history" (
        "profile_id" integer NOT NULL,
        "video_id" integer NOT NULL,
        "last_position_seconds" integer NOT NULL DEFAULT 0,
        "is_completed" boolean NOT NULL DEFAULT false,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_watch_history" PRIMARY KEY ("profile_id", "video_id"),
        CONSTRAINT "FK_watch_history_profile" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_watch_history_video" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "watch_history"`);
    await queryRunner.query(`DROP TABLE "video_progress"`);
    await queryRunner.query(`DROP TABLE "quiz_attempts"`);
    await queryRunner.query(`DROP TABLE "quiz_options"`);
    await queryRunner.query(`DROP TABLE "quizzes"`);
    await queryRunner.query(`DROP TABLE "videos"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(`DROP INDEX "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
  }
}
