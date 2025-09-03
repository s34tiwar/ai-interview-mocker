/** @type {import("drizzle-kit").Config} */
export default {
    schema: "./utlils/schema.js",                  //path to your schema file
    dialect: "postgresql",
    dbCredentials: {
        url: "postgresql://neondb_owner:npg_SfMQ2OsiT5EL@ep-spring-sun-aeqqapds-pooler.c-2.us-east-2.aws.neon.tech/ai-interview-mocker?sslmode=require&channel_binding=require",
    },
};