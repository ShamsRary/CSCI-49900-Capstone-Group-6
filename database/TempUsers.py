import bcrypt
import pymysql

DB_CONFIG = {
    "host": "100.70.195.74",
    "port": 3306,
    "user": "crossy_dev",
    "password": "CrossyWordDev2026!",
    "database": "crossy-word-mysql_db",
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor,
}

users_to_import = [
    {"username": "shams", "email": "shams@crossyword.dev", "plain_password": "password123", "xp": 0, "skill_level": "1"},
    {"username": "maheru", "email": "maheru@crossyword.dev", "plain_password": "password123", "xp": 0, "skill_level": "2"},
    {"username": "darren", "email": "darren@crossyword.dev", "plain_password": "password123", "xp": 0, "skill_level": "3"},
    {"username": "joyce", "email": "joyce@crossyword.dev", "plain_password": "password123", "xp": 0, "skill_level": "4"},
]


def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def main():
    conn = pymysql.connect(**DB_CONFIG)
    try:
        with conn.cursor() as cursor:
            insert_sql = """
                INSERT INTO Users (username, email, password_hash, xp, skill_level)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    username = VALUES(username),
                    xp = VALUES(xp),
                    skill_level = VALUES(skill_level);
            """
            for user in users_to_import:
                cursor.execute(
                    insert_sql,
                    (
                        user["username"],
                        user["email"],
                        hash_password(user["plain_password"]),
                        user["xp"],
                        user["skill_level"],
                    ),
                )
        conn.commit()

        with conn.cursor() as cursor:
            cursor.execute("SELECT user_id, username, email, xp, skill_level, created_at FROM Users;")
            rows = cursor.fetchall()
            for row in rows:
                print(row)
    finally:
        conn.close()


if __name__ == "__main__":
    main()