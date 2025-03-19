
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ EVENTOS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
DELIMITER $$
CREATE EVENT event_update_course_sessions_status
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE, '19:42:00')  
DO
BEGIN
    SET SQL_SAFE_UPDATES = 0;
    CALL sp_update_course_sessions_status();
    SET SQL_SAFE_UPDATES = 1;
END$$
DELIMITER ;

DELIMITER $$
CREATE EVENT event_update_diploma_status
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE, '19:42:00')
DO
BEGIN
    SET SQL_SAFE_UPDATES = 0;
    CALL sp_update_diploma_status();
    SET SQL_SAFE_UPDATES = 1;
END$$
DELIMITER ;
-- DROP EVENT IF EXISTS event_update_course_sessions_status;

SET GLOBAL event_scheduler = ON;