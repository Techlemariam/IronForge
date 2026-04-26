INSERT INTO environments (name, project_id, uuid, created_at, updated_at) VALUES ('staging', 2, 'stg' || md5(random()::text), NOW(), NOW()) RETURNING id;
