import mysql.connector

db = mysql.connector.connect(
    host="100.70.195.74",  #
    port=3306,
    user="root",
    password="crossy-word-mysql-pass",
    database="crossy-word-mysql_db",
)

cursor = db.cursor()
# Example query to test or push data
cursor.execute("SELECT * FROM connection_test;")
for row in cursor.fetchall():
    print(row)

cursor.close()
db.close()
