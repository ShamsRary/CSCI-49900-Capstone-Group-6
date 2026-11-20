USE `crossy-word-mysql_db`;
SELECT * FROM Game_Sessions ORDER BY session_id DESC LIMIT 3;
SELECT * FROM Session_Players ORDER BY session_id DESC LIMIT 5;
SELECT * FROM Layouts ORDER BY layout_id DESC LIMIT 3;
SELECT * FROM Layout_Placements ORDER BY layout_id DESC LIMIT 10;
SELECT * FROM Answer_Attempts ORDER BY attempt_id DESC LIMIT 10;
SELECT * FROM User_Behavior_Stats WHERE user_id = 1 ORDER BY question_id;